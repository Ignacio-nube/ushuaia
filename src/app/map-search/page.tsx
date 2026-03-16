"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import * as turf from "@turf/turf"
import { motion, AnimatePresence } from "motion/react"
import { Pencil, X, RotateCcw, MapPin, SlidersHorizontal, Star, Map as MapIcon } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import { createClient } from "@/lib/supabase/client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
mapboxgl.accessToken = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN as any) ?? ""

const USHUAIA_CENTER: [number, number] = [-68.303, -54.8019]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Property = Record<string, any>

const POIS = [
  { name: "Aeropuerto", icon: "✈", coords: [-68.2958, -54.8432] as [number, number] },
  { name: "Puerto", icon: "⚓", coords: [-68.303, -54.8128] as [number, number] },
  { name: "Glaciar Martial", icon: "⛰", coords: [-68.3352, -54.7725] as [number, number] },
  { name: "Parque Nacional", icon: "🌲", coords: [-68.489, -54.853] as [number, number] },
  { name: "Tren Fin del Mundo", icon: "🚂", coords: [-68.512, -54.828] as [number, number] },
]

function injectMarkerStyles() {
  if (document.getElementById("map-marker-styles")) return
  const style = document.createElement("style")
  style.id = "map-marker-styles"
  style.textContent = `
    .property-marker { cursor: pointer; user-select: none; }
    .marker-pill {
      background: rgba(13,33,55,0.92);
      border: 1.5px solid rgba(78,205,196,0.4);
      color: #E8F4F8;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 999px;
      white-space: nowrap;
      transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
      backdrop-filter: blur(6px);
    }
    .marker-pill.active {
      background: #4ECDC4;
      color: #0A1628;
      border-color: #4ECDC4;
      transform: scale(1.12);
      box-shadow: 0 4px 20px rgba(78,205,196,0.5);
    }
  `
  document.head.appendChild(style)
}

const DRAW_STYLES = [
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: { "fill-color": "#4ECDC4", "fill-opacity": 0.12 },
  },
  {
    id: "gl-draw-polygon-stroke",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: { "line-color": "#4ECDC4", "line-width": 2.5, "line-dasharray": [2, 1] },
  },
  {
    id: "gl-draw-polygon-vertex",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: { "circle-radius": 6, "circle-color": "#4ECDC4", "circle-stroke-width": 2, "circle-stroke-color": "#0A1628" },
  },
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    paint: { "line-color": "#4ECDC4", "line-width": 2, "line-dasharray": [2, 1] },
  },
]

export default function MapSearchPage() {
  // ── DOM / Mapbox refs ──────────────────────────────────────────────────
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const markerPillsRef = useRef<Map<string, HTMLElement>>(new Map())

  // ── Mutable data refs (so stable callbacks always see latest values) ───
  const allPropsRef = useRef<Property[]>([])
  const filteredPropsRef = useRef<Property[]>([])
  const isFilteredRef = useRef(false)
  const hoveredIdRef = useRef<string | null>(null)
  const isMobileRef = useRef(false)

  // ── Stable callback refs (wired into map events once, never re-registered)
  const rebuildMarkersRef = useRef<() => void>(() => {})
  const handleDrawUpdateRef = useRef<() => void>(() => {})
  const handleDrawDeleteRef = useRef<() => void>(() => {})

  // ── React state for rendering only ────────────────────────────────────
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isFiltered, setIsFiltered] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasPolygon, setHasPolygon] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const displayedProperties = isFiltered ? filteredProperties : allProperties

  // ── Responsive detection ───────────────────────────────────────────────
  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 640
      setIsMobile(mobile)
      isMobileRef.current = mobile
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ── Load properties ────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("properties")
      .select("id, title, slug, price_per_night, zone, latitude, longitude, images, rating, bedrooms, bathrooms, max_guests")
      .eq("is_available", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: any) => {
        const props = data ?? []
        allPropsRef.current = props
        filteredPropsRef.current = props
        setAllProperties(props)
        setFilteredProperties(props)
        // Try to build markers if map is already loaded
        requestAnimationFrame(() => rebuildMarkersRef.current())
      })
  }, [])

  // ── Hover management — pure DOM, no re-render of markers ──────────────
  const updateHover = useCallback((id: string | null) => {
    if (hoveredIdRef.current === id) return
    if (hoveredIdRef.current) {
      markerPillsRef.current.get(hoveredIdRef.current)?.classList.remove("active")
    }
    if (id) {
      markerPillsRef.current.get(id)?.classList.add("active")
    }
    hoveredIdRef.current = id
    setHoveredId(id)
  }, [])

  // ── Rebuild markers — only depends on updateHover (stable) ────────────
  const rebuildMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    markerPillsRef.current.clear()
    hoveredIdRef.current = null
    setHoveredId(null)

    injectMarkerStyles()

    const list = isFilteredRef.current ? filteredPropsRef.current : allPropsRef.current
    list.forEach((property) => {
      if (!property.latitude || !property.longitude) return

      const el = document.createElement("div")
      el.className = "property-marker"

      const pill = document.createElement("div")
      pill.className = "marker-pill"
      pill.textContent = `$${Math.round(property.price_per_night / 1000)}K`
      el.appendChild(pill)
      markerPillsRef.current.set(property.id, pill)

      el.addEventListener("click", () => {
        window.location.href = `/properties/${property.slug}`
      })
      el.addEventListener("mouseenter", () => updateHover(property.id))
      el.addEventListener("mouseleave", () => updateHover(null))

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([Number(property.longitude), Number(property.latitude)])
        .addTo(map)
      markersRef.current.push(marker)
    })
  }, [updateHover])

  // Keep rebuildMarkersRef current
  useEffect(() => { rebuildMarkersRef.current = rebuildMarkers }, [rebuildMarkers])

  // ── Draw: polygon created / updated ───────────────────────────────────
  const handleDrawUpdate = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return
    const data = draw.getAll()
    if (!data.features.length) return

    const polygon = data.features[0]
    const inside = allPropsRef.current.filter((p) => {
      if (!p.latitude || !p.longitude) return false
      const pt = turf.point([Number(p.longitude), Number(p.latitude)])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return turf.booleanPointInPolygon(pt, polygon as any)
    })

    filteredPropsRef.current = inside
    isFilteredRef.current = true
    setFilteredProperties(inside)
    setIsFiltered(true)
    setHasPolygon(true)
    setIsDrawing(false)
    setIsPanelOpen(true)

    // Give React one tick to update refs before rebuilding markers
    requestAnimationFrame(() => rebuildMarkersRef.current())

    const bbox = turf.bbox(polygon)
    mapRef.current?.fitBounds(
      [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
      { padding: { top: 60, bottom: isMobileRef.current ? 280 : 60, left: 60, right: isMobileRef.current ? 60 : 420 }, duration: 800 }
    )
  }, [])

  // ── Draw: polygon deleted ──────────────────────────────────────────────
  const handleDrawDelete = useCallback(() => {
    isFilteredRef.current = false
    filteredPropsRef.current = allPropsRef.current
    setIsFiltered(false)
    setFilteredProperties(allPropsRef.current)
    setHasPolygon(false)
    setIsDrawing(false)
    requestAnimationFrame(() => rebuildMarkersRef.current())
  }, [])

  // Keep draw handler refs current
  useEffect(() => { handleDrawUpdateRef.current = handleDrawUpdate }, [handleDrawUpdate])
  useEffect(() => { handleDrawDeleteRef.current = handleDrawDelete }, [handleDrawDelete])

  // ── Initialize map — runs once ─────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: USHUAIA_CENTER,
      zoom: 13,
      pitch: 35,
      bearing: -5,
    })
    mapRef.current = map

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const draw = new MapboxDraw({ displayControlsDefault: false, defaultMode: "simple_select", styles: DRAW_STYLES as any })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.addControl(draw as any)
    drawRef.current = draw

    map.on("load", () => {
      // Apply glacier theme
      if (map.getLayer("water")) map.setPaintProperty("water", "fill-color", "#071828")
      if (map.getLayer("water-shadow")) map.setPaintProperty("water-shadow", "fill-color", "#050F1A")
      ;["land", "landuse"].forEach((l) => {
        if (map.getLayer(l)) try { map.setPaintProperty(l, "fill-color", "#0D1F33") } catch { /* skip */ }
      })
      ;["road-primary", "road-secondary-tertiary", "road-street", "road-minor"].forEach((l) => {
        if (map.getLayer(l)) try { map.setPaintProperty(l, "line-color", "rgba(78,205,196,0.2)") } catch { /* skip */ }
      })
      if (map.getLayer("building")) {
        map.setPaintProperty("building", "fill-color", "#112843")
        map.setPaintProperty("building", "fill-opacity", 0.8)
      }
      if (map.getLayer("background")) map.setPaintProperty("background", "background-color", "#0A1628")

      // Register draw events once — use refs so they always see latest logic
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("draw.create" as any, () => handleDrawUpdateRef.current())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("draw.update" as any, () => handleDrawUpdateRef.current())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("draw.delete" as any, () => handleDrawDeleteRef.current())

      // ── Markers — must run regardless of 3D support ────────────────────
      setMapReady(true)
      // rAF ensures this map instance is stable in mapRef before building markers
      requestAnimationFrame(() => rebuildMarkersRef.current())

      // ── 3D Terrain (skipped in map-search — fingerprinting protection blocks DEM tiles) ──

      // ── Snow (Mapbox GL JS v3 API) ─────────────────────────────────────
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(map as any).setSnow({
          density: 0.35,
          intensity: 0.85,
          color: "#E8F4F8",
          "flake-size": 0.3,
          vignette: 0.4,
          "vignette-color": "#0A1628",
        })
      } catch { /* snow not available */ }

      // ── Atmosphere / Fog ───────────────────────────────────────────────
      try {
        map.setFog({
          color: "rgb(10, 22, 40)",
          "high-color": "rgb(26, 55, 85)",
          "horizon-blend": 0.08,
          "space-color": "rgb(5, 12, 25)",
          "star-intensity": 0.9,
        } as Parameters<typeof map.setFog>[0])
      } catch { /* fog not available */ }

      // ── POI Icons ──────────────────────────────────────────────────────
      try {
        map.addSource("pois", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: POIS.map((poi) => ({
              type: "Feature" as const,
              geometry: { type: "Point" as const, coordinates: poi.coords },
              properties: { name: poi.name, icon: poi.icon },
            })),
          },
        })
        map.addLayer({
          id: "poi-dots",
          type: "circle",
          source: "pois",
          paint: {
            "circle-radius": 5,
            "circle-color": "rgba(78,205,196,0.85)",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(10,22,40,0.95)",
          },
        })
        map.addLayer({
          id: "poi-labels",
          type: "symbol",
          source: "pois",
          layout: {
            "text-field": ["concat", ["get", "icon"], " ", ["get", "name"]],
            "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
            "text-size": 11,
            "text-offset": [0, 1.4],
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#E8F4F8",
            "text-halo-color": "rgba(10,22,40,0.95)",
            "text-halo-width": 1.5,
          },
        })
      } catch { /* POIs failed */ }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on("draw.modechange", (e: any) => {
      map.getCanvas().style.cursor = e.mode === "draw_polygon" ? "crosshair" : ""
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      markerPillsRef.current.clear()
      draw.deleteAll()
      map.remove()
      if (mapRef.current === map) mapRef.current = null
      if (drawRef.current === draw) drawRef.current = null
      setMapReady(false)
    }
  }, []) // empty — intentional, map is initialized once

  // ── Rebuild markers when data or filter changes ───────────────────────
  useEffect(() => {
    requestAnimationFrame(() => rebuildMarkersRef.current())
  }, [allProperties, filteredProperties, isFiltered])

  // ── Draw controls ──────────────────────────────────────────────────────
  function startDrawing() {
    const draw = drawRef.current
    if (!draw) return
    draw.deleteAll()
    draw.changeMode("draw_polygon")
    setIsDrawing(true)
    setHasPolygon(false)
    isFilteredRef.current = false
    filteredPropsRef.current = allPropsRef.current
    setIsFiltered(false)
    setFilteredProperties(allPropsRef.current)
    requestAnimationFrame(() => rebuildMarkersRef.current())
  }

  function clearDrawing() {
    const draw = drawRef.current
    if (!draw) return
    draw.deleteAll()
    draw.changeMode("simple_select")
    setIsDrawing(false)
    setHasPolygon(false)
    isFilteredRef.current = false
    filteredPropsRef.current = allPropsRef.current
    setIsFiltered(false)
    setFilteredProperties(allPropsRef.current)
    mapRef.current?.flyTo({ center: USHUAIA_CENTER, zoom: 13, pitch: 35, duration: 900 })
    requestAnimationFrame(() => rebuildMarkersRef.current())
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0" style={{ background: "#050E1A" }}>

      {/* ── MAPA — siempre full screen ─────────────────── */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Barra superior */}
      <div
        className="fixed top-0 inset-x-0 z-10 flex items-center justify-between px-5 h-14"
        style={{ background: "linear-gradient(to bottom, rgba(5,14,26,0.9) 60%, transparent)" }}
      >
        <a href="/" className="flex items-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Fin del Mundo Stays" className="h-8 object-contain" />
        </a>
        <a
          href="/properties"
          className="text-sm hover:text-snow transition-colors flex items-center gap-1.5"
          style={{ color: "#7BB8D4" }}
        >
          ← Volver al listado
        </a>
      </div>

      {/* Instrucción de dibujo */}
      <AnimatePresence>
        {isDrawing && !hasPolygon && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2.5 rounded-xl text-sm pointer-events-none"
            style={{
              background: "rgba(13,33,55,0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(78,205,196,0.4)",
              color: "#E8F4F8",
              whiteSpace: "nowrap",
            }}
          >
            ✏️ Hacé click para dibujar · Doble click para cerrar el polígono
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles principales */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <AnimatePresence mode="wait">
          {isDrawing && !hasPolygon ? (
            <motion.button
              key="cancel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={clearDrawing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(13,33,55,0.95)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#7BB8D4",
                backdropFilter: "blur(10px)",
              }}
            >
              <X className="size-4" /> Cancelar
            </motion.button>
          ) : hasPolygon ? (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={clearDrawing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
              style={{
                background: "rgba(13,33,55,0.95)",
                border: "1px solid rgba(255,107,107,0.4)",
                color: "#FF6B6B",
                backdropFilter: "blur(10px)",
              }}
            >
              <RotateCcw className="size-4" /> Limpiar zona
            </motion.button>
          ) : (
            <motion.button
              key="draw"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={startDrawing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-xl"
              style={{
                background: "linear-gradient(135deg, #4ECDC4, #2E8B8B)",
                color: "#0A1628",
                boxShadow: "0 4px 24px rgba(78,205,196,0.4)",
              }}
            >
              <Pencil className="size-4" /> Dibujá tu zona de búsqueda
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Badge con contador de marcadores visibles */}
      {mapReady && allProperties.length > 0 && (
        <div
          className="fixed bottom-8 left-5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: "rgba(13,33,55,0.88)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#7BB8D4",
            backdropFilter: "blur(8px)",
          }}
        >
          <MapIcon className="size-3" />
          {displayedProperties.length} en el mapa
        </div>
      )}

      {/* Atribución */}
      <p className="fixed bottom-2 right-3 z-10 text-[10px]" style={{ color: "rgba(123,184,212,0.35)" }}>
        © Mapbox © OpenStreetMap
      </p>

      {/* ── PANEL OVERLAY ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={isMobile ? { y: "100%" } : { x: 400, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: "100%" } : { x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) setIsPanelOpen(false)
            }}
            className={
              isMobile
                ? "fixed bottom-0 inset-x-0 z-20 flex flex-col rounded-t-2xl overflow-hidden"
                : "fixed top-0 right-0 h-full w-[380px] z-20 flex flex-col"
            }
            style={
              isMobile
                ? { background: "#06101C", borderTop: "1px solid rgba(255,255,255,0.1)", height: "65vh" }
                : { background: "#06101C", borderLeft: "1px solid rgba(255,255,255,0.07)" }
            }
          >
            {/* Drag handle (mobile) */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
              </div>
            )}

            {/* Header */}
            <div
              className="px-5 pt-4 pb-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display italic text-lg leading-tight" style={{ color: "#E8F4F8" }}>
                    {isFiltered ? "Propiedades en tu zona" : "Explorar Ushuaia"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <motion.span
                      key={displayedProperties.length}
                      initial={{ opacity: 0.5, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm"
                      style={{ color: "#7BB8D4" }}
                    >
                      {displayedProperties.length} propiedades
                    </motion.span>
                    <AnimatePresence>
                      {isFiltered && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(78,205,196,0.12)",
                            border: "1px solid rgba(78,205,196,0.3)",
                            color: "#4ECDC4",
                          }}
                        >
                          ✦ zona filtrada
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="shrink-0 size-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8"
                  style={{ color: "#7BB8D4" }}
                >
                  <X className="size-4" />
                </button>
              </div>

              {!isFiltered && !isDrawing && (
                <p className="text-xs mt-3" style={{ color: "rgba(123,184,212,0.55)" }}>
                  Activá &quot;Dibujá tu zona&quot; para filtrar por área del mapa
                </p>
              )}
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {displayedProperties.length > 0 ? (
                  displayedProperties.map((property, index) => (
                    <motion.a
                      key={property.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      href={`/properties/${property.slug}`}
                      onMouseEnter={() => updateHover(property.id)}
                      onMouseLeave={() => updateHover(null)}
                      className="flex gap-3 p-3 rounded-xl transition-all duration-150"
                      style={{
                        background: hoveredId === property.id
                          ? "rgba(17,40,67,0.95)"
                          : "rgba(255,255,255,0.028)",
                        border: hoveredId === property.id
                          ? "1px solid rgba(78,205,196,0.3)"
                          : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Imagen */}
                      <div className="size-[72px] rounded-lg overflow-hidden shrink-0 bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={property.images?.[0] ?? ""}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="text-sm font-medium truncate" style={{ color: "#E8F4F8" }}>
                            {property.title}
                          </p>
                          <p className="text-xs mt-0.5 flex items-center gap-1 capitalize" style={{ color: "#7BB8D4" }}>
                            <MapPin className="size-2.5 shrink-0" />
                            {property.zone?.replace(/-/g, " ")}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold" style={{ color: "#4ECDC4" }}>
                            ${property.price_per_night?.toLocaleString("es-AR")}
                            <span className="text-xs font-normal" style={{ color: "#7BB8D4" }}> /noche</span>
                          </p>
                          {property.rating > 0 && (
                            <p className="text-xs flex items-center gap-0.5" style={{ color: "#F7C948" }}>
                              <Star className="size-3 fill-current" />
                              {Number(property.rating).toFixed(1)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.a>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center px-6"
                  >
                    <div
                      className="size-14 rounded-full flex items-center justify-center mb-4"
                      style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)" }}
                    >
                      <MapPin className="size-6" style={{ color: "#4ECDC4" }} />
                    </div>
                    <p className="font-medium mb-1.5" style={{ color: "#E8F4F8" }}>
                      Sin propiedades en esta zona
                    </p>
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: "#7BB8D4" }}>
                      Probá con una zona más grande o en otra área de Ushuaia
                    </p>
                    <button
                      onClick={clearDrawing}
                      className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/8"
                      style={{ color: "#4ECDC4" }}
                    >
                      Limpiar y volver a intentar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón para reabrir el panel */}
      <AnimatePresence>
        {!isPanelOpen && (
          <motion.button
            initial={isMobile ? { opacity: 0, y: 20 } : { opacity: 0, x: 20 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, y: 20 } : { opacity: 0, x: 20 }}
            onClick={() => setIsPanelOpen(true)}
            className={
              isMobile
                ? "fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl"
                : "fixed right-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full flex items-center justify-center shadow-xl transition-colors hover:bg-[#4ECDC4]/10"
            }
            style={{
              background: isMobile ? "rgba(13,33,55,0.95)" : "#0D2137",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#7BB8D4",
              backdropFilter: "blur(10px)",
            }}
          >
            <SlidersHorizontal className="size-4" />
            {isMobile && <span className="text-sm font-medium">Ver propiedades</span>}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { MapPin, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import dynamic from "next/dynamic"

type MapStyle = "glacier" | "terrain"

const MAP_STYLES: Record<MapStyle, string> = {
  glacier: "mapbox://styles/mapbox/dark-v11",
  terrain: "mapbox://styles/mapbox/outdoors-v12",
}

interface MapAccordionProps {
  latitude: number
  longitude: number
  title: string
  zone: string
  address?: string
}

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "#0D2137" }}
    >
      <div className="size-6 border-2 border-[#4ECDC4]/30 border-t-[#4ECDC4] rounded-full animate-spin" />
    </div>
  ),
})

export function MapAccordion({
  latitude,
  longitude,
  title,
  zone,
  address,
}: MapAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeStyle, setActiveStyle] = useState<MapStyle>("glacier")

  // Aplicar snow + fog (compartido entre ambos estilos, opcional — puede fallar en navegadores con protección de fingerprinting)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applySnowAndFog(map: any) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(map as any).setSnow({
        density: 0.3,
        intensity: 0.75,
        color: "#E8F4F8",
        "flake-size": 0.28,
        vignette: 0.35,
        "vignette-color": "#0A1628",
      })
    } catch { /* snow not supported */ }
    try {
      map.setFog({
        color: "rgb(10, 22, 40)",
        "high-color": "rgb(26, 55, 85)",
        "horizon-blend": 0.08,
        "space-color": "rgb(5, 12, 25)",
        "star-intensity": 0.9,
      })
    } catch { /* fog not supported */ }
  }

  // Sobrescribir colores del estilo dark-v11 para que coincida con el tema glaciar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMapLoad = useCallback((event: any) => {
    const map = event.target

    // Agua / océano
    if (map.getLayer("water")) map.setPaintProperty("water", "fill-color", "#071828")
    if (map.getLayer("water-shadow")) map.setPaintProperty("water-shadow", "fill-color", "#050F1A")

    // Tierra
    const landLayers = ["land", "landuse", "national-park", "landcover"]
    landLayers.forEach((layer) => {
      if (map.getLayer(layer)) {
        try { map.setPaintProperty(layer, "fill-color", "#0D1F33") } catch { /* skip */ }
      }
    })

    // Calles
    const roadLayers = [
      "road-motorway-trunk", "road-primary", "road-secondary-tertiary",
      "road-street", "road-minor",
    ]
    roadLayers.forEach((layer) => {
      if (map.getLayer(layer)) {
        try { map.setPaintProperty(layer, "line-color", "rgba(78,205,196,0.25)") } catch { /* skip */ }
      }
    })

    // Edificios
    if (map.getLayer("building")) {
      map.setPaintProperty("building", "fill-color", "#112843")
      map.setPaintProperty("building", "fill-opacity", 0.8)
    }

    // Labels / texto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textLayers = map.getStyle().layers.filter((l: any) => l.type === "symbol").map((l: any) => l.id)
    textLayers.forEach((layerId: string) => {
      try {
        map.setPaintProperty(layerId, "text-color", "rgba(232,244,248,0.7)")
        map.setPaintProperty(layerId, "text-halo-color", "rgba(10,22,40,0.9)")
        map.setPaintProperty(layerId, "text-halo-width", 1.5)
      } catch { /* skip */ }
    })

    // Fondo general
    if (map.getLayer("background")) {
      map.setPaintProperty("background", "background-color", "#0A1628")
    }

    applySnowAndFog(map)
  }, [])

  // onLoad para el estilo terrain (solo snow + fog)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onTerrainLoad = useCallback((event: any) => {
    applySnowAndFog(event.target)
  }, [])

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* Header acordeón */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors group"
        style={{ background: "rgba(255,255,255,0.05)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
      >
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(78,205,196,0.15)" }}
          >
            <MapPin className="size-4" style={{ color: "#4ECDC4" }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: "#E8F4F8" }}>Ver ubicación</p>
            {address && (
              <p className="text-xs mt-0.5" style={{ color: "#7BB8D4" }}>{address}</p>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDown className="size-5" style={{ color: "#7BB8D4" }} />
        </motion.div>
      </button>

      {/* Mapa animado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 400, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative h-[400px]">
              <MapInner
                latitude={latitude}
                longitude={longitude}
                title={title}
                zone={zone}
                mapStyle={MAP_STYLES[activeStyle]}
                onLoad={activeStyle === "glacier" ? onMapLoad : onTerrainLoad}
                showTerrain={activeStyle === "terrain"}
              />

              {/* Toggle Glaciar / Relieve */}
              <div
                className="absolute top-3 right-3 z-10 flex rounded-lg overflow-hidden shadow-xl"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <button
                  onClick={() => setActiveStyle("glacier")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200"
                  style={{
                    background: activeStyle === "glacier" ? "#4ECDC4" : "rgba(13,33,55,0.92)",
                    color: activeStyle === "glacier" ? "#0A1628" : "#7BB8D4",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z"
                      stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  Glaciar
                </button>

                <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />

                <button
                  onClick={() => setActiveStyle("terrain")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200"
                  style={{
                    background: activeStyle === "terrain" ? "#4ECDC4" : "rgba(13,33,55,0.92)",
                    color: activeStyle === "terrain" ? "#0A1628" : "#7BB8D4",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M3 20l5-10 4 6 3-4 6 8H3z"
                      stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                  Relieve
                </button>
              </div>

              {/* Fade inferior */}
              <div
                className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(10,22,40,0.5), transparent)" }}
              />

              {/* Badge de zona */}
              <div
                className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(13,33,55,0.9)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className="text-xs font-medium tracking-wide" style={{ color: "#4ECDC4" }}>
                  📍 {zone.replace(/-/g, " ")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

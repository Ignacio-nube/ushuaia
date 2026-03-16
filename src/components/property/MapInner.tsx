"use client"

import { useCallback } from "react"
import Map, { Marker, NavigationControl, Source } from "react-map-gl/mapbox"
import { MapPin } from "lucide-react"
import { motion } from "motion/react"
import "mapbox-gl/dist/mapbox-gl.css"

interface MapInnerProps {
  latitude: number
  longitude: number
  title: string
  zone: string
  mapStyle: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoad?: (event: any) => void
  showTerrain?: boolean
}

export default function MapInner({
  latitude,
  longitude,
  title,
  zone,
  mapStyle,
  onLoad,
  showTerrain,
}: MapInnerProps) {
  // Wrap the parent onLoad to always attempt terrain + fog setup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoad = useCallback((event: any) => {
    const map = event.target

    // 3D terrain — optional (fails in fingerprint-protected browsers)
    try {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        })
      }
      map.setTerrain({ source: "mapbox-dem", exaggeration: showTerrain ? 2.5 : 0.9 })
    } catch { /* terrain not available */ }

    // Call parent onLoad (color overrides, snow, fog, etc.)
    onLoad?.(event)
  }, [onLoad, showTerrain])

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude,
        latitude,
        zoom: 14,
        pitch: showTerrain ? 60 : 40,
        bearing: -10,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      attributionControl={false}
      onLoad={handleLoad}
    >
      {/* DEM source — needed for terrain, added here so react-map-gl manages lifecycle */}
      <Source
        id="mapbox-dem"
        type="raster-dem"
        url="mapbox://mapbox.mapbox-terrain-dem-v1"
        tileSize={512}
        maxzoom={14}
      />

      <Marker longitude={longitude} latitude={latitude} anchor="bottom">
        <motion.div
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center"
        >
          {/* Tooltip */}
          <div
            className="mb-2 px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap"
            style={{
              background: "#0D2137",
              border: "1px solid rgba(78,205,196,0.4)",
            }}
          >
            <p className="text-xs font-medium" style={{ color: "#E8F4F8" }}>{title}</p>
            <p className="text-xs capitalize" style={{ color: "#4ECDC4" }}>
              {zone.replace(/-/g, " ")}
            </p>
          </div>

          {/* Pin */}
          <div
            className="size-10 rounded-full flex items-center justify-center"
            style={{
              background: "#4ECDC4",
              boxShadow: "0 4px 20px rgba(78,205,196,0.5), 0 0 0 4px rgba(78,205,196,0.2)",
            }}
          >
            <MapPin className="size-5 fill-current" style={{ color: "#0A1628" }} />
          </div>

          {/* Sombra del pin */}
          <div className="w-4 h-2 bg-black/30 rounded-full mt-1 blur-sm" />
        </motion.div>
      </Marker>

      <NavigationControl
        position="bottom-right"
        style={{
          backgroundColor: "#0D2137",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
    </Map>
  )
}

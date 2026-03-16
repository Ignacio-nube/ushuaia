"use client"

import { useState } from "react"
import { Images } from "lucide-react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

const FALLBACK =
  "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=800&q=80&auto=format&fit=crop"

interface PropertyGalleryProps {
  images: string[]
  title: string
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const list = images.length > 0 ? images : [FALLBACK]

  function open(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      {/* ── Desktop: estilo Airbnb — imagen principal + grid 2×2 ── */}
      <div className="hidden sm:grid grid-cols-[3fr_2fr] gap-2 h-[480px] rounded-2xl overflow-hidden relative">

        {/* Imagen principal — ocupa toda la altura */}
        <div
          className="relative cursor-pointer overflow-hidden group"
          onClick={() => open(0)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[0]}
            alt={`${title} - 1`}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-90"
          />
        </div>

        {/* Grid 2×2 derecha */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => open(Math.min(i, list.length - 1))}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={list[i] ?? list[0]}
                alt={`${title} - ${i + 1}`}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-90"
              />
            </div>
          ))}
        </div>

        {/* Botón "Ver todas" — esquina inferior derecha */}
        <button
          onClick={() => open(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
          style={{
            background: "rgba(10,22,40,0.88)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#E8F4F8",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <Images className="size-4 text-[#4ECDC4]" />
          Ver las {list.length} fotos
        </button>
      </div>

      {/* ── Mobile: imagen principal con swipe básico + contador ── */}
      <div className="sm:hidden relative h-[280px] rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={list[0]}
          alt={title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => open(0)}
        />

        {/* Gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(10,22,40,0.7), transparent)" }} />

        {/* Botón ver todas */}
        <button
          onClick={() => open(0)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            background: "rgba(10,22,40,0.85)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#E8F4F8",
          }}
        >
          <Images className="size-3.5 text-[#4ECDC4]" />
          {list.length} fotos
        </button>
      </div>

      {/* ── Lightbox ── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={list.map((src) => ({ src }))}
        styles={{
          container: { backgroundColor: "rgba(10,22,40,0.97)" },
        }}
      />
    </>
  )
}

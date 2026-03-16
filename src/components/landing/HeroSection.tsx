"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { Particles } from "@/components/ui/particles"
import { Meteors } from "@/components/ui/meteors"
import { TypingAnimation } from "@/components/ui/typing-animation"
import SearchBar from "./SearchBar"

const HERO_IMAGE = "/heroimg.png"

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE}
        alt="Ushuaia, Canal Beagle"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: "brightness(0.3) saturate(0.7)" }}
      />

      {/* Gradiente superior */}
      <div className="absolute inset-0 bg-gradient-to-b from-glacier/70 via-transparent to-transparent" />

      {/* Fade inferior hacia la siguiente sección */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "220px",
          background: "linear-gradient(to bottom, transparent, #0A1628)",
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Magic UI Particles */}
      {mounted && (
        <Particles
          className="absolute inset-0 pointer-events-none"
          quantity={70}
          color="#4ECDC4"
          size={0.35}
          ease={90}
          staticity={50}
        />
      )}

      {/* Magic UI Meteors */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Meteors
            number={12}
            minDuration={4}
            maxDuration={12}
            className="bg-[#4ECDC4]/60"
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-7 max-w-4xl mx-auto w-full">

        {/* Badge eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] text-aurora tracking-[0.2em] uppercase font-medium"
            style={{
              background: "rgba(78,205,196,0.08)",
              border: "1px solid rgba(78,205,196,0.25)",
            }}
          >
            <span className="size-1.5 rounded-full bg-aurora animate-pulse" />
            Ushuaia · Patagonia Argentina
          </span>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display font-light text-snow leading-[1.02] tracking-tight"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
        >
          Alquilá en el
          <br />
          <em
            className="not-italic"
            style={{
              background: "linear-gradient(135deg, #E8F4F8 0%, #4ECDC4 50%, #7BB8D4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Fin del Mundo
          </em>
        </motion.h1>

        {/* Subtítulo con TypingAnimation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-frost/75 font-light max-w-lg leading-[1.75] min-h-[3rem] flex items-center justify-center"
          style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)" }}
        >
          <TypingAnimation
            words={[
              "Cabañas entre los árboles de Las Hayas",
              "Vistas al Canal Beagle desde tu ventana",
              "El lugar más austral del planeta",
              "Entre glaciares, montañas y silencio",
            ]}
            loop
            duration={60}
            pauseDelay={2500}
            deleteSpeed={30}
            className="text-frost/75 font-light text-center"
          />
        </motion.div>

        {/* SearchBar */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="w-full"
        >
          <SearchBar />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex items-center gap-3 text-sm text-frost/50"
        >
          <span><strong className="text-snow/80 font-medium">+40</strong> propiedades</span>
          <span className="text-frost/25">·</span>
          <span><strong className="text-snow/80 font-medium">5 zonas</strong> en Ushuaia</span>
          <span className="text-frost/25">·</span>
          <span><strong className="text-snow/80 font-medium">54°48′S</strong></span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10"
      >
        <span className="text-[10px] text-frost/35 tracking-[0.25em] uppercase">Explorá</span>
        <ChevronDown className="size-4 text-frost/35 animate-bounce" />
      </motion.div>
    </section>
  )
}

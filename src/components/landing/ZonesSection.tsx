import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { SectionReveal, StaggerReveal, StaggerItem } from "@/components/shared/SectionReveal"
import type { Zone } from "@/types/database"

const ZONE_IMAGES: Record<string, string> = {
  centro:        "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=700&q=75&auto=format&fit=crop",
  "canal-beagle":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75&auto=format&fit=crop",
  "glaciar-martial":"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&q=75&auto=format&fit=crop",
  "bahia-encerrada":"https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=700&q=75&auto=format&fit=crop",
  "las-hayas":   "https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75&auto=format&fit=crop",
}

function ZoneCard({ zone }: { zone: Zone }) {
  const image = zone.image_url ?? ZONE_IMAGES[zone.slug] ?? ZONE_IMAGES["centro"]

  return (
    <Link
      href={`/properties?zone=${zone.slug}`}
      className="group relative overflow-hidden rounded-2xl block"
      style={{
        height: "260px",
        boxShadow: "0 8px 32px rgba(10,22,40,0.5)",
      }}
    >
      {/* Imagen */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={zone.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />

      {/* Overlay permanente */}
      <div
        className="absolute inset-0 transition-all duration-400"
        style={{
          background: "rgba(10,22,40,0.4)",
        }}
      />
      {/* Overlay hover — más luminoso */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: "rgba(10,22,40,0.15)" }}
      />
      {/* Gradiente base inferior permanente */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(10,22,40,0.85) 0%, transparent 55%)" }}
      />

      {/* Badge propiedades — arriba derecha glassmorphism */}
      <div
        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs text-aurora font-medium"
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(78,205,196,0.2)",
        }}
      >
        {zone.properties_count} prop.
      </div>

      {/* Ícono flecha diagonal hover — arriba izquierda */}
      <div className="absolute top-3 left-3 size-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
        style={{ background: "rgba(78,205,196,0.15)", border: "1px solid rgba(78,205,196,0.3)" }}
      >
        <span className="text-aurora text-sm leading-none">↗</span>
      </div>

      {/* Contenido inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Descripción — slide-up en hover */}
        <p
          className="text-frost/75 text-xs leading-relaxed mb-2 max-h-0 overflow-hidden group-hover:max-h-12 transition-all duration-300 ease-out"
          style={{ fontSize: "12px" }}
        >
          {zone.description}
        </p>

        <h3
          className="font-display text-snow"
          style={{ fontSize: "24px", fontWeight: 300 }}
        >
          {zone.name}
        </h3>

        {/* Borde inferior acento — crece en hover */}
        <div
          className="mt-3 h-[2px] rounded-full transition-all duration-400 ease-out"
          style={{
            background: "rgba(78,205,196,0.6)",
            width: "2rem",
          }}
        >
          <div
            className="h-full rounded-full opacity-0 group-hover:opacity-100 transition-all duration-400"
            style={{
              background: "rgba(78,205,196,0.6)",
              width: "0%",
            }}
          />
        </div>
        {/* Fallback borde que crece con CSS */}
        <div
          className="h-[2px] rounded-full w-8 group-hover:w-full transition-all duration-500 ease-out -mt-[2px]"
          style={{ background: "rgba(78,205,196,0.6)" }}
        />
      </div>
    </Link>
  )
}

export default async function ZonesSection() {
  const supabase = await createClient()
  const { data: zones } = await supabase.from("zones").select("*").order("name")

  const displayZones: Zone[] = zones && zones.length > 0
    ? (zones as Zone[])
    : [
        { id: "1", name: "Centro",          slug: "centro",          description: "El corazón de Ushuaia, cerca del puerto y los servicios", image_url: null, properties_count: 0 },
        { id: "2", name: "Canal Beagle",    slug: "canal-beagle",    description: "Vistas privilegiadas al Canal Beagle y la Antártida",     image_url: null, properties_count: 0 },
        { id: "3", name: "Glaciar Martial", slug: "glaciar-martial", description: "Zona alta con vistas panorámicas a las montañas",          image_url: null, properties_count: 0 },
        { id: "4", name: "Bahía Encerrada", slug: "bahia-encerrada", description: "Barrio residencial tranquilo cerca del agua",              image_url: null, properties_count: 0 },
        { id: "5", name: "Las Hayas",       slug: "las-hayas",       description: "Zona boscosa con cabañas entre los árboles",              image_url: null, properties_count: 0 },
      ]

  const row1 = displayZones.slice(0, 3)
  const row2 = displayZones.slice(3, 5)

  return (
    <section
      className="px-4 sm:px-6 lg:px-8"
      style={{ padding: "clamp(60px, 8vw, 120px) 0", background: "#0D2137" }}
    >
      <div className="mx-auto" style={{ maxWidth: "1200px", padding: "0 24px" }}>

        {/* Header */}
        <SectionReveal>
          <div className="text-center mb-12 flex flex-col gap-3">
            <span
              className="font-sans font-medium uppercase text-aurora"
              style={{ fontSize: "11px", letterSpacing: "3px" }}
            >
              Destinos
            </span>
            <h2
              className="font-display font-light text-snow"
              style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.5px" }}
            >
              Explorá los barrios de Ushuaia
            </h2>
            <p className="text-frost/65 max-w-xl mx-auto" style={{ fontSize: "15px", lineHeight: 1.7 }}>
              Cada zona tiene su propio carácter — desde el canal hasta los bosques patagónicos.
            </p>
          </div>
        </SectionReveal>

        {/* Fila 1 — 3 cards */}
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {row1.map((zone) => (
            <StaggerItem key={zone.id}>
              <ZoneCard zone={zone} />
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* Fila 2 — 2 cards centradas */}
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66.66%] mx-auto">
          {row2.map((zone) => (
            <StaggerItem key={zone.id}>
              <ZoneCard zone={zone} />
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}

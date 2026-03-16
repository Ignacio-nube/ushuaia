import Link from "next/link"
import { Bed, Bath, Users, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/database"

interface PropertyCardProps {
  property: Property
  className?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price)
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const image = property.images?.[0] ?? "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=600&q=70&auto=format&fit=crop"

  return (
    <Link
      href={`/properties/${property.slug}`}
      className={cn(
        "group block rounded-2xl overflow-hidden relative",
        "transition-all duration-300",
        "hover:-translate-y-[6px] hover:shadow-[0_24px_60px_rgba(10,22,40,0.85)]",
        className
      )}
      style={{
        background: "rgba(13,33,55,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(10,22,40,0.5)",
      }}
    >
      {/* Hover border aurora */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{ boxShadow: "inset 0 0 0 1px rgba(78,205,196,0.4)" }}
      />

      {/* ── Imagen (220px fija) ── */}
      <div className="relative overflow-hidden bg-arctic" style={{ height: "220px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[400ms] ease-out"
        />

        {/* Gradiente bottom-up sobre la imagen */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.3) 40%, transparent 70%)",
          }}
        />

        {/* Badge zona — glassmorphism arriba izquierda */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs text-frost/90 font-medium capitalize"
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {property.zone.replace(/-/g, " ")}
        </div>

        {/* Rating arriba derecha */}
        {property.rating > 0 && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Star className="size-3 fill-gold text-gold" />
            <span className="text-xs text-snow font-medium">{property.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Precio superpuesto — abajo izquierda */}
        <div className="absolute bottom-3 left-3">
          <span
            className="font-semibold text-lg leading-none"
            style={{
              background: "linear-gradient(135deg, #4ECDC4, #7BB8D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {formatPrice(property.price_per_night)}
          </span>
          <span className="text-frost/60 text-xs ml-1">/noche</span>
        </div>

        {/* Botón "Ver detalles" slide-up en hover */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium text-glacier"
            style={{ background: "linear-gradient(135deg, #4ECDC4, #2E6DA4)" }}
          >
            Ver detalles →
          </span>
        </div>
      </div>

      {/* Separador con acento aurora */}
      <div style={{ borderTop: "1px solid rgba(78,205,196,0.15)" }} />

      {/* ── Info ── */}
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {/* Título */}
        <h3 className="text-snow font-medium text-[0.9375rem] leading-snug group-hover:text-aurora transition-colors duration-200 line-clamp-1">
          {property.title}
        </h3>

        {/* Amenities rápidas */}
        <div className="flex items-center gap-3.5 text-xs text-frost/55">
          <span className="flex items-center gap-1.5">
            <Bed className="size-3.5 shrink-0" />
            {property.bedrooms} hab.
          </span>
          <span className="text-white/15">·</span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-3.5 shrink-0" />
            {property.bathrooms} baño{property.bathrooms !== 1 ? "s" : ""}
          </span>
          <span className="text-white/15">·</span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {property.max_guests} huésp.
          </span>
        </div>
      </div>
    </Link>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "rgba(13,33,55,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="bg-arctic/40" style={{ height: "220px" }} />
      <div style={{ borderTop: "1px solid rgba(78,205,196,0.1)" }} />
      <div className="px-4 py-3 flex flex-col gap-2.5">
        <div className="h-4 w-3/4 bg-arctic/50 rounded" />
        <div className="h-3 w-1/2 bg-arctic/40 rounded" />
      </div>
    </div>
  )
}

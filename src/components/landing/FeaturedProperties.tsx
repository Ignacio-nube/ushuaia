import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import PropertyCard, { PropertyCardSkeleton } from "@/components/property/PropertyCard"
import { SectionReveal, StaggerReveal, StaggerItem } from "@/components/shared/SectionReveal"
import { Suspense } from "react"
import type { Property } from "@/types/database"

async function FeaturedGrid() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .eq("is_available", true)
    .order("rating", { ascending: false })
    .limit(3)
  const properties = data as Property[] | null

  if (!properties || properties.length === 0) {
    return (
      <div className="col-span-3 text-center py-16 text-frost/50">
        <p>Próximamente propiedades disponibles.</p>
      </div>
    )
  }

  return (
    <StaggerReveal className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <StaggerItem key={property.id}>
          <PropertyCard property={property} className="h-full" />
        </StaggerItem>
      ))}
    </StaggerReveal>
  )
}

function FeaturedGridSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </>
  )
}

export default function FeaturedProperties() {
  return (
    <section
      className="px-4 sm:px-6 lg:px-8"
      style={{ padding: "clamp(60px, 8vw, 120px) 0", background: "#0A1628" }}
    >
      <div className="mx-auto" style={{ maxWidth: "1200px", padding: "0 24px" }}>
        {/* Header */}
        <SectionReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="flex flex-col gap-3">
              <span
                className="font-sans font-medium uppercase text-aurora"
                style={{ fontSize: "11px", letterSpacing: "3px" }}
              >
                Selección
              </span>
              <h2
                className="font-display font-light text-snow"
                style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.5px" }}
              >
                Propiedades destacadas
              </h2>
              <p className="text-frost/65 max-w-md" style={{ fontSize: "15px", lineHeight: 1.7 }}>
                Los alojamientos mejor valorados en Ushuaia, elegidos por nuestros huéspedes.
              </p>
            </div>
            <Button
              render={<Link href="/properties" />}
              nativeButton={false}
              variant="outline"
              className="border-white/20 text-frost hover:border-aurora hover:text-aurora shrink-0 group"
            >
              Ver todas
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" data-icon="inline-end" />
            </Button>
          </div>
        </SectionReveal>

        {/* Grid — siempre 3 columnas en desktop */}
        <div className="grid grid-cols-3">
          <Suspense fallback={<FeaturedGridSkeleton />}>
            <FeaturedGrid />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

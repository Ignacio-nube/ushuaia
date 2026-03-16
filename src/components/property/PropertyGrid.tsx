import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import PropertyCard, { PropertyCardSkeleton } from "./PropertyCard"
import type { Property } from "@/types/database"
import { cn } from "@/lib/utils"

interface PropertyGridProps {
  properties: Property[]
  total: number
  pages: number
  currentPage: number
  searchParams: Record<string, string>
}

export default function PropertyGrid({
  properties,
  total,
  pages,
  currentPage,
  searchParams,
}: PropertyGridProps) {
  function pageUrl(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(p))
    return `/properties?${params.toString()}`
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="size-16 rounded-full glass flex items-center justify-center text-2xl">
          🏔️
        </div>
        <h3 className="text-snow font-medium text-lg">Sin resultados</h3>
        <p className="text-frost/60 text-sm max-w-sm">
          No encontramos propiedades con esos filtros. Probá con otros criterios.
        </p>
        <Link
          href="/properties"
          className="text-sm text-aurora hover:text-aurora/80 transition-colors"
        >
          Ver todas las propiedades
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Contador */}
      <p className="text-sm text-frost/60">
        <span className="text-snow font-medium">{total}</span>{" "}
        propiedad{total !== 1 ? "es" : ""} encontrada{total !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {currentPage > 1 && (
            <Link
              href={pageUrl(currentPage - 1)}
              className="size-9 rounded-lg glass flex items-center justify-center text-frost hover:text-aurora hover:border-aurora/40 border border-white/10 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </Link>
          )}

          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageUrl(p)}
              className={cn(
                "size-9 rounded-lg flex items-center justify-center text-sm transition-colors border",
                p === currentPage
                  ? "bg-aurora text-glacier border-aurora font-medium"
                  : "glass border-white/10 text-frost hover:border-aurora/40 hover:text-aurora"
              )}
            >
              {p}
            </Link>
          ))}

          {currentPage < pages && (
            <Link
              href={pageUrl(currentPage + 1)}
              className="size-9 rounded-lg glass flex items-center justify-center text-frost hover:text-aurora hover:border-aurora/40 border border-white/10 transition-colors"
            >
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export function PropertyGridSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-4 w-40 bg-arctic/50 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

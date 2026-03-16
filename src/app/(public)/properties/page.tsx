import { Suspense } from "react"
import { MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getProperties, getZones } from "@/lib/supabase/queries"
import PropertyFilters from "@/components/property/PropertyFilters"
import PropertyGrid, { PropertyGridSkeleton } from "@/components/property/PropertyGrid"

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Zones must be fetched first to resolve slug → name (properties.zone stores full name)
  const zonesResult = await getZones(supabase)
  const zoneName = params.zone
    ? zonesResult.find((z) => z.slug === params.zone)?.name
    : undefined

  const propertiesResult = await getProperties(supabase, {
    zone: zoneName,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    guests: params.guests ? Number(params.guests) : undefined,
    amenities: params.amenities ? params.amenities.split(",") : undefined,
    page: params.page ? Number(params.page) : 1,
  })

  const currentPage = params.page ? Number(params.page) : 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-glacier to-deep-ice pt-16">
      {/* Header */}
      <div className="bg-deep-ice border-b border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs text-aurora tracking-widest uppercase">Explorar</span>
          <h1 className="font-display text-4xl sm:text-5xl text-snow mt-2">
            {params.zone
              ? zonesResult.find((z) => z.slug === params.zone)?.name ?? "Propiedades"
              : "Todas las propiedades"}
          </h1>
          {params.zone && (
            <p className="text-frost/70 mt-2">
              {zonesResult.find((z) => z.slug === params.zone)?.description}
            </p>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar filtros */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
            {/* Botón buscar en mapa */}
            <a
              href="/map-search"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-[#7BB8D4] bg-white/[0.04] border border-white/10 hover:bg-[#4ECDC4]/[0.08] hover:border-[#4ECDC4]/30 hover:text-[#4ECDC4]"
            >
              <MapPin className="size-4 shrink-0" />
              <span>Buscar dibujando en el mapa</span>
              <span className="ml-auto text-xs opacity-50">nuevo ✦</span>
            </a>

            <div className="glass aurora-border rounded-2xl p-6 sticky top-24">
              <Suspense fallback={null}>
                <PropertyFilters zones={zonesResult} />
              </Suspense>
            </div>
          </div>

          {/* Grid de resultados */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<PropertyGridSkeleton />}>
              <PropertyGrid
                properties={propertiesResult.properties}
                total={propertiesResult.total}
                pages={propertiesResult.pages}
                currentPage={currentPage}
                searchParams={params}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

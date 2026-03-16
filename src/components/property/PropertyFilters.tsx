"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Zone } from "@/types/database"

const AMENITY_OPTIONS = [
  "WiFi",
  "Estacionamiento",
  "Vista al canal",
  "Chimenea",
  "Jacuzzi",
  "Cocina equipada",
  "Calefacción",
  "Parrilla",
]

const GUEST_OPTIONS = [1, 2, 4, 6, 8]

interface PropertyFiltersProps {
  zones: Zone[]
}

export default function PropertyFilters({ zones }: PropertyFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const get = (key: string) => searchParams.get(key) ?? ""

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      // Reset page on filter change
      params.delete("page")
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") params.delete(k)
        else params.set(k, v)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const activeCount = ["zone", "minPrice", "maxPrice", "guests", "amenities"].filter(
    (k) => searchParams.has(k)
  ).length

  function clearAll() {
    router.push(pathname)
  }

  const selectedAmenities = get("amenities") ? get("amenities").split(",") : []

  function toggleAmenity(amenity: string) {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity]
    push({ amenities: next.length ? next.join(",") : null })
  }

  return (
    <aside className="flex flex-col gap-6">
      {/* Header filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-snow font-medium">
          <SlidersHorizontal className="size-4 text-aurora" />
          Filtros
          {activeCount > 0 && (
            <Badge className="bg-aurora text-glacier text-xs border-0">{activeCount}</Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-frost/60 hover:text-aurora flex items-center gap-1 transition-colors"
          >
            <X className="size-3" /> Limpiar
          </button>
        )}
      </div>

      {/* Zona */}
      <FilterGroup label="Zona">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => push({ zone: null })}
            className={cn(
              "text-left px-3 py-2 rounded-lg text-sm transition-colors",
              !get("zone") ? "bg-aurora/20 text-aurora" : "text-frost/70 hover:bg-white/5"
            )}
          >
            Todas las zonas
          </button>
          {zones.map((zone) => (
            <button
              key={zone.slug}
              onClick={() => push({ zone: zone.slug })}
              className={cn(
                "text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center",
                get("zone") === zone.slug
                  ? "bg-aurora/20 text-aurora"
                  : "text-frost/70 hover:bg-white/5"
              )}
            >
              <span>{zone.name}</span>
              <span className="text-xs opacity-60">{zone.properties_count}</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Precio */}
      <FilterGroup label="Precio por noche (ARS)">
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-frost/50">Mínimo</label>
            <input
              type="number"
              placeholder="0"
              value={get("minPrice")}
              onChange={(e) => push({ minPrice: e.target.value || null })}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-snow text-sm outline-none focus:border-aurora/50 transition-colors"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-frost/50">Máximo</label>
            <input
              type="number"
              placeholder="∞"
              value={get("maxPrice")}
              onChange={(e) => push({ maxPrice: e.target.value || null })}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-snow text-sm outline-none focus:border-aurora/50 transition-colors"
            />
          </div>
        </div>
      </FilterGroup>

      {/* Huéspedes */}
      <FilterGroup label="Huéspedes">
        <div className="flex flex-wrap gap-2">
          {GUEST_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => push({ guests: get("guests") === String(n) ? null : String(n) })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                get("guests") === String(n)
                  ? "bg-aurora/20 border-aurora text-aurora"
                  : "border-white/15 text-frost/70 hover:border-white/30"
              )}
            >
              {n === 1 ? "1+" : `${n}+`}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Amenities */}
      <FilterGroup label="Comodidades">
        <div className="flex flex-col gap-1.5">
          {AMENITY_OPTIONS.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                onClick={() => toggleAmenity(amenity)}
                className={cn(
                  "size-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer",
                  selectedAmenities.includes(amenity)
                    ? "bg-aurora border-aurora"
                    : "border-white/25 group-hover:border-white/50"
                )}
              >
                {selectedAmenities.includes(amenity) && (
                  <svg className="size-2.5 text-glacier" fill="none" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggleAmenity(amenity)}
                className="text-sm text-frost/70 group-hover:text-frost transition-colors"
              >
                {amenity}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>
    </aside>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs text-frost/50 uppercase tracking-wider">{label}</h3>
      {children}
    </div>
  )
}

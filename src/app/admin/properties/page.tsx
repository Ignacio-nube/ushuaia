import Link from "next/link"
import { Plus, Pencil, ExternalLink, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Property } from "@/types/database"
import PropertyAvailabilityToggle from "@/components/admin/PropertyAvailabilityToggle"

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)
}

export default async function AdminPropertiesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })

  const properties = (data ?? []) as Property[]
  const activeCount = properties.filter((p) => p.is_available).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Propiedades</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {activeCount} activa{activeCount !== 1 ? "s" : ""} de {properties.length} en total
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "#4ECDC4", color: "#0A1628" }}
        >
          <Plus className="size-4" />
          Nueva propiedad
        </Link>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0D2137",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Propiedad", "Zona", "Precio/noche", "Rating", "Activa", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-[11px] font-normal uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Sin propiedades.{" "}
                    <a
                      href="/admin/properties/new"
                      style={{ color: "#4ECDC4" }}
                      className="hover:underline"
                    >
                      Creá la primera →
                    </a>
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {/* Propiedad */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="rounded-lg object-cover flex-shrink-0"
                            style={{ width: 48, height: 48 }}
                          />
                        ) : (
                          <div
                            className="rounded-lg flex-shrink-0 flex items-center justify-center text-xs"
                            style={{ width: 48, height: 48, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                          >
                            Sin img
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate max-w-[180px]">{p.title}</div>
                          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {p.bedrooms}h · {p.bathrooms}b · {p.max_guests} huésp.
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Zona */}
                    <td className="px-6 py-4 capitalize text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {p.zone.replace(/-/g, " ")}
                    </td>

                    {/* Precio */}
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: "#4ECDC4" }}>
                      {formatPrice(p.price_per_night)}
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4">
                      {p.rating > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Star className="size-3.5" style={{ color: "#F7C948", fill: "#F7C948" }} />
                          <span className="text-sm text-white">{p.rating.toFixed(1)}</span>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                            ({p.reviews_count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Sin reseñas</span>
                      )}
                    </td>

                    {/* Toggle disponibilidad */}
                    <td className="px-6 py-4">
                      <PropertyAvailabilityToggle
                        propertyId={p.id}
                        initialValue={p.is_available}
                      />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/properties/${p.slug}`}
                          target="_blank"
                          className="size-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(78,205,196,0.1)] hover:text-[#4ECDC4]"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                          title="Ver en el sitio"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                        <Link
                          href={`/admin/properties/${p.id}`}
                          className="size-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(78,205,196,0.1)] hover:text-[#4ECDC4]"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                          title="Editar"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

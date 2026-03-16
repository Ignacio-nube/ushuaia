"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Save, ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getBookingsByProperty } from "@/lib/supabase/queries"
import BookingsCalendar from "@/components/admin/BookingsCalendar"
import type { Booking, Property } from "@/types/database"

const ZONES = ["centro", "canal-beagle", "glaciar-martial", "bahia-encerrada", "las-hayas"]
const AMENITIES = ["WiFi", "Estacionamiento", "Vista al canal", "Chimenea", "Jacuzzi", "Cocina equipada", "Calefacción", "Parrilla"]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-frost/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-snow text-sm placeholder:text-frost/40 outline-none focus:border-aurora/50 transition-colors"

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = id === "new"

  const [form, setForm] = useState<Partial<Property>>({
    title: "", slug: "", description: "", price_per_night: 0,
    currency: "ARS", bedrooms: 1, bathrooms: 1, max_guests: 2,
    zone: "centro", amenities: [], images: [],
    is_featured: false, is_available: true,
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [propertyBookings, setPropertyBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (isNew) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from("properties") as any).select("*").eq("id", id).single()
      .then(({ data }: { data: Property }) => {
        if (data) setForm(data)
        setLoading(false)
      })
    getBookingsByProperty(supabase, id).then(setPropertyBookings)
  }, [id, isNew])

  function set(key: keyof Property, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleAmenity(a: string) {
    const current = form.amenities ?? []
    set("amenities", current.includes(a) ? current.filter((x) => x !== a) : [...current, a])
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    try {
      if (isNew) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("properties") as any).insert(form)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("properties") as any).update(form).eq("id", id)
      }
      router.push("/admin/properties")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta propiedad?")) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("properties") as any).delete().eq("id", id)
    router.push("/admin/properties")
  }

  function diffNights(checkIn: string, checkOut: string) {
    return Math.max(0, Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ))
  }

  const statusLabel: Record<Booking["status"], string> = {
    confirmed: "Confirmada",
    pending: "Pendiente",
    cancelled: "Cancelada",
  }
  const statusColor: Record<Booking["status"], string> = {
    confirmed: "text-aurora",
    pending: "text-gold",
    cancelled: "text-frost/30 line-through",
  }

  if (loading) return <div className="text-frost/50 text-sm">Cargando...</div>

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            render={<button onClick={() => router.back()} />}
            className="border-white/20 text-frost size-9 p-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="font-display text-3xl text-snow">
            {isNew ? "Nueva propiedad" : "Editar propiedad"}
          </h1>
        </div>
        {!isNew && (
          <Button
            variant="outline"
            render={<button onClick={handleDelete} />}
            className="border-sunset/40 text-sunset hover:bg-sunset/10"
          >
            <Trash2 className="size-4" data-icon="inline-start" />
            Eliminar
          </Button>
        )}
      </div>

      <div className="glass aurora-border rounded-2xl p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Título *">
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Cabaña con vista al canal" />
          </Field>
          <Field label="Slug *">
            <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="cabana-canal-beagle" />
          </Field>
        </div>

        <Field label="Descripción">
          <textarea rows={4} className={`${inputCls} resize-none`} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Describí la propiedad..." />
        </Field>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Precio/noche (ARS)">
            <input type="number" className={inputCls} value={form.price_per_night} onChange={(e) => set("price_per_night", Number(e.target.value))} />
          </Field>
          <Field label="Zona">
            <select className={inputCls} value={form.zone} onChange={(e) => set("zone", e.target.value)}>
              {ZONES.map((z) => <option key={z} value={z}>{z.replace(/-/g, " ")}</option>)}
            </select>
          </Field>
          <Field label="Habitaciones">
            <input type="number" min={1} className={inputCls} value={form.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} />
          </Field>
          <Field label="Baños">
            <input type="number" min={1} className={inputCls} value={form.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Máx. huéspedes">
            <input type="number" min={1} className={inputCls} value={form.max_guests} onChange={(e) => set("max_guests", Number(e.target.value))} />
          </Field>
          <Field label="Superficie (m²)">
            <input type="number" className={inputCls} value={form.area_sqm ?? ""} onChange={(e) => set("area_sqm", e.target.value ? Number(e.target.value) : null)} placeholder="Opcional" />
          </Field>
        </div>

        <Field label="Comodidades">
          <div className="flex flex-wrap gap-2 mt-1">
            {AMENITIES.map((a) => {
              const active = (form.amenities ?? []).includes(a)
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${active ? "bg-aurora/20 border-aurora text-aurora" : "border-white/15 text-frost/60 hover:border-white/30"}`}
                >
                  {a}
                </button>
              )
            })}
          </div>
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.is_available} onChange={(e) => set("is_available", e.target.checked)} className="accent-aurora" />
            <span className="text-sm text-frost/80">Disponible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="accent-aurora" />
            <span className="text-sm text-frost/80">Destacada</span>
          </label>
        </div>

        <Button
          render={<button onClick={handleSave} disabled={saving} />}
          className="bg-aurora text-glacier hover:bg-aurora/90 font-medium w-full"
        >
          <Save className="size-4" data-icon="inline-start" />
          {saving ? "Guardando..." : "Guardar propiedad"}
        </Button>
      </div>

      {/* Sección Reservas — solo para propiedades existentes */}
      {!isNew && (
        <div className="glass aurora-border rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-snow">Reservas</h2>
            <span className="text-xs text-frost/50 bg-white/5 px-2.5 py-1 rounded-full">
              {propertyBookings.length} total
            </span>
          </div>

          {propertyBookings.length === 0 ? (
            <p className="text-frost/40 text-sm">No hay reservas para esta propiedad.</p>
          ) : (
            <>
              <BookingsCalendar bookings={propertyBookings} />

              {/* Tabla compacta */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-3 text-xs text-frost/40 font-normal uppercase tracking-wider">Huésped</th>
                      <th className="text-left py-2 px-3 text-xs text-frost/40 font-normal uppercase tracking-wider">Check-in</th>
                      <th className="text-left py-2 px-3 text-xs text-frost/40 font-normal uppercase tracking-wider">Check-out</th>
                      <th className="text-center py-2 px-3 text-xs text-frost/40 font-normal uppercase tracking-wider">Noches</th>
                      <th className="text-left py-2 px-3 text-xs text-frost/40 font-normal uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyBookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="py-2.5 px-3 text-snow/80">{b.guest_name}</td>
                        <td className="py-2.5 px-3 text-frost/70">{b.check_in}</td>
                        <td className="py-2.5 px-3 text-frost/70">{b.check_out}</td>
                        <td className="py-2.5 px-3 text-center text-frost/70">{diffNights(b.check_in, b.check_out)}</td>
                        <td className={`py-2.5 px-3 font-medium ${statusColor[b.status]}`}>{statusLabel[b.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

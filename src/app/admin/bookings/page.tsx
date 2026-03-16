"use client"

import { Fragment, useEffect, useState } from "react"
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Booking } from "@/types/database"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type BookingWithProperty = Booking & {
  properties?: { id: string; title: string; zone: string; images: string[] | null } | null
}

const STATUS_OPTIONS = ["all", "pending", "confirmed", "cancelled"] as const
type StatusFilter = (typeof STATUS_OPTIONS)[number]

const LABEL: Record<string, string> = {
  all: "Todas",
  pending: "Pendientes",
  confirmed: "Confirmadas",
  cancelled: "Canceladas",
}
const STATUS_COLOR: Record<string, string> = {
  pending: "#F7C948",
  confirmed: "#4ECDC4",
  cancelled: "#FF6B6B",
}
const STATUS_BG: Record<string, string> = {
  pending: "rgba(247,201,72,0.1)",
  confirmed: "rgba(78,205,196,0.1)",
  cancelled: "rgba(255,107,107,0.1)",
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)
}

function formatDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

function nights(checkin: string, checkout: string) {
  return Math.round(
    (new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProperty | null>(null)
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from("bookings") as any)
      .select("*, properties(id, title, zone, images)")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: BookingWithProperty[] }) => {
        setBookings(data ?? [])
        setLoading(false)
      })
  }, [])

  async function updateStatus(id: string, status: "confirmed" | "cancelled") {
    const supabase = createClient()
    const loadingToast = toast.loading("Actualizando...")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("bookings") as any).update({ status }).eq("id", id)
    toast.dismiss(loadingToast)
    setCancelConfirmId(null)
    if (error) {
      toast.error("Error al actualizar")
    } else {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
      if (selectedBooking?.id === id) setSelectedBooking((prev) => prev ? { ...prev, status } : null)
      toast.success(status === "confirmed" ? "Reserva confirmada" : "Reserva cancelada")
    }
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white">Reservas</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          {bookings.length} en total
        </p>
      </div>

      {/* Tab filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => {
          const count = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-150"
              style={{
                background: active ? "rgba(78,205,196,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? "#4ECDC4" : "rgba(255,255,255,0.1)"}`,
                color: active ? "#4ECDC4" : "rgba(255,255,255,0.5)",
              }}
            >
              {LABEL[s]}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: active ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.08)" }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0D2137", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {loading ? (
          <div className="p-8 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Huésped", "Propiedad", "Fechas", "Noches", "Total", "Estado", ""].map((h) => (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Sin reservas con ese filtro
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <Fragment key={b.id}>
                      {/* Cancel confirm row */}
                      {cancelConfirmId === b.id && (
                        <tr style={{ background: "rgba(255,107,107,0.05)", borderBottom: "1px solid rgba(255,107,107,0.2)" }}>
                          <td colSpan={7} className="px-6 py-3">
                            <div className="flex items-center gap-4">
                              <p className="text-sm" style={{ color: "#FF6B6B" }}>
                                ¿Confirmar cancelación de la reserva de <strong>{b.guest_name}</strong>?
                              </p>
                              <button
                                onClick={() => updateStatus(b.id, "cancelled")}
                                className="px-3 py-1 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                                style={{ background: "#FF6B6B", color: "white" }}
                              >
                                Sí, cancelar
                              </button>
                              <button
                                onClick={() => setCancelConfirmId(null)}
                                className="px-3 py-1 rounded-lg text-xs transition-colors"
                                style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}
                              >
                                No
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      <tr
                        className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        {/* Huésped */}
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{b.guest_name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{b.guest_email}</div>
                        </td>

                        {/* Propiedad */}
                        <td className="px-6 py-4">
                          {b.properties ? (
                            <div className="flex items-center gap-2.5">
                              {b.properties.images?.[0] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={b.properties.images[0]}
                                  alt={b.properties.title}
                                  className="rounded object-cover flex-shrink-0"
                                  style={{ width: 32, height: 32 }}
                                />
                              )}
                              <div className="min-w-0">
                                <div className="text-sm text-white truncate max-w-[140px]">{b.properties.title}</div>
                                <div className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>
                                  {b.properties.zone.replace(/-/g, " ")}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                          )}
                        </td>

                        {/* Fechas */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {b.check_in} → {b.check_out}
                        </td>

                        {/* Noches */}
                        <td className="px-6 py-4 text-sm text-center" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {nights(b.check_in, b.check_out)}
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: "#4ECDC4" }}>
                          {b.total_price ? formatPrice(b.total_price) : "—"}
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              color: STATUS_COLOR[b.status] ?? "rgba(255,255,255,0.6)",
                              background: STATUS_BG[b.status] ?? "rgba(255,255,255,0.05)",
                            }}
                          >
                            {LABEL[b.status] ?? b.status}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="size-8 rounded-lg flex items-center justify-center transition-colors outline-none"
                              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="bottom"
                              align="end"
                              className="min-w-[160px]"
                              style={{
                                background: "#0D2137",
                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              {b.status === "pending" && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  style={{ color: "#4ECDC4" }}
                                  onClick={() => updateStatus(b.id, "confirmed")}
                                >
                                  <CheckCircle className="size-4" style={{ color: "#4ECDC4" }} />
                                  Confirmar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="cursor-pointer"
                                style={{ color: "#FF6B6B" }}
                                onClick={() => setCancelConfirmId(b.id)}
                              >
                                <XCircle className="size-4" style={{ color: "#FF6B6B" }} />
                                Cancelar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setSelectedBooking(b)}
                              >
                                Ver detalle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sheet lateral — detalle de reserva */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => { if (!open) setSelectedBooking(null) }}>
        <SheetContent
          side="right"
          className="w-[420px] overflow-y-auto p-0"
          style={{
            background: "#0D2137",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            maxWidth: "420px",
          }}
        >
          <SheetHeader className="p-6 pb-0">
            <SheetTitle
              className="font-display italic text-2xl"
              style={{ color: "#E8F4F8" }}
            >
              Detalle de reserva
            </SheetTitle>
          </SheetHeader>

          {selectedBooking && (
            <div className="p-6 flex flex-col gap-6">
              {/* Propiedad */}
              {selectedBooking.properties && (
                <div
                  className="flex gap-3 items-center p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {selectedBooking.properties.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedBooking.properties.images[0]}
                      className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                      alt={selectedBooking.properties.title}
                    />
                  )}
                  <div>
                    <p className="font-medium" style={{ color: "#E8F4F8" }}>{selectedBooking.properties.title}</p>
                    <p className="text-sm capitalize" style={{ color: "#7BB8D4" }}>
                      {selectedBooking.properties.zone.replace(/-/g, " ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Huésped */}
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-widest" style={{ color: "#4ECDC4" }}>Huésped</p>
                <p className="font-medium" style={{ color: "#E8F4F8" }}>{selectedBooking.guest_name}</p>
                <p className="text-sm" style={{ color: "#7BB8D4" }}>{selectedBooking.guest_email}</p>
                {selectedBooking.guest_phone && (
                  <p className="text-sm" style={{ color: "#7BB8D4" }}>{selectedBooking.guest_phone}</p>
                )}
                <p className="text-sm" style={{ color: "#7BB8D4" }}>
                  {selectedBooking.guests_count} huésped{selectedBooking.guests_count !== 1 ? "es" : ""}
                </p>
              </div>

              {/* Fechas y precio */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Check-in", value: formatDate(selectedBooking.check_in) },
                  { label: "Check-out", value: formatDate(selectedBooking.check_out) },
                  { label: "Noches", value: `${nights(selectedBooking.check_in, selectedBooking.check_out)} noches` },
                  { label: "Total", value: selectedBooking.total_price ? formatPrice(selectedBooking.total_price) : "—", highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className="p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "#7BB8D4" }}>{label}</p>
                    <p className={highlight ? "font-bold" : ""} style={{ color: highlight ? "#4ECDC4" : "#E8F4F8" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Estado */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#4ECDC4" }}>Estado</p>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    color: STATUS_COLOR[selectedBooking.status] ?? "rgba(255,255,255,0.6)",
                    background: STATUS_BG[selectedBooking.status] ?? "rgba(255,255,255,0.05)",
                  }}
                >
                  {LABEL[selectedBooking.status] ?? selectedBooking.status}
                </span>
              </div>

              {/* Mensaje */}
              {selectedBooking.message && (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#4ECDC4" }}>Mensaje</p>
                  <p className="text-sm italic" style={{ color: "#7BB8D4" }}>"{selectedBooking.message}"</p>
                </div>
              )}

              {/* Acciones */}
              <div
                className="flex gap-3 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
              >
                {selectedBooking.status === "pending" && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, "confirmed")}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "#4ECDC4", color: "#0A1628" }}
                  >
                    ✓ Confirmar
                  </button>
                )}
                {selectedBooking.status !== "cancelled" && (
                  <button
                    onClick={() => { setCancelConfirmId(selectedBooking.id); setSelectedBooking(null) }}
                    className="flex-1 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-400/10"
                    style={{
                      border: "1px solid rgba(255,107,107,0.4)",
                      color: "#FF6B6B",
                    }}
                  >
                    Cancelar reserva
                  </button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

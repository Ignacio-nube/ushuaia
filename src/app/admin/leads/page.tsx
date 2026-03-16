"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

type Lead = {
  id: string
  owner_name: string
  owner_email: string
  owner_phone: string | null
  property_name: string | null
  zone: string | null
  bedrooms: number | null
  description: string | null
  status: string
  notes: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: "new",       label: "Nuevo",       color: "#7BB8D4", bg: "rgba(123,184,212,0.1)" },
  { value: "contacted", label: "Contactado",  color: "#F7C948", bg: "rgba(247,201,72,0.1)"  },
  { value: "converted", label: "Convertido",  color: "#4ECDC4", bg: "rgba(78,205,196,0.1)"  },
  { value: "rejected",  label: "Descartado",  color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
]

function getStatus(val: string) {
  return STATUS_OPTIONS.find((s) => s.value === val) ?? STATUS_OPTIONS[0]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "hoy"
  if (days === 1) return "hace 1 día"
  if (days < 30) return `hace ${days} días`
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState("")

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from("property_leads") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: Lead[] }) => {
        setLeads(data ?? [])
        setLoading(false)
      })
  }, [])

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("property_leads") as any).update({ status }).eq("id", id)
    if (error) {
      toast.error("Error al actualizar")
    } else {
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
      toast.success("Estado actualizado")
    }
  }

  async function saveNotes(id: string) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("property_leads") as any).update({ notes: notesValue }).eq("id", id)
    if (error) {
      toast.error("Error al guardar notas")
    } else {
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes: notesValue } : l))
      setEditingNotes(null)
      toast.success("Notas guardadas")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-white">Leads — Propietarios</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          {leads.length} consultas recibidas
        </p>
      </div>

      {/* Contador por estado */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_OPTIONS.map((s) => {
          const count = leads.filter((l) => l.status === s.value).length
          return (
            <div
              key={s.value}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ background: s.bg, border: `1px solid ${s.color}30` }}
            >
              <span style={{ color: s.color }}>{s.label}</span>
              <span className="ml-2 font-bold" style={{ color: s.color }}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Tabla */}
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
        ) : leads.length === 0 ? (
          <div className="p-16 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            No hay leads todavía. Llegará cuando alguien use el formulario &quot;Publicá tu propiedad&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Propietario", "Propiedad", "Zona", "Hab.", "Estado", "Fecha", "Notas", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-normal uppercase tracking-wider"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const s = getStatus(l.status)
                  return (
                    <tr
                      key={l.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {/* Propietario */}
                      <td className="px-5 py-4">
                        <div className="text-white font-medium">{l.owner_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#7BB8D4" }}>{l.owner_email}</div>
                        {l.owner_phone && (
                          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{l.owner_phone}</div>
                        )}
                      </td>

                      {/* Propiedad */}
                      <td className="px-5 py-4 max-w-[160px]">
                        <span className="text-sm truncate block" style={{ color: "rgba(255,255,255,0.7)" }}>
                          {l.property_name ?? "—"}
                        </span>
                      </td>

                      {/* Zona */}
                      <td className="px-5 py-4">
                        <span className="text-sm capitalize" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {l.zone ? l.zone.replace(/-/g, " ") : "—"}
                        </span>
                      </td>

                      {/* Habitaciones */}
                      <td className="px-5 py-4 text-center">
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>{l.bedrooms ?? "—"}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ color: s.color, background: s.bg }}
                        >
                          {s.label}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {timeAgo(l.created_at)}
                      </td>

                      {/* Notas */}
                      <td className="px-5 py-4 max-w-[200px]">
                        {editingNotes === l.id ? (
                          <div className="flex flex-col gap-1">
                            <textarea
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1.5 rounded-lg text-xs resize-none outline-none"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(78,205,196,0.4)",
                                color: "#E8F4F8",
                              }}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => saveNotes(l.id)}
                                className="px-2 py-0.5 rounded text-[10px] font-medium"
                                style={{ background: "#4ECDC4", color: "#0A1628" }}
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingNotes(null)}
                                className="px-2 py-0.5 rounded text-[10px]"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingNotes(l.id); setNotesValue(l.notes ?? "") }}
                            className="text-xs text-left w-full transition-colors hover:opacity-80"
                            style={{ color: l.notes ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}
                          >
                            {l.notes ?? "Agregar nota..."}
                          </button>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="size-8 rounded-lg flex items-center justify-center outline-none"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="bottom"
                            align="end"
                            className="min-w-[160px]"
                            style={{ background: "#0D2137", border: "1px solid rgba(255,255,255,0.1)" }}
                          >
                            {STATUS_OPTIONS.filter((s) => s.value !== l.status).map((s) => (
                              <DropdownMenuItem
                                key={s.value}
                                className="cursor-pointer"
                                style={{ color: s.color }}
                                onClick={() => updateStatus(l.id, s.value)}
                              >
                                → {s.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

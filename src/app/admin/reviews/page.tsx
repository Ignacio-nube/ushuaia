"use client"

import { useEffect, useState } from "react"
import { Star, Trash2, Filter, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type ReviewWithProperty = {
  id: string
  author_name: string
  rating: number
  comment: string
  created_at: string
  property_id: string
  status: string
  properties?: { title: string; zone: string; images: string[] | null } | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "hoy"
  if (days === 1) return "hace 1 día"
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? "s" : ""}`
  if (days < 365) return `hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? "es" : ""}`
  return `hace ${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? "s" : ""}`
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="size-3.5"
          style={{ fill: i <= rating ? "#F7C948" : "transparent", color: i <= rating ? "#F7C948" : "rgba(255,255,255,0.2)" }}
        />
      ))}
    </div>
  )
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

const AVATAR_COLORS = ["#1A3A5C", "#2E6DA4", "#0D4B3B", "#4A1A5C", "#5C1A2E"]

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [tab, setTab] = useState<"pending" | "approved">("pending")

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from("reviews") as any)
      .select("*, properties(title, zone, images)")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: ReviewWithProperty[] }) => {
        setReviews(data ?? [])
        setLoading(false)
      })
  }, [])

  async function approveReview(id: string) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("reviews") as any).update({ status: "approved" }).eq("id", id)
    if (error) {
      toast.error("Error al aprobar")
    } else {
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r))
      toast.success("Reseña aprobada y publicada")
    }
  }

  async function deleteReview(id: string) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("reviews") as any).delete().eq("id", id)
    setDeleteConfirmId(null)
    if (error) {
      toast.error("Error al eliminar")
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success("Reseña eliminada")
    }
  }

  const pending = reviews.filter((r) => r.status === "pending")
  const approved = reviews.filter((r) => r.status === "approved")
  const currentList = tab === "pending" ? pending : approved

  const avgRating = approved.length > 0
    ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
    : 0

  // Rating breakdown (solo aprobadas)
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approved.filter((r) => r.rating === star).length,
    pct: approved.length > 0 ? Math.round((approved.filter((r) => r.rating === star).length / approved.length) * 100) : 0,
  }))

  const filtered = ratingFilter ? currentList.filter((r) => r.rating === ratingFilter) : currentList

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Reseñas</h1>
          <div className="flex items-center gap-2 mt-1">
            <Stars rating={Math.round(avgRating)} />
            <span className="text-sm font-medium text-white">{avgRating.toFixed(1)}</span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>({approved.length} aprobadas)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: "pending", label: "Pendientes", count: pending.length },
          { key: "approved", label: "Aprobadas",  count: approved.length },
        ] as const).map(({ key, label, count }) => {
          const active = tab === key
          return (
            <button
              key={key}
              onClick={() => { setTab(key); setRatingFilter(null) }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-150"
              style={{
                background: active ? "rgba(78,205,196,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? "#4ECDC4" : "rgba(255,255,255,0.1)"}`,
                color: active ? "#4ECDC4" : "rgba(255,255,255,0.5)",
              }}
            >
              {label}
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

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating breakdown (solo cuando tab=approved) */}
          {tab === "approved" && approved.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "#0D2137", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-sm font-medium text-white mb-4">Distribución de ratings</h3>
              <div className="flex flex-col gap-2.5">
                {breakdown.map(({ star, count, pct }) => (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                    className="flex items-center gap-3 w-full group"
                  >
                    <div className="flex items-center gap-1 w-14 flex-shrink-0">
                      <span className="text-xs text-white">{star}</span>
                      <Star className="size-3" style={{ fill: "#F7C948", color: "#F7C948" }} />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: ratingFilter === star ? "#F7C948" : "#4ECDC4",
                        }}
                      />
                    </div>
                    <span className="text-xs w-10 text-right flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {pct}%
                    </span>
                    <span className="text-xs w-6 text-right flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                      ({count})
                    </span>
                  </button>
                ))}
              </div>
              {ratingFilter && (
                <button
                  onClick={() => setRatingFilter(null)}
                  className="mt-4 flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "#4ECDC4" }}
                >
                  <Filter className="size-3" />
                  Quitar filtro
                </button>
              )}
            </div>
          )}

          {/* Reviews grid */}
          <div className={tab === "approved" && approved.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#1A3A5C" }}>
                  <Star className="size-7" style={{ color: "rgba(255,255,255,0.4)" }} />
                </div>
                <h3 className="text-white font-medium mb-2">
                  {tab === "pending" ? "Sin reseñas pendientes" : "Sin reseñas aprobadas"}
                </h3>
                <p className="text-sm" style={{ color: "#7BB8D4" }}>
                  {tab === "pending" ? "¡Todo al día!" : "Las reseñas aprobadas aparecerán aquí"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((r) => {
                  const colorIdx = r.author_name.charCodeAt(0) % AVATAR_COLORS.length
                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl p-5 flex flex-col gap-3"
                      style={{ background: "#0D2137", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: AVATAR_COLORS[colorIdx] }}
                          >
                            {initials(r.author_name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{r.author_name}</p>
                            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{timeAgo(r.created_at)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteConfirmId(r.id)}
                          className="size-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          title="Eliminar"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      {/* Property */}
                      {r.properties && (
                        <div
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        >
                          <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{r.properties.title}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0"
                            style={{ background: "rgba(78,205,196,0.1)", color: "#4ECDC4" }}
                          >
                            {r.properties.zone.replace(/-/g, " ")}
                          </span>
                        </div>
                      )}

                      <Stars rating={r.rating} />

                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {r.comment}
                      </p>

                      {/* Aprobar (solo pendientes) */}
                      {tab === "pending" && (
                        <button
                          onClick={() => approveReview(r.id)}
                          className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ background: "rgba(78,205,196,0.15)", color: "#4ECDC4", border: "1px solid rgba(78,205,196,0.3)" }}
                        >
                          <CheckCircle className="size-3.5" />
                          Aprobar y publicar
                        </button>
                      )}

                      {/* Delete confirm */}
                      {deleteConfirmId === r.id && (
                        <div
                          className="rounded-lg p-3 flex items-center gap-3 mt-1"
                          style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}
                        >
                          <p className="text-xs flex-1" style={{ color: "#FF6B6B" }}>¿Eliminar esta reseña?</p>
                          <button
                            onClick={() => deleteReview(r.id)}
                            className="px-2.5 py-1 rounded text-xs font-medium"
                            style={{ background: "#FF6B6B", color: "white" }}
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 rounded text-xs"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      )}
    </div>
  )
}

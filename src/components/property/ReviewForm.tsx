"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Meteors } from "@/components/ui/meteors"
import { createClient } from "@/lib/supabase/client"

export default function ReviewForm({ propertyId }: { propertyId: string }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!name || !comment || rating === 0) return
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("reviews") as any).insert({
      property_id: propertyId,
      author_name: name,
      rating,
      comment,
      status: "pending",
    })
    setLoading(false)
    if (!error) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        className="p-6 rounded-xl text-center"
        style={{
          background: "rgba(78,205,196,0.08)",
          border: "1px solid rgba(78,205,196,0.3)",
        }}
      >
        <p className="font-medium" style={{ color: "#4ECDC4" }}>¡Gracias por tu reseña!</p>
        <p className="text-sm mt-1" style={{ color: "#7BB8D4" }}>Será publicada una vez revisada por nuestro equipo.</p>
      </div>
    )
  }

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 resize-none"
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#E8F4F8",
  }

  return (
    <div
      className="relative overflow-hidden p-6 rounded-xl flex flex-col gap-4 mt-4"
      style={{
        background: "#0D2137",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Meteors de fondo */}
      <Meteors number={6} className="bg-[#4ECDC4]/50" />

      {/* Contenido — encima de meteors */}
      <div className="relative z-10 flex flex-col gap-4">
        <h3 className="font-display italic text-xl text-snow">Dejá tu reseña</h3>

        {/* Stars interactivas */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="size-7 cursor-pointer transition-colors"
              style={{
                fill: star <= (hoverRating || rating) ? "#F7C948" : "transparent",
                color: star <= (hoverRating || rating) ? "#F7C948" : "rgba(255,255,255,0.2)",
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className={inputCls}
          style={inputStyle}
        />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contá tu experiencia..."
          rows={4}
          className={inputCls}
          style={inputStyle}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !name || !comment || rating === 0}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #4ECDC4, #2E6DA4)",
            color: "#0A1628",
          }}
        >
          {loading ? "Enviando..." : "Publicar reseña →"}
        </button>
      </div>
    </div>
  )
}

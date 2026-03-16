"use client"

import { Star } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import type { Review } from "@/types/database"

interface ReviewsListProps {
  reviews: Review[]
  rating: number
  count: number
}

export default function ReviewsList({ reviews, rating, count }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-frost/50 text-sm">
        Aún no hay reseñas para esta propiedad.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Resumen */}
      <div className="flex items-center gap-3">
        <div className="font-display text-5xl text-snow">{rating.toFixed(1)}</div>
        <div className="flex flex-col gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${i < Math.round(rating) ? "fill-gold text-gold" : "text-frost/30"}`}
              />
            ))}
          </div>
          <span className="text-xs text-frost/60">{count} reseña{count !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {reviews.map((review, index) => (
          <BlurFade key={review.id} delay={index * 0.1} inView>
            <div className="glass aurora-border rounded-xl p-4 flex flex-col gap-2 hover:border-aurora/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-arctic flex items-center justify-center text-xs text-frost font-medium">
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-snow text-sm font-medium">{review.author_name}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${i < review.rating ? "fill-gold text-gold" : "text-frost/30"}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-frost/80 text-sm leading-relaxed">{review.comment}</p>
              )}
              <p className="text-xs text-frost/40">
                {new Date(review.created_at).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  )
}

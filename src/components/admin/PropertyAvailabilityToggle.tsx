"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function PropertyAvailabilityToggle({
  propertyId,
  initialValue,
}: {
  propertyId: string
  initialValue: boolean
}) {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    const next = !enabled
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("properties") as any)
      .update({ is_available: next })
      .eq("id", propertyId)

    if (error) {
      toast.error("Error al actualizar")
    } else {
      setEnabled(next)
      toast.success(next ? "Propiedad activada" : "Propiedad desactivada")
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
      style={{
        background: enabled ? "#4ECDC4" : "rgba(255,255,255,0.15)",
      }}
      title={enabled ? "Desactivar" : "Activar"}
    >
      <span
        className="inline-block size-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  )
}

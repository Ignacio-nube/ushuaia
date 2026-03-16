"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function RealtimeBookings() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("bookings-changes")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, {
        event: "INSERT",
        schema: "public",
        table: "bookings",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        toast.success(`Nueva reserva de ${payload.new?.guest_name ?? "un huésped"}`, {
          description: "El dashboard se actualizará automáticamente",
          duration: 5000,
        })
        router.refresh()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  return null
}

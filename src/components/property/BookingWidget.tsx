"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { DayPicker } from "react-day-picker"
import type { DateRange } from "react-day-picker"
import { eachDayOfInterval, format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, Users, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/database"

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price)
}

function diffDays(from: string, to: string) {
  return Math.max(
    0,
    Math.round(
      (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)
    )
  )
}

function formatDateDisplay(date: Date) {
  return format(date, "d MMM", { locale: es })
}

interface BookingWidgetProps {
  property: Property
  bookedRanges?: { check_in: string; check_out: string; status: string }[]
  serviceFeePercent?: number
}

export default function BookingWidget({ property, bookedRanges = [], serviceFeePercent = 10 }: BookingWidgetProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [showCalendar, setShowCalendar] = useState(false)
  const calContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (calContainerRef.current && !calContainerRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    if (showCalendar) document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [showCalendar])

  const [guests, setGuests] = useState(1)
  const [step, setStep] = useState<"form" | "confirm" | "success">("form")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const checkIn = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
  const checkOut = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0
  const subtotal = nights * property.price_per_night
  const serviceFee = Math.round(subtotal * (serviceFeePercent / 100))
  const total = subtotal + serviceFee

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // All booked days as Date objects (local midnight)
  const bookedDays = useMemo(() => {
    const dates: Date[] = []
    for (const range of bookedRanges) {
      try {
        const start = new Date(range.check_in + "T00:00:00")
        const end = new Date(range.check_out + "T00:00:00")
        if (start <= end) {
          dates.push(...eachDayOfInterval({ start, end }))
        }
      } catch { /* skip */ }
    }
    return dates
  }, [bookedRanges])

  const handleDateSelect = useCallback((range: DateRange | undefined) => {
    if (range?.from && range?.to && range.to > range.from) {
      const days = eachDayOfInterval({ start: range.from, end: range.to })
      const hasConflict = days.some((d) =>
        bookedDays.some((b) => b.toDateString() === d.toDateString())
      )
      if (hasConflict) {
        toast.error("Ese rango incluye fechas reservadas. Elegí otras fechas.")
        setDateRange({ from: range.from, to: undefined })
        return
      }
      setDateRange(range)
      setTimeout(() => setShowCalendar(false), 250)
      return
    }
    setDateRange(range)
  }, [bookedDays])

  async function handleBook() {
    if (!guestName || !guestEmail) return
    setLoading(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: conflicts } = await (supabase.from("bookings") as any)
        .select("id")
        .eq("property_id", property.id)
        .eq("status", "confirmed")
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)

      if (conflicts && conflicts.length > 0) {
        toast.error("Esas fechas no están disponibles. Elegí otras fechas.")
        setLoading(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("bookings") as any).insert({
        property_id: property.id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || null,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
        total_price: total,
        message: message || null,
        status: "pending",
      })

      if (error) throw error
      toast.success("¡Reserva enviada! Te contactaremos para confirmar.", {
        duration: 5000,
        icon: "🏔️",
      })
      setStep("success")
    } catch {
      setStep("success")
    } finally {
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <div className="relative glass aurora-border rounded-2xl p-6 shadow-glacier overflow-hidden">
        <BorderBeam size={120} duration={8} colorFrom="#4ECDC4" colorTo="#7BB8D4" />
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle className="size-12 text-aurora" />
          <h3 className="text-snow font-medium text-lg">¡Reserva enviada!</h3>
          <p className="text-frost/70 text-sm">
            Te contactaremos a <strong className="text-snow">{guestEmail}</strong> para confirmar tu reserva.
          </p>
          <button
            onClick={() => { setStep("form"); setGuestName(""); setGuestEmail(""); setDateRange(undefined) }}
            className="text-xs text-aurora hover:text-aurora/80 transition-colors mt-2"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative glass aurora-border rounded-2xl p-6 shadow-glacier overflow-hidden">
      <BorderBeam size={120} duration={12} colorFrom="#4ECDC4" colorTo="#2E6DA4" />

      {/* Precio */}
      <div className="flex items-baseline gap-1 mb-6">
        <span className="font-display text-3xl text-aurora">{formatPrice(property.price_per_night)}</span>
        <span className="text-frost/60 text-sm">/noche</span>
      </div>

      {step === "form" ? (
        <div className="flex flex-col gap-4">
          {/* Fechas — range picker */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-frost/50 flex items-center gap-1 uppercase tracking-wider">
              <CalendarDays className="size-3" /> Fechas
            </label>

            <div className="relative" ref={calContainerRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowCalendar((v) => !v)}
                onKeyDown={(e) => e.key === "Enter" && setShowCalendar((v) => !v)}
                className="w-full flex items-center justify-between bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-white/30 focus:border-aurora/50 transition-colors outline-none"
              >
                <span className={cn(dateRange?.from ? "text-snow" : "text-frost/40")}>
                  {dateRange?.from
                    ? dateRange?.to
                      ? `${formatDateDisplay(dateRange.from)} → ${formatDateDisplay(dateRange.to)}`
                      : `${formatDateDisplay(dateRange.from)} → Salida`
                    : "Llegada → Salida"}
                </span>
                <div className="flex items-center gap-1">
                  {dateRange && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDateRange(undefined) }}
                      className="text-frost/40 hover:text-frost/80 transition-colors p-0.5 rounded"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                  <ChevronDown className={cn("size-4 text-frost/50 transition-transform", showCalendar && "rotate-180")} />
                </div>
              </div>

              {showCalendar && (
                <div
                  className="mt-1 rounded-xl border border-white/10 p-3"
                  style={{ background: "rgba(8,20,34,0.98)" }}
                >
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    disabled={[{ before: today }, ...bookedDays]}
                    modifiers={{ booked: bookedDays }}
                    locale={es}
                    classNames={{
                      root: "w-full",
                      months: "flex flex-col gap-4",
                      month: "flex flex-col gap-2 w-full",
                      month_caption: "flex items-center justify-center h-8 relative",
                      caption_label: "text-sm font-medium",
                      nav: "absolute inset-x-0 top-0 flex items-center justify-between z-10 pointer-events-none",
                      button_previous: "pointer-events-auto size-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/8",
                      button_next: "pointer-events-auto size-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/8",
                      month_grid: "w-full table-fixed border-collapse",
                      weekdays: "flex",
                      weekday: "flex-1 h-7 flex items-center justify-center text-[10px] font-medium uppercase",
                      weeks: "flex flex-col gap-0.5",
                      week: "flex",
                      day: "flex-1 min-w-0 aspect-square p-0",
                      day_button: "w-full h-full text-xs transition-colors",
                      range_start: "",
                      range_middle: "",
                      range_end: "",
                      selected: "",
                      today: "",
                      disabled: "opacity-25 pointer-events-none",
                      outside: "opacity-20",
                      hidden: "invisible",
                    }}
                    components={{
                      Chevron: ({ orientation }) =>
                        orientation === "left"
                          ? <ChevronLeft className="size-3.5" />
                          : <ChevronRight className="size-3.5" />,
                      DayButton: ({ day, modifiers, onClick }) => {
                        const isStart = modifiers.range_start
                        const isEnd = modifiers.range_end
                        const isMiddle = modifiers.range_middle
                        const isBooked = modifiers.booked
                        const isDisabled = modifiers.disabled
                        const isOutside = modifiers.outside
                        const isToday = modifiers.today
                        return (
                          <button
                            type="button"
                            onClick={onClick}
                            disabled={isDisabled}
                            className={cn(
                              "w-full h-full text-xs flex items-center justify-center transition-colors font-normal",
                              // Default
                              !isStart && !isEnd && !isMiddle && !isBooked && "rounded-md hover:bg-white/10 text-snow/75 hover:text-snow",
                              // Today
                              isToday && !isStart && !isEnd && !isMiddle && "border border-aurora/50 text-aurora rounded-md",
                              // Range middle — dark bg so numbers are legible
                              isMiddle && "bg-aurora/25 text-snow rounded-none",
                              // Start
                              isStart && "bg-aurora text-glacier font-semibold rounded-md",
                              isStart && !isEnd && "rounded-r-none",
                              // End
                              isEnd && "bg-aurora text-glacier font-semibold rounded-md",
                              isEnd && !isStart && "rounded-l-none",
                              // Booked
                              isBooked && "bg-sunset/20 text-sunset/70 rounded-md cursor-not-allowed",
                              // States
                              isOutside && "opacity-20",
                              isDisabled && !isBooked && "opacity-25 cursor-not-allowed",
                            )}
                          >
                            {day.date.getDate()}
                          </button>
                        )
                      },
                    }}
                    styles={{
                      caption_label: { color: "#E8F4F8" },
                      weekday: { color: "rgba(123,184,212,0.45)" },
                      button_previous: { color: "#7BB8D4" },
                      button_next: { color: "#7BB8D4" },
                    }}
                  />
                  {/* Leyenda */}
                  <div className="flex items-center gap-4 px-1 pt-2 border-t border-white/8 text-xs text-frost/50">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-aurora/60" />
                      Disponible
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-sunset/50" />
                      Reservado
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Huéspedes */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-frost/50 flex items-center gap-1 uppercase tracking-wider">
              <Users className="size-3" /> Huéspedes
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/15 rounded-lg px-4 py-2">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="size-6 rounded-full border border-white/20 text-frost hover:border-aurora hover:text-aurora transition-colors text-sm"
              >−</button>
              <span className="flex-1 text-center text-snow text-sm">{guests} persona{guests !== 1 ? "s" : ""}</span>
              <button
                onClick={() => setGuests(Math.min(property.max_guests, guests + 1))}
                className="size-6 rounded-full border border-white/20 text-frost hover:border-aurora hover:text-aurora transition-colors text-sm"
              >+</button>
            </div>
            <p className="text-xs text-frost/40">Máximo {property.max_guests} huéspedes</p>
          </div>

          {/* Resumen precio */}
          {nights > 0 && (
            <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
              <div className="flex justify-between text-sm text-frost/70">
                <span>{formatPrice(property.price_per_night)} × {nights} noche{nights !== 1 ? "s" : ""}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-frost/70">
                <span>Tarifa de servicio ({serviceFeePercent}%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-snow font-medium pt-1 border-t border-white/10">
                <span>Total</span>
                <span className="text-aurora">{formatPrice(total)}</span>
              </div>
            </div>
          )}

          <ShimmerButton
            onClick={() => setStep("confirm")}
            disabled={!checkIn || !checkOut || nights === 0}
            shimmerColor="#4ECDC4"
            background="linear-gradient(135deg, #4ECDC4, #2E6DA4)"
            borderRadius="12px"
            className="w-full py-3 text-[#0A1628] font-semibold mt-1 disabled:opacity-40"
          >
            Reservar
          </ShimmerButton>
          <p className="text-center text-xs text-frost/40">No se realiza ningún cobro todavía</p>
        </div>
      ) : (
        /* Formulario de confirmación */
        <div className="flex flex-col gap-4">
          <div className="glass rounded-xl p-4 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-frost/70">
              <span>Fechas</span>
              <span className="text-snow">{checkIn} → {checkOut}</span>
            </div>
            <div className="flex justify-between text-frost/70">
              <span>{formatPrice(property.price_per_night)} × {nights} noche{nights !== 1 ? "s" : ""}</span>
              <span className="text-snow">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-frost/70">
              <span>Tarifa de servicio ({serviceFeePercent}%)</span>
              <span className="text-snow">{formatPrice(serviceFee)}</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-white/10">
              <span className="text-frost/70">Total</span>
              <span className="text-aurora">{formatPrice(total)}</span>
            </div>
          </div>

          <input
            required
            type="text"
            placeholder="Tu nombre completo *"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-snow text-sm placeholder:text-frost/40 outline-none focus:border-aurora/50 transition-colors"
          />
          <input
            required
            type="email"
            placeholder="Email *"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-snow text-sm placeholder:text-frost/40 outline-none focus:border-aurora/50 transition-colors"
          />
          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-snow text-sm placeholder:text-frost/40 outline-none focus:border-aurora/50 transition-colors"
          />
          <textarea
            rows={2}
            placeholder="Mensaje (opcional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-snow text-sm placeholder:text-frost/40 outline-none focus:border-aurora/50 transition-colors resize-none"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("form")}
              className="flex-1 border-white/20 text-frost hover:border-white/40"
            >
              Atrás
            </Button>
            <Button
              onClick={handleBook}
              disabled={loading || !guestName || !guestEmail}
              className="flex-1 bg-aurora text-glacier hover:bg-aurora/90 font-medium"
            >
              {loading ? "Enviando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, CalendarDays, Users, X, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { DayPicker, type DateRange } from "react-day-picker"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

// ── helpers ───────────────────────────────────────────────────────────────────
function toISO(d: Date) { return d.toISOString().split("T")[0] }
function fmt(d: Date) {
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export default function SearchBar() {
  const router = useRouter()
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(2)
  const [calOpen, setCalOpen] = useState(false)
  const calContainerRef = useRef<HTMLDivElement>(null)

  // Close calendar on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (calContainerRef.current && !calContainerRef.current.contains(e.target as Node)) {
        setCalOpen(false)
      }
    }
    if (calOpen) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [calOpen])

  const handleSelect = useCallback((r: DateRange | undefined) => {
    setRange(r)
    // Only auto-close when a real range is selected (at least 1 night)
    if (r?.from && r?.to && r.to > r.from) setTimeout(() => setCalOpen(false), 250)
  }, [])

  function handleSearch() {
    const params = new URLSearchParams()
    if (range?.from) params.set("checkin", toISO(range.from))
    if (range?.to) params.set("checkout", toISO(range.to))
    if (guests > 1) params.set("guests", String(guests))
    router.push(`/properties?${params.toString()}`)
  }

  const dateLabel = range?.from
    ? range.to
      ? `${fmt(range.from)}  →  ${fmt(range.to)}`
      : `${fmt(range.from)}  →  ...`
    : null

  return (
    <div
      className="w-full max-w-3xl mx-auto rounded-2xl"
      style={{
        background: "rgba(10, 22, 40, 0.65)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex flex-col sm:flex-row">

        {/* ── Fechas (date range) ──────────────────────────────────────── */}
        <div ref={calContainerRef} className="flex-[2] relative sm:border-r sm:border-white/10">
          <button
            type="button"
            onClick={() => setCalOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.04] transition-colors rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none text-left"
          >
            <CalendarDays className="size-3.5 text-aurora shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-[10px] text-frost/50 uppercase tracking-[0.15em] font-medium">
                Fechas
              </span>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm truncate", dateLabel ? "text-snow" : "text-frost/40")}>
                  {dateLabel ?? "¿Cuándo llegás?"}
                </span>
                {range?.from && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setRange(undefined) }}
                    className="ml-auto text-frost/40 hover:text-aurora transition-colors cursor-pointer shrink-0"
                  >
                    <X className="size-3" />
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* ── Calendar popover ──────────────────────────────────────── */}
          {calOpen && (
            <div
              className="absolute bottom-full left-0 mb-2 z-50 p-4 rounded-2xl shadow-2xl"
              style={{
                background: "#081422",
                border: "1px solid rgba(78,205,196,0.25)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.75)",
                minWidth: "min(680px, 95vw)",
              }}
            >
              <DayPicker
                mode="range"
                selected={range}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={es}
                disabled={{ before: new Date() }}
                classNames={{
                  months: "flex flex-col sm:flex-row gap-5",
                  month: "flex flex-col gap-3 min-w-[220px]",
                  month_caption: "flex items-center justify-center h-8 relative",
                  caption_label: "text-sm font-semibold capitalize",
                  nav: "absolute inset-x-0 top-0 flex items-center justify-between z-10 pointer-events-none",
                  button_previous: "pointer-events-auto size-8 flex items-center justify-center rounded-lg transition-colors",
                  button_next: "pointer-events-auto size-8 flex items-center justify-center rounded-lg transition-colors",
                  weekdays: "flex",
                  weekday: "flex-1 h-8 flex items-center justify-center text-[11px] font-medium uppercase",
                  week: "flex mt-1",
                  day: "flex-1 aspect-square p-0",
                  day_button: "w-full h-full rounded-lg text-sm transition-colors",
                  range_start: "rounded-r-none",
                  range_middle: "rounded-none",
                  range_end: "rounded-l-none",
                  selected: "",
                  today: "",
                  disabled: "opacity-25 pointer-events-none",
                  outside: "opacity-20",
                  hidden: "invisible",
                }}
                components={{
                  Chevron: ({ orientation }) =>
                    orientation === "left"
                      ? <ChevronLeft className="size-4" />
                      : <ChevronRight className="size-4" />,
                  DayButton: ({ day, modifiers, onClick }) => {
                    const isStart = modifiers.range_start
                    const isEnd = modifiers.range_end
                    const isMiddle = modifiers.range_middle
                    const isSelected = modifiers.selected && !isStart && !isEnd && !isMiddle
                    const isToday = modifiers.today
                    const isDisabled = modifiers.disabled
                    const isOutside = modifiers.outside

                    return (
                      <button
                        type="button"
                        onClick={onClick}
                        disabled={isDisabled}
                        className={cn(
                          "w-full h-full text-sm transition-colors flex items-center justify-center font-normal",
                          // Base
                          !isStart && !isEnd && !isMiddle && !isSelected && "rounded-lg hover:bg-white/8 text-frost/70 hover:text-snow",
                          // Today indicator
                          isToday && !isStart && !isEnd && !isMiddle && "border border-aurora/40 text-aurora",
                          // Range middle
                          isMiddle && "bg-aurora/15 text-snow rounded-none",
                          // Start
                          (isStart || isSelected) && "bg-aurora text-glacier font-semibold rounded-lg",
                          isStart && !isEnd && "rounded-r-none",
                          // End
                          isEnd && "bg-aurora text-glacier font-semibold rounded-lg rounded-l-none",
                          // Outside/disabled
                          isOutside && "opacity-20",
                          isDisabled && "opacity-25 cursor-not-allowed",
                        )}
                      >
                        {day.date.getDate()}
                      </button>
                    )
                  },
                }}
                styles={{
                  caption_label: { color: "#E8F4F8" },
                  weekday: { color: "rgba(123,184,212,0.5)" },
                  button_previous: { color: "#7BB8D4" },
                  button_next: { color: "#7BB8D4" },
                }}
              />
            </div>
          )}
        </div>

        {/* ── Huéspedes ────────────────────────────────────────────────── */}
        <SearchField
          icon={<Users className="size-3.5 text-aurora" />}
          label="Huéspedes"
          className="border-t border-white/10 sm:border-t-0"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="size-6 rounded-full border border-white/20 text-frost hover:border-aurora hover:text-aurora transition-colors flex items-center justify-center shrink-0"
            >
              <Minus className="size-3" />
            </button>
            <span className="text-snow text-sm w-5 text-center tabular-nums">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests(Math.min(12, guests + 1))}
              className="size-6 rounded-full border border-white/20 text-frost hover:border-aurora hover:text-aurora transition-colors flex items-center justify-center shrink-0"
            >
              <Plus className="size-3" />
            </button>
          </div>
        </SearchField>

        {/* ── Buscar ───────────────────────────────────────────────────── */}
        <div className="p-2 border-t border-white/10 sm:border-t-0 sm:border-l sm:border-white/10 flex items-center">
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 h-11 rounded-xl font-medium text-sm text-glacier transition-opacity hover:opacity-90 active:scale-95 w-full sm:w-auto justify-center"
            style={{ background: "linear-gradient(135deg, #4ECDC4, #2E6DA4)" }}
          >
            <Search className="size-4 shrink-0" />
            Buscar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SearchField ───────────────────────────────────────────────────────────────
function SearchField({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 flex-1 px-5 py-3.5 hover:bg-white/[0.04] transition-colors rounded-2xl", className)}>
      {icon}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[10px] text-frost/50 uppercase tracking-[0.15em] font-medium">{label}</span>
        {children}
      </div>
    </div>
  )
}

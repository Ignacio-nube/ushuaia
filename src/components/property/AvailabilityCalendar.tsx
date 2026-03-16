"use client"

import { useMemo } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

interface Props {
  bookedRanges: { check_in: string; check_out: string; status: string }[]
}

export default function AvailabilityCalendar({ bookedRanges }: Props) {
  const { confirmedDays, pendingDays } = useMemo(() => {
    const confirmed: Date[] = []
    const pending: Date[] = []
    for (const range of bookedRanges) {
      try {
        const start = new Date(range.check_in + "T00:00:00")
        const end = new Date(range.check_out + "T00:00:00")
        if (start <= end) {
          const days = eachDayOfInterval({ start, end })
          if (range.status === "confirmed") confirmed.push(...days)
          else if (range.status === "pending") pending.push(...days)
        }
      } catch { /* skip invalid */ }
    }
    return { confirmedDays: confirmed, pendingDays: pending }
  }, [bookedRanges])

  return (
    <div className="glass rounded-2xl p-4">
      <style>{`
        .avail-cal .rdp-root {
          --rdp-accent-color: #4ECDC4;
          color: rgba(232,244,248,0.8);
          font-size: 13px;
        }
        .avail-cal .rdp-day_button { color: rgba(255,255,255,0.7); cursor: default; }
        .avail-cal .rdp-day_button:hover { background: transparent !important; }
        .avail-cal .rdp-weekday { color: rgba(255,255,255,0.3); font-size: 11px; }
        .avail-cal .rdp-nav button { color: rgba(255,255,255,0.5); background: transparent; }
        .avail-cal .rdp-nav button:hover { background: rgba(255,255,255,0.08) !important; }
        .avail-cal .rdp-month_caption, .avail-cal .rdp-caption_label { color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500; }
        .avail-cal .rdp-day.avail-confirmed .rdp-day_button { background: rgba(78,205,196,0.22) !important; color: #4ECDC4 !important; border-radius: 6px; }
        .avail-cal .rdp-day.avail-pending .rdp-day_button { background: rgba(247,201,72,0.22) !important; color: #F7C948 !important; border-radius: 6px; }
        .avail-cal .rdp-today .rdp-day_button { border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; }
      `}</style>

      <div className="avail-cal">
        <DayPicker
          numberOfMonths={2}
          modifiers={{ "avail-confirmed": confirmedDays, "avail-pending": pendingDays }}
          modifiersClassNames={{ "avail-confirmed": "avail-confirmed", "avail-pending": "avail-pending" }}
          locale={es}
          disabled
        />
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-5 mt-3 px-1 text-xs text-frost/60">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: "rgba(78,205,196,0.4)", border: "1px solid #4ECDC4" }} />
          Confirmado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: "rgba(247,201,72,0.35)", border: "1px solid #F7C948" }} />
          Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-white/15 border border-white/25" />
          Disponible
        </span>
      </div>
    </div>
  )
}

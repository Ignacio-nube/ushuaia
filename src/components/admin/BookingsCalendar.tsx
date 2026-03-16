"use client"

import { useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

interface CalendarBooking {
  check_in: string
  check_out: string
  guest_name: string
  status: string
}

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

export default function BookingsCalendar({ bookings }: { bookings: CalendarBooking[] }) {
  const [selected, setSelected] = useState<Date | undefined>()

  // Build modifier sets
  const confirmedDays: Date[] = []
  const pendingDays: Date[] = []

  for (const b of bookings) {
    const start = new Date(b.check_in)
    const end = new Date(b.check_out)
    const days = getDaysInRange(start, end)
    if (b.status === "confirmed") confirmedDays.push(...days)
    else if (b.status === "pending") pendingDays.push(...days)
  }

  // Find bookings for selected day
  const selectedBookings = selected
    ? bookings.filter((b) => {
        const s = new Date(b.check_in)
        const e = new Date(b.check_out)
        return selected >= s && selected <= e
      })
    : []

  return (
    <div>
      <style>{`
        .rdp-root {
          --rdp-accent-color: #4ECDC4;
          --rdp-background-color: rgba(78,205,196,0.1);
          color: rgba(255,255,255,0.8);
          font-size: 13px;
        }
        .rdp-day_button { color: rgba(255,255,255,0.7); }
        .rdp-day_button:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }
        .rdp-weekday { color: rgba(255,255,255,0.3); font-size: 11px; }
        .rdp-nav button { color: rgba(255,255,255,0.5); }
        .rdp-nav button:hover { background: rgba(255,255,255,0.08); }
        .rdp-caption_label { color: rgba(255,255,255,0.8); font-size: 13px; }
        .rdp-day.confirmed .rdp-day_button { background: rgba(78,205,196,0.2) !important; color: #4ECDC4 !important; border-radius: 6px; }
        .rdp-day.pending .rdp-day_button { background: rgba(247,201,72,0.2) !important; color: #F7C948 !important; border-radius: 6px; }
        .rdp-selected .rdp-day_button { background: #4ECDC4 !important; color: #0A1628 !important; }
      `}</style>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={setSelected}
        modifiers={{ confirmed: confirmedDays, pending: pendingDays }}
        modifiersClassNames={{ confirmed: "confirmed", pending: "pending" }}
      />

      {selected && selectedBookings.length > 0 && (
        <div
          className="mt-3 rounded-xl p-3 flex flex-col gap-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {selectedBookings.map((b, i) => (
            <div key={i} className="text-xs">
              <span className="text-white font-medium">{b.guest_name}</span>
              <span className="mx-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span
                style={{
                  color: b.status === "confirmed" ? "#4ECDC4" : "#F7C948",
                }}
              >
                {b.status === "confirmed" ? "Confirmada" : "Pendiente"}
              </span>
              <div style={{ color: "rgba(255,255,255,0.4)" }}>
                {b.check_in} → {b.check_out}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

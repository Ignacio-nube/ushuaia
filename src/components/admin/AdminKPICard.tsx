"use client"

import { useState } from "react"
import { NumberTicker } from "@/components/ui/number-ticker"

export default function AdminKPICard({
  icon,
  iconColor,
  label,
  value,
  sub,
  borderColor,
  ticker = false,
}: {
  icon: React.ReactNode
  iconColor: string
  label: string
  value: string | number
  sub?: string
  borderColor: string
  ticker?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-200"
      style={{
        background: hovered ? "#112843" : "#0D2137",
        border: "1px solid rgba(255,255,255,0.07)",
        borderTop: `2px solid ${borderColor}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {label}
        </span>
        <span
          className="size-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}18`, color: iconColor }}
        >
          {icon}
        </span>
      </div>
      <div className="font-display text-3xl text-white">
        {ticker && typeof value === "number" ? (
          <NumberTicker value={value} />
        ) : (
          value
        )}
      </div>
      {sub && (
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {sub}
        </p>
      )}
    </div>
  )
}

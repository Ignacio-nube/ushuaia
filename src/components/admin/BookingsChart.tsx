"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface MonthData {
  month: string
  reservas: number
  ingresos: number
}

export default function BookingsChart({ data }: { data: MonthData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: "rgba(255,255,255,0.3)" }}>
        Sin datos disponibles
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          tickCount={5}
          domain={[0, "auto"]}
          tickFormatter={(v) => Math.round(v).toString()}
        />
        <Tooltip
          contentStyle={{
            background: "#0D2137",
            border: "1px solid rgba(78,205,196,0.3)",
            borderRadius: "8px",
            color: "#E8F4F8",
            fontSize: 12,
          }}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar
          dataKey="reservas"
          name="Reservas"
          fill="#4ECDC4"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

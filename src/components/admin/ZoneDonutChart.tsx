"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS = ["#4ECDC4", "#2E6DA4", "#7BB8D4", "#F7C948", "#FF6B6B"]

interface ZoneData {
  name: string
  value: number
}

export default function ZoneDonutChart({ data }: { data: ZoneData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: "rgba(255,255,255,0.3)" }}>
        Sin datos disponibles
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#0D2137",
            border: "1px solid rgba(78,205,196,0.3)",
            borderRadius: "8px",
            color: "#E8F4F8",
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

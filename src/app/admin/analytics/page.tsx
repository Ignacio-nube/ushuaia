"use client"

import { useEffect, useState, useCallback } from "react"
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const COLORS = ["#4ECDC4", "#2E6DA4", "#7BB8D4", "#F7C948", "#FF6B6B"]

type Period = "month" | "quarter" | "year"
const PERIOD_LABELS: Record<Period, string> = { month: "Este mes", quarter: "Últimos 3 meses", year: "Este año" }
const PERIOD_DAYS: Record<Period, number> = { month: 30, quarter: 90, year: 365 }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg p-3 shadow-xl" style={{ background: "#0D2137", border: "1px solid rgba(78,205,196,0.3)" }}>
      <p className="text-xs mb-1" style={{ color: "#7BB8D4" }}>{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium text-white">
          {entry.name}:{" "}
          <span style={{ color: entry.color }}>
            {typeof entry.value === "number" && entry.name?.toLowerCase().includes("ingreso")
              ? `$ ${entry.value.toLocaleString("es-AR")}`
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

function StatCard({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: "#0D2137", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      <p className="font-display text-2xl text-white">{value}</p>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {trend >= 0
            ? <TrendingUp className="size-3.5" style={{ color: "#4ECDC4" }} />
            : <TrendingDown className="size-3.5" style={{ color: "#FF6B6B" }} />
          }
          <span className="text-xs font-medium" style={{ color: trend >= 0 ? "#4ECDC4" : "#FF6B6B" }}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>vs período anterior</span>
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#0D2137", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="mb-5">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function nights(ci: string, co: string) {
  return Math.round((new Date(co).getTime() - new Date(ci).getTime()) / (1000 * 60 * 60 * 24))
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("month")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    const since = new Date(Date.now() - PERIOD_DAYS[p] * 24 * 60 * 60 * 1000).toISOString()
    const supabase = createClient()
    const [bookingsRes, propsRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("bookings") as any)
        .select("*, properties(title, zone)")
        .gte("created_at", since),
      supabase.from("properties").select("id, title, zone"),
    ])
    setBookings(bookingsRes.data ?? [])
    setProperties(propsRes.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData(period) }, [period, fetchData])

  const confirmed = bookings.filter((b) => b.status === "confirmed")
  const totalRevenue = confirmed.reduce((s, b) => s + (b.total_price ?? 0), 0)
  const avgStay = confirmed.length > 0
    ? (confirmed.reduce((s, b) => s + nights(b.check_in, b.check_out), 0) / confirmed.length).toFixed(1)
    : "—"
  const avgTicket = confirmed.length > 0
    ? Math.round(totalRevenue / confirmed.length)
    : 0
  const occupancyRate = properties.length > 0
    ? Math.round((confirmed.length / (properties.length * (PERIOD_DAYS[period] / 30))) * 100)
    : 0

  // Monthly data for line/bar charts
  const monthlyMap: Record<string, { reservas: number; ingresos: number }> = {}
  for (const b of bookings) {
    const d = new Date(b.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyMap[key]) monthlyMap[key] = { reservas: 0, ingresos: 0 }
    monthlyMap[key].reservas++
    if (b.status === "confirmed") monthlyMap[key].ingresos += b.total_price ?? 0
  }
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month: new Date(month + "-01").toLocaleDateString("es-AR", { month: "short", year: "2-digit" }),
      ...v,
    }))

  // Top properties
  const propMap: Record<string, { title: string; ingresos: number; reservas: number }> = {}
  for (const b of confirmed) {
    const title = b.properties?.title ?? "Desconocida"
    if (!propMap[title]) propMap[title] = { title, ingresos: 0, reservas: 0 }
    propMap[title].ingresos += b.total_price ?? 0
    propMap[title].reservas++
  }
  const topProps = Object.values(propMap).sort((a, b) => b.ingresos - a.ingresos).slice(0, 5)

  // By day of week
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const dayCount = new Array(7).fill(0)
  for (const b of bookings) dayCount[new Date(b.check_in).getDay()]++
  const dayData = days.map((day, i) => ({ day, reservas: dayCount[i] }))

  // By zone (radar)
  const zoneMap: Record<string, number> = {}
  for (const b of confirmed) {
    const zone = (b.properties?.zone ?? "otras").replace(/-/g, " ")
    zoneMap[zone] = (zoneMap[zone] ?? 0) + 1
  }
  const zoneData = Object.entries(zoneMap).map(([zone, value]) => ({ zone, value }))

  // Guests distribution pie
  const guestDist = [
    { name: "1-2 huéspedes", value: bookings.filter((b) => b.guests_count <= 2).length },
    { name: "3-4 huéspedes", value: bookings.filter((b) => b.guests_count >= 3 && b.guests_count <= 4).length },
    { name: "5+ huéspedes", value: bookings.filter((b) => b.guests_count >= 5).length },
  ].filter((d) => d.value > 0)

  function exportCSV() {
    const headers = ["Huésped", "Propiedad", "Check-in", "Check-out", "Noches", "Total", "Estado"]
    const rows = bookings.map((b) => [
      b.guest_name,
      b.properties?.title ?? "",
      b.check_in,
      b.check_out,
      nights(b.check_in, b.check_out),
      b.total_price ?? "",
      b.status,
    ])
    const csv = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reservas-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exportado")
  }

  const formatPesos = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)

  const axisStyle = { fill: "rgba(255,255,255,0.5)", fontSize: 11 }
  const gridStyle = { stroke: "rgba(255,255,255,0.05)" }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Analíticas</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Métricas y tendencias</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            {(["month", "quarter", "year"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: period === p ? "#0D2137" : "transparent",
                  color: period === p ? "#4ECDC4" : "rgba(255,255,255,0.5)",
                  border: period === p ? "1px solid rgba(78,205,196,0.2)" : "1px solid transparent",
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Download className="size-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Ingresos totales" value={formatPesos(totalRevenue)} />
            <StatCard label="Tasa de ocupación" value={`${occupancyRate}%`} />
            <StatCard label="Estadía promedio" value={`${avgStay} noches`} />
            <StatCard label="Ticket promedio" value={avgTicket > 0 ? formatPesos(avgTicket) : "—"} />
          </div>

          {/* Line chart — ingresos */}
          <ChartCard title="Ingresos por mes" subtitle="Últimos meses — solo confirmadas">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#4ECDC4" strokeWidth={2}
                  dot={{ fill: "#4ECDC4", strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar — reservas por mes */}
            <ChartCard title="Reservas por mes">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false}
                    domain={[0, "auto"]} tickFormatter={(v) => Math.round(v).toString()} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="reservas" name="Reservas" fill="#2E6DA4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Horizontal bar — top propiedades */}
            <ChartCard title="Top propiedades por ingresos">
              {topProps.length === 0 ? (
                <div className="flex items-center justify-center h-48" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Sin datos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topProps} layout="vertical" margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <CartesianGrid {...gridStyle} horizontal={false} />
                    <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="title" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false}
                      tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar — zonas */}
            <ChartCard title="Ocupación por zona">
              {zoneData.length === 0 ? (
                <div className="flex items-center justify-center h-48" style={{ color: "rgba(255,255,255,0.3)" }}>Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={zoneData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="zone" tick={{ ...axisStyle, fontSize: 10 }} />
                    <Radar dataKey="value" name="Reservas" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Bar — día de semana */}
            <ChartCard title="Reservas por día de semana">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dayData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false}
                    domain={[0, "auto"]} tickFormatter={(v) => Math.round(v).toString()} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="reservas" name="Reservas" fill="#7BB8D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie — distribución de huéspedes */}
            <ChartCard title="Distribución de huéspedes">
              {guestDist.length === 0 ? (
                <div className="flex items-center justify-center h-48" style={{ color: "rgba(255,255,255,0.3)" }}>Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={guestDist} cx="50%" cy="45%" outerRadius={75} paddingAngle={3} dataKey="value">
                      {guestDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}

import { Building2, CalendarCheck, TrendingUp, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getBookingsByMonth, getBookingsByZone, getBookingsCalendar } from "@/lib/supabase/queries"
import type { Booking, Property } from "@/types/database"
import BookingsChart from "@/components/admin/BookingsChart"
import ZoneDonutChart from "@/components/admin/ZoneDonutChart"
import BookingsCalendar from "@/components/admin/BookingsCalendar"
import AdminKPICard from "@/components/admin/AdminKPICard"
import RealtimeBookings from "@/components/admin/RealtimeBookings"

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: properties },
    { data: bookings },
    { data: monthBookings },
    bookingsByMonth,
    bookingsByZone,
    calendarBookings,
  ] = await Promise.all([
    supabase.from("properties").select("*"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("bookings") as any).select("*").order("created_at", { ascending: false }).limit(10),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("bookings") as any).select("*").gte("created_at", firstOfMonth),
    getBookingsByMonth(supabase),
    getBookingsByZone(supabase),
    getBookingsCalendar(supabase, now.getFullYear(), now.getMonth() + 1),
  ])

  const props = (properties ?? []) as Property[]
  const allBookings = (bookings ?? []) as Booking[]
  const mBookings = (monthBookings ?? []) as Booking[]

  const activeProps = props.filter((p) => p.is_available).length
  const monthRevenue = mBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)
  const pendingCount = allBookings.filter((b) => b.status === "pending").length

  const STATUS_LABEL: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
  }
  const STATUS_COLOR: Record<string, string> = {
    pending: "#F7C948",
    confirmed: "#4ECDC4",
    cancelled: "#FF6B6B",
  }
  const STATUS_BG: Record<string, string> = {
    pending: "rgba(247,201,72,0.1)",
    confirmed: "rgba(78,205,196,0.1)",
    cancelled: "rgba(255,107,107,0.1)",
  }

  return (
    <div className="flex flex-col gap-8">
      <RealtimeBookings />
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminKPICard
          icon={<Building2 className="size-5" />}
          iconColor="#4ECDC4"
          label="Propiedades activas"
          value={activeProps}
          sub={`de ${props.length} en total`}
          borderColor="#4ECDC4"
          ticker
        />
        <AdminKPICard
          icon={<CalendarCheck className="size-5" />}
          iconColor="#F7C948"
          label="Reservas este mes"
          value={mBookings.length}
          sub={`${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""}`}
          borderColor="#F7C948"
          ticker
        />
        <AdminKPICard
          icon={<TrendingUp className="size-5" />}
          iconColor="#7BB8D4"
          label="Ingresos del mes"
          value={formatPrice(monthRevenue)}
          sub="Solo confirmadas"
          borderColor="#7BB8D4"
        />
        <AdminKPICard
          icon={<Users className="size-5" />}
          iconColor="#FF6B6B"
          label="Total reservas"
          value={allBookings.length}
          borderColor="#FF6B6B"
          ticker
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — reservas por mes */}
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            background: "#0D2137",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-medium text-white">Reservas por mes</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Últimos 6 meses</p>
            </div>
          </div>
          <BookingsChart data={bookingsByMonth} />
        </div>

        {/* Donut — por zona */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#0D2137",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="mb-5">
            <h2 className="text-sm font-medium text-white">Ocupación por zona</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Reservas confirmadas</p>
          </div>
          <ZoneDonutChart data={bookingsByZone} />
        </div>
      </div>

      {/* Table + Calendar row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas reservas */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: "#0D2137",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-sm font-medium text-white">Últimas reservas</h2>
            <a
              href="/admin/bookings"
              className="text-xs transition-colors"
              style={{ color: "#4ECDC4" }}
            >
              Ver todas →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th className="px-6 py-3 text-left text-[11px] font-normal uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Huésped</th>
                  <th className="px-6 py-3 text-left text-[11px] font-normal uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Fechas</th>
                  <th className="px-6 py-3 text-left text-[11px] font-normal uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Total</th>
                  <th className="px-6 py-3 text-left text-[11px] font-normal uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Sin reservas todavía
                    </td>
                  </tr>
                ) : (
                  allBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-3.5">
                        <div className="text-white text-sm">{booking.guest_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{booking.guest_email}</div>
                      </td>
                      <td className="px-6 py-3.5 text-sm whitespace-nowrap" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {booking.check_in} → {booking.check_out}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium" style={{ color: "#4ECDC4" }}>
                        {booking.total_price ? formatPrice(booking.total_price) : "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            color: STATUS_COLOR[booking.status] ?? "rgba(255,255,255,0.6)",
                            background: STATUS_BG[booking.status] ?? "rgba(255,255,255,0.05)",
                          }}
                        >
                          {STATUS_LABEL[booking.status] ?? booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calendario */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#0D2137",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="mb-4">
            <h2 className="text-sm font-medium text-white">Disponibilidad</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span style={{ color: "#4ECDC4" }}>■</span> Confirmadas &nbsp;
              <span style={{ color: "#F7C948" }}>■</span> Pendientes
            </p>
          </div>
          <BookingsCalendar bookings={calendarBookings} />
        </div>
      </div>
    </div>
  )
}

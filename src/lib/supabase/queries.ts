import type { SupabaseClient } from "@supabase/supabase-js"
import type { Booking, Database, Property, Zone } from "@/types/database"

export type PropertyFilters = {
  zone?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
  checkin?: string
  checkout?: string
  amenities?: string[]
  page?: number
}

const PAGE_SIZE = 9

export async function getProperties(
  supabase: SupabaseClient<Database>,
  filters: PropertyFilters = {}
) {
  const { zone, minPrice, maxPrice, guests, amenities, page = 1 } = filters
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("is_available", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (zone) query = query.eq("zone", zone)
  if (minPrice) query = query.gte("price_per_night", minPrice)
  if (maxPrice) query = query.lte("price_per_night", maxPrice)
  if (guests) query = query.gte("max_guests", guests)
  if (amenities?.length) query = query.overlaps("amenities", amenities)

  const { data, count, error } = await query

  return {
    properties: (data ?? []) as Property[],
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / PAGE_SIZE),
    error,
  }
}

export async function getPropertyBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single()

  return { property: data as Property | null, error }
}

export async function getFeaturedProperties(supabase: SupabaseClient<Database>, limit = 6) {
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .eq("is_available", true)
    .order("rating", { ascending: false })
    .limit(limit)

  return (data ?? []) as Property[]
}

export async function getZones(supabase: SupabaseClient<Database>) {
  const { data } = await supabase.from("zones").select("*").order("name")
  return (data ?? []) as Zone[]
}

export async function getReviewsByProperty(
  supabase: SupabaseClient<Database>,
  propertyId: string
) {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("property_id", propertyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20)

  return data ?? []
}

export async function getBookingsByMonth(supabase: SupabaseClient<Database>) {
  const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("bookings") as any)
    .select("created_at, total_price, status")
    .gte("created_at", since)

  if (!data) return []

  // Group by month
  const grouped: Record<string, { reservas: number; ingresos: number }> = {}
  for (const b of data) {
    const date = new Date(b.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (!grouped[key]) grouped[key] = { reservas: 0, ingresos: 0 }
    grouped[key].reservas++
    if (b.status === "confirmed") grouped[key].ingresos += b.total_price ?? 0
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month: new Date(month + "-01").toLocaleDateString("es-AR", { month: "short", year: "2-digit" }),
      ...values,
    }))
}

export async function getBookingsByZone(supabase: SupabaseClient<Database>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("bookings") as any)
    .select("property_id, status")
    .eq("status", "confirmed")

  if (!data) return []

  // Get property zones separately
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: props } = await (supabase.from("properties") as any).select("id, zone")
  const zoneMap: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const p of (props ?? []) as any[]) zoneMap[p.id] = p.zone

  const grouped: Record<string, number> = {}
  for (const b of data) {
    const zone = zoneMap[b.property_id] ?? "Desconocida"
    grouped[zone] = (grouped[zone] ?? 0) + 1
  }

  return Object.entries(grouped).map(([name, value]) => ({ name, value }))
}

export async function getServiceFeePercent(supabase: SupabaseClient<Database>): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("settings") as any)
    .select("value")
    .eq("key", "service_fee_percent")
    .single()
  const parsed = Number(data?.value)
  return isNaN(parsed) ? 10 : parsed
}

export async function getBookingDatesForProperty(
  supabase: SupabaseClient<Database>,
  propertyId: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("bookings") as any)
    .select("check_in, check_out, status")
    .eq("property_id", propertyId)
    .neq("status", "cancelled")

  return (data ?? []) as { check_in: string; check_out: string; status: string }[]
}

export async function getBookingsByProperty(
  supabase: SupabaseClient<Database>,
  propertyId: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("bookings") as any)
    .select("*")
    .eq("property_id", propertyId)
    .order("check_in", { ascending: false })

  return (data ?? []) as Booking[]
}

export async function getBookingsCalendar(
  supabase: SupabaseClient<Database>,
  year: number,
  month: number
) {
  const start = new Date(year, month - 1, 1).toISOString().split("T")[0]
  const end = new Date(year, month, 0).toISOString().split("T")[0]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("bookings") as any)
    .select("check_in, check_out, guest_name, status")
    .gte("check_in", start)
    .lte("check_out", end)
    .neq("status", "cancelled")

  return data ?? []
}

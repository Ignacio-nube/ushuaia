"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Star,
  Settings,
  BarChart3,
  Users,
} from "lucide-react"
import { Logo } from "@/components/shared/Logo"

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analíticas", icon: BarChart3 },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/properties", label: "Propiedades", icon: Building2 },
      { href: "/admin/bookings", label: "Reservas", icon: CalendarCheck },
      { href: "/admin/reviews", label: "Reseñas", icon: Star },
      { href: "/admin/leads", label: "Leads", icon: Users },
    ],
  },
  {
    label: "Configuración",
    items: [
      { href: "/admin/settings", label: "Ajustes", icon: Settings },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from("bookings") as any)
      .select("id", { count: "exact" })
      .eq("status", "pending")
      .then(({ count }: { count: number | null }) => setPendingCount(count ?? 0))
  }, [])

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40"
      style={{
        width: "240px",
        background: "#07111F",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6">
        <Logo width={160} height={36} href="/admin" />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <span
              className="px-3 mb-1 text-[10px] uppercase tracking-[2px] font-medium"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {group.label}
            </span>
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                  style={{
                    background: active ? "rgba(78,205,196,0.1)" : "transparent",
                    borderLeft: active ? "2px solid #4ECDC4" : "2px solid transparent",
                    color: active ? "#4ECDC4" : "rgba(255,255,255,0.6)",
                    marginLeft: "-1px",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)"
                      e.currentTarget.style.color = "rgba(255,255,255,0.9)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)"
                    }
                  }}
                >
                  <Icon className="size-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/admin/bookings" && pendingCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#F7C948", color: "#0A1628" }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div
        className="px-3 py-4 mx-3 mb-4 rounded-xl flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="size-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
          style={{ background: "#1A3A5C" }}
        >
          AD
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white font-medium truncate">Admin</div>
          <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
            nacho.marquez45@gmail.com
          </div>
        </div>
      </div>
    </aside>
  )
}

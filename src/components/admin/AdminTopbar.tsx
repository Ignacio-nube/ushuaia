"use client"

import { usePathname } from "next/navigation"
import { Bell, ChevronDown, ExternalLink, LogOut } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analíticas",
  "/admin/properties": "Propiedades",
  "/admin/bookings": "Reservas",
  "/admin/reviews": "Reseñas",
  "/admin/settings": "Ajustes",
}

export default function AdminTopbar() {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pageTitle = BREADCRUMB_MAP[pathname] ?? "Admin"
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from("bookings") as any)
      .select("id", { count: "exact" })
      .eq("status", "pending")
      .then(({ count }: { count: number | null }) => {
        setPendingCount(count ?? 0)
      })
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-6"
      style={{
        left: "240px",
        height: "64px",
        background: "rgba(10,22,40,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left: page title + date */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-base font-semibold text-white leading-none">{pageTitle}</h1>
        <p className="text-[11px] capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>
          {today}
        </p>
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button
          className="relative size-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        >
          <Bell className="size-4" style={{ color: "rgba(255,255,255,0.6)" }} />
          {pendingCount > 0 && (
            <span
              className="absolute -top-1 -right-1 size-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "#F7C948" }}
            >
              {pendingCount}
            </span>
          )}
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            <div
              className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "#1A3A5C" }}
            >
              AD
            </div>
            <span className="text-sm text-white">Admin</span>
            <ChevronDown
              className="size-3.5 transition-transform"
              style={{
                color: "rgba(255,255,255,0.4)",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 z-50"
              style={{
                background: "#0D2137",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Ver sitio
              </a>
              <button
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="size-3.5" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

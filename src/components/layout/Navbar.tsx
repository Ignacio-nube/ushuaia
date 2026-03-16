"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/shared/Logo"

const navLinks = [
  { href: "/properties", label: "Propiedades" },
  { href: "/#about", label: "Contacto" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    // Verificar posición inicial al montar (sin esperar el primer scroll)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? "rgba(10, 22, 40, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        transition: "background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Logo width={180} height={40} href="/" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-light text-frost/80 hover:text-snow transition-colors duration-200 group"
              >
                {link.label}
                {/* Underline animado desde el centro */}
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-px bg-aurora w-0 group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/map-search"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#7BB8D4",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(78,205,196,0.4)"
                e.currentTarget.style.color = "#4ECDC4"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"
                e.currentTarget.style.color = "#7BB8D4"
              }}
            >
              <Map className="size-3.5" />
              Ver en mapa
            </Link>
            <Button
              render={<Link href="/admin" />}
              nativeButton={false}
              size="sm"
              className="bg-aurora/10 text-aurora border border-aurora/30 hover:bg-aurora hover:text-glacier font-medium transition-all duration-200"
            >
              Panel Admin
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-frost hover:text-snow transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          open ? "max-h-64" : "max-h-0"
        )}
        style={{
          background: "rgba(10, 22, 40, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-2 border-t border-white/10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2.5 text-sm text-frost/80 hover:text-aurora transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/map-search"
            className="py-2.5 text-sm text-frost/80 hover:text-aurora transition-colors flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Map className="size-4" />
            Ver en mapa
          </Link>
          <Button
            render={<Link href="/admin" onClick={() => setOpen(false)} />}
            nativeButton={false}
            size="sm"
            className="mt-2 w-full bg-aurora text-glacier hover:bg-aurora/90"
          >
            Panel Admin
          </Button>
        </nav>
      </div>
    </header>
  )
}

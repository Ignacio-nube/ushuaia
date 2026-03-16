# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Fin del Mundo Stays** — plataforma de alquiler temporario en Ushuaia, Patagonia Argentina.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS v4 · Supabase · shadcn/ui · Framer Motion · lucide-react

## Commands

```bash
npm run dev        # Servidor de desarrollo (http://localhost:3000)
npm run build      # Build de producción
npm run lint       # ESLint
```

## Architecture

```
src/
  app/             # Next.js App Router — Server Components por defecto
  components/
    ui/            # shadcn/ui (auto-generados, no modificar manualmente)
    layout/        # Navbar, Footer
    landing/       # HeroSection, SearchBar, FeaturedProperties, ZonesSection, StatsSection
    property/      # PropertyCard, PropertyGallery, BookingWidget, ReviewsList
    shared/        # DateRangePicker, GuestSelector, AmenityBadge
  lib/supabase/
    client.ts      # Browser client (usar en 'use client' components)
    server.ts      # Server client (usar en Server Components y Route Handlers)
    queries.ts     # Todas las queries reutilizables
  types/
    database.ts    # Tipos de Supabase (Property, Zone, Booking, Review)
```

## Design System

**Siempre dark** — no hay modo claro. La clase `.dark` está en `<html>`.

Variables de color disponibles como utilidades Tailwind:
- `bg-glacier` (#0A1628) — fondo principal
- `bg-deep-ice` (#0D2137) — cards y secciones
- `bg-arctic` (#1A3A5C) — hover states
- `bg-ice-mist` (#2E6DA4) — acentos
- `bg-frost` / `text-frost` (#7BB8D4) — secundario
- `bg-snow` / `text-snow` (#E8F4F8) — texto principal
- `bg-aurora` (#4ECDC4) — CTA principal (primary)
- `bg-sunset` (#FF6B6B) — badges de alerta
- `bg-gold` (#F7C948) — estrellas/ratings

Clases de utilidad custom (en `globals.css`):
- `.glass` — glassmorphism (backdrop-blur + bg-white/6 + border-white/12)
- `.glass-hover` — glassmorphism en hover
- `.aurora-border` — borde con brillo aurora
- `.shadow-glacier` — sombra azulada
- `.font-display` — Cormorant Garamond (serif display)

Tipografía:
- Body: DM Sans (`font-sans`)
- Display/headings: Cormorant Garamond (`.font-display` o `font-family: var(--font-display)`)

## Supabase

- Browser client: `import { createClient } from '@/lib/supabase/client'`
- Server client: `import { createClient } from '@/lib/supabase/server'` (async)
- Tipos: `import type { Property, Zone, Booking, Review } from '@/types/database'`

Variables de entorno requeridas en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## shadcn/ui Rules

- Usar `gap-*` en lugar de `space-y-*` o `space-x-*`
- Usar `size-*` cuando width = height
- Usar `cn()` de `@/lib/utils` para clases condicionales
- Iconos dentro de `Button`: usar `data-icon="inline-start"` o `data-icon="inline-end"`, sin clases de tamaño
- Cuando se usa `render={<Link />}` en Button, agregar `nativeButton={false}` — de lo contrario el componente lanza error de accesibilidad porque `Link` no es un `<button>` nativo
- Formularios: `FieldGroup` + `Field`, nunca divs con `space-y-*`
- Cards: composición completa (`CardHeader`, `CardTitle`, `CardContent`, etc.)

## Precios

Mostrar en ARS con formato: `$150.000/noche` (no USD, no símbolo $-dollar sin separador de miles).

## Implementación (pasos restantes)

1. ✅ Setup base (Next.js + Tailwind + shadcn + variables de entorno)
2. ⬜ Supabase schema (SQL + tipos TypeScript)
3. ✅ Design tokens (globals.css con variables CSS + fuentes)
4. ✅ Layout (Navbar + Footer)
5. ✅ Landing Hero (imagen de fondo + SearchBar glassmorphism + Particles)
6. ✅ PropertyCard
7. ✅ Featured Properties (grid con datos de Supabase)
8. ✅ Zones Section
9. ✅ Stats + About
10. ✅ Página /properties (filtros + queries + paginación)
11. ✅ Página /properties/[slug] (galería + BookingWidget + Reviews)
12. ✅ Admin Panel

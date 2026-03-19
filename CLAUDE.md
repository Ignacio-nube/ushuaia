# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Fin del Mundo Stays** — plataforma de alquiler temporario en Ushuaia, Patagonia Argentina.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase · shadcn/ui · Framer Motion / motion · lucide-react · Mapbox GL JS · Recharts

## Commands

```bash
npm run dev        # Servidor de desarrollo (http://localhost:3000)
npm run build      # Build de producción
npm run lint       # ESLint
```

## Architecture

```
src/
  app/
    (public)/      # Layout público (Navbar + Footer)
      page.tsx     # Landing
      properties/  # Listado + /[slug] detalle
    admin/         # Panel admin: dashboard, bookings, properties, leads, reviews, settings, analytics
    api/           # Route Handlers (e.g. admin/test-email)
    map-search/    # Página de búsqueda por mapa (Mapbox GL, sin layout público)
  components/
    ui/            # shadcn/ui + MagicUI (auto-generados, no modificar manualmente)
    admin/         # AdminSidebar, AdminTopbar, BookingsCalendar, BookingsChart, ZoneDonutChart, RealtimeBookings
    landing/       # HeroSection, SearchBar, FeaturedProperties, ZonesSection, StatsSection, AboutSection, PublishPropertyDialog
    property/      # PropertyCard, PropertyGallery, BookingWidget, ReviewsList, ReviewForm, PropertyFilters, AvailabilityCalendar, MapAccordion
    shared/        # Logo, SectionReveal
  lib/supabase/
    client.ts      # Browser client (usar en 'use client' components)
    server.ts      # Server client (usar en Server Components y Route Handlers)
    queries.ts     # Todas las queries reutilizables
  types/
    database.ts    # Tipos de Supabase (Property, Zone, Booking, Review)
```

### Páginas clave

- `/` — Landing con Hero (Particles + LightRays + AuroraText), FeaturedProperties, ZonesSection, StatsSection
- `/properties` — Filtros + paginación, con link a `/map-search`
- `/properties/[slug]` — Galería, BookingWidget, AvailabilityCalendar, MapAccordion, Reviews
- `/map-search` — Mapa Mapbox GL con dibujo de polígono (turf.js) para filtrar propiedades por zona; panel lateral responsivo (bottom sheet en mobile)
- `/admin` — Dashboard con KPIs, BookingsChart (Recharts), ZoneDonutChart, RealtimeBookings (Supabase Realtime)

### MagicUI components en uso

Ubicados en `src/components/ui/`: `light-rays`, `aurora-text`, `sparkles-text`, `animated-gradient-text`, `blur-fade`, `border-beam`, `magic-card`, `meteors`, `number-ticker`, `particles`, `shimmer-button`, `typing-animation`.

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
NEXT_PUBLIC_MAPBOX_TOKEN=   # Requerido para /map-search y MapAccordion
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

## Dependencias notables

- `mapbox-gl` + `@mapbox/mapbox-gl-draw` + `@turf/turf` — búsqueda por mapa con polígono
- `recharts` — gráficos en admin (BookingsChart, ZoneDonutChart)
- `yet-another-react-lightbox` — galería de imágenes en /properties/[slug]
- `react-day-picker` — calendario de disponibilidad
- `sonner` — toasts
- `motion` (alias de framer-motion v12) — animaciones; usar `from 'motion/react'`

## Implementación (estado actual)

Todo completado:
- Setup, design tokens, layout, landing con efectos MagicUI
- /properties (filtros + paginación) + /properties/[slug] (galería + booking + reviews)
- /map-search (Mapbox GL con polygon draw)
- Admin Panel completo (dashboard, bookings, properties, leads, reviews, analytics, settings)

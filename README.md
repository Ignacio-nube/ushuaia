# Fin del Mundo Stays

Plataforma de alquiler temporario en Ushuaia, Patagonia Argentina. Permite explorar propiedades, buscar por zona o fechas, reservar desde la web y gestionar todo desde un panel de administración.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Estilos | Tailwind CSS v4 + design system propio |
| Base de datos | Supabase (PostgreSQL + Auth + Realtime) |
| Componentes UI | shadcn/ui |
| Mapas | Mapbox GL JS v3 + react-map-gl + Mapbox Draw |
| Animaciones | Motion (Framer Motion) |
| Fechas | date-fns v4 + react-day-picker v9 |
| Gráficos | Recharts |

---

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Token de [Mapbox](https://mapbox.com)

---

## Instalación

```bash
git clone <repo>
cd ushuaia
npm install
```

Crear `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox-token>
```

```bash
npm run dev   # http://localhost:3000
```

---

## Comandos

```bash
npm run dev      # Servidor de desarrollo (Turbopack)
npm run build    # Build de producción
npm run lint     # ESLint
```

---

## Estructura

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Landing
│   │   └── properties/
│   │       ├── page.tsx                # Listado con filtros
│   │       └── [slug]/page.tsx         # Detalle de propiedad
│   ├── map-search/page.tsx             # Búsqueda dibujando en el mapa
│   └── admin/
│       ├── page.tsx                    # Dashboard con KPIs
│       ├── properties/                 # CRUD de propiedades
│       ├── bookings/                   # Gestión de reservas
│       ├── reviews/                    # Moderación de reseñas
│       ├── analytics/                  # Gráficos y métricas
│       ├── leads/                      # Leads entrantes
│       └── settings/                   # Configuración general
│
├── components/
│   ├── landing/        # HeroSection, SearchBar, ZonesSection, StatsSection
│   ├── property/       # PropertyCard, PropertyGrid, BookingWidget, MapAccordion
│   ├── admin/          # Sidebar, KPICard, BookingsChart, RealtimeBookings
│   ├── layout/         # Navbar, Footer
│   ├── shared/         # Logo, SectionReveal
│   └── ui/             # shadcn/ui + componentes animados (MagicCard, Meteors…)
│
├── lib/
│   └── supabase/
│       ├── client.ts   # Cliente para 'use client' components
│       ├── server.ts   # Cliente para Server Components y Route Handlers
│       └── queries.ts  # Todas las queries reutilizables
│
└── types/
    └── database.ts     # Tipos: Property, Zone, Booking, Review
```

---

## Base de datos

### Tablas

**`properties`** — propiedades disponibles para alquilar
- `id`, `title`, `slug`, `description`
- `price_per_night`, `currency`
- `bedrooms`, `bathrooms`, `max_guests`, `area_sqm`
- `zone`, `address`, `latitude`, `longitude`
- `amenities` (text[]), `images` (text[])
- `is_featured`, `is_available`, `rating`, `reviews_count`

**`zones`** — sectores geográficos de Ushuaia
- `id`, `name`, `slug`, `description`, `image_url`, `properties_count`

**`bookings`** — reservas realizadas
- `property_id`, `guest_name`, `guest_email`, `guest_phone`
- `check_in`, `check_out`, `guests_count`, `total_price`
- `status`: `pending` | `confirmed` | `cancelled`
- `message`

**`reviews`** — reseñas de huéspedes
- `property_id`, `booking_id` (opcional)
- `author_name`, `rating`, `comment`

---

## Funcionalidades

### Público
- **Landing** con hero, barra de búsqueda por fechas/huéspedes, propiedades destacadas, zonas y stats
- **Listado `/properties`** con filtros por zona, precio, capacidad y amenities; paginación
- **Detalle `/properties/[slug]`** con galería de fotos (lightbox), mapa 3D con terreno y efecto nieve, widget de reserva con calendario de disponibilidad
- **Búsqueda por mapa** en `/map-search`: dibujá un polígono sobre el mapa para filtrar propiedades en esa área

### Admin (`/admin`)
- Dashboard con KPIs: ingresos del mes, reservas pendientes, ocupación, reseñas
- Gráfico de reservas e ingresos (últimos 6 meses)
- Donut chart de reservas por zona
- Calendario mensual de reservas
- CRUD completo de propiedades (imágenes, amenities, coordenadas, precio)
- Gestión de reservas: confirmar, cancelar, ver detalles
- Moderación de reseñas: aprobar/rechazar
- Configuración: tarifa de servicio y otros parámetros globales

---

## Design System

El proyecto usa **siempre dark mode** (sin alternativa clara). Variables de color:

| Token | Hex | Uso |
|-------|-----|-----|
| `glacier` | `#0A1628` | Fondo principal |
| `deep-ice` | `#0D2137` | Cards y secciones |
| `arctic` | `#1A3A5C` | Hover states |
| `ice-mist` | `#2E6DA4` | Acentos secundarios |
| `frost` | `#7BB8D4` | Texto secundario |
| `snow` | `#E8F4F8` | Texto principal |
| `aurora` | `#4ECDC4` | CTA principal |
| `sunset` | `#FF6B6B` | Alertas / fechas reservadas |
| `gold` | `#F7C948` | Estrellas / ratings |

Tipografía:
- **Body**: DM Sans
- **Display**: Cormorant Garamond (`.font-display`)

Clases utilitarias custom: `.glass`, `.glass-hover`, `.aurora-border`, `.shadow-glacier`

---

## Mapas

Se usa **Mapbox GL JS v3** con:
- Terreno 3D (DEM raster)
- Efecto nieve (`setSnow`)
- Atmósfera y niebla (`setFog`)
- Dos estilos intercambiables: *Glaciar* (satélite) y *Relieve* (topográfico)
- En `/map-search`: dibujo libre de polígonos con `@mapbox/mapbox-gl-draw` + filtrado espacial con `@turf/turf`

---

## Precios

Los precios se muestran en **ARS** con formato argentino: `$150.000/noche`
La tarifa de servicio (por defecto 10%) es configurable desde el panel admin → Configuración.

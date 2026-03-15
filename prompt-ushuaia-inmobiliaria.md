# PROMPT MAESTRO — Plataforma de Alquiler Temporario Ushuaia
> Pasale este archivo completo a Claude Code como contexto inicial.

---

## 🎯 OVERVIEW DEL PROYECTO

Crear una plataforma web de **alquiler temporario en Ushuaia, Patagonia Argentina** — el fin del mundo.
Nombre sugerido: **"Fin del Mundo Stays"** (o podés cambiarlo).

**Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (DB + Auth + Storage)
- shadcn/ui (componentes base)
- Magic UI (efectos y animaciones)
- 21st Magic MCP (inspiración y generación de componentes)
- Framer Motion (animaciones)

---

## 🎨 DESIGN SYSTEM

### Identidad Visual
El sitio debe evocar **Ushuaia**: el Canal Beagle, glaciares azules, montañas nevadas, el cielo austral,
el frío limpio de la Patagonia. **Refinado, frío, premium** — no turístico kitsch.

### Paleta de Colores
```css
:root {
  /* Fríos principales */
  --color-glacier:     #0A1628;  /* Azul noche glaciar — fondo principal */
  --color-deep-ice:    #0D2137;  /* Azul profundo — cards/secciones */
  --color-arctic:      #1A3A5C;  /* Azul medio — hover states */
  --color-ice-mist:    #2E6DA4;  /* Azul claro — acentos */
  --color-frost:       #7BB8D4;  /* Celeste glaciar — secundario */
  --color-snow:        #E8F4F8;  /* Blanco hielo — texto principal */
  --color-pure-white:  #FFFFFF;  /* Blanco puro */

  /* Acentos cálidos (contrastes) */
  --color-aurora:      #4ECDC4;  /* Verde-azul aurora — CTA principal */
  --color-sunset:      #FF6B6B;  /* Coral atardecer patagónico — badges */
  --color-gold:        #F7C948;  /* Dorado — estrellas/ratings */

  /* Neutros */
  --color-glass:       rgba(255,255,255,0.06);
  --color-glass-hover: rgba(255,255,255,0.10);
  --color-border:      rgba(255,255,255,0.12);
}
```

### Tipografía
```css
/* Display: Cormorant Garamond — elegante, editorial, evoca exploración */
/* Body: DM Sans — legible, moderno, limpio */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

--font-display: 'Cormorant Garamond', Georgia, serif;
--font-body:    'DM Sans', system-ui, sans-serif;
```

### Efectos de Diseño
- Glassmorphism en cards: `backdrop-blur-md bg-white/5 border border-white/10`
- Grain texture sutil en el hero (overlay con SVG noise)
- Gradientes de fondo: de `#0A1628` a `#0D2137`
- Sombras azuladas: `shadow: 0 8px 32px rgba(10, 22, 40, 0.6)`
- Bordes con brillo suave: `border: 1px solid rgba(78, 205, 196, 0.2)`

---

## 🗄️ SUPABASE SCHEMA

Ejecutar en el SQL Editor de Supabase:

```sql
-- Propiedades
CREATE TABLE properties (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  price_per_night DECIMAL(10,2) NOT NULL,
  currency      TEXT DEFAULT 'ARS',
  bedrooms      INTEGER DEFAULT 1,
  bathrooms     INTEGER DEFAULT 1,
  max_guests    INTEGER DEFAULT 2,
  area_sqm      INTEGER,
  zone          TEXT NOT NULL,        -- barrio/zona de Ushuaia
  address       TEXT,
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  amenities     TEXT[],               -- array de amenities
  images        TEXT[],               -- array de URLs de Supabase Storage
  is_featured   BOOLEAN DEFAULT false,
  is_available  BOOLEAN DEFAULT true,
  rating        DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zonas de Ushuaia
CREATE TABLE zones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  properties_count INTEGER DEFAULT 0
);

-- Reservas
CREATE TABLE bookings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id   UUID REFERENCES properties(id) ON DELETE CASCADE,
  guest_name    TEXT NOT NULL,
  guest_email   TEXT NOT NULL,
  guest_phone   TEXT,
  check_in      DATE NOT NULL,
  check_out     DATE NOT NULL,
  guests_count  INTEGER DEFAULT 1,
  total_price   DECIMAL(10,2),
  status        TEXT DEFAULT 'pending', -- pending | confirmed | cancelled
  message       TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES bookings(id),
  author_name TEXT NOT NULL,
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_zone ON properties(zone);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);

-- Seed de zonas de Ushuaia
INSERT INTO zones (name, slug, description) VALUES
  ('Centro', 'centro', 'El corazón de Ushuaia, cerca del puerto y los servicios'),
  ('Canal Beagle', 'canal-beagle', 'Vistas privilegiadas al Canal Beagle y la Antártida'),
  ('Glaciar Martial', 'glaciar-martial', 'Zona alta con vistas panorámicas a las montañas'),
  ('Bahía Encerrada', 'bahia-encerrada', 'Barrio residencial tranquilo cerca del agua'),
  ('Las Hayas', 'las-hayas', 'Zona boscosa con cabañas entre los árboles');

-- RLS Policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Propiedades: lectura pública
CREATE POLICY "Public read properties" ON properties FOR SELECT USING (true);
-- Bookings: cualquiera puede insertar
CREATE POLICY "Anyone can book" ON bookings FOR INSERT WITH CHECK (true);
-- Reviews: lectura pública
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
/
├── app/
│   ├── layout.tsx                  # Root layout con fonts y providers
│   ├── page.tsx                    # Landing page principal
│   ├── properties/
│   │   ├── page.tsx                # Listado de propiedades con filtros
│   │   └── [slug]/
│   │       └── page.tsx            # Detalle de propiedad
│   ├── zones/
│   │   └── [slug]/
│   │       └── page.tsx            # Propiedades por zona
│   └── admin/
│       ├── layout.tsx              # Layout del panel admin
│       ├── page.tsx                # Dashboard con KPIs
│       ├── properties/
│       │   ├── page.tsx            # CRUD propiedades
│       │   └── [id]/page.tsx       # Editar propiedad
│       └── bookings/
│           └── page.tsx            # Gestión de reservas
│
├── components/
│   ├── ui/                         # shadcn components (auto-generados)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── landing/
│   │   ├── HeroSection.tsx         # Hero con buscador y video/imagen de fondo
│   │   ├── SearchBar.tsx           # Buscador (destino, fechas, huéspedes)
│   │   ├── FeaturedProperties.tsx  # Grid de propiedades destacadas
│   │   ├── ZonesSection.tsx        # Cards de zonas de Ushuaia
│   │   ├── StatsSection.tsx        # Números (propiedades, huéspedes, etc.)
│   │   └── AboutSection.tsx        # Sobre nosotros + CTA contacto
│   ├── property/
│   │   ├── PropertyCard.tsx        # Card en listados
│   │   ├── PropertyGallery.tsx     # Galería con lightbox
│   │   ├── PropertyDetails.tsx     # Info detallada
│   │   ├── BookingWidget.tsx       # Widget de reserva (fechas + precio)
│   │   └── ReviewsList.tsx         # Lista de reseñas
│   └── shared/
│       ├── DateRangePicker.tsx
│       ├── GuestSelector.tsx
│       └── AmenityBadge.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── queries.ts              # Todas las queries reutilizables
│   └── utils.ts
│
└── types/
    └── database.ts                 # Tipos generados de Supabase
```

---

## 📄 PÁGINAS A CONSTRUIR

### 1. Landing Page (`/`)

**Hero Section:**
- Fondo: imagen panorámica de Ushuaia + overlay gradiente oscuro + grain texture sutil
- Título display grande: *"Alquila en el Fin del Mundo"* en Cormorant Garamond
- Subtítulo: *"Cabañas y apartamentos en Ushuaia, Patagonia"*
- SearchBar flotante con glassmorphism: inputs para fechas (check-in/out) y cantidad de huéspedes
- Efecto de partículas o aurora austral usando **Magic UI** (componente `Particles` o `Aurora`)
- Animación de entrada con Framer Motion (staggered reveal)

**Featured Properties:**
- Título de sección + grid responsive (1 col mobile, 2 tablet, 3 desktop)
- PropertyCard con: imagen, zona badge, precio/noche, rating, habitaciones/baños/huéspedes
- Cards con glassmorphism y hover lift effect
- "Ver todas las propiedades" → `/properties`

**Zones Section:**
- Título: *"Explorá los barrios de Ushuaia"*
- Grid de 5 zonas con imagen de fondo, nombre y cantidad de propiedades
- Hover: overlay con descripción de la zona
- Usar **21st Magic MCP**: `/ui create a zone card with background image, overlay on hover, showing zone name and property count, dark theme`

**Stats Section (Magic UI):**
- Usar componente `NumberTicker` de Magic UI para animar: propiedades disponibles, huéspedes atendidos, años en el mercado, reseñas
- Fondo con gradiente azul profundo

**About + CTA:**
- Texto sobre la plataforma
- Formulario de contacto simple (nombre, email, mensaje) → guarda en Supabase o envía email
- CTA: *"Publicá tu propiedad"* → formulario de interés

---

### 2. Listado de Propiedades (`/properties`)

**Filtros (sidebar o top bar):**
- Zona (select o chips)
- Precio min/max (range slider)
- Huéspedes (stepper)
- Fechas disponibles (date range picker)
- Amenities (checkboxes: WiFi, estacionamiento, vista al canal, etc.)

**Grid de propiedades:**
- URL-driven params: `/properties?zone=centro&guests=2&checkin=2025-01-10&checkout=2025-01-15`
- Queries server-side a Supabase (no client-side filtering)
- Pagination con cursor
- Skeleton loaders mientras carga

---

### 3. Detalle de Propiedad (`/properties/[slug]`)

**Layout:**
- Galería de imágenes (grid 2 columnas + lightbox fullscreen)
- Título, zona, rating, cantidad de reseñas
- Descripción completa
- Grid de amenities con iconos
- Mapa de ubicación (leaflet o Google Maps embed)
- **BookingWidget** sticky en desktop (lateral derecho):
  - DateRangePicker
  - Selector de huéspedes
  - Cálculo de precio total
  - Botón "Reservar" → modal de confirmación → insert en `bookings`
- Sección de reviews con rating breakdown

---

### 4. Admin Panel (`/admin`)

**Dashboard:**
- KPI cards: reservas del mes, ingresos, propiedades activas, ocupación
- Gráfico de reservas por mes (recharts)
- Últimas reservas en tabla

**Gestión de Propiedades:**
- Tabla con todas las propiedades
- Acciones: activar/desactivar, editar, eliminar
- Form de creación/edición con upload de imágenes a Supabase Storage

**Gestión de Reservas:**
- Tabla con filtros por estado y fecha
- Acciones: confirmar, cancelar, ver detalle

---

## 🛠️ INSTRUCCIONES PARA LOS MCPs

### shadcn MCP
Instalá estos componentes base primero:
```bash
npx shadcn@latest init
npx shadcn@latest add button card input select badge calendar date-picker dialog sheet tabs
```

### Magic UI MCP
Usá estos componentes para efectos:
- `Particles` → fondo del Hero
- `NumberTicker` → Stats section
- `AnimatedGradientText` → tagline del hero
- `BlurFade` → reveal animado de secciones
- `BorderBeam` → highlight en el BookingWidget

### 21st Magic MCP
Usá `/ui` para generar estos componentes con el estilo del proyecto:
```
/ui dark glassmorphism property card with image, price per night, rating stars, 
zone badge, bedrooms/bathrooms/guests icons, hover lift effect, cold blue theme

/ui hero search bar with glassmorphism, check-in check-out date inputs and 
guests selector, frosted glass effect, aurora/northern lights color scheme

/ui zone/neighborhood card with full background image, dark overlay, 
city name in large serif font, property count badge, hover reveal effect
```

---

## ⚙️ VARIABLES DE ENTORNO

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN SUGERIDO

1. **Setup base**: Next.js + Tailwind + shadcn init + variables de entorno
2. **Supabase schema**: Ejecutar SQL + generar tipos TypeScript (`npx supabase gen types`)
3. **Design tokens**: `globals.css` con todas las variables CSS + fuentes
4. **Layout**: Navbar + Footer con el tema glaciar
5. **Landing Hero**: Imagen de fondo + SearchBar glassmorphism + Magic UI Particles
6. **PropertyCard**: Componente reutilizable (pedírselo al 21st Magic MCP)
7. **Featured Properties**: Grid con datos reales de Supabase
8. **Zones Section**: Cards de zonas (pedírselo al 21st Magic MCP)
9. **Stats + About**: Magic UI NumberTicker + formulario de contacto
10. **Página /properties**: Filtros + server-side queries + paginación
11. **Página /properties/[slug]**: Galería + BookingWidget + Reviews
12. **Admin Panel**: Dashboard + CRUD de propiedades + gestión de reservas

---

## 💡 NOTAS IMPORTANTES

- **Todo dark theme** — no hay modo claro. El sitio es siempre oscuro.
- Los precios deben mostrarse en **pesos argentinos (ARS)** con formato: `$150.000/noche`
- El buscador de la landing debe redirigir a `/properties` con los params en la URL
- Las imágenes de propiedades van a **Supabase Storage**, bucket público llamado `property-images`
- Para las imágenes del hero/zonas podés usar fotos reales de Ushuaia de Unsplash
  - Keywords: `ushuaia`, `beagle channel`, `patagonia`, `tierra del fuego`, `ushuaia mountains`
- El panel admin NO necesita autenticación por ahora (se puede agregar después con Supabase Auth)

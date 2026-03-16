import { notFound } from "next/navigation"
import {
  MapPin, Bed, Bath, Users, Ruler, Star,
  Wifi, Waves, Flame, Car, ChefHat, Heater, Tv, Wind,
  Coffee, Sparkles, Dumbbell, Dog, Mountain, TreePine,
  Bath as BathIcon, Zap,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { NumberTicker } from "@/components/ui/number-ticker"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { createClient } from "@/lib/supabase/server"
import { getPropertyBySlug, getReviewsByProperty, getBookingDatesForProperty, getServiceFeePercent } from "@/lib/supabase/queries"
import PropertyGallery from "@/components/property/PropertyGallery"
import BookingWidget from "@/components/property/BookingWidget"
import AvailabilityCalendar from "@/components/property/AvailabilityCalendar"
import ReviewsList from "@/components/property/ReviewsList"
import ReviewForm from "@/components/property/ReviewForm"
import { MapAccordion } from "@/components/property/MapAccordion"
import type { Review } from "@/types/database"

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "WiFi":               <Wifi className="size-4" />,
  "Jacuzzi":            <Waves className="size-4" />,
  "Parrilla":           <Flame className="size-4" />,
  "Estacionamiento":    <Car className="size-4" />,
  "Cocina equipada":    <ChefHat className="size-4" />,
  "Calefacción":        <Heater className="size-4" />,
  "Smart TV":           <Tv className="size-4" />,
  "Aire acondicionado": <Wind className="size-4" />,
  "Cafetera":           <Coffee className="size-4" />,
  "Chimenea":           <Sparkles className="size-4" />,
  "Gimnasio":           <Dumbbell className="size-4" />,
  "Acepta mascotas":    <Dog className="size-4" />,
  "Vista a la montaña": <Mountain className="size-4" />,
  "Vista al bosque":    <TreePine className="size-4" />,
  "Bañera":             <BathIcon className="size-4" />,
  "default":            <Zap className="size-4" />,
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { property } = await getPropertyBySlug(supabase, slug)
  if (!property) notFound()

  const [reviews, bookedRanges, serviceFeePercent] = await Promise.all([
    getReviewsByProperty(supabase, property.id),
    getBookingDatesForProperty(supabase, property.id),
    getServiceFeePercent(supabase),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-glacier to-deep-ice pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <BlurFade delay={0} inView>
          <div className="flex items-center gap-2 text-xs text-frost/50 mb-6">
            <a href="/properties" className="hover:text-aurora transition-colors">Propiedades</a>
            <span>/</span>
            <span className="text-frost/80">{property.title}</span>
          </div>
        </BlurFade>

        {/* Galería */}
        <BlurFade delay={0.05} inView>
          <PropertyGallery images={property.images ?? []} title={property.title} />
        </BlurFade>

        {/* Layout: info + widget */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Columna izquierda — info */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Header */}
            <BlurFade delay={0.1} inView>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-frost/60">
                  <MapPin className="size-4 text-aurora" />
                  <span className="capitalize">{property.zone.replace(/-/g, " ")}</span>
                  {property.address && <span>· {property.address}</span>}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl text-snow leading-tight">
                  {property.title}
                </h1>

                <div className="flex items-center gap-3 flex-wrap">
                  {property.rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="size-4 fill-gold text-gold" />
                      <span className="text-snow font-medium">
                        <NumberTicker value={property.rating} decimalPlaces={1} />
                      </span>
                      <span className="text-frost/60 text-sm">({property.reviews_count} reseñas)</span>
                    </div>
                  )}
                  {property.is_featured && (
                    <AnimatedGradientText className="text-xs px-3 py-1 rounded-full font-medium">
                      ✦ Destacado
                    </AnimatedGradientText>
                  )}
                </div>
              </div>
            </BlurFade>

            {/* Stats rápidos */}
            <BlurFade delay={0.15} inView>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: <Bed className="size-5" />, value: property.bedrooms, label: "Habitaciones" },
                  { icon: <Bath className="size-5" />, value: property.bathrooms, label: "Baños" },
                  { icon: <Users className="size-5" />, value: property.max_guests, label: "Huéspedes" },
                  ...(property.area_sqm
                    ? [{ icon: <Ruler className="size-5" />, value: property.area_sqm, label: "m²" }]
                    : []),
                ].map(({ icon, value, label }) => (
                  <MagicCard
                    key={label}
                    className="rounded-xl p-4 flex flex-col gap-1 items-center text-center cursor-default"
                    gradientColor="#4ECDC430"
                  >
                    <span className="text-aurora">{icon}</span>
                    <span className="text-snow font-medium text-lg">
                      <NumberTicker value={value} />
                    </span>
                    <span className="text-frost/60 text-xs">{label}</span>
                  </MagicCard>
                ))}
              </div>
            </BlurFade>

            <Separator className="bg-white/10" />

            {/* Descripción */}
            {property.description && (
              <BlurFade delay={0.2} inView>
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-2xl text-snow">Sobre esta propiedad</h2>
                  <p className="text-frost/80 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              </BlurFade>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator className="bg-white/10" />
                <BlurFade delay={0.25} inView>
                  <div className="flex flex-col gap-4">
                    <h2 className="font-display text-2xl text-snow">Comodidades</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {property.amenities.map((amenity) => (
                        <MagicCard
                          key={amenity}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-default"
                          gradientColor="#4ECDC420"
                        >
                          <span className="text-aurora">
                            {AMENITY_ICONS[amenity] ?? AMENITY_ICONS["default"]}
                          </span>
                          <span className="text-frost/80">{amenity}</span>
                        </MagicCard>
                      ))}
                    </div>
                  </div>
                </BlurFade>
              </>
            )}

            {/* Disponibilidad */}
            <Separator className="bg-white/10" />
            <BlurFade delay={0.28} inView>
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-2xl text-snow">Disponibilidad</h2>
                <AvailabilityCalendar bookedRanges={bookedRanges} />
              </div>
            </BlurFade>

            {/* Ubicación */}
            {property.latitude && property.longitude && (
              <>
                <Separator className="bg-white/10" />
                <BlurFade delay={0.3} inView>
                  <div className="flex flex-col gap-4">
                    <h2 className="font-display text-2xl text-snow">Ubicación</h2>
                    <MapAccordion
                      latitude={property.latitude}
                      longitude={property.longitude}
                      title={property.title}
                      zone={property.zone}
                      address={property.address ?? undefined}
                    />
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "#7BB8D4" }}>
                      <MapPin className="size-3 shrink-0" />
                      La ubicación exacta se comparte al confirmar la reserva.
                    </p>
                  </div>
                </BlurFade>
              </>
            )}

            <Separator className="bg-white/10" />

            {/* Reviews */}
            <BlurFade delay={0.35} inView>
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-2xl text-snow">Reseñas</h2>
                <ReviewsList
                  reviews={reviews as Review[]}
                  rating={property.rating}
                  count={property.reviews_count}
                />
                <ReviewForm propertyId={property.id} />
              </div>
            </BlurFade>
          </div>

          {/* Columna derecha — booking widget sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BlurFade delay={0.2} inView>
                <BookingWidget property={property} bookedRanges={bookedRanges} serviceFeePercent={serviceFeePercent} />
              </BlurFade>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

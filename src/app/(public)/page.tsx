import HeroSection from "@/components/landing/HeroSection"
import FeaturedProperties from "@/components/landing/FeaturedProperties"
import ZonesSection from "@/components/landing/ZonesSection"
import StatsSection from "@/components/landing/StatsSection"
import AboutSection from "@/components/landing/AboutSection"

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProperties />
      <ZonesSection />
      <StatsSection />
      <AboutSection />
    </>
  )
}

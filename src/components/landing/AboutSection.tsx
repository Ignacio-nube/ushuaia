"use client"

import { useState } from "react"
import { Send, CheckCircle, ShieldCheck, MapPin, Star } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { SectionReveal } from "@/components/shared/SectionReveal"
import { LightRays } from "@/components/ui/light-rays"
import { SparklesText } from "@/components/ui/sparkles-text"
import PublishPropertyDialog from "@/components/landing/PublishPropertyDialog"

const features = [
  { icon: <ShieldCheck className="size-4 text-aurora shrink-0 mt-0.5" />, text: "Propiedades verificadas y seleccionadas manualmente por nuestro equipo." },
  { icon: <MapPin className="size-4 text-aurora shrink-0 mt-0.5" />, text: "Las 5 mejores zonas de Ushuaia, desde el centro histórico hasta los bosques." },
  { icon: <Star className="size-4 text-aurora shrink-0 mt-0.5" />, text: "Más de 1.200 huéspedes satisfechos con 98% de valoraciones positivas." },
]

const inputCls = `
  w-full rounded-[10px] text-snow text-sm outline-none transition-all duration-200
  placeholder:text-frost/30
`

// Usa propiedades separadas (sin shorthand `border`) para evitar conflicto con borderColor en focus
const baseInputStyle = {
  background: "rgba(255,255,255,0.04)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(255,255,255,0.1)",
  padding: "14px 16px",
  color: "#E8F4F8",
}

export default function AboutSection() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)

  const inputStyle = (name: string) =>
    focused === name
      ? { ...baseInputStyle, borderColor: "rgba(78,205,196,0.6)", boxShadow: "0 0 0 3px rgba(78,205,196,0.1)" }
      : baseInputStyle

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <section
      id="about"
      className="relative overflow-hidden"
      style={{ padding: "clamp(60px, 8vw, 120px) 0", background: "#0A1628" }}
    >
      <LightRays count={4} color="rgba(160,210,255,0.12)" blur={52} speed={24} length="60vh" />
      <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1200px", padding: "0 24px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Columna texto ── */}
          <SectionReveal className="flex flex-col gap-7">
            <div>
              <span
                className="font-sans font-medium uppercase text-aurora"
                style={{ fontSize: "11px", letterSpacing: "3px" }}
              >
                Sobre nosotros
              </span>
              <h2
                className="font-display font-light text-snow mt-3 leading-tight"
                style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.5px" }}
              >
                <SparklesText
                  className="font-display font-light"
                  sparklesCount={6}
                  colors={{ first: "#4ECDC4", second: "#7BB8D4" }}
                >
                  La plataforma de alquileres del fin del mundo
                </SparklesText>
              </h2>
            </div>

            <p className="text-frost/65" style={{ fontSize: "15px", lineHeight: 1.7 }}>
              Somos el primer marketplace especializado en alquileres temporarios en Ushuaia,
              la ciudad más austral del planeta. Conectamos viajeros con propiedades únicas
              en el corazón de la Patagonia argentina.
            </p>

            {/* Features con bullets lucide */}
            <ul className="flex flex-col gap-4">
              {features.map(({ icon, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  {icon}
                  <span className="text-frost/70 text-sm leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTA propietarios — border-left acento */}
            <div
              className="rounded-r-2xl p-6 flex flex-col gap-3"
              style={{
                background: "rgba(78,205,196,0.05)",
                borderLeft: "3px solid #4ECDC4",
              }}
            >
              <h3 className="text-snow font-medium">¿Tenés una propiedad en Ushuaia?</h3>
              <p className="text-frost/65 text-sm leading-relaxed">
                Publicá tu alojamiento y llegá a miles de turistas que visitan el fin del mundo cada año.
              </p>
              <ShimmerButton
                onClick={() => setPublishOpen(true)}
                shimmerColor="#4ECDC4"
                background="linear-gradient(135deg, #4ECDC4, #2E6DA4)"
                borderRadius="8px"
                className="mt-1 px-5 py-2 text-sm font-medium text-[#0A1628]"
              >
                Publicá tu propiedad →
              </ShimmerButton>
              <PublishPropertyDialog open={publishOpen} onClose={() => setPublishOpen(false)} />
            </div>
          </SectionReveal>

          {/* ── Formulario ── */}
          <SectionReveal>
            <div
              id="contact"
              className="relative rounded-2xl p-8 overflow-hidden"
              style={{
                background: "rgba(13,33,55,0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 40px rgba(10,22,40,0.5)",
              }}
            >
              <BorderBeam size={200} duration={10} colorFrom="#4ECDC4" colorTo="#2E6DA4" />

              <h3
                className="font-display font-light text-snow mb-7"
                style={{ fontSize: "28px" }}
              >
                Escribinos
              </h3>

              {sent ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <CheckCircle className="size-14 text-aurora" />
                  <p className="text-snow font-medium text-lg">¡Mensaje enviado!</p>
                  <p className="text-frost/60 text-sm">Te respondemos en menos de 24 horas.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {[
                    { name: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre completo" },
                    { name: "email",  label: "Email",  type: "email", placeholder: "tu@email.com" },
                  ].map(({ name, label, type, placeholder }) => (
                    <div key={name} className="flex flex-col gap-1.5">
                      <label
                        className="font-sans font-medium uppercase text-frost/60"
                        style={{ fontSize: "11px", letterSpacing: "2px" }}
                      >
                        {label}
                      </label>
                      <input
                        required
                        type={type}
                        placeholder={placeholder}
                        className={inputCls}
                        style={inputStyle(name)}
                        onFocus={() => setFocused(name)}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-sans font-medium uppercase text-frost/60"
                      style={{ fontSize: "11px", letterSpacing: "2px" }}
                    >
                      Mensaje
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="¿En qué podemos ayudarte?"
                      className={inputCls + " resize-none"}
                      style={inputStyle("mensaje")}
                      onFocus={() => setFocused("mensaje")}
                      onBlur={() => setFocused(null)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-[10px] font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
                    style={{
                      background: "linear-gradient(135deg, #4ECDC4, #2E6DA4)",
                      color: "#0A1628",
                      padding: "14px 16px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="size-4 border-2 border-glacier/30 border-t-glacier rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Enviar mensaje →
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}

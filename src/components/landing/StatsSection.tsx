"use client"

import { NumberTicker } from "@/components/ui/number-ticker"
import { SectionReveal } from "@/components/shared/SectionReveal"

const stats = [
  { value: 40,   suffix: "+", label: "Propiedades" },
  { value: 1200, suffix: "+", label: "Huéspedes atendidos" },
  { value: 8,    suffix: "",  label: "Años en el mercado" },
  { value: 98,   suffix: "%", label: "Satisfacción" },
]

export default function StatsSection() {
  return (
    <section
      style={{
        padding: "clamp(60px, 8vw, 120px) 0",
        background: "radial-gradient(ellipse at center, #0D2137 0%, #0A1628 70%)",
        borderTop:    "1px solid rgba(78,205,196,0.2)",
        borderBottom: "1px solid rgba(78,205,196,0.2)",
      }}
    >
      <SectionReveal>
        <div className="mx-auto" style={{ maxWidth: "1200px", padding: "0 24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map(({ value, suffix, label }, i) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 text-center py-6 px-4"
                style={
                  i < stats.length - 1
                    ? { borderRight: "1px solid rgba(255,255,255,0.08)" }
                    : {}
                }
              >
                {/* Número con gradiente de texto */}
                <div
                  className="inline-flex items-baseline whitespace-nowrap font-display font-light leading-none tabular-nums"
                  style={{
                    fontSize: "clamp(48px, 6vw, 80px)",
                    background: "linear-gradient(135deg, #4ECDC4, #7BB8D4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    minHeight: "1em",
                  }}
                >
                  <NumberTicker value={value} />
                  {suffix && <span>{suffix}</span>}
                </div>

                {/* Label */}
                <p
                  className="font-sans font-medium uppercase text-frost/55"
                  style={{ fontSize: "11px", letterSpacing: "2px", lineHeight: 1.4 }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}

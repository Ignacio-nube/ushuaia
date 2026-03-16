"use client"

import { useState } from "react"
import { Home } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

const ZONES = [
  { value: "centro",          label: "Centro" },
  { value: "canal-beagle",    label: "Canal Beagle" },
  { value: "glaciar-martial", label: "Glaciar Martial" },
  { value: "bahia-encerrada", label: "Bahía Encerrada" },
  { value: "las-hayas",       label: "Las Hayas" },
]

interface PublishPropertyDialogProps {
  open: boolean
  onClose: () => void
}

const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#E8F4F8",
}

export default function PublishPropertyDialog({ open, onClose }: PublishPropertyDialogProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [ownerName, setOwnerName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [propertyName, setPropertyName] = useState("")
  const [zone, setZone] = useState("")
  const [bedrooms, setBedrooms] = useState(1)
  const [description, setDescription] = useState("")

  function reset() {
    setStep(1)
    setOwnerName(""); setOwnerEmail(""); setOwnerPhone("")
    setPropertyName(""); setZone(""); setBedrooms(1); setDescription("")
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("property_leads") as any).insert({
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_phone: ownerPhone || null,
      property_name: propertyName || null,
      zone: zone || null,
      bedrooms,
      description: description || null,
      status: "new",
    })
    setLoading(false)
    if (error) {
      toast.error("Hubo un error. Intentá de nuevo.")
    } else {
      toast.success("¡Consulta enviada! Te contactamos en menos de 24hs.", { duration: 5000 })
      handleClose()
    }
  }

  const step1Valid = ownerName.trim() !== "" && ownerEmail.trim() !== ""
  const step2Valid = true // todo opcional en paso 2

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        style={{
          background: "#0D2137",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <DialogTitle className="sr-only">Publicá tu propiedad</DialogTitle>

        <div className="p-6">
          {/* Progress bar */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{ background: s <= step ? "#4ECDC4" : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>

          {/* Paso 1 — Datos personales */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display italic text-2xl" style={{ color: "#E8F4F8" }}>
                  Tus datos de contacto
                </h2>
                <p className="text-sm mt-1" style={{ color: "#7BB8D4" }}>
                  Para ponernos en contacto con vos.
                </p>
              </div>
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nombre completo *"
                className={inputCls}
                style={inputStyle}
              />
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="Email *"
                className={inputCls}
                style={inputStyle}
              />
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Teléfono (opcional)"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          )}

          {/* Paso 2 — Sobre la propiedad */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display italic text-2xl" style={{ color: "#E8F4F8" }}>
                  Tu propiedad
                </h2>
                <p className="text-sm mt-1" style={{ color: "#7BB8D4" }}>
                  Contanos sobre el alojamiento.
                </p>
              </div>
              <input
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="Nombre de la propiedad (opcional)"
                className={inputCls}
                style={inputStyle}
              />
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className={inputCls}
                style={{ ...inputStyle, appearance: "none" }}
              >
                <option value="" style={{ background: "#0D2137" }}>Zona de Ushuaia (opcional)</option>
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value} style={{ background: "#0D2137" }}>{z.label}</option>
                ))}
              </select>

              {/* Stepper habitaciones */}
              <div>
                <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Habitaciones
                </label>
                <div
                  className="flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <button
                    onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                    className="size-7 rounded-full text-sm flex items-center justify-center transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#E8F4F8" }}
                  >−</button>
                  <span className="flex-1 text-center text-sm" style={{ color: "#E8F4F8" }}>
                    {bedrooms} habitación{bedrooms !== 1 ? "es" : ""}
                  </span>
                  <button
                    onClick={() => setBedrooms(bedrooms + 1)}
                    className="size-7 rounded-full text-sm flex items-center justify-center transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#E8F4F8" }}
                  >+</button>
                </div>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción breve de la propiedad (opcional)"
                rows={3}
                className={inputCls + " resize-none"}
                style={inputStyle}
              />
            </div>
          )}

          {/* Paso 3 — Confirmación */}
          {step === 3 && (
            <div className="flex flex-col gap-5 text-center">
              <div
                className="size-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(78,205,196,0.15)" }}
              >
                <Home className="size-8" style={{ color: "#4ECDC4" }} />
              </div>
              <div>
                <h2 className="font-display italic text-2xl" style={{ color: "#E8F4F8" }}>¡Todo listo!</h2>
                <p className="text-sm mt-2" style={{ color: "#7BB8D4" }}>
                  Revisá tus datos y envianos la consulta.<br />
                  Nos pondremos en contacto en menos de 24 horas.
                </p>
              </div>

              {/* Resumen */}
              <div
                className="rounded-xl p-4 text-left flex flex-col gap-2 text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {[
                  { label: "Nombre", value: ownerName },
                  { label: "Email", value: ownerEmail },
                  ...(ownerPhone ? [{ label: "Teléfono", value: ownerPhone }] : []),
                  ...(propertyName ? [{ label: "Propiedad", value: propertyName }] : []),
                  ...(zone ? [{ label: "Zona", value: ZONES.find((z) => z.value === zone)?.label ?? zone }] : []),
                  { label: "Habitaciones", value: `${bedrooms}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                    <span style={{ color: "#E8F4F8" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 rounded-xl text-sm transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#7BB8D4" }}
              >
                ← Atrás
              </button>
            )}
            <button
              onClick={step < 3 ? () => setStep((s) => s + 1) : handleSubmit}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid) || loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #4ECDC4, #2E6DA4)",
                color: "#0A1628",
              }}
            >
              {step < 3 ? "Continuar →" : loading ? "Enviando..." : "Enviar consulta"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

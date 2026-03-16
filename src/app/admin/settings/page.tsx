"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type Settings = Record<string, string>

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "8px" }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 items-start">
      <div>
        <label className="text-sm font-medium text-white">{label}</label>
        {description && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{description}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  )
}

function Input({ value, onChange, type = "text", placeholder, disabled }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors disabled:opacity-50"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(78,205,196,0.5)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors resize-none"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(78,205,196,0.5)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  )
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <p className="text-sm text-white">{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
        style={{ background: checked ? "#4ECDC4" : "rgba(255,255,255,0.15)" }}
      >
        <span
          className="inline-block size-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  )
}

const TABS = ["Plataforma", "Precios", "Notificaciones", "Cuenta"] as const
type Tab = (typeof TABS)[number]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Plataforma")
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" })
  const [pwSaving, setPwSaving] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from("settings") as any).select("key, value").then(({ data }: { data: { key: string; value: string }[] }) => {
      const map: Settings = {}
      for (const row of data ?? []) map[row.key] = row.value
      setSettings(map)
      setLoading(false)
    })
  }, [])

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function changePassword() {
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    if (passwords.newPass.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setPwSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwords.newPass })
    setPwSaving(false)
    if (error) {
      toast.error("Error al cambiar contraseña: " + error.message)
    } else {
      toast.success("Contraseña actualizada")
      setPasswords({ current: "", newPass: "", confirm: "" })
    }
  }

  async function sendTestEmail() {
    if (!settings.admin_email) {
      toast.error("Configurá el email del admin primero")
      return
    }
    setSendingTestEmail(true)
    const res = await fetch("/api/admin/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: settings.admin_email }),
    })
    setSendingTestEmail(false)
    if (res.ok) {
      toast.success(`Email de prueba enviado a ${settings.admin_email}`)
    } else {
      toast.error("Error al enviar el email de prueba")
    }
  }

  async function save(keys: string[]) {
    setSaving(true)
    const supabase = createClient()
    const updates = keys.map((key) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("settings") as any)
        .upsert({ key, value: settings[key] ?? "", updated_at: new Date().toISOString() })
    )
    const results = await Promise.all(updates)
    setSaving(false)
    if (results.some((r) => r.error)) {
      toast.error("Error al guardar")
    } else {
      toast.success("Cambios guardados")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
    )
  }

  const s = settings

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-white">Ajustes</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Configuración de la plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", width: "fit-content" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm transition-all duration-150"
            style={{
              background: activeTab === tab ? "#0D2137" : "transparent",
              color: activeTab === tab ? "#4ECDC4" : "rgba(255,255,255,0.5)",
              border: activeTab === tab ? "1px solid rgba(78,205,196,0.2)" : "1px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="rounded-2xl p-8 flex flex-col gap-6" style={{ background: "#0D2137", border: "1px solid rgba(255,255,255,0.07)" }}>
        {activeTab === "Plataforma" && (
          <>
            <Section title="Información general">
              <Field label="Nombre del sitio">
                <Input value={s.site_name ?? ""} onChange={(v) => set("site_name", v)} placeholder="Fin del Mundo Stays" />
              </Field>
              <Field label="Descripción">
                <Textarea value={s.site_description ?? ""} onChange={(v) => set("site_description", v)} placeholder="Descripción breve del sitio" />
              </Field>
            </Section>
            <Section title="Contacto">
              <Field label="Email de contacto">
                <Input value={s.contact_email ?? ""} onChange={(v) => set("contact_email", v)} type="email" placeholder="hola@..." />
              </Field>
              <Field label="Teléfono">
                <Input value={s.contact_phone ?? ""} onChange={(v) => set("contact_phone", v)} placeholder="+54 2901..." />
              </Field>
            </Section>
            <Section title="Redes sociales">
              <Field label="Instagram">
                <Input value={s.instagram_url ?? ""} onChange={(v) => set("instagram_url", v)} placeholder="https://instagram.com/..." />
              </Field>
              <Field label="Facebook">
                <Input value={s.facebook_url ?? ""} onChange={(v) => set("facebook_url", v)} placeholder="https://facebook.com/..." />
              </Field>
            </Section>
            <SaveButton saving={saving} onClick={() => save(["site_name", "site_description", "contact_email", "contact_phone", "instagram_url", "facebook_url"])} />
          </>
        )}

        {activeTab === "Precios" && (
          <>
            <Section title="Configuración de precios">
              <Field label="Moneda" description="Moneda principal del sitio">
                <select
                  value={s.currency ?? "ARS"}
                  onChange={(e) => set("currency", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <option value="ARS">ARS — Peso argentino</option>
                  <option value="USD">USD — Dólar estadounidense</option>
                </select>
              </Field>
              <Field label="Tarifa de servicio %" description="Porcentaje que se agrega al precio base">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={Number(s.service_fee_percent ?? 10)}
                    onChange={(e) => set("service_fee_percent", e.target.value)}
                    className="flex-1 accent-[#4ECDC4]"
                  />
                  <span className="text-white font-medium w-10 text-right">{s.service_fee_percent ?? 10}%</span>
                </div>
              </Field>
              <Field label="Mínimo de noches">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => set("min_nights", String(Math.max(1, Number(s.min_nights ?? 2) - 1)))}
                    className="size-8 rounded-lg flex items-center justify-center text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >−</button>
                  <span className="text-white font-medium w-8 text-center">{s.min_nights ?? 2}</span>
                  <button
                    onClick={() => set("min_nights", String(Number(s.min_nights ?? 2) + 1))}
                    className="size-8 rounded-lg flex items-center justify-center text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >+</button>
                </div>
              </Field>
              <Field label="Check-in" description="Hora mínima de entrada">
                <Input value={s.checkin_time ?? "14:00"} onChange={(v) => set("checkin_time", v)} type="time" />
              </Field>
              <Field label="Check-out" description="Hora máxima de salida">
                <Input value={s.checkout_time ?? "11:00"} onChange={(v) => set("checkout_time", v)} type="time" />
              </Field>
              <Field label="Política de cancelación">
                <Textarea value={s.cancellation_policy ?? ""} onChange={(v) => set("cancellation_policy", v)} rows={4} />
              </Field>
            </Section>
            <SaveButton saving={saving} onClick={() => save(["currency", "service_fee_percent", "min_nights", "checkin_time", "checkout_time", "cancellation_policy"])} />
          </>
        )}

        {activeTab === "Notificaciones" && (
          <>
            <Section title="Email del admin">
              <Field label="Recibir notificaciones en">
                <Input value={s.admin_email ?? ""} onChange={(v) => set("admin_email", v)} type="email" placeholder="admin@..." />
              </Field>
            </Section>
            <Section title="Notificaciones automáticas">
              <Toggle
                checked={s.notify_admin_new_booking === "true"}
                onChange={(v) => set("notify_admin_new_booking", String(v))}
                label="Nueva reserva al admin"
                description="Recibir email cuando un huésped haga una nueva reserva"
              />
              <Toggle
                checked={s.notify_guest_confirmation === "true"}
                onChange={(v) => set("notify_guest_confirmation", String(v))}
                label="Confirmación al huésped"
                description="Enviar email de confirmación al huésped al confirmar su reserva"
              />
              <Toggle
                checked={s.notify_reminder_checkin === "true"}
                onChange={(v) => set("notify_reminder_checkin", String(v))}
                label="Recordatorio 24hs antes"
                description="Enviar recordatorio al huésped un día antes del check-in"
              />
              <Toggle
                checked={s.notify_weekly_summary === "true"}
                onChange={(v) => set("notify_weekly_summary", String(v))}
                label="Resumen semanal"
                description="Recibir resumen de reservas e ingresos cada lunes"
              />
              <Toggle
                checked={s.notify_new_reviews === "true"}
                onChange={(v) => set("notify_new_reviews", String(v))}
                label="Alertas de reseñas"
                description="Notificar cuando se publique una nueva reseña"
              />
            </Section>
            <div className="flex items-center gap-4">
              <SaveButton saving={saving} onClick={() => save(["admin_email", "notify_admin_new_booking", "notify_guest_confirmation", "notify_reminder_checkin", "notify_weekly_summary", "notify_new_reviews"])} />
              <button
                onClick={sendTestEmail}
                disabled={sendingTestEmail}
                className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {sendingTestEmail ? "Enviando..." : "Enviar email de prueba"}
              </button>
            </div>
          </>
        )}

        {activeTab === "Cuenta" && (
          <>
            <Section title="Perfil">
              <Field label="Nombre">
                <Input value={s.admin_name ?? ""} onChange={(v) => set("admin_name", v)} placeholder="Tu nombre" />
              </Field>
              <Field label="Email" description="Usada para el login">
                <Input value={s.admin_email ?? ""} onChange={(v) => set("admin_email", v)} type="email" disabled />
              </Field>
              <Field label="Zona horaria">
                <select
                  value={s.timezone ?? "America/Argentina/Ushuaia"}
                  onChange={(e) => set("timezone", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <option value="America/Argentina/Ushuaia">America/Argentina/Ushuaia (UTC-3)</option>
                  <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires (UTC-3)</option>
                  <option value="UTC">UTC</option>
                </select>
              </Field>
            </Section>
            <Section title="Contraseña">
              <Field label="Contraseña actual" description="Solo se usa como recordatorio">
                <Input value={passwords.current} onChange={(v) => setPasswords((p) => ({ ...p, current: v }))} type="password" placeholder="••••••••" />
              </Field>
              <Field label="Nueva contraseña">
                <Input value={passwords.newPass} onChange={(v) => setPasswords((p) => ({ ...p, newPass: v }))} type="password" placeholder="••••••••" />
              </Field>
              <Field label="Confirmar contraseña">
                <Input value={passwords.confirm} onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))} type="password" placeholder="••••••••" />
              </Field>
              <div className="flex justify-end pt-2">
                <button
                  onClick={changePassword}
                  disabled={pwSaving || !passwords.newPass}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ background: "rgba(78,205,196,0.15)", color: "#4ECDC4", border: "1px solid rgba(78,205,196,0.3)" }}
                >
                  {pwSaving ? "Cambiando..." : "Cambiar contraseña"}
                </button>
              </div>
            </Section>
            <SaveButton saving={saving} onClick={() => save(["admin_name", "timezone"])} />
          </>
        )}
      </div>
    </div>
  )
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <button
        onClick={onClick}
        disabled={saving}
        className="px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-60"
        style={{ background: "#4ECDC4", color: "#0A1628" }}
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  )
}

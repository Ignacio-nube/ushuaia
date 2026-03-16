import Link from "next/link"
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react"
import { Logo } from "@/components/shared/Logo"


const propertyLinks = [
  { href: "/properties?zone=centro",          label: "Centro" },
  { href: "/properties?zone=canal-beagle",     label: "Canal Beagle" },
  { href: "/properties?zone=glaciar-martial",  label: "Glaciar Martial" },
  { href: "/properties?zone=bahia-encerrada",  label: "Bahía Encerrada" },
  { href: "/properties?zone=las-hayas",        label: "Las Hayas" },
]

const infoLinks = [
  { href: "/#about",   label: "Sobre nosotros" },
  { href: "/#contact", label: "Contacto" },
  { href: "/admin",    label: "Panel Admin" },
]

export default function Footer() {
  return (
    <footer style={{ background: "#0D2137" }}>
      {/* Separador superior con gradiente aurora */}
      <div
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, #4ECDC4, transparent)",
        }}
      />

      <div className="mx-auto px-6" style={{ maxWidth: "1200px", padding: "80px 24px 48px" }}>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-5">
            <Logo width={140} height={32} href="/" />

            <p className="text-frost/55 leading-relaxed max-w-xs" style={{ fontSize: "14px" }}>
              Alquileres temporarios premium en Ushuaia, la ciudad más austral del mundo.
            </p>

            <div className="flex gap-2 mt-1">
              {[
                { href: "#", label: "Instagram", icon: <Instagram className="size-4" /> },
                { href: "#", label: "Facebook",  icon: <Facebook className="size-4" /> },
              ].map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="size-9 rounded-full flex items-center justify-center text-frost/50 hover:text-aurora transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Zonas */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-sans font-medium uppercase text-snow/70"
              style={{ fontSize: "11px", letterSpacing: "3px" }}
            >
              Zonas
            </h3>
            <ul className="flex flex-col gap-2">
              {propertyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-frost/55 hover:text-aurora hover:pl-1 transition-all duration-200 text-sm block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-sans font-medium uppercase text-snow/70"
              style={{ fontSize: "11px", letterSpacing: "3px" }}
            >
              Información
            </h3>
            <ul className="flex flex-col gap-2">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-frost/55 hover:text-aurora hover:pl-1 transition-all duration-200 text-sm block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-sans font-medium uppercase text-snow/70"
              style={{ fontSize: "11px", letterSpacing: "3px" }}
            >
              Contacto
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { icon: <Mail className="size-3.5 text-aurora shrink-0" />, text: "nacho.marquez45@gmail.com" },
                { icon: <Phone className="size-3.5 text-aurora shrink-0" />, text: "+54 381 401 2380" },
                { icon: <MapPin className="size-3.5 text-aurora shrink-0" />, text: "Ushuaia, Tierra del Fuego" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-frost/55">
                  {icon}
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div
          className="my-10"
          style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
        />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-frost/35 text-xs">
            © {new Date().getFullYear()} Fin del Mundo Stays. Todos los derechos reservados.
          </p>
          <p className="text-frost/35 text-xs">
            Hecho con ♥ en el fin del mundo · 54°48′S
          </p>
        </div>
      </div>
    </footer>
  )
}

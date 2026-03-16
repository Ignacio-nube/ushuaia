import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  width?: number
  height?: number
  href?: string
  className?: string
}

export function Logo({
  width = 180,
  height = 40,
  href = "/",
  className,
}: LogoProps) {
  const logo = (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo.svg"
        alt="Fin del Mundo Stays"
        width={width}
        height={height}
        priority
        className="object-contain"
        style={{ width: width, height: height }}
      />
    </div>
  )

  if (!href) return logo

  return (
    <Link href={href} className="flex items-center">
      {logo}
    </Link>
  )
}

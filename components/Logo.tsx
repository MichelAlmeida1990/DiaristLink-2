"use client"

import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {showText && (
        <span className={`font-extrabold animated-gradient ${textSizes[size]} leading-tight`}>
          Empreguetes.com
        </span>
      )}
    </Link>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"employer" | "diarist" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        
        if (profile?.role === "employer" || profile?.role === "diarist") {
          setUserRole(profile.role)
        }
      }
    } catch (error) {
      console.error("Erro ao verificar role:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (userRole === "employer") {
      router.push("/dashboard/employer")
    } else if (userRole === "diarist") {
      router.push("/dashboard/diarist")
    } else {
      router.push("/")
    }
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      disabled={loading}
    >
      {showText && (
        <span className={`font-extrabold animated-gradient ${textSizes[size]} leading-tight`}>
          Empreguetes.com
        </span>
      )}
    </button>
  )
}


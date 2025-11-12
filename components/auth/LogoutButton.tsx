"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  children?: React.ReactNode
}

export function LogoutButton({ variant = "outline", children = "Sair" }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Saindo..." : children}
    </Button>
  )
}


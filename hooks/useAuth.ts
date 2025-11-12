"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verificar usuário atual
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Buscar perfil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(profileData)
      }

      setLoading(false)
    }

    checkUser()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return {
    user,
    profile,
    loading,
    signOut,
  }
}


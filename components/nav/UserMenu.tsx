"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { createClient } from "@/lib/supabase/client"

interface UserMenuProps {
  role: "employer" | "diarist"
}

export default function UserMenu({ role }: UserMenuProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <LogoutButton />
      </div>
    )
  }

  const dashboardPath = role === "diarist" ? "/dashboard/diarist" : "/dashboard/employer"

  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name || "Usuário"}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
            <span className="text-blue-600 font-semibold text-sm">
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}
        <span className="text-gray-700 hidden sm:inline">Olá, {profile?.name || "Usuário"}</span>
      </Link>
      <LogoutButton />
    </div>
  )
}


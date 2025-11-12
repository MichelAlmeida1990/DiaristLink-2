import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // Redirecionar baseado no papel
  if (profile?.role === "diarist") {
    redirect("/dashboard/diarist")
  } else {
    redirect("/dashboard/employer")
  }
}


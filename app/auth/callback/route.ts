import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const roleParam = requestUrl.searchParams.get("role")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Erro ao trocar código por sessão:", error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      // Buscar perfil do usuário
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        // Se não tem perfil e veio com role param, criar perfil
        if (!profile && roleParam) {
          const email = user.email || ""
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.email?.split("@")[0] || email.split("@")[0]

          // Criar perfil diretamente no banco
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              name,
              email,
              role: roleParam,
            })

          if (!insertError) {
            // Redirecionar baseado no role
            if (roleParam === "diarist") {
              return NextResponse.redirect(`${origin}/dashboard/diarist`)
            } else {
              return NextResponse.redirect(`${origin}/dashboard/employer`)
            }
          } else {
            console.error("Erro ao criar perfil:", insertError)
          }
        }

        // Redirecionar baseado no perfil existente ou role param
        if (profile?.role === "diarist" || roleParam === "diarist") {
          return NextResponse.redirect(`${origin}/dashboard/diarist`)
        } else {
          return NextResponse.redirect(`${origin}/dashboard/employer`)
        }
      }
    } catch (err: any) {
      console.error("Erro no callback:", err)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err.message || "Erro desconhecido")}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}

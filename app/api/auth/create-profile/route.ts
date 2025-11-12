import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, role } = body

    // Usar service_role_key para bypass do RLS se disponível
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let supabaseAdmin = supabase

    if (serviceRoleKey) {
      // Criar cliente admin que bypassa RLS
      supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }

    // Criar perfil
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        name,
        email,
        role,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar perfil:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error("Erro na API:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar perfil" },
      { status: 500 }
    )
  }
}


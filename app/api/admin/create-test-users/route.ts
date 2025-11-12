import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key não configurada" },
        { status: 500 }
      )
    }

    // Criar cliente admin que bypassa RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Criar usuário empregador
    const { data: employerUser, error: employerError } = await supabaseAdmin.auth.admin.createUser({
      email: "empregador@teste.com",
      password: "teste123456",
      email_confirm: true,
    })

    if (employerError && !employerError.message.includes("already registered")) {
      console.error("Erro ao criar empregador:", employerError)
    }

    // Criar usuário diarista
    const { data: diaristUser, error: diaristError } = await supabaseAdmin.auth.admin.createUser({
      email: "diarista@teste.com",
      password: "teste123456",
      email_confirm: true,
    })

    if (diaristError && !diaristError.message.includes("already registered")) {
      console.error("Erro ao criar diarista:", diaristError)
    }

    // Buscar os usuários criados (ou existentes)
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
    const employer = allUsers?.users.find(u => u.email === "empregador@teste.com")
    const diarist = allUsers?.users.find(u => u.email === "diarista@teste.com")

    // Criar perfis
    const profiles = []

    if (employer) {
      const { data: employerProfile, error: profileError1 } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: employer.id,
          role: "employer",
          name: "Empregador Teste",
          email: "empregador@teste.com",
        }, {
          onConflict: "id"
        })
        .select()
        .single()

      if (!profileError1 && employerProfile) {
        profiles.push(employerProfile)
      }
    }

    if (diarist) {
      const { data: diaristProfile, error: profileError2 } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: diarist.id,
          role: "diarist",
          name: "Diarista Teste",
          email: "diarista@teste.com",
        }, {
          onConflict: "id"
        })
        .select()
        .single()

      if (!profileError2 && diaristProfile) {
        profiles.push(diaristProfile)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Usuários de teste criados com sucesso!",
      profiles,
      credentials: {
        employer: {
          email: "empregador@teste.com",
          password: "teste123456"
        },
        diarist: {
          email: "diarista@teste.com",
          password: "teste123456"
        }
      }
    })
  } catch (error: any) {
    console.error("Erro na API:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar usuários de teste" },
      { status: 500 }
    )
  }
}


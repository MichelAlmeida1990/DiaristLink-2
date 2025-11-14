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
    const { name, email, role, address, city, state, zip_code } = body

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

    const profileData: any = {
      id: user.id,
      name,
      email,
      role,
    }

    // Adicionar campos de endereço se for diarista
    if (role === "diarist") {
      if (address) profileData.address = address
      if (city) profileData.city = city
      if (state) profileData.state = state
      if (zip_code) profileData.zip_code = zip_code
      // Status inicial de verificação para diaristas
      profileData.verification_status = "pending"
      
      // Tentar buscar coordenadas automaticamente se tiver endereço completo
      if (address && city && state) {
        try {
          const fullAddress = [address, city, state, zip_code, "Brasil"]
            .filter(Boolean)
            .join(", ")
          
          // Buscar coordenadas usando Nominatim diretamente
          const searchQueries = [
            fullAddress,
            fullAddress.replace(/, Brasil$/, ""),
          ]
          
          for (const query of searchQueries) {
            try {
              const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br&addressdetails=1`
              
              const response = await fetch(searchUrl, {
                headers: {
                  "User-Agent": "Empreguetes.com/1.0",
                  "Accept-Language": "pt-BR,pt",
                },
              })

              if (response.ok) {
                const data = await response.json()
                
                if (data && data.length > 0) {
                  const result = data[0]
                  
                  if (result.lat && result.lon) {
                    const lat = parseFloat(result.lat)
                    const lon = parseFloat(result.lon)
                    
                    if (!isNaN(lat) && !isNaN(lon)) {
                      profileData.latitude = lat
                      profileData.longitude = lon
                      break
                    }
                  }
                }
              }
            } catch (err) {
              console.error("Erro ao buscar coordenadas:", err)
              continue
            }
          }
        } catch (err) {
          console.error("Erro ao buscar coordenadas no signup:", err)
          // Não falhar o signup se não conseguir coordenadas
        }
      }
    }

    // Criar perfil
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert(profileData)
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


import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { calculateDistance } from "@/lib/geolocation"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const radius = parseFloat(searchParams.get("radius") || "10") // km

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Buscar perfil da diarista
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "diarist") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Buscar jobs disponíveis (pending)
    console.log("Buscando jobs para diarista:", user.id)
    
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(`
        *,
        employer:profiles!jobs_employer_id_fkey(name, email, avatar_url)
      `)
      .eq("status", "pending")
      .not("employer_id", "is", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar jobs:", error)
      console.error("Detalhes do erro:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        { 
          error: error.message,
          details: error,
          debug: {
            userId: user.id,
            profileRole: profile?.role
          }
        },
        { status: 400 }
      )
    }

    console.log(`Jobs encontrados antes do filtro: ${jobs?.length || 0}`)

    // Processar jobs disponíveis
    let availableJobs = jobs || []
    
    console.log(`Jobs antes do processamento: ${availableJobs.length}`)

    // Se a diarista tem localização e quer filtrar por distância
    if (lat && lon && profile.latitude && profile.longitude) {
      console.log("Filtrando por distância - diarista tem localização")
      const diaristLat = parseFloat(profile.latitude.toString())
      const diaristLon = parseFloat(profile.longitude.toString())

      availableJobs = jobs
        ?.map((job) => {
          // Se o job tem coordenadas, calcular distância e filtrar por raio
          if (job.latitude && job.longitude) {
            const distance = calculateDistance(
              diaristLat,
              diaristLon,
              parseFloat(job.latitude.toString()),
              parseFloat(job.longitude.toString())
            )

            if (distance <= radius) {
              return {
                ...job,
                distance: Math.round(distance * 10) / 10,
              }
            }
            // Job fora do raio, não incluir
            return null
          }
          // Se o job não tem coordenadas, incluir mesmo assim (sem distância)
          return {
            ...job,
            distance: undefined,
          }
        })
        .filter((j) => j !== null) as any[]
    } else {
      console.log("Não filtrando por distância - mostrando todos os jobs")
    }
    
    console.log(`Jobs após processamento: ${availableJobs.length}`)

    return NextResponse.json({
      jobs: availableJobs,
      count: availableJobs.length,
      debug: {
        totalJobsFound: jobs?.length || 0,
        jobsAfterFilter: availableJobs.length,
        hasLocation: !!(lat && lon && profile.latitude && profile.longitude),
        radius: radius
      }
    })
  } catch (error: any) {
    console.error("Erro na API:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar jobs disponíveis" },
      { status: 500 }
    )
  }
}



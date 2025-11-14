import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { calculateDistance } from "@/lib/geolocation"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get("lat") || "0")
    const lon = parseFloat(searchParams.get("lon") || "0")
    const radius = parseFloat(searchParams.get("radius") || "10") // km

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude e longitude são obrigatórias" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Buscar todas as diaristas (por enquanto sem filtro de localização no banco)
    // TODO: Implementar busca otimizada com PostGIS ou cálculo de distância no banco
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "diarist")
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    if (error) {
      console.error("Erro ao buscar diaristas:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Filtrar por distância e verificar disponibilidade
    const nearbyDiaristsPromises = profiles
      ?.map(async (profile) => {
        if (!profile.latitude || !profile.longitude) return null

        const distance = calculateDistance(
          lat,
          lon,
          parseFloat(profile.latitude.toString()),
          parseFloat(profile.longitude.toString())
        )

        if (distance <= radius) {
          // Verificar se a diarista tem job ativo
          const { data: activeJobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("diarist_id", profile.id)
            .in("status", ["accepted", "in_progress"])
            .limit(1)

          const isAvailable = !activeJobs || activeJobs.length === 0

          // Buscar rating médio das avaliações
          const { data: ratings } = await supabase
            .from("ratings")
            .select("rating")
            .eq("diarist_id", profile.id)

          let averageRating = null
          if (ratings && ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0)
            averageRating = Math.round((sum / ratings.length) * 10) / 10
          }

          return {
            ...profile,
            distance: Math.round(distance * 10) / 10, // Arredondar para 1 casa decimal
            isAvailable,
            rating: averageRating,
          }
        }
        return null
      }) || []

    const nearbyDiarists = (await Promise.all(nearbyDiaristsPromises))
      .filter((d) => d !== null)
      .sort((a, b) => (a?.distance || 0) - (b?.distance || 0)) // Ordenar por distância

    return NextResponse.json({
      diarists: nearbyDiarists || [],
      count: nearbyDiarists?.length || 0,
    })
  } catch (error: any) {
    console.error("Erro na API:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar diaristas" },
      { status: 500 }
    )
  }
}



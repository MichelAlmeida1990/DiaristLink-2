import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { calculateDistance } from "@/lib/geolocation"

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

    // Filtrar por distância
    const nearbyDiarists = profiles
      ?.map((profile) => {
        if (!profile.latitude || !profile.longitude) return null

        const distance = calculateDistance(
          lat,
          lon,
          parseFloat(profile.latitude.toString()),
          parseFloat(profile.longitude.toString())
        )

        if (distance <= radius) {
          return {
            ...profile,
            distance: Math.round(distance * 10) / 10, // Arredondar para 1 casa decimal
          }
        }
        return null
      })
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



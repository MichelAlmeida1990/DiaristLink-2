import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { calculateDistance } from "@/lib/geolocation"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get("lat") || "0")
    const lon = parseFloat(searchParams.get("lon") || "0")
    const radius = parseFloat(searchParams.get("radius") || "50") // km

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude e longitude são obrigatórias" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employer")
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    if (error) {
      console.error("Erro ao buscar empregadores:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const nearbyEmployers = profiles
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
            distance: Math.round(distance * 10) / 10,
          }
        }
        return null
      })
      .filter((e) => e !== null)
      .sort((a, b) => (a?.distance || 0) - (b?.distance || 0))

    return NextResponse.json({
      employers: nearbyEmployers || [],
      count: nearbyEmployers?.length || 0,
    })
  } catch (error: any) {
    console.error("Erro na API:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar empregadores" },
      { status: 500 }
    )
  }
}


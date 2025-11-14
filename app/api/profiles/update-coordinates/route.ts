import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { address, city, state, zip_code } = body

    // Construir endereço completo para geocoding
    const fullAddress = [address, city, state, zip_code, "Brasil"]
      .filter(Boolean)
      .join(", ")

    if (!fullAddress || fullAddress === "Brasil") {
      return NextResponse.json(
        { error: "Endereço incompleto" },
        { status: 400 }
      )
    }

    // Buscar coordenadas usando Nominatim diretamente
    // Tentar diferentes formatos de busca, do mais específico ao mais genérico
    let coords: { lat: number; lon: number } | null = null
    
    const searchQueries = [
      // 1. Endereço completo com CEP
      fullAddress,
      // 2. Endereço completo sem Brasil
      fullAddress.replace(/, Brasil$/, ""),
      // 3. Endereço + Cidade + Estado
      `${address}, ${city}, ${state}, Brasil`,
      `${address}, ${city}, ${state}`,
      // 4. Apenas CEP (se disponível)
      zip_code ? `${zip_code}, Brasil` : null,
      zip_code ? zip_code : null,
      // 5. Cidade + Estado (mais genérico, mas funciona melhor)
      `${city}, ${state}, Brasil`,
      `${city}, ${state}`,
      // 6. Apenas cidade
      `${city}, Brasil`,
      city || null,
    ].filter(Boolean) as string[]
    
    // Função auxiliar para fazer busca com delay
    const searchWithDelay = async (query: string, delay: number = 500): Promise<{ lat: number; lon: number } | null> => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      try {
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br&addressdetails=1`
        
        const response = await fetch(searchUrl, {
          headers: {
            "User-Agent": "Empreguetes.com/1.0",
            "Accept-Language": "pt-BR,pt",
          },
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data && data.length > 0) {
            // Tentar encontrar o resultado mais relevante
            // Priorizar resultados com mais detalhes de endereço
            const result = data.find((r: any) => 
              r.address && (
                (r.address.city === city || r.address.town === city) ||
                (r.address.state === state || r.address.region === state)
              )
            ) || data[0]
            
            if (result.lat && result.lon) {
              const lat = parseFloat(result.lat)
              const lon = parseFloat(result.lon)
              
              if (!isNaN(lat) && !isNaN(lon)) {
                return { lat, lon }
              }
            }
          }
        }
      } catch (err) {
        console.error("Erro ao buscar coordenadas:", err)
      }
      
      return null
    }
    
    // Tentar cada formato sequencialmente com delay entre requisições
    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i]
      const delay = i * 500 // Delay de 500ms entre requisições para respeitar rate limit
      
      coords = await searchWithDelay(query, delay)
      
      if (coords) {
        console.log(`Coordenadas encontradas usando query: ${query}`)
        break
      }
    }

    // Se ainda não encontrou, tentar buscar pelo CEP usando ViaCEP + Nominatim
    if (!coords && zip_code) {
      try {
        const cepDigits = zip_code.replace(/\D/g, "")
        if (cepDigits.length === 8) {
          const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
          if (viaCepResponse.ok) {
            const viaCepData = await viaCepResponse.json()
            if (viaCepData && !viaCepData.erro) {
              // Buscar coordenadas usando o endereço do ViaCEP
              const viaCepAddress = `${viaCepData.logradouro || ""}, ${viaCepData.bairro || ""}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`
                .replace(/,\s*,/g, ",")
                .replace(/^,\s*|\s*,$/g, "")
              
              coords = await searchWithDelay(viaCepAddress, 0)
              
              // Se ainda não encontrou, tentar apenas cidade + estado do CEP
              if (!coords) {
                const cityStateQuery = `${viaCepData.localidade}, ${viaCepData.uf}, Brasil`
                coords = await searchWithDelay(cityStateQuery, 0)
              }
            }
          }
        }
      } catch (err) {
        console.error("Erro ao buscar via CEP:", err)
      }
    }

    if (!coords) {
      return NextResponse.json(
        { 
          error: `Não foi possível encontrar coordenadas para "${address}, ${city} - ${state}". O sistema tentou várias variações do endereço. Tente adicionar mais detalhes como número da casa ou bairro.`,
          suggestions: [
            "Verifique se o endereço está completo (incluindo número, se possível)",
            "Confirme se a cidade e estado estão corretos",
            "Tente adicionar o bairro ao endereço"
          ]
        },
        { status: 404 }
      )
    }

    // Atualizar perfil com coordenadas
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        latitude: coords.lat,
        longitude: coords.lon,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Erro ao atualizar coordenadas:", updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      coordinates: {
        lat: coords.lat,
        lon: coords.lon,
      },
    })
  } catch (error: any) {
    console.error("Erro na API:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar coordenadas" },
      { status: 500 }
    )
  }
}


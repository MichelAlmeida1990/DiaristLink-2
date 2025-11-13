import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json(
        { error: "Endereço é obrigatório" },
        { status: 400 }
      )
    }

    let formattedAddress = address.trim()
    
    // Garantir que tenha Brasil no final
    if (!formattedAddress.toLowerCase().includes("brasil") && !formattedAddress.toLowerCase().includes("brazil")) {
      formattedAddress = `${formattedAddress}, Brasil`
    }
    
    // Tentar diferentes formatos de busca
    const searchQueries = [
      formattedAddress, // Formato completo
      formattedAddress.replace(/, Brasil$/, ""), // Sem Brasil (às vezes funciona melhor)
    ]
    
    for (const query of searchQueries) {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br&addressdetails=1`
      
      console.log("Buscando coordenadas para:", query)
      
      try {
        const response = await fetch(searchUrl, {
          headers: {
                  "User-Agent": "Empreguetes.com/1.0",
            "Accept-Language": "pt-BR,pt",
          },
        })

        if (!response.ok) {
          console.error("Erro na API Nominatim:", response.status, response.statusText)
          continue // Tentar próximo formato
        }

        const data = await response.json()

        console.log("Resposta Nominatim:", data)

        if (data && data.length > 0) {
          const result = data[0]
          
          if (result.lat && result.lon) {
            const lat = parseFloat(result.lat)
            const lon = parseFloat(result.lon)

            if (!isNaN(lat) && !isNaN(lon)) {
              console.log("Coordenadas encontradas:", lat, lon)
              return NextResponse.json({
                lat,
                lon,
                display_name: result.display_name || query,
              })
            }
          }
        }
      } catch (err) {
        console.error("Erro ao buscar coordenadas:", err)
        continue // Tentar próximo formato
      }
    }
    
    // Se nenhum formato funcionou
    console.log("Nenhum resultado encontrado para:", formattedAddress)
    return NextResponse.json(
      { error: "Endereço não encontrado. Tente adicionar mais detalhes como número e bairro." },
      { status: 404 }
    )

  } catch (error: any) {
    console.error("Erro no geocoding:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar coordenadas" },
      { status: 500 }
    )
  }
}


// Geocoding usando Nominatim (OpenStreetMap) - 100% gratuito

export interface GeocodingResult {
  lat: number
  lon: number
  display_name: string
  address?: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          "User-Agent": "DiaristaLink/1.0", // Requerido pelo Nominatim
        },
      }
    )

    if (!response.ok) {
      throw new Error("Erro ao buscar endereço")
    }

    const data = await response.json()

    if (data.length === 0) {
      return null
    }

    const result = data[0]
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      display_name: result.display_name,
      address: result.address,
    }
  } catch (error) {
    console.error("Erro no geocoding:", error)
    return null
  }
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "DiaristaLink/1.0",
        },
      }
    )

    if (!response.ok) {
      throw new Error("Erro ao buscar endereço")
    }

    const data = await response.json()

    return {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      display_name: data.display_name,
      address: data.address,
    }
  } catch (error) {
    console.error("Erro no reverse geocoding:", error)
    return null
  }
}


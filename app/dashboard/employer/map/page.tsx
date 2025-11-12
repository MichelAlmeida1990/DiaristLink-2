"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MapContainer from "@/components/map/MapContainer"
import { getCurrentPosition } from "@/lib/geolocation"
import { createClient } from "@/lib/supabase/client"

export default function EmployerMapPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [diarists, setDiarists] = useState<any[]>([])

  useEffect(() => {
    loadMap()
  }, [])

  const loadMap = async () => {
    try {
      // Obter localização do usuário
      const position = await getCurrentPosition()
      setUserLocation([position.latitude, position.longitude])

      // Buscar diaristas próximas (mock por enquanto)
      // TODO: Implementar busca real no Supabase
      setDiarists([
        {
          id: "1",
          name: "Maria Silva",
          position: [position.latitude + 0.01, position.longitude + 0.01] as [number, number],
          rating: 4.8,
          distance: 1.2,
        },
        {
          id: "2",
          name: "Joana Santos",
          position: [position.latitude - 0.01, position.longitude + 0.02] as [number, number],
          rating: 4.9,
          distance: 2.5,
        },
      ])
    } catch (error) {
      console.error("Erro ao carregar mapa:", error)
      // Fallback para São Paulo
      setUserLocation([-23.5505, -46.6333])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerClick = (markerId: string) => {
    const diarist = diarists.find((d) => d.id === markerId)
    if (diarist) {
      // TODO: Abrir modal com perfil da diarista
      console.log("Clicou na diarista:", diarist)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Carregando mapa...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/employer" className="text-xl font-bold text-blue-600">
                DiaristaLink
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Mapa</span>
            </div>
            <Link href="/dashboard/employer">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Encontrar Diaristas Próximas
          </h1>
          <p className="text-gray-600">
            Visualize diaristas disponíveis na sua região
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-0">
            {userLocation && (
              <MapContainer
                center={userLocation}
                zoom={13}
                markers={diarists.map((d) => ({
                  id: d.id,
                  position: d.position,
                  title: d.name,
                  description: `⭐ ${d.rating} • ${d.distance} km`,
                }))}
                onMarkerClick={handleMarkerClick}
                className="h-[600px] w-full rounded-lg"
              />
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {diarists.map((diarist) => (
            <Card key={diarist.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{diarist.name}</CardTitle>
                <CardDescription>
                  ⭐ {diarist.rating} • {diarist.distance} km de distância
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Contratar Agora</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}


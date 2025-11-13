"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MapContainer from "@/components/map/MapContainer"
import { getCurrentPosition } from "@/lib/geolocation"
import { createClient } from "@/lib/supabase/client"
import UserMenu from "@/components/nav/UserMenu"
import Logo from "@/components/Logo"

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

      // Buscar diaristas próximas no Supabase
      const response = await fetch(
        `/api/diarists/nearby?lat=${position.latitude}&lon=${position.longitude}&radius=10`
      )

      if (response.ok) {
        const data = await response.json()
        const diaristsData = data.diarists.map((diarist: any) => ({
          id: diarist.id,
          name: diarist.name,
          position: [
            parseFloat(diarist.latitude.toString()),
            parseFloat(diarist.longitude.toString()),
          ] as [number, number],
          rating: 4.5, // TODO: Calcular rating médio das avaliações
          distance: diarist.distance,
          email: diarist.email,
          bio: diarist.bio,
          avatar_url: diarist.avatar_url,
          is_verified: diarist.is_verified,
        }))
        setDiarists(diaristsData)
      } else {
        console.error("Erro ao buscar diaristas")
        // Fallback: diaristas mock se não houver no banco
        setDiarists([])
      }
    } catch (error) {
      console.error("Erro ao carregar mapa:", error)
      // Fallback para São Paulo
      setUserLocation([-23.5505, -46.6333])
      setDiarists([])
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
              <Logo size="md" />
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Mapa</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/employer">
                <Button variant="outline">Voltar</Button>
              </Link>
              <UserMenu role="employer" />
            </div>
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
                  description: `⭐ ${d.rating} • ${d.distance} km${d.is_verified ? " • ✅ Verificada" : ""}`,
                  avatar_url: d.avatar_url,
                  color: d.is_verified ? "#10b981" : "#3b82f6",
                }))}
                onMarkerClick={handleMarkerClick}
                className="h-[600px] w-full rounded-lg"
              />
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {diarists.map((diarist) => (
            <Card 
              key={diarist.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleMarkerClick(diarist.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {diarist.avatar_url ? (
                    <img 
                      src={diarist.avatar_url} 
                      alt={diarist.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {diarist.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {diarist.name}
                      {diarist.is_verified && (
                        <span className="text-green-600 text-sm">✅</span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      ⭐ {diarist.rating} • {diarist.distance} km de distância
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {diarist.bio && (
                  <p className="text-sm text-gray-600 mb-3">{diarist.bio}</p>
                )}
                <Button className="w-full">Ver Perfil</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [selectedDiarist, setSelectedDiarist] = useState<any | null>(null)
  const [searchAddress, setSearchAddress] = useState("")
  const [searching, setSearching] = useState(false)

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
          rating: diarist.rating || null,
          distance: diarist.distance,
          email: diarist.email,
          bio: diarist.bio,
          avatar_url: diarist.avatar_url,
          is_verified: diarist.is_verified,
          isAvailable: diarist.isAvailable,
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
      setSelectedDiarist(diarist)
    }
  }

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchAddress.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(searchAddress)}`)
      
      if (response.ok) {
        const data = await response.json()
        setUserLocation([data.lat, data.lon])
        
        // Recarregar diaristas para a nova localização
        const diaristsResponse = await fetch(
          `/api/diarists/nearby?lat=${data.lat}&lon=${data.lon}&radius=10`
        )
        
        if (diaristsResponse.ok) {
          const diaristsData = await diaristsResponse.json()
          const mappedDiarists = diaristsData.diarists.map((diarist: any) => ({
            id: diarist.id,
            name: diarist.name,
            position: [
              parseFloat(diarist.latitude.toString()),
              parseFloat(diarist.longitude.toString()),
            ] as [number, number],
            rating: diarist.rating || null,
            distance: diarist.distance,
            email: diarist.email,
            bio: diarist.bio,
            avatar_url: diarist.avatar_url,
            is_verified: diarist.is_verified,
            isAvailable: diarist.isAvailable,
          }))
          setDiarists(mappedDiarists)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Endereço não encontrado")
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error)
      alert("Erro ao buscar endereço")
    } finally {
      setSearching(false)
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
          <p className="text-gray-600 mb-4">
            Visualize diaristas disponíveis na sua região
          </p>
          
          {/* Busca de Endereço */}
          <form onSubmit={handleSearchAddress} className="flex gap-2 max-w-md">
            <Input
              type="text"
              placeholder="Buscar endereço (ex: Rua ABC, 123, São Paulo)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searching || !searchAddress.trim()}>
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </form>
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
                  description: `${d.rating ? `⭐ ${d.rating} • ` : ""}${d.distance} km${d.is_verified ? " • ✅ Verificada" : ""}`,
                  avatar_url: d.avatar_url,
                  rating: d.rating || undefined,
                  isAvailable: d.isAvailable,
                  isVerified: d.is_verified,
                  pulse: d.isAvailable && d.is_verified, // Animar apenas se disponível e verificada
                }))}
                onMarkerClick={handleMarkerClick}
                className="h-[600px] w-full rounded-lg"
              />
            )}
          </CardContent>
        </Card>

        {/* Modal de Perfil da Diarista */}
        {selectedDiarist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDiarist(null)}>
            <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {selectedDiarist.avatar_url ? (
                    <img 
                      src={selectedDiarist.avatar_url} 
                      alt={selectedDiarist.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-2xl">
                        {selectedDiarist.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {selectedDiarist.name}
                      {selectedDiarist.is_verified && (
                        <span className="text-green-600 text-sm">✅ Verificada</span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedDiarist.rating ? (
                        <span className="flex items-center gap-1">
                          ⭐ {selectedDiarist.rating} • {selectedDiarist.distance} km de distância
                        </span>
                      ) : (
                        <span>{selectedDiarist.distance} km de distância</span>
                      )}
                    </CardDescription>
                    <div className="mt-2">
                      {selectedDiarist.isAvailable ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Disponível
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Ocupada
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedDiarist(null)}
                    className="h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDiarist.bio && (
                  <div>
                    <h4 className="font-semibold mb-1">Sobre</h4>
                    <p className="text-sm text-gray-600">{selectedDiarist.bio}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-1">Contato</h4>
                  <p className="text-sm text-gray-600">{selectedDiarist.email}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      router.push(`/dashboard/employer/jobs/new?diarist_id=${selectedDiarist.id}`)
                    }}
                    disabled={!selectedDiarist.isAvailable}
                  >
                    {selectedDiarist.isAvailable ? "Contratar Agora" : "Indisponível"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedDiarist(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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


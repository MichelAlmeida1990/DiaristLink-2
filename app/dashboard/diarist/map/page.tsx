"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MapContainer from "@/components/map/MapContainer"
import { getCurrentPosition } from "@/lib/geolocation"
import { createClient } from "@/lib/supabase/client"
import UserMenu from "@/components/nav/UserMenu"
import Logo from "@/components/Logo"

interface Job {
  id: string
  title: string
  address: string
  price: number
  scheduled_at: string
  latitude: number | null
  longitude: number | null
  employer?: {
    name: string
    email: string
    avatar_url?: string
  } | null
}

export default function DiaristMapPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    loadMap()
  }, [])

  const loadMap = async () => {
    try {
      const position = await getCurrentPosition()
      setUserLocation([position.latitude, position.longitude])

      const response = await fetch(`/api/jobs/available?lat=${position.latitude}&lon=${position.longitude}&radius=50`)

      if (response.ok) {
        const data = await response.json()
        const jobsData = (data.jobs || []).filter((job: Job) => job.latitude && job.longitude)
        setJobs(jobsData)
      }
    } catch (error) {
      console.error("Erro ao carregar mapa:", error)
      setUserLocation([-23.5505, -46.6333])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerClick = (markerId: string) => {
    const job = jobs.find((j) => j.id === markerId)
    if (job) {
      setSelectedJob(job)
    }
  }

  const handleAcceptJob = async (jobId: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { error } = await supabase
        .from("jobs")
        .update({ 
          diarist_id: user.id,
          status: "accepted" 
        })
        .eq("id", jobId)

      if (error) throw error

      router.push("/dashboard/diarist/jobs")
    } catch (error: any) {
      console.error("Erro ao aceitar job:", error)
      alert("Erro ao aceitar job: " + error.message)
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

  const markers = jobs
    .filter((job) => job.latitude && job.longitude)
    .map((job) => ({
      id: job.id,
      position: [job.latitude!, job.longitude!] as [number, number],
      title: job.title,
      description: `R$ ${parseFloat(job.price.toString()).toFixed(2)} • ${new Date(job.scheduled_at).toLocaleDateString("pt-BR")}`,
      avatar_url: job.employer?.avatar_url,
      color: "#10b981",
    }))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Mapa de Jobs</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/diarist/jobs">
                <Button variant="outline">Ver Lista</Button>
              </Link>
              <UserMenu role="diarist" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Jobs Disponíveis no Mapa
          </h1>
          <p className="text-gray-600">
            Visualize jobs disponíveis na sua região - {jobs.length} job{jobs.length !== 1 ? 's' : ''} encontrado{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {userLocation && (
                  <MapContainer
                    center={userLocation}
                    zoom={13}
                    markers={markers}
                    onMarkerClick={handleMarkerClick}
                    className="h-[600px] w-full rounded-lg"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {selectedJob ? (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{selectedJob.title}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Endereço:</strong> {selectedJob.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Preço:</strong> R$ {parseFloat(selectedJob.price.toString()).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Data/Hora:</strong> {new Date(selectedJob.scheduled_at).toLocaleString("pt-BR")}
                    </p>
                    {selectedJob.employer && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedJob.employer.avatar_url ? (
                            <img 
                              src={selectedJob.employer.avatar_url} 
                              alt={selectedJob.employer.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {selectedJob.employer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{selectedJob.employer.name}</p>
                            <p className="text-xs text-gray-500">{selectedJob.employer.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAcceptJob(selectedJob.id)}
                  >
                    Aceitar Job
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setSelectedJob(null)}
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 text-center">
                    Clique em um marcador no mapa para ver detalhes do job
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Jobs Disponíveis</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setSelectedJob(job)
                          if (job.latitude && job.longitude) {
                            setUserLocation([job.latitude, job.longitude])
                          }
                        }}
                      >
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-gray-500">R$ {parseFloat(job.price.toString()).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum job disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}


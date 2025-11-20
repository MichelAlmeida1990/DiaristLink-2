"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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

interface ActiveJob {
  id: string
  title: string
  status: string
  description?: string
  service_type?: string
  address?: string
  price?: number
  duration_hours?: number
  scheduled_at?: string
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
  const [allJobs, setAllJobs] = useState<Job[]>([]) // Todos os jobs (com e sem coordenadas)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null)
  const [activeJobDetails, setActiveJobDetails] = useState<ActiveJob | null>(null)
  const [showActiveJobModal, setShowActiveJobModal] = useState(false)
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null)

  useEffect(() => {
    loadMap()
  }, [])

  const checkActiveJob = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Buscar job ativo da diarista (accepted ou in_progress)
      const { data: activeJobs } = await supabase
        .from("jobs")
        .select("id, title, status")
        .eq("diarist_id", user.id)
        .in("status", ["accepted", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)

      if (activeJobs && activeJobs.length > 0) {
        setActiveJob(activeJobs[0])
      } else {
        setActiveJob(null)
      }
    } catch (error) {
      console.error("Erro ao verificar job ativo:", error)
    }
  }

  const loadActiveJobDetails = async (jobId: string) => {
    try {
      const supabase = createClient()
      const { data: job, error } = await supabase
        .from("jobs")
        .select(`
          *,
          employer:profiles!jobs_employer_id_fkey(name, email, avatar_url)
        `)
        .eq("id", jobId)
        .single()

      if (error) throw error
      if (job) {
        setActiveJobDetails(job)
        setShowActiveJobModal(true)
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do job ativo:", error)
      alert("Erro ao carregar detalhes do job")
    }
  }

  const loadMap = async () => {
    try {
      // Verificar job ativo primeiro
      await checkActiveJob()

      const position = await getCurrentPosition()
      setUserLocation([position.latitude, position.longitude])

      const response = await fetch(`/api/jobs/available?lat=${position.latitude}&lon=${position.longitude}&radius=50`)

      if (response.ok) {
        const data = await response.json()
        const allJobsData = data.jobs || []
        
        console.log("Jobs recebidos da API:", allJobsData)
        console.log("Jobs com coordenadas:", allJobsData.filter((j: Job) => j.latitude && j.longitude).length)
        console.log("Jobs sem coordenadas:", allJobsData.filter((j: Job) => !j.latitude || !j.longitude).length)
        
        // Separar jobs com e sem coordenadas
        const jobsWithCoords = allJobsData.filter((job: Job) => job.latitude && job.longitude)
        const jobsWithoutCoords = allJobsData.filter((job: Job) => !job.latitude || !job.longitude)
        
        if (jobsWithoutCoords.length > 0) {
          console.warn("Jobs sem coordenadas encontrados:", jobsWithoutCoords.map((j: Job) => ({ 
            id: j.id, 
            title: j.title, 
            address: j.address,
            latitude: j.latitude,
            longitude: j.longitude
          })))
        }
        
        // Salvar todos os jobs para mostrar na lista
        setAllJobs(allJobsData)
        // Mostrar apenas jobs com coordenadas no mapa
        setJobs(jobsWithCoords)
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
    // Verificar se já tem job ativo
    if (activeJob) {
      alert(`Você já tem um job ativo: "${activeJob.title}". Finalize ou cancele o job atual antes de aceitar outro.`)
      return
    }

    setAcceptingJobId(jobId)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Verificar novamente se não há job ativo (race condition)
      const { data: activeJobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("diarist_id", user.id)
        .in("status", ["accepted", "in_progress"])
        .limit(1)

      if (activeJobs && activeJobs.length > 0) {
        alert("Você já tem um job ativo. Finalize ou cancele o job atual antes de aceitar outro.")
        setAcceptingJobId(null)
        await checkActiveJob()
        return
      }

      // Primeiro, verificar o estado atual do job
      const { data: currentJob } = await supabase
        .from("jobs")
        .select("id, status, diarist_id")
        .eq("id", jobId)
        .single()

      if (!currentJob) {
        alert("Job não encontrado.")
        setAcceptingJobId(null)
        await loadMap()
        return
      }

      if (currentJob.status !== "pending") {
        // Remover job das listas pois não está mais disponível
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
        setAllJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
        setSelectedJob(null)
        alert(`Este job não está mais disponível. Status atual: ${currentJob.status === "accepted" ? "Aceito" : currentJob.status === "in_progress" ? "Em Progresso" : currentJob.status}.`)
        setAcceptingJobId(null)
        await loadMap()
        return
      }

      if (currentJob.diarist_id) {
        // Remover job das listas pois já foi aceito
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
        setAllJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
        setSelectedJob(null)
        alert("Este job já foi aceito por outra diarista.")
        setAcceptingJobId(null)
        await loadMap()
        return
      }

      // Usar função utilitária que funciona tanto na web quanto no mobile
      const { updateJobStatus } = await import("@/lib/jobs")
      const { job: updatedJob } = await updateJobStatus(jobId, "accepted")

      // Remover o job aceito das listas imediatamente
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
      setAllJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
      setSelectedJob(null)

      // Atualizar job ativo
      await checkActiveJob()
      
      // Recarregar mapa para garantir sincronização
      await loadMap()
      
      alert("Job aceito com sucesso!")
      router.push("/dashboard/diarist/jobs")
    } catch (error: any) {
      console.error("Erro ao aceitar job:", error)
      alert("Erro ao aceitar job: " + (error.message || "Erro desconhecido"))
    } finally {
      setAcceptingJobId(null)
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
    .map((job) => {
      const marker = {
        id: job.id,
        position: [job.latitude!, job.longitude!] as [number, number],
        title: job.title,
        description: `R$ ${parseFloat(job.price.toString()).toFixed(2)} • ${new Date(job.scheduled_at).toLocaleDateString("pt-BR")}`,
        avatar_url: job.employer?.avatar_url,
        isAvailable: !activeJob, // Verde se não tiver job ativo
        pulse: !activeJob, // Animar se disponível
        color: "#10b981", // Verde para jobs disponíveis
      }
      return marker
    })
  
  console.log(`Total de marcadores para o mapa: ${markers.length}`)
  console.log(`Jobs com coordenadas: ${jobs.length}`)
  console.log(`Total de jobs: ${allJobs.length}`)
  if (markers.length > 0) {
    console.log("Posições dos marcadores:", markers.map(m => ({ id: m.id, position: m.position })))
  }

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
        {/* Alert for active job */}
        {activeJob && (
          <Card 
            className="mb-6 border-yellow-300 bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => loadActiveJobDetails(activeJob.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Você já tem um job ativo
                  </h3>
                  <p className="text-sm text-yellow-800 mb-2">
                    Job: <strong>{activeJob.title}</strong> - Status: <strong>{activeJob.status === "accepted" ? "Aceito" : "Em Progresso"}</strong>
                  </p>
                  <p className="text-sm text-yellow-700 mb-2">
                    Você só pode aceitar um job por vez. Finalize ou cancele o job atual antes de aceitar outro.
                  </p>
                  <p className="text-xs text-yellow-600 italic">
                    💡 Clique aqui para ver os detalhes completos do job
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      loadActiveJobDetails(activeJob.id)
                    }}
                  >
                    Ver Detalhes
                  </Button>
                  <Link href="/dashboard/diarist/my-jobs" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm">
                      Ver Meus Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal com detalhes do job ativo */}
        <Dialog open={showActiveJobModal} onOpenChange={setShowActiveJobModal}>
          <DialogContent className="max-w-3xl">
            {activeJobDetails && (
              <>
                <DialogHeader>
                  <DialogTitle>{activeJobDetails.title}</DialogTitle>
                  <DialogDescription>
                    {activeJobDetails.service_type || "Serviço"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeJobDetails.status === "accepted" ? "bg-blue-100 text-blue-800" :
                      activeJobDetails.status === "in_progress" ? "bg-purple-100 text-purple-800" :
                      ""
                    }`}>
                      {activeJobDetails.status === "accepted" ? "Aceito" :
                       activeJobDetails.status === "in_progress" ? "Em Andamento" :
                       activeJobDetails.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Endereço</p>
                      <p className="font-medium">{activeJobDetails.address || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Data/Hora Agendada</p>
                      <p className="font-medium">
                        {activeJobDetails.scheduled_at ? new Date(activeJobDetails.scheduled_at).toLocaleString("pt-BR") : "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Duração</p>
                      <p className="font-medium">{activeJobDetails.duration_hours || 0} horas</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Preço</p>
                      <p className="font-medium text-lg text-green-600">
                        R$ {activeJobDetails.price ? parseFloat(activeJobDetails.price.toString()).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>

                  {activeJobDetails.description && (
                    <div className="mt-4">
                      <p className="text-gray-500 mb-2">Descrição</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {activeJobDetails.description}
                      </p>
                    </div>
                  )}

                  {activeJobDetails.employer && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-gray-500 mb-2">Empregador</p>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        {activeJobDetails.employer.avatar_url ? (
                          <img 
                            src={activeJobDetails.employer.avatar_url} 
                            alt={activeJobDetails.employer.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {activeJobDetails.employer.name?.charAt(0).toUpperCase() || 'E'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{activeJobDetails.employer.name || 'Empregador'}</p>
                          <p className="text-sm text-gray-500">{activeJobDetails.employer.email || 'Email não disponível'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowActiveJobModal(false)}>
                    Fechar
                  </Button>
                  <Link href="/dashboard/diarist/my-jobs">
                    <Button>
                      Gerenciar Job
                    </Button>
                  </Link>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Jobs Disponíveis no Mapa
          </h1>
          <p className="text-gray-600 mb-2">
            Visualize jobs disponíveis na sua região - {allJobs.length} job{allJobs.length !== 1 ? 's' : ''} encontrado{allJobs.length !== 1 ? 's' : ''} 
            {jobs.length < allJobs.length && ` (${jobs.length} com localização no mapa)`}
          </p>
          {jobs.length === 0 && allJobs.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <p className="text-sm text-amber-800 font-medium mb-1">
                ⚠️ Nenhum job aparece no mapa
              </p>
              <p className="text-xs text-amber-700">
                Os jobs não têm coordenadas cadastradas. Isso acontece quando um empregador cria um job sem um endereço completo ou quando o sistema não consegue encontrar as coordenadas do endereço informado.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0 relative">
                {userLocation ? (
                  <>
                    <MapContainer
                      center={userLocation}
                      zoom={markers.length > 0 ? 13 : 10}
                      markers={markers}
                      onMarkerClick={handleMarkerClick}
                      className="h-[600px] w-full rounded-lg"
                    />
                    {markers.length === 0 && allJobs.length > 0 && (
                      <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg border border-amber-300 max-w-xs">
                        <p className="text-sm text-amber-800 font-medium">
                          ⚠️ Nenhum marcador no mapa
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Os {allJobs.length} job{allJobs.length !== 1 ? 's' : ''} disponíveis não têm coordenadas cadastradas e não podem ser exibidos no mapa.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Carregando localização...</p>
                  </div>
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
                    className={`w-full ${activeJob ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleAcceptJob(selectedJob.id)}
                    disabled={!!activeJob || acceptingJobId === selectedJob.id}
                  >
                    {acceptingJobId === selectedJob.id ? "Aceitando..." : activeJob ? "Job Ativo" : "Aceitar Job"}
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
                {allJobs.length > 0 && jobs.length === 0 && (
                  <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs text-amber-800">
                      ⚠️ Nenhum job tem coordenadas cadastradas. Os empregadores precisam criar jobs com endereços completos para aparecerem no mapa.
                    </p>
                  </div>
                )}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {allJobs.length > 0 ? (
                    allJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          job.latitude && job.longitude ? "" : "opacity-50"
                        }`}
                        onClick={() => {
                          setSelectedJob(job)
                          if (job.latitude && job.longitude) {
                            setUserLocation([job.latitude, job.longitude])
                          } else {
                            alert("Este job não tem coordenadas cadastradas e não pode ser visualizado no mapa.")
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{job.title}</p>
                            <p className="text-xs text-gray-500">R$ {parseFloat(job.price.toString()).toFixed(2)}</p>
                          </div>
                          {job.latitude && job.longitude ? (
                            <span className="text-green-600 text-xs">📍</span>
                          ) : (
                            <span className="text-amber-600 text-xs" title="Sem coordenadas">⚠️</span>
                          )}
                        </div>
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


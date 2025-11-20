"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import UserMenu from "@/components/nav/UserMenu"
import { createClient } from "@/lib/supabase/client"
import { getCurrentPosition } from "@/lib/geolocation"
import Logo from "@/components/Logo"

interface Job {
  id: string
  title: string
  description: string
  service_type: string
  address: string
  price: number
  duration_hours: number
  scheduled_at: string
  distance?: number
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
  scheduled_at: string
  description?: string
  service_type?: string
  address?: string
  price?: number
  duration_hours?: number
  employer?: {
    name: string
    email: string
    avatar_url?: string
  } | null
}

export default function DiaristJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null)
  const [activeJobDetails, setActiveJobDetails] = useState<ActiveJob | null>(null)
  const [showActiveJobModal, setShowActiveJobModal] = useState(false)
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null)

  const checkActiveJob = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Buscar job ativo da diarista (accepted ou in_progress)
      const { data: activeJobs } = await supabase
        .from("jobs")
        .select("id, title, status, scheduled_at")
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

  const loadJobs = async (location?: { lat: number; lon: number }) => {
    try {
      // Verificar se há job ativo primeiro
      await checkActiveJob()

      // Buscar jobs disponíveis
      // Se tiver localização, passa para filtrar por distância (quando o job tiver coordenadas)
      const url = location
        ? `/api/jobs/available?lat=${location.lat}&lon=${location.lon}&radius=50`
        : `/api/jobs/available`

      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        console.log("Jobs recebidos:", data)
        setJobs(data.jobs || [])
      } else {
        const errorData = await response.json()
        console.error("Erro ao buscar jobs:", errorData)
        alert(`Erro ao buscar jobs: ${errorData.error || "Erro desconhecido"}`)
      }
    } catch (error) {
      console.error("Erro ao carregar jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeJobs = async () => {
      try {
        // Tentar obter localização primeiro
        try {
          const position = await getCurrentPosition()
          const location = { lat: position.latitude, lon: position.longitude }
          if (mounted) {
            setUserLocation(location)
            await loadJobs(location)
          }
        } catch (error) {
          // Se não conseguir localização, carregar sem filtro
          console.log("Localização não disponível - mostrando todos os jobs")
          if (mounted) {
            await loadJobs()
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar jobs:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeJobs()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        await loadJobs(userLocation || undefined)
        return
      }

      if (currentJob.status !== "pending") {
        // Remover job da lista pois não está mais disponível
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
        alert(`Este job não está mais disponível. Status atual: ${currentJob.status === "accepted" ? "Aceito" : currentJob.status === "in_progress" ? "Em Progresso" : currentJob.status}.`)
        setAcceptingJobId(null)
        await loadJobs(userLocation || undefined)
        return
      }

      if (currentJob.diarist_id) {
        // Remover job da lista pois já foi aceito
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
        alert("Este job já foi aceito por outra diarista.")
        setAcceptingJobId(null)
        await loadJobs(userLocation || undefined)
        return
      }

      // Usar função utilitária que funciona tanto na web quanto no mobile
      const { updateJobStatus } = await import("@/lib/jobs")
      const { job: updatedJob } = await updateJobStatus(jobId, "accepted")

      // Remover o job aceito da lista imediatamente
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
      
      // Atualizar job ativo
      await checkActiveJob()
      
      // Recarregar jobs para garantir sincronização
      await loadJobs(userLocation || undefined)
      
      alert("Job aceito com sucesso!")
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
            <p>Carregando jobs...</p>
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
              <span className="text-gray-700">Jobs Disponíveis</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/diarist/my-jobs">
                <Button variant="outline" size="sm">Meus Jobs</Button>
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
                        {new Date(activeJobDetails.scheduled_at).toLocaleString("pt-BR")}
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Jobs Disponíveis
          </h1>
          <p className="text-gray-600">
            {jobs.length > 0 
              ? `${jobs.length} job${jobs.length > 1 ? "s" : ""} disponível${jobs.length > 1 ? "eis" : ""} próximo${jobs.length > 1 ? "s" : ""} a você`
              : "Nenhum job disponível no momento"}
          </p>
        </div>

        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.service_type}</CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Disponível
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Endereço</p>
                      <p className="font-medium">{job.address}</p>
                      {job.distance && (
                        <p className="text-blue-600 mt-1">📍 {job.distance} km de distância</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500">Data/Hora</p>
                      <p className="font-medium">
                        {new Date(job.scheduled_at).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-gray-500 mt-1">Duração: {job.duration_hours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Preço</p>
                      <p className="font-medium text-lg text-green-600">
                        R$ {parseFloat(job.price.toString()).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {job.employer?.name?.charAt(0).toUpperCase() || 'E'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{job.employer?.name || 'Empregador'}</p>
                        <p className="text-xs text-gray-500">{job.employer?.email || 'Email não disponível'}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleAcceptJob(job.id)}
                      disabled={!!activeJob || acceptingJobId === job.id}
                      className={activeJob ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {acceptingJobId === job.id ? "Aceitando..." : activeJob ? "Job Ativo" : "Aceitar Job"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">Nenhum job disponível no momento</p>
                <p className="text-sm text-gray-400">
                  Novos jobs aparecerão aqui quando empregadores criarem serviços próximos a você
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}



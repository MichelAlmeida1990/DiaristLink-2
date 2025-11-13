"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
}

export default function DiaristJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null)
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
    // Primeiro, carregar jobs sem filtro de localização
    loadJobs()

    // Depois, tentar obter localização da diarista (opcional)
    // Se conseguir, recarrega os jobs com filtro de distância
    getCurrentPosition()
      .then((position) => {
        const location = { lat: position.latitude, lon: position.longitude }
        setUserLocation(location)
        // Recarregar jobs com localização para filtrar por distância
        loadJobs(location)
      })
      .catch((error) => {
        console.log("Localização não disponível - mostrando todos os jobs")
      })
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

      const { error } = await supabase
        .from("jobs")
        .update({ 
          diarist_id: user.id,
          status: "accepted" 
        })
        .eq("id", jobId)
        .eq("status", "pending") // Garantir que só aceita jobs pendentes

      if (error) throw error

      // Recarregar jobs e verificar job ativo
      await checkActiveJob()
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
            <UserMenu role="diarist" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert for active job */}
        {activeJob && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
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
                  <p className="text-sm text-yellow-700">
                    Você só pode aceitar um job por vez. Finalize ou cancele o job atual antes de aceitar outro.
                  </p>
                </div>
                <Link href="/dashboard/diarist/jobs">
                  <Button variant="outline" size="sm">
                    Ver Meus Jobs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

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



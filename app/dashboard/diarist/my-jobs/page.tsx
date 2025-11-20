"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserMenu from "@/components/nav/UserMenu"
import { createClient } from "@/lib/supabase/client"
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
  status: string
  employer_id: string
  employer?: {
    name: string
    email: string
    avatar_url?: string
  } | null
}

export default function DiaristMyJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    loadJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadJobs = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Buscar jobs aceitos pela diarista
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select(`
          *,
          employer:profiles!jobs_employer_id_fkey(name, email, avatar_url)
        `)
        .eq("diarist_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setJobs(jobsData || [])
    } catch (error) {
      console.error("Erro ao carregar jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    setUpdatingStatus(jobId)
    try {
      // Usar função utilitária que funciona tanto na web quanto no mobile
      const { updateJobStatus: updateJobStatusUtil } = await import("@/lib/jobs")
      await updateJobStatusUtil(jobId, newStatus)

      // Recarregar jobs
      await loadJobs()
    } catch (error: any) {
      alert(error.message || "Erro ao atualizar status do job")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const jobsByStatus = {
    accepted: jobs.filter((j) => j.status === "accepted"),
    in_progress: jobs.filter((j) => j.status === "in_progress"),
    completed: jobs.filter((j) => j.status === "completed"),
    cancelled: jobs.filter((j) => j.status === "cancelled"),
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
              <span className="text-gray-700">Meus Jobs</span>
            </div>
            <UserMenu role="diarist" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Jobs</h1>
            <p className="text-gray-600 mt-2">Gerencie os jobs que você aceitou</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/diarist/my-jobs/history">
              <Button variant="outline">Histórico</Button>
            </Link>
            <Link href="/dashboard/diarist/jobs">
              <Button variant="outline">Ver Jobs Disponíveis</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aceitos</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{jobsByStatus.accepted.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Em Andamento</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{jobsByStatus.in_progress.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Concluídos</CardDescription>
              <CardTitle className="text-3xl text-green-600">{jobsByStatus.completed.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cancelados</CardDescription>
              <CardTitle className="text-3xl text-red-600">{jobsByStatus.cancelled.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.service_type}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === "accepted" ? "bg-blue-100 text-blue-800" :
                      job.status === "in_progress" ? "bg-purple-100 text-purple-800" :
                      job.status === "completed" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {job.status === "accepted" ? "Aceito" :
                       job.status === "in_progress" ? "Em Andamento" :
                       job.status === "completed" ? "Concluído" :
                       "Cancelado"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Endereço</p>
                      <p className="font-medium">{job.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Data/Hora</p>
                      <p className="font-medium">
                        {new Date(job.scheduled_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Preço</p>
                      <p className="font-medium text-lg text-green-600">
                        R$ {parseFloat(job.price.toString()).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {job.description && (
                    <p className="mb-4 text-sm text-gray-600">{job.description}</p>
                  )}
                  
                  {/* Informações do empregador */}
                  {job.employer && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {job.employer.name?.charAt(0).toUpperCase() || 'E'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{job.employer.name || 'Empregador'}</p>
                        <p className="text-xs text-gray-500">{job.employer.email || 'Email não disponível'}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Botões de ação baseados no status */}
                  <div className="flex gap-2 flex-wrap">
                    {job.status === "accepted" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateJobStatus(job.id, "in_progress")}
                        disabled={updatingStatus === job.id}
                      >
                        {updatingStatus === job.id ? "Iniciando..." : "Iniciar Trabalho"}
                      </Button>
                    )}
                    {job.status === "in_progress" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja finalizar este job?")) {
                            updateJobStatus(job.id, "completed")
                          }
                        }}
                        disabled={updatingStatus === job.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatingStatus === job.id ? "Finalizando..." : "Finalizar Job"}
                      </Button>
                    )}
                    {job.status === "completed" && (
                      <span className="text-sm text-gray-500">Job concluído com sucesso!</span>
                    )}
                    {job.status === "cancelled" && (
                      <span className="text-sm text-gray-500">Job cancelado</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">Você ainda não aceitou nenhum job</p>
                <Link href="/dashboard/diarist/jobs">
                  <Button>Ver Jobs Disponíveis</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}


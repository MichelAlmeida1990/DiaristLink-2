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
  completed_at?: string
  updated_at?: string
  status: string
  diarist_id: string | null
  diarist?: {
    name: string
    email: string
    avatar_url?: string
  } | null
}

export default function EmployerJobsHistoryPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

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

      // Buscar apenas jobs completados do empregador
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select(`
          *,
          diarist:profiles!jobs_diarist_id_fkey(name, email, avatar_url)
        `)
        .eq("employer_id", user.id)
        .eq("status", "completed")
        .order("updated_at", { ascending: false })

      if (error) throw error

      setJobs(jobsData || [])
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Carregando histórico...</p>
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
              <span className="text-gray-700">Histórico de Jobs</span>
            </div>
            <UserMenu role="employer" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico de Jobs</h1>
            <p className="text-gray-600 mt-2">Jobs concluídos com sucesso</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/employer/jobs">
              <Button variant="outline">Voltar para Meus Jobs</Button>
            </Link>
            <Link href="/dashboard/employer/jobs/new">
              <Button>Criar Novo Job</Button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardDescription>Total de Jobs Concluídos</CardDescription>
              <CardTitle className="text-4xl text-green-600">{jobs.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Valor total gasto: R$ {jobs.reduce((sum, j) => sum + parseFloat(j.price.toString()), 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="border-green-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.service_type}</CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✅ Concluído
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
                      <p className="text-gray-500">Data/Hora Agendada</p>
                      <p className="font-medium">
                        {new Date(job.scheduled_at).toLocaleString("pt-BR")}
                      </p>
                      {job.updated_at && (
                        <p className="text-gray-500 mt-1">
                          Concluído em: {new Date(job.updated_at).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500">Preço</p>
                      <p className="font-medium text-lg text-green-600">
                        R$ {parseFloat(job.price.toString()).toFixed(2)}
                      </p>
                      <p className="text-gray-500 mt-1">Duração: {job.duration_hours}h</p>
                    </div>
                  </div>
                  {job.description && (
                    <p className="mb-4 text-sm text-gray-600">{job.description}</p>
                  )}
                  
                  {/* Informações da diarista */}
                  {job.diarist && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">
                          {job.diarist.name?.charAt(0).toUpperCase() || 'D'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Diarista: {job.diarist.name || 'Não informado'}</p>
                        <p className="text-xs text-gray-500">{job.diarist.email || 'Email não disponível'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">Você ainda não tem jobs concluídos</p>
                <Link href="/dashboard/employer/jobs/new">
                  <Button>Criar Primeiro Job</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}


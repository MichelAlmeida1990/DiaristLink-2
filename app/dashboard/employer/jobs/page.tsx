import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserMenu from "@/components/nav/UserMenu"
import Logo from "@/components/Logo"

export default async function EmployerJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard")
  }

  // Buscar jobs do empregador
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false })

  const jobsByStatus = {
    pending: jobs?.filter((j) => j.status === "pending") || [],
    accepted: jobs?.filter((j) => j.status === "accepted") || [],
    in_progress: jobs?.filter((j) => j.status === "in_progress") || [],
    completed: jobs?.filter((j) => j.status === "completed") || [],
    cancelled: jobs?.filter((j) => j.status === "cancelled") || [],
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
            <UserMenu role="employer" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Jobs</h1>
            <p className="text-gray-600 mt-2">Gerencie seus serviços contratados</p>
          </div>
          <Link href="/dashboard/employer/jobs/new">
            <Button>Criar Novo Job</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendentes</CardDescription>
              <CardTitle className="text-3xl">{jobsByStatus.pending.length}</CardTitle>
            </CardHeader>
          </Card>
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
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.service_type}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      job.status === "accepted" ? "bg-blue-100 text-blue-800" :
                      job.status === "in_progress" ? "bg-purple-100 text-purple-800" :
                      job.status === "completed" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {job.status === "pending" ? "Pendente" :
                       job.status === "accepted" ? "Aceito" :
                       job.status === "in_progress" ? "Em Andamento" :
                       job.status === "completed" ? "Concluído" :
                       "Cancelado"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
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
                    <p className="mt-4 text-sm text-gray-600">{job.description}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">Você ainda não criou nenhum job</p>
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



import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserMenu from "@/components/nav/UserMenu"
import Logo from "@/components/Logo"

export default async function EmployerDashboard() {
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
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false })


  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Logo size="md" />
            <UserMenu role="employer" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard do Empregador
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Jobs Ativos</CardDescription>
              <CardTitle className="text-4xl text-blue-600">
                {(() => {
                  const activeJobs = jobs?.filter(
                    (j) => j.status === "pending" || j.status === "accepted" || j.status === "in_progress"
                  ).length || 0
                  return activeJobs
                })()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Jobs Concluídos</CardDescription>
              <CardTitle className="text-4xl text-green-600">
                {jobs?.filter((j) => j.status === "completed").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Gasto</CardDescription>
              <CardTitle className="text-4xl text-purple-600">
                R$ {(() => {
                  const total = jobs?.filter((j) => j.status === "completed")
                    .reduce((sum, j) => sum + parseFloat(j.price.toString()), 0) || 0
                  return total.toFixed(2)
                })()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao Empreguetes.com!</CardTitle>
              <CardDescription>
                Encontre diaristas profissionais próximas a você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/employer/map">
                <Button className="w-full" size="lg">
                  Ver Mapa de Diaristas
                </Button>
              </Link>
              <Link href="/dashboard/employer/jobs/new">
                <Button className="w-full" variant="outline" size="lg">
                  Criar Novo Job
                </Button>
              </Link>
              <Link href="/dashboard/employer/jobs">
                <Button className="w-full" variant="secondary" size="lg">
                  Ver Meus Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>Funcionalidades disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Dashboard básico</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Autenticação completa</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-600">🚧</span>
                  <span>Mapa interativo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-600">🚧</span>
                  <span>Criação de jobs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-600">🚧</span>
                  <span>Chat em tempo real</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


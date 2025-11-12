import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/components/auth/LogoutButton"

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


  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                DiaristaLink
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Olá, {profile.name}</span>
              <LogoutButton />
            </div>
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
              <CardTitle className="text-4xl text-blue-600">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Jobs Concluídos</CardDescription>
              <CardTitle className="text-4xl text-green-600">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Gasto</CardDescription>
              <CardTitle className="text-4xl text-purple-600">R$ 0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao DiaristaLink!</CardTitle>
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
              <Button className="w-full" variant="outline" size="lg">
                Criar Novo Job
              </Button>
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


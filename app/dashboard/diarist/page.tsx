"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserMenu from "@/components/nav/UserMenu"
import Logo from "@/components/Logo"
import UpdateCoordinatesButton from "@/components/diarist/UpdateCoordinatesButton"

export default function DiaristDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!profileData || profileData.role !== "diarist") {
        router.push("/dashboard")
        return
      }

      setProfile(profileData)

      // Buscar jobs relacionados à diarista
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .or(`diarist_id.eq.${profileData.id},status.eq.pending`)
        .order("created_at", { ascending: false })

      setJobs(jobsData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Logo size="md" />
            <UserMenu role="diarist" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerta para atualizar coordenadas */}
        <UpdateCoordinatesButton profile={profile} />

        {/* Hero Section with Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-80">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Profissional de limpeza trabalhando"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-blue-600/80"></div>
          <div className="absolute inset-0 flex items-center justify-center md:justify-start px-8">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Dashboard da Diarista
              </h1>
              <p className="text-xl text-white/90">
                Encontre oportunidades de trabalho próximas a você
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Jobs Disponíveis</CardDescription>
              <CardTitle className="text-4xl text-blue-600">
                {jobs.filter((j) => j.status === "pending" && !j.diarist_id).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Jobs Aceitos</CardDescription>
              <CardTitle className="text-4xl text-green-600">
                {jobs.filter((j) => j.diarist_id === profile.id && (j.status === "accepted" || j.status === "in_progress")).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Ganhos Totais</CardDescription>
              <CardTitle className="text-4xl text-purple-600">
                R$ {jobs.filter((j) => j.diarist_id === profile.id && j.status === "completed")
                  .reduce((sum, j) => sum + parseFloat(j.price.toString()), 0).toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="overflow-hidden">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Trabalho de limpeza"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
            </div>
            <CardHeader>
              <CardTitle>Bem-vinda ao Empreguetes.com!</CardTitle>
              <CardDescription>
                Receba propostas de jobs próximos a você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/diarist/map">
                <Button className="w-full" size="lg">
                  📍 Ver Jobs no Mapa
                </Button>
              </Link>
              <Link href="/dashboard/diarist/jobs">
                <Button className="w-full" size="lg" variant="outline">
                  Ver Jobs Disponíveis
                </Button>
              </Link>
              <Link href="/dashboard/diarist/my-jobs">
                <Button className="w-full" size="lg" variant="secondary">
                  💼 Meus Jobs Aceitos
                </Button>
              </Link>
              {(!profile.is_verified || profile.verification_status === "pending") && (
                <Link href="/dashboard/diarist/verification">
                  <Button className="w-full" size="lg" variant="secondary">
                    {profile.verification_status === "pending" 
                      ? "⏳ Verificar Documentos" 
                      : "📋 Completar Verificação"}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Organização profissional"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
            </div>
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
                  <span className="text-green-600">✅</span>
                  <span>Visualização de jobs no mapa</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Aceitar/rejeitar jobs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-600">🚧</span>
                  <span>Chat em tempo real</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Image Gallery Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Limpeza profissional"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-4 left-4 text-white font-semibold">
                Limpeza Profissional
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Organização de espaços"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-4 left-4 text-white font-semibold">
                Organização Completa
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Serviços de limpeza"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-4 left-4 text-white font-semibold">
                Serviços Residenciais
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import Logo from "@/components/Logo"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") as "employer" | "diarist" | null
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"employer" | "diarist">(roleParam || "employer")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      
      // Criar usuário
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Aguardar um pouco para garantir que a sessão está estabelecida
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Criar perfil via API route (que usa service_role internamente se necessário)
        const response = await fetch("/api/auth/create-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
          name,
          email,
          role,
          address: role === "diarist" ? address : undefined,
          city: role === "diarist" ? city : undefined,
          state: role === "diarist" ? state : undefined,
          zip_code: role === "diarist" ? zipCode : undefined,
        }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao criar perfil")
        }

        // Redirecionar baseado no papel
        if (role === "diarist") {
          router.push("/dashboard/diarist")
        } else {
          router.push("/dashboard/employer")
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setOauthLoading("google")
      setError("")
      const supabase = createClient()
      const redirectUrl = role 
        ? `${window.location.origin}/auth/callback?role=${role}`
        : `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: role ? { role } : undefined,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta com Google")
      setOauthLoading(null)
    }
  }

  const handleAppleSignup = async () => {
    try {
      setOauthLoading("apple")
      setError("")
      const supabase = createClient()
      const redirectUrl = role 
        ? `${window.location.origin}/auth/callback?role=${role}`
        : `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: redirectUrl,
          queryParams: role ? { role } : undefined,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta com Apple")
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <CardTitle className="text-3xl text-center">Criar nova conta</CardTitle>
          <CardDescription className="text-center">
            Ou{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              entre na sua conta existente
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSignup}>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Eu sou um(a):</Label>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={role === "employer"}
                    onChange={(e) => setRole(e.target.value as "employer" | "diarist")}
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <span>Empregador</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="diarist"
                    checked={role === "diarist"}
                    onChange={(e) => setRole(e.target.value as "employer" | "diarist")}
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <span>Diarista</span>
                </label>
              </div>
            </div>

            {role === "diarist" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  📋 Informações adicionais para diaristas
                </p>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço completo *</Label>
                  <Input
                    id="address"
                    required
                    placeholder="Rua, número, bairro"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      required
                      placeholder="São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      required
                      placeholder="SP"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    required
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-blue-700">
                  ⚠️ Após o cadastro, você precisará completar a verificação de documentos
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || oauthLoading !== null}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={loading || oauthLoading !== null}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {oauthLoading === "google" ? "Conectando..." : "Continuar com o Google"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAppleSignup}
              disabled={loading || oauthLoading !== null}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {oauthLoading === "apple" ? "Conectando..." : "Continuar com a Apple"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"employer" | "diarist">("employer")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
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

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


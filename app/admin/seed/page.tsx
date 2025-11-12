"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const createTestUsers = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/admin/create-test-users", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar usuários")
      }

      setMessage(
        `✅ Usuários criados com sucesso!\n\n` +
        `📧 Empregador:\n` +
        `   Email: ${data.credentials.employer.email}\n` +
        `   Senha: ${data.credentials.employer.password}\n\n` +
        `📧 Diarista:\n` +
        `   Email: ${data.credentials.diarist.email}\n` +
        `   Senha: ${data.credentials.diarist.password}\n\n` +
        `Você pode usar essas credenciais para fazer login!`
      )
    } catch (err: any) {
      setError(err.message || "Erro ao criar usuários")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Criar Usuários de Teste</CardTitle>
          <CardDescription>
            Crie contas de teste para empregador e diarista
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold mb-2">Instruções:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Acesse o Supabase Dashboard</li>
              <li>Vá em <strong>Authentication</strong> → <strong>Users</strong></li>
              <li>Clique em <strong>"Add user"</strong> → <strong>"Create new user"</strong></li>
              <li>Crie os seguintes usuários:</li>
            </ol>
            <div className="mt-4 space-y-2">
              <div className="bg-white p-3 rounded border">
                <p className="font-semibold">Empregador:</p>
                <p className="text-sm">Email: <code>empregador@teste.com</code></p>
                <p className="text-sm">Senha: <code>teste123456</code></p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="font-semibold">Diarista:</p>
                <p className="text-sm">Email: <code>diarista@teste.com</code></p>
                <p className="text-sm">Senha: <code>teste123456</code></p>
              </div>
            </div>
            <p className="mt-4 text-sm">
              Depois, execute o script SQL em <code>supabase/seed_test_users.sql</code> no SQL Editor do Supabase
            </p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm whitespace-pre-line">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={createTestUsers}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processando..." : "Ver Instruções"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


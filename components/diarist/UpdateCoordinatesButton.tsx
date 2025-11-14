"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface UpdateCoordinatesButtonProps {
  profile: {
    id: string
    address?: string | null
    city?: string | null
    state?: string | null
    zip_code?: string | null
    latitude?: number | null
    longitude?: number | null
  }
}

export default function UpdateCoordinatesButton({ profile }: UpdateCoordinatesButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const hasAddress = profile.address && profile.city && profile.state
  const hasCoordinates = profile.latitude && profile.longitude

  const handleUpdateCoordinates = async () => {
    if (!hasAddress) {
      setMessage({ type: "error", text: "Você precisa ter um endereço cadastrado primeiro." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/profiles/update-coordinates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Erro ao atualizar coordenadas"
        const suggestions = data.suggestions || []
        
        let fullMessage = errorMessage
        if (suggestions.length > 0) {
          fullMessage += "\n\nSugestões:\n" + suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")
        }
        
        throw new Error(fullMessage)
      }

      setMessage({
        type: "success",
        text: "Coordenadas atualizadas com sucesso! Agora você aparecerá no mapa.",
      })

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao atualizar coordenadas",
      })
    } finally {
      setLoading(false)
    }
  }

  if (hasCoordinates) {
    return null // Não mostrar nada se já tem coordenadas
  }

  return (
    <Card className="mb-6 border-amber-300 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-900">📍 Atualizar Localização</CardTitle>
        <CardDescription className="text-amber-800">
          Para aparecer no mapa e receber jobs próximos, você precisa atualizar suas coordenadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAddress && (
          <p className="text-sm text-amber-700">
            ⚠️ Você precisa cadastrar seu endereço completo primeiro. Vá em "Completar Verificação" para adicionar.
          </p>
        )}
        {hasAddress && (
          <>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Endereço cadastrado:</p>
              <p>
                {profile.address}, {profile.city} - {profile.state}
                {profile.zip_code && ` (CEP: ${profile.zip_code})`}
              </p>
            </div>
            <Button
              onClick={handleUpdateCoordinates}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? "Atualizando..." : "📍 Atualizar Minha Localização no Mapa"}
            </Button>
            {message && (
              <div
                className={`p-3 rounded-md text-sm whitespace-pre-line ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}


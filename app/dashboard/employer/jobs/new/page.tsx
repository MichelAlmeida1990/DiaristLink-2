"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import Logo from "@/components/Logo"

const SERVICE_TYPES = [
  "Limpeza Geral",
  "Limpeza Pesada",
  "Organização",
  "Lavanderia",
  "Cozinha",
  "Banheiro",
  "Jardim",
  "Outro",
]

const JOB_TITLES = [
  "Limpeza completa do apartamento",
  "Limpeza completa da casa",
  "Limpeza semanal",
  "Limpeza mensal",
  "Limpeza pós-obra",
  "Limpeza de cozinha",
  "Limpeza de banheiros",
  "Limpeza de vidros e janelas",
  "Organização de armários",
  "Organização de quartos",
  "Organização de escritório",
  "Lavagem de roupas",
  "Passar roupas",
  "Limpeza de tapetes",
  "Limpeza de estofados",
  "Limpeza de área externa",
  "Limpeza de garagem",
  "Limpeza de quintal",
  "Limpeza de piscina",
  "Limpeza de churrasqueira",
  "Limpeza de forno",
  "Limpeza de geladeira",
  "Limpeza de micro-ondas",
  "Limpeza de fogão",
  "Limpeza de cortinas",
  "Limpeza de persianas",
  "Limpeza de lustres",
  "Limpeza de ventiladores",
  "Limpeza de ar condicionado",
  "Limpeza de pós-festa",
  "Limpeza de mudança",
  "Limpeza comercial",
  "Limpeza de escritório",
  "Limpeza de loja",
  "Limpeza de consultório",
]

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    service_type: "Limpeza Geral",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    price: "",
    duration_hours: "2",
    scheduled_at: "",
  })
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingCoords, setLoadingCoords] = useState(false)
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false)
  const [filteredTitles, setFilteredTitles] = useState<string[]>([])

  // Validação para verificar se o formulário está válido
  const isFormValid = () => {
    const cepDigits = formData.cep.replace(/\D/g, "")
    const price = parseFloat(formData.price)
    const duration = parseFloat(formData.duration_hours)
    
    return (
      formData.title.trim() !== "" &&
      formData.service_type !== "" &&
      cepDigits.length === 8 &&
      formData.address.trim() !== "" &&
      formData.neighborhood.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim().length === 2 &&
      !isNaN(price) &&
      price > 0 &&
      !isNaN(duration) &&
      duration > 0 &&
      formData.scheduled_at !== ""
    )
  }

  // Buscar coordenadas a partir do endereço
  const fetchCoordinates = async (address: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      if (data && data.lat && data.lon) {
        return { lat: data.lat, lon: data.lon }
      }
      
      return null
    } catch (err) {
      console.error("Erro ao buscar coordenadas:", err)
      return null
    }
  }

  const handleCepSearch = async () => {
    const cep = formData.cep.replace(/\D/g, "")
    
    if (cep.length !== 8) {
      setError("CEP deve conter 8 dígitos")
      return
    }

    setLoadingCep(true)
    setError("")
    setAddressCoords(null)

    try {
      const response = await fetch(`/api/cep/${cep}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "CEP não encontrado")
        return
      }

      setFormData({
        ...formData,
        address: data.address || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
      })

      // Buscar coordenadas automaticamente após buscar CEP
      setLoadingCoords(true)
      const addressForGeocode = `${data.address || ""}, ${data.neighborhood || ""}, ${data.city || ""}, ${data.state || ""}, Brasil`.replace(/,\s*,/g, ",").replace(/^,\s*|\s*,$/g, "")
      
      const coords = await fetchCoordinates(addressForGeocode)
      
      if (coords) {
        setAddressCoords(coords)
      } else {
        // Não mostrar erro, apenas não ter coordenadas
        console.log("Coordenadas não encontradas para o CEP")
      }
    } catch (err) {
      setError("Erro ao buscar CEP")
    } finally {
      setLoadingCep(false)
      setLoadingCoords(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const fullAddress = `${formData.address}${formData.number ? `, ${formData.number}` : ""}${formData.complement ? ` - ${formData.complement}` : ""}, ${formData.neighborhood}, ${formData.city} - ${formData.state}`

    // Se não temos coordenadas ainda, tentar buscar antes de salvar
    let coords = addressCoords
    if (!coords) {
      setLoadingCoords(true)
      try {
        // Construir endereço completo com todos os campos disponíveis
        const addressParts = [
          formData.address.trim(),
          formData.number ? formData.number.trim() : null,
          formData.complement ? formData.complement.trim() : null,
          formData.neighborhood.trim(),
          formData.city.trim(),
          formData.state.trim(),
          "Brasil"
        ].filter(Boolean)
        
        const addressForGeocode = addressParts.join(", ")
        console.log("Buscando coordenadas para:", addressForGeocode)
        
        coords = await fetchCoordinates(addressForGeocode)
        
        if (coords) {
          setAddressCoords(coords)
          console.log("Coordenadas encontradas:", coords)
        } else {
          console.warn("Não foi possível encontrar coordenadas para o endereço")
          setError("Aviso: Não foi possível encontrar coordenadas para este endereço. O job será criado sem coordenadas e não aparecerá no mapa.")
        }
      } catch (err) {
        console.error("Erro ao buscar coordenadas no submit:", err)
        setError("Erro ao buscar coordenadas. O job será criado sem coordenadas.")
      } finally {
        setLoadingCoords(false)
      }
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { error: jobError } = await supabase.from("jobs").insert({
        employer_id: user.id,
        title: formData.title,
        description: formData.description,
        service_type: formData.service_type,
        address: fullAddress,
        latitude: coords?.lat || null,
        longitude: coords?.lon || null,
        price: parseFloat(formData.price),
        duration_hours: parseFloat(formData.duration_hours),
        scheduled_at: formData.scheduled_at,
        status: "pending",
      })

      if (jobError) throw jobError

      router.push("/dashboard/employer")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Erro ao criar job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Novo Job</span>
            </div>
            <Link href="/dashboard/employer">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Job</CardTitle>
            <CardDescription>
              Preencha os detalhes do serviço que você precisa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Título do Job *</Label>
                <div className="relative">
                  <Input
                    id="title"
                    required
                    placeholder="Digite ou selecione um título"
                    value={formData.title}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({ ...formData, title: value })
                      
                      if (value.length > 0) {
                        const filtered = JOB_TITLES.filter(title =>
                          title.toLowerCase().includes(value.toLowerCase())
                        )
                        setFilteredTitles(filtered.slice(0, 5))
                        setShowTitleSuggestions(filtered.length > 0)
                      } else {
                        setShowTitleSuggestions(false)
                      }
                    }}
                    onFocus={() => {
                      if (formData.title.length > 0) {
                        const filtered = JOB_TITLES.filter(title =>
                          title.toLowerCase().includes(formData.title.toLowerCase())
                        )
                        setFilteredTitles(filtered.slice(0, 5))
                        setShowTitleSuggestions(filtered.length > 0)
                      } else {
                        setFilteredTitles(JOB_TITLES.slice(0, 5))
                        setShowTitleSuggestions(true)
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowTitleSuggestions(false), 200)
                    }}
                    disabled={loading}
                  />
                  {showTitleSuggestions && filteredTitles.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredTitles.map((title, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => {
                            setFormData({ ...formData, title })
                            setShowTitleSuggestions(false)
                          }}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-gray-500">Sugestões rápidas:</span>
                  {JOB_TITLES.slice(0, 5).map((title, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, title })}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      disabled={loading}
                    >
                      {title.length > 30 ? `${title.substring(0, 30)}...` : title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Descreva os detalhes do serviço necessário..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_type">Tipo de Serviço *</Label>
                  <select
                    id="service_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    disabled={loading}
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duração Estimada (horas) *</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      required
                      placeholder="00000-000"
                      value={formData.cep}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        const formatted = value.replace(/(\d{5})(\d)/, "$1-$2")
                        setFormData({ ...formData, cep: formatted })
                      }}
                      disabled={loading || loadingCep}
                      maxLength={9}
                    />
                    <Button
                      type="button"
                      onClick={handleCepSearch}
                      disabled={loading || loadingCep || formData.cep.length < 8}
                    >
                      {loadingCep ? "Buscando..." : "Buscar CEP"}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Rua/Avenida *</Label>
                    <Input
                      id="address"
                      required
                      placeholder="Nome da rua"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      placeholder="123"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      placeholder="Apto, Bloco, etc"
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      required
                      placeholder="Nome do bairro"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      required
                      placeholder="Nome da cidade"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      required
                      placeholder="SP"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      disabled={loading}
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Feedback de coordenadas */}
                {loadingCoords && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <span className="animate-spin">⏳</span>
                    <span>Buscando coordenadas...</span>
                  </div>
                )}
                {!loadingCoords && addressCoords && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                    <span>✅</span>
                    <span>Coordenadas encontradas: {addressCoords.lat.toFixed(6)}, {addressCoords.lon.toFixed(6)}</span>
                  </div>
                )}
                {!loadingCoords && !addressCoords && formData.address && formData.city && formData.state && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                    <span>⚠️</span>
                    <span>Coordenadas não encontradas. O job será criado sem coordenadas.</span>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">Data e Hora *</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    required
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading || !isFormValid()}
                >
                  {loading ? "Criando..." : "Criar Job"}
                </Button>
                <Link href="/dashboard/employer" className="flex-1">
                  <Button type="button" variant="outline" className="w-full" disabled={loading}>
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


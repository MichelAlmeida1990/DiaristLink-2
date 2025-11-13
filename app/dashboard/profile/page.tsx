"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { LogoutButton } from "@/components/auth/LogoutButton"
import Logo from "@/components/Logo"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
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

    if (profileData) {
      setProfile(profileData)
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        bio: profileData.bio || "",
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zip_code: profileData.zip_code || "",
      })
      if (profileData.avatar_url) {
        setAvatarPreview(profileData.avatar_url)
      }
      if (profileData.latitude && profileData.longitude) {
        setAddressCoords({
          lat: parseFloat(profileData.latitude.toString()),
          lon: parseFloat(profileData.longitude.toString()),
        })
      }
    }
  }

  const handleCepSearch = async () => {
    const cep = formData.zip_code.replace(/\D/g, "")
    
    if (cep.length !== 8) {
      alert("CEP deve conter 8 dígitos")
      return
    }

    setLoadingCep(true)

    try {
      const response = await fetch(`/api/cep/${cep}`)
      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "CEP não encontrado")
        return
      }

      setFormData({
        ...formData,
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.cep || formData.zip_code,
      })

      const addressForGeocode = `${data.address || ""}, ${data.neighborhood || ""}, ${data.city || ""}, ${data.state || ""}, Brasil`.replace(/,\s*,/g, ",").replace(/^,\s*|\s*,$/g, "")
      
      const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(addressForGeocode)}`)
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json()
        
        if (geocodeData && geocodeData.lat && geocodeData.lon) {
          setAddressCoords({ lat: geocodeData.lat, lon: geocodeData.lon })
        }
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err)
    } finally {
      setLoadingCep(false)
    }
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/avatar.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        console.error("Erro ao fazer upload:", uploadError)
        return null
      }

      const { data } = await supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const updateData: any = {
        name: formData.name,
        phone: formData.phone || null,
        bio: formData.bio || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
      }

      if (avatarFile) {
        setUploading(true)
        const avatarUrl = await uploadAvatar(avatarFile)
        if (avatarUrl) {
          updateData.avatar_url = avatarUrl
        }
        setUploading(false)
      }

      if (addressCoords) {
        updateData.latitude = addressCoords.lat
        updateData.longitude = addressCoords.lon
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)

      if (error) throw error

      alert("Perfil atualizado com sucesso!")
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      alert("Erro ao atualizar perfil: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Carregando perfil...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dashboardPath = profile.role === "diarist" ? "/dashboard/diarist" : "/dashboard/employer"

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Editar Perfil</span>
            </div>
            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e localização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-4xl text-gray-400">
                        {formData.name.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>Alterar Foto</span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Email não pode ser alterado</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Conte um pouco sobre você..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Endereço</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="zip_code"
                      placeholder="00000-000"
                      value={formData.zip_code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        const formatted = value.replace(/(\d{5})(\d)/, "$1-$2")
                        setFormData({ ...formData, zip_code: formatted })
                      }}
                      disabled={loading || loadingCep}
                      maxLength={9}
                    />
                    <Button
                      type="button"
                      onClick={handleCepSearch}
                      disabled={loading || loadingCep || formData.zip_code.length < 8}
                    >
                      {loadingCep ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Rua/Avenida</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    disabled={loading}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>

                {addressCoords && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
                    ✅ Localização registrada: {addressCoords.lat.toFixed(6)}, {addressCoords.lon.toFixed(6)}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading || uploading}>
                  {uploading ? "Enviando foto..." : loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Link href={dashboardPath} className="flex-1">
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


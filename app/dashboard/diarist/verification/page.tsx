"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import UserMenu from "@/components/nav/UserMenu"
import Logo from "@/components/Logo"

interface Reference {
  id?: string
  name: string
  company: string
  position: string
  phone: string
  email: string
  relationship: string
  years_known: string
  can_contact: boolean
}

interface Certificate {
  id?: string
  name: string
  issuer: string
  issue_date: string
  expiry_date: string
  certificate_type: string
  file: File | null
}

export default function DiaristVerificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    cpf: "",
    criminal_record_check: false,
    has_insurance: false,
    background_check_provider: "",
  })
  const [files, setFiles] = useState({
    criminal_record: null as File | null,
    id_document: null as File | null,
    proof_of_address: null as File | null,
    insurance_policy: null as File | null,
  })
  const [references, setReferences] = useState<Reference[]>([
    { name: "", company: "", position: "", phone: "", email: "", relationship: "former_employer", years_known: "", can_contact: true }
  ])
  const [certificates, setCertificates] = useState<Certificate[]>([
    { name: "", issuer: "", issue_date: "", expiry_date: "", certificate_type: "cleaning", file: null }
  ])

  useEffect(() => {
    loadProfile()
    loadReferences()
    loadCertificates()
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
        cpf: profileData.cpf || "",
        criminal_record_check: profileData.criminal_record_check || false,
        has_insurance: profileData.has_insurance || false,
        background_check_provider: profileData.background_check_provider || "",
      })
    }
  }

  const loadReferences = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("professional_references")
      .select("*")
      .eq("diarist_id", user.id)
      .order("created_at", { ascending: false })

    if (data && data.length > 0) {
      setReferences(data.map((ref: any) => ({
        ...ref,
        years_known: ref.years_known?.toString() || "",
      })))
    }
  }

  const loadCertificates = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("diarist_id", user.id)
      .order("created_at", { ascending: false })

    if (data && data.length > 0) {
      setCertificates(data.map((cert: any) => ({
        ...cert,
        issue_date: cert.issue_date || "",
        expiry_date: cert.expiry_date || "",
        file: null,
      })))
    }
  }

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles({ ...files, [field]: file })
  }

  const addReference = () => {
    setReferences([...references, {
      name: "", company: "", position: "", phone: "", email: "",
      relationship: "former_employer", years_known: "", can_contact: true
    }])
  }

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index))
  }

  const updateReference = (index: number, field: keyof Reference, value: any) => {
    const updated = [...references]
    updated[index] = { ...updated[index], [field]: value }
    setReferences(updated)
  }

  const addCertificate = () => {
    setCertificates([...certificates, {
      name: "", issuer: "", issue_date: "", expiry_date: "",
      certificate_type: "cleaning", file: null
    }])
  }

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index))
  }

  const updateCertificate = (index: number, field: keyof Certificate, value: any) => {
    const updated = [...certificates]
    updated[index] = { ...updated[index], [field]: value }
    setCertificates(updated)
  }

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file)

    if (uploadError) {
      console.error("Erro ao fazer upload:", uploadError)
      return null
    }

    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath)

    return data.publicUrl
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
        cpf: formData.cpf,
        criminal_record_check: formData.criminal_record_check,
        has_insurance: formData.has_insurance,
        background_check_provider: formData.background_check_provider || null,
        verification_status: "pending",
      }

      // Upload de documentos básicos
      if (files.criminal_record) {
        setUploading("criminal_record")
        const url = await uploadFile(files.criminal_record, "criminal-records")
        if (url) updateData.criminal_record_url = url
        setUploading(null)
      }

      if (files.id_document) {
        setUploading("id_document")
        const url = await uploadFile(files.id_document, "id-documents")
        if (url) updateData.id_document_url = url
        setUploading(null)
      }

      if (files.proof_of_address) {
        setUploading("proof_of_address")
        const url = await uploadFile(files.proof_of_address, "proof-of-address")
        if (url) updateData.proof_of_address_url = url
        setUploading(null)
      }

      if (files.insurance_policy && formData.has_insurance) {
        setUploading("insurance_policy")
        const url = await uploadFile(files.insurance_policy, "insurance-policies")
        if (url) updateData.insurance_policy_url = url
        setUploading(null)
      }

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)

      if (profileError) throw profileError

      // Salvar referências
      for (const ref of references) {
        if (ref.name && ref.phone) {
          const refData: any = {
            diarist_id: user.id,
            name: ref.name,
            company: ref.company || null,
            position: ref.position || null,
            phone: ref.phone,
            email: ref.email || null,
            relationship: ref.relationship,
            years_known: ref.years_known ? parseInt(ref.years_known) : null,
            can_contact: ref.can_contact,
          }

          if (ref.id) {
            await supabase
              .from("professional_references")
              .update(refData)
              .eq("id", ref.id)
          } else {
            await supabase
              .from("professional_references")
              .insert(refData)
          }
        }
      }

      // Salvar certificados
      for (const cert of certificates) {
        if (cert.name && cert.issuer && cert.file) {
          setUploading(`certificate_${cert.name}`)
          const url = await uploadFile(cert.file, "certificates")
          setUploading(null)

          if (url) {
            const certData: any = {
              diarist_id: user.id,
              name: cert.name,
              issuer: cert.issuer,
              issue_date: cert.issue_date || null,
              expiry_date: cert.expiry_date || null,
              certificate_url: url,
              certificate_type: cert.certificate_type,
            }

            if (cert.id) {
              await supabase
                .from("certificates")
                .update(certData)
                .eq("id", cert.id)
            } else {
              await supabase
                .from("certificates")
                .insert(certData)
            }
          }
        }
      }

      alert("Documentos enviados com sucesso! Aguarde a verificação.")
      router.push("/dashboard/diarist")
    } catch (error: any) {
      alert("Erro ao enviar documentos: " + error.message)
    } finally {
      setLoading(false)
      setUploading(null)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verificationStatus = profile.verification_status || "pending"
  const isVerified = profile.is_verified || false

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Verificação</span>
            </div>
            <UserMenu role="diarist" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status da verificação */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Verificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${
              verificationStatus === "approved" ? "bg-green-50 border border-green-200" :
              verificationStatus === "rejected" ? "bg-red-50 border border-red-200" :
              "bg-yellow-50 border border-yellow-200"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {verificationStatus === "approved" ? "✅" :
                   verificationStatus === "rejected" ? "❌" : "⏳"}
                </span>
                <div>
                  <p className="font-medium">
                    {verificationStatus === "approved" ? "Verificação Aprovada" :
                     verificationStatus === "rejected" ? "Verificação Rejeitada" :
                     "Aguardando Verificação"}
                  </p>
                  {verificationStatus === "rejected" && profile.verification_notes && (
                    <p className="text-sm text-red-700 mt-1">
                      Motivo: {profile.verification_notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Documentos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos Básicos</CardTitle>
              <CardDescription>Informações e documentos obrigatórios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  required
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  disabled={loading || isVerified}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="criminal_record_check"
                  checked={formData.criminal_record_check}
                  onChange={(e) => setFormData({ ...formData, criminal_record_check: e.target.checked })}
                  disabled={loading || isVerified}
                  className="w-4 h-4"
                />
                <Label htmlFor="criminal_record_check" className="cursor-pointer">
                  Declaro que não possuo antecedentes criminais *
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Certidão de Antecedentes Criminais *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("criminal_record", e.target.files?.[0] || null)}
                  disabled={loading || isVerified || uploading !== null}
                />
                {files.criminal_record && <p className="text-sm text-green-600">✓ {files.criminal_record.name}</p>}
                {profile.criminal_record_url && <p className="text-sm text-blue-600">📄 Documento já enviado</p>}
              </div>

              <div className="space-y-2">
                <Label>Documento de Identidade (RG ou CNH) *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("id_document", e.target.files?.[0] || null)}
                  disabled={loading || isVerified || uploading !== null}
                />
                {files.id_document && <p className="text-sm text-green-600">✓ {files.id_document.name}</p>}
                {profile.id_document_url && <p className="text-sm text-blue-600">📄 Documento já enviado</p>}
              </div>

              <div className="space-y-2">
                <Label>Comprovante de Endereço *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("proof_of_address", e.target.files?.[0] || null)}
                  disabled={loading || isVerified || uploading !== null}
                />
                {files.proof_of_address && <p className="text-sm text-green-600">✓ {files.proof_of_address.name}</p>}
                {profile.proof_of_address_url && <p className="text-sm text-blue-600">📄 Documento já enviado</p>}
              </div>
            </CardContent>
          </Card>

          {/* Seguro */}
          <Card>
            <CardHeader>
              <CardTitle>Seguro de Responsabilidade Civil</CardTitle>
              <CardDescription>Opcional, mas recomendado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="has_insurance"
                  checked={formData.has_insurance}
                  onChange={(e) => setFormData({ ...formData, has_insurance: e.target.checked })}
                  disabled={loading || isVerified}
                  className="w-4 h-4"
                />
                <Label htmlFor="has_insurance" className="cursor-pointer">
                  Possuo seguro de responsabilidade civil
                </Label>
              </div>

              {formData.has_insurance && (
                <>
                  <div className="space-y-2">
                    <Label>Apólice do Seguro</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange("insurance_policy", e.target.files?.[0] || null)}
                      disabled={loading || isVerified || uploading !== null}
                    />
                    {files.insurance_policy && <p className="text-sm text-green-600">✓ {files.insurance_policy.name}</p>}
                    {profile.insurance_policy_url && <p className="text-sm text-blue-600">📄 Apólice já enviada</p>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Background Check */}
          <Card>
            <CardHeader>
              <CardTitle>Background Check</CardTitle>
              <CardDescription>Verificação de antecedentes profissional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background_check_provider">Provedor do Background Check</Label>
                <select
                  id="background_check_provider"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.background_check_provider}
                  onChange={(e) => setFormData({ ...formData, background_check_provider: e.target.value })}
                  disabled={loading || isVerified}
                >
                  <option value="">Selecione...</option>
                  <option value="serasa">Serasa</option>
                  <option value="quod">Quod</option>
                  <option value="checkr">Checkr</option>
                  <option value="other">Outro</option>
                </select>
                <p className="text-xs text-gray-500">
                  Se você já possui um background check de um provedor confiável, informe aqui
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Referências Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle>Referências Profissionais</CardTitle>
              <CardDescription>Adicione pelo menos 2 referências</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {references.map((ref, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Referência {index + 1}</h4>
                    {references.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeReference(index)}
                        disabled={loading || isVerified}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Nome *</Label>
                      <Input
                        required
                        value={ref.name}
                        onChange={(e) => updateReference(index, "name", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Telefone *</Label>
                      <Input
                        required
                        value={ref.phone}
                        onChange={(e) => updateReference(index, "phone", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Empresa</Label>
                      <Input
                        value={ref.company}
                        onChange={(e) => updateReference(index, "company", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Cargo</Label>
                      <Input
                        value={ref.position}
                        onChange={(e) => updateReference(index, "position", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={ref.email}
                        onChange={(e) => updateReference(index, "email", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Relação *</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={ref.relationship}
                        onChange={(e) => updateReference(index, "relationship", e.target.value)}
                        disabled={loading || isVerified}
                      >
                        <option value="former_employer">Ex-empregador</option>
                        <option value="client">Cliente</option>
                        <option value="colleague">Colega</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Anos conhecido(a)</Label>
                      <Input
                        type="number"
                        value={ref.years_known}
                        onChange={(e) => updateReference(index, "years_known", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={ref.can_contact}
                        onChange={(e) => updateReference(index, "can_contact", e.target.checked)}
                        disabled={loading || isVerified}
                        className="w-4 h-4 mr-2"
                      />
                      <Label>Pode entrar em contato</Label>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addReference}
                disabled={loading || isVerified}
              >
                + Adicionar Referência
              </Button>
            </CardContent>
          </Card>

          {/* Certificados */}
          <Card>
            <CardHeader>
              <CardTitle>Certificados e Cursos</CardTitle>
              <CardDescription>Adicione seus certificados profissionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.map((cert, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Certificado {index + 1}</h4>
                    {certificates.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCertificate(index)}
                        disabled={loading || isVerified}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Nome do Certificado *</Label>
                      <Input
                        required
                        value={cert.name}
                        onChange={(e) => updateCertificate(index, "name", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Emissor *</Label>
                      <Input
                        required
                        value={cert.issuer}
                        onChange={(e) => updateCertificate(index, "issuer", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Tipo</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={cert.certificate_type}
                        onChange={(e) => updateCertificate(index, "certificate_type", e.target.value)}
                        disabled={loading || isVerified}
                      >
                        <option value="cleaning">Limpeza</option>
                        <option value="hygiene">Higiene</option>
                        <option value="safety">Segurança</option>
                        <option value="first_aid">Primeiros Socorros</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Data de Emissão</Label>
                      <Input
                        type="date"
                        value={cert.issue_date}
                        onChange={(e) => updateCertificate(index, "issue_date", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Data de Validade</Label>
                      <Input
                        type="date"
                        value={cert.expiry_date}
                        onChange={(e) => updateCertificate(index, "expiry_date", e.target.value)}
                        disabled={loading || isVerified}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Arquivo do Certificado *</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => updateCertificate(index, "file", e.target.files?.[0] || null)}
                        disabled={loading || isVerified || uploading !== null}
                      />
                      {cert.file && <p className="text-sm text-green-600">✓ {cert.file.name}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCertificate}
                disabled={loading || isVerified}
              >
                + Adicionar Certificado
              </Button>
            </CardContent>
          </Card>

          {uploading && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                ⏳ Enviando {uploading}...
              </p>
            </div>
          )}

          {!isVerified && (
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || uploading !== null} className="flex-1">
                {loading ? "Enviando..." : "Enviar Documentos"}
              </Button>
              <Link href="/dashboard/diarist">
                <Button type="button" variant="outline" disabled={loading}>
                  Voltar
                </Button>
              </Link>
            </div>
          )}

          {isVerified && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Sua verificação foi aprovada! Você pode receber jobs agora.
              </p>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}

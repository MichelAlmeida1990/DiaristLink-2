"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const roleParam = searchParams.get('role')

      if (!code) {
        router.push('/login')
        return
      }

      const supabase = createClient()

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Erro ao trocar código por sessão:', error)
          router.push(`/login?error=${encodeURIComponent(error.message)}`)
          return
        }

        // Buscar perfil do usuário
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          // Se não tem perfil e veio com role param, criar perfil
          if (!profile && roleParam) {
            const email = user.email || ''
            const name = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.user_metadata?.email?.split('@')[0] || 
                        email.split('@')[0]

            // Criar perfil diretamente no banco
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                name,
                email,
                role: roleParam,
              })

            if (!insertError) {
              // Redirecionar baseado no role
              if (roleParam === 'diarist') {
                router.push('/dashboard/diarist')
              } else {
                router.push('/dashboard/employer')
              }
              return
            } else {
              console.error('Erro ao criar perfil:', insertError)
            }
          }

          // Redirecionar baseado no perfil existente ou role param
          if (profile?.role === 'diarist' || roleParam === 'diarist') {
            router.push('/dashboard/diarist')
          } else {
            router.push('/dashboard/employer')
          }
        }
      } catch (err: any) {
        console.error('Erro no callback:', err)
        router.push(`/login?error=${encodeURIComponent(err.message || 'Erro desconhecido')}`)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}


import { createClient } from '@/lib/supabase/client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { isCapacitor } from './capacitor'

/**
 * Atualiza o status de um job
 * Funciona tanto na web (usando API route) quanto no mobile (usando Supabase direto)
 */
export async function updateJobStatus(jobId: string, status: string): Promise<{ job: any }> {
  // Se estiver no mobile, usar Supabase direto
  if (isCapacitor()) {
    return updateJobStatusMobile(jobId, status)
  }

  // Na web, usar API route
  const response = await fetch(`/api/jobs/${jobId}/update-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Erro ao atualizar status')
  }

  return await response.json()
}

/**
 * Atualiza o status de um job no mobile (usando Supabase direto)
 */
async function updateJobStatusMobile(jobId: string, status: string): Promise<{ job: any }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autenticado')
  }

  // Buscar o job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    throw new Error('Job não encontrado')
  }

  // Verificar permissões
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('Perfil não encontrado')
  }

  // Validações de transição de status (mesmas da API route)
  if (profile.role === 'employer') {
    if (status === 'cancelled') {
      if (!['pending', 'accepted'].includes(job.status)) {
        throw new Error('Apenas jobs pendentes ou aceitos podem ser cancelados')
      }
    } else if (status === 'in_progress') {
      if (job.status !== 'accepted') {
        throw new Error('Apenas jobs aceitos podem ser iniciados')
      }
    } else if (status === 'completed') {
      if (job.status !== 'in_progress') {
        throw new Error('Apenas jobs em andamento podem ser finalizados')
      }
    } else {
      throw new Error('Operação não permitida para empregador')
    }
  } else if (profile.role === 'diarist') {
    if (status === 'accepted') {
      if (job.status !== 'pending') {
        throw new Error('Apenas jobs pendentes podem ser aceitos')
      }
      if (job.diarist_id) {
        throw new Error('Este job já foi aceito por outra diarista')
      }
      // Verificar se a diarista já tem um job ativo
      const { data: activeJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('diarist_id', user.id)
        .in('status', ['accepted', 'in_progress'])
        .limit(1)
      
      if (activeJobs && activeJobs.length > 0) {
        throw new Error('Você já tem um job ativo. Finalize ou cancele o job atual antes de aceitar outro.')
      }
    } else if (status === 'in_progress') {
      if (job.status !== 'accepted' || job.diarist_id !== user.id) {
        throw new Error('Apenas jobs aceitos por você podem ser iniciados')
      }
    } else if (status === 'completed') {
      if (job.status !== 'in_progress' || job.diarist_id !== user.id) {
        throw new Error('Apenas jobs em andamento que você está executando podem ser finalizados')
      }
    } else {
      throw new Error('Operação não permitida para diarista')
    }
  }

  // Preparar dados para atualização
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  // Se está aceitando um job, definir diarist_id
  // Nota: No mobile, precisamos usar uma Edge Function ou ajustar RLS
  // Por enquanto, vamos tentar atualizar diretamente
  if (status === 'accepted' && job.status === 'pending' && profile.role === 'diarist') {
    updateData.diarist_id = user.id
  }

  // Tentar atualizar (pode falhar devido a RLS - precisará de Edge Function)
  const { data: updatedJob, error: updateError } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', jobId)
    .select()
    .single()

  if (updateError) {
    // Se falhar por RLS, sugerir usar Edge Function
    if (updateError.message.includes('permission') || updateError.message.includes('policy')) {
      throw new Error('Permissão negada. É necessário usar uma Edge Function do Supabase para aceitar jobs no mobile.')
    }
    throw new Error(updateError.message)
  }

  return { job: updatedJob }
}





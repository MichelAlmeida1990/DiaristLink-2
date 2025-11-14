import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: "Status é obrigatório" },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Buscar o job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job não encontrado" },
        { status: 404 }
      )
    }

    // Verificar permissões
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      )
    }

    // Validações de transição de status
    if (profile.role === "employer") {
      // Empregador pode: cancelar (pending/accepted), iniciar (accepted), finalizar (in_progress)
      if (status === "cancelled") {
        if (!["pending", "accepted"].includes(job.status)) {
          return NextResponse.json(
            { error: "Apenas jobs pendentes ou aceitos podem ser cancelados" },
            { status: 400 }
          )
        }
      } else if (status === "in_progress") {
        if (job.status !== "accepted") {
          return NextResponse.json(
            { error: "Apenas jobs aceitos podem ser iniciados" },
            { status: 400 }
          )
        }
      } else if (status === "completed") {
        if (job.status !== "in_progress") {
          return NextResponse.json(
            { error: "Apenas jobs em andamento podem ser finalizados" },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: "Operação não permitida para empregador" },
          { status: 403 }
        )
      }
    } else if (profile.role === "diarist") {
      // Diarista pode: aceitar (pending → accepted), iniciar (accepted), finalizar (in_progress)
      if (status === "accepted") {
        // Aceitar um job pendente
        if (job.status !== "pending") {
          return NextResponse.json(
            { error: "Apenas jobs pendentes podem ser aceitos" },
            { status: 400 }
          )
        }
        if (job.diarist_id) {
          return NextResponse.json(
            { error: "Este job já foi aceito por outra diarista" },
            { status: 400 }
          )
        }
        // Verificar se a diarista já tem um job ativo
        const { data: activeJobs } = await supabase
          .from("jobs")
          .select("id")
          .eq("diarist_id", user.id)
          .in("status", ["accepted", "in_progress"])
          .limit(1)
        
        if (activeJobs && activeJobs.length > 0) {
          return NextResponse.json(
            { error: "Você já tem um job ativo. Finalize ou cancele o job atual antes de aceitar outro." },
            { status: 400 }
          )
        }
      } else if (status === "in_progress") {
        if (job.status !== "accepted" || job.diarist_id !== user.id) {
          return NextResponse.json(
            { error: "Apenas jobs aceitos por você podem ser iniciados" },
            { status: 400 }
          )
        }
      } else if (status === "completed") {
        if (job.status !== "in_progress" || job.diarist_id !== user.id) {
          return NextResponse.json(
            { error: "Apenas jobs em andamento que você está executando podem ser finalizados" },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: "Operação não permitida para diarista" },
          { status: 403 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }
    
    // Se está aceitando um job (pending → accepted), também definir diarist_id
    // Usar service_role para contornar RLS quando necessário
    const shouldUseServiceRole = status === "accepted" && job.status === "pending" && profile.role === "diarist"
    
    if (shouldUseServiceRole) {
      updateData.diarist_id = user.id
    }

    // Usar service_role se necessário para contornar RLS, senão usar cliente normal
    const updateClient = shouldUseServiceRole ? createServiceRoleClient() : supabase

    // Atualizar status
    const { data: updatedJob, error: updateError } = await updateClient
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Erro ao atualizar job:", updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ job: updatedJob })
  } catch (error: any) {
    console.error("Erro ao atualizar status do job:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar status" },
      { status: 500 }
    )
  }
}


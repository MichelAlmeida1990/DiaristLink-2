import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { cep: string } }
) {
  try {
    const cep = params.cep.replace(/\D/g, "")

    if (cep.length !== 8) {
      return NextResponse.json(
        { error: "CEP deve conter 8 dígitos" },
        { status: 400 }
      )
    }

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar CEP" },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (data.erro) {
      return NextResponse.json(
        { error: "CEP não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      cep: data.cep,
      address: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      fullAddress: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
    })
  } catch (error: any) {
    console.error("Erro ao buscar CEP:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar CEP" },
      { status: 500 }
    )
  }
}



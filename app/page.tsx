import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900">
            DiaristaLink 🧹✨
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Marketplace de serviços domésticos on-demand. 
            Conecte-se com diaristas profissionais em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Precisa de Ajuda? Encontre uma Diarista Agora!
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Já tem conta? Entrar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Por que escolher DiaristaLink?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-2">Matching Instantâneo</h3>
              <p className="text-gray-600">
                Encontre diaristas próximas baseado em localização GPS em tempo real
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Chat em Tempo Real</h3>
              <p className="text-gray-600">
                Comunicação direta com sua diarista através de chat integrado
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Profissionais Avaliados</h3>
              <p className="text-gray-600">
                Diaristas verificadas com avaliações de outros clientes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Cadastre-se", desc: "Crie sua conta como empregador ou diarista" },
              { step: "2", title: "Encontre ou Seja Encontrado", desc: "Empregadores encontram diaristas próximas, diaristas recebem propostas" },
              { step: "3", title: "Conecte-se", desc: "Use o chat para combinar detalhes do serviço" },
              { step: "4", title: "Serviço Realizado", desc: "Avalie e finalize o serviço com segurança" },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-xl">
            Junte-se à nossa comunidade de empregadores e diaristas profissionais
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

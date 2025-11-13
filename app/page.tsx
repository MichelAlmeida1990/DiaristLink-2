"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import AnimatedText from "@/components/AnimatedText";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-4 animate-fade-in">
            <Logo size="lg" />
          </div>
          
          <div className="animate-fade-in-up delay-100">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
              <AnimatedText 
                text="Encontre o Profissional Perfeito"
                className="block"
              />
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto animate-fade-in-up delay-400 font-medium drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)' }}>
            Marketplace de serviços domésticos on-demand. 
            Conecte-se com profissionais qualificados em tempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
            <Link href="/signup" className="group">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold"
              >
                Precisa de Ajuda? Encontre uma Diarista Agora!
              </Button>
            </Link>
            <Link href="/login" className="group">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-300 font-semibold backdrop-blur-sm"
              >
                Já tem conta? Entrar
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute bottom-20 left-10 animate-float delay-200">
          <div className="text-4xl opacity-20">🧹</div>
        </div>
        <div className="absolute top-40 right-20 animate-float delay-400">
          <div className="text-4xl opacity-20">✨</div>
        </div>
        <div className="absolute top-60 left-20 animate-float delay-600">
          <div className="text-4xl opacity-20">💧</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up delay-100">
            Por que escolher <span className="animated-gradient">Empreguetes.com</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-purple-50 animate-scale-in delay-200 group cursor-pointer">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📍</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Matching Instantâneo</h3>
              <p className="text-gray-600">
                Encontre diaristas próximas baseado em localização GPS em tempo real
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50 animate-scale-in delay-300 group cursor-pointer">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💬</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Chat em Tempo Real</h3>
              <p className="text-gray-600">
                Comunicação direta com sua diarista através de chat integrado
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-pink-50 to-blue-50 animate-scale-in delay-400 group cursor-pointer">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⭐</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Profissionais Avaliados</h3>
              <p className="text-gray-600">
                Diaristas verificadas com avaliações de outros clientes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up delay-100">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Cadastre-se", desc: "Crie sua conta como empregador ou diarista", icon: "👤" },
              { step: "2", title: "Encontre ou Seja Encontrado", desc: "Empregadores encontram diaristas próximas, diaristas recebem propostas", icon: "🔍" },
              { step: "3", title: "Conecte-se", desc: "Use o chat para combinar detalhes do serviço", icon: "💬" },
              { step: "4", title: "Serviço Realizado", desc: "Avalie e finalize o serviço com segurança", icon: "✅" },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer bg-white border-2 border-transparent hover:border-blue-200 animate-scale-in"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {item.icon}
                </div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4 -mt-8 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl animate-float">🧹</div>
          <div className="absolute bottom-10 right-10 text-6xl animate-float delay-300">✨</div>
          <div className="absolute top-1/2 left-1/4 text-5xl animate-float delay-200">💧</div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold animate-fade-in-up delay-100">
            Pronto para começar?
          </h2>
          <p className="text-xl md:text-2xl animate-fade-in-up delay-200">
            Junte-se à nossa comunidade de empregadores e diaristas profissionais
          </p>
          <div className="animate-fade-in-up delay-300">
            <Link href="/signup">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold"
              >
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

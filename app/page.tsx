"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import AnimatedText from "@/components/AnimatedText";
import CleaningIllustration from "@/components/illustrations/CleaningIllustration";
import LocationIcon from "@/components/illustrations/LocationIcon";
import ChatIcon from "@/components/illustrations/ChatIcon";
import StarIcon from "@/components/illustrations/StarIcon";
import StepIllustration from "@/components/illustrations/StepIllustration";
import SparkleIcon from "@/components/illustrations/SparkleIcon";

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
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="text-center lg:text-left space-y-8">
              <div className="flex justify-center lg:justify-start mb-4 animate-fade-in">
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
              
              <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-400 font-medium drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)' }}>
                Marketplace de serviços domésticos on-demand. 
                Conecte-se com profissionais qualificados em tempo real.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-500">
                <Link href="/login?role=diarist" className="group">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold"
                  >
                    Começar Agora
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
            
            {/* Right side - Illustration */}
            <div className="hidden lg:flex justify-center items-center animate-fade-in-up delay-300">
              <div className="relative">
                <CleaningIllustration size={400} className="drop-shadow-2xl" />
                <div className="absolute top-10 -left-10 animate-float delay-200">
                  <SparkleIcon size={32} color="#FFB156" />
                </div>
                <div className="absolute bottom-20 -right-10 animate-float delay-400">
                  <SparkleIcon size={24} color="#F1CB5E" />
                </div>
                <div className="absolute top-1/2 -right-5 animate-float delay-600">
                  <SparkleIcon size={20} color="#8B5CF6" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute bottom-20 left-10 animate-float delay-200 opacity-30">
          <CleaningIllustration size={120} />
        </div>
        <div className="absolute top-40 right-20 animate-float delay-400 opacity-20">
          <SparkleIcon size={48} color="#FFB156" />
        </div>
        <div className="absolute top-60 left-20 animate-float delay-600 opacity-25">
          <SparkleIcon size={40} color="#8B5CF6" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up delay-100">
            Por que escolher <span className="animated-gradient">Empreguetes.com</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-purple-50 animate-scale-in delay-200 group cursor-pointer border border-blue-100">
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <LocationIcon size={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Matching Instantâneo</h3>
              <p className="text-gray-600">
                Encontre diaristas próximas baseado em localização GPS em tempo real
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50 animate-scale-in delay-300 group cursor-pointer border border-purple-100">
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ChatIcon size={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Chat em Tempo Real</h3>
              <p className="text-gray-600">
                Comunicação direta com sua diarista através de chat integrado
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-pink-50 to-blue-50 animate-scale-in delay-400 group cursor-pointer border border-pink-100">
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <StarIcon size={64} />
              </div>
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
              { step: 1, title: "Cadastre-se", desc: "Crie sua conta como empregador ou diarista" },
              { step: 2, title: "Encontre ou Seja Encontrado", desc: "Empregadores encontram diaristas próximas, diaristas recebem propostas" },
              { step: 3, title: "Conecte-se", desc: "Use o chat para combinar detalhes do serviço" },
              { step: 4, title: "Serviço Realizado", desc: "Avalie e finalize o serviço com segurança" },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer bg-white border-2 border-gray-100 hover:border-blue-300 animate-scale-in relative overflow-hidden"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full p-4 shadow-lg">
                        <StepIllustration step={item.step} size={48} />
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 -mt-6 relative z-20 shadow-md">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 animate-float delay-200">
            <CleaningIllustration size={100} />
          </div>
          <div className="absolute bottom-10 right-10 animate-float delay-300">
            <SparkleIcon size={80} color="#FFB156" />
          </div>
          <div className="absolute top-1/2 left-1/4 animate-float delay-400">
            <SparkleIcon size={60} color="#F1CB5E" />
          </div>
          <div className="absolute top-20 right-1/3 animate-float delay-500">
            <SparkleIcon size={50} color="#8B5CF6" />
          </div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Illustration */}
            <div className="hidden lg:flex justify-center animate-fade-in-up delay-200">
              <CleaningIllustration size={300} className="drop-shadow-2xl" />
            </div>
            
            {/* Right side - Text */}
            <div className="text-center lg:text-left space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold animate-fade-in-up delay-100">
                Pronto para começar?
              </h2>
              <p className="text-xl md:text-2xl text-white/90 animate-fade-in-up delay-200">
                Junte-se à nossa comunidade de empregadores e diaristas profissionais. Encontre ou ofereça serviços de limpeza de forma rápida e segura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
                <Link href="/login?role=diarist">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold"
                  >
                    Começar Agora
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 font-semibold backdrop-blur-sm"
                  >
                    Entrar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

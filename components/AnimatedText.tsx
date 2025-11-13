"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedTextProps {
  text: string
  className?: string
}

export default function AnimatedText({ text, className = "" }: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sparks, setSparks] = useState<Array<{ id: number; x: number; y: number }>>([])
  const sparkIdRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let count = 0
    const interval = setInterval(() => {
      count++
      
      // Animar opacidade das camadas de blur
      const blurLayers = container.querySelectorAll('.blur-layer')
      blurLayers.forEach((layer) => {
        const element = layer as HTMLElement
        if (count % 12 === 0) {
          const opacity = Math.random() * 0.3 + 0.4
          element.style.opacity = opacity.toString()
        }
      })

      // Criar partículas esporádicas
      if (count % 22 === 0 && Math.random() > 0.5) {
        const rect = container.getBoundingClientRect()
        const x = Math.random() * rect.width
        const y = Math.random() * rect.height
        const newSpark = { id: sparkIdRef.current++, x, y }
        setSparks(prev => [...prev, newSpark])
        
        setTimeout(() => {
          setSparks(prev => prev.filter(s => s.id !== newSpark.id))
        }, 2000)
      }
    }, 100)

    // Função para criar faíscas no hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Criar múltiplas faíscas ao redor do cursor
      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 100
        const offsetY = (Math.random() - 0.5) * 100
        const newSpark = { 
          id: sparkIdRef.current++, 
          x: x + offsetX, 
          y: y + offsetY 
        }
        setSparks(prev => [...prev, newSpark])
        
        setTimeout(() => {
          setSparks(prev => prev.filter(s => s.id !== newSpark.id))
        }, 1500)
      }
    }

    container.addEventListener('mousemove', handleMouseMove)

    return () => {
      clearInterval(interval)
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const words = text.split(' ')
  const lastWordIndex = words.length - 1

  return (
    <>
      <style jsx>{`
        @keyframes sparkFloat {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(var(--dx) * 1px),
              calc(var(--dy) * 1px)
            ) scale(0);
          }
        }

        .spark {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #FFB156;
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 10px #FFB156, 0 0 20px #F1CB5E;
          animation: sparkFloat 2s ease-out forwards;
        }

        .text-container {
          position: relative;
          display: inline-block;
          color: #1a1a1a;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5);
          min-height: 1.2em;
        }

        .text-layer {
          position: absolute;
          top: 0;
          left: 0;
          white-space: normal;
          color: white;
          width: 100%;
        }

        .blur-layer {
          filter: blur(8px);
          opacity: 0.3;
          transition: opacity 0.3s ease;
          color: #EE2211;
        }

        .blur-layer-2 {
          filter: blur(4px);
          opacity: 0.4;
          transition: opacity 0.3s ease;
          color: #EE2211;
        }

        .blur-layer-3 {
          filter: blur(2px);
          opacity: 0.5;
          transition: opacity 0.3s ease;
          color: white;
        }

        .main-layer {
          position: relative;
          z-index: 10;
          color: white;
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(255, 255, 255, 0.5),
            2px 2px 4px rgba(0, 0, 0, 0.9);
        }

        .glow-layer {
          filter: blur(12px);
          opacity: 0.2;
          mix-blend-mode: screen;
          color: #EE2211;
        }

        .overlay-layer {
          filter: blur(5px);
          opacity: 0.5;
          mix-blend-mode: color-burn;
          color: white;
        }
      `}</style>
      <div ref={containerRef} className={`text-container ${className}`}>
        {/* Glow layer - mais distante (vermelho) */}
        <div className="text-layer glow-layer blur-layer">
          {words.map((word, i) => (
            <span key={i} className="inline-block" style={{ marginRight: i < words.length - 1 ? '0.5rem' : '0' }}>
              {word}
            </span>
          ))}
        </div>
        
        {/* Blur layer 1 (vermelho) */}
        <div className="text-layer blur-layer">
          {words.map((word, i) => (
            <span key={i} className="inline-block" style={{ marginRight: i < words.length - 1 ? '0.5rem' : '0' }}>
              {word}
            </span>
          ))}
        </div>
        
        {/* Blur layer 2 (vermelho) */}
        <div className="text-layer blur-layer-2">
          {words.map((word, i) => (
            <span key={i} className="inline-block" style={{ marginRight: i < words.length - 1 ? '0.5rem' : '0' }}>
              {word}
            </span>
          ))}
        </div>
        
        {/* Blur layer 3 (branco) */}
        <div className="text-layer blur-layer-3">
          {words.map((word, i) => (
            <span key={i} className="inline-block" style={{ marginRight: i < words.length - 1 ? '0.5rem' : '0' }}>
              {word}
            </span>
          ))}
        </div>
        
        {/* Overlay layer */}
        <div className="text-layer overlay-layer">
          {words.map((word, i) => (
            <span key={i} className="inline-block" style={{ marginRight: i < words.length - 1 ? '0.5rem' : '0' }}>
              {word}
            </span>
          ))}
        </div>
        
        {/* Main layer - visible */}
        <div className="text-layer main-layer" style={{ position: 'relative', zIndex: 10 }}>
          {words.map((word, i) => (
            <span 
              key={i} 
              className="inline-block"
              style={{
                marginRight: i < words.length - 1 ? '0.5rem' : '0',
                textShadow: i === lastWordIndex 
                  ? '0 0 20px rgba(255, 177, 86, 0.9), 0 0 40px rgba(255, 177, 86, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.9)'
                  : '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.9)',
                color: i === lastWordIndex ? '#FFB156' : 'white'
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Sparks */}
        {sparks.map(spark => {
          const dx = (Math.random() - 0.5) * 200
          const dy = (Math.random() - 0.5) * 200
          return (
            <div
              key={spark.id}
              className="spark"
              style={{
                left: `${spark.x}px`,
                top: `${spark.y}px`,
                '--dx': dx,
                '--dy': dy,
              } as React.CSSProperties & { '--dx': number; '--dy': number }}
            />
          )
        })}
      </div>
    </>
  )
}


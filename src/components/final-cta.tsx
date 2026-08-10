import { useState, useRef } from 'react'
import { Phone, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ctaBgImg from '@/assets/whatsapp-image-2026-08-09-at-23.43.49-af7d1.jpeg'

export function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  const handleScrollToBudget = (e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById('orcamento')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#orcamento'
    }
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-[#002817] py-16 sm:py-24 border-t border-[#C89B3C]/30 text-white"
    >
      {/* Background image overlay with dynamic mouse movement */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={ctaBgImg}
          alt="Jetro Gestão Inteligente"
          className="w-full h-full object-cover object-center transition-transform duration-300 ease-out opacity-25"
          style={{
            transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 0) scale(1.12)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#002817]/95 via-[#002817]/85 to-[#002817]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002817] via-transparent to-[#002817]/80" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C89B3C]/20 border border-[#C89B3C]/50 text-[#E5B85C] text-xs sm:text-sm font-extrabold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#E5B85C]" />
              Apresentação Comercial
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Sua empresa merece uma gestão mais inteligente
            </h2>

            <p className="text-gray-200 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-normal">
              O Jetro reúne pessoas, processos e informações em uma plataforma completa para
              empresas que desejam crescer com organização, tecnologia e inteligência.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="bg-[#003822]/90 backdrop-blur-md border border-[#C89B3C]/40 px-5 py-3.5 rounded-xl flex items-center gap-3 shadow-lg">
                <Phone className="w-5 h-5 text-[#E5B85C]" />
                <span className="text-[#E5B85C] text-lg sm:text-xl font-bold tracking-wide">
                  📞 31 9 9129-7619
                </span>
              </div>

              <Button
                onClick={handleScrollToBudget}
                className="bg-[#C89B3C] hover:bg-[#E5B85C] text-white font-bold px-8 py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto cursor-pointer"
              >
                Solicitar uma Demonstração
              </Button>
            </div>
          </div>

          {/* Interactive Card Image Showcase with 3D Tilt */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-[#C89B3C]/50 shadow-2xl group max-w-lg w-full transition-transform duration-500 hover:scale-[1.02]"
              style={{
                transform: `perspective(1000px) rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`,
              }}
            >
              <img
                src={ctaBgImg}
                alt="Jetro Gestão Inteligente"
                className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002817]/90 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-left flex items-center justify-between">
                <span className="text-xs font-bold text-[#E5B85C] uppercase tracking-wider bg-[#002817]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C89B3C]/30 shadow">
                  Jetro — Plataforma Inteligente
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

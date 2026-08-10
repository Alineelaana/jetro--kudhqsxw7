import { useState, useRef, MouseEvent } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import bgImage from '@/assets/whatsapp-image-2026-08-09-at-23.43.49-740bb.jpeg'

interface FinalCTAProps {
  onOpenBudget?: () => void
}

export function FinalCTA({ onOpenBudget }: FinalCTAProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x: x * 24, y: y * 20 })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  const handleAction = () => {
    if (onOpenBudget) {
      onOpenBudget()
    } else {
      const element = document.getElementById('contato') || document.getElementById('orcamento')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden py-24 sm:py-32 my-12 mx-4 sm:mx-8 rounded-3xl border border-emerald-800/40 shadow-2xl group"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out scale-105 pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(1.08)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-[#002817]/80 to-black/85 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-5xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Apresentação Comercial</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
          Sua empresa merece uma gestão mais inteligente
        </h2>

        <p className="text-white text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed drop-shadow">
          O Jetro reúne pessoas, processos e informações em uma plataforma completa para empresas
          que desejam crescer com organização, tecnologia e inteligência.
        </p>

        <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
          Solicite uma apresentação comercial e descubra como nossa arquitetura pode elevar a
          eficiência da sua empresa.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold text-lg shadow-xl tracking-wide">
            <span>31 9 9129-7619</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleAction}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-extrabold text-base px-8 py-6 rounded-xl shadow-xl hover:shadow-emerald-500/30 transition-all group/btn border border-emerald-400/30"
          >
            <span>Solicitar contato</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}

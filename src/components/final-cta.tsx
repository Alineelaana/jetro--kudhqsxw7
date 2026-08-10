import { useState, useRef, useEffect, MouseEvent } from 'react'
import { ArrowRight, Sparkles, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import bgImage from '@/assets/whatsapp-image-2026-08-09-at-23.43.49-a0014.jpeg'

interface FinalCTAProps {
  onOpenBudget?: () => void
}

export function FinalCTA({ onOpenBudget }: FinalCTAProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollOffsetY, setScrollOffsetY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      if (rect.top < windowHeight && rect.bottom > 0) {
        const center = rect.top + rect.height / 2 - windowHeight / 2
        setScrollOffsetY(center * 0.08)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x: x * 26, y: y * 18 })
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
      className="relative w-full overflow-hidden py-20 sm:py-28 lg:py-36 bg-black border-t border-emerald-500/20 shadow-2xl group"
    >
      {/* Interactive Edge-to-Edge Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out pointer-events-none scale-105"
        style={{
          backgroundImage: `url(${bgImage})`,
          transform: `translate3d(${mousePos.x}px, ${mousePos.y + scrollOffsetY}px, 0) scale(1.1)`,
        }}
      />

      {/* Semi-transparent Overlay preserving background artwork visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75 pointer-events-none" />
      <div className="absolute inset-0 bg-emerald-950/15 backdrop-brightness-[0.9] pointer-events-none" />

      {/* Glow highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-emerald-500/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Semi-transparent High-Legibility Text Container */}
        <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-3xl p-8 sm:p-12 lg:p-14 text-center space-y-6 sm:space-y-8 shadow-2xl transition-all duration-300 hover:border-emerald-500/30 hover:bg-black/55">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Apresentação Comercial</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
            Sua empresa merece uma gestão mais inteligente
          </h2>

          <p className="text-white text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed drop-shadow">
            O Jetro reúne pessoas, processos e informações em uma plataforma completa para empresas
            que desejam crescer com organização, tecnologia e inteligência.
          </p>

          <p className="text-white text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
            Solicite uma apresentação comercial e descubra como nossa arquitetura pode elevar a
            eficiência da sua empresa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold text-lg shadow-xl tracking-wide">
              <PhoneCall className="w-5 h-5 text-amber-400" />
              <span>31 9 9129-7619</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleAction}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-extrabold text-lg px-9 py-6 rounded-xl shadow-xl hover:shadow-emerald-500/40 transition-all group/btn border border-emerald-400/40 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Solicitar contato</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1.5 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

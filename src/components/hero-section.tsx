import { useState, MouseEvent } from 'react'
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck, Zap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import heroBgImage from '@/assets/whatsapp-image-2026-08-09-at-23.34.40-78c1f.jpeg'

interface HeroSectionProps {
  onOpenBudget?: () => void
}

export function HeroSection({ onOpenBudget }: HeroSectionProps) {
  const [transformStyle, setTransformStyle] = useState('scale(1) translate(0px, 0px)')

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e
    const { width, height, left, top } = currentTarget.getBoundingClientRect()
    const x = (clientX - left) / width - 0.5
    const y = (clientY - top) / height - 0.5
    setTransformStyle(`scale(1.05) translate(${x * -20}px, ${y * -20}px)`)
  }

  const handleMouseLeave = () => {
    setTransformStyle('scale(1) translate(0px, 0px)')
  }

  const handlePrimaryClick = () => {
    if (onOpenBudget) {
      onOpenBudget()
    } else {
      const budgetEl = document.getElementById('orcamento')
      if (budgetEl) {
        budgetEl.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-[#001c10] text-white"
    >
      {/* High-Tech Green Background Image with Interactive Motion / Parallax Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroBgImage}
          alt="Interface Digital Inteligente Jetro"
          className="w-full h-full object-cover object-center opacity-85 transition-transform duration-700 ease-out"
          style={{ transform: transformStyle }}
        />
        {/* Subtle top/bottom vignette gradient for visual polish & readability without obscuring image */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001c10]/60 via-transparent to-[#001c10]/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-extrabold uppercase tracking-wider backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Plataforma de Gestão Inteligente Jetro</span>
        </div>

        {/* Main Heading as per Acceptance Criteria */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
          Gestão inteligente para empresas que <span className="text-white">querem crescer</span>
        </h1>

        <p className="text-slate-100 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium drop-shadow">
          O Jetro reúne operações, finanças, vendas, pessoas e indicadores em uma plataforma
          desenvolvida para simplificar a gestão e impulsionar resultados.
        </p>

        {/* Call to Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handlePrimaryClick}
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#005A36] font-extrabold text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-white/25 transition-all group cursor-pointer"
          >
            <span>Solicitar Orçamento</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={() => {
              const solEl = document.getElementById('solucoes')
              if (solEl) solEl.scrollIntoView({ behavior: 'smooth' })
            }}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-gray-100 border-white text-[#005A36] font-bold text-base px-8 py-6 rounded-xl cursor-pointer"
          >
            Conhecer Soluções
          </Button>
        </div>

        {/* Value Proposition Grid - Transparent containers */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-transparent border border-emerald-500/30 shadow-sm hover:border-emerald-400/60 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 100% Integrado
            </div>
            <div className="text-slate-200 text-xs">
              Operação, vendas e financeiro em tempo real
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-transparent border border-emerald-500/30 shadow-sm hover:border-emerald-400/60 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Governança
            </div>
            <div className="text-slate-200 text-xs">Alçadas, trilha de auditoria e segurança</div>
          </div>
          <div className="p-4 rounded-2xl bg-transparent border border-emerald-500/30 shadow-sm hover:border-emerald-400/60 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Inteligência IA
            </div>
            <div className="text-slate-200 text-xs">Suporte preditivo e análises ágeis</div>
          </div>
          <div className="p-4 rounded-2xl bg-transparent border border-emerald-500/30 shadow-sm hover:border-emerald-400/60 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Empresas em Crescimento
            </div>
            <div className="text-slate-200 text-xs">Evolução contínua para o seu negócio</div>
          </div>
        </div>
      </div>
    </section>
  )
}

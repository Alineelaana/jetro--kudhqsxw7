import { useState, MouseEvent } from 'react'
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck, Zap, Phone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import heroBgImage from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-29182.png'

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
      className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-[#002817] via-[#003524] to-[#002817] text-white"
    >
      {/* High-Tech Green Background Image with Interactive Motion / Parallax Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroBgImage}
          alt="Interface Digital Inteligente Jetro"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity transition-transform duration-700 ease-out"
          style={{ transform: transformStyle }}
          onError={(e) => {
            e.currentTarget.src =
              'https://img.usecurling.com/p/1920/1080?q=futuristic%20robot%20hand%20digital%20interface&color=green'
          }}
        />
        {/* Dark Green Brand Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#002817]/90 via-[#003524]/80 to-[#002817]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-[#C89B3C]/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Plataforma Inteligente Jetro</span>
        </div>

        {/* Main Heading as per Acceptance Criteria */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Gestão inteligente para empresas que{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-[#E2B755]">
            querem crescer
          </span>
        </h1>

        <p className="text-slate-200 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
          O Jetro reúne operações, finanças, vendas, pessoas e indicadores em uma plataforma
          desenvolvida para simplificar a gestão e impulsionar resultados.
        </p>

        {/* Contact Information */}
        <div className="flex items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#003524]/80 border border-[#C89B3C]/40 text-[#E5B85C] text-lg sm:text-xl font-bold shadow-md backdrop-blur-sm">
            <Phone className="w-5 h-5 text-[#E5B85C]" />
            <span>31 9 9129-7619</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handlePrimaryClick}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all group cursor-pointer"
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
            className="w-full sm:w-auto border-emerald-700/80 hover:bg-emerald-900/40 text-emerald-200 font-bold text-base px-8 py-6 rounded-xl backdrop-blur-sm cursor-pointer"
          >
            Conhecer Soluções
          </Button>
        </div>

        {/* Value Proposition Grid */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-[#003524]/70 border border-[#004d33]/80 backdrop-blur-md shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 100% Integrado
            </div>
            <div className="text-slate-300 text-xs">
              Operação, vendas e financeiro em tempo real
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#003524]/70 border border-[#004d33]/80 backdrop-blur-md shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Governança
            </div>
            <div className="text-slate-300 text-xs">Alçadas, trilha de auditoria e segurança</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#003524]/70 border border-[#004d33]/80 backdrop-blur-md shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Inteligência IA
            </div>
            <div className="text-slate-300 text-xs">Suporte preditivo e análises ágeis</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#003524]/70 border border-[#004d33]/80 backdrop-blur-md shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Empresas em Crescimento
            </div>
            <div className="text-slate-300 text-xs">Evolução contínua para o seu negócio</div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { ArrowRight, Sparkles, CheckCircle, ShieldCheck, Zap, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  onOpenBudget?: () => void
}

export function HeroSection({ onOpenBudget }: HeroSectionProps) {
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
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-[#002817] via-[#003524] to-[#002817] text-white">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-[#C89B3C]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Plataforma Inteligente Jetro</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Sua empresa em outro nível de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-[#E2B755]">
            gestão e eficiência
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
          Gestão inteligente para empresas que querem crescer. O Jetro reúne operações, finanças,
          vendas, pessoas e indicadores em uma plataforma desenvolvida para simplificar a gestão e
          impulsionar resultados.
        </p>

        <div className="flex items-center justify-center gap-2 text-[#E5B85C] text-lg sm:text-xl font-bold">
          <Phone className="w-5 h-5" />
          <span>31 9 9129-7619</span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handlePrimaryClick}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all group"
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
            className="w-full sm:w-auto border-emerald-800 hover:bg-emerald-900/40 text-emerald-200 font-bold text-base px-8 py-6 rounded-xl"
          >
            Conhecer Soluções
          </Button>
        </div>

        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-[#003524]/60 border border-[#004d33]/80 backdrop-blur-sm">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 100% Integrado
            </div>
            <div className="text-slate-400 text-xs">
              Operação, vendas e financeiro em tempo real
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#003524]/60 border border-[#004d33]/80 backdrop-blur-sm">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Governança
            </div>
            <div className="text-slate-400 text-xs">Alçadas, trilha de auditoria e segurança</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#003524]/60 border border-[#004d33]/80 backdrop-blur-sm">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Inteligência IA
            </div>
            <div className="text-slate-400 text-xs">Suporte preditivo e análises ágeis</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#003524]/60 border border-[#004d33]/80 backdrop-blur-sm">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Módulos Flexíveis
            </div>
            <div className="text-slate-400 text-xs">Evolução no ritmo do seu negócio</div>
          </div>
        </div>
      </div>
    </section>
  )
}

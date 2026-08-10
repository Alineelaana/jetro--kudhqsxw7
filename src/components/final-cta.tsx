import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWhatsAppUrl } from '@/lib/utils'
import ctaBgImage from '@/assets/whatsapp-image-2026-08-09-at-23.43.49-d7ecf.jpeg'

interface FinalCTAProps {
  onOpenBudget?: () => void
}

export function FinalCTA({ onOpenBudget }: FinalCTAProps) {
  const handleAction = () => {
    if (onOpenBudget) {
      onOpenBudget()
    } else {
      const url = buildWhatsAppUrl(
        '5531991297619',
        'Olá! Gostaria de solicitar uma demonstração da plataforma Jetro para a minha empresa.',
      )
      window.open(url, '_blank')
    }
  }

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-slate-950 text-white my-12 mx-4 sm:mx-8 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Interactive Moving Background Banner */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={ctaBgImage}
          alt="Jetro Gestão Inteligente"
          className="w-full h-full object-cover object-center animate-slow-zoom-pan opacity-35 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-5xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Plataforma Completa de Gestão</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Sua empresa merece uma gestão mais inteligente
        </h2>

        <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          O Jetro reúne pessoas, processos e informações em uma plataforma completa para empresas
          que desejam crescer com organização, tecnologia e inteligência.
        </p>

        {/* Contact Display exactly as required */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 font-extrabold text-lg shadow-xl tracking-wide">
            <span>📞 31 9 9129-7619</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleAction}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-extrabold text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all group"
          >
            <span>Solicitar uma Demonstração</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sem fidelidade obrigatória</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Suporte especializado em Português</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Implantação guiada e rápida</span>
          </div>
        </div>
      </div>
    </section>
  )
}

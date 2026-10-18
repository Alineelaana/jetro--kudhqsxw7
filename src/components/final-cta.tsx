import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, PhoneCall, ShieldCheck, CheckCircle2 } from 'lucide-react'
import bgImage from '@/assets/whatsapp-image-2026-08-09-at-23.43.49-a0014.jpeg'

interface FinalCTAProps {
  onOpenBudget?: () => void
}

export function FinalCTA({ onOpenBudget }: FinalCTAProps) {
  const handleAction = () => {
    if (onOpenBudget) {
      onOpenBudget()
    } else {
      const element = document.getElementById('contato')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="relative w-full overflow-hidden py-20 sm:py-28 lg:py-32 bg-black border-t border-[#C9A227]/30">
      <div
        className="absolute inset-0 bg-cover bg-center banner-motion pointer-events-none opacity-60"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#001c10]/95 via-[#001c10]/85 to-[#001c10]/95" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center space-y-6 sm:space-y-8 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#C9A227]/40 text-[#f6d77c] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md">
            <Sparkles className="w-4 h-4 text-[#C9A227] animate-pulse" />
            <span>Apresentação Comercial & Demonstração</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
            Conheça uma nova experiência em{' '}
            <span className="text-[#C9A227]">gestão empresarial.</span>
          </h2>

          <p className="text-slate-200 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
            Descubra como o Jetro pode apoiar sua operação, integrar seus departamentos e trazer
            clareza à tomada de decisões da sua empresa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://wa.me/5531991297619"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-[#C9A227]/40 text-white font-extrabold text-base sm:text-lg shadow-xl tracking-wide hover:bg-white/15 transition-all"
            >
              <PhoneCall className="w-5 h-5 text-[#C9A227]" />
              <span>(31) 99129-7619</span>
            </a>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleAction}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-[#C9A227] to-[#a88219] hover:from-[#d8b030] hover:to-[#b88f20] text-gray-950 font-black text-base px-9 py-6 rounded-xl shadow-xl hover:shadow-[#C9A227]/30 transition-all group cursor-pointer"
            >
              <span>Solicitar apresentação do sistema</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              Sem compromisso comercial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Atendimento por especialistas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Demonstração com dados reais de teste
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

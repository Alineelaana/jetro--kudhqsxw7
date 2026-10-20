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
    <section className="relative w-full overflow-hidden py-20 sm:py-28 lg:py-32 bg-[#063D30] text-white border-b border-[#042820]">
      {/* Acabamento dourado no topo da seção */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C69B45] to-transparent opacity-80" />

      {/* Luz ambiente dourada e esmeralda */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C69B45]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#116B50]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center space-y-6 sm:space-y-8 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#C69B45] text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm shadow-xs">
            <Sparkles className="w-4 h-4 text-[#C69B45]" />
            <span>Apresentação Comercial & Demonstração</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold font-heading text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Conheça uma nova experiência em{' '}
            <span className="text-[#C69B45]">gestão empresarial.</span>
          </h2>

          <p className="text-slate-200/90 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
            Descubra como o Jetro pode apoiar sua operação, integrar seus departamentos e trazer
            clareza à tomada de decisões da sua empresa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://wa.me/5531991297619"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#063D30] font-semibold text-base sm:text-lg shadow-sm hover:border-white transition-all"
            >
              <PhoneCall className="w-5 h-5 text-[#C69B45]" />
              <span>(31) 99129-7619</span>
            </a>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleAction}
              size="lg"
              className="w-full sm:w-auto bg-white hover:bg-[#F8FAF9] text-[#063D30] font-bold text-base px-9 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all group cursor-pointer border border-white"
            >
              <span className="text-[#063D30]">Solicitar apresentação do sistema</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform text-[#116B50]" />
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-200/80 font-normal">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C69B45]" />
              Sem compromisso comercial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C69B45]" />
              Atendimento por especialistas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C69B45]" />
              Demonstração com dados reais de teste
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

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
    <section className="relative w-full overflow-hidden py-20 sm:py-28 lg:py-32 bg-[#F8FAF9] border-b border-[#E4EAE6]">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center space-y-6 sm:space-y-8 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#C69B45]" />
            <span>Apresentação Comercial & Demonstração</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold font-heading text-[#063D30] tracking-tight leading-tight max-w-4xl mx-auto">
            Conheça uma nova experiência em{' '}
            <span className="text-[#116B50]">gestão empresarial.</span>
          </h2>

          <p className="text-[#66736D] text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
            Descubra como o Jetro pode apoiar sua operação, integrar seus departamentos e trazer
            clareza à tomada de decisões da sua empresa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://wa.me/5531991297619"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white border border-[#E4EAE6] text-[#063D30] font-semibold text-base sm:text-lg shadow-2xs hover:border-[#116B50]/40 transition-all"
            >
              <PhoneCall className="w-5 h-5 text-[#C69B45]" />
              <span>(31) 99129-7619</span>
            </a>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleAction}
              size="lg"
              className="w-full sm:w-auto bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-base px-9 py-6 rounded-xl shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <span>Solicitar apresentação do sistema</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform text-[#C69B45]" />
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#66736D] font-normal">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#116B50]" />
              Sem compromisso comercial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#116B50]" />
              Atendimento por especialistas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#116B50]" />
              Demonstração com dados reais de teste
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

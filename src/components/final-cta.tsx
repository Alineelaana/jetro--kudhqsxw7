import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWhatsAppUrl } from '@/lib/utils'

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
        'Olá! Gostaria de solicitar uma apresentação comercial da plataforma Jetro.',
      )
      window.open(url, '_blank')
    }
  }

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-[#002817] to-[#003524] text-white my-12 mx-4 sm:mx-8 rounded-3xl border border-emerald-900/50 shadow-2xl">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[250px] h-[180px] bg-[#C89B3C]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-5xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Apresentação Comercial</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Transforme sua operação logística com a Jetro
        </h2>

        <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          Solicite uma apresentação comercial e descubra como nossa arquitetura pode elevar a
          eficiência da sua empresa no Espírito Santo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 font-extrabold text-lg shadow-xl tracking-wide">
            <span>31 9 9129-7619</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleAction}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-extrabold text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all group"
          >
            <span>Solicitar Orçamento</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}

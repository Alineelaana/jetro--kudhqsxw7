import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck, Check } from 'lucide-react'

export function FinalCTA() {
  const scrollToContact = () => {
    const el = document.getElementById('orcamento') || document.getElementById('contato')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="sobre"
      className="py-16 sm:py-20 bg-gradient-to-r from-[#001D0F] via-[#003820] to-[#001D0F] text-white relative overflow-hidden border-t border-[#C89B3C]/30"
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C89B3C]/10 border border-[#C89B3C]/40 text-[#E5B85C] text-xs sm:text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-[#C89B3C]" />
          <span>Transformação Digital com Segurança</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Pronto para transformar a gestão da sua empresa?
        </h2>

        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Agende uma apresentação comercial personalizada e descubra como o Jetro conecta suas
          operações e acelera seus resultados com controle total.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
          <div className="flex items-center gap-2 text-xs text-gray-200">
            <Check className="h-4 w-4 text-[#C89B3C] shrink-0" />
            <span>Implementação Gradual e Segura</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-200">
            <Check className="h-4 w-4 text-[#C89B3C] shrink-0" />
            <span>Atendimento Especializado</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-200">
            <Check className="h-4 w-4 text-[#C89B3C] shrink-0" />
            <span>Acesso Multidevice & Cloud</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={scrollToContact}
            size="lg"
            className="w-full sm:w-auto bg-[#005A36] hover:bg-[#007343] text-white font-bold px-8 py-6 text-base rounded-lg shadow-xl shadow-[#005A36]/40 border border-[#008A4D]"
          >
            Solicitar Apresentação
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-[#C89B3C]/60 text-[#E5B85C] hover:bg-[#C89B3C]/10 hover:text-white font-bold px-8 py-6 text-base rounded-lg bg-black/20"
          >
            <Link to="/admin">Acessar Plataforma</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

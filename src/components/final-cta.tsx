import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck, Check } from 'lucide-react'
import ctaBgImage from '@/assets/whatsapp-image-2026-08-09-at-23.43.49-f71be.jpeg'

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
      className="py-16 sm:py-24 text-white relative overflow-hidden border-t border-[#C89B3C]/30"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat screen-press-animate"
        style={{ backgroundImage: `url(${ctaBgImage})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#001D0F]/85 via-black/60 to-[#001D0F]/85 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl space-y-6 bg-transparent">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C89B3C]/20 border border-[#C89B3C]/50 text-[#E5B85C] text-xs sm:text-sm font-semibold backdrop-blur-sm">
          <ShieldCheck className="h-4 w-4 text-[#C89B3C]" />
          <span>Transformação Digital com Segurança</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight [text-shadow:_0_2px_10px_rgba(0,0,0,0.9)]">
          Pronto para transformar a gestão da sua empresa?
        </h2>

        <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed [text-shadow:_0_1px_6px_rgba(0,0,0,0.8)]">
          Agende uma apresentação comercial personalizada e descubra como o Jetro conecta suas
          operações e acelera seus resultados com controle total.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-100 drop-shadow">
            <Check className="h-4 w-4 text-[#C89B3C] shrink-0" />
            <span>Implementação Gradual e Segura</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-100 drop-shadow">
            <Check className="h-4 w-4 text-[#C89B3C] shrink-0" />
            <span>Atendimento Especializado</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-100 drop-shadow">
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
            className="w-full sm:w-auto border-[#C89B3C]/60 text-[#E5B85C] hover:bg-[#C89B3C]/20 hover:text-white font-bold px-8 py-6 text-base rounded-lg bg-black/40 backdrop-blur-sm"
          >
            <Link to="/admin">Acessar Plataforma</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

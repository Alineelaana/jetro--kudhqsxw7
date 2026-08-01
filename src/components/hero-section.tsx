import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import logoDark from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-6748f.png'
import { MessageCircle, FileText, ShieldCheck, Clock, MapPin, Warehouse } from 'lucide-react'

const DIFFERENTIALS = [
  { icon: ShieldCheck, label: 'Segurança & Seguro Total' },
  { icon: Warehouse, label: 'Armazenagem com WMS' },
  { icon: Clock, label: 'Gestão de SLA e Prazos' },
  { icon: MapPin, label: 'Cobertura ES e Brasil' },
]

export function HeroSection() {
  const { whatsappNumber } = useSettings()

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-forest text-white pt-12 pb-20 border-b border-[#C89B3C]/30"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C89B3C_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-2 animate-fade-in-down">
            <img
              src={logoDark}
              alt="VeloraLog Operações Logísticas"
              className="h-28 md:h-36 w-auto object-contain filter drop-shadow-lg"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C89B3C]/20 border border-[#C89B3C]/40 text-[#E4C46A] text-xs md:text-sm font-semibold animate-fade-in-up">
            <span>Operações Logísticas de Excelência no Espírito Santo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight animate-fade-in-up">
            Sua operação logística com precisão, agilidade e{' '}
            <span className="gold-gradient-text">padrão premium.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Armazenagem especializada de estoque (WMS), picking & packing, transporte rodoviário,
            logística portuária e distribuição urbana no Espírito Santo e no Brasil.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#1da851] text-white text-base font-bold shadow-xl px-8"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  'Olá! Gostaria de falar com um especialista sobre as operações da VeloraLog.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar no WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base font-semibold border-[#C89B3C] text-[#E4C46A] hover:bg-[#C89B3C]/20 bg-forest/80 backdrop-blur"
            >
              <a href="#orcamento">
                <FileText className="w-5 h-5 mr-2" />
                Solicitar Orçamento
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 pt-8 border-t border-white/10 max-w-5xl mx-auto">
          {DIFFERENTIALS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-[#C89B3C]/20 backdrop-blur hover:border-[#C89B3C]/50 transition-colors"
            >
              <item.icon className="w-6 h-6 text-[#C89B3C] shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-white/90 leading-snug">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

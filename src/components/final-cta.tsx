import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import { MessageCircle, Phone, MapPin } from 'lucide-react'
import logoDark from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-29182.png'
import truckBg from '@/assets/chatgpt-image-1-de-ago.de-2026-123806-850fe.png'

export function FinalCTA() {
  const { whatsappNumber } = useSettings()

  return (
    <section
      id="contato"
      className="py-16 sm:py-24 text-white border-t border-[#C89B3C]/40 relative overflow-hidden bg-black"
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={truckBg}
          alt="Velora Log Operações Logísticas"
          className="w-full h-full object-cover object-center brightness-90 transition-all duration-700 truck-animate"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 p-6 sm:p-10">
          <div className="flex justify-center mb-2">
            <img
              src={logoDark}
              alt="Velora Log"
              className="h-20 sm:h-28 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.95),0_0_3px_rgba(0,0,0,1)]">
            Pronto para elevar a eficiência da sua cadeia logística?
          </h2>

          <p className="text-white text-base sm:text-lg max-w-xl mx-auto font-medium [text-shadow:0_2px_6px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,1)]">
            Fale diretamente com os consultores operacionais da Velora Log e solicite um projeto
            personalizado para sua empresa.
          </p>

          <div className="pt-2">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#1da851] text-white font-extrabold text-base sm:text-lg px-8 h-14 rounded-xl shadow-2xl border border-white/20 transition-all hover:scale-105"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  'Olá! Gostaria de conversar com a equipe comercial da Velora Log.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-6 h-6 mr-2 shrink-0" />
                Falar com a Velora Log no WhatsApp
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-8 border-t border-white/20 text-white text-xs sm:text-sm font-medium">
            <div className="flex items-center justify-center gap-2 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4C46A]" />
              <span>(31) 99129-7619</span>
            </div>
            <div className="flex items-center justify-center gap-2 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4C46A]" />
              <span>Atendemos em todo o estado do Espírito Santo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

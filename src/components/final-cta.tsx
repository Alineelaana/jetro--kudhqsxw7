import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react'
import logoDark from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-29182.png'
import truckBg from '@/assets/chatgpt-image-1-de-ago.de-2026-123806-850fe.png'

export function FinalCTA() {
  const { whatsappNumber } = useSettings()

  return (
    <section
      id="contato"
      className="py-16 sm:py-24 text-white border-t border-[#C89B3C]/40 relative overflow-hidden bg-black"
    >
      {/* High-impact branded background banner */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={truckBg}
          alt="Velora Log Operações Logísticas"
          className="w-full h-full object-cover object-center brightness-90 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#01361D]/75 to-black/90 backdrop-blur-[1px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-black/50 p-6 sm:p-10 rounded-2xl border border-[#C89B3C]/35 backdrop-blur-md shadow-2xl">
          <div className="flex justify-center mb-2">
            <img
              src={logoDark}
              alt="Velora Log"
              className="h-20 sm:h-28 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Pronto para elevar a eficiência da sua cadeia logística?
          </h2>

          <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto font-medium drop-shadow">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-white/20 text-white/90 text-xs sm:text-sm font-medium">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4C46A]" />
              <span>(31) 99129-7619</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4C46A]" />
              <span>contato@veloralog.com.br</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4C46A]" />
              <span>Espírito Santo, Brasil</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

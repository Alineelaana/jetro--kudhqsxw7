import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import logoDark from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-6748f.png'
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react'

export function FinalCTA() {
  const { whatsappNumber } = useSettings()

  return (
    <section
      id="contato"
      className="py-20 bg-forest text-white border-t border-[#C89B3C]/30 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-2">
            <img src={logoDark} alt="VeloraLog" className="h-20 sm:h-24 w-auto object-contain" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Pronto para elevar a eficiência da sua cadeia logística?
          </h2>

          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto">
            Fale diretamente com os consultores operacionais da VeloraLog e solicite um projeto
            personalizado para sua empresa.
          </p>

          <div className="pt-2">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#1da851] text-white font-extrabold text-lg px-8 shadow-xl"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  'Olá! Gostaria de conversar com a equipe comercial da VeloraLog.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Falar com a VeloraLog no WhatsApp
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/10 text-white/80 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 text-[#C89B3C]" />
              <span>(31) 99129-7619</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-[#C89B3C]" />
              <span>contato@veloralog.com.br</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-[#C89B3C]" />
              <span>Espírito Santo, Brasil</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react'

export function FinalCTA() {
  const { whatsappNumber } = useSettings()

  return (
    <section id="contato" className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Pronto para otimizar sua logística?</h2>
          <p className="text-white/80 text-lg">
            Fale com nossa equipe e descubra como podemos ajudar sua empresa a reduzir custos e
            ganhar eficiência.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#25D366] hover:bg-[#1da851] text-white text-base"
          >
            <a
              href={buildWhatsAppUrl(
                whatsappNumber,
                'Olá! Gostaria de falar sobre serviços logísticos.',
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar pelo WhatsApp
            </a>
          </Button>
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> (31) 99129-7619
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> contato@logisticapremiumes.com.br
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Espírito Santo, Brasil
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

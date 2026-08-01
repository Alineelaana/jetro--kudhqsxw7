import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import { MessageCircle, FileText, Truck, ShieldCheck, Clock, MapPin } from 'lucide-react'

const DIFFERENTIALS = [
  { icon: ShieldCheck, label: 'Segurança' },
  { icon: Clock, label: 'Prazo' },
  { icon: MapPin, label: 'Cobertura Nacional' },
  { icon: Truck, label: 'Frota Própria' },
]

export function HeroSection() {
  const { whatsappNumber } = useSettings()

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-white pt-20 pb-16"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-semibold animate-fade-in-up">
            Logística no Espírito Santo
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in-up">
            Logística Premium ES
            <span className="block text-primary mt-2">Operações Logísticas de Excelência</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
            Transporte, armazenagem, distribuição e gestão de frota com qualidade, segurança e
            eficiência. Solicite seu orçamento agora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#1da851] text-white text-base"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  'Olá! Gostaria de solicitar um orçamento para serviços logísticos.',
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
              className="text-base border-primary text-primary hover:bg-primary/10"
            >
              <a href="#orcamento">
                <FileText className="w-5 h-5 mr-2" />
                Solicitar Orçamento
              </a>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-border/50">
          {DIFFERENTIALS.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
              <item.icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

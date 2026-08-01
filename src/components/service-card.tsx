import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Warehouse,
  Truck,
  MapPinned,
  Layers,
  Ship,
  ArrowLeftRight,
  Bus,
  CheckCircle2,
  FileText,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceItem } from '@/lib/constants'
import { buildWhatsAppUrl } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  Warehouse,
  Truck,
  MapPinned,
  Layers,
  Ship,
  ArrowLeftRight,
  Bus,
}

interface ServiceCardProps {
  service: ServiceItem
  whatsappNumber: string
  onSelect?: (title: string) => void
}

export function ServiceCard({ service, whatsappNumber, onSelect }: ServiceCardProps) {
  const Icon = ICON_MAP[service.icon] || Warehouse

  const handleQuoteClick = () => {
    if (onSelect) {
      onSelect(service.title)
    } else {
      const el = document.getElementById('orcamento')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Card
      className={`group relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-visible ${
        service.highlight
          ? 'border-2 border-[#C89B3C] bg-gradient-to-b from-white via-white to-[#005B2E]/10 shadow-lg'
          : 'border-2 border-[#005B2E]/20 bg-white hover:border-[#005B2E]'
      }`}
    >
      {service.highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <Badge className="bg-[#C89B3C] hover:bg-[#C89B3C] text-[#01361D] font-black px-3.5 py-1 shadow-md text-xs uppercase tracking-wider whitespace-nowrap">
            Destaque Operacional / WMS
          </Badge>
        </div>
      )}

      <div>
        <CardHeader className="pb-3 pt-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${
              service.highlight
                ? 'bg-[#005B2E] text-[#C89B3C] shadow-md'
                : 'bg-[#005B2E]/10 text-[#005B2E] group-hover:bg-[#005B2E] group-hover:text-[#C89B3C]'
            }`}
          >
            <Icon className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground leading-snug">
            {service.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>

          <div className="space-y-2 pt-2 border-t border-border/50">
            {service.tags.map((tag) => (
              <div key={tag} className="flex items-center text-xs font-semibold text-[#005B2E]">
                <CheckCircle2 className="w-4 h-4 text-[#C89B3C] mr-2 shrink-0" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <div className="p-6 pt-2 space-y-2">
        <Button
          onClick={handleQuoteClick}
          className={`w-full font-extrabold shadow-md ${
            service.highlight
              ? 'bg-[#005B2E] hover:bg-[#01361D] text-white'
              : 'bg-[#005B2E]/10 hover:bg-[#005B2E] text-[#005B2E] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Solicitar Orçamento
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full text-xs font-bold border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
        >
          <a
            href={buildWhatsAppUrl(
              whatsappNumber,
              `Olá! Gostaria de cotar ${service.title} na Velora Log.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Cotar no WhatsApp
          </a>
        </Button>
      </div>
    </Card>
  )
}

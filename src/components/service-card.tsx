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
  type LucideIcon,
} from 'lucide-react'
import type { ServiceItem } from '@/lib/constants'

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

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
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
      className={`group relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        service.highlight
          ? 'border-2 border-[#C89B3C] bg-gradient-to-b from-white to-[#005B2E]/5 shadow-md'
          : 'border border-[#005B2E]/15 bg-white'
      }`}
    >
      {service.highlight && (
        <div className="absolute -top-3.5 right-6 z-10">
          <Badge className="bg-[#C89B3C] hover:bg-[#C89B3C] text-[#01361D] font-extrabold px-3 py-1 shadow text-xs uppercase tracking-wider">
            Destaque / Armazenagem WMS
          </Badge>
        </div>
      )}

      <div>
        <CardHeader className="pb-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${
              service.highlight
                ? 'bg-[#005B2E] text-[#C89B3C]'
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

          <div className="space-y-1.5 pt-2">
            {service.tags.map((tag) => (
              <div key={tag} className="flex items-center text-xs font-semibold text-[#005B2E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C89B3C] mr-1.5 shrink-0" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <div className="p-6 pt-2">
        <Button
          onClick={handleQuoteClick}
          className={`w-full font-bold shadow-sm ${
            service.highlight
              ? 'bg-[#005B2E] hover:bg-[#005B2E]/90 text-white'
              : 'bg-[#005B2E]/10 hover:bg-[#005B2E] text-[#005B2E] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Solicitar Orçamento
        </Button>
      </div>
    </Card>
  )
}

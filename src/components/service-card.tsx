import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Truck,
  MapPinned,
  Warehouse,
  ArrowLeftRight,
  Ship,
  Bus,
  Layers,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  MapPinned,
  Warehouse,
  ArrowLeftRight,
  Ship,
  Bus,
  Layers,
}

interface ServiceCardProps {
  title: string
  description: string
  icon: string
  whatsappNumber: string
}

export function ServiceCard({ title, description, icon, whatsappNumber }: ServiceCardProps) {
  const Icon = ICON_MAP[icon] || Truck
  const message = `Olá! Gostaria de um orçamento para o serviço de ${title}.`

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10">
      <CardHeader>
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/10"
        >
          <a
            href={buildWhatsAppUrl(whatsappNumber, message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Solicitar Orçamento
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

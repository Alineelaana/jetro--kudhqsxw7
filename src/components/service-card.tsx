import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
  ScanLine,
  Boxes,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceItem } from '@/lib/constants'
import { buildWhatsAppUrl } from '@/lib/utils'
import warehouseImg from '@/assets/captura-de-tela-2026-08-01-as-10.38.48-65c70.png'

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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const Icon = ICON_MAP[service.icon] || Warehouse

  const handleQuoteClick = () => {
    if (onSelect) {
      onSelect(service.title)
    } else {
      const el = document.getElementById('orcamento')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isArmazenagem = service.id === 'armazenagem-estoque'

  return (
    <>
      <Card
        className={`group relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${
          service.highlight
            ? 'border-2 border-[#C89B3C] bg-gradient-to-b from-white via-white to-[#005B2E]/10 shadow-lg'
            : 'border border-[#005B2E]/20 bg-white hover:border-[#005B2E]'
        }`}
      >
        {service.highlight && (
          <div className="absolute -top-3.5 right-6 z-20">
            <Badge className="bg-[#C89B3C] hover:bg-[#C89B3C] text-[#01361D] font-black px-3.5 py-1 shadow-md text-xs uppercase tracking-wider">
              Destaque Operacional / WMS
            </Badge>
          </div>
        )}

        {/* Real Warehouse Mini Hero for Storage Card */}
        {isArmazenagem && (
          <div className="relative h-44 w-full overflow-hidden bg-[#01361D]">
            <img
              src={warehouseImg}
              alt="Armazenagem WMS VeloraLog"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#01361D] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white z-10 font-mono">
              <span className="bg-[#005B2E]/90 px-2.5 py-1 rounded border border-[#C89B3C]/40 font-bold flex items-center gap-1">
                <ScanLine className="w-3.5 h-3.5 text-[#E4C46A]" /> WMS ACTIVE
              </span>
              <span className="bg-[#C89B3C] text-[#01361D] font-bold px-2 py-0.5 rounded">
                SLOT: RUA 05
              </span>
            </div>
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
          {isArmazenagem && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsOpen(true)}
              className="w-full text-xs font-bold border-[#C89B3C] text-[#005B2E] hover:bg-[#C89B3C]/10 mb-1"
            >
              <Boxes className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" /> Ver Ficha Técnica WMS
            </Button>
          )}

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
        </div>
      </Card>

      {/* Technical WMS Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-[#C89B3C]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#005B2E] mb-1">
              <ScanLine className="w-5 h-5 text-[#C89B3C]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Ficha Técnica Operacional
              </span>
            </div>
            <DialogTitle className="text-2xl font-black text-foreground">
              Armazenagem de Estoque & Tecnologia WMS
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Especificações completas do serviço de armazenagem de produtos em estoque da VeloraLog
              no ES.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative h-48 rounded-xl overflow-hidden border border-[#C89B3C]/40">
              <img
                src={warehouseImg}
                alt="Estrutura WMS VeloraLog"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#01361D] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4 text-white space-y-1">
                <span className="text-xs font-bold bg-[#C89B3C] text-[#01361D] px-2 py-0.5 rounded">
                  Endereço Racking: RUA 04, 05, 06
                </span>
                <p className="text-xs text-white/90">Estrutura Porta-Paletes com Seguro Total</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#005B2E]/5 rounded-lg border border-[#005B2E]/20">
                <strong className="block text-[#005B2E] font-bold mb-1">Picking & Packing:</strong>
                Sistemas guiados por coletores de dados para fracionamento sem falhas.
              </div>
              <div className="p-3 bg-[#005B2E]/5 rounded-lg border border-[#005B2E]/20">
                <strong className="block text-[#005B2E] font-bold mb-1">
                  Controle de Validade:
                </strong>
                Gestão rigorosa de lotes por FEFO (First Expired, First Out) e FIFO.
              </div>
              <div className="p-3 bg-[#005B2E]/5 rounded-lg border border-[#005B2E]/20">
                <strong className="block text-[#005B2E] font-bold mb-1">Integração ERP/API:</strong>
                Sincronização direta com Bling, Tiny, TOTVS, SAP e e-commerce.
              </div>
              <div className="p-3 bg-[#005B2E]/5 rounded-lg border border-[#005B2E]/20">
                <strong className="block text-[#005B2E] font-bold mb-1">
                  Inventários Recorrentes:
                </strong>
                Contagem diária por Amostragem e Acuracidade mantida em 99.9%.
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-sm"
              >
                <a
                  href={buildWhatsAppUrl(
                    whatsappNumber,
                    'Olá! Gostaria de solicitar um orçamento para Armazenagem de Produtos em Estoque com sistema WMS na VeloraLog.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Cotar Armazenagem no WhatsApp
                </a>
              </Button>
              <Button
                onClick={() => {
                  setDetailsOpen(false)
                  handleQuoteClick()
                }}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-sm"
              >
                Preencher Formulário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

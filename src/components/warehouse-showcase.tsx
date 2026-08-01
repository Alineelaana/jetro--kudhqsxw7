import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import warehouseImg from '@/assets/captura-de-tela-2026-08-01-as-10.38.48-65c70.png'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import {
  Warehouse,
  Boxes,
  Barcode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ScanLine,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'

const OVERLAY_POINTS = [
  {
    id: 'rua05',
    title: 'Módulo WMS - RUA 05 / 06',
    x: '38%',
    y: '45%',
    tag: 'Racking Vertical com Banner Oficial',
    desc: 'Endereçamento dinâmico de porta-paletes com controle de código de barras e lote por posição.',
  },
  {
    id: 'wms-control',
    title: 'Monitoramento & Coleta RFID',
    x: '58%',
    y: '30%',
    tag: 'Acuracidade de 99.9%',
    desc: 'Conferência cega na entrada e expedição, eliminando erros operacionais em tempo real.',
  },
  {
    id: 'picking',
    title: 'Área de Picking & Packing',
    x: '25%',
    y: '75%',
    tag: 'Alta Produtividade',
    desc: 'Processo otimizado para fracionamento de pedidos e montagem de kits promocionais.',
  },
]

export function WarehouseShowcase() {
  const { whatsappNumber } = useSettings()
  const [activePoint, setActivePoint] = useState(OVERLAY_POINTS[0])

  return (
    <section className="py-20 bg-[#01361D] text-white relative overflow-hidden border-y border-[#C89B3C]/30">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <Badge className="bg-[#C89B3C] text-[#01361D] font-black px-4 py-1 text-xs uppercase tracking-wider">
            Infraestrutura Operacional Própria
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Armazenagem WMS de Alta Capacidade no ES
          </h2>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Conheça o padrão de estocagem da{' '}
            <span className="text-[#E4C46A] font-bold">VeloraLog</span>. Estrutura porta-paletes de
            grande porte no Espírito Santo, equipada com tecnologia de ponta para segurança total do
            seu estoque.
          </p>
        </div>

        {/* Interactive Warehouse Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Warehouse Image Container with Interactive Hotspots */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border-2 border-[#C89B3C]/40 shadow-2xl group bg-black/40">
            <img
              src={warehouseImg}
              alt="Estrutura de Armazenagem com marca VeloraLog"
              className="w-full h-[400px] sm:h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#01361D] via-transparent to-transparent opacity-60" />

            {/* Live Indicator Badges Overlay */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
              <span className="bg-[#005B2E]/90 text-white text-xs font-bold px-3 py-1.5 rounded-md border border-[#C89B3C]/50 flex items-center gap-1.5 backdrop-blur shadow">
                <ScanLine className="w-3.5 h-3.5 text-[#E4C46A]" /> Sistema WMS Integrado
              </span>
              <span className="bg-[#C89B3C] text-[#01361D] text-xs font-black px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow">
                <Boxes className="w-3.5 h-3.5" /> +15k Pos. Paletes
              </span>
            </div>

            {/* Hotspots */}
            {OVERLAY_POINTS.map((pt) => (
              <button
                key={pt.id}
                onClick={() => setActivePoint(pt)}
                style={{ top: pt.y, left: pt.x }}
                className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${
                  activePoint.id === pt.id
                    ? 'bg-[#C89B3C] ring-4 ring-[#C89B3C]/50 scale-125'
                    : 'bg-[#005B2E] hover:bg-[#C89B3C] border-2 border-white'
                }`}
                title={pt.title}
              >
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      activePoint.id === pt.id ? 'bg-white' : 'bg-[#E4C46A]'
                    }`}
                  />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Info Panel */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-[#005B2E]/60 border-2 border-[#C89B3C] text-white shadow-xl backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#E4C46A]">
                  <Barcode className="w-6 h-6 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {activePoint.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">{activePoint.title}</h3>
                <p className="text-sm text-white/90 leading-relaxed">{activePoint.desc}</p>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center text-xs font-semibold text-[#E4C46A]">
                    <CheckCircle2 className="w-4 h-4 text-[#25D366] mr-2" />
                    Controle FIFO / LIFO automatizado
                  </div>
                  <div className="flex items-center text-xs font-semibold text-[#E4C46A]">
                    <CheckCircle2 className="w-4 h-4 text-[#25D366] mr-2" />
                    Inventários rotativos diários
                  </div>
                  <div className="flex items-center text-xs font-semibold text-[#E4C46A]">
                    <CheckCircle2 className="w-4 h-4 text-[#25D366] mr-2" />
                    Segurança armada & Câmeras 24/7
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full mt-4 bg-[#25D366] hover:bg-[#1da851] text-white font-extrabold shadow-lg"
                >
                  <a
                    href={buildWhatsAppUrl(
                      whatsappNumber,
                      `Olá! Gostaria de cotar armazenagem de produtos em estoque (${activePoint.title}) na VeloraLog.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Cotar esta Estrutura
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#01361D] p-3.5 rounded-xl border border-[#C89B3C]/30 text-center">
                <Zap className="w-5 h-5 text-[#E4C46A] mx-auto mb-1" />
                <div className="text-lg font-black text-white">99.9%</div>
                <div className="text-[11px] text-white/70">Acuracidade de Estocagem</div>
              </div>
              <div className="bg-[#01361D] p-3.5 rounded-xl border border-[#C89B3C]/30 text-center">
                <ShieldCheck className="w-5 h-5 text-[#E4C46A] mx-auto mb-1" />
                <div className="text-lg font-black text-white">100%</div>
                <div className="text-[11px] text-white/70">Carga Asegurada</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

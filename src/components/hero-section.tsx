import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { useResponseTime } from '@/hooks/use-response-time'
import { buildWhatsAppUrl } from '@/lib/utils'
import logoDark from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-29182.png'
import warehouseBg from '@/assets/chatgpt-image-1-de-ago.de-2026-122134-e02ba.png'
import {
  MessageCircle,
  FileText,
  ShieldCheck,
  Clock,
  Warehouse,
  Boxes,
  CheckCircle,
} from 'lucide-react'

const DIFFERENTIALS = [
  { icon: ShieldCheck, label: 'Sistema de força de vendas para que você use em sua operação' },
  { icon: Warehouse, label: 'Armazenagem WMS em Espaço Próprio' },
  { icon: Clock, label: 'SLA de Expedição 99.8%' },
  { icon: Boxes, label: '+15.000 Pos. Paletes no ES' },
]

export function HeroSection() {
  const { whatsappNumber } = useSettings()
  const responseTime = useResponseTime()
  const responseTimeFormatted = responseTime?.formatted ?? ''

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-black text-white pt-10 pb-20 border-b border-[#C89B3C]/30 min-h-[90vh] flex flex-col justify-center"
    >
      {/* Background Warehouse Image — maximally visible with minimal neutral gradient for text legibility */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={warehouseBg}
          alt="Operação de Armazenagem Velora Log Espírito Santo"
          className="w-full h-full object-cover object-center opacity-100 brightness-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Main Logo Header */}
          <div className="flex justify-center mb-2 animate-fade-in-down">
            <img
              src={logoDark}
              alt="Velora Log Operações Logísticas"
              className="h-28 sm:h-36 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C89B3C]/60 text-[#E4C46A] text-xs sm:text-sm font-bold shadow-lg backdrop-blur animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Infraestrutura Própria, Operação Segura e Otimizada</span>
          </div>

          {responseTimeFormatted && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005B2E]/80 border border-[#C89B3C]/60 text-[#E4C46A] text-xs sm:text-sm font-bold shadow-lg backdrop-blur animate-fade-in-up">
              <Clock className="w-4 h-4" />
              Resposta em média de {responseTimeFormatted}
            </div>
          )}

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] [text-shadow:0_2px_6px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,1)]">
            Sua Operação Logística Integrada com Precisão, Agilidade e{' '}
            <span className="text-[#E4C46A]">Segurança</span>
          </h1>

          <p className="text-base sm:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed font-normal [text-shadow:0_2px_6px_rgba(0,0,0,0.9),0_0_1px_rgba(0,0,0,1)]">
            Especialistas em armazenagem de alta capacidade com tecnologia WMS, movimentação de
            cargas, picking & packing, logística portuária e distribuição. Atendemos em todo o
            estado do Espírito Santo.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#1da851] text-white text-base font-extrabold shadow-2xl px-8 h-14 rounded-xl border border-white/20 transition-all hover:scale-105"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber || '',
                  'Olá! Gostaria de falar com um especialista da Velora Log sobre as operações de armazenagem e transporte.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-6 h-6 mr-2 shrink-0" />
                Falar com Especialista no WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base font-bold border-2 border-[#C89B3C] text-[#E4C46A] hover:bg-[#C89B3C] hover:text-[#01361D] bg-[#01361D]/80 backdrop-blur h-14 rounded-xl shadow-lg transition-all"
            >
              <a href="#orcamento">
                <FileText className="w-5 h-5 mr-2" />
                Solicitar Cotação Rápida
              </a>
            </Button>
          </div>
        </div>

        {/* Differentials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-14 pt-8 border-t border-[#C89B3C]/30 max-w-5xl mx-auto">
          {DIFFERENTIALS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-[#C89B3C]/30 backdrop-blur hover:border-[#C89B3C] hover:bg-black/60 transition-all shadow-md group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#005B2E] border border-[#C89B3C]/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 text-[#E4C46A]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {item.label}
                </span>
                <span className="text-[10px] text-[#E4C46A] flex items-center gap-1 font-semibold mt-0.5">
                  <CheckCircle className="w-3 h-3 text-[#25D366]" /> Velora Log ES
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import logoDark from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-29182.png'
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
  { icon: ShieldCheck, label: 'Segurança & Seguro Total (RCTR-C/RCF-DC)' },
  { icon: Warehouse, label: 'Armazenagem WMS em Espaço Próprio' },
  { icon: Clock, label: 'SLA de Expedição 99.8%' },
  { icon: Boxes, label: '+15.000 Pos. Paletes no ES' },
]

export function HeroSection() {
  const { whatsappNumber } = useSettings()

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[#01361D] text-white pt-10 pb-20 border-b border-[#C89B3C]/30 min-h-[90vh] flex flex-col justify-center"
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#005B2E]/60 via-[#01361D] to-[#01361D]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(0,91,46,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,_rgba(200,155,60,0.08),transparent_50%)]" />
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

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005B2E]/80 border border-[#C89B3C]/60 text-[#E4C46A] text-xs sm:text-sm font-bold shadow-lg backdrop-blur animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Infraestrutura Própria & Operação em Tempo Real no ES</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-md">
            Sua Operação Logística Integrada com Precisão, Agilidade e{' '}
            <span className="gold-gradient-text">Padrão Premium</span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Especialistas em armazenagem de alta capacidade com tecnologia WMS, movimentação de
            cargas, picking & packing, logística portuária e distribuição no Espírito Santo e todo o
            Brasil.
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
                  whatsappNumber,
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
              className="flex items-center gap-3 bg-[#01361D]/70 p-4 rounded-xl border border-[#C89B3C]/30 backdrop-blur hover:border-[#C89B3C] hover:bg-[#005B2E]/50 transition-all shadow-md group"
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

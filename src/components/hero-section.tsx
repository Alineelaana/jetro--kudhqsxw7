import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, ShieldCheck, Zap, Layers } from 'lucide-react'
import heroBanner from '@/assets/whatsapp-image-2026-08-09-at-23.34.40-00920.jpeg'
import jetroRoboticHand from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-1-f45df.jpeg'

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative bg-[#002817] text-white overflow-hidden py-16 lg:py-24 min-h-[85vh] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 sm:opacity-75 scale-100 pointer-events-none ken-burns"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#002817]/90 via-[#002817]/50 to-transparent sm:bg-gradient-to-b sm:from-[#002817]/70 sm:via-transparent sm:to-[#002817]/90 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left bg-transparent">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-transparent border border-[#C89B3C]/50 text-[#E5B85C] text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm shadow-lg">
              <Zap className="h-4 w-4 text-[#C89B3C] animate-pulse" />
              <span>Plataforma Inteligente de Gestão Empresarial</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              Gestão inteligente para empresas que querem crescer.
            </h1>

            <p className="text-base sm:text-xl text-gray-200 leading-relaxed font-normal max-w-2xl bg-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              O Jetro reúne operações, finanças, vendas, pessoas e indicadores em uma plataforma
              desenvolvida para simplificar a gestão e impulsionar resultados.
            </p>

            <p className="text-lg sm:text-xl font-bold text-[#E5B85C] flex items-center gap-2 bg-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              📞 31 9 9129-7619
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 bg-transparent">
              <Button
                onClick={() => scrollToSection('orcamento')}
                size="lg"
                className="bg-[#005A36]/90 hover:bg-[#007343] text-white font-bold px-8 py-6 text-base rounded-lg shadow-xl shadow-[#005A36]/40 border border-[#008A4D] hover:scale-105 transition-all duration-300 active:scale-95"
              >
                Solicitar Orçamento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={() => scrollToSection('nine-ia')}
                size="lg"
                variant="outline"
                className="border-[#C89B3C]/80 text-[#E5B85C] hover:bg-[#C89B3C]/20 hover:text-white font-bold px-8 py-6 text-base rounded-lg bg-transparent backdrop-blur-sm hover:scale-105 transition-all duration-300 active:scale-95"
              >
                <Bot className="mr-2 h-5 w-5 text-[#C89B3C]" />
                Fale com a Nine
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20 max-w-lg bg-transparent">
              <div className="flex items-center gap-2 bg-transparent">
                <ShieldCheck className="h-5 w-5 text-[#C89B3C] shrink-0" />
                <span className="text-xs text-gray-200 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  Governança Total
                </span>
              </div>
              <div className="flex items-center gap-2 bg-transparent">
                <Layers className="h-5 w-5 text-[#C89B3C] shrink-0" />
                <span className="text-xs text-gray-200 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  Arquitetura Modular
                </span>
              </div>
              <div className="flex items-center gap-2 bg-transparent">
                <Bot className="h-5 w-5 text-[#C89B3C] shrink-0" />
                <span className="text-xs text-gray-200 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  IA Integrada
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto rounded-2xl overflow-hidden border-2 border-[#C89B3C]/60 shadow-2xl shadow-black/80 group hover:shadow-[#C89B3C]/20 transition-all duration-500">
              <img
                src={jetroRoboticHand}
                alt="Jetro - Nine IA & Jetro Platform"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002817]/90 via-[#002817]/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-transparent backdrop-blur-md border border-[#C89B3C]/40 text-xs text-gray-100 shadow-xl">
                <p className="font-bold text-[#E5B85C] mb-1 flex items-center gap-1.5 bg-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  <Zap className="h-3.5 w-3.5 text-[#C89B3C]" />
                  Nine IA &amp; Jetro Platform
                </p>
                <p className="bg-transparent text-gray-100 font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  Orquestração de operações e inteligência preditiva em tempo real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

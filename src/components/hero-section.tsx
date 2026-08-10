import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, ShieldCheck, Zap, Layers } from 'lucide-react'
import heroBanner from '@/assets/whatsapp-image-2026-08-09-at-23.34.40-93309.jpeg'

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative bg-gradient-to-b from-[#001D0F] via-[#002E1B] to-[#001D0F] text-white overflow-hidden py-16 lg:py-24">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none filter blur-sm scale-105"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#001D0F]/90 via-[#002E1B]/85 to-[#001D0F] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C89B3C]/10 border border-[#C89B3C]/40 text-[#E5B85C] text-xs sm:text-sm font-semibold tracking-wide">
              <Zap className="h-4 w-4 text-[#C89B3C]" />
              <span>Plataforma Inteligente de Gestão Empresarial</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Gestão inteligente para empresas que querem crescer com controle.
            </h1>

            <p className="text-base sm:text-xl text-gray-300 leading-relaxed font-normal max-w-2xl">
              O Jetro conecta áreas, processos, pessoas e informações em uma única plataforma,
              ajudando sua empresa a tomar decisões melhores, operar com eficiência e crescer com
              segurança.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                onClick={() => scrollToSection('plataforma')}
                size="lg"
                className="bg-[#005A36] hover:bg-[#007343] text-white font-bold px-8 py-6 text-base rounded-lg shadow-xl shadow-[#005A36]/30 border border-[#008A4D]"
              >
                Conheça o Jetro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={() => scrollToSection('nine-ia')}
                size="lg"
                variant="outline"
                className="border-[#C89B3C]/60 text-[#E5B85C] hover:bg-[#C89B3C]/10 hover:text-white font-bold px-8 py-6 text-base rounded-lg bg-black/20 backdrop-blur"
              >
                <Bot className="mr-2 h-5 w-5 text-[#C89B3C]" />
                Fale com a Nine
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#C89B3C] shrink-0" />
                <span className="text-xs text-gray-300 font-medium">Governança Total</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#C89B3C] shrink-0" />
                <span className="text-xs text-gray-300 font-medium">Arquitetura Modular</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#C89B3C] shrink-0" />
                <span className="text-xs text-gray-300 font-medium">IA Integrada</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto rounded-2xl overflow-hidden border-2 border-[#C89B3C]/50 shadow-2xl shadow-black/80 group">
              <img
                src={heroBanner}
                alt="Jetro - Gestão Inteligente com IA Nine"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001D0F]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/70 backdrop-blur border border-[#C89B3C]/30 text-xs text-gray-200">
                <p className="font-bold text-[#E5B85C] mb-1 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#C89B3C]" />
                  Nine IA &amp; Jetro Platform
                </p>
                <p>Orquestração de operações e inteligência preditiva em tempo real.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

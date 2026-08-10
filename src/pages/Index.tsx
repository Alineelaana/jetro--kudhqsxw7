import { useState } from 'react'
import { HeroSection } from '@/components/hero-section'
import { SegmentsSection } from '@/components/segments-section'
import { PlatformModulesSection } from '@/components/platform-modules-section'
import { NineIaSection } from '@/components/nine-ia-section'
import { BudgetForm } from '@/components/budget-form'
import { FinalCTA } from '@/components/final-cta'
import { SeoHead } from '@/components/seo-head'
import { useSettings } from '@/hooks/use-settings'

export default function Index() {
  const { whatsappNumber } = useSettings()
  const safeWhatsapp = whatsappNumber || ''
  const [selectedService, setSelectedService] = useState<string>('')

  return (
    <main className="min-h-screen bg-background">
      <SeoHead />
      <HeroSection />
      <PlatformModulesSection />
      <SegmentsSection />
      <NineIaSection />

      <section id="contato" className="bg-white relative">
        <div id="orcamento" className="max-w-4xl mx-auto px-0">
          <div className="bg-[#002817] text-white px-6 sm:px-10 py-10 sm:py-14 text-center space-y-3 rounded-t-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#C89B3C]/20 border border-[#C89B3C]/50 text-[#E5B85C] text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              Solicitação de Apresentação Comercial
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Fale com nossos consultores de solução
            </h2>
            <p className="text-gray-100 max-w-2xl mx-auto text-base leading-relaxed">
              Preencha os dados da sua empresa para que nossa equipe apresente a arquitetura Jetro
              ideal para a sua operação.
            </p>
            <p className="text-[#E5B85C] text-lg sm:text-xl font-bold pt-2">31 9 9129-7619</p>
          </div>
          <div className="bg-white px-6 sm:px-10 pb-10 pt-8 rounded-b-2xl border border-border shadow-xl">
            <BudgetForm whatsappNumber={safeWhatsapp} selectedService={selectedService} />
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  )
}

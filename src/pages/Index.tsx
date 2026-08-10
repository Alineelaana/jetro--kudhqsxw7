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

      <section id="contato" className="py-16 sm:py-24 bg-white relative">
        <div id="orcamento" className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10 space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#C89B3C]/10 border border-[#C89B3C]/40 text-[#8F6A1E] text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              Solicitação de Apresentação Comercial
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Fale com nossos consultores de solução
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Preencha os dados da sua empresa para que nossa equipe apresente a arquitetura Jetro
              ideal para a sua operação.
            </p>
          </div>
          <BudgetForm whatsappNumber={safeWhatsapp} selectedService={selectedService} />
        </div>
      </section>

      <FinalCTA />
    </main>
  )
}

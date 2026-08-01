import { useState } from 'react'
import { HeroSection } from '@/components/hero-section'
import { ServicesSection } from '@/components/services-section'
import { BudgetForm } from '@/components/budget-form'
import { FinalCTA } from '@/components/final-cta'
import { useSettings } from '@/hooks/use-settings'

export default function Index() {
  const { whatsappNumber } = useSettings()
  const [selectedService, setSelectedService] = useState<string>('')

  const handleSelectService = (serviceTitle: string) => {
    setSelectedService(serviceTitle)
    const budgetSection = document.getElementById('orcamento')
    if (budgetSection) {
      budgetSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <HeroSection />
      <ServicesSection onSelectService={handleSelectService} />
      <section id="orcamento" className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10 space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#C89B3C]/10 border border-[#C89B3C]/30 text-[#8F6A1E] text-xs sm:text-sm font-bold uppercase tracking-wider">
              Solicitação de Proposta
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Solicite seu Orçamento Personalizado
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Preencha os dados da sua demanda operacional abaixo. Nossa equipe analisará os
              requisitos e retornará rapidamente com a melhor solução.
            </p>
          </div>
          <BudgetForm whatsappNumber={whatsappNumber} selectedService={selectedService} />
        </div>
      </section>
      <FinalCTA />
    </>
  )
}

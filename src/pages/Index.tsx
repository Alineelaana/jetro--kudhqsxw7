import { HeroSection } from '@/components/hero-section'
import { ServicesSection } from '@/components/services-section'
import { BudgetForm } from '@/components/budget-form'
import { FinalCTA } from '@/components/final-cta'
import { useSettings } from '@/hooks/use-settings'

export default function Index() {
  const { whatsappNumber } = useSettings()

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <section id="orcamento" className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10 space-y-3">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Orçamento
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Solicite seu Orçamento
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Preencha o formulário abaixo e receba uma proposta personalizada. Nossa equipe entrará
              em contato em breve.
            </p>
          </div>
          <BudgetForm whatsappNumber={whatsappNumber} />
        </div>
      </section>
      <FinalCTA />
    </>
  )
}

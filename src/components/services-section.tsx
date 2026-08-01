import { ServiceCard } from '@/components/service-card'
import { SERVICES } from '@/lib/constants'
import { useSettings } from '@/hooks/use-settings'

interface ServicesSectionProps {
  onSelectService?: (title: string) => void
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const { whatsappNumber } = useSettings()

  return (
    <section id="servicos" className="py-20 bg-muted/40 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#005B2E]/10 border border-[#005B2E]/20 text-[#005B2E] text-xs md:text-sm font-bold tracking-wide uppercase">
            Nossas Soluções Logísticas
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Excelência Operacional para o seu Negócio
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Com tecnologia de ponta, instalações modernas e equipe especializada, atendemos às
            demandas mais exigentes do mercado capixaba e nacional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              whatsappNumber={whatsappNumber}
              onSelect={onSelectService}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

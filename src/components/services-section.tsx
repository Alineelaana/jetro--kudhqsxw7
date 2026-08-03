import { ServiceCard } from '@/components/service-card'
import { SERVICES } from '@/lib/constants'

interface ServicesSectionProps {
  onSelectService?: (title: string) => void
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const safeServices = Array.isArray(SERVICES) ? SERVICES : []

  return (
    <section id="servicos" className="py-20 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#005B2E]/10 border border-[#005B2E]/30 text-[#005B2E] text-xs md:text-sm font-extrabold tracking-wide uppercase">
            Nossas Soluções Logísticas
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Excelência Operacional para o seu Negócio
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Com tecnologia WMS de ponta, instalações próprias modernas e equipe altamente
            qualificada. Atendemos em todo o estado do Espírito Santo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {safeServices
            .filter(Boolean)
            .filter((s) => s && typeof s === 'object' && s.id)
            .map((service) => (
              <ServiceCard key={service.id} service={service} onSelect={onSelectService} />
            ))}
        </div>
      </div>
    </section>
  )
}

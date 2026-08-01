import { ServiceCard } from '@/components/service-card'
import { SERVICES } from '@/lib/constants'
import { useSettings } from '@/hooks/use-settings'

export function ServicesSection() {
  const { whatsappNumber } = useSettings()

  return (
    <section id="servicos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-3">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Nossos Serviços
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Soluções Logísticas Completas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oferecemos uma operação logística integrada e customizada para atender às demandas do
            seu negócio no Espírito Santo e em todo o Brasil.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

import { BUSINESS_SEGMENTS } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import {
  Briefcase,
  Truck,
  Building2,
  Factory,
  ShoppingBag,
  Network,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'

const iconMap: Record<string, any> = {
  Briefcase,
  Truck,
  Building2,
  Factory,
  ShoppingBag,
  Network,
  TrendingUp,
}

export function SegmentsSection() {
  return (
    <section id="segmentos" className="py-16 sm:py-24 bg-slate-50 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#005A36]/10 text-[#005A36] text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            Versatilidade Empresarial
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            Um sistema preparado para diferentes modelos de negócio
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            O Jetro adapta-se à dinâmica específica do seu segmento, unificando operações complexas
            em fluxos inteligentes e produtivos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUSINESS_SEGMENTS.map((segment) => {
            const IconComponent = iconMap[segment.iconName] || Briefcase
            return (
              <Card
                key={segment.id}
                className="border border-border/80 hover:border-[#C89B3C] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-[#005A36]/10 text-[#005A36] flex items-center justify-center border border-[#005A36]/20">
                    <IconComponent className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{segment.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {segment.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/50 space-y-2">
                    {segment.highlights.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs font-semibold text-foreground/80"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#C89B3C] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

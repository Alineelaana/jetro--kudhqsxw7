import {
  Briefcase,
  Truck,
  Building2,
  Factory,
  ShoppingBag,
  Network,
  TrendingUp,
  ArrowRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BUSINESS_SEGMENTS } from '@/lib/constants'

interface SegmentsSectionProps {
  onSelectSegment?: (segmentTitle: string) => void
}

const ICON_MAP: Record<string, any> = {
  Briefcase,
  Truck,
  Building2,
  Factory,
  ShoppingBag,
  Network,
  TrendingUp,
}

export function SegmentsSection({ onSelectSegment }: SegmentsSectionProps) {
  const segments = BUSINESS_SEGMENTS

  return (
    <section
      id="segmentos"
      className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-border/50"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center space-y-4 mb-14">
          <Badge className="bg-[#C89B3C]/10 text-[#8F6A1E] dark:text-[#E2B755] border-[#C89B3C]/30 px-4 py-1.5 text-xs uppercase font-extrabold tracking-wider">
            Segmentos Atendidos
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Tecnologia adaptada ao seu segmento
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
            O Jetro adapta suas funcionalidades às especificidades de cada modelo de negócio,
            garantindo a aderência operacional necessária para o sucesso da sua empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {segments.map((seg) => {
            const IconComp = ICON_MAP[seg.iconName] || Briefcase
            return (
              <div
                key={seg.id}
                className="flex flex-col justify-between p-8 rounded-2xl bg-background border border-border hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  <div className="p-3.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-600 transition-colors">
                    {seg.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {seg.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-border/60">
                    {seg.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => onSelectSegment && onSelectSegment(seg.title)}
                    variant="outline"
                    className="w-full justify-between border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                  >
                    <span>Solicitar demonstração</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

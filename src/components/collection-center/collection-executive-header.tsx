import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, type ExecutiveStats } from '@/lib/collection-center-types'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle,
  Clock,
  TrendingDown,
  Users,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CARDS = [
  {
    key: '',
    label: 'Total Vencido',
    icon: Wallet,
    color: 'text-red-600',
    getValue: (s: ExecutiveStats) => formatCurrency(s.totalVencido),
  },
  {
    key: '',
    label: 'Clientes Inadimplentes',
    icon: Users,
    color: 'text-orange-600',
    getValue: (s: ExecutiveStats) => String(s.clientesInadimplentes),
  },
  {
    key: '',
    label: 'Qtd. Títulos',
    icon: Clock,
    color: 'text-blue-600',
    getValue: (s: ExecutiveStats) => String(s.quantidadeTitulos),
  },
  {
    key: 'vencido_hoje',
    label: 'Vencido Hoje',
    icon: CalendarClock,
    color: 'text-red-500',
    getValue: (s: ExecutiveStats) => formatCurrency(s.vencidoHoje),
  },
  {
    key: '1_7',
    label: '1-7 dias',
    icon: CalendarClock,
    color: 'text-yellow-500',
    getValue: (s: ExecutiveStats) => formatCurrency(s.faixa17),
  },
  {
    key: '8_15',
    label: '8-15 dias',
    icon: CalendarClock,
    color: 'text-yellow-600',
    getValue: (s: ExecutiveStats) => formatCurrency(s.faixa815),
  },
  {
    key: '16_30',
    label: '16-30 dias',
    icon: CalendarClock,
    color: 'text-orange-500',
    getValue: (s: ExecutiveStats) => formatCurrency(s.faixa1630),
  },
  {
    key: '31_60',
    label: '31-60 dias',
    icon: CalendarClock,
    color: 'text-orange-600',
    getValue: (s: ExecutiveStats) => formatCurrency(s.faixa3160),
  },
  {
    key: '61_90',
    label: '61-90 dias',
    icon: CalendarClock,
    color: 'text-red-500',
    getValue: (s: ExecutiveStats) => formatCurrency(s.faixa6190),
  },
  {
    key: '90_plus',
    label: 'Acima 90 dias',
    icon: AlertCircle,
    color: 'text-red-700',
    getValue: (s: ExecutiveStats) => formatCurrency(s.faixa90Plus),
  },
  {
    key: 'promessas_hoje',
    label: 'Promessas Hoje',
    icon: CheckCircle,
    color: 'text-blue-600',
    getValue: (s: ExecutiveStats) => String(s.promessasHoje),
  },
  {
    key: 'promessas_quebradas',
    label: 'Promessas Quebradas',
    icon: AlertCircle,
    color: 'text-red-600',
    getValue: (s: ExecutiveStats) => String(s.promessasQuebradas),
  },
  {
    key: '',
    label: 'Recuperado Hoje',
    icon: TrendingDown,
    color: 'text-green-600',
    getValue: (s: ExecutiveStats) => formatCurrency(s.recuperadoHoje),
  },
  {
    key: '',
    label: 'Recuperado no Mês',
    icon: TrendingDown,
    color: 'text-green-700',
    getValue: (s: ExecutiveStats) => formatCurrency(s.recuperadoMes),
  },
]

export function CollectionExecutiveHeader({
  stats,
  onCardClick,
}: {
  stats: ExecutiveStats
  onCardClick: (key: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
      {CARDS.map((card, i) => {
        const Icon = card.icon
        const clickable = card.key !== ''
        return (
          <Card
            key={i}
            className={cn(
              'border-2 border-[#005B2E]/10 shadow-sm transition-all',
              clickable && 'cursor-pointer hover:border-[#005B2E]/40 hover:shadow-md',
            )}
            onClick={() => clickable && onCardClick(card.key)}
          >
            <CardContent className="p-2.5 flex items-center gap-2">
              <Icon className={cn('w-4 h-4 shrink-0', card.color)} />
              <div className="min-w-0">
                <p className="text-sm font-black text-foreground truncate">
                  {card.getValue(stats)}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

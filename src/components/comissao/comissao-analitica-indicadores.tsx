import { type IndicadoresComissao } from '@/services/comissao-analitica'
import { TrendingUp, RotateCcw, Calculator, PlusCircle, MinusCircle, Wallet } from 'lucide-react'

interface IndicadoresProps {
  indicadores: IndicadoresComissao
}

function formatMoeda(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

export function ComissaoAnaliticaIndicadores({ indicadores }: IndicadoresProps) {
  const cards = [
    {
      label: 'Total de Vendas Consideradas',
      valor: formatMoeda(indicadores.totalVendasConsideradas),
      subtext: 'Base bruta de operações faturadas',
      icon: TrendingUp,
      color: 'text-[#002817] dark:text-[#E4C46A]',
      bgIcon: 'bg-[#002817]/10 text-[#002817] dark:text-[#E4C46A]',
      border: 'border-l-4 border-l-[#002817]',
    },
    {
      label: 'Total de Devoluções',
      valor: formatMoeda(indicadores.totalDevolucoes),
      subtext: 'Mercadorias devolvidas no período',
      icon: RotateCcw,
      color: 'text-amber-600 dark:text-amber-400',
      bgIcon: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      border: 'border-l-4 border-l-amber-500',
    },
    {
      label: 'Base de Cálculo da Comissão',
      valor: formatMoeda(indicadores.baseCalculo),
      subtext: 'Base líquida de incidência',
      icon: Calculator,
      color: 'text-blue-700 dark:text-blue-400',
      bgIcon: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
      border: 'border-l-4 border-l-blue-600',
    },
    {
      label: 'Comissões Positivas',
      valor: formatMoeda(indicadores.comissoesPositivas),
      subtext: 'Gerações brutas de vendas/títulos',
      icon: PlusCircle,
      color: 'text-emerald-700 dark:text-emerald-400',
      bgIcon: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
      border: 'border-l-4 border-l-emerald-600',
    },
    {
      label: 'Estornos e Descontos',
      valor: formatMoeda(indicadores.estornosDescontos),
      subtext: 'Retenções e estornos por devolução',
      icon: MinusCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgIcon: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      border: 'border-l-4 border-l-rose-500',
    },
    {
      label: 'Comissão Líquida Apurada',
      valor: formatMoeda(indicadores.comissaoLiquida),
      subtext: 'Positivas (-) Estornos',
      icon: Wallet,
      color: 'text-[#002817] dark:text-[#E4C46A] font-extrabold',
      bgIcon: 'bg-[#C9A227]/20 text-[#002817] dark:text-[#E4C46A]',
      border: 'border-l-4 border-l-[#C9A227]',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const IconComponent = c.icon
        return (
          <div
            key={i}
            className={`bg-card border border-border rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between ${c.border}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground line-clamp-1 leading-snug">
                {c.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c.bgIcon}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className={`text-base sm:text-lg font-bold tracking-tight ${c.color}`}>
                {c.valor}
              </div>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">{c.subtext}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

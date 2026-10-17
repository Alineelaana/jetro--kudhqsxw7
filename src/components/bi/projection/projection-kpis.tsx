import { Card, CardContent } from '@/components/ui/card'
import { fmtCurrency, fmtPct, getTendenciaInfo, type ProjectionKPIs } from '@/lib/projection-utils'

interface Props {
  kpis: ProjectionKPIs
}

export function ProjectionKPIs({ kpis }: Props) {
  const tend = getTendenciaInfo(kpis.tendencia)
  const metaTxt = kpis.meta > 0 ? fmtCurrency(kpis.meta) : 'Não configurada'
  const borderClass =
    tend.color === 'text-emerald-600'
      ? 'border-emerald-500/30'
      : tend.color === 'text-amber-600'
        ? 'border-amber-500/30'
        : 'border-red-500/30'

  const cards = [
    { label: 'Meta do Mês', value: metaTxt, color: 'text-[#005B2E]' },
    { label: 'Valor Vendido', value: fmtCurrency(kpis.vendido), color: 'text-blue-600' },
    { label: 'Valor Faturado', value: fmtCurrency(kpis.faturado), color: 'text-[#005B2E]' },
    {
      label: '% Meta Atingida',
      value: kpis.meta > 0 ? fmtPct(kpis.pct_meta) : '—',
      color: 'text-emerald-600',
    },
    {
      label: 'Restante p/ Meta',
      value: kpis.meta > 0 ? fmtCurrency(kpis.restante) : '—',
      color: 'text-amber-600',
    },
    { label: 'Média/Dia Útil', value: fmtCurrency(kpis.media_dia), color: 'text-purple-600' },
    { label: 'Dias Decorridos', value: String(kpis.dias_uteis_decorridos), color: 'text-cyan-600' },
    { label: 'Dias Restantes', value: String(kpis.dias_uteis_restantes), color: 'text-blue-600' },
    { label: 'Dias Totais', value: String(kpis.dias_uteis_totais), color: 'text-[#005B2E]' },
    { label: 'Projeção Fechamento', value: fmtCurrency(kpis.projecao), color: 'text-[#005B2E]' },
    {
      label: '% Projetado',
      value: kpis.meta > 0 ? fmtPct(kpis.pct_projetado) : '—',
      color: tend.color,
    },
    {
      label: 'Dif. Projetada',
      value: kpis.meta > 0 ? fmtCurrency(kpis.diferenca_projetada) : '—',
      color: kpis.diferenca_projetada >= 0 ? 'text-emerald-600' : 'text-red-600',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {cards.map((c, i) => (
          <Card key={i} className="border-2 border-[#005B2E]/10">
            <CardContent className="py-2 px-3">
              <p className="text-sm font-black text-foreground truncate">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className={`border-2 ${borderClass}`}>
        <CardContent className="py-2 flex items-center gap-2 flex-wrap">
          <span className="text-lg">{tend.icon}</span>
          <span className={`font-bold text-sm ${tend.color}`}>{tend.label}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            Projeção: {fmtCurrency(kpis.projecao)} | Meta: {metaTxt}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}

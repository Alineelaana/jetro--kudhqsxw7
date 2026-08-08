import { Card, CardContent } from '@/components/ui/card'
import { fmtCurrency, fmtPct, type ComparativeData } from '@/lib/projection-utils'
import { Loader2 } from 'lucide-react'

interface Props {
  data: ComparativeData | null
  loading: boolean
  currentFaturado: number
  currentProjecao: number
}

export function ProjectionComparative({ data, loading, currentFaturado, currentProjecao }: Props) {
  if (loading) {
    return (
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 flex justify-center">
          <Loader2 className="w-5 h-5 text-[#005B2E] animate-spin" />
        </CardContent>
      </Card>
    )
  }
  if (!data || data.periods.length === 0) return null

  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardContent className="py-4">
        <h3 className="font-bold text-[#005B2E] mb-3">Análise Comparativa (Referência)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#005B2E]/20">
                <th className="text-left py-2 px-2 text-[#005B2E]">Período</th>
                <th className="text-right py-2 px-2 text-[#005B2E]">Faturado</th>
                <th className="text-right py-2 px-2 text-[#005B2E]">Projeção</th>
                <th className="text-right py-2 px-2 text-[#005B2E]">vs Atual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-[#005B2E]/5 font-bold">
                <td className="py-2 px-2">Período Atual</td>
                <td className="py-2 px-2 text-right text-[#005B2E]">
                  {fmtCurrency(currentFaturado)}
                </td>
                <td className="py-2 px-2 text-right text-[#005B2E]">
                  {fmtCurrency(currentProjecao)}
                </td>
                <td className="py-2 px-2 text-right">—</td>
              </tr>
              {data.periods.map((p) => {
                const diff = p.hasData ? currentProjecao - p.projecao : 0
                const diffPct = p.hasData && p.projecao > 0 ? (diff / p.projecao) * 100 : 0
                return (
                  <tr key={p.key} className="border-b border-border">
                    <td className="py-2 px-2">{p.label}</td>
                    <td className="py-2 px-2 text-right">
                      {p.hasData ? (
                        fmtCurrency(p.faturado)
                      ) : (
                        <span className="text-muted-foreground italic">sem dados</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {p.hasData ? (
                        fmtCurrency(p.projecao)
                      ) : (
                        <span className="text-muted-foreground italic">sem dados</span>
                      )}
                    </td>
                    <td
                      className={`py-2 px-2 text-right ${
                        p.hasData ? (diff >= 0 ? 'text-emerald-600' : 'text-red-600') : ''
                      }`}
                    >
                      {p.hasData ? `${diffPct >= 0 ? '+' : ''}${fmtPct(diffPct)}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * Valores comparativos são apenas referência. A projeção oficial permanece: Faturado ÷
          dias úteis decorridos × dias úteis totais.
        </p>
      </CardContent>
    </Card>
  )
}

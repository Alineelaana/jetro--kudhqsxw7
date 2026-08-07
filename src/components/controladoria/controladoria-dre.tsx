import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, FileDown, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import {
  computeDRE,
  computeBudgetVsActual,
  computeVariation,
  reconcileDRE,
} from '@/services/controladoria-analytics'
import { exportBICsv } from '@/lib/bi-export'
import { useAuth } from '@/hooks/use-auth'
import type { DREResult } from '@/lib/controladoria-types'
import { RESULT_VERSIONS, STATUS_COLORS } from '@/lib/controladoria-types'
import { cn } from '@/lib/utils'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const VERSION_LABELS: Record<string, string> = {
  contabil: 'Contábil',
  gerencial: 'Gerencial',
  analitica: 'Analítica',
  oficial: 'Oficial',
  orcado: 'Orçado',
  forecast: 'Forecast',
  rolling_forecast: 'Rolling Forecast',
  reforecast: 'Reforecast',
  simulado: 'Simulado',
  consolidado: 'Consolidado',
}

export function ControladoriaDRE() {
  const { user } = useAuth()
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7))
  const [version, setVersion] = useState('contabil')
  const [comparison, setComparison] = useState('none')
  const [dre, setDre] = useState<DREResult | null>(null)
  const [prevDre, setPrevDre] = useState<DREResult | null>(null)
  const [budgetVsActual, setBudgetVsActual] = useState<any[]>([])
  const [variation, setVariation] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const result = await computeDRE(period, version)
      setDre(result)
      if (comparison === 'budget') {
        setBudgetVsActual(await computeBudgetVsActual(period, result))
      } else if (comparison === 'previous') {
        const prevPeriod = getPrevPeriod(period)
        const prev = await computeDRE(prevPeriod, version)
        setPrevDre(prev)
        setVariation(await computeVariation(result, prev))
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [period, version, comparison])

  const getPrevPeriod = (p: string): string => {
    const [y, m] = p.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!dre) return <p className="text-center py-6 text-muted-foreground">Dados insuficientes.</p>

  const reconciliation = reconcileDRE(dre)
  const showComparison =
    comparison === 'budget' ? budgetVsActual : comparison === 'previous' ? variation : []

  const handleExport = () => {
    const headers = ['Linha', 'Grupo', 'Valor', '% Receita']
    const rows = dre.lines.map((l) => [
      l.label,
      l.group,
      fmt(l.value),
      `${fmt(l.percentage_of_revenue || 0)}%`,
    ])
    exportBICsv(`DRE_${version}_${period}`, headers, rows, (user?.name as string) || 'Usuário')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Período</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Versão do Resultado</label>
          <Select value={version} onValueChange={setVersion}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESULT_VERSIONS.filter((v) => v !== 'simulado').map((v) => (
                <SelectItem key={v} value={v}>
                  {VERSION_LABELS[v] || v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Comparativo</label>
          <Select value={comparison} onValueChange={setComparison}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem comparação</SelectItem>
              <SelectItem value="previous">Período anterior</SelectItem>
              <SelectItem value="budget">Orçado x Realizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <FileDown className="w-4 h-4 mr-1" /> Exportar
        </Button>
      </div>

      <Card
        className={cn(
          'border-2',
          reconciliation.reconciled ? 'border-emerald-600/30' : 'border-red-600/30',
        )}
      >
        <CardContent className="py-2 flex items-center gap-2">
          {reconciliation.reconciled ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-xs font-medium">
            Reconciliação: {reconciliation.reconciled ? 'OK' : 'Divergência detectada'}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            Versão: {VERSION_LABELS[version] || version} | Período: {period}
          </span>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#005B2E]/20">
                  <th className="text-left py-2 px-2 text-[#005B2E]">Linha DRE</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">Valor</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">% Receita</th>
                  {comparison !== 'none' && (
                    <th className="text-right py-2 px-2 text-[#005B2E]">Comparativo</th>
                  )}
                  <th className="text-center py-2 px-2 text-[#005B2E]">Drill-down</th>
                </tr>
              </thead>
              <tbody>
                {dre.lines.map((l) => (
                  <tr
                    key={l.line_key}
                    className={cn(
                      'border-b border-border hover:bg-[#005B2E]/5',
                      l.is_calculated && 'font-bold bg-[#005B2E]/5',
                    )}
                  >
                    <td className="py-2 px-2">
                      <span style={{ paddingLeft: `${(l.level - 1) * 12}px` }}>{l.label}</span>
                    </td>
                    <td className="py-2 px-2 text-right font-medium">R$ {fmt(l.value)}</td>
                    <td className="py-2 px-2 text-right text-muted-foreground">
                      {fmt(l.percentage_of_revenue || 0)}%
                    </td>
                    {comparison !== 'none' && (
                      <td className="py-2 px-2 text-right">
                        {showComparison.find((c) => c.line_key === l.line_key) ? (
                          <span
                            className={cn(
                              'text-xs',
                              showComparison.find((c) => c.line_key === l.line_key)?.diff_pct > 0
                                ? 'text-red-600'
                                : 'text-emerald-600',
                            )}
                          >
                            {fmt(showComparison.find((c) => c.line_key === l.line_key)?.diff || 0)}(
                            {fmt(
                              showComparison.find((c) => c.line_key === l.line_key)?.diff_pct || 0,
                            )}
                            %)
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    <td className="py-2 px-2 text-center">
                      {!l.is_calculated && (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground inline cursor-pointer hover:text-[#005B2E]" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(dre.totals).map(([key, val]) => (
          <Card key={key} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">
                {key.replace(/_/g, ' ').toUpperCase()}
              </p>
              <p className="text-lg font-black text-[#005B2E]">R$ {fmt(val)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

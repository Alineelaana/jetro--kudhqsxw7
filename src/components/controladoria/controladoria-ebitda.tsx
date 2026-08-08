import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Percent, Diamond } from 'lucide-react'
import { getEbitdaConfigs } from '@/services/controladoria'
import { computeEbitda } from '@/services/controladoria-analytics'
import { useRealtime } from '@/hooks/use-realtime'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ControladoriaEbitda() {
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7))
  const [configs, setConfigs] = useState<Record<string, unknown>[]>([])
  const [ebitda, setEbitda] = useState<{
    ebitda: number
    margin: number
    components: Array<{ key: string; label: string; value: number }>
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [cfgData, eb] = await Promise.all([getEbitdaConfigs(), computeEbitda(period)])
      setConfigs(cfgData as Record<string, unknown>[])
      setEbitda(eb)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [period])
  useRealtime('controladoria_ebitda_config', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const activeConfig = configs.find((c) => c.is_active !== false)
  const marginTarget = activeConfig ? parseFloat(String(activeConfig.margin_target || '0')) : 0
  const marginAchieved = ebitda ? ebitda.margin >= marginTarget : false

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
      </div>
      {activeConfig && (
        <Card className="border-2 border-[#005B2E]/20 bg-[#005B2E]/5">
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Fórmula ativa:</p>
            <p className="text-sm font-mono font-bold text-[#005B2E]">
              {String(activeConfig.formula_expression || '—')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {String(activeConfig.description || '')}
            </p>
          </CardContent>
        </Card>
      )}
      {ebitda && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4 text-center">
                <Diamond className="w-6 h-6 text-[#005B2E] mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">EBITDA</p>
                <p className="text-2xl font-black text-[#005B2E]">R$ {fmt(ebitda.ebitda)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#C89B3C]/30">
              <CardContent className="py-4 text-center">
                <Percent className="w-6 h-6 text-[#C89B3C] mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Margem EBITDA</p>
                <p className="text-2xl font-black text-[#C89B3C]">{fmt(ebitda.margin)}%</p>
                {marginTarget > 0 && (
                  <Badge
                    variant="outline"
                    className={
                      marginAchieved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }
                  >
                    Meta: {marginTarget}% {marginAchieved ? '✓' : '✗'}
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-500/20">
              <CardContent className="py-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Componentes</p>
                <p className="text-2xl font-black text-blue-600">{ebitda.components.length}</p>
              </CardContent>
            </Card>
          </div>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <h3 className="font-bold text-[#005B2E] text-sm mb-3">Composição do EBITDA</h3>
              <div className="space-y-2">
                {ebitda.components.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center justify-between border-b border-border py-2"
                  >
                    <div>
                      <span className="text-sm font-medium">{c.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">({c.key})</span>
                    </div>
                    <span className="text-sm font-bold">R$ {fmt(c.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 bg-[#005B2E]/5 rounded-md px-3">
                  <span className="text-sm font-bold text-[#005B2E]">EBITDA Total</span>
                  <span className="text-sm font-black text-[#005B2E]">R$ {fmt(ebitda.ebitda)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

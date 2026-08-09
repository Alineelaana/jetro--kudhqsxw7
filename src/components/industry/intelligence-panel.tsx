import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Brain, AlertTriangle, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react'
import {
  getIntelligenceAlerts,
  getIntelligenceRecommendations,
  getIntelligencePredictions,
  detectIntelligence,
} from '@/services/industrial-intelligence'
import { IntelligenceDetailDialog } from '@/components/industry/intelligence-detail-dialog'
import { AnalyzeInBiButton } from '@/components/industry/analyze-in-bi-button'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import type {
  IntelligenceAlert,
  IntelligenceRecommendation,
  IntelligencePrediction,
} from '@/lib/industrial-intelligence-types'

const SEV_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
}
const PRI_COLORS: Record<string, string> = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-gray-400 text-white',
}

export function IntelligencePanel() {
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([])
  const [recs, setRecs] = useState<IntelligenceRecommendation[]>([])
  const [preds, setPreds] = useState<IntelligencePrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [dialog, setDialog] = useState<{
    open: boolean
    title: string
    alerts?: IntelligenceAlert[]
    recs?: IntelligenceRecommendation[]
  }>({ open: false, title: '' })

  const load = async () => {
    try {
      const [a, r, p] = await Promise.all([
        getIntelligenceAlerts(),
        getIntelligenceRecommendations(),
        getIntelligencePredictions(),
      ])
      setAlerts(a.filter((x) => x.status === 'open' || x.status === 'acknowledged'))
      setRecs(r.filter((x) => x.status === 'pending'))
      setPreds(p.filter((x) => x.status === 'active'))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_intelligence_alerts', () => load())
  useRealtime('industrial_intelligence_recommendations', () => load())

  const handleDetect = async () => {
    setDetecting(true)
    try {
      await detectIntelligence()
      toast({ title: 'Detecção executada' })
      load()
    } catch {
      toast({ title: 'Erro na detecção', variant: 'destructive' })
    }
    setDetecting(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Inteligência Industrial</h2>
        </div>
        <div className="flex gap-2">
          <AnalyzeInBiButton context={{ module: 'industrial', resource: 'intelligence' }} />
          <Button
            onClick={handleDetect}
            disabled={detecting}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${detecting ? 'animate-spin' : ''}`} />
            Detectar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card
          className="border-2 border-red-200 cursor-pointer hover:border-red-400"
          onClick={() => setDialog({ open: true, title: 'Alertas', alerts })}
        >
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-xl font-black">{alerts.length}</p>
              <p className="text-xs text-muted-foreground">Alertas</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-2 border-amber-200 cursor-pointer hover:border-amber-400"
          onClick={() => setDialog({ open: true, title: 'Recomendações', recs })}
        >
          <CardContent className="py-3 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-xl font-black">{recs.length}</p>
              <p className="text-xs text-muted-foreground">Recomendações</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200">
          <CardContent className="py-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-xl font-black">{preds.length}</p>
              <p className="text-xs text-muted-foreground">Previsões</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3 flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#005B2E]" />
            <div>
              <p className="text-xl font-black">{alerts.length + recs.length + preds.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardContent className="py-4">
            <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Alertas Ativos
            </h3>
            <div className="space-y-2">
              {alerts.slice(0, 8).map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-2 p-2 bg-red-50/30 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    {a.justification && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Justificativa:</strong> {a.justification}
                      </p>
                    )}
                    {a.expected_impact && (
                      <p className="text-xs text-muted-foreground">
                        <strong>Impacto:</strong> {a.expected_impact}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Badge className={SEV_COLORS[a.severity] || ''}>{a.severity}</Badge>
                    <Badge className={PRI_COLORS[a.priority] || ''}>{a.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recs.length > 0 && (
        <Card className="border-2 border-amber-200">
          <CardContent className="py-4">
            <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Recomendações
            </h3>
            <div className="space-y-2">
              {recs.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  className="flex items-start justify-between gap-2 p-2 bg-amber-50/30 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                    {r.justification && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Justificativa:</strong> {r.justification}
                      </p>
                    )}
                    {r.expected_impact && (
                      <p className="text-xs text-muted-foreground">
                        <strong>Impacto esperado:</strong> {r.expected_impact}
                      </p>
                    )}
                  </div>
                  <Badge className={PRI_COLORS[r.priority] || ''}>{r.priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {preds.length > 0 && (
        <Card className="border-2 border-blue-200">
          <CardContent className="py-4">
            <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Previsões
            </h3>
            <div className="space-y-2">
              {preds.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-2 p-2 bg-blue-50/30 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                    {p.justification && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Justificativa:</strong> {p.justification}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      p.probability === 'high'
                        ? 'bg-red-100 text-red-700'
                        : p.probability === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                    }
                  >
                    {p.probability}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 && recs.length === 0 && preds.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold mb-1">Nenhum insight detectado</p>
            <p className="text-sm text-muted-foreground">
              Clique em "Detectar" para executar a análise de inteligência industrial
            </p>
          </CardContent>
        </Card>
      )}

      <IntelligenceDetailDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog({ ...dialog, open: v })}
        title={dialog.title}
        alerts={dialog.alerts}
        recommendations={dialog.recs}
        onResolved={load}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, TrendingUp, Zap, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { canTriggerCompute } from '@/lib/performance-permissions'
import {
  getScores,
  getAlerts,
  getAiAnalysis,
  triggerCompute,
  triggerAiAnalyze,
} from '@/services/performance'
import type {
  PerformanceScore,
  PerformanceAlert,
  PerformanceAiAnalysis,
} from '@/lib/performance-types'

export function PerformanceDashboard() {
  const { userRole } = useAuth()
  const [scores, setScores] = useState<PerformanceScore[]>([])
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [analyses, setAnalyses] = useState<PerformanceAiAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)

  const loadData = async () => {
    try {
      const [s, a, ai] = await Promise.all([getScores(), getAlerts(false), getAiAnalysis()])
      setScores(s)
      setAlerts(a)
      setAnalyses(ai)
    } catch {
      /* empty */
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCompute = async () => {
    setComputing(true)
    try {
      await triggerCompute()
      await triggerAiAnalyze()
      await loadData()
    } catch {
      /* empty */
    }
    setComputing(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const moduleScores: Record<string, number> = {}
  scores.forEach((s) => {
    const comps = s.components as Record<string, unknown>
    const mod = (comps?.module as string) || 'geral'
    if (!moduleScores[mod] || s.score > moduleScores[mod]) moduleScores[mod] = s.score
  })
  const overall =
    Object.values(moduleScores).length > 0
      ? Math.round(
          Object.values(moduleScores).reduce((a, b) => a + b, 0) /
            Object.values(moduleScores).length,
        )
      : 0

  const sevColor: Record<string, string> = {
    critical: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#005B2E]">Dashboard Corporativo</h2>
        {canTriggerCompute(userRole) && (
          <Button
            onClick={handleCompute}
            disabled={computing}
            size="sm"
            className="bg-[#005B2E] hover:bg-[#01361D]"
          >
            {computing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            Recalcular
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Índice Geral</p>
            <p className="text-3xl font-bold text-[#005B2E]">{overall}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Módulos Ativos</p>
            <p className="text-3xl font-bold text-[#C89B3C]">{Object.keys(moduleScores).length}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
            <p className="text-3xl font-bold text-red-500">{alerts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Análises IA</p>
            <p className="text-3xl font-bold text-blue-500">{analyses.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(moduleScores).map(([mod, score]) => (
          <Card key={mod} className="border border-border">
            <CardContent className="pt-3">
              <p className="text-xs font-medium text-muted-foreground capitalize">{mod}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500',
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{Math.round(score)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C89B3C]" /> Alertas Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum alerta ativo</p>
            )}
            {alerts.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-start gap-2 p-2 rounded border border-border">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    sevColor[a.severity] || 'bg-gray-400',
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{a.message}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.suggested_action}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C89B3C]" /> Análises de IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {analyses.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma análise disponível</p>
            )}
            {analyses.slice(0, 5).map((ai) => (
              <div key={ai.id} className="p-2 rounded border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      ai.risk_level === 'critico'
                        ? 'border-red-500 text-red-500'
                        : ai.risk_level === 'alto'
                          ? 'border-orange-500 text-orange-500'
                          : 'border-green-500 text-green-500',
                    )}
                  >
                    {ai.risk_level}
                  </Badge>
                </div>
                <p className="text-xs">{ai.conclusion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getGoals, getAwards, getApurations } from '@/services/variable-remuneration'
import { useAuth } from '@/hooks/use-auth'
import {
  parseNum,
  formatCurrency,
  getGoalStatusVisual,
  calcProjection,
} from '@/lib/variable-remuneration-types'
import { Loader2, Target, TrendingUp, Award, Download } from 'lucide-react'
import { toast } from 'sonner'

export function VrSellerView() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<any[]>([])
  const [awards, setAwards] = useState<any[]>([])
  const [apurations, setApurations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGoals(), getAwards(), getApurations()])
      .then(([g, a, ap]) => {
        setGoals(g)
        setAwards(a)
        setApurations(ap)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const myGoals = useMemo(
    () =>
      goals.filter(
        (g) =>
          g.rca === user?.name || g.vendedor_interno === user?.name || g.responsavel === user?.name,
      ),
    [goals, user],
  )
  const myApurations = useMemo(
    () => apurations.filter((a) => a.vendedor_name === user?.name),
    [apurations, user],
  )
  const myAwards = useMemo(
    () => awards.filter((a) => a.conquistado && parseNum(a.conquistado) > 0),
    [awards],
  )

  const totalCommission = myApurations.reduce((s, a) => s + parseNum(a.commission_value), 0)
  const totalAwards = myAwards.reduce((s, a) => s + parseNum(a.conquistado), 0)

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const handleDownloadPdf = () => {
    const content =
      `MINHAS METAS — ${user?.name}\n\n` +
      myGoals
        .map(
          (g) =>
            `${g.name}: Meta R$ ${formatCurrency(g.target_value)} | Realizado R$ ${formatCurrency(g.realized_value)}`,
        )
        .join('\n') +
      `\n\nTotal Comissão: R$ ${formatCurrency(totalCommission)}\nTotal Premiações: R$ ${formatCurrency(totalAwards)}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `minhas-metas-${user?.name}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Arquivo baixado')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Minhas Metas</h3>
        <Button
          onClick={handleDownloadPdf}
          variant="outline"
          className="border-[#005B2E] text-[#005B2E]"
        >
          <Download className="w-4 h-4 mr-2" /> Baixar PDF
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-2 border-[#005B2E]/30">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#005B2E]" />
              <div>
                <p className="text-xs text-muted-foreground">Minha Comissão</p>
                <p className="text-lg font-black">R$ {formatCurrency(totalCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C89B3C]" />
              <div>
                <p className="text-xs text-muted-foreground">Premiações</p>
                <p className="text-lg font-black">R$ {formatCurrency(totalAwards)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#22c55e]/30">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="text-xs text-muted-foreground">Metas Ativas</p>
                <p className="text-lg font-black">{myGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {myGoals.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma meta atribuída a você</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myGoals.map((g) => {
            const target = parseNum(g.target_value)
            const realized = parseNum(g.realized_value)
            const pct = target > 0 ? (realized / target) * 100 : 0
            const now = new Date()
            const end = new Date(g.end_date || now)
            const start = new Date(g.start_date || now)
            const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))
            const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
            const visual = getGoalStatusVisual(target, realized, daysRemaining, totalDays)
            return (
              <Card key={g.id} className="border-2 border-[#005B2E]/20">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{g.name}</span>
                    <span className={`text-sm ${visual.color}`}>
                      {visual.icon} {visual.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
                    <span>
                      Meta: <strong>R$ {formatCurrency(target)}</strong>
                    </span>
                    <span>
                      Realizado: <strong>R$ {formatCurrency(realized)}</strong>
                    </span>
                    <span>{pct.toFixed(1)}%</span>
                    <span>{daysRemaining} dias restantes</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#005B2E]' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  TrendingDown,
  Users,
  DollarSign,
  Megaphone,
  Target,
  Rocket,
  AlertTriangle,
} from 'lucide-react'
import { getExecutiveAnalytics } from '@/services/bi-analytics-extended'
import { getStrategicList } from '@/services/strategic'
import { useRealtime } from '@/hooks/use-realtime'
import { StrategicBiButton } from './strategic-bi-button'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function StrategicDashboard() {
  const [data, setData] = useState<Record<string, number> | null>(null)
  const [initiatives, setInitiatives] = useState<unknown[]>([])
  const [okrs, setOkrs] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [exec, inits, oks] = await Promise.all([
        getExecutiveAnalytics({}),
        getStrategicList('strategic_initiatives'),
        getStrategicList('strategic_okrs'),
      ])
      setData(exec as unknown as Record<string, number>)
      setInitiatives(inits)
      setOkrs(oks)
    } catch {
      setData(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())
  useRealtime('strategic_initiatives', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  const churn =
    data.clientesAtivos > 0
      ? ((data.clientesAtivos - data.novosClientes) / data.clientesAtivos) * 100
      : 0
  const cac = data.novosClientes > 0 ? 50000 / data.novosClientes : 0
  const ltv = data.ticketMedio * (data.margem / 100) * 12
  const campaignRoi = data.faturamento > 0 ? ((data.faturamento * 0.15 - 30000) / 30000) * 100 : 0
  const activeInitiatives = initiatives.filter(
    (i: Record<string, unknown>) => i.status === 'em_andamento',
  ).length
  const activeOkrs = okrs.filter((o: Record<string, unknown>) => o.status === 'ativo').length

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StrategicBiButton />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 border-red-200">
          <CardContent className="py-3 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-lg font-black">{fmt(churn)}%</p>
              <p className="text-xs text-muted-foreground">Churn</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200">
          <CardContent className="py-3 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-lg font-black">R$ {fmt(cac)}</p>
              <p className="text-xs text-muted-foreground">CAC</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-200">
          <CardContent className="py-3 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-lg font-black">R$ {fmt(ltv)}</p>
              <p className="text-xs text-muted-foreground">LTV</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200">
          <CardContent className="py-3 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-lg font-black">{fmt(campaignRoi)}%</p>
              <p className="text-xs text-muted-foreground">ROI Campanhas</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#005B2E]" />
            <div>
              <p className="text-lg font-black">{activeInitiatives}</p>
              <p className="text-xs text-muted-foreground">Iniciativas Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-[#005B2E]" />
            <div>
              <p className="text-lg font-black">{activeOkrs}</p>
              <p className="text-xs text-muted-foreground">OKRs Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#005B2E]" />
            <div>
              <p className="text-lg font-black">R$ {fmt(data.faturamento)}</p>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-lg font-black">{data.alertas}</p>
              <p className="text-xs text-muted-foreground">Alertas</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Resumo Estratégico</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">EBITDA</p>
              <p className="font-bold text-lg">R$ {fmt(data.ebitda)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Margem</p>
              <p className="font-bold text-lg text-[#005B2E]">{fmt(data.margem)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fluxo de Caixa</p>
              <p className="font-bold text-lg">R$ {fmt(data.fluxoCaixa)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Clientes Ativos</p>
              <p className="font-bold text-lg">{data.clientesAtivos}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Novos Clientes</p>
              <p className="font-bold text-lg text-emerald-600">{data.novosClientes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Inadimplência</p>
              <p className="font-bold text-lg text-amber-600">{fmt(data.inadimplencia)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

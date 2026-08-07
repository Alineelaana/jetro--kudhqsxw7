import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  AlertTriangle,
  Bell,
  Activity,
} from 'lucide-react'
import { getFinancialAnalytics } from '@/services/bi-analytics'
import { logBIAudit } from '@/services/bi'
import { useBIFilters } from './bi-filters'
import { BiStatCard } from './bi-stat-card'
import { useRealtime } from '@/hooks/use-realtime'
import type { FinancialAnalyticsData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BiFinancial() {
  const { filters } = useBIFilters()
  const [data, setData] = useState<FinancialAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setData(await getFinancialAnalytics(filters))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Analytics Financeiro')
  }, [])
  useRealtime('financial_receivables', () => load())
  useRealtime('financial_payables', () => load())
  useRealtime('financial_movements', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <BiStatCard
          icon={ArrowDownCircle}
          label="Total a Receber"
          value={`R$ ${fmt(data.totalReceivables)}`}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={ArrowUpCircle}
          label="Total a Pagar"
          value={`R$ ${fmt(data.totalPayables)}`}
          color="text-red-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="Fluxo de Caixa"
          value={`R$ ${fmt(data.cashFlow)}`}
          color={data.cashFlow >= 0 ? 'text-[#005B2E]' : 'text-red-600'}
        />
        <BiStatCard
          icon={Percent}
          label="Inadimplência"
          value={`${fmt(data.inadimplencia)}%`}
          color="text-red-600"
        />
        <BiStatCard
          icon={AlertTriangle}
          label="Recebíveis Vencidos"
          value={String(data.overdueReceivables)}
          color="text-amber-600"
        />
        <BiStatCard
          icon={AlertTriangle}
          label="Pagáveis Vencidos"
          value={String(data.overduePayables)}
          color="text-amber-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Resumo Financeiro</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">A Receber</span>
                <span className="font-medium text-emerald-600">
                  R$ {fmt(data.totalReceivables)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">A Pagar</span>
                <span className="font-medium text-red-600">R$ {fmt(data.totalPayables)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Saldo Projetado</span>
                <span
                  className={`font-bold ${data.cashFlow >= 0 ? 'text-[#005B2E]' : 'text-red-600'}`}
                >
                  R$ {fmt(data.cashFlow)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Taxa de Inadimplência</span>
                <span className="font-medium text-red-600">{fmt(data.inadimplencia)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Indicadores de Risco</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Recebíveis Vencidos</span>
                <span className="font-medium text-amber-600">
                  {data.overdueReceivables} título(s)
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Pagáveis Vencidos</span>
                <span className="font-medium text-amber-600">{data.overduePayables} título(s)</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Total de Movimentações</span>
                <span className="font-medium">{data.movements}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

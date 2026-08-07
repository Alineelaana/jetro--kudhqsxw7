import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Percent,
  AlertTriangle,
  Target,
  Activity,
} from 'lucide-react'
import { getExecutiveAnalytics } from '@/services/bi-analytics-extended'
import { getCrossModuleAnalytics } from '@/services/bi-analytics'
import { useRealtime } from '@/hooks/use-realtime'
import { BiStatCard } from '@/components/bi/bi-stat-card'
import type { ExecutiveAnalyticsData, CrossModuleAnalyticsData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const DECISION_QUESTIONS = [
  'Como está a empresa?',
  'O que mudou?',
  'Por que mudou?',
  'Onde está o problema?',
  'Qual o impacto financeiro?',
  'Qual a tendência?',
  'O que acontecerá se nada for feito?',
  'Quais ações possuem maior retorno?',
]

export function ControladoriaCockpit() {
  const [execData, setExecData] = useState<ExecutiveAnalyticsData | null>(null)
  const [crossData, setCrossData] = useState<CrossModuleAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [exec, cross] = await Promise.all([
        getExecutiveAnalytics({}).catch(() => null),
        getCrossModuleAnalytics({}).catch(() => null),
      ])
      setExecData(exec)
      setCrossData(cross)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())
  useRealtime('financial_receivables', () => load())
  useRealtime('contabil_lancamentos', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!execData)
    return (
      <p className="text-center py-6 text-muted-foreground">Dados insuficientes para o cockpit.</p>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20 bg-[#005B2E]/5">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            🎯 Centro Executivo de Decisão — O cockpit consome exclusivamente o BI Enterprise 360
          </p>
          <div className="flex flex-wrap gap-2">
            {DECISION_QUESTIONS.map((q, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#005B2E] text-white">
                {i + 1}. {q}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <BiStatCard
          icon={DollarSign}
          label="Faturamento"
          value={`R$ ${fmt(execData.faturamento)}`}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={TrendingUp}
          label="Receita Líquida"
          value={`R$ ${fmt(execData.receitaLiquida)}`}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="Lucro Bruto"
          value={`R$ ${fmt(execData.lucroBruto)}`}
          color="text-blue-600"
        />
        <BiStatCard
          icon={Activity}
          label="EBITDA"
          value={`R$ ${fmt(execData.ebitda)}`}
          color="text-purple-600"
        />
        <BiStatCard
          icon={Percent}
          label="Margem"
          value={`${fmt(execData.margem)}%`}
          color="text-cyan-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="Fluxo de Caixa"
          value={`R$ ${fmt(execData.fluxoCaixa)}`}
          color={execData.fluxoCaixa >= 0 ? 'text-[#005B2E]' : 'text-red-600'}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BiStatCard
          icon={DollarSign}
          label="A Receber"
          value={`R$ ${fmt(execData.contasReceber)}`}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="A Pagar"
          value={`R$ ${fmt(execData.contasPagar)}`}
          color="text-red-600"
        />
        <BiStatCard
          icon={Percent}
          label="Inadimplência"
          value={`${fmt(execData.inadimplencia)}%`}
          color="text-amber-600"
        />
        <BiStatCard
          icon={AlertTriangle}
          label="Alertas"
          value={String(execData.alertas)}
          color="text-red-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2 text-sm">📈 Indicadores Operacionais</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Pedidos</span>
                <span className="font-medium">{execData.pedidos}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Produção</span>
                <span className="font-medium">{execData.producao}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Expedição</span>
                <span className="font-medium">{execData.expedicao}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Estoque</span>
                <span className="font-medium">{execData.estoque}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2 text-sm">🎯 Projeções & Tendências</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Projeção Mensal</span>
                <span className="font-bold text-[#005B2E]">R$ {fmt(execData.projecao)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Crescimento</span>
                <span className={execData.crescimento >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {fmt(execData.crescimento)}%
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span>R$ {fmt(execData.ticketMedio)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Novos Clientes</span>
                <span>{execData.novosClientes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2 text-sm">⚠️ Alertas de Materialidade</h3>
            {crossData ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between border-b border-border py-1">
                  <span className="text-muted-foreground">Estoque Baixo</span>
                  <span className="text-amber-600">{crossData.stock.lowStock}</span>
                </div>
                <div className="flex justify-between border-b border-border py-1">
                  <span className="text-muted-foreground">Sem Estoque</span>
                  <span className="text-red-600">{crossData.stock.outOfStock}</span>
                </div>
                <div className="flex justify-between border-b border-border py-1">
                  <span className="text-muted-foreground">Inadimplência</span>
                  <span className="text-red-600">{fmt(crossData.financial.inadimplencia)}%</span>
                </div>
                <div className="flex justify-between border-b border-border py-1">
                  <span className="text-muted-foreground">Produção Atrasada</span>
                  <span className="text-amber-600">{crossData.industrial.late}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

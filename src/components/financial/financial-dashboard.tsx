import { useState, useEffect } from 'react'
import { FinancialStatCard, FinancialLoading } from '@/components/financial/financial-shared'
import {
  getReceivables,
  getPayables,
  getMovements,
  getApprovals,
  getReconciliation,
} from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  Banknote,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  FileClock,
  Scale,
} from 'lucide-react'

interface KpiData {
  totalBalance: string
  receivablesToday: number
  payablesToday: number
  overdueReceivables: number
  overduePayables: number
  monthReceipts: string
  monthPayments: string
  defaultRate: string
  forecastIn: string
  forecastOut: string
  result: string
  cashNeed: string
  pendingApprovals: number
  inReconciliation: number
}

export function FinancialDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [recv, pay, mov, appr, recon] = await Promise.all([
        getReceivables().catch(() => []),
        getPayables().catch(() => []),
        getMovements().catch(() => []),
        getApprovals().catch(() => []),
        getReconciliation().catch(() => []),
      ])
      const today = new Date().toISOString().split('T')[0]
      const recvToday = recv.filter(
        (r: any) => r.data_vencimento === today && !['Recebido', 'Cancelado'].includes(r.status),
      ).length
      const payToday = pay.filter(
        (r: any) => r.data_vencimento === today && !['Pago', 'Cancelado'].includes(r.status),
      ).length
      const overRecv = recv.filter(
        (r: any) =>
          r.data_vencimento < today && ['Em Aberto', 'Parcialmente Recebido'].includes(r.status),
      ).length
      const overPay = pay.filter(
        (r: any) => r.data_vencimento < today && !['Pago', 'Cancelado'].includes(r.status),
      ).length
      const monthRecv = mov
        .filter((m: any) => m.tipo_movimentacao === 'Recebimento')
        .reduce((s: number, m: any) => s + parseFloat(m.entrada || '0'), 0)
      const monthPay = mov
        .filter((m: any) => m.tipo_movimentacao === 'Pagamento')
        .reduce((s: number, m: any) => s + parseFloat(m.saida || '0'), 0)
      const pending = appr.filter((a: any) => a.status === 'Pendente').length
      const inRecon = recon.filter(
        (r: any) =>
          !['Conciliado Automaticamente', 'Conciliado Manualmente', 'Ignorado'].includes(r.status),
      ).length
      const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      setKpi({
        totalBalance: fmt(monthRecv - monthPay),
        receivablesToday: recvToday,
        payablesToday: payToday,
        overdueReceivables: overRecv,
        overduePayables: overPay,
        monthReceipts: fmt(monthRecv),
        monthPayments: fmt(monthPay),
        defaultRate: recv.length > 0 ? `${Math.round((overRecv / recv.length) * 100)}%` : '0%',
        forecastIn: fmt(0),
        forecastOut: fmt(0),
        result: fmt(monthRecv - monthPay),
        cashNeed: fmt(0),
        pendingApprovals: pending,
        inReconciliation: inRecon,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('financial_receivables', () => load())
  useRealtime('financial_payables', () => load())
  useRealtime('financial_movements', () => load())

  if (loading || !kpi) return <FinancialLoading />

  const cards = [
    { label: 'Saldo Disponível', value: kpi.totalBalance, icon: Wallet, color: 'text-[#005B2E]' },
    {
      label: 'Receber Hoje',
      value: kpi.receivablesToday,
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
    { label: 'Pagar Hoje', value: kpi.payablesToday, icon: TrendingDown, color: 'text-red-600' },
    {
      label: 'Receber Vencido',
      value: kpi.overdueReceivables,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    { label: 'Pagar Vencido', value: kpi.overduePayables, icon: Clock, color: 'text-red-700' },
    {
      label: 'Recebimentos do Mês',
      value: kpi.monthReceipts,
      icon: CheckCircle,
      color: 'text-emerald-700',
    },
    {
      label: 'Pagamentos do Mês',
      value: kpi.monthPayments,
      icon: DollarSign,
      color: 'text-amber-600',
    },
    { label: 'Inadimplência', value: kpi.defaultRate, icon: AlertCircle, color: 'text-red-600' },
    {
      label: 'Previsão de Entradas',
      value: kpi.forecastIn,
      icon: ArrowUpCircle,
      color: 'text-blue-600',
    },
    {
      label: 'Previsão de Saídas',
      value: kpi.forecastOut,
      icon: ArrowDownCircle,
      color: 'text-orange-600',
    },
    { label: 'Resultado Financeiro', value: kpi.result, icon: Scale, color: 'text-[#005B2E]' },
    {
      label: 'Necessidade de Caixa',
      value: kpi.cashNeed,
      icon: PiggyBank,
      color: 'text-purple-600',
    },
    {
      label: 'Aguardando Aprovação',
      value: kpi.pendingApprovals,
      icon: FileClock,
      color: 'text-amber-700',
    },
    {
      label: 'Em Conciliação',
      value: kpi.inReconciliation,
      icon: Banknote,
      color: 'text-cyan-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <FinancialStatCard
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          color={c.color}
        />
      ))}
    </div>
  )
}

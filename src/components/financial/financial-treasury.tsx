import { useState, useEffect } from 'react'
import { FinancialStatCard, FinancialLoading } from '@/components/financial/financial-shared'
import { getReceivables, getPayables, getTransfers, getCashRegisters } from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Banknote,
  Wallet,
  PiggyBank,
  Lock,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Calendar,
} from 'lucide-react'

export function FinancialTreasury() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [recv, pay, trans, cash] = await Promise.all([
        getReceivables().catch(() => []),
        getPayables().catch(() => []),
        getTransfers().catch(() => []),
        getCashRegisters().catch(() => []),
      ])
      const today = new Date().toISOString().split('T')[0]
      const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const totalRecv = recv
        .filter((r: any) => r.status === 'Recebido')
        .reduce(
          (s: number, r: any) => s + parseFloat(r.valor_recebido || r.valor_original || '0'),
          0,
        )
      const totalPay = pay
        .filter((r: any) => r.status === 'Pago')
        .reduce((s: number, r: any) => s + parseFloat(r.valor_pago || r.valor_original || '0'), 0)
      const scheduledPay = pay
        .filter((r: any) => r.data_vencimento >= today && !['Pago', 'Cancelado'].includes(r.status))
        .reduce((s: number, r: any) => s + parseFloat(r.valor_original || '0'), 0)
      const forecastRecv = recv
        .filter(
          (r: any) => r.data_vencimento >= today && !['Recebido', 'Cancelado'].includes(r.status),
        )
        .reduce((s: number, r: any) => s + parseFloat(r.valor_original || '0'), 0)
      const cashBalance = cash
        .filter((c: any) => c.status === 'Aberto')
        .reduce((s: number, c: any) => s + parseFloat(c.saldo_inicial || '0'), 0)
      setData({
        bankBalance: fmt(totalRecv - totalPay),
        cashBalance: fmt(cashBalance),
        totalBalance: fmt(totalRecv - totalPay + cashBalance),
        scheduledPay: fmt(scheduledPay),
        forecastRecv: fmt(forecastRecv),
        transfers: trans.length,
        available: fmt(totalRecv - totalPay),
        blocked: fmt(0),
      })
    } catch {
      setData(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('financial_receivables', () => load())
  useRealtime('financial_payables', () => load())

  if (loading || !data) return <FinancialLoading />

  const cards = [
    { label: 'Saldo Bancário', value: data.bankBalance, icon: Banknote, color: 'text-[#005B2E]' },
    { label: 'Saldo dos Caixas', value: data.cashBalance, icon: Wallet, color: 'text-blue-600' },
    {
      label: 'Saldo Total Disponível',
      value: data.totalBalance,
      icon: PiggyBank,
      color: 'text-emerald-600',
    },
    {
      label: 'Valores Disponíveis',
      value: data.available,
      icon: TrendingUp,
      color: 'text-emerald-700',
    },
    { label: 'Valores Bloqueados', value: data.blocked, icon: Lock, color: 'text-orange-600' },
    {
      label: 'Pagamentos Agendados',
      value: data.scheduledPay,
      icon: TrendingDown,
      color: 'text-red-600',
    },
    {
      label: 'Recebimentos Previstos',
      value: data.forecastRecv,
      icon: Calendar,
      color: 'text-cyan-600',
    },
    {
      label: 'Transferências',
      value: data.transfers,
      icon: ArrowLeftRight,
      color: 'text-purple-600',
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

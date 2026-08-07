import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SA_COLLECTIONS, saGetList } from '@/services/supplier-allowance'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight, FileText, Loader2 } from 'lucide-react'

export function SaCockpit() {
  const [agreements, setAgreements] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [accruals, setAccruals] = useState<any[]>([])
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      saGetList(SA_COLLECTIONS.agreements),
      saGetList(SA_COLLECTIONS.accounts),
      saGetList(SA_COLLECTIONS.movements),
      saGetList(SA_COLLECTIONS.accruals),
      saGetList(SA_COLLECTIONS.settlements),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') setAgreements(results[0].value as any[])
      if (results[1].status === 'fulfilled') setAccounts(results[1].value as any[])
      if (results[2].status === 'fulfilled') setMovements(results[2].value as any[])
      if (results[3].status === 'fulfilled') setAccruals(results[3].value as any[])
      if (results[4].status === 'fulfilled') setSettlements(results[4].value as any[])
      setLoading(false)
    })
  }, [])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const activeAgreements = agreements.filter((a) => a.status === 'ativo').length
  const totalAccrued = accounts.reduce((s, a) => s + parseFloat(a.accrued_total || '0'), 0)
  const totalConsumed = accounts.reduce((s, a) => s + parseFloat(a.consumed_total || '0'), 0)
  const totalSettled = settlements
    .filter((s) => s.status === 'liquidado')
    .reduce((s, a) => s + parseFloat(a.settled_value || '0'), 0)
  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.current_balance || '0'), 0)
  const pendingAccruals = accruals.filter((a) => a.status === 'pendente').length
  const pendingSettlements = settlements.filter((s) => s.status === 'pendente').length

  const kpis = [
    {
      label: 'Acordos Ativos',
      value: String(activeAgreements),
      icon: FileText,
      color: 'text-[#005B2E]',
    },
    {
      label: 'Saldo Total',
      value: `R$ ${formatBRL(totalBalance)}`,
      icon: Wallet,
      color: 'text-[#005B2E]',
    },
    {
      label: 'Total Apurado',
      value: `R$ ${formatBRL(totalAccrued)}`,
      icon: ArrowDownLeft,
      color: 'text-emerald-600',
    },
    {
      label: 'Total Consumido',
      value: `R$ ${formatBRL(totalConsumed)}`,
      icon: ArrowUpRight,
      color: 'text-red-600',
    },
    {
      label: 'Total Liquidado',
      value: `R$ ${formatBRL(totalSettled)}`,
      icon: TrendingUp,
      color: 'text-[#C89B3C]',
    },
    {
      label: 'Apurações Pendentes',
      value: String(pendingAccruals),
      icon: FileText,
      color: 'text-amber-600',
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Cockpit Executivo de Verbas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <kpi.icon className={`w-5 h-5 mb-1 ${kpi.color}`} />
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-black text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h4 className="text-sm font-bold text-[#005B2E] mb-3">Últimas Movimentações</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {movements.slice(0, 10).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between text-sm border-b border-border pb-1"
                >
                  <span className="capitalize">{m.movement_type}</span>
                  <span
                    className={
                      m.direction === 'credito'
                        ? 'text-emerald-600 font-bold'
                        : 'text-red-600 font-bold'
                    }
                  >
                    {m.direction === 'credito' ? '+' : '-'} R$ {formatBRL(m.value)}
                  </span>
                </div>
              ))}
              {movements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sem movimentações</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h4 className="text-sm font-bold text-[#005B2E] mb-3">Alertas & Pendências</h4>
            <div className="space-y-2">
              {pendingAccruals > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" /> {pendingAccruals}{' '}
                  apuração(ões) aguardando aprovação
                </div>
              )}
              {pendingSettlements > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" /> {pendingSettlements}{' '}
                  liquidação(ões) aguardando aprovação
                </div>
              )}
              {accounts
                .filter((a) => parseFloat(a.current_balance || '0') < 100)
                .map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full" /> Conta{' '}
                    {a.id.substring(0, 8)} com saldo baixo: R$ {formatBRL(a.current_balance)}
                  </div>
                ))}
              {pendingAccruals === 0 &&
                pendingSettlements === 0 &&
                accounts.filter((a) => parseFloat(a.current_balance || '0') < 100).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sem alertas no momento
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { FinancialTable, FinancialLoading } from '@/components/financial/financial-shared'
import { getReceivables, getPayables, getMovements } from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'

export function FinancialCashFlow() {
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('daily')
  const [scenario, setScenario] = useState('realista')
  const [rows, setRows] = useState<any[]>([])

  const load = async () => {
    try {
      const [recv, pay, mov] = await Promise.all([
        getReceivables().catch(() => []),
        getPayables().catch(() => []),
        getMovements().catch(() => []),
      ])
      const today = new Date()
      const days =
        viewMode === 'daily' ? 30 : viewMode === 'weekly' ? 12 : viewMode === 'monthly' ? 12 : 365
      const interval =
        viewMode === 'daily' ? 1 : viewMode === 'weekly' ? 7 : viewMode === 'monthly' ? 30 : 1
      const newRows: any[] = []
      let saldo = (mov as any[]).reduce(
        (s: number, m: any) => s + (parseFloat(m.entrada || '0') - parseFloat(m.saida || '0')),
        0,
      )
      const initialBalance = saldo
      for (let i = 0; i < days; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i * interval)
        const dateStr = d.toISOString().split('T')[0]
        const entradas = recv
          .filter(
            (r: any) =>
              r.data_vencimento === dateStr && !['Recebido', 'Cancelado'].includes(r.status),
          )
          .reduce((s: number, r: any) => s + parseFloat(r.valor_original || '0'), 0)
        const saidas = pay
          .filter(
            (r: any) => r.data_vencimento === dateStr && !['Pago', 'Cancelado'].includes(r.status),
          )
          .reduce((s: number, r: any) => s + parseFloat(r.valor_original || '0'), 0)
        const mult = scenario === 'otimista' ? 1.2 : scenario === 'conservador' ? 0.8 : 1
        saldo += entradas * mult - saidas * mult
        newRows.push({ data: dateStr, entradas: entradas * mult, saidas: saidas * mult, saldo })
        if (viewMode !== 'daily') break
      }
      setRows([
        { data: 'Saldo Inicial', entradas: 0, saidas: 0, saldo: initialBalance },
        ...newRows,
      ])
    } catch {
      setRows([])
    }
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [viewMode, scenario])
  useRealtime('financial_receivables', () => load())
  useRealtime('financial_payables', () => load())

  if (loading) return <FinancialLoading />

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Visualização</Label>
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40 focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diária</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cenário</Label>
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className="w-40 focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservador">Conservador</SelectItem>
              <SelectItem value="realista">Realista</SelectItem>
              <SelectItem value="otimista">Otimista</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#005B2E]" />
            <div>
              <p className="text-xs text-muted-foreground">Saldo Inicial</p>
              <p className="text-lg font-black">{fmt(rows[0]?.saldo || 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-600/20">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Total Entradas Previstas</p>
              <p className="text-lg font-black">
                {fmt(rows.slice(1).reduce((s, r) => s + r.entradas, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-600/20">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-xs text-muted-foreground">Total Saídas Previstas</p>
              <p className="text-lg font-black">
                {fmt(rows.slice(1).reduce((s, r) => s + r.saidas, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <FinancialTable
        headers={['Data', 'Entradas Previstas', 'Saídas Previstas', 'Saldo Projetado']}
      >
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
            <td className="px-3 py-3 font-medium">{r.data}</td>
            <td className="px-3 py-3 text-emerald-600 font-bold">
              {r.entradas > 0 ? fmt(r.entradas) : '—'}
            </td>
            <td className="px-3 py-3 text-red-600 font-bold">
              {r.saidas > 0 ? fmt(r.saidas) : '—'}
            </td>
            <td className="px-3 py-3 font-bold">{fmt(r.saldo)}</td>
          </tr>
        ))}
      </FinancialTable>
    </div>
  )
}

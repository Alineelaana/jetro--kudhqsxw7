import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { queryLedger, type LedgerQueryResult } from '@/services/verbas-audit'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const VIEWS = [
  { value: 'fornecedor', label: 'Por Fornecedor' },
  { value: 'comprador', label: 'Por Comprador' },
  { value: 'trade', label: 'Trade × Fornecedor' },
  { value: 'marketing', label: 'Marketing × Fornecedor' },
  { value: 'programa', label: 'Por Programa' },
]

export function SaCurrentAccounts() {
  const [view, setView] = useState('fornecedor')
  const [data, setData] = useState<LedgerQueryResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const filters: Record<string, string> = {}
      if (view === 'trade') filters.category = 'trade'
      if (view === 'marketing') filters.category = 'marketing'
      setData(await queryLedger(filters))
    } catch (err) {
      setData(null)
      toast.error(getErrorMessage(err))
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [view])

  const grouped = useMemo(() => {
    if (!data) return []
    const map: Record<string, { key: string; earned: number; consumed: number; count: number }> = {}
    for (const m of data.analytical) {
      let key = '—'
      if (view === 'fornecedor') key = m.supplier_name || '—'
      else if (view === 'comprador') key = m.buyer_name || '—'
      else if (view === 'programa') key = m.program || '—'
      else key = m.supplier_name || '—'
      if (!map[key]) map[key] = { key, earned: 0, consumed: 0, count: 0 }
      const v = parseFloat(m.value || '0')
      if (m.direction === 'credito') map[key].earned += v
      else map[key].consumed += v
      map[key].count++
    }
    return Object.values(map).filter(
      (g) => !search || g.key.toLowerCase().includes(search.toLowerCase()),
    )
  }, [data, view, search])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-[#005B2E]">Contas Correntes — Corporate Ledger</h3>
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIEWS.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-10 h-8 text-xs focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="border-l-4 border-emerald-500 p-2">
          <p className="text-[10px] text-muted-foreground">Total Creditos</p>
          <p className="text-sm font-bold text-emerald-600">
            R$ {formatBRL(grouped.reduce((s, g) => s + g.earned, 0))}
          </p>
        </Card>
        <Card className="border-l-4 border-red-500 p-2">
          <p className="text-[10px] text-muted-foreground">Total Debitos</p>
          <p className="text-sm font-bold text-red-600">
            R$ {formatBRL(grouped.reduce((s, g) => s + g.consumed, 0))}
          </p>
        </Card>
        <Card className="border-l-4 border-[#005B2E] p-2">
          <p className="text-[10px] text-muted-foreground">Saldo Liquido</p>
          <p className="text-sm font-bold text-[#005B2E]">
            R$ {formatBRL(grouped.reduce((s, g) => s + g.earned - g.consumed, 0))}
          </p>
        </Card>
        <Card className="border-l-4 border-blue-500 p-2">
          <p className="text-[10px] text-muted-foreground">Movimentacoes</p>
          <p className="text-sm font-bold text-blue-600">{data?.total_movements || 0}</p>
        </Card>
      </div>
      <Card className="border-2 border-[#005B2E]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#01361D] text-white">
              <th className="text-left px-3 py-2 font-bold">
                {VIEWS.find((v) => v.value === view)?.label || 'Grupo'}
              </th>
              <th className="text-right px-3 py-2 font-bold">Creditos</th>
              <th className="text-right px-3 py-2 font-bold">Debitos</th>
              <th className="text-right px-3 py-2 font-bold">Saldo</th>
              <th className="text-center px-3 py-2 font-bold">Movs</th>
            </tr>
          </thead>
          <tbody>
            {grouped.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum dado encontrado
                </td>
              </tr>
            ) : (
              grouped.map((g, i) => (
                <tr key={i} className="border-b hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-medium">{g.key}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">
                    R$ {formatBRL(g.earned)}
                  </td>
                  <td className="px-3 py-2 text-right text-red-600">R$ {formatBRL(g.consumed)}</td>
                  <td className="px-3 py-2 text-right font-bold text-[#005B2E]">
                    R$ {formatBRL(g.earned - g.consumed)}
                  </td>
                  <td className="px-3 py-2 text-center">{g.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

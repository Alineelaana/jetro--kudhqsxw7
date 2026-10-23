import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getStockMovements } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { MOVEMENT_TYPES, type StockMovement } from '@/lib/stock-types'
import { Loader2, Search } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  'Entrada por Compra': 'bg-emerald-100 text-emerald-700',
  'Entrada Manual': 'bg-emerald-100 text-emerald-700',
  'Entrada por Devolução': 'bg-emerald-100 text-emerald-700',
  'Saída por Venda': 'bg-red-100 text-red-700',
  'Saída Manual': 'bg-red-100 text-red-700',
  Reserva: 'bg-amber-100 text-amber-700',
  'Liberação de Reserva': 'bg-blue-100 text-blue-700',
  'Ajuste Positivo': 'bg-emerald-100 text-emerald-700',
  'Ajuste Negativo': 'bg-red-100 text-red-700',
  Transferência: 'bg-purple-100 text-purple-700',
  Perda: 'bg-red-100 text-red-700',
  Avaria: 'bg-orange-100 text-orange-700',
  Vencimento: 'bg-red-100 text-red-700',
}

export function StockMovements({
  initialFilter,
}: { initialFilter?: 'Entrada' | 'Saída' | string } = {}) {
  const [records, setRecords] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const load = async () => {
    try {
      setRecords(await getStockMovements())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_movements', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      (r.produto_nome || '').toLowerCase().includes(term) ||
      (r.produto_codigo || '').toLowerCase().includes(term) ||
      (r.documento_origem || '').toLowerCase().includes(term) ||
      (r.lote || '').toLowerCase().includes(term)
    const matchType = typeFilter === 'all' || r.tipo_movimentacao === typeFilter
    const matchInitial =
      !initialFilter ||
      (r.tipo_movimentacao || '').toLowerCase().includes(initialFilter.toLowerCase())
    return matchSearch && matchType && matchInitial
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por produto, documento ou lote..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-56 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Tipo de Movimentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {MOVEMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} registro(s)</p>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Data/Hora</th>
                <th className="text-left px-3 py-2 font-bold">Tipo</th>
                <th className="text-left px-3 py-2 font-bold">Documento</th>
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-left px-3 py-2 font-bold">Lote</th>
                <th className="text-right px-3 py-2 font-bold">Qtd.</th>
                <th className="text-right px-3 py-2 font-bold hidden md:table-cell">Saldo Ant.</th>
                <th className="text-right px-3 py-2 font-bold">Saldo Atual</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 text-xs">
                    {new Date(r.created).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${TYPE_COLORS[r.tipo_movimentacao] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {r.tipo_movimentacao}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{r.documento_origem || '—'}</td>
                  <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.lote || '—'}</td>
                  <td className="px-3 py-2 text-right font-bold">{r.quantidade}</td>
                  <td className="px-3 py-2 text-right hidden md:table-cell">{r.saldo_anterior}</td>
                  <td className="px-3 py-2 text-right font-bold">{r.saldo_atual}</td>
                  <td className="px-3 py-2 text-xs hidden lg:table-cell">{r.responsavel || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

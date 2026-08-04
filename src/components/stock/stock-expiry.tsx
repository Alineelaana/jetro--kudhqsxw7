import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStockBatches, updateStockBatch } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { daysUntilExpiry, getExpiryRange, EXPIRY_RANGES, type StockBatch } from '@/lib/stock-types'
import { Loader2, Search, AlertTriangle } from 'lucide-react'

export function StockExpiry() {
  const [records, setRecords] = useState<StockBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rangeFilter, setRangeFilter] = useState('all')

  const load = async () => {
    try {
      setRecords(await getStockBatches())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_batches', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      (r.numero_lote || '').toLowerCase().includes(term) ||
      (r.produto_nome || '').toLowerCase().includes(term)
    if (!matchSearch) return false
    if (rangeFilter === 'all') return true
    const days = daysUntilExpiry(r.data_validade)
    const range = getExpiryRange(days)
    return range.key === rangeFilter
  })

  const handleBlock = async (r: StockBatch) => {
    try {
      await updateStockBatch(r.id, { situacao: 'Bloqueado' })
      toast({ title: 'Lote bloqueado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {EXPIRY_RANGES.map((r) => {
          const count = records.filter((b) => {
            const days = daysUntilExpiry(b.data_validade)
            return days >= r.minDays && days <= r.maxDays
          }).length
          return (
            <Card key={r.key} className="border-2" style={{ borderColor: `${r.color}33` }}>
              <CardContent className="py-2 px-3">
                <p className="text-lg font-black" style={{ color: r.color }}>
                  {count}
                </p>
                <p className="text-[10px] text-muted-foreground">{r.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por lote ou produto..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={rangeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setRangeFilter('all')}
              className={rangeFilter === 'all' ? 'bg-[#005B2E]' : 'border-[#005B2E] text-[#005B2E]'}
            >
              Todos
            </Button>
            {EXPIRY_RANGES.map((r) => (
              <Button
                key={r.key}
                size="sm"
                variant={rangeFilter === r.key ? 'default' : 'outline'}
                onClick={() => setRangeFilter(r.key)}
                style={
                  rangeFilter === r.key
                    ? { backgroundColor: r.color, borderColor: r.color }
                    : { borderColor: r.color, color: r.color }
                }
              >
                {r.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-left px-3 py-2 font-bold">Lote</th>
                <th className="text-left px-3 py-2 font-bold">Validade</th>
                <th className="text-right px-3 py-2 font-bold">Dias</th>
                <th className="text-right px-3 py-2 font-bold">Qtd.</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const days = daysUntilExpiry(r.data_validade)
                const range = getExpiryRange(days)
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                    <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                      {r.numero_lote}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.data_validade
                        ? new Date(r.data_validade).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-bold" style={{ color: range.color }}>
                      {days < 0 ? 'Vencido' : `${days}d`}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">{r.quantidade_disponivel}</td>
                    <td className="px-3 py-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${range.color}1A`, color: range.color }}
                      >
                        {range.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        {days < 0 && r.situacao !== 'Bloqueado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBlock(r)}
                            className="text-red-600 h-8 w-8 p-0"
                            title="Bloquear lote vencido"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

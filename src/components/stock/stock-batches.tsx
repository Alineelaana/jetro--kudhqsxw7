import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStockBatches, updateStockBatch } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { daysUntilExpiry, type StockBatch } from '@/lib/stock-types'
import { Loader2, Search, Lock, Unlock } from 'lucide-react'

const SITUATION_COLORS: Record<string, string> = {
  Disponível: 'bg-emerald-100 text-emerald-700',
  Reservado: 'bg-amber-100 text-amber-700',
  Bloqueado: 'bg-red-100 text-red-700',
  'Em Análise': 'bg-blue-100 text-blue-700',
  Vencido: 'bg-red-100 text-red-700',
  Esgotado: 'bg-gray-100 text-gray-600',
}

export function StockBatches() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    return (
      !term ||
      (r.numero_lote || '').toLowerCase().includes(term) ||
      (r.produto_nome || '').toLowerCase().includes(term)
    )
  })

  const toggleBlock = async (r: StockBatch) => {
    const newSit = r.situacao === 'Bloqueado' ? 'Disponível' : 'Bloqueado'
    try {
      await updateStockBatch(r.id, { situacao: newSit })
      toast({ title: newSit === 'Bloqueado' ? 'Lote bloqueado' : 'Lote liberado' })
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
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por lote ou produto..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
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
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Validade</th>
                <th className="text-right px-3 py-2 font-bold">Disp.</th>
                <th className="text-right px-3 py-2 font-bold">Reserv.</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const days = daysUntilExpiry(r.data_validade)
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                    <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                      {r.numero_lote}
                    </td>
                    <td className="px-3 py-2 text-xs hidden md:table-cell">
                      {r.data_validade
                        ? new Date(r.data_validade).toLocaleDateString('pt-BR')
                        : '—'}
                      {days < 0 && <span className="ml-1 text-red-600 font-bold">(Vencido)</span>}
                      {days >= 0 && days <= 30 && (
                        <span className="ml-1 text-amber-600 font-bold">({days}d)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">{r.quantidade_disponivel}</td>
                    <td className="px-3 py-2 text-right">{r.quantidade_reservada}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${SITUATION_COLORS[r.situacao] || 'bg-gray-100'}`}
                      >
                        {r.situacao}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBlock(r)}
                          className={
                            r.situacao === 'Bloqueado'
                              ? 'text-emerald-600 h-8 w-8 p-0'
                              : 'text-red-600 h-8 w-8 p-0'
                          }
                          title={r.situacao === 'Bloqueado' ? 'Liberar' : 'Bloquear'}
                        >
                          {r.situacao === 'Bloqueado' ? (
                            <Unlock className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </Button>
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

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

export function StockBatches({
  filterBloqueados = false,
  showTraceabilityView = false,
}: {
  filterBloqueados?: boolean
  showTraceabilityView?: boolean
} = {}) {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null)

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
    const matchBloq = !filterBloqueados || r.situacao === 'Bloqueado' || r.situacao === 'Em Análise'
    return matchSearch && matchBloq
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
                      <div className="flex justify-center gap-1">
                        {showTraceabilityView ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBatch(r)}
                            className="text-xs h-7 text-[#005B2E] border-[#005B2E]/30"
                          >
                            Rastrear
                          </Button>
                        ) : (
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

      {showTraceabilityView && selectedBatch && (
        <Card className="border-2 border-[#005B2E]/30 bg-emerald-50/10 p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm text-[#005B2E]">
              Rastreabilidade do Lote: {selectedBatch.numero_lote} ({selectedBatch.produto_nome})
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedBatch(null)}
              className="text-xs text-muted-foreground"
            >
              Fechar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white border rounded-lg">
              <span className="font-bold text-gray-700 block mb-1">1. Origem / Entrada</span>
              <p>Fornecedor / Fabricação: Lote Original</p>
              <p>
                Fabricação:{' '}
                {selectedBatch.data_fabricacao
                  ? new Date(selectedBatch.data_fabricacao).toLocaleDateString('pt-BR')
                  : '—'}
              </p>
              <p>
                Validade:{' '}
                {selectedBatch.data_validade
                  ? new Date(selectedBatch.data_validade).toLocaleDateString('pt-BR')
                  : '—'}
              </p>
            </div>
            <div className="p-3 bg-white border rounded-lg">
              <span className="font-bold text-gray-700 block mb-1">2. Armazenagem & Qualidade</span>
              <p>
                Status: <span className="font-bold">{selectedBatch.situacao}</span>
              </p>
              <p>Saldo Físico: {selectedBatch.quantidade_disponivel} un</p>
              <p>Reservas Ativas: {selectedBatch.quantidade_reservada} un</p>
            </div>
            <div className="p-3 bg-white border rounded-lg">
              <span className="font-bold text-gray-700 block mb-1">3. Destino / Expedição</span>
              <p>Localização WMS: Setor A / Doca 2</p>
              <p>Rastreio: Conectado com Ordens de Separação e Romaneios</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

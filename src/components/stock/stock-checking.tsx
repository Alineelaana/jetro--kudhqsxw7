import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStockCheckings, createStockChecking, updateStockChecking } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { CHECKING_TYPES, CHECKING_STATUS, type StockChecking } from '@/lib/stock-types'
import { Loader2, Search, Plus } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Conferência': 'bg-amber-100 text-amber-700',
  'Em Conferência': 'bg-blue-100 text-blue-700',
  Conferida: 'bg-emerald-100 text-emerald-700',
  'Com Divergência': 'bg-red-100 text-red-700',
  Reprovada: 'bg-red-100 text-red-700',
  Cancelada: 'bg-gray-100 text-gray-600',
}

export function StockChecking() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockChecking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getStockCheckings())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_checkings', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    return (
      !term ||
      (r.documento || '').toLowerCase().includes(term) ||
      (r.produto_nome || '').toLowerCase().includes(term)
    )
  })

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStockChecking(id, { status })
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleNew = async () => {
    try {
      await createStockChecking({
        documento: `CONF-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        tipo_conferencia: 'Conferência de Entrada',
        produto_nome: '',
        codigo_barras: '',
        lote: '',
        validade: '',
        quantidade_esperada: 0,
        quantidade_conferida: 0,
        diferenca: 0,
        situacao: 'Aguardando',
        motivo_divergencia: '',
        responsavel: userName,
        observacao: '',
        status: 'Aguardando Conferência',
      })
      toast({ title: 'Conferência criada' })
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
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conferência..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Conferência
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Documento</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-right px-3 py-2 font-bold">Esperada</th>
                <th className="text-right px-3 py-2 font-bold">Conferida</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">{r.documento}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.tipo_conferencia}</td>
                  <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                  <td className="px-3 py-2 text-right">{r.quantidade_esperada}</td>
                  <td className="px-3 py-2 text-right font-bold">{r.quantidade_conferida}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {r.status === 'Aguardando Conferência' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Conferência')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {r.status === 'Em Conferência' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Conferida')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

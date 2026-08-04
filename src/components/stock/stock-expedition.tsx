import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStockExpeditions, createStockExpedition, updateStockExpedition } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { EXPEDITION_STATUS, type StockExpedition } from '@/lib/stock-types'
import { Loader2, Search, Plus } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Expedição': 'bg-amber-100 text-amber-700',
  'Em Preparação': 'bg-blue-100 text-blue-700',
  Liberada: 'bg-purple-100 text-purple-700',
  Coletada: 'bg-cyan-100 text-cyan-700',
  'Em Transporte': 'bg-indigo-100 text-indigo-700',
  Entregue: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
}

export function StockExpedition() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockExpedition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getStockExpeditions())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_expeditions', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    return (
      !term ||
      (r.numero_expedicao || '').toLowerCase().includes(term) ||
      (r.cliente || '').toLowerCase().includes(term) ||
      (r.pedido || '').toLowerCase().includes(term)
    )
  })

  const handleStatus = async (id: string, status: string) => {
    try {
      const updates: Record<string, unknown> = { status }
      if (status === 'Entregue') {
        updates.historico = [
          { action: 'Entrega confirmada', user: userName, date: new Date().toISOString() },
        ]
      }
      await updateStockExpedition(id, updates)
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleNew = async () => {
    try {
      await createStockExpedition({
        numero_expedicao: `EXP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        pedido: '',
        cliente: '',
        transportadora: '',
        motorista: '',
        veiculo: '',
        data: new Date().toISOString().split('T')[0],
        quantidade_volumes: 0,
        peso_bruto: '0',
        peso_liquido: '0',
        status: 'Aguardando Expedição',
        responsavel: userName,
        romaneio: '',
        observacoes: '',
        historico: [],
      })
      toast({ title: 'Expedição criada' })
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
            placeholder="Buscar expedição..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Expedição
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Pedido</th>
                <th className="text-left px-3 py-2 font-bold">Cliente</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">
                  Transportadora
                </th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Data</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_expedicao}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.pedido || '—'}</td>
                  <td className="px-3 py-2 font-medium">{r.cliente || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden lg:table-cell">
                    {r.transportadora || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1 flex-wrap">
                      {r.status === 'Aguardando Expedição' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Preparação')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Preparar
                        </Button>
                      )}
                      {r.status === 'Em Preparação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Liberada')}
                          className="text-purple-600 h-7 text-xs"
                        >
                          Liberar
                        </Button>
                      )}
                      {r.status === 'Liberada' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Transporte')}
                          className="text-indigo-600 h-7 text-xs"
                        >
                          Transportar
                        </Button>
                      )}
                      {r.status === 'Em Transporte' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Entregue')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Entregar
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

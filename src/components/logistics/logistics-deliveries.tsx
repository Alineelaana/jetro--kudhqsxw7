import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDeliveries, updateDelivery } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { DELIVERY_STATUS, type LogisticsDelivery } from '@/lib/logistics-types'
import { canUpdateDeliveries } from '@/lib/logistics-permissions'
import { useAuth } from '@/hooks/use-auth'
import { Search, Loader2, Package } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Programada: 'bg-blue-100 text-blue-700',
  'Em Trânsito': 'bg-cyan-100 text-cyan-700',
  'Saiu para Entrega': 'bg-indigo-100 text-indigo-700',
  Entregue: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
  Devolvida: 'bg-orange-100 text-orange-700',
}

export function LogisticsDeliveries() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<LogisticsDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    try {
      setRecords(await getDeliveries())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_deliveries', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    const matchSearch =
      !t ||
      (r.cliente || '').toLowerCase().includes(t) ||
      (r.numero_entrega || '').toLowerCase().includes(t) ||
      (r.pedido || '').toLowerCase().includes(t)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateDelivery(id, { status })
      toast({ title: 'Status atualizado' })
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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar entrega..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {DELIVERY_STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} entrega(s)</p>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Entrega</th>
                <th className="text-left px-3 py-2 font-bold">Cliente</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Rota</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Veículo</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Motorista</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Prevista</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                {canUpdateDeliveries(role) && (
                  <th className="text-center px-3 py-2 font-bold">Ação</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhuma entrega encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.numero_entrega || '—'}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.cliente || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{r.rota || '—'}</td>
                    <td className="px-3 py-2 hidden lg:table-cell text-xs">{r.veiculo || '—'}</td>
                    <td className="px-3 py-2 hidden lg:table-cell text-xs">{r.motorista || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.data_prevista
                        ? new Date(r.data_prevista).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    {canUpdateDeliveries(role) && (
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <Select onValueChange={(v) => handleStatus(r.id, v)}>
                            <SelectTrigger className="h-7 w-32 text-xs focus-visible:ring-[#005B2E]">
                              <SelectValue placeholder="Alterar" />
                            </SelectTrigger>
                            <SelectContent>
                              {DELIVERY_STATUS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

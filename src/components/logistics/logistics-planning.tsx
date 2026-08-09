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
import { getSalesOrders } from '@/services/sales'
import { getWmsReceipts, getWmsSeparations } from '@/services/wms'
import { getDeliveries } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { Search, Loader2, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { SalesOrder } from '@/lib/sales-types'

const PRIORITY_MAP: Record<string, string> = {
  Aprovado: 'Alta',
  'Estoque Reservado': 'Alta',
  'Faturado Totalmente': 'Crítica',
  'Aguardando Faturamento': 'Média',
  Rascunho: 'Baixa',
}

export function LogisticsPlanning() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [receipts, setReceipts] = useState<Record<string, unknown>[]>([])
  const [separations, setSeparations] = useState<Record<string, unknown>[]>([])
  const [deliveries, setDeliveries] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    try {
      const [ords, rcpts, seps, dels] = await Promise.all([
        getSalesOrders().catch(() => []),
        getWmsReceipts().catch(() => []),
        getWmsSeparations().catch(() => []),
        getDeliveries().catch(() => []),
      ])
      setOrders(ords)
      setReceipts(rcpts as unknown as Record<string, unknown>[])
      setSeparations(seps as unknown as Record<string, unknown>[])
      setDeliveries(dels as unknown as Record<string, unknown>[])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())
  useRealtime('wms_separations', () => load())

  const filtered = useMemo(() => {
    const t = search.toLowerCase().trim()
    return orders.filter((o) => {
      const matchSearch =
        !t || o.client_name?.toLowerCase().includes(t) || o.order_number?.toLowerCase().includes(t)
      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [orders, search, statusFilter])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-lg font-bold">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-lg font-bold">
                {separations.filter((s) => s.status === 'Aguardando Separação').length}
              </p>
              <p className="text-xs text-muted-foreground">Aguardando Separação</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-lg font-bold">
                {receipts.filter((r) => r.status === 'Pendente').length}
              </p>
              <p className="text-xs text-muted-foreground">Recebimentos Pendentes</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-lg font-bold">
                {
                  deliveries.filter((d) => !['Entregue', 'Cancelada'].includes(d.status as string))
                    .length
                }
              </p>
              <p className="text-xs text-muted-foreground">Entregas em Andamento</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Aprovado">Aprovado</SelectItem>
            <SelectItem value="Estoque Reservado">Estoque Reservado</SelectItem>
            <SelectItem value="Aguardando Faturamento">Aguardando Faturamento</SelectItem>
            <SelectItem value="Faturado Totalmente">Faturado Totalmente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Pedido</th>
                <th className="text-left px-3 py-2 font-bold">Cliente</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Status</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Prioridade</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Entrega</th>
                <th className="text-right px-3 py-2 font-bold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                    {o.order_number}
                  </td>
                  <td className="px-3 py-2 font-medium">{o.client_name}</td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${PRIORITY_MAP[o.status] === 'Crítica' ? 'bg-red-100 text-red-700' : PRIORITY_MAP[o.status] === 'Alta' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {PRIORITY_MAP[o.status] || 'Baixa'}
                    </span>
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell text-xs">
                    {o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold">R$ {o.total_value || '0,00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

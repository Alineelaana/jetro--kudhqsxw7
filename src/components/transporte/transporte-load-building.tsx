import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSalesOrders } from '@/services/sales'
import { getVehicles, getRoutes, createJourney } from '@/services/transport-journeys'
import { getRoutes as getLogisticsRoutes } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { canPlanLoad } from '@/lib/transporte-permissions'
import { Loader2, Package, Search, Layers, Check } from 'lucide-react'
import type { SalesOrder } from '@/lib/sales-types'

const READY_STATUSES = ['Faturado Totalmente', 'Estoque Reservado', 'Aprovado']

export function TransporteLoadBuilding() {
  const { user } = useAuth()
  const role = user?.role as string
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [vehicles, setVehicles] = useState<Record<string, unknown>[]>([])
  const [routes, setRoutes] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [vehicleId, setVehicleId] = useState('')
  const [routeId, setRouteId] = useState('')
  const [journeyName, setJourneyName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [ords, vehs, rts] = await Promise.all([
        getSalesOrders(),
        getVehicles(),
        getLogisticsRoutes(),
      ])
      setOrders(ords.filter((o) => READY_STATUSES.includes(o.status)))
      setVehicles(vehs as unknown as Record<string, unknown>[])
      setRoutes(rts as unknown as Record<string, unknown>[])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())

  const filtered = useMemo(() => {
    const t = search.toLowerCase().trim()
    return orders.filter(
      (o) =>
        !t || o.client_name?.toLowerCase().includes(t) || o.order_number?.toLowerCase().includes(t),
    )
  }, [orders, search])

  const selectedOrders = orders.filter((o) => selected.has(o.id))
  const totalValue = selectedOrders.reduce((s, o) => s + parseFloat(o.total_value || '0'), 0)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const handleCreate = async () => {
    if (!journeyName || !vehicleId || selected.size === 0) {
      toast.error('Preencha nome da viagem, veículo e selecione pedidos')
      return
    }
    setSubmitting(true)
    try {
      const veh = vehicles.find((v) => v.id === vehicleId)
      const rte = routes.find((r) => r.id === routeId)
      await createJourney({
        numero_viagem: `VIA-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        status: 'Planejada',
        rota: (rte?.nome_rota as string) || journeyName,
        veiculo: (veh?.placa as string) || '',
        motorista: (veh?.motorista as string) || '',
        transportadora: 'Próprio',
        origem: 'Vitória/ES',
        destino: (rte?.cidade_origem as string) || '',
        data_prevista_saida: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        data_prevista_chegada: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        quantidade_entregas: selected.size,
        valor_frete: '0',
        custo_total: '0',
        tipo_transporte: 'Próprio',
        entregas: selectedOrders.map((o) => ({
          pedido: o.order_number,
          cliente: o.client_name,
          valor: o.total_value,
        })),
        documentos: [],
        ocorrencias: [],
        rastreamento: [],
        comprovantes: [],
        historico: [
          { action: 'Carga formada', user: user?.name || '', date: new Date().toISOString() },
        ],
        responsavel: user?.name || '',
        observacoes: '',
        peso_total: '0',
        volume_total: '0',
      })
      toast.success(`Viagem criada com ${selected.size} entrega(s)`)
      setSelected(new Set())
      setJourneyName('')
      setVehicleId('')
      setRouteId('')
      load()
    } catch {
      toast.error('Erro ao criar viagem')
    }
    setSubmitting(false)
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
            placeholder="Buscar pedidos..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} pedido(s) disponível(is)
        </span>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="px-3 py-2 w-8"></th>
                <th className="text-left px-3 py-2 font-bold">Pedido</th>
                <th className="text-left px-3 py-2 font-bold">Cliente</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Endereço</th>
                <th className="text-right px-3 py-2 font-bold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(o.id)}
                      onChange={() => toggleSelect(o.id)}
                      className="w-4 h-4 accent-[#005B2E]"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                    {o.order_number}
                  </td>
                  <td className="px-3 py-2 font-medium">{o.client_name}</td>
                  <td className="px-3 py-2 hidden md:table-cell text-xs">
                    {o.delivery_address || '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold">R$ {o.total_value || '0,00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {selected.size > 0 && canPlanLoad(role) && (
        <Card className="border-2 border-[#005B2E]/30 shadow-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#005B2E]" />
            <h3 className="font-bold text-[#005B2E]">{selected.size} pedido(s) selecionado(s)</h3>
            <span className="ml-auto text-sm text-muted-foreground">
              Total: <strong className="text-[#005B2E]">R$ {totalValue.toFixed(2)}</strong>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nome da Viagem *</Label>
              <Input
                value={journeyName}
                onChange={(e) => setJourneyName(e.target.value)}
                placeholder="Ex: Viagem Norte"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Veículo *</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id as string} value={v.id as string}>
                      {v.placa as string} — {v.modelo as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Rota</Label>
              <Select value={routeId} onValueChange={setRouteId}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id as string} value={r.id as string}>
                      {(r.nome_rota as string) || (r.codigo_rota as string)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Formar Carga e Criar
            Viagem
          </Button>
        </Card>
      )}
    </div>
  )
}

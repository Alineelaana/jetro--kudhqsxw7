import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSalesOrders } from '@/services/sales'
import { getVehicles, getDrivers, createRoute, createDelivery } from '@/services/logistics'
import { calculateRoute } from '@/services/logistics-gps'
import { LogisticsMap } from '@/components/logistics/logistics-map'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Search, Loader2, AlertTriangle, Check } from 'lucide-react'
import type { SalesOrder } from '@/lib/sales-types'
import type { LogisticsVehicle, LogisticsDriver } from '@/lib/logistics-types'

const READY_STATUSES = ['Faturado Totalmente', 'Estoque Reservado']

export function LogisticsRoutePlanning() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [vehicles, setVehicles] = useState<LogisticsVehicle[]>([])
  const [drivers, setDrivers] = useState<LogisticsDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [routeName, setRouteName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cidadeOrigem, setCidadeOrigem] = useState('')
  const [routeCalc, setRouteCalc] = useState<{ distanceText: string; durationText: string } | null>(
    null,
  )
  const [calcLoading, setCalcLoading] = useState(false)

  const load = async () => {
    try {
      const [ords, vehs, drvs] = await Promise.all([getSalesOrders(), getVehicles(), getDrivers()])
      setOrders(ords.filter((o) => READY_STATUSES.includes(o.status)))
      setVehicles(vehs)
      setDrivers(drvs)
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
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)
  const selectedDriver = drivers.find((d) => d.id === driverId)
  const totalValue = selectedOrders.reduce((s, o) => s + parseFloat(o.total_value || '0'), 0)

  const alerts: string[] = []
  if (selectedVehicle && selectedVehicle.situacao !== 'Disponível')
    alerts.push(`Veículo ${selectedVehicle.placa} está ${selectedVehicle.situacao.toLowerCase()}`)
  if (selectedDriver && selectedDriver.situacao !== 'Disponível')
    alerts.push(`Motorista ${selectedDriver.nome} está ${selectedDriver.situacao.toLowerCase()}`)
  if (selectedOrders.some((o) => !READY_STATUSES.includes(o.status)))
    alerts.push('Algum pedido selecionado não está liberado para entrega')

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const handleCalcRoute = async () => {
    if (!cidadeOrigem || selectedOrders.length === 0) return
    setCalcLoading(true)
    try {
      const dest = selectedOrders[0]?.delivery_address || selectedOrders[0]?.client_name || ''
      const wps = selectedOrders
        .slice(1)
        .map((o) => o.delivery_address || o.client_name)
        .filter(Boolean)
      const result = await calculateRoute(cidadeOrigem, dest, wps)
      setRouteCalc(result)
    } catch {
      setRouteCalc(null)
      toast.error('Erro ao calcular rota')
    }
    setCalcLoading(false)
  }

  const handleCreate = async () => {
    if (!routeName || !vehicleId || !driverId || selected.size === 0) {
      toast.error('Preencha todos os campos e selecione pedidos')
      return
    }
    setSubmitting(true)
    try {
      const routeCode = `RT-${Date.now().toString(36).toUpperCase().slice(-6)}`
      await createRoute({
        codigo_rota: routeCode,
        nome_rota: routeName,
        situacao: 'Em Planejamento',
        responsavel: '',
        cidade_origem: cidadeOrigem,
        distancia_estimada: routeCalc?.distanceText || '',
        tempo_estimado: routeCalc?.durationText || '',
        capacidade_maxima_peso: selectedVehicle?.capacidade_peso || 0,
        capacidade_maxima_volume: selectedVehicle?.capacidade_volume || 0,
        clientes_vinculados: selectedOrders.map((o) => o.client_name),
        sequencia_entregas: selectedOrders.map((o, i) => ({
          seq: i + 1,
          pedido: o.order_number,
          cliente: o.client_name,
        })),
        historico: [],
      })
      for (const order of selectedOrders) {
        await createDelivery({
          numero_entrega: `ENT-${Date.now().toString(36).toUpperCase().slice(-6)}`,
          pedido: order.order_number,
          cliente: order.client_name,
          endereco: order.delivery_address || '',
          rota: routeName,
          veiculo: selectedVehicle?.placa || '',
          motorista: selectedDriver?.nome || '',
          data_prevista: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'Programada',
          valor_mercadoria: order.total_value || '0',
          historico_movimentacoes: [],
          ocorrencias: [],
          comprovantes: [],
        })
      }
      toast.success(`Rota criada com ${selected.size} entregas`)
      setSelected(new Set())
      setRouteName('')
      setVehicleId('')
      setDriverId('')
      load()
    } catch {
      toast.error('Erro ao criar rota')
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
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Status</th>
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
                  <td className="px-3 py-2 hidden md:table-cell">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-bold">R$ {o.total_value || '0,00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {selected.size > 0 && (
        <Card className="border-2 border-[#005B2E]/30 shadow-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[#005B2E]" />
            <h3 className="font-bold text-[#005B2E]">{selected.size} pedido(s) selecionado(s)</h3>
            <span className="ml-auto text-sm text-muted-foreground">
              Total: <strong className="text-[#005B2E]">R$ {totalValue.toFixed(2)}</strong>
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={cidadeOrigem}
              onChange={(e) => setCidadeOrigem(e.target.value)}
              placeholder="Cidade de origem (ex: Vitória, ES)"
              className="focus-visible:ring-[#005B2E]"
            />
            <Button
              variant="outline"
              onClick={handleCalcRoute}
              disabled={calcLoading || !cidadeOrigem}
              className="border-[#005B2E] text-[#005B2E] whitespace-nowrap"
            >
              {calcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calcular Rota'}
            </Button>
          </div>
          {routeCalc && (
            <div className="flex gap-4 text-sm">
              <span>
                Distância: <strong className="text-[#005B2E]">{routeCalc.distanceText}</strong>
              </span>
              <span>
                Tempo: <strong className="text-[#005B2E]">{routeCalc.durationText}</strong>
              </span>
            </div>
          )}
          {cidadeOrigem && selectedOrders.length > 0 && (
            <LogisticsMap
              origin={cidadeOrigem}
              destination={
                selectedOrders[0]?.delivery_address || selectedOrders[0]?.client_name || ''
              }
              waypoints={selectedOrders
                .slice(1)
                .map((o) => o.delivery_address || o.client_name)
                .filter(Boolean)}
              height="250px"
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nome da Rota *</Label>
              <Input
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Ex: Rota Norte"
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
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa} — {v.modelo} ({v.situacao})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Motorista *</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome} ({d.situacao})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="space-y-1">
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {a}
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar Rota com{' '}
            {selected.size} Entrega(s)
          </Button>
        </Card>
      )}
    </div>
  )
}

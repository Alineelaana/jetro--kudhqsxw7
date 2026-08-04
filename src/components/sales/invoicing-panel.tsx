import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getSalesOrders,
  updateSalesOrder,
  createSalesInvoice,
  getNextSalesNumber,
  logSalesAudit,
} from '@/services/sales'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { STATUS_COLORS, type SalesOrder } from '@/lib/sales-types'
import { Search, Loader2, FileText, Check, Truck } from 'lucide-react'
import { toast } from 'sonner'

export function InvoicingPanel() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmOrder, setConfirmOrder] = useState<SalesOrder | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [carrier, setCarrier] = useState('')
  const [volumes, setVolumes] = useState('')
  const [grossWeight, setGrossWeight] = useState('')
  const [netWeight, setNetWeight] = useState('')
  const [freight, setFreight] = useState('0')
  const [invoicing, setInvoicing] = useState(false)

  const load = async () => {
    try {
      setOrders(await getSalesOrders())
    } catch {
      setOrders([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())

  const readyOrders = useMemo(() => {
    const term = search.toLowerCase().trim()
    return orders.filter((o) => {
      if (!['Estoque Reservado', 'Aguardando Faturamento', 'Aprovado'].includes(o.status))
        return false
      return (
        !term ||
        o?.order_number?.toLowerCase()?.includes(term) ||
        o?.client_name?.toLowerCase()?.includes(term)
      )
    })
  }, [orders, search])

  const handleInvoice = async () => {
    if (!confirmOrder) return
    setInvoicing(true)
    try {
      const userName = (user?.name as string) || 'Sistema'
      const { number } = await getNextSalesNumber('invoice')
      await createSalesInvoice({
        invoice_number: number,
        status: 'Faturada',
        order_id: confirmOrder.id,
        order_number: confirmOrder.order_number,
        client_id: confirmOrder.client_id,
        client_name: confirmOrder.client_name,
        invoice_date: new Date().toISOString(),
        items: confirmOrder.items,
        total_value: confirmOrder.total_value,
        carrier_name: carrier,
        volumes,
        gross_weight: grossWeight,
        net_weight: netWeight,
        freight_value: freight,
        other_expenses: '0',
        company: confirmOrder.company,
        branch: confirmOrder.branch,
        responsible_user: userName,
        history: [
          {
            action: 'Faturamento criado',
            user: userName,
            date: new Date().toISOString(),
            note: '',
          },
        ],
      })
      await updateSalesOrder(confirmOrder.id, {
        status: 'Faturado Totalmente',
        history: [
          ...(confirmOrder.history || []),
          {
            action: 'Faturado',
            user: userName,
            date: new Date().toISOString(),
            note: `Nota ${number}`,
          },
        ],
      })
      logSalesAudit(
        'create',
        'sales',
        confirmOrder.id,
        `Faturamento ${number} do pedido ${confirmOrder.order_number}`,
      )
      toast.success('Pedido faturado com sucesso')
      setConfirmOpen(false)
      setCarrier('')
      setVolumes('')
      setGrossWeight('')
      setNetWeight('')
      setFreight('0')
      load()
    } catch {
      toast.error('Erro ao faturar pedido')
    }
    setInvoicing(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Faturamento</h3>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedidos para faturamento..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {readyOrders.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum pedido pronto para faturamento.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Pedido</th>
                  <th className="text-left px-3 py-3 font-bold">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Vendedor</th>
                  <th className="text-left px-3 py-3 font-bold">Valor Total</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Entrega</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {readyOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {o.order_number}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{o.client_name}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{o.salesperson_name || '—'}</td>
                    <td className="px-3 py-3 font-bold">R$ {o.total_value || '0,00'}</td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {o.delivery_date || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[o.status] || ''}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Button
                        size="sm"
                        onClick={() => {
                          setConfirmOrder(o)
                          setConfirmOpen(true)
                        }}
                        className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Faturar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Faturamento</DialogTitle>
          </DialogHeader>
          {confirmOrder && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Pedido:</strong> {confirmOrder.order_number}
              </p>
              <p>
                <strong>Cliente:</strong> {confirmOrder.client_name}
              </p>
              <p>
                <strong>Itens:</strong> {confirmOrder.items?.length || 0}
              </p>
              <p>
                <strong>Valor Total:</strong> R$ {confirmOrder.total_value}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <Label className="text-xs">Transportadora</Label>
                  <Input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Volumes</Label>
                  <Input
                    value={volumes}
                    onChange={(e) => setVolumes(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Peso Bruto</Label>
                  <Input
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Peso Líquido</Label>
                  <Input
                    value={netWeight}
                    onChange={(e) => setNetWeight(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Frete</Label>
                  <Input
                    type="number"
                    value={freight}
                    onChange={(e) => setFreight(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleInvoice}
              disabled={invoicing}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {invoicing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
              <Truck className="w-4 h-4 mr-2" /> Confirmar Faturamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClipboardList, Plus, Loader2, ChevronRight } from 'lucide-react'
import {
  getProductionOrders,
  createProductionOrder,
  updateProductionOrder,
  getNextProductionOrderNumber,
} from '@/services/production-orders'
import { getIndustrialItems, getBomVersions, getProductionRoutes } from '@/services/industry'
import { transitionOrder } from '@/services/pcp'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import type { ProductionOrder } from '@/services/production-orders'

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  planejada: 'Planejada',
  liberada: 'Liberada',
  em_producao: 'Em Produção',
  parcial: 'Parcial',
  inspecao: 'Inspeção',
  concluida: 'Concluída',
  fechada: 'Fechada',
  cancelada: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  planejada: 'bg-blue-100 text-blue-700',
  liberada: 'bg-cyan-100 text-cyan-700',
  em_producao: 'bg-amber-100 text-amber-700',
  parcial: 'bg-orange-100 text-orange-700',
  inspecao: 'bg-purple-100 text-purple-700',
  concluida: 'bg-emerald-100 text-emerald-700',
  fechada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  producao: 'Produção',
  rework: 'Retrabalho',
  piloto: 'Piloto',
  complementar: 'Complementar',
  terceirizada: 'Terceirizada',
}

export function ProductionOrdersPanel() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [boms, setBoms] = useState<Record<string, unknown>[]>([])
  const [routes, setRoutes] = useState<Record<string, unknown>[]>([])
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [o, i, b, r] = await Promise.all([
        getProductionOrders(),
        getIndustrialItems(),
        getBomVersions(),
        getProductionRoutes(),
      ])
      setOrders(o)
      setItems(i as Record<string, unknown>[])
      setBoms(b as unknown as Record<string, unknown>[])
      setRoutes(r as unknown as Record<string, unknown>[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('production_orders', () => load())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const productId = String(fd.get('product_id') || '')
    if (!productId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const orderNumber = await getNextProductionOrderNumber()
      await createProductionOrder({
        order_number: orderNumber,
        status: 'rascunho',
        product_id: productId,
        bom_version_id: String(fd.get('bom_version_id') || '') || undefined,
        route_id: String(fd.get('route_id') || '') || undefined,
        quantity: String(fd.get('quantity') || ''),
        unit: String(fd.get('unit') || ''),
        start_date: String(fd.get('start_date') || ''),
        end_date: String(fd.get('end_date') || ''),
        responsible: (user?.name as string) || 'Admin',
        observations: String(fd.get('observations') || ''),
      })
      toast({ title: 'Ordem de produção criada' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar ordem', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await transitionOrder(id, status)
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
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
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Ordens de Produção</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Ordem
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((o) => (
          <Card key={o.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.expand?.product_id?.name || '—'} • Qtd: {o.quantity} {o.unit}
                  </p>
                </div>
                <Badge className={STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}>
                  {STATUS_LABELS[o.status] || o.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Resp: {o.responsible || '—'}</span>
                {o.start_date && <span>• Início: {o.start_date}</span>}
                {o.order_type && (
                  <span>• Tipo: {ORDER_TYPE_LABELS[o.order_type] || o.order_type}</span>
                )}
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {o.status === 'rascunho' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange(o.id, 'planejada')}
                  >
                    Planejar
                  </Button>
                )}
                {o.status === 'planejada' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange(o.id, 'liberada')}
                  >
                    Liberar
                  </Button>
                )}
                {o.status === 'liberada' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange(o.id, 'em_producao')}
                  >
                    Iniciar
                  </Button>
                )}
                {o.status === 'em_producao' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange(o.id, 'parcial')}
                    >
                      Parcial
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange(o.id, 'inspecao')}
                    >
                      Inspeção
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange(o.id, 'concluida')}
                    >
                      Concluir
                    </Button>
                  </>
                )}
                {o.status === 'parcial' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange(o.id, 'em_producao')}
                  >
                    Retomar
                  </Button>
                )}
                {o.status === 'inspecao' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange(o.id, 'concluida')}
                  >
                    Aprovar
                  </Button>
                )}
                {o.status === 'concluida' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange(o.id, 'fechada')}
                  >
                    Fechar
                  </Button>
                )}
                {o.status !== 'concluida' && o.status !== 'cancelada' && o.status !== 'fechada' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-600"
                    onClick={() => handleStatusChange(o.id, 'cancelada')}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {orders.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold mb-1">Nenhuma ordem de produção cadastrada</p>
            <p className="text-sm text-muted-foreground">Crie a primeira ordem de produção</p>
          </CardContent>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Ordem de Produção</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Produto *</Label>
              <Select name="product_id">
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={String(i.id)} value={String(i.id)}>
                      {String(i.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">BOM</Label>
                <Select name="bom_version_id">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {boms.map((b) => (
                      <SelectItem key={String(b.id)} value={String(b.id)}>
                        v{String(b.version || '1')} -{' '}
                        {String((b as any).expand?.product_id?.name || '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Roteiro</Label>
                <Select name="route_id">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((r) => (
                      <SelectItem key={String(r.id)} value={String(r.id)}>
                        {String(r.name || '—')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Quantidade *</Label>
                <Input
                  name="quantity"
                  required
                  className="focus-visible:ring-[#005B2E]"
                  placeholder="100"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Unidade</Label>
                <Input
                  name="unit"
                  className="focus-visible:ring-[#005B2E]"
                  placeholder="kg, un, L"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Data Início</Label>
                <Input name="start_date" type="date" className="focus-visible:ring-[#005B2E]" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Data Fim</Label>
                <Input name="end_date" type="date" className="focus-visible:ring-[#005B2E]" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Observações</Label>
              <Textarea name="observations" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

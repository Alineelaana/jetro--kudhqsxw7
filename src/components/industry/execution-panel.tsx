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
import { Play, Pause, Square, Loader2, Activity } from 'lucide-react'
import { getApontamentos, createApontamento } from '@/services/industrial-extended'
import { getProductionOrders } from '@/services/production-orders'
import { getProductionResources } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

const TYPE_LABELS: Record<string, string> = {
  inicio: 'Inicio',
  pausa: 'Pausa',
  retomada: 'Retomada',
  producao: 'Producao',
  fim: 'Fim',
  consumo: 'Consumo',
  parada: 'Parada',
  manutencao: 'Manutencao',
  refugo: 'Refugo',
  perda: 'Perda',
  qualidade: 'Qualidade',
  rework: 'Retrabalho',
}
const TYPE_COLORS: Record<string, string> = {
  inicio: 'bg-blue-100 text-blue-700',
  pausa: 'bg-amber-100 text-amber-700',
  retomada: 'bg-cyan-100 text-cyan-700',
  producao: 'bg-emerald-100 text-emerald-700',
  fim: 'bg-gray-100 text-gray-600',
  consumo: 'bg-purple-100 text-purple-700',
  parada: 'bg-red-100 text-red-700',
  manutencao: 'bg-orange-100 text-orange-700',
  refugo: 'bg-pink-100 text-pink-700',
  perda: 'bg-rose-100 text-rose-700',
  qualidade: 'bg-indigo-100 text-indigo-700',
  rework: 'bg-yellow-100 text-yellow-700',
}

export function ExecutionPanel() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [apontamentos, setApontamentos] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    try {
      const [o, a, r] = await Promise.all([
        getProductionOrders(),
        getApontamentos(),
        getProductionResources(),
      ])
      setOrders(o.filter((x: any) => x.status === 'em_producao' || x.status === 'planejada'))
      setApontamentos(a)
      setResources(r as any[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_apontamentos', () => load())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const orderId = String(fd.get('production_order_id') || '')
    if (!orderId) {
      toast({ title: 'Selecione uma ordem', variant: 'destructive' })
      return
    }
    try {
      await createApontamento({
        production_order_id: orderId,
        resource_id: String(fd.get('resource_id') || '') || undefined,
        operator_name: (user?.name as string) || 'Operador',
        operation_name: String(fd.get('operation_name') || ''),
        type: String(fd.get('type') || 'producao'),
        quantity_produced: Number(fd.get('quantity_produced') || 0),
        quantity_rejected: Number(fd.get('quantity_rejected') || 0),
        team_name: String(fd.get('team_name') || ''),
        stoppage_reason: String(fd.get('stoppage_reason') || ''),
        notes: String(fd.get('notes') || ''),
        lot_number: String(fd.get('lot_number') || ''),
        responsible: (user?.name as string) || 'Admin',
      })
      toast({ title: 'Apontamento registrado' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao registrar apontamento', variant: 'destructive' })
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
          <Activity className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Execucao & Apontamentos</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Play className="w-4 h-4 mr-2" /> Novo Apontamento
        </Button>
      </div>
      {orders.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50/50">
          <CardContent className="py-3">
            <p className="text-sm font-semibold text-amber-700">
              Ordens em producao: {orders.length}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {apontamentos.slice(0, 20).map((a) => (
          <Card key={a.id} className="border-2 border-[#005B2E]/10">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={TYPE_COLORS[a.type] || 'bg-gray-100 text-gray-600'}>
                  {a.type === 'inicio' && <Play className="w-3 h-3 mr-1" />}
                  {a.type === 'pausa' && <Pause className="w-3 h-3 mr-1" />}
                  {a.type === 'fim' && <Square className="w-3 h-3 mr-1" />}
                  {TYPE_LABELS[a.type] || a.type}
                </Badge>
                <div>
                  <p className="text-sm font-medium">
                    {a.expand?.production_order_id?.order_number || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.operator_name} • {a.operation_name || 'Sem operacao'}
                    {a.quantity_produced > 0 && ` • Prod: ${a.quantity_produced}`}
                    {a.quantity_rejected > 0 && ` • Refugo: ${a.quantity_rejected}`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(a.created).toLocaleString('pt-BR')}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Apontamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Ordem de Producao *</Label>
              <Select name="production_order_id">
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.order_number} - {o.expand?.product_id?.name || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Tipo</Label>
                <Select name="type" defaultValue="producao">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Recurso</Label>
                <Select name="resource_id">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Operacao</Label>
              <Input name="operation_name" className="focus-visible:ring-[#005B2E]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Qtd Produzida</Label>
                <Input
                  name="quantity_produced"
                  type="number"
                  min="0"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Qtd Refugada</Label>
                <Input
                  name="quantity_rejected"
                  type="number"
                  min="0"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Lote</Label>
              <Input name="lot_number" className="focus-visible:ring-[#005B2E]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Equipe</Label>
                <Input name="team_name" className="focus-visible:ring-[#005B2E]" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Motivo Parada</Label>
                <Input name="stoppage_reason" className="focus-visible:ring-[#005B2E]" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Observacoes</Label>
              <Textarea name="notes" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

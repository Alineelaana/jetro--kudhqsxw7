import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Battery, BatteryLow } from 'lucide-react'
import { getWmsCollectors, createWmsCollector, updateWmsCollector } from '@/services/wms-management'
import { COLLECTOR_SITUATIONS, type WmsCollector } from '@/lib/wms-management-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  Disponível: 'bg-green-100 text-green-700',
  'Em Uso': 'bg-blue-100 text-blue-700',
  'Em Manutenção': 'bg-amber-100 text-amber-700',
  Bloqueado: 'bg-red-100 text-red-700',
  Inativo: 'bg-gray-100 text-gray-700',
}

export function WmsCollectors() {
  const [collectors, setCollectors] = useState<WmsCollector[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    codigo_equipamento: '',
    modelo: '',
    numero_serie: '',
    operador_atual: '',
    data_entrega: '',
    status: 'Disponível',
    bateria: '100',
    observacoes: '',
    turno: 'Manhã',
  })

  const load = useCallback(async () => {
    try {
      setCollectors(await getWmsCollectors())
    } catch {
      setCollectors([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('wms_collectors', () => load())

  const handleCreate = async () => {
    try {
      await createWmsCollector({
        ...form,
        bateria: Number(form.bateria),
        ultima_comunicacao: new Date().toISOString(),
      })
      toast({ title: 'Coletor registrado' })
      setDialogOpen(false)
      setForm({
        codigo_equipamento: '',
        modelo: '',
        numero_serie: '',
        operador_atual: '',
        data_entrega: '',
        status: 'Disponível',
        bateria: '100',
        observacoes: '',
        turno: 'Manhã',
      })
      load()
    } catch {
      toast({ title: 'Erro ao registrar coletor', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (c: WmsCollector, newStatus: string) => {
    try {
      await updateWmsCollector(c.id, { status: newStatus })
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
        <h2 className="text-xl font-black text-foreground">Gestão de Coletores</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              <Plus className="w-4 h-4 mr-1" /> Novo Coletor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Coletor</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Código Equipamento</Label>
                <Input
                  value={form.codigo_equipamento}
                  onChange={(e) => setForm({ ...form, codigo_equipamento: e.target.value })}
                />
              </div>
              <div>
                <Label>Modelo</Label>
                <Input
                  value={form.modelo}
                  onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                />
              </div>
              <div>
                <Label>Número de Série</Label>
                <Input
                  value={form.numero_serie}
                  onChange={(e) => setForm({ ...form, numero_serie: e.target.value })}
                />
              </div>
              <div>
                <Label>Operador Atual</Label>
                <Input
                  value={form.operador_atual}
                  onChange={(e) => setForm({ ...form, operador_atual: e.target.value })}
                />
              </div>
              <div>
                <Label>Data de Entrega</Label>
                <Input
                  type="date"
                  value={form.data_entrega}
                  onChange={(e) => setForm({ ...form, data_entrega: e.target.value })}
                />
              </div>
              <div>
                <Label>Turno</Label>
                <Select value={form.turno} onValueChange={(v) => setForm({ ...form, turno: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bateria (%)</Label>
                <Input
                  type="number"
                  value={form.bateria}
                  onChange={(e) => setForm({ ...form, bateria: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTOR_SITUATIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <Input
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collectors.map((c) => (
          <Card key={c.id} className="border-2 border-[#005B2E]/10 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{c.codigo_equipamento}</span>
                <Badge className={cn(STATUS_COLORS[c.status] || 'bg-gray-100')}>{c.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {c.modelo} · SN: {c.numero_serie}
              </p>
              <div className="flex items-center gap-2 text-xs">
                {Number(c.bateria) > 20 ? (
                  <Battery className="w-4 h-4 text-green-600" />
                ) : (
                  <BatteryLow className="w-4 h-4 text-red-600" />
                )}
                <span>{c.bateria}%</span>
              </div>
              <p className="text-xs">Operador: {c.operador_atual || '—'}</p>
              <p className="text-xs">Turno: {c.turno || '—'}</p>
              <p className="text-xs text-muted-foreground">
                Última comunicação:{' '}
                {c.ultima_comunicacao
                  ? new Date(c.ultima_comunicacao).toLocaleString('pt-BR')
                  : '—'}
              </p>
              <Select value={c.status} onValueChange={(v) => handleStatusChange(c, v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLLECTOR_SITUATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
      {collectors.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum coletor cadastrado.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

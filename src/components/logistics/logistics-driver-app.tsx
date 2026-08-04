import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { getDeliveries, updateDelivery, createOccurrence } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { OCCURRENCE_TYPES, type LogisticsDelivery } from '@/lib/logistics-types'
import { LogisticsMap } from '@/components/logistics/logistics-map'
import {
  Loader2,
  Truck,
  MapPin,
  Package,
  CheckCircle,
  Camera,
  AlertTriangle,
  Navigation,
} from 'lucide-react'

const STATUS_FLOW: Record<string, string> = {
  Programada: 'Em Trânsito',
  'Em Trânsito': 'Saiu para Entrega',
  'Saiu para Entrega': 'Entregue',
}

export function LogisticsDriverApp() {
  const { user } = useAuth()
  const userName = (user?.name as string) || ''
  const [deliveries, setDeliveries] = useState<LogisticsDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<LogisticsDelivery | null>(null)
  const [deliveryForm, setDeliveryForm] = useState<Record<string, string>>({})
  const [occForm, setOccForm] = useState<Record<string, string>>({})
  const [showDelivery, setShowDelivery] = useState(false)
  const [showOcc, setShowOcc] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const all = await getDeliveries()
      setDeliveries(all.filter((d) => d.motorista === userName || !d.motorista))
    } catch {
      setDeliveries([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_deliveries', () => load())

  const handleAdvance = async (id: string, currentStatus: string) => {
    const next = STATUS_FLOW[currentStatus]
    if (!next) return
    try {
      await updateDelivery(id, { status: next })
      toast.success(`Status: ${next}`)
      load()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const handleRegisterDelivery = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await updateDelivery(selected.id, {
        status: 'Entregue',
        recebedor_nome: deliveryForm.recebedor_nome || '',
        recebedor_documento: deliveryForm.recebedor_documento || '',
        data_realizada: new Date().toISOString(),
      })
      toast.success('Entrega registrada')
      setShowDelivery(false)
      setDeliveryForm({})
      setSelected(null)
      load()
    } catch {
      toast.error('Erro ao registrar')
    }
    setSubmitting(false)
  }

  const handleOccurrence = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await createOccurrence({
        entrega: selected.numero_entrega,
        cliente: selected.cliente,
        motorista: userName,
        veiculo: selected.veiculo,
        data_hora: new Date().toISOString().slice(0, 16),
        tipo_ocorrencia: occForm.tipo_ocorrencia || 'Outro',
        descricao: occForm.descricao || '',
        responsavel: userName,
        situacao: 'Aberta',
        fotos: [],
        documentos: [],
        historico: [],
      })
      toast.success('Ocorrência registrada')
      setShowOcc(false)
      setOccForm({})
    } catch {
      toast.error('Erro ao registrar ocorrência')
    }
    setSubmitting(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  if (selected) {
    const canAdvance = STATUS_FLOW[selected.status]
    const isDone = ['Entregue', 'Cancelada'].includes(selected.status)
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-2">
          ← Voltar
        </Button>
        <Card className="border-2 border-[#005B2E]/30 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#C89B3C]">
                {selected.numero_entrega}
              </span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-[#005B2E]/10 text-[#005B2E]">
                {selected.status}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-lg">{selected.cliente}</p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" /> {selected.endereco || '—'}
              </p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Truck className="w-3 h-3" /> {selected.veiculo || '—'}
              </p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Package className="w-3 h-3" /> R$ {selected.valor_mercadoria || '0,00'}
              </p>
              <p className="text-muted-foreground">
                Prevista:{' '}
                {selected.data_prevista
                  ? new Date(selected.data_prevista).toLocaleDateString('pt-BR')
                  : '—'}
              </p>
            </div>
            <LogisticsMap
              query={`${selected.endereco || ''} ${selected.cidade || ''}`.trim()}
              height="200px"
            />
            {!isDone && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {canAdvance && (
                  <Button
                    onClick={() => handleAdvance(selected.id, selected.status)}
                    className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                  >
                    <Navigation className="w-4 h-4 mr-1" /> {canAdvance}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeliveryForm({})
                    setShowDelivery(true)
                  }}
                  className="border-[#005B2E] text-[#005B2E]"
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Entregar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOccForm({})
                    setShowOcc(true)
                  }}
                  className="border-orange-500 text-orange-600"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" /> Ocorrência
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={showDelivery} onOpenChange={setShowDelivery}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#005B2E]">Registrar Entrega</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Nome do Recebedor *</Label>
                <Input
                  value={deliveryForm.recebedor_nome || ''}
                  onChange={(e) =>
                    setDeliveryForm({ ...deliveryForm, recebedor_nome: e.target.value })
                  }
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Documento</Label>
                <Input
                  value={deliveryForm.recebedor_documento || ''}
                  onChange={(e) =>
                    setDeliveryForm({
                      ...deliveryForm,
                      recebedor_documento: e.target.value,
                    })
                  }
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Observações</Label>
                <Textarea
                  value={deliveryForm.observacoes || ''}
                  onChange={(e) =>
                    setDeliveryForm({ ...deliveryForm, observacoes: e.target.value })
                  }
                  rows={2}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Camera className="w-4 h-4" /> Foto do comprovante (preparado para captura)
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDelivery(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleRegisterDelivery}
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar Entrega
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showOcc} onOpenChange={setShowOcc}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#005B2E]">Registrar Ocorrência</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Tipo</Label>
                <Select
                  value={occForm.tipo_ocorrencia}
                  onValueChange={(v) => setOccForm({ ...occForm, tipo_ocorrencia: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCURRENCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Descrição</Label>
                <Textarea
                  value={occForm.descricao || ''}
                  onChange={(e) => setOccForm({ ...occForm, descricao: e.target.value })}
                  rows={3}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOcc(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleOccurrence}
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-3">
      <div className="text-center mb-4">
        <Truck className="w-10 h-10 text-[#005B2E] mx-auto mb-1" />
        <h3 className="font-bold text-[#005B2E]">Minhas Entregas</h3>
        <p className="text-sm text-muted-foreground">{deliveries.length} entrega(s) atribuída(s)</p>
      </div>
      {deliveries.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-muted-foreground">Nenhuma entrega atribuída</p>
          </CardContent>
        </Card>
      ) : (
        deliveries.map((d) => (
          <Card
            key={d.id}
            className="border-2 border-[#005B2E]/20 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelected(d)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#C89B3C]">
                  {d.numero_entrega}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                  {d.status}
                </span>
              </div>
              <p className="font-bold">{d.cliente}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {d.endereco || '—'}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  Prevista:{' '}
                  {d.data_prevista ? new Date(d.data_prevista).toLocaleDateString('pt-BR') : '—'}
                </span>
                <span>R$ {d.valor_mercadoria || '0,00'}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

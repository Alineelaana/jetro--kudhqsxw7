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
import { ShieldCheck, Plus, Loader2, AlertTriangle } from 'lucide-react'
import {
  getNonConformities,
  createNonConformity,
  updateNonConformity,
  getChecklists,
} from '@/services/industrial-extended'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

const SEVERITY_COLORS: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-600',
  media: 'bg-amber-100 text-amber-700',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-red-100 text-red-700',
}
const STATUS_FLOW: Record<string, string[]> = {
  aberta: ['em_analise', 'cancelada'],
  em_analise: ['acao_definida', 'cancelada'],
  acao_definida: ['resolvida', 'cancelada'],
  resolvida: [],
  cancelada: [],
}

export function QualityExtendedPanel() {
  const [ncs, setNcs] = useState<any[]>([])
  const [checklists, setChecklists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    try {
      const [n, c] = await Promise.all([getNonConformities(), getChecklists()])
      setNcs(n)
      setChecklists(c)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('quality_non_conformities', () => load())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await createNonConformity({
        description: String(fd.get('description') || ''),
        severity: String(fd.get('severity') || 'media'),
        status: 'aberta',
        quantity_affected: Number(fd.get('quantity_affected') || 0),
        root_cause: String(fd.get('root_cause') || ''),
        corrective_action: String(fd.get('corrective_action') || ''),
        lot_number: String(fd.get('lot_number') || ''),
        responsible: 'Qualidade',
      })
      toast({ title: 'Nao conformidade registrada' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao registrar', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updates: any = { status }
      if (status === 'resolvida') updates.resolution_date = new Date().toISOString().split('T')[0]
      await updateNonConformity(id, updates)
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const openCount = ncs.filter((n) => n.status !== 'resolvida' && n.status !== 'cancelada').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Qualidade Industrial</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova NC
        </Button>
      </div>
      {openCount > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50/50">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-700">
              {openCount} nao conformidade(s) em aberto
            </p>
          </CardContent>
        </Card>
      )}
      {checklists.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2">Checklists de Qualidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {checklists.map((c) => (
                <div key={c.id} className="p-2 bg-muted/30 rounded text-sm">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.expand?.product_id?.name || 'Geral'} • {(c.items || []).length} item(ns)
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ncs.map((nc) => (
          <Card key={nc.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold text-sm">{nc.description}</p>
                  {nc.expand?.production_order_id && (
                    <p className="text-xs text-muted-foreground">
                      OP: {nc.expand.production_order_id.order_number}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Badge className={SEVERITY_COLORS[nc.severity] || 'bg-gray-100'}>
                    {nc.severity}
                  </Badge>
                </div>
              </div>
              {nc.quantity_affected > 0 && (
                <p className="text-xs mb-1">Qtd afetada: {nc.quantity_affected}</p>
              )}
              {nc.root_cause && (
                <p className="text-xs text-muted-foreground mb-1">
                  <span className="font-medium">Causa:</span> {nc.root_cause}
                </p>
              )}
              {nc.corrective_action && (
                <p className="text-xs text-muted-foreground mb-1">
                  <span className="font-medium">Acao:</span> {nc.corrective_action}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{nc.status}</Badge>
                {(STATUS_FLOW[nc.status] || []).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange(nc.id, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Nao Conformidade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Descricao *</Label>
              <Textarea
                name="description"
                required
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Severidade</Label>
                <Select name="severity" defaultValue="media">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['baixa', 'media', 'alta', 'critica'].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Qtd Afetada</Label>
                <Input
                  name="quantity_affected"
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
            <div>
              <Label className="text-sm font-semibold">Causa Raiz</Label>
              <Textarea name="root_cause" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Acao Corretiva</Label>
              <Textarea
                name="corrective_action"
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
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

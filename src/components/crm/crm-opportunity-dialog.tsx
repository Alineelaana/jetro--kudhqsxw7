import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import {
  createOpportunity,
  updateOpportunity,
  generateOpportunityNumber,
  getFunnelStages,
  createHistoryEntry,
} from '@/services/crm'
import { useAuth } from '@/hooks/use-auth'
import { OPPORTUNITY_STATUS, type CrmOpportunity, type CrmFunnelStage } from '@/lib/crm-types'
import { Loader2, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function CrmOpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  opportunity: CrmOpportunity | null
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [stages, setStages] = useState<CrmFunnelStage[]>([])
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      getFunnelStages()
        .then(setStages)
        .catch(() => {})
      if (opportunity) {
        setForm({
          client_name: opportunity.client_name || '',
          title: opportunity.title || '',
          product_service: opportunity.product_service || '',
          estimated_value: opportunity.estimated_value || '0',
          probability: String(opportunity.probability || 0),
          open_date: opportunity.open_date || new Date().toISOString().split('T')[0],
          expected_close_date: opportunity.expected_close_date || '',
          stage_id: opportunity.stage_id || '',
          status: opportunity.status || 'Em Aberto',
          next_action: opportunity.next_action || '',
          observations: opportunity.observations || '',
          responsible_name: opportunity.responsible_name || user?.name || '',
          company: opportunity.company || 'Jetro',
          filial: opportunity.filial || 'Matriz',
        })
      } else {
        setForm({
          status: 'Em Aberto',
          open_date: new Date().toISOString().split('T')[0],
          probability: '0',
          estimated_value: '0',
          company: 'Jetro',
          filial: 'Matriz',
          responsible_name: user?.name || '',
        })
      }
    }
  }, [open, opportunity, user])

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const userName = (user?.name as string) || 'Sistema'
      const data: Record<string, unknown> = {
        ...form,
        responsible_id: opportunity?.responsible_id || user?.id || '',
        probability: parseInt(form.probability) || 0,
      }
      if (opportunity) {
        await updateOpportunity(opportunity.id, data)
      } else {
        const oppNum = await generateOpportunityNumber()
        data.opportunity_number = oppNum
        data.stage_entered_at = new Date().toISOString()
        const rec = await createOpportunity(data)
        await createHistoryEntry({
          entity_type: 'opportunity',
          entity_id: rec.id,
          entity_name: form.title,
          type: 'create',
          description: 'Oportunidade criada',
          user_name: userName,
          date: new Date().toISOString(),
          company: form.company,
          filial: form.filial,
        })
      }
      toast({ title: opportunity ? 'Oportunidade atualizada' : 'Oportunidade criada' })
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">
            {opportunity ? 'Editar' : 'Nova'} Oportunidade
            {opportunity ? ` — ${opportunity.opportunity_number}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-semibold">Título *</Label>
            <Input
              value={form.title || ''}
              onChange={(e) => update('title', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Cliente</Label>
            <Input
              value={form.client_name || ''}
              onChange={(e) => update('client_name', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Produto/Serviço</Label>
            <Input
              value={form.product_service || ''}
              onChange={(e) => update('product_service', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Valor Estimado (R$)</Label>
            <Input
              type="number"
              value={form.estimated_value || '0'}
              onChange={(e) => update('estimated_value', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Probabilidade (%)</Label>
            <Input
              type="number"
              value={form.probability || '0'}
              onChange={(e) => update('probability', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Etapa do Funil</Label>
            <Select value={form.stage_id || ''} onValueChange={(v) => update('stage_id', v)}>
              <SelectTrigger className="focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Status</Label>
            <Select value={form.status || 'Em Aberto'} onValueChange={(v) => update('status', v)}>
              <SelectTrigger className="focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Data de Abertura</Label>
            <Input
              type="date"
              value={form.open_date || ''}
              onChange={(e) => update('open_date', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Prev. Fechamento</Label>
            <Input
              type="date"
              value={form.expected_close_date || ''}
              onChange={(e) => update('expected_close_date', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Responsável</Label>
            <Input
              value={form.responsible_name || ''}
              onChange={(e) => update('responsible_name', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Próxima Ação</Label>
            <Input
              value={form.next_action || ''}
              onChange={(e) => update('next_action', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-semibold">Observações</Label>
            <Textarea
              value={form.observations || ''}
              onChange={(e) => update('observations', e.target.value)}
              rows={2}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { createActivity, updateActivity, createHistoryEntry } from '@/services/crm'
import { useAuth } from '@/hooks/use-auth'
import {
  ACTIVITY_TYPES,
  ACTIVITY_STATUS,
  ACTIVITY_PRIORITIES,
  type CrmActivity,
} from '@/lib/crm-types'
import { Loader2, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function CrmActivityDialog({
  open,
  onOpenChange,
  activity,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  activity: CrmActivity | null
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (activity) {
        setForm({
          type: activity.type || '',
          title: activity.title || '',
          client_name: activity.client_name || '',
          lead_id: activity.lead_id || '',
          opportunity_id: activity.opportunity_id || '',
          responsible_name: activity.responsible_name || user?.name || '',
          scheduled_date: activity.scheduled_date || new Date().toISOString().split('T')[0],
          scheduled_time: activity.scheduled_time || '09:00',
          duration_minutes: String(activity.duration_minutes || 30),
          priority: activity.priority || 'Normal',
          status: activity.status || 'Agendada',
          result: activity.result || '',
          follow_up_date: activity.follow_up_date || '',
          description: activity.description || '',
          company: activity.company || 'Velora Log',
          filial: activity.filial || 'Matriz',
        })
      } else {
        setForm({
          type: 'Ligação',
          priority: 'Normal',
          status: 'Agendada',
          scheduled_date: new Date().toISOString().split('T')[0],
          scheduled_time: '09:00',
          duration_minutes: '30',
          responsible_name: user?.name || '',
          company: 'Velora Log',
          filial: 'Matriz',
        })
      }
    }
  }, [open, activity, user])

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const isConcluded = form.status === 'Concluída'

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' })
      return
    }
    if (isConcluded && !form.result?.trim()) {
      toast({ title: 'Resultado é obrigatório ao concluir', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const userName = (user?.name as string) || 'Sistema'
      const data: Record<string, unknown> = {
        ...form,
        duration_minutes: parseInt(form.duration_minutes) || 30,
        responsible_id: activity?.responsible_id || user?.id || '',
        follow_up_required: isConcluded && !!form.follow_up_date,
      }
      if (activity) {
        await updateActivity(activity.id, data)
      } else {
        const rec = await createActivity(data)
        if (form.lead_id || form.client_name) {
          await createHistoryEntry({
            entity_type: 'lead',
            entity_id: form.lead_id || '',
            entity_name: form.client_name || '',
            type: 'activity',
            description: `Atividade: ${form.title} — ${form.type}`,
            user_name: userName,
            date: new Date().toISOString(),
            company: form.company,
            filial: form.filial,
          })
        }
      }
      toast({ title: activity ? 'Atividade atualizada' : 'Atividade criada' })
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
            {activity ? 'Editar' : 'Nova'} Atividade
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Tipo</Label>
            <Select value={form.type || 'Ligação'} onValueChange={(v) => update('type', v)}>
              <SelectTrigger className="focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Título *</Label>
            <Input
              value={form.title || ''}
              onChange={(e) => update('title', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Cliente / Lead</Label>
            <Input
              value={form.client_name || ''}
              onChange={(e) => update('client_name', e.target.value)}
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
            <Label className="text-sm font-semibold">Data</Label>
            <Input
              type="date"
              value={form.scheduled_date || ''}
              onChange={(e) => update('scheduled_date', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Horário</Label>
            <Input
              type="time"
              value={form.scheduled_time || ''}
              onChange={(e) => update('scheduled_time', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Duração (min)</Label>
            <Input
              type="number"
              value={form.duration_minutes || '30'}
              onChange={(e) => update('duration_minutes', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Prioridade</Label>
            <Select value={form.priority || 'Normal'} onValueChange={(v) => update('priority', v)}>
              <SelectTrigger className="focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Situação</Label>
            <Select value={form.status || 'Agendada'} onValueChange={(v) => update('status', v)}>
              <SelectTrigger className="focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isConcluded && (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-semibold text-[#005B2E]">Resultado *</Label>
                <Textarea
                  value={form.result || ''}
                  onChange={(e) => update('result', e.target.value)}
                  rows={2}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Próximo Contato</Label>
                <Input
                  type="date"
                  value={form.follow_up_date || ''}
                  onChange={(e) => update('follow_up_date', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-semibold">Observações</Label>
            <Textarea
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
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

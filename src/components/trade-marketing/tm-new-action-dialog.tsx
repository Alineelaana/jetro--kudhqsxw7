import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ACTION_TYPES, ACTION_STATUS } from '@/lib/trade-marketing-types'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface TmNewActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  userName: string
}

export function TmNewActionDialog({
  open,
  onOpenChange,
  onSaved,
  userName,
}: TmNewActionDialogProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    title: '',
    action_type: '',
    status: 'rascunho',
    start_date: '',
    end_date: '',
    budget_planned: '',
    responsible_name: userName || '',
  })

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error('Informe o título da ação')
      return
    }
    setSaving(true)
    try {
      await pb.collection('trade_marketing_actions').create({
        ...form,
        responsible_name: form.responsible_name || userName || '',
        created_by: userName || '',
      })
      toast.success('Ação criada com sucesso')
      onOpenChange(false)
      onSaved()
      setForm({
        title: '',
        action_type: '',
        status: 'rascunho',
        start_date: '',
        end_date: '',
        budget_planned: '',
        responsible_name: userName || '',
      })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Nova Ação de Trade Marketing</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nome da ação"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.action_type || ''}
                onValueChange={(v) => setForm({ ...form, action_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((t: any) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status || 'rascunho'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_STATUS.map((s: any) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Início</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Término</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div>
            <Label>Orçamento (R$)</Label>
            <Input
              type="number"
              value={form.budget_planned}
              onChange={(e) => setForm({ ...form, budget_planned: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div>
            <Label>Responsável</Label>
            <Input
              value={form.responsible_name}
              onChange={(e) => setForm({ ...form, responsible_name: e.target.value })}
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
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

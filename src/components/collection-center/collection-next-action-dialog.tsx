import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Save } from 'lucide-react'
import { NEXT_ACTION_TYPES, PRIORITIES } from '@/lib/collection-center-types'
import { saveNextAction } from '@/services/collection-center'
import { toast } from 'sonner'

export function CollectionNextActionDialog({
  open,
  onOpenChange,
  cliente,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cliente: string
  onSaved: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveNextAction(cliente, {
        type: form.type || '',
        date: form.date || '',
        time: form.time || '',
        priority: form.priority || 'Baixa',
        responsible: form.responsible || '',
      })
      toast.success('Próxima ação definida')
      onOpenChange(false)
      setForm({})
      onSaved()
    } catch {
      toast.error('Erro ao definir próxima ação')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Próxima Ação — {cliente}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Ação *</Label>
            <Select value={form.type || ''} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {NEXT_ACTION_TYPES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Data</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={form.date || ''}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Horário</Label>
              <Input
                type="time"
                className="h-9 text-sm"
                value={form.time || ''}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Prioridade</Label>
              <Select
                value={form.priority || ''}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Responsável</Label>
              <Input
                className="h-9 text-sm"
                value={form.responsible || ''}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
              />
            </div>
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
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}{' '}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

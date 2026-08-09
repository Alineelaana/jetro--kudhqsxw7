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
import { createNetwork, updateNetwork, type ClientNetwork } from '@/services/client-networks'
import { Loader2, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  network: Partial<ClientNetwork> | null
  onSaved: (network: ClientNetwork) => void
}

const POLICIES = [
  { value: 'alert', label: 'Alertar' },
  { value: 'block', label: 'Bloquear' },
  { value: 'require_approval', label: 'Exigir Aprovação' },
]

export function NetworkFormDialog({ open, onOpenChange, network, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(
      network
        ? ({ ...network } as Record<string, string>)
        : { status: 'Ativa', restriction_policy: 'alert' },
    )
  }, [network, open])

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const result = network?.id ? await updateNetwork(network.id, form) : await createNetwork(form)
      toast({ title: network?.id ? 'Rede atualizada' : 'Rede criada' })
      onSaved(result as ClientNetwork)
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">
            {network?.id ? 'Editar Rede' : 'Nova Rede/Grupo Econômico'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nome da Rede *</Label>
            <Input
              value={form.name || ''}
              onChange={(e) => set('name', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Razão/Nome Corporativo</Label>
            <Input
              value={form.corporate_name || ''}
              onChange={(e) => set('corporate_name', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Responsável</Label>
            <Input
              value={form.responsible || ''}
              onChange={(e) => set('responsible', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Telefone</Label>
            <Input
              value={form.contact_phone || ''}
              onChange={(e) => set('contact_phone', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">E-mail</Label>
            <Input
              value={form.contact_email || ''}
              onChange={(e) => set('contact_email', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Comprador Principal</Label>
            <Input
              value={form.main_buyer || ''}
              onChange={(e) => set('main_buyer', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Gerente/RCA</Label>
            <Input
              value={form.manager_rca || ''}
              onChange={(e) => set('manager_rca', e.target.value)}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Limite de Crédito</Label>
            <Input
              value={form.credit_limit || ''}
              onChange={(e) => set('credit_limit', e.target.value)}
              placeholder="R$ 0,00"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={form.status || 'Ativa'} onValueChange={(v) => set('status', v)}>
              <SelectTrigger className="focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Inativa">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Política de Restrição</Label>
            <Select
              value={form.restriction_policy || 'alert'}
              onValueChange={(v) => set('restriction_policy', v)}
            >
              <SelectTrigger className="focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POLICIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={form.observations || ''}
              onChange={(e) => set('observations', e.target.value)}
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
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
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

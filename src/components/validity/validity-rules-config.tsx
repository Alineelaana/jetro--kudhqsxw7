import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Pencil, Trash2, Loader2, Power } from 'lucide-react'
import {
  getValidityRules,
  createValidityRule,
  updateValidityRule,
  deleteValidityRule,
} from '@/services/validity-rules'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { MODULE_OPTIONS } from '@/lib/validity-types'
import { canConfigureValidityRules } from '@/lib/validity-permissions'
import { useAuth } from '@/hooks/use-auth'
import type { ValidityRule } from '@/lib/validity-types'

export function ValidityRulesConfig() {
  const { userRole } = useAuth()
  const [rules, setRules] = useState<ValidityRule[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ValidityRule | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ active: 'true' })

  const canEdit = canConfigureValidityRules(userRole)

  const load = async () => {
    setLoading(true)
    try {
      setRules(await getValidityRules())
    } catch {
      setRules([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('validity_rules', () => load())

  const handleNew = () => {
    setEditing(null)
    setForm({
      active: 'true',
      antecedent_days: '60,30,15,7,0',
      recurrence_days: '7',
      channels: 'in_app,email',
    })
    setFormOpen(true)
  }
  const handleEdit = (r: ValidityRule) => {
    setEditing(r)
    setForm({
      name: r.name,
      module: r.module,
      entity_type: r.entity_type,
      entity_label: r.entity_label,
      validity_field: r.validity_field,
      antecedent_days: Array.isArray(r.antecedent_days) ? r.antecedent_days.join(',') : '',
      criticidade_mapping: JSON.stringify(r.criticidade_mapping, null, 2),
      recipients: JSON.stringify(r.recipients, null, 2),
      escalation_config: JSON.stringify(r.escalation_config, null, 2),
      recurrence_days: String(r.recurrence_days || 7),
      channels: Array.isArray(r.channels) ? r.channels.join(',') : '',
      active: r.active !== false ? 'true' : 'false',
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        name: form.name,
        module: form.module,
        entity_type: form.entity_type,
        entity_label: form.entity_label || '',
        validity_field: form.validity_field,
        antecedent_days: JSON.stringify(
          form.antecedent_days
            ?.split(',')
            .map((d) => parseInt(d.trim(), 10))
            .filter((n) => !isNaN(n)) || [],
        ),
        criticidade_mapping: form.criticidade_mapping || '{}',
        recipients: form.recipients || '{}',
        escalation_config: form.escalation_config || '{}',
        recurrence_days: parseInt(form.recurrence_days || '7', 10),
        channels: JSON.stringify(form.channels?.split(',').map((c) => c.trim()) || []),
        active: form.active === 'true',
      }
      if (editing) await updateValidityRule(editing.id, data as Partial<ValidityRule>)
      else await createValidityRule(data as Partial<ValidityRule>)
      toast({ title: editing ? 'Atualizado' : 'Criado' })
      setFormOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleToggle = async (r: ValidityRule) => {
    try {
      await updateValidityRule(r.id, { active: !r.active })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }
  const handleDelete = async (r: ValidityRule) => {
    try {
      await deleteValidityRule(r.id)
      toast({ title: 'Excluído' })
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
        <h2 className="text-xl font-black text-[#005B2E]">Regras de Validade</h2>
        {canEdit && (
          <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {rules.map((r) => (
          <Card key={r.id} className="border-2 border-[#005B2E]/10">
            <CardContent className="py-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.name}</span>
                  <Badge variant="outline">{r.module}</Badge>
                  <Badge variant="outline">{r.entity_type}</Badge>
                  {!r.active && <Badge className="bg-gray-200 text-gray-600">Inativa</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Campo: {r.validity_field} · Antecedência:{' '}
                  {Array.isArray(r.antecedent_days) ? r.antecedent_days.join(', ') : ''} dias
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(r)}
                    className="text-[#005B2E]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(r)}
                    className="text-orange-600"
                  >
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(r)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Nova'} Regra de Validade
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Módulo *</Label>
              <Select
                value={form.module || ''}
                onValueChange={(v) => setForm((p) => ({ ...p, module: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {MODULE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tipo de Entidade (collection) *</Label>
              <Input
                value={form.entity_type || ''}
                onChange={(e) => setForm((p) => ({ ...p, entity_type: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Campo de Validade *</Label>
              <Input
                value={form.validity_field || ''}
                onChange={(e) => setForm((p) => ({ ...p, validity_field: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Dias de Antecedência (vírgula)</Label>
              <Input
                value={form.antecedent_days || ''}
                onChange={(e) => setForm((p) => ({ ...p, antecedent_days: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Recorrência (dias)</Label>
              <Input
                type="number"
                value={form.recurrence_days || ''}
                onChange={(e) => setForm((p) => ({ ...p, recurrence_days: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Mapeamento de Criticidade (JSON)</Label>
              <Textarea
                value={form.criticidade_mapping || ''}
                onChange={(e) => setForm((p) => ({ ...p, criticidade_mapping: e.target.value }))}
                rows={3}
                className="focus-visible:ring-[#005B2E] font-mono text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Recipientes (JSON)</Label>
              <Textarea
                value={form.recipients || ''}
                onChange={(e) => setForm((p) => ({ ...p, recipients: e.target.value }))}
                rows={4}
                className="focus-visible:ring-[#005B2E] font-mono text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Escalonamento (JSON)</Label>
              <Textarea
                value={form.escalation_config || ''}
                onChange={(e) => setForm((p) => ({ ...p, escalation_config: e.target.value }))}
                rows={3}
                className="focus-visible:ring-[#005B2E] font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label>Canais (vírgula)</Label>
              <Input
                value={form.channels || ''}
                onChange={(e) => setForm((p) => ({ ...p, channels: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.active === 'true'}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v ? 'true' : 'false' }))}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <Label>{form.active === 'true' ? 'Ativo' : 'Inativo'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

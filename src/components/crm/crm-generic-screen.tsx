import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  getLossReasons,
  createLossReason,
  updateLossReason,
  deleteLossReason,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
} from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import {
  GOAL_TYPES,
  GOAL_DIMENSIONS,
  AUTOMATION_TRIGGERS,
  AUTOMATION_ACTIONS,
} from '@/lib/crm-types'
import { Plus, Pencil, Trash2, Loader2, Power } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FieldDef {
  name: string
  label: string
  type: 'text' | 'select' | 'bool'
  options?: readonly string[]
  required?: boolean
}

const CONFIGS: Record<
  string,
  {
    fields: FieldDef[]
    load: () => Promise<any[]>
    create: (d: Record<string, unknown>) => Promise<any>
    update: (id: string, d: Record<string, unknown>) => Promise<any>
    del: (id: string) => Promise<unknown>
    collection: string
  }
> = {
  crm_loss_reasons: {
    collection: 'crm_loss_reasons',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'active', label: 'Ativo', type: 'bool' },
    ],
    load: getLossReasons,
    create: createLossReason,
    update: updateLossReason,
    del: deleteLossReason,
  },
  crm_goals: {
    collection: 'crm_goals',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'type', label: 'Tipo', type: 'select', options: GOAL_TYPES },
      { name: 'target_value', label: 'Meta', type: 'text' },
      { name: 'realized_value', label: 'Realizado', type: 'text' },
      { name: 'period', label: 'Período', type: 'text' },
      { name: 'responsible_name', label: 'Responsável', type: 'text' },
      { name: 'active', label: 'Ativo', type: 'bool' },
    ],
    load: getGoals,
    create: createGoal,
    update: updateGoal,
    del: deleteGoal,
  },
  crm_automation_rules: {
    collection: 'crm_automation_rules',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      {
        name: 'trigger',
        label: 'Gatilho',
        type: 'select',
        options: [...AUTOMATION_TRIGGERS, ...AUTOMATION_ACTIONS],
      },
      { name: 'active', label: 'Ativo', type: 'bool' },
    ],
    load: getAutomationRules,
    create: createAutomationRule,
    update: updateAutomationRule,
    del: deleteAutomationRule,
  },
}

export function CrmGenericScreen({ collection, label }: { collection: string; label: string }) {
  const config = CONFIGS[collection]
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})

  const load = async () => {
    if (!config) {
      setLoading(false)
      return
    }
    try {
      setItems(await config.load())
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [collection])
  useRealtime(collection, () => load())

  if (!config)
    return <p className="text-center text-muted-foreground py-12">Configuração não encontrada.</p>

  const handleNew = () => {
    setEditing(null)
    setForm({ active: true })
    setOpen(true)
  }
  const handleEdit = (r: Record<string, unknown>) => {
    setEditing(r)
    setForm({ ...r })
    setOpen(true)
  }

  const handleSave = async () => {
    const nameField = config.fields.find((f) => f.required)
    if (nameField && !String(form[nameField.name] || '').trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    try {
      if (editing) await config.update(String(editing.id), form)
      else await config.create(form)
      toast({ title: editing ? 'Atualizado' : 'Criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleToggle = async (r: Record<string, unknown>) => {
    try {
      await config.update(String(r.id), { active: !(r.active !== false) })
      load()
    } catch {
      /* noop */
    }
  }
  const handleDelete = async (r: Record<string, unknown>) => {
    try {
      await config.del(String(r.id))
      toast({ title: 'Excluído' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} registro(s)</p>
        <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  {config.fields.map((f) => (
                    <th key={f.name} className="text-left px-3 py-3 font-bold">
                      {f.label}
                    </th>
                  ))}
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={String(r.id)} className="border-b border-border hover:bg-[#005B2E]/5">
                    {config.fields.map((f) => (
                      <td key={f.name} className="px-3 py-2">
                        {f.type === 'bool' ? (
                          <span
                            className={cn(
                              'text-xs font-bold',
                              r[f.name] !== false ? 'text-emerald-600' : 'text-gray-500',
                            )}
                          >
                            {r[f.name] !== false ? 'Ativo' : 'Inativo'}
                          </span>
                        ) : f.type === 'select' ? (
                          <span className="text-xs">{String(r[f.name] || '—')}</span>
                        ) : (
                          <span className="text-sm font-medium">{String(r[f.name] || '—')}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(r)}
                          className="text-[#005B2E] h-8 w-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggle(r)}
                          className="text-orange-600 h-8 w-8 p-0"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r)}
                          className="text-red-600 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} {label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {config.fields.map((f) => (
              <div key={f.name}>
                <Label>
                  {f.label}
                  {f.required ? ' *' : ''}
                </Label>
                {f.type === 'bool' ? (
                  <div className="flex items-center gap-3 pt-1">
                    <Switch
                      checked={form[f.name] !== false}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, [f.name]: v }))}
                      className="data-[state=checked]:bg-[#005B2E]"
                    />
                    <span className="text-sm">{form[f.name] !== false ? 'Ativo' : 'Inativo'}</span>
                  </div>
                ) : f.type === 'select' ? (
                  <Select
                    value={String(form[f.name] || '')}
                    onValueChange={(v) => setForm((p) => ({ ...p, [f.name]: v }))}
                  >
                    <SelectTrigger className="focus-visible:ring-[#005B2E]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {(f.options || []).map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={String(form[f.name] || '')}
                    onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                    className="focus-visible:ring-[#005B2E]"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

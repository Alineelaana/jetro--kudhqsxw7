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
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { logCRMAudit } from '@/services/crm'
import { Plus, Pencil, Trash2, Loader2, Power } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FunnelConfig {
  id: string
  name: string
  funnel_type: string
  company: string
  team: string
  segment: string
  active: boolean
}
const FUNNEL_TYPES = ['geral', 'empresa', 'equipe', 'segmento']

export function CrmFunnelConfig() {
  const [items, setItems] = useState<FunnelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FunnelConfig | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({ active: true, funnel_type: 'geral' })

  const load = async () => {
    try {
      setItems(await pb.collection('crm_funnel_configurations').getFullList({ sort: '-created' }))
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_funnel_configurations', () => load())

  const handleNew = () => {
    setEditing(null)
    setForm({ active: true, funnel_type: 'geral' })
    setOpen(true)
  }
  const handleEdit = (r: FunnelConfig) => {
    setEditing(r)
    setForm({ ...r })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!String(form.name || '').trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    try {
      if (editing) {
        await pb.collection('crm_funnel_configurations').update(editing.id, form)
        logCRMAudit('update', 'funnel_configurations', editing.id, `Funil atualizado: ${form.name}`)
      } else {
        const rec = await pb.collection('crm_funnel_configurations').create(form)
        logCRMAudit('create', 'funnel_configurations', rec.id, `Funil criado: ${form.name}`)
      }
      toast({ title: editing ? 'Atualizado' : 'Criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleToggle = async (r: FunnelConfig) => {
    try {
      await pb.collection('crm_funnel_configurations').update(r.id, { active: !r.active })
      load()
    } catch {
      /* noop */
    }
  }
  const handleDelete = async (r: FunnelConfig) => {
    try {
      await pb.collection('crm_funnel_configurations').delete(r.id)
      logCRMAudit('delete', 'funnel_configurations', r.id, `Funil excluído: ${r.name}`)
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
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} registro(s)</p>
        <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Funil
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Nome</th>
                <th className="text-left px-3 py-3 font-bold">Tipo</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Empresa</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Equipe</th>
                <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Segmento</th>
                <th className="text-left px-3 py-3 font-bold">Ativo</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 text-xs">{r.funnel_type || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.company || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.team || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden lg:table-cell">{r.segment || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'text-xs font-bold',
                        r.active !== false ? 'text-emerald-600' : 'text-gray-500',
                      )}
                    >
                      {r.active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} Funil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={String(form.name || '')}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={String(form.funnel_type || 'geral')}
                onValueChange={(v) => setForm((p) => ({ ...p, funnel_type: v }))}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNNEL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Empresa</Label>
              <Input
                value={String(form.company || '')}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Equipe</Label>
              <Input
                value={String(form.team || '')}
                onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Segmento</Label>
              <Input
                value={String(form.segment || '')}
                onChange={(e) => setForm((p) => ({ ...p, segment: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.active !== false}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <span className="text-sm">{form.active !== false ? 'Ativo' : 'Inativo'}</span>
            </div>
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

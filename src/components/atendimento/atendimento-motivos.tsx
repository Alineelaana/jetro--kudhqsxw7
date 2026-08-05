import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  getMotivos,
  getSetores,
  createMotivo,
  updateMotivo,
  deleteMotivo,
} from '@/services/atendimento'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canManageMotivos } from '@/lib/atendimento-permissions'
import { Plus, Pencil, Trash2, Loader2, Power } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { MotivoRecord, SetorRecord } from '@/lib/atendimento-types'

export function AtendimentoMotivos() {
  const { user } = useAuth()
  const [items, setItems] = useState<MotivoRecord[]>([])
  const [setores, setSetores] = useState<SetorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MotivoRecord | null>(null)
  const [form, setForm] = useState({ nome: '', setor_id: '', sla_horas: '24', active: true })

  const load = async () => {
    try {
      const [m, s] = await Promise.all([getMotivos(), getSetores()])
      setItems(m)
      setSetores(s)
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('atendimento_motivos', () => load())

  const canManage = canManageMotivos(user?.role as string)

  const handleNew = () => {
    setEditing(null)
    setForm({ nome: '', setor_id: '', sla_horas: '24', active: true })
    setOpen(true)
  }
  const handleEdit = (r: MotivoRecord) => {
    setEditing(r)
    setForm({
      nome: r.nome,
      setor_id: r.setor_id,
      sla_horas: String(r.sla_horas || 24),
      active: r.active,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' })
      return
    }
    try {
      const data = {
        nome: form.nome,
        setor_id: form.setor_id,
        sla_horas: parseInt(form.sla_horas) || 24,
        active: form.active,
      }
      if (editing) await updateMotivo(editing.id, data)
      else await createMotivo(data)
      toast({ title: editing ? 'Atualizado' : 'Criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleToggle = async (r: MotivoRecord) => {
    try {
      await updateMotivo(r.id, { active: !r.active })
      load()
    } catch {
      /* noop */
    }
  }
  const handleDelete = async (r: MotivoRecord) => {
    try {
      await deleteMotivo(r.id)
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
        <p className="text-sm text-muted-foreground">{items.length} motivo(s)</p>
        {canManage && (
          <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
            <Plus className="w-4 h-4 mr-2" /> Novo
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Nome</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Setor</th>
                <th className="text-left px-3 py-3 font-bold">SLA (h)</th>
                <th className="text-left px-3 py-3 font-bold">Ativo</th>
                {canManage && <th className="text-center px-3 py-3 font-bold">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-medium">{r.nome}</td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {setores.find((s) => s.id === r.setor_id)?.nome || '—'}
                  </td>
                  <td className="px-3 py-2">{r.sla_horas || 24}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        r.active !== false
                          ? 'text-xs font-bold text-emerald-600'
                          : 'text-xs font-bold text-gray-500'
                      }
                    >
                      {r.active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {canManage && (
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
                  )}
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
              {editing ? 'Editar' : 'Novo'} Motivo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Setor</Label>
              <Select
                value={form.setor_id}
                onValueChange={(v) => setForm((p) => ({ ...p, setor_id: v }))}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SLA (horas)</Label>
              <Input
                type="number"
                value={form.sla_horas}
                onChange={(e) => setForm((p) => ({ ...p, sla_horas: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <Label>{form.active ? 'Ativo' : 'Inativo'}</Label>
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

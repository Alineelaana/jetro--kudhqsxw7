import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
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
  getFluxos,
  createFluxo,
  updateFluxo,
  deleteFluxo,
  getMotivos,
  getSetores,
} from '@/services/atendimento'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canManageFlows } from '@/lib/atendimento-permissions'
import { Plus, Pencil, Trash2, Loader2, Power, Workflow } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { FluxoRecord, MotivoRecord, SetorRecord } from '@/lib/atendimento-types'

const FLUXO_STATUS_OPTS = ['Ativo', 'Inativo', 'Em Configuração'] as const

export function AtendimentoFluxos() {
  const { user } = useAuth()
  const [items, setItems] = useState<FluxoRecord[]>([])
  const [motivos, setMotivos] = useState<MotivoRecord[]>([])
  const [setores, setSetores] = useState<SetorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FluxoRecord | null>(null)
  const [form, setForm] = useState({
    nome: '',
    motivo_id: '',
    setor_id: '',
    prioridade: 'Normal',
    sla_hours: '24',
    status: 'Em Configuração',
  })

  const load = async () => {
    try {
      const [f, m, s] = await Promise.all([getFluxos(), getMotivos(), getSetores()])
      setItems(f as FluxoRecord[])
      setMotivos(m as MotivoRecord[])
      setSetores(s as SetorRecord[])
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('atendimento_fluxos', () => load())

  const canManage = canManageFlows(user?.role as string)

  const handleNew = () => {
    setEditing(null)
    setForm({
      nome: '',
      motivo_id: '',
      setor_id: '',
      prioridade: 'Normal',
      sla_hours: '24',
      status: 'Em Configuração',
    })
    setOpen(true)
  }
  const handleEdit = (r: FluxoRecord) => {
    setEditing(r)
    setForm({
      nome: r.nome,
      motivo_id: r.motivo_id,
      setor_id: r.setor_id,
      prioridade: r.prioridade || 'Normal',
      sla_hours: String(r.sla_hours || 24),
      status: r.status || 'Em Configuração',
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
        motivo_id: form.motivo_id,
        setor_id: form.setor_id,
        prioridade: form.prioridade,
        sla_hours: parseInt(form.sla_hours) || 24,
        status: form.status,
      }
      if (editing) await updateFluxo(editing.id, data)
      else await createFluxo(data)
      toast({ title: editing ? 'Atualizado' : 'Criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleToggle = async (r: FluxoRecord) => {
    try {
      const newStatus = r.status === 'Ativo' ? 'Inativo' : 'Ativo'
      await updateFluxo(r.id, { status: newStatus })
      load()
    } catch {
      /* noop */
    }
  }
  const handleDelete = async (r: FluxoRecord) => {
    try {
      await deleteFluxo(r.id)
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
        <p className="text-sm text-muted-foreground">{items.length} fluxo(s)</p>
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
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Motivo</th>
                <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Setor</th>
                <th className="text-left px-3 py-3 font-bold">SLA (h)</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                {canManage && <th className="text-center px-3 py-3 font-bold">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    <Workflow className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Nenhum fluxo cadastrado
                  </td>
                </tr>
              )}
              {items.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-medium">{r.nome}</td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {motivos.find((m) => m.id === r.motivo_id)?.nome || '—'}
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    {setores.find((s) => s.id === r.setor_id)?.nome || '—'}
                  </td>
                  <td className="px-3 py-2">{r.sla_hours || 24}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        r.status === 'Ativo'
                          ? 'text-xs font-bold text-emerald-600'
                          : r.status === 'Em Configuração'
                            ? 'text-xs font-bold text-orange-600'
                            : 'text-xs font-bold text-gray-500'
                      }
                    >
                      {r.status || 'Inativo'}
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
              {editing ? 'Editar' : 'Novo'} Fluxo
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
              <Label>Motivo</Label>
              <Select
                value={form.motivo_id}
                onValueChange={(v) => setForm((p) => ({ ...p, motivo_id: v }))}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {motivos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Prioridade</Label>
              <Select
                value={form.prioridade}
                onValueChange={(v) => setForm((p) => ({ ...p, prioridade: v }))}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SLA (horas)</Label>
              <Input
                type="number"
                value={form.sla_hours}
                onChange={(e) => setForm((p) => ({ ...p, sla_hours: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {FLUXO_STATUS_OPTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

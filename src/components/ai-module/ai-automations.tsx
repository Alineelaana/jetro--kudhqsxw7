import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getAutomations, createAutomation, updateAutomation } from '@/services/ai-module'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canCreateAutomations, canActivateAutomations } from '@/lib/ai-permissions'
import { AUTOMATION_STATUS, AUTOMATION_START_EVENTS, type AiAutomation } from '@/lib/ai-types'
import { Plus, Zap, Loader2, Power, Pause, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  Ativa: 'bg-green-100 text-green-700',
  Pausada: 'bg-yellow-100 text-yellow-700',
  Rascunho: 'bg-blue-100 text-blue-700',
  'Em Teste': 'bg-purple-100 text-purple-700',
  'Com Erro': 'bg-red-100 text-red-700',
  Inativa: 'bg-gray-100 text-gray-600',
}

export function AiAutomations() {
  const { user } = useAuth()
  const [items, setItems] = useState<AiAutomation[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AiAutomation | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_event: 'Ao criar um registro',
    priority: 'Normal',
    status: 'Rascunho',
    frequency: '',
    schedule: '',
  })

  const load = async () => {
    try {
      setItems(await getAutomations())
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('ai_automations', () => load())

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      description: '',
      start_event: 'Ao criar um registro',
      priority: 'Normal',
      status: 'Rascunho',
      frequency: '',
      schedule: '',
    })
    setOpen(true)
  }
  const openEdit = (a: AiAutomation) => {
    setEditing(a)
    setForm({
      name: a.name,
      description: a.description || '',
      start_event: a.start_event || '',
      priority: a.priority || 'Normal',
      status: a.status,
      frequency: a.frequency || '',
      schedule: a.schedule || '',
    })
    setOpen(true)
  }
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nome obrigatório')
      return
    }
    try {
      if (editing) await updateAutomation(editing.id, form)
      else
        await createAutomation({
          ...form,
          conditions: [],
          actions: [],
          responsible: user?.name || '',
          empresa: '',
          filial: '',
          run_count: 0,
        })
      toast.success('Automação salva')
      setOpen(false)
      load()
    } catch {
      toast.error('Erro')
    }
  }
  const toggle = async (a: AiAutomation) => {
    const ns = a.status === 'Ativa' ? 'Pausada' : 'Ativa'
    try {
      await updateAutomation(a.id, { status: ns })
      load()
      toast.success(ns === 'Ativa' ? 'Ativada' : 'Pausada')
    } catch {
      toast.error('Erro')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      {canCreateAutomations(user?.role as string) && (
        <Button onClick={openCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Automação
        </Button>
      )}
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma automação cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((a) => (
            <Card key={a.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#C89B3C]" />
                    <p className="font-bold text-sm">{a.name}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[a.status] || ''}`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{a.description || 'Sem descrição'}</p>
                <p className="text-xs">
                  <span className="font-bold">Início:</span> {a.start_event || '—'}
                </p>
                <p className="text-xs">
                  <span className="font-bold">Prioridade:</span> {a.priority || 'Normal'}
                </p>
                {a.last_run && (
                  <p className="text-xs text-muted-foreground">
                    Última execução: {new Date(a.last_run).toLocaleString('pt-BR')}
                  </p>
                )}
                <div className="flex gap-1 pt-2">
                  {canCreateAutomations(user?.role as string) && (
                    <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {canActivateAutomations(user?.role as string) && (
                    <Button size="sm" variant="ghost" onClick={() => toggle(a)}>
                      {a.status === 'Ativa' ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Automação' : 'Nova Automação'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Evento de Início</Label>
              <Select
                value={form.start_event}
                onValueChange={(v) => setForm({ ...form, start_event: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUTOMATION_START_EVENTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Baixa', 'Normal', 'Alta', 'Urgente'].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequência</Label>
              <Input
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                placeholder="Ex: Diária, Semanal..."
              />
            </div>
            <div>
              <Label>Horário</Label>
              <Input
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                placeholder="Ex: 09:00"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUTOMATION_STATUS.map((s) => (
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

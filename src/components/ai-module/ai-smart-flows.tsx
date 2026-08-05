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
import { getSmartFlows, createSmartFlow, updateSmartFlow } from '@/services/ai-module'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canCreateFlows, canEditFlows } from '@/lib/ai-permissions'
import { FLOW_STAGES, FLOW_TYPES, type AiSmartFlow } from '@/lib/ai-types'
import { Plus, GitBranch, Loader2, Pencil, Play, Pause, Copy, FileText } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  Ativo: 'bg-green-100 text-green-700',
  Pausado: 'bg-yellow-100 text-yellow-700',
  Rascunho: 'bg-blue-100 text-blue-700',
  'Em Teste': 'bg-purple-100 text-purple-700',
  Arquivado: 'bg-gray-100 text-gray-600',
}

export function AiSmartFlows() {
  const { user } = useAuth()
  const [items, setItems] = useState<AiSmartFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AiSmartFlow | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    flow_type: 'Atendimento',
    status: 'Rascunho',
  })

  const load = async () => {
    try {
      setItems(await getSmartFlows())
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('ai_smart_flows', () => load())

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', flow_type: 'Atendimento', status: 'Rascunho' })
    setOpen(true)
  }
  const openEdit = (f: AiSmartFlow) => {
    setEditing(f)
    setForm({
      name: f.name,
      description: f.description || '',
      flow_type: f.flow_type || 'Atendimento',
      status: f.status,
    })
    setOpen(true)
  }
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nome obrigatório')
      return
    }
    try {
      if (editing) await updateSmartFlow(editing.id, form)
      else
        await createSmartFlow({
          ...form,
          stages: FLOW_STAGES.map((s) => ({ name: s, config: {} })),
          version: 1,
          responsible: user?.name || '',
          empresa: '',
          filial: '',
          execution_history: [],
        })
      toast.success('Fluxo salvo')
      setOpen(false)
      load()
    } catch {
      toast.error('Erro')
    }
  }
  const toggle = async (f: AiSmartFlow) => {
    const ns = f.status === 'Ativo' ? 'Pausado' : 'Ativo'
    try {
      await updateSmartFlow(f.id, { status: ns })
      load()
      toast.success(ns === 'Ativo' ? 'Ativado' : 'Pausado')
    } catch {
      toast.error('Erro')
    }
  }
  const duplicate = async (f: AiSmartFlow) => {
    try {
      await createSmartFlow({
        name: `${f.name} (cópia)`,
        description: f.description,
        flow_type: f.flow_type,
        status: 'Rascunho',
        stages: f.stages || [],
        version: 1,
        responsible: user?.name || '',
        empresa: '',
        filial: '',
        execution_history: [],
      })
      toast.success('Fluxo duplicado')
      load()
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
      <div className="flex flex-wrap gap-2">
        {canCreateFlows(user?.role as string) && (
          <Button onClick={openCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
            <Plus className="w-4 h-4 mr-2" /> Novo Fluxo
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum fluxo inteligente criado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((f) => (
            <Card key={f.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-[#005B2E]" />
                    <div>
                      <p className="font-bold text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.flow_type}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[f.status] || ''}`}
                  >
                    {f.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{f.description || 'Sem descrição'}</p>
                <p className="text-xs">
                  <span className="font-bold">Versão:</span> {f.version || 1}
                </p>
                <p className="text-xs">
                  <span className="font-bold">Etapas:</span> {f.stages?.length || 0}
                </p>
                <div className="flex gap-1 pt-2">
                  {canEditFlows(user?.role as string) && (
                    <Button size="sm" variant="ghost" onClick={() => openEdit(f)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => toggle(f)}>
                    {f.status === 'Ativo' ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  {canCreateFlows(user?.role as string) && (
                    <Button size="sm" variant="ghost" onClick={() => duplicate(f)}>
                      <Copy className="w-3.5 h-3.5" />
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
            <DialogTitle>{editing ? 'Editar Fluxo' : 'Novo Fluxo Inteligente'}</DialogTitle>
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
              <Label>Tipo de Fluxo</Label>
              <Select
                value={form.flow_type}
                onValueChange={(v) => setForm({ ...form, flow_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLOW_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Rascunho', 'Em Teste', 'Ativo', 'Pausado', 'Arquivado'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Etapas disponíveis</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {FLOW_STAGES.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded bg-[#005B2E]/10 text-[#005B2E]"
                  >
                    {s}
                  </span>
                ))}
              </div>
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

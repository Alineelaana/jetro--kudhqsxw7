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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getAgents, createAgent, updateAgent } from '@/services/ai-module'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canCreateAgents, canEditAgents, canActivateAgents } from '@/lib/ai-permissions'
import { AGENT_TYPES, AGENT_STATUS, type AiAgent } from '@/lib/ai-types'
import { Plus, Bot, Loader2, Power, Pause, Copy, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  Ativo: 'bg-green-100 text-green-700',
  Pausado: 'bg-yellow-100 text-yellow-700',
  'Em Configuração': 'bg-blue-100 text-blue-700',
  'Em Teste': 'bg-purple-100 text-purple-700',
  'Com Erro': 'bg-red-100 text-red-700',
  Inativo: 'bg-gray-100 text-gray-600',
}

export function AiAgents() {
  const { user } = useAuth()
  const [agents, setAgents] = useState<AiAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AiAgent | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    objective: '',
    agent_type: 'Atendimento ao Cliente',
    module: '',
    status: 'Em Configuração',
  })

  const load = async () => {
    try {
      setAgents(await getAgents())
    } catch {
      setAgents([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('ai_agents', () => load())

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      description: '',
      objective: '',
      agent_type: 'Atendimento ao Cliente',
      module: '',
      status: 'Em Configuração',
    })
    setDialogOpen(true)
  }

  const openEdit = (a: AiAgent) => {
    setEditing(a)
    setForm({
      name: a.name,
      description: a.description || '',
      objective: a.objective || '',
      agent_type: a.agent_type || '',
      module: a.module || '',
      status: a.status,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    try {
      if (editing) {
        await updateAgent(editing.id, form)
      } else {
        await createAgent({
          ...form,
          knowledge_base: [],
          allowed_tools: [],
          permissions: {},
          identity: {},
          objectives: {},
          integrations: {},
          working_hours: '24/7',
          responsible: user?.name || '',
        })
      }
      toast.success(editing ? 'Agente atualizado' : 'Agente criado')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const toggleStatus = async (a: AiAgent) => {
    const newStatus = a.status === 'Ativo' ? 'Pausado' : 'Ativo'
    try {
      await updateAgent(a.id, { status: newStatus })
      load()
      toast.success(`Agente ${newStatus === 'Ativo' ? 'ativado' : 'pausado'}`)
    } catch {
      toast.error('Erro')
    }
  }

  const duplicate = async (a: AiAgent) => {
    try {
      await createAgent({
        name: `${a.name} (cópia)`,
        description: a.description,
        objective: a.objective,
        agent_type: a.agent_type,
        module: a.module,
        status: 'Em Configuração',
        knowledge_base: [],
        allowed_tools: [],
        permissions: {},
        identity: {},
        objectives: {},
        integrations: {},
        working_hours: a.working_hours || '24/7',
        responsible: user?.name || '',
      })
      toast.success('Agente duplicado')
      load()
    } catch {
      toast.error('Erro ao duplicar')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canCreateAgents(user?.role as string) && (
        <Button onClick={openCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Agente
        </Button>
      )}
      {agents.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum agente cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => (
            <Card key={a.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#005B2E]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.agent_type || 'Geral'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {a.description || 'Sem descrição'}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold">Módulo:</span> {a.module || '—'}
                </p>
                <div className="flex gap-1 pt-2">
                  {canEditAgents(user?.role as string) && (
                    <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {canActivateAgents(user?.role as string) && (
                    <Button size="sm" variant="ghost" onClick={() => toggleStatus(a)}>
                      {a.status === 'Ativo' ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  )}
                  {canCreateAgents(user?.role as string) && (
                    <Button size="sm" variant="ghost" onClick={() => duplicate(a)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Agente' : 'Novo Agente'}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="identity">
            <TabsList className="w-full flex-wrap">
              <TabsTrigger value="identity">Identidade</TabsTrigger>
              <TabsTrigger value="objectives">Objetivos</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
            </TabsList>
            <TabsContent value="identity" className="space-y-3">
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
                <Label>Tipo de Agente</Label>
                <Select
                  value={form.agent_type}
                  onValueChange={(v) => setForm({ ...form, agent_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Módulo de Atuação</Label>
                <Input
                  value={form.module}
                  onChange={(e) => setForm({ ...form, module: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="objectives" className="space-y-3">
              <div>
                <Label>Objetivo Principal</Label>
                <Textarea
                  value={form.objective}
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>
            <TabsContent value="permissions" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Configure as permissões do agente na próxima versão. As permissões serão integradas
                ao sistema de perfis.
              </p>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
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

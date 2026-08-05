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
import { getKnowledgeBase, createKnowledgeItem, updateKnowledgeItem } from '@/services/ai-module'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canAddKnowledgeBase } from '@/lib/ai-permissions'
import { KB_CONTENT_TYPES, KB_FORMATS, KB_STATUS, type AiKnowledgeItem } from '@/lib/ai-types'
import { Plus, Database, Loader2, Pencil, FileText } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  Ativo: 'bg-green-100 text-green-700',
  'Aguardando Processamento': 'bg-yellow-100 text-yellow-700',
  'Em Processamento': 'bg-blue-100 text-blue-700',
  'Com Erro': 'bg-red-100 text-red-700',
  Desatualizado: 'bg-orange-100 text-orange-700',
  Inativo: 'bg-gray-100 text-gray-600',
}

export function AiKnowledgeBase() {
  const { user } = useAuth()
  const [items, setItems] = useState<AiKnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AiKnowledgeItem | null>(null)
  const [form, setForm] = useState({
    title: '',
    category: 'Manuais',
    description: '',
    content_type: 'Manuais',
    format: 'Texto',
    content: '',
    status: 'Aguardando Processamento',
  })

  const load = async () => {
    try {
      setItems(await getKnowledgeBase())
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('ai_knowledge_base', () => load())

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      category: 'Manuais',
      description: '',
      content_type: 'Manuais',
      format: 'Texto',
      content: '',
      status: 'Aguardando Processamento',
    })
    setOpen(true)
  }
  const openEdit = (k: AiKnowledgeItem) => {
    setEditing(k)
    setForm({
      title: k.title,
      category: k.category || '',
      description: k.description || '',
      content_type: k.content_type || 'Manuais',
      format: k.format || 'Texto',
      content: k.content || '',
      status: k.status,
    })
    setOpen(true)
  }
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Título obrigatório')
      return
    }
    try {
      if (editing) {
        const prevVersion = {
          content: editing.content,
          version: editing.version,
          date: new Date().toISOString(),
          user: user?.name || '',
        }
        await updateKnowledgeItem(editing.id, {
          ...form,
          version: (editing.version || 1) + 1,
          versions: [...(editing.versions || []), prevVersion],
        })
      } else {
        await createKnowledgeItem({
          ...form,
          empresa: '',
          filial: '',
          departamento: '',
          linked_agents: [],
          file_url: '',
          responsible: user?.name || '',
          version: 1,
          expiry_date: '',
          versions: [],
        })
      }
      toast.success('Conteúdo salvo')
      setOpen(false)
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
      {canAddKnowledgeBase(user?.role as string) && (
        <Button onClick={openCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Conteúdo
        </Button>
      )}
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum conteúdo na base de conhecimento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((k) => (
            <Card key={k.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C89B3C]" />
                    <p className="font-bold text-sm">{k.title}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[k.status] || ''}`}
                  >
                    {k.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {k.description || 'Sem descrição'}
                </p>
                <p className="text-xs">
                  <span className="font-bold">Tipo:</span> {k.content_type || '—'}
                </p>
                <p className="text-xs">
                  <span className="font-bold">Formato:</span> {k.format || '—'}
                </p>
                <p className="text-xs">
                  <span className="font-bold">Versão:</span> {k.version || 1}
                </p>
                {canAddKnowledgeBase(user?.role as string) && (
                  <Button size="sm" variant="ghost" onClick={() => openEdit(k)} className="mt-1">
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Conteúdo' : 'Adicionar Conteúdo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={form.content_type}
                onValueChange={(v) => setForm({ ...form, content_type: v, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KB_CONTENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formato</Label>
              <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KB_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Conteúdo</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KB_STATUS.map((s) => (
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

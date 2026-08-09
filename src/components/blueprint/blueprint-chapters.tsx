import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Plus, FileText, Pencil } from 'lucide-react'
import { getVolumes, getChapters, createChapter, updateChapter } from '@/services/blueprint'
import type { BlueprintVolume, BlueprintChapter } from '@/lib/blueprint-types'
import { EDITORIAL_STATUS_OPTIONS, TECHNICAL_VALIDITY_OPTIONS } from '@/lib/blueprint-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { canEditBlueprint } from '@/lib/blueprint-permissions'
import { useAuth } from '@/hooks/use-auth'

const STATUS_COLOR: Record<string, string> = {
  Publicado: 'bg-emerald-100 text-emerald-700',
  'Em Revisão': 'bg-amber-100 text-amber-700',
  Rascunho: 'bg-gray-100 text-gray-700',
}
const VALIDITY_COLOR: Record<string, string> = {
  Vigente: 'bg-green-100 text-green-700',
  'Em validação': 'bg-blue-100 text-blue-700',
  Desatualizado: 'bg-orange-100 text-orange-700',
  Substituído: 'bg-purple-100 text-purple-700',
  Obsoleto: 'bg-red-100 text-red-700',
}

export function BlueprintChapters() {
  const { user } = useAuth()
  const [volumes, setVolumes] = useState<BlueprintVolume[]>([])
  const [chapters, setChapters] = useState<BlueprintChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlueprintChapter | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const canEdit = canEditBlueprint(user?.role as string)

  const load = useCallback(async () => {
    try {
      const [vols, chs] = await Promise.all([getVolumes(), getChapters()])
      setVolumes(vols)
      setChapters(chs)
    } catch {
      /* noop */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('blueprint_chapters', () => load())

  const openNew = () => {
    setEditing(null)
    setForm({
      volume_id: volumes[0]?.id || '',
      editorial_status: 'Rascunho',
      technical_validity: 'Vigente',
      version_number: '1.0',
      display_order: chapters.length + 1,
      active: true,
      api_enabled: false,
      knowledge_health_score: 0,
      visibility_scope: 'público',
      review_frequency: 'semestral',
      locale: 'pt-BR',
    })
    setDialogOpen(true)
  }

  const openEdit = (ch: BlueprintChapter) => {
    setEditing(ch)
    setForm({ ...ch })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await updateChapter(editing.id, form)
        toast.success('Capítulo atualizado')
      } else {
        await createChapter(form as Partial<BlueprintChapter>)
        toast.success('Capítulo criado')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
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
        <h3 className="text-lg font-bold">Capítulos</h3>
        {canEdit && (
          <Button className="bg-[#005B2E] hover:bg-[#01361D] text-white" onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Novo Capítulo
          </Button>
        )}
      </div>
      {volumes.map((vol) => (
        <div key={vol.id}>
          <p className="text-sm font-bold text-[#005B2E] mb-2">{vol.title}</p>
          <div className="space-y-2">
            {chapters
              .filter((c) => c.volume_id === vol.id)
              .map((ch) => (
                <Card key={ch.id} className="border-2 border-[#005B2E]/15">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-[#005B2E] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{ch.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ch.code} · v{ch.version_number} · {ch.content_type || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-xs ${STATUS_COLOR[ch.editorial_status] || ''}`}>
                        {ch.editorial_status}
                      </Badge>
                      <Badge className={`text-xs ${VALIDITY_COLOR[ch.technical_validity] || ''}`}>
                        {ch.technical_validity}
                      </Badge>
                      {canEdit && (
                        <Button size="sm" variant="ghost" onClick={() => openEdit(ch)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Capítulo' : 'Novo Capítulo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Código</Label>
                <Input
                  value={(form.code as string) || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div>
                <Label>Stable ID</Label>
                <Input
                  value={(form.stable_id as string) || ''}
                  onChange={(e) => setForm({ ...form, stable_id: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Título *</Label>
              <Input
                value={(form.title as string) || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Resumo</Label>
              <Input
                value={(form.summary as string) || ''}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status Editorial</Label>
                <Select
                  value={(form.editorial_status as string) || 'Rascunho'}
                  onValueChange={(v) => setForm({ ...form, editorial_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITORIAL_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Validade Técnica</Label>
                <Select
                  value={(form.technical_validity as string) || 'Vigente'}
                  onValueChange={(v) => setForm({ ...form, technical_validity: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNICAL_VALIDITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Versão</Label>
                <Input
                  value={(form.version_number as string) || ''}
                  onChange={(e) => setForm({ ...form, version_number: e.target.value })}
                />
              </div>
              <div>
                <Label>Autor</Label>
                <Input
                  value={(form.author as string) || ''}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
              <div>
                <Label>Owner Funcional</Label>
                <Input
                  value={(form.owner_funcional as string) || ''}
                  onChange={(e) => setForm({ ...form, owner_funcional: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Owner Técnico</Label>
                <Input
                  value={(form.owner_tecnico as string) || ''}
                  onChange={(e) => setForm({ ...form, owner_tecnico: e.target.value })}
                />
              </div>
              <div>
                <Label>Aprovador</Label>
                <Input
                  value={(form.aprovador as string) || ''}
                  onChange={(e) => setForm({ ...form, aprovador: e.target.value })}
                />
              </div>
              <div>
                <Label>Próx. Revisão</Label>
                <Input
                  type="date"
                  value={(form.proxima_revisao as string) || ''}
                  onChange={(e) => setForm({ ...form, proxima_revisao: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

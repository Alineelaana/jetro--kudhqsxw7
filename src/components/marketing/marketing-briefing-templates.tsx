import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { Loader2, Plus, FileText, Trash2, Pencil } from 'lucide-react'
import {
  getMkBriefingTemplates,
  createMkBriefingTemplate,
  updateMkBriefingTemplate,
  deleteMkBriefingTemplate,
} from '@/services/marketing'
import { MK_REQUEST_TYPES } from '@/lib/marketing-types'
import type { MkBriefingTemplate } from '@/lib/marketing-types'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canManageBrand } from '@/lib/marketing-permissions'
import { toast } from 'sonner'

const EMPTY: Record<string, unknown> = {
  name: '',
  type: 'campanha',
  objective: '',
  audience: '',
  message: '',
  product: '',
  brand: '',
  campaign: '',
  channel: '',
  region: '',
  period: '',
  budget: '',
  deliverables: [],
  references: [],
  restrictions: '',
  approvers: [],
  active: true,
}

export function MarketingBriefingTemplates() {
  const { userRole } = useAuth()
  const [items, setItems] = useState<MkBriefingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [delText, setDelText] = useState('')
  const [refText, setRefText] = useState('')
  const [apprText, setApprText] = useState('')

  const load = useCallback(async () => {
    try {
      setItems((await getMkBriefingTemplates()) as MkBriefingTemplate[])
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_briefing_templates', () => load())

  const canManage = canManageBrand(userRole)

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY })
    setDelText('')
    setRefText('')
    setApprText('')
    setDialogOpen(true)
  }

  const openEdit = (t: MkBriefingTemplate) => {
    setEditId(t.id)
    setForm({ ...t })
    setDelText(Array.isArray(t.deliverables) ? t.deliverables.join('\n') : '')
    setRefText(Array.isArray(t.references) ? t.references.join('\n') : '')
    setApprText(Array.isArray(t.approvers) ? t.approvers.join('\n') : '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name?.toString().trim()) {
      toast.error('Informe o nome')
      return
    }
    setSaving(true)
    try {
      const data = {
        ...form,
        deliverables: delText.split('\n').filter(Boolean),
        references: refText.split('\n').filter(Boolean),
        approvers: apprText.split('\n').filter(Boolean),
      }
      if (editId) {
        await updateMkBriefingTemplate(editId, data)
        toast.success('Template atualizado')
      } else {
        await createMkBriefingTemplate(data)
        toast.success('Template criado')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const handleToggle = async (t: MkBriefingTemplate) => {
    try {
      await updateMkBriefingTemplate(t.id, { active: !t.active })
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMkBriefingTemplate(id)
      toast.success('Template excluído')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const fields: Array<[string, string]> = [
    ['brand', 'Marca'],
    ['product', 'Produto'],
    ['campaign', 'Campanha'],
    ['channel', 'Canal'],
    ['region', 'Região'],
    ['period', 'Período'],
    ['budget', 'Orçamento'],
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#005B2E]">Templates de Briefing</h2>
        {canManage && (
          <Button onClick={openCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
            <Plus className="w-4 h-4 mr-1" /> Novo Template
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum template cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((t) => (
            <Card key={t.id} className="border-l-4 border-[#005B2E]">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{t.name}</span>
                  <Badge variant={t.active ? 'default' : 'secondary'} className="text-xs">
                    {t.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {MK_REQUEST_TYPES.find((r) => r.value === t.type)?.label || t.type || '—'}
                </p>
                {t.objective && <p className="text-xs mt-1">Objetivo: {t.objective}</p>}
                {t.audience && <p className="text-xs">Público: {t.audience}</p>}
                {canManage && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => openEdit(t)}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleToggle(t)}
                    >
                      {t.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 text-xs"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editId ? 'Editar Template' : 'Novo Template de Briefing'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input
                value={(form.name as string) || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={(form.type as string) || 'campanha'}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MK_REQUEST_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Objetivo</Label>
              <Input
                value={(form.objective as string) || ''}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
              />
            </div>
            <div>
              <Label>Público</Label>
              <Input
                value={(form.audience as string) || ''}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              />
            </div>
            <div>
              <Label>Produto</Label>
              <Input
                value={(form.product as string) || ''}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
              />
            </div>
            {fields.slice(0, 4).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  value={(form[key] as string) || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            {fields.slice(4).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  value={(form[key] as string) || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="col-span-2">
              <Label>Mensagem</Label>
              <Textarea
                value={(form.message as string) || ''}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Entregáveis (um por linha)</Label>
              <Textarea value={delText} onChange={(e) => setDelText(e.target.value)} rows={3} />
            </div>
            <div className="col-span-2">
              <Label>Referências (uma por linha)</Label>
              <Textarea value={refText} onChange={(e) => setRefText(e.target.value)} rows={2} />
            </div>
            <div className="col-span-2">
              <Label>Restrições</Label>
              <Textarea
                value={(form.restrictions as string) || ''}
                onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Aprovadores (um por linha)</Label>
              <Textarea value={apprText} onChange={(e) => setApprText(e.target.value)} rows={2} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={form.active as boolean}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

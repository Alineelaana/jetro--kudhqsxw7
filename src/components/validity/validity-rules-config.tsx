import pb from '@/lib/pocketbase/client'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Power,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
} from 'lucide-react'
import {
  getValidityRules,
  createValidityRuleFormData,
  updateValidityRuleFormData,
  updateValidityRule,
  deleteValidityRule,
} from '@/services/validity-rules'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { MODULE_OPTIONS } from '@/lib/validity-types'
import { canConfigureValidityRules } from '@/lib/validity-permissions'
import { useAuth } from '@/hooks/use-auth'
import type { ValidityRule } from '@/lib/validity-types'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const ACCEPTED_ATTACHMENTS = '.png,.jpg,.jpeg,.pdf,.xls,.xlsx'
const ACCEPTED_MIME = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function attachmentIcon(filename: string) {
  const lower = (filename || '').toLowerCase()
  if (lower.match(/\.(png|jpe?g)$/)) return <ImageIcon className="w-4 h-4 text-[#005B2E]" />
  if (lower.match(/\.(xls[x]?)$/)) return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
  return <FileText className="w-4 h-4 text-[#005B2E]" />
}

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || ''

function attachmentUrl(ruleId: string, filename: string) {
  return `${PB_URL}/api/files/validity_rules/${ruleId}/${filename}`
}

export function ValidityRulesConfig() {
  const { userRole } = useAuth()
  const [rules, setRules] = useState<ValidityRule[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ValidityRule | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ active: 'true' })
  const [attachments, setAttachments] = useState<File[]>([])
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([])
  const [attachmentError, setAttachmentError] = useState<string>('')

  const canEdit = canConfigureValidityRules(userRole)

  const load = async () => {
    setLoading(true)
    try {
      setRules(await getValidityRules())
    } catch {
      setRules([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('validity_rules', () => load())

  const resetForm = () => {
    setForm({ active: 'true' })
    setAttachments([])
    setRemovedAttachments([])
    setAttachmentError('')
  }

  const handleNew = () => {
    setEditing(null)
    setForm({
      active: 'true',
      antecedent_days: '60,30,15,7,0',
      recurrence_days: '7',
      channels: 'in_app,email',
    })
    setAttachments([])
    setRemovedAttachments([])
    setAttachmentError('')
    setFormOpen(true)
  }
  const handleEdit = (r: ValidityRule) => {
    setEditing(r)
    setForm({
      name: r.name,
      module: r.module,
      entity_type: r.entity_type,
      entity_label: r.entity_label,
      validity_field: r.validity_field,
      antecedent_days: Array.isArray(r.antecedent_days) ? r.antecedent_days.join(',') : '',
      criticidade_mapping: JSON.stringify(r.criticidade_mapping, null, 2),
      recipients: JSON.stringify(r.recipients, null, 2),
      escalation_config: JSON.stringify(r.escalation_config, null, 2),
      recurrence_days: String(r.recurrence_days || 7),
      channels: Array.isArray(r.channels) ? r.channels.join(',') : '',
      active: r.active !== false ? 'true' : 'false',
    })
    setAttachments([])
    setRemovedAttachments([])
    setAttachmentError('')
    setFormOpen(true)
  }

  const validateAttachment = (file: File): string | null => {
    const isAllowedByMime = ACCEPTED_MIME.includes(file.type)
    const isAllowedByExt = /\.(png|jpe?g|pdf|xls|xls[x]?)$/i.test(file.name)
    if (!isAllowedByMime && !isAllowedByExt) {
      return `Formato não suportado: ${file.name}`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo excede 10MB: ${file.name}`
    }
    return null
  }

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setAttachmentError('')
    const incoming: File[] = []
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i]
      const err = validateAttachment(f)
      if (err) {
        setAttachmentError(err)
        continue
      }
      incoming.push(f)
    }
    if (incoming.length) {
      setAttachments((prev) => [...prev, ...incoming])
    }
  }

  const removeNewAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx))

  const removeExistingAttachment = (filename: string) => {
    setRemovedAttachments((prev) => Array.from(new Set([...prev, filename])))
  }

  const handleSave = async () => {
    setAttachmentError('')
    if (!form.name || !form.name.trim()) {
      toast({ title: 'Informe o nome da regra', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('module', form.module || '')
      fd.append('entity_type', form.entity_type || '')
      fd.append('entity_label', form.entity_label || '')
      fd.append('validity_field', form.validity_field || '')
      fd.append(
        'antecedent_days',
        JSON.stringify(
          form.antecedent_days
            ?.split(',')
            .map((d) => parseInt(d.trim(), 10))
            .filter((n) => !isNaN(n)) || [],
        ),
      )
      fd.append('criticidade_mapping', form.criticidade_mapping || '{}')
      fd.append('recipients', form.recipients || '{}')
      fd.append('escalation_config', form.escalation_config || '{}')
      fd.append('recurrence_days', form.recurrence_days || '7')
      fd.append('channels', JSON.stringify(form.channels?.split(',').map((c) => c.trim()) || []))
      fd.append('active', form.active === 'true' ? 'true' : 'false')

      // anexar novos arquivos (campo "attachments", multiplo)
      for (const file of attachments) {
        fd.append('attachments', file)
      }

      if (editing) {
        // marcar arquivos existentes para remoção, se solicitado
        for (const filename of removedAttachments) {
          fd.append('attachments-', filename)
        }
        await updateValidityRuleFormData(editing.id, fd)
        toast({ title: 'Regra atualizada' })
      } else {
        await createValidityRuleFormData(fd)
        toast({ title: 'Regra criada' })
      }
      setFormOpen(false)
      resetForm()
      load()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleToggle = async (r: ValidityRule) => {
    try {
      await updateValidityRule(r.id, { active: !r.active } as Partial<ValidityRule>)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }
  const handleDelete = async (r: ValidityRule) => {
    try {
      await deleteValidityRule(r.id)
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

  const existingAttachments: string[] = editing?.attachments || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-[#005B2E]">Regras de Validade</h2>
        {canEdit && (
          <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {rules.map((r) => (
          <Card key={r.id} className="border-2 border-[#005B2E]/10">
            <CardContent className="py-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.name}</span>
                  <Badge variant="outline">{r.module}</Badge>
                  <Badge variant="outline">{r.entity_type}</Badge>
                  {!r.active && <Badge className="bg-gray-200 text-gray-600">Inativa</Badge>}
                  {r.attachments && r.attachments.length > 0 && (
                    <Badge className="bg-[#005B2E]/10 text-[#005B2E]">
                      {r.attachments.length} anexo{r.attachments.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Campo: {r.validity_field} · Antecedência:{' '}
                  {Array.isArray(r.antecedent_days) ? r.antecedent_days.join(', ') : ''} dias
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(r)}
                    className="text-[#005B2E]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(r)}
                    className={r.active ? 'text-[#005B2E]' : 'text-red-600'}
                    title={r.active ? 'Inativar registro' : 'Ativar registro'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(r)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o)
          if (!o) resetForm()
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Nova'} Regra de Validade
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Módulo *</Label>
              <Select
                value={form.module || ''}
                onValueChange={(v) => setForm((p) => ({ ...p, module: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {MODULE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tipo de Entidade (collection) *</Label>
              <Input
                value={form.entity_type || ''}
                onChange={(e) => setForm((p) => ({ ...p, entity_type: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Campo de Validade *</Label>
              <Input
                value={form.validity_field || ''}
                onChange={(e) => setForm((p) => ({ ...p, validity_field: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Dias de Antecedência (vírgula)</Label>
              <Input
                value={form.antecedent_days || ''}
                onChange={(e) => setForm((p) => ({ ...p, antecedent_days: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Recorrência (dias)</Label>
              <Input
                type="number"
                value={form.recurrence_days || ''}
                onChange={(e) => setForm((p) => ({ ...p, recurrence_days: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Mapeamento de Criticidade (JSON)</Label>
              <Textarea
                value={form.criticidade_mapping || ''}
                onChange={(e) => setForm((p) => ({ ...p, criticidade_mapping: e.target.value }))}
                rows={3}
                className="focus-visible:ring-[#005B2E] font-mono text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Recipientes (JSON)</Label>
              <Textarea
                value={form.recipients || ''}
                onChange={(e) => setForm((p) => ({ ...p, recipients: e.target.value }))}
                rows={4}
                className="focus-visible:ring-[#005B2E] font-mono text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Escalonamento (JSON)</Label>
              <Textarea
                value={form.escalation_config || ''}
                onChange={(e) => setForm((p) => ({ ...p, escalation_config: e.target.value }))}
                rows={3}
                className="focus-visible:ring-[#005B2E] font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label>Canais (vírgula)</Label>
              <Input
                value={form.channels || ''}
                onChange={(e) => setForm((p) => ({ ...p, channels: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.active === 'true'}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v ? 'true' : 'false' }))}
                className="data-[state=checked]:bg-[#005B2E] data-[state=unchecked]:bg-red-600"
              />
              <Label>{form.active === 'true' ? 'Ativo' : 'Inativo'}</Label>
            </div>

            {/* Anexos */}
            <div className="space-y-2 sm:col-span-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Anexar Arquivos</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Formatos aceitos: imagens (PNG, JPEG) e documentos (PDF, XLS). Até 10MB por
                    arquivo.
                  </p>
                </div>
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-[#005B2E]/30 rounded-lg hover:bg-[#005B2E]/5 transition-colors text-sm font-semibold text-[#005B2E]">
                  <Upload className="w-4 h-4" />
                  Selecionar arquivos
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_ATTACHMENTS}
                    className="hidden"
                    onChange={(e) => {
                      handleAddFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>

              {attachmentError && (
                <p className="text-xs text-red-600 font-medium">{attachmentError}</p>
              )}

              {/* Anexos já salvos (somente na edição) */}
              {editing && existingAttachments.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">Anexos atuais</p>
                  {existingAttachments
                    .filter((fn) => !removedAttachments.includes(fn))
                    .map((filename) => (
                      <div
                        key={filename}
                        className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-md"
                      >
                        {attachmentIcon(filename)}
                        <a
                          href={attachmentUrl(editing.id, filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#005B2E] hover:text-[#01361D] hover:underline truncate flex-1"
                          title={filename}
                        >
                          {filename}
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExistingAttachment(filename)}
                          className="text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}

              {/* Novos arquivos selecionados */}
              {attachments.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Novos anexos ({attachments.length})
                  </p>
                  {attachments.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center gap-2 bg-[#005B2E]/5 border border-[#005B2E]/10 px-3 py-2 rounded-md"
                    >
                      {attachmentIcon(file.name)}
                      <span className="text-sm truncate flex-1" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeNewAttachment(idx)}
                        className="text-red-600 h-7 w-7 p-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {attachments.length === 0 &&
                (!editing ||
                  existingAttachments.length === 0 ||
                  removedAttachments.length === existingAttachments.length) && (
                  <p className="text-xs text-muted-foreground italic">Nenhum arquivo anexado.</p>
                )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

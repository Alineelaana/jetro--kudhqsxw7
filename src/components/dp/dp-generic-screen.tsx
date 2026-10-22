import { useState, useEffect } from 'react'
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
import { DpLoading, DpEmptyState, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { dpGetList, dpCreate, dpUpdate, dpDelete } from '@/services/dp'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Plus, Search, Pencil, Trash2, Loader2, Save, Paperclip } from 'lucide-react'
import { toast } from 'sonner'
import type { DpScreenConfig } from '@/lib/dp-types'
import { ExportActions } from '@/components/shared/export-actions'
import { RecordAttachmentsDialog } from '@/components/shared/record-attachments-dialog'
import { QuickEmployeeLinks } from '@/components/shared/quick-employee-links'

export function DpGenericScreen({ config }: { config: DpScreenConfig }) {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [attachmentTarget, setAttachmentTarget] = useState<any | null>(null)

  const filter =
    config.filterField && config.filterValue
      ? `${config.filterField} = "${config.filterValue}"`
      : undefined

  const load = async () => {
    try {
      setRecords(await dpGetList(config.collection, filter))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [config.collection])
  useRealtime(config.collection, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return Object.values(r).some((v) =>
      String(v || '')
        .toLowerCase()
        .includes(q),
    )
  })

  const openNew = () => {
    setEditing(null)
    setForm(config.statusField ? { [config.statusField]: config.statusOptions?.[0] || '' } : {})
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    for (const f of config.fields.filter((f) => f.required)) {
      if (!form[f.name]?.trim()) {
        toast.error(`${f.label} é obrigatório`)
        return
      }
    }
    if (config.filterField && config.filterValue && !form[config.filterField])
      form[config.filterField] = config.filterValue
    setSaving(true)
    try {
      if (editing) {
        await dpUpdate(config.collection, editing.id, form)
        toast.success('Registro atualizado')
      } else {
        await dpCreate(config.collection, form)
        toast.success('Registro criado')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await dpDelete(config.collection, id)
      toast.success('Excluído')
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const tableHeaders = config.fields.slice(0, 4).map((f) => f.label)
  if (config.statusField) tableHeaders.push('Status')
  tableHeaders.push('Ações')

  const exportHeaders = [
    ...config.fields.map((f) => f.label),
    ...(config.statusField ? ['Situação'] : []),
  ]
  const exportRows = filtered.map((r) => [
    ...config.fields.map((f) => r[f.name] || ''),
    ...(config.statusField ? [r[config.statusField] || ''] : []),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-bold">{config.title}</h3>
          <p className="text-xs text-muted-foreground">
            {records.length} registro(s) encontrado(s)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportActions
            title={config.title}
            headers={exportHeaders}
            data={exportRows}
            filenamePrefix={config.collection}
          />
          <Button
            onClick={openNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-8 text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Novo Registro
          </Button>
        </div>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar registros..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {loading ? (
        <DpLoading />
      ) : filtered.length === 0 ? (
        <DpEmptyState message="Nenhum registro encontrado" />
      ) : (
        <DpTable headers={tableHeaders}>
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              {config.fields.slice(0, 4).map((f) => (
                <td key={f.name} className="px-3 py-3">
                  {r[f.name] || '—'}
                </td>
              ))}
              {config.statusField && (
                <td className="px-3 py-3">
                  <DpStatusBadge status={r[config.statusField]} />
                </td>
              )}
              <td className="px-3 py-3">
                <div className="flex items-center gap-1">
                  {(r.employee_name || r.nome_completo || r.colaborador) && (
                    <QuickEmployeeLinks
                      employeeId={r.employee_id || r.id}
                      employeeName={r.employee_name || r.nome_completo || r.colaborador}
                    />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAttachmentTarget(r)}
                    className="text-muted-foreground hover:text-[#005B2E] hover:bg-[#005B2E]/10 h-8 w-8 p-0"
                    title="Anexos do registro"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(r)}
                    className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8 w-8 p-0"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DpTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} — {config.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.fields.map((f) => (
              <div key={f.name} className={`space-y-1 ${f.span === 2 ? 'sm:col-span-2' : ''}`}>
                <Label className="text-sm font-semibold">
                  {f.label}
                  {f.required ? ' *' : ''}
                </Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    rows={2}
                    className="focus-visible:ring-[#005B2E]"
                  />
                ) : f.type === 'select' ? (
                  <Select
                    value={form[f.name] || ''}
                    onValueChange={(v) => setForm({ ...form, [f.name]: v })}
                  >
                    <SelectTrigger className="focus-visible:ring-[#005B2E]">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(f.options || []).map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="focus-visible:ring-[#005B2E]"
                  />
                )}
              </div>
            ))}
            {config.statusField && config.statusOptions && (
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Situação</Label>
                <Select
                  value={form[config.statusField] || config.statusOptions[0]}
                  onValueChange={(v) => setForm({ ...form, [config.statusField]: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {attachmentTarget && (
        <RecordAttachmentsDialog
          open={!!attachmentTarget}
          onOpenChange={(op) => !op && setAttachmentTarget(null)}
          module="DP"
          recordId={attachmentTarget.id}
          recordTitle={`${config.title} — ${attachmentTarget.nome || attachmentTarget.title || attachmentTarget.employee_name || attachmentTarget.id}`}
        />
      )}
    </div>
  )
}

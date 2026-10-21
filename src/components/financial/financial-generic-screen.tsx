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
import {
  FinancialEmptyState,
  FinancialLoading,
  StatusBadge,
} from '@/components/financial/financial-shared'
import { finGetList, finCreate, finUpdate, finDelete } from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import { useOrgFilter } from '@/hooks/use-org-filter'
import { MissingTenantNotice } from '@/components/multitenancy/missing-tenant-notice'
import type { FinancialScreenConfig } from '@/lib/financial-types'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Plus, Search, Pencil, Trash2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export function FinancialGenericScreen({ config }: { config: FinancialScreenConfig }) {
  const { hasMissingOrgBinding } = useOrgFilter()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await finGetList(config.collection))
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
    const requiredFields = config.fields.filter((f) => f.required)
    for (const f of requiredFields) {
      if (!form[f.name]?.trim()) {
        toast.error(`${f.label} é obrigatório`)
        return
      }
    }
    setSaving(true)
    try {
      if (editing) {
        await finUpdate(config.collection, editing.id, form)
        toast.success('Registro atualizado')
      } else {
        await finCreate(config.collection, form)
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
      await finDelete(config.collection, id)
      toast.success('Excluído')
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const columns: JetroColumnDef<any>[] = config.fields.slice(0, 4).map((f) => {
    const isCurrency =
      f.name.toLowerCase().includes('valor') || f.name.toLowerCase().includes('saldo')
    const isDate = f.type === 'date' || f.name.toLowerCase().includes('data')
    return {
      id: f.name,
      header: f.label,
      accessorKey: f.name,
      dataType: isCurrency ? 'currency' : isDate ? 'date' : f.type === 'number' ? 'number' : 'text',
      align: isCurrency ? 'right' : 'left',
      getSortValue: isCurrency ? (row: any) => parseFloat(row[f.name] || '0') : undefined,
      cell: ({ value }: { value: unknown }) => {
        if (isCurrency) {
          const num = parseFloat(String(value || '0'))
          return (
            <span className="font-medium">
              {value ? num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
            </span>
          )
        }
        return <span>{String(value || '—')}</span>
      },
    }
  })

  if (config.statusField) {
    columns.push({
      id: config.statusField,
      header: 'Status',
      accessorKey: config.statusField,
      dataType: 'text',
      align: 'center',
      defaultWidth: 120,
      cell: ({ value }) => <StatusBadge status={String(value || '')} />,
    })
  }

  columns.push({
    id: 'actions',
    header: 'Ações',
    align: 'right',
    sortable: false,
    hideable: false,
    resizable: false,
    draggable: false,
    defaultWidth: 90,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openEdit(row)}
          className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 w-7 p-0"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDelete(row.id)}
          className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
          title="Excluir"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  })

  if (hasMissingOrgBinding) {
    return <MissingTenantNotice moduleName={`Financeiro — ${config.title}`} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">{config.title}</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {loading ? (
        <FinancialLoading />
      ) : records.length === 0 ? (
        <FinancialEmptyState message={`Nenhum registro encontrado`} />
      ) : (
        <JetroTable
          screenId={`financeiro.${config.collection}`}
          columns={columns}
          data={filtered}
          emptyMessage="Nenhum registro corresponde aos filtros."
          exportTitle={`${config.title} — Jetro ERP`}
          exportFilename={`${config.collection}-jetro.xlsx`}
        />
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
                ) : f.type === 'number' ? (
                  <Input
                    type="number"
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="focus-visible:ring-[#005B2E]"
                  />
                ) : f.type === 'date' ? (
                  <Input
                    type="date"
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="focus-visible:ring-[#005B2E]"
                  />
                ) : (
                  <Input
                    type="text"
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="focus-visible:ring-[#005B2E]"
                  />
                )}
              </div>
            ))}
            {config.statusField && config.statusOptions && (
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Status</Label>
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
    </div>
  )
}

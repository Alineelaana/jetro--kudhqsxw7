import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getStrategicList,
  createStrategicRecord,
  updateStrategicRecord,
  deleteStrategicRecord,
  logStrategicAudit,
} from '@/services/strategic'
import { StrategicBiButton } from './strategic-bi-button'
import type { StrategicCrudConfig, StrategicFieldDef } from '@/lib/strategic-types'

export function StrategicCrudScreen({ config }: { config: StrategicCrudConfig }) {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [search, setSearch] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saveError, setSaveError] = useState('')

  const load = async () => {
    try {
      setRecords(await getStrategicList(config.collection))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(config.collection, () => load())

  const openCreate = () => {
    setEditing(null)
    setForm({})
    setDialogOpen(true)
  }
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setFieldErrors({})
    setSaveError('')
    const nameVal = (form[config.nameLabel] as string) || ''
    try {
      if (editing) {
        await updateStrategicRecord(config.collection, editing.id as string, form)
        logStrategicAudit('update', editing.id as string, `${config.title}: ${nameVal}`)
      } else {
        const rec = await createStrategicRecord(config.collection, {
          ...form,
          company: '',
          branch: '',
        })
        logStrategicAudit(
          'create',
          (rec as Record<string, unknown>).id as string,
          `${config.title}: ${nameVal}`,
        )
      }
      setDialogOpen(false)
      load()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      setSaveError(getErrorMessage(err))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro?')) return
    await deleteStrategicRecord(config.collection, id)
    logStrategicAudit('delete', id, config.title)
    load()
  }

  const filtered = records.filter(
    (r) =>
      !search ||
      String(r[config.nameLabel] || '')
        .toLowerCase()
        .includes(search.toLowerCase()),
  )

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="flex gap-2">
          <StrategicBiButton area={config.title} />
          <Button
            onClick={openCreate}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-bold">Nenhum registro encontrado</p>
            <p className="text-sm text-muted-foreground">
              Clique em "Novo" para criar o primeiro registro.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-2 font-bold">Nome</th>
                  {config.statusField && <th className="text-left px-3 py-2 font-bold">Status</th>}
                  <th className="text-left px-3 py-2 font-bold hidden sm:table-cell">Criado</th>
                  <th className="text-center px-3 py-2 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{String(r[config.nameLabel] || '')}</td>
                    {config.statusField && (
                      <td className="px-3 py-2">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-muted">
                          {String(r[config.statusField] || '')}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">
                      {String(r.created || '').substring(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r.id as string)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDialogOpen(false)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6 space-y-3">
              <h3 className="font-bold text-lg text-[#005B2E]">
                {editing ? 'Editar' : 'Criar'} — {config.title}
              </h3>
              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 rounded px-2 py-1">{saveError}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {config.fields.map((field) => (
                  <FieldInput
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    onChange={(v) => setForm({ ...form, [field.name]: v })}
                    error={fieldErrors[field.name]}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: StrategicFieldDef
  value: unknown
  onChange: (v: string) => void
  error?: string
}) {
  const colSpan = field.span === 2 ? 'col-span-2' : ''
  return (
    <div className={colSpan}>
      <Label className="text-xs">
        {field.label}
        {field.required && ' *'}
      </Label>
      {field.type === 'textarea' ? (
        <Textarea value={String(value || '')} onChange={(e) => onChange(e.target.value)} rows={2} />
      ) : field.type === 'select' ? (
        <Select value={String(value || '')} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}

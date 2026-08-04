import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { useRealtime } from '@/hooks/use-realtime'
import { listConfig, createConfig, updateConfig, deleteConfig } from '@/services/configuracoes'
import type { ConfigCrudConfig, ConfigField } from '@/lib/configuracoes-config'
import { Plus, Search, Pencil, Trash2, Loader2, Power } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField
  value: any
  onChange: (v: any) => void
}) {
  if (field.type === 'boolean')
    return (
      <Switch
        checked={!!value}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#005B2E]"
      />
    )
  if (field.type === 'textarea')
    return (
      <Textarea
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="focus-visible:ring-[#005B2E]"
      />
    )
  if (field.type === 'select')
    return (
      <Select value={String(value || '')} onValueChange={onChange}>
        <SelectTrigger className="focus-visible:ring-[#005B2E]">
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
    )
  return (
    <Input
      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      className="focus-visible:ring-[#005B2E]"
    />
  )
}

export function ConfigCrudScreen({ config }: { config: ConfigCrudConfig }) {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setRecords(await listConfig(config.collection))
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
    const val = String(r[config.nameField] || '').toLowerCase()
    return !search || val.includes(search.toLowerCase())
  })

  const handleNew = () => {
    setEditing(null)
    setForm({ active: true })
    setFormOpen(true)
  }
  const handleEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setFormOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) await updateConfig(config.collection, editing.id, form)
      else await createConfig(config.collection, form)
      toast({ title: editing ? 'Atualizado' : 'Criado' })
      setFormOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleToggle = async (r: any) => {
    try {
      await updateConfig(config.collection, r.id, { active: !r.active })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }
  const handleDelete = async (r: any) => {
    try {
      await deleteConfig(config.collection, r.id)
      toast({ title: 'Excluído' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">{config.title}</h2>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <p className="text-sm text-muted-foreground mb-3">{filtered.length} registro(s)</p>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum registro encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-4 py-3 font-bold">Nome</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Situação</th>
                  <th className="text-center px-4 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-4 py-3 font-medium">{String(r[config.nameField] || '—')}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(r)}
                          className="text-[#005B2E] h-8 w-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggle(r)}
                          className="text-orange-600 h-8 w-8 p-0"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r)}
                          className="text-red-600 h-8 w-8 p-0"
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
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} — {config.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {config.fields.map((field) => (
              <div
                key={field.name}
                className={`space-y-1.5 ${field.span === 2 ? 'sm:col-span-2' : ''}`}
              >
                <Label className="text-sm font-semibold">
                  {field.label}
                  {field.required ? ' *' : ''}
                </Label>
                <FieldInput
                  field={field}
                  value={form[field.name]}
                  onChange={(v) => setForm((p) => ({ ...p, [field.name]: v }))}
                />
              </div>
            ))}
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={!!form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <Label className="font-semibold">{form.active ? 'Ativo' : 'Inativo'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

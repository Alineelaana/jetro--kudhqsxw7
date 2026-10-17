import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
import { STATUS_COLORS, type FiscalScreenConfig } from '@/lib/fiscal-types'
import { Loader2, Plus, Search, Pencil, FileText } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export function FiscalGenericScreen({ config }: { config: FiscalScreenConfig }) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await pb.collection(config.collection).getFullList({ sort: '-created' }))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(config.collection, () => load())

  const primaryField = config.fields[0]?.name || 'name'
  const filtered = records.filter((r) => {
    if (!search) return true
    const nameVal = (r[primaryField] as string) || ''
    return nameVal.toLowerCase().includes(search.toLowerCase())
  })

  const handleNew = () => {
    setEditing(null)
    setForm({})
    setOpen(true)
  }
  const handleEdit = (r: Record<string, unknown>) => {
    setEditing(r)
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v || '')])))
    setOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editing) await pb.collection(config.collection).update(editing.id as string, form)
      else await pb.collection(config.collection).create(form)
      toast.success(editing ? 'Atualizado' : 'Criado')
      setOpen(false)
      setForm({})
      setEditing(null)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const renderField = (field: (typeof config.fields)[0]) => {
    const val = form[field.name] || ''
    if (field.type === 'select')
      return (
        <Select value={val} onValueChange={(v) => setForm({ ...form, [field.name]: v })}>
          <SelectTrigger className="focus-visible:ring-[#005B2E]">
            <SelectValue placeholder={field.label} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    if (field.type === 'textarea')
      return (
        <Input
          value={val}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          className="focus-visible:ring-[#005B2E]"
        />
      )
    if (field.type === 'boolean')
      return (
        <Select value={val || 'false'} onValueChange={(v) => setForm({ ...form, [field.name]: v })}>
          <SelectTrigger className="focus-visible:ring-[#005B2E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Sim</SelectItem>
            <SelectItem value="false">Não</SelectItem>
          </SelectContent>
        </Select>
      )
    return (
      <Input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={val}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        className="focus-visible:ring-[#005B2E]"
      />
    )
  }

  const displayFields = config.fields
    .filter((f) => f.type !== 'boolean' && f.type !== 'textarea')
    .slice(0, 5)

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">{config.title}</h3>
        <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${config.title}...`}
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum registro encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">{config.nameLabel}</th>
                  {displayFields.map((f) => (
                    <th key={f.name} className="text-left px-3 py-3 font-bold hidden md:table-cell">
                      {f.label}
                    </th>
                  ))}
                  {config.statusField && <th className="text-left px-3 py-3 font-bold">Status</th>}
                  <th className="text-center px-3 py-3 font-bold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium">{(r[primaryField] as string) || '—'}</td>
                    {displayFields.map((f) => (
                      <td key={f.name} className="px-3 py-3 hidden md:table-cell text-xs">
                        {(r[f.name] as string) || '—'}
                      </td>
                    ))}
                    {config.statusField && (
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r[config.statusField] as string] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {(r[config.statusField] as string) || '—'}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(r)}
                        className="text-[#005B2E]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar' : 'Novo'} — {config.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.fields.map((field) => (
              <div key={field.name} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                <Label className="text-xs">
                  {field.label}
                  {field.required && ' *'}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
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

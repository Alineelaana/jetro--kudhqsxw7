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
import { RhTable, RhEmptyState, RhLoading, RhStatusBadge } from '@/components/rh/rh-shared'
import { rhGetList, rhCreate, rhUpdate } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import { TIME_RECORD_STATUS } from '@/lib/rh-types'
import { Plus, Search, Loader2, Save, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const FIELDS = [
  { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
  { name: 'data', label: 'Data', type: 'date', required: true },
  { name: 'entrada', label: 'Entrada', type: 'text' },
  { name: 'saida_intervalo', label: 'Saída Intervalo', type: 'text' },
  { name: 'retorno_intervalo', label: 'Retorno Intervalo', type: 'text' },
  { name: 'saida', label: 'Saída', type: 'text' },
  { name: 'horas_trabalhadas', label: 'Horas Trabalhadas', type: 'text' },
  { name: 'horas_extras', label: 'Horas Extras', type: 'text' },
  { name: 'banco_horas', label: 'Banco de Horas', type: 'text' },
  { name: 'atrasos', label: 'Atrasos', type: 'text' },
  { name: 'adicional_noturno', label: 'Adicional Noturno', type: 'text' },
  { name: 'justificativa', label: 'Justificativa', type: 'textarea' },
  { name: 'observacoes', label: 'Observações', type: 'textarea' },
]

export function RhTimeControl() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await rhGetList('rh_time_records'))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_time_records', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.employee_name || '').toLowerCase().includes(q) ||
      (r.data || '').toLowerCase().includes(q)
    )
  })

  const openNew = () => {
    setEditing(null)
    setForm({ situacao: 'Pendente' })
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.employee_name || !form.data) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await rhUpdate('rh_time_records', editing.id, form)
        toast.success('Registro atualizado')
      } else {
        await rhCreate('rh_time_records', form)
        toast.success('Registro criado')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Controle de Ponto</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Registrar Ponto
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por colaborador ou data..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {loading ? (
        <RhLoading />
      ) : filtered.length === 0 ? (
        <RhEmptyState message="Nenhum registro de ponto encontrado" />
      ) : (
        <RhTable
          headers={[
            'Colaborador',
            'Data',
            'Entrada',
            'Saída',
            'Horas',
            'Extras',
            'Situação',
            'Ações',
          ]}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.entrada || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.saida || '—'}</td>
              <td className="px-3 py-3 text-xs font-bold">{r.horas_trabalhadas || '—'}</td>
              <td className="px-3 py-3 text-xs text-amber-600 font-bold">
                {r.horas_extras || '—'}
              </td>
              <td className="px-3 py-3">
                <RhStatusBadge status={r.situacao} />
              </td>
              <td className="px-3 py-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(r)}
                  className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
              </td>
            </tr>
          ))}
        </RhTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} Registro de Ponto
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div
                key={f.name}
                className={`space-y-1 ${f.type === 'textarea' ? 'sm:col-span-2' : ''}`}
              >
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
                ) : (
                  <Input
                    type={f.type === 'date' ? 'date' : 'text'}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="focus-visible:ring-[#005B2E]"
                  />
                )}
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Situação</Label>
              <Select
                value={form.situacao || 'Pendente'}
                onValueChange={(v) => setForm({ ...form, situacao: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RECORD_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { VACATION_STATUS } from '@/lib/rh-types'
import { Plus, Search, Loader2, Save, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const FIELDS = [
  { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
  { name: 'data_admissao', label: 'Data de Admissão', type: 'date' },
  { name: 'periodo_aquisitivo_inicio', label: 'Período Aquisitivo Início', type: 'date' },
  { name: 'periodo_aquisitivo_fim', label: 'Período Aquisitivo Fim', type: 'date' },
  { name: 'periodo_concessivo_inicio', label: 'Período Concessivo Início', type: 'date' },
  { name: 'periodo_concessivo_fim', label: 'Período Concessivo Fim', type: 'date' },
  { name: 'dias_disponiveis', label: 'Dias Disponíveis', type: 'number' },
  { name: 'dias_utilizados', label: 'Dias Utilizados', type: 'number' },
  { name: 'dias_vendidos', label: 'Dias Vendidos', type: 'number' },
  { name: 'data_inicio', label: 'Data Início', type: 'date' },
  { name: 'data_fim', label: 'Data Fim', type: 'date' },
  { name: 'data_prevista', label: 'Data Prevista', type: 'date' },
  { name: 'observacoes', label: 'Observações', type: 'text' },
]

export function RhVacations() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await rhGetList('rh_vacations'))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_vacations', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.employee_name || '').toLowerCase().includes(q)
  })

  const openNew = () => {
    setEditing(null)
    setForm({
      situacao: 'Disponível',
      dias_disponiveis: '30',
      dias_utilizados: '0',
      dias_vendidos: '0',
    })
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.employee_name) {
      toast.error('Colaborador é obrigatório')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await rhUpdate('rh_vacations', editing.id, form)
        toast.success('Férias atualizadas')
      } else {
        await rhCreate('rh_vacations', form)
        toast.success('Férias registradas')
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
        <h3 className="text-lg font-bold">Férias</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Nova Férias
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por colaborador..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {loading ? (
        <RhLoading />
      ) : filtered.length === 0 ? (
        <RhEmptyState message="Nenhum registro de férias encontrado" />
      ) : (
        <RhTable
          headers={[
            'Colaborador',
            'Aquisitivo',
            'Dias Disp.',
            'Dias Util.',
            'Início',
            'Fim',
            'Situação',
            'Ações',
          ]}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.periodo_aquisitivo_inicio || '—'}</td>
              <td className="px-3 py-3 font-bold text-[#005B2E]">{r.dias_disponiveis || '0'}</td>
              <td className="px-3 py-3">{r.dias_utilizados || '0'}</td>
              <td className="px-3 py-3 text-xs">{r.data_inicio || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data_fim || '—'}</td>
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
              {editing ? 'Editar' : 'Nova'} Férias
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.name} className="space-y-1">
                <Label className="text-sm font-semibold">
                  {f.label}
                  {f.required ? ' *' : ''}
                </Label>
                <Input
                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  value={form[f.name] || ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Situação</Label>
              <Select
                value={form.situacao || 'Disponível'}
                onValueChange={(v) => setForm({ ...form, situacao: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VACATION_STATUS.map((s) => (
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

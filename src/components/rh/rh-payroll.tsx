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
import { PAYROLL_STATUS, PAYROLL_TYPES } from '@/lib/rh-types'
import { Plus, Search, Loader2, Save, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const FIELDS = [
  { name: 'competencia', label: 'Competência', type: 'text', required: true },
  { name: 'empresa', label: 'Empresa', type: 'text' },
  { name: 'filial', label: 'Filial', type: 'text' },
  { name: 'departamento', label: 'Departamento', type: 'text' },
  { name: 'centro_custo', label: 'Centro de Custo', type: 'text' },
  { name: 'valor_bruto', label: 'Valor Bruto', type: 'text' },
  { name: 'valor_liquido', label: 'Valor Líquido', type: 'text' },
  { name: 'total_descontos', label: 'Total Descontos', type: 'text' },
  { name: 'total_encargos', label: 'Total Encargos', type: 'text' },
  { name: 'quantidade_colaboradores', label: 'Qtd. Colaboradores', type: 'number' },
  { name: 'responsavel', label: 'Responsável', type: 'text' },
  { name: 'observacoes', label: 'Observações', type: 'textarea' },
]

const fmtCurrency = (v: string) =>
  v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

export function RhPayroll() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await rhGetList('rh_payroll'))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_payroll', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.competencia || '').toLowerCase().includes(q) ||
      (r.empresa || '').toLowerCase().includes(q)
    )
  })

  const openNew = () => {
    setEditing(null)
    setForm({ situacao: 'Em Preparação', tipo_folha: 'Mensal' })
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.competencia) {
      toast.error('Competência é obrigatória')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await rhUpdate('rh_payroll', editing.id, form)
        toast.success('Folha atualizada')
      } else {
        await rhCreate('rh_payroll', form)
        toast.success('Folha criada')
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
        <h3 className="text-lg font-bold">Folha de Pagamento</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Nova Folha
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por competência..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {loading ? (
        <RhLoading />
      ) : filtered.length === 0 ? (
        <RhEmptyState message="Nenhuma folha encontrada" />
      ) : (
        <RhTable
          headers={[
            'Competência',
            'Tipo',
            'Empresa',
            'Bruto',
            'Líquido',
            'Colabs',
            'Situação',
            'Ações',
          ]}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-mono font-bold text-[#C89B3C]">
                {r.competencia || '—'}
              </td>
              <td className="px-3 py-3 text-xs">{r.tipo_folha || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.empresa || '—'}</td>
              <td className="px-3 py-3 font-bold">{fmtCurrency(r.valor_bruto)}</td>
              <td className="px-3 py-3 font-bold text-[#005B2E]">{fmtCurrency(r.valor_liquido)}</td>
              <td className="px-3 py-3">{r.quantidade_colaboradores || '0'}</td>
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
              {editing ? 'Editar' : 'Nova'} Folha de Pagamento
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Folha</Label>
              <Select
                value={form.tipo_folha || 'Mensal'}
                onValueChange={(v) => setForm({ ...form, tipo_folha: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYROLL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                    type={f.type === 'number' ? 'number' : 'text'}
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
                value={form.situacao || 'Em Preparação'}
                onValueChange={(v) => setForm({ ...form, situacao: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYROLL_STATUS.map((s) => (
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

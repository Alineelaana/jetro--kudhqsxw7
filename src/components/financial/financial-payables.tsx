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
  FinancialTable,
  FinancialEmptyState,
  FinancialLoading,
  StatusBadge,
} from '@/components/financial/financial-shared'
import { getPayables, createPayable, updatePayable } from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import { PAYABLE_STATUS } from '@/lib/financial-types'
import { Plus, Search, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const FIELDS = [
  { name: 'numero_titulo', label: 'Nº Título', type: 'text', required: true },
  { name: 'fornecedor', label: 'Fornecedor/Favorecido', type: 'text', required: true },
  { name: 'empresa', label: 'Empresa', type: 'text' },
  { name: 'filial', label: 'Filial', type: 'text' },
  { name: 'documento_origem', label: 'Documento de Origem', type: 'text' },
  { name: 'numero_nota_fiscal', label: 'Nº Nota Fiscal', type: 'text' },
  { name: 'numero_pedido', label: 'Nº Pedido', type: 'text' },
  { name: 'data_emissao', label: 'Data Emissão', type: 'date' },
  { name: 'data_competencia', label: 'Data Competência', type: 'date' },
  { name: 'data_vencimento', label: 'Data Vencimento', type: 'date', required: true },
  { name: 'valor_original', label: 'Valor Original', type: 'text', required: true },
  { name: 'forma_pagamento', label: 'Forma de Pagamento', type: 'text' },
  { name: 'conta_bancaria', label: 'Conta Bancária', type: 'text' },
  { name: 'centro_custo', label: 'Centro de Custo', type: 'text' },
  { name: 'plano_contas', label: 'Plano de Contas', type: 'text' },
  { name: 'projeto', label: 'Projeto', type: 'text' },
  { name: 'codigo_barras', label: 'Código de Barras', type: 'text' },
  { name: 'chave_pix', label: 'Chave PIX', type: 'text' },
  { name: 'observacoes', label: 'Observações', type: 'textarea' },
]

export function FinancialPayables() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await getPayables())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('financial_payables', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.numero_titulo || '').toLowerCase().includes(q) ||
      (r.fornecedor || '').toLowerCase().includes(q)
    )
  })

  const openNew = () => {
    setEditing(null)
    setForm({ status: 'Em Aberto' })
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.numero_titulo || !form.fornecedor) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updatePayable(editing.id, form)
        toast.success('Título atualizado')
      } else {
        await createPayable(form)
        toast.success('Título criado')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const fmtCurrency = (v: string) =>
    v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Contas a Pagar</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Novo Título a Pagar
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título ou fornecedor..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {loading ? (
        <FinancialLoading />
      ) : filtered.length === 0 ? (
        <FinancialEmptyState message="Nenhum título a pagar encontrado" />
      ) : (
        <FinancialTable
          headers={['Nº Título', 'Fornecedor', 'Vencimento', 'Valor', 'Status', 'Ações']}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-mono text-xs font-bold text-[#C89B3C]">
                {r.numero_titulo || '—'}
              </td>
              <td className="px-3 py-3 font-medium">{r.fornecedor || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data_vencimento || '—'}</td>
              <td className="px-3 py-3 font-bold">{fmtCurrency(r.valor_original)}</td>
              <td className="px-3 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-3 py-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(r)}
                  className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8"
                >
                  Editar
                </Button>
              </td>
            </tr>
          ))}
        </FinancialTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} Título a Pagar
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
                    className="focus-visible:ring-[#005B2E]"
                    rows={2}
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
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                value={form.status || 'Em Aberto'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYABLE_STATUS.map((s) => (
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

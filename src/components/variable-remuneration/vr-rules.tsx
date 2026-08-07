import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
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
import { getRules, createRule, updateRule, deleteRule } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canCreateRules, canDeleteRules } from '@/lib/variable-remuneration-permissions'
import { CALC_TYPES, parseNum, formatCurrency } from '@/lib/variable-remuneration-types'
import { Plus, Pencil, Trash2, Loader2, Save, Search } from 'lucide-react'
import { toast } from 'sonner'

const FIELDS = [
  { name: 'name', label: 'Nome da Regra', required: true, span: 2 },
  { name: 'empresa', label: 'Empresa' },
  { name: 'filial', label: 'Filial' },
  { name: 'regiao', label: 'Região' },
  { name: 'equipe', label: 'Equipe' },
  { name: 'vendedor_name', label: 'Vendedor' },
  { name: 'gerente', label: 'Gerente' },
  { name: 'supervisor', label: 'Supervisor' },
  { name: 'coordenador', label: 'Coordenador' },
  { name: 'produto_name', label: 'Produto' },
  { name: 'categoria', label: 'Categoria' },
  { name: 'marca', label: 'Marca' },
  { name: 'fornecedor', label: 'Fornecedor' },
  { name: 'industria', label: 'Indústria' },
  { name: 'cliente_name', label: 'Cliente' },
  { name: 'canal', label: 'Canal de Venda' },
  { name: 'tabela_preco', label: 'Tabela de Preço' },
  { name: 'condicao_pagamento', label: 'Condição de Pagamento' },
  { name: 'forma_pagamento', label: 'Forma de Pagamento' },
  { name: 'value', label: 'Valor (%) ou Fixo' },
  { name: 'min_value', label: 'Valor Mínimo' },
  { name: 'max_value', label: 'Valor Máximo' },
  { name: 'vigencia_inicio', label: 'Vigência Inicial', type: 'date' as const, required: true },
  { name: 'vigencia_fim', label: 'Vigência Final', type: 'date' as const, required: true },
  { name: 'description', label: 'Descrição', type: 'textarea' as const, span: 2 },
]

export function VrRules() {
  const { user } = useAuth()
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRules(await getRules())
    } catch {
      setRules([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('commission_rules', () => load())

  const filtered = rules.filter((r) => {
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
    setForm({ status: 'ativa' })
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!form.vigencia_inicio || !form.vigencia_fim) {
      toast.error('Vigência é obrigatória')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateRule(editing.id, form)
        toast.success('Regra atualizada')
      } else {
        await createRule({ ...form, responsavel_user: user?.name || '' })
        toast.success('Regra criada')
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
      await deleteRule(id)
      toast.success('Excluída')
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Regras de Comissão</h3>
        {canCreateRules(user?.role) && (
          <Button
            onClick={openNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Regra
          </Button>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar regra..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Nome</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Cálculo</th>
                <th className="text-left px-3 py-3 font-bold">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Vigência</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-3 font-medium">{r.name || '—'}</td>
                  <td className="px-3 py-3 hidden sm:table-cell text-xs">
                    {CALC_TYPES.find((c) => c.value === r.calc_type)?.label || r.calc_type || '—'}
                  </td>
                  <td className="px-3 py-3">{r.value || '—'}</td>
                  <td className="px-3 py-3 hidden md:table-cell text-xs">
                    {r.vigencia_inicio || '—'} → {r.vigencia_fim || '—'}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'ativa' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {r.status || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-0.5 justify-center">
                      {canCreateRules(user?.role) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(r)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8 w-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {canDeleteRules(user?.role) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r.id)}
                          className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Nova'} Regra de Comissão
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Cálculo *</Label>
              <Select
                value={form.calc_type || ''}
                onValueChange={(v) => setForm({ ...form, calc_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CALC_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                value={form.status || 'ativa'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['ativa', 'inativa', 'rascunho', 'encerrada'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {FIELDS.map((f) => (
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

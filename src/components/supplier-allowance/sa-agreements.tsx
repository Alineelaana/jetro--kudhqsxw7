import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  SA_COLLECTIONS,
  saGetList,
  saCreate,
  saUpdate,
  saDelete,
} from '@/services/supplier-allowance'
import { getPartners } from '@/services/partners'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canCreateAgreements, canDeleteAgreements } from '@/lib/supplier-allowance-permissions'
import { AGREEMENT_TYPES, AGREEMENT_STATUS, formatBRL } from '@/lib/supplier-allowance-types'
import { Plus, Pencil, Trash2, Search, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function SaAgreements() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await saGetList(SA_COLLECTIONS.agreements))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
    getPartners()
      .then((p) => setSuppliers((p as any[]).filter((s) => s.partner_type?.includes('Fornecedor'))))
      .catch(() => {})
  }, [])
  useRealtime(SA_COLLECTIONS.agreements, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (r.agreement_type || '').includes(q) || (r.status || '').includes(q)
  })

  const openNew = () => {
    setEditing(null)
    setForm({ status: 'rascunho', currency: 'BRL', company: 'Velora Log', branch: 'Matriz' })
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.supplier) {
      toast.error('Selecione um fornecedor')
      return
    }
    try {
      if (editing) {
        await saUpdate(SA_COLLECTIONS.agreements, editing.id, form)
        toast.success('Acordo atualizado')
      } else {
        await saCreate(SA_COLLECTIONS.agreements, {
          ...form,
          responsible_user: user?.name || '',
          history: [],
          approval_data: {},
        })
        toast.success('Acordo criado')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
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
        <h3 className="text-lg font-bold">Acordos de Verba</h3>
        {canCreateAgreements(user?.role) && (
          <Button
            onClick={openNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Acordo
          </Button>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar acordos..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Tipo</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Período</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhum acordo encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium capitalize">{r.agreement_type || '—'}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">R$ {formatBRL(r.value)}</td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {r.start_date || '—'} → {r.end_date || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : r.status === 'encerrado' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(r)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {canDeleteAgreements(user?.role) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              await saDelete(SA_COLLECTIONS.agreements, r.id)
                              load()
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} Acordo de Verba
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Fornecedor *</Label>
              <Select
                value={form.supplier || ''}
                onValueChange={(v) => setForm({ ...form, supplier: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name || s.company_name || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select
                value={form.agreement_type || ''}
                onValueChange={(v) => setForm({ ...form, agreement_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGREEMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status || 'rascunho'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGREEMENT_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Percentual (%)</Label>
              <Input
                value={form.percent || ''}
                onChange={(e) => setForm({ ...form, percent: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Início</Label>
              <Input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Fim</Label>
              <Input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={form.observations || ''}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
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

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
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
  VR_COLLECTIONS,
  vrGetList,
  vrCreate,
  vrDelete,
  ADHOC_CREDIT_STATUS,
} from '@/services/verbas-roadmap'
import { SA_COLLECTIONS, saGetList } from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { Plus, Search, Loader2, Trash2, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

export function SaAdhocCredits() {
  const [records, setRecords] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await vrGetList(VR_COLLECTIONS.adhocCredits))
      setAccounts(await saGetList(SA_COLLECTIONS.accounts))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(VR_COLLECTIONS.adhocCredits, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.description || '').toLowerCase().includes(q)
  })

  const handleSave = async () => {
    if (!form.description || !form.amount) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    try {
      await vrCreate(VR_COLLECTIONS.adhocCredits, { ...form, responsible_user: '' })
      toast.success('Crédito avulso registrado')
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
        <h3 className="text-lg font-bold">Créditos Avulsos</h3>
        <Button
          onClick={() => {
            setForm({ status: 'pendente' })
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Crédito
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar créditos..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Descrição</th>
                <th className="text-right px-3 py-3 font-bold">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Motivo</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    <PlusCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhum crédito avulso encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium">{r.description || '—'}</td>
                    <td className="px-3 py-3 text-right font-bold text-emerald-600">
                      R$ {formatBRL(r.amount)}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {r.credit_date || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'creditado' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejeitado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">{r.reason || '—'}</td>
                    <td className="px-3 py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await vrDelete(VR_COLLECTIONS.adhocCredits, r.id)
                          load()
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Crédito Avulso</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Conta</Label>
              <Select
                value={form.account || ''}
                onValueChange={(v) => setForm({ ...form, account: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.id.substring(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição *</Label>
              <Input
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.credit_date || ''}
                  onChange={(e) => setForm({ ...form, credit_date: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div>
              <Label>Motivo</Label>
              <Input
                value={form.reason || ''}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
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

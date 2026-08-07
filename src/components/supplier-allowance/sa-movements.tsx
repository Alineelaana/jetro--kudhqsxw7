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
import { SA_COLLECTIONS, saGetList, saCreate } from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { MOVEMENT_TYPES, DIRECTIONS, formatBRL } from '@/lib/supplier-allowance-types'
import { Plus, Search, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'

export function SaMovements() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await saGetList(SA_COLLECTIONS.movements))
      setAccounts(await saGetList(SA_COLLECTIONS.accounts))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(SA_COLLECTIONS.movements, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.document_number || '').toLowerCase().includes(q) ||
      (r.movement_type || '').toLowerCase().includes(q)
    )
  })

  const handleSave = async () => {
    if (!form.account || !form.value) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    try {
      await saCreate(SA_COLLECTIONS.movements, {
        ...form,
        user: user?.name || '',
        timestamp: new Date().toISOString(),
        workflow_state: 'completed',
        source: 'usuario',
      })
      toast.success('Movimento registrado')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao registrar')
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
        <h3 className="text-lg font-bold">Movimentações</h3>
        <Button
          onClick={() => {
            setForm({ movement_type: 'lancamento', direction: 'credito', currency: 'BRL' })
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Movimento
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar movimentos..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Tipo</th>
                <th className="text-left px-3 py-3 font-bold">Direção</th>
                <th className="text-left px-3 py-3 font-bold">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Documento</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum movimento encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium capitalize">{r.movement_type || '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${r.direction === 'credito' ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {r.direction === 'credito' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {r.direction || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold">R$ {formatBRL(r.value)}</td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs font-mono">
                      {r.document_number || '—'}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
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
            <DialogTitle className="text-[#005B2E]">Novo Movimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Conta *</Label>
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
                      {a.id.substring(0, 8)} — R$ {formatBRL(a.current_balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={form.movement_type || ''}
                  onValueChange={(v) => setForm({ ...form, movement_type: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Direção *</Label>
                <Select
                  value={form.direction || ''}
                  onValueChange={(v) => setForm({ ...form, direction: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Nº Documento</Label>
              <Input
                value={form.document_number || ''}
                onChange={(e) => setForm({ ...form, document_number: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Input
                value={form.observations || ''}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { getBankHoursLedger, getBankHoursBalance } from '@/services/dp-enterprise'
import { dpCreate } from '@/services/dp'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { minutesToTime } from '@/lib/time-calculations'
import { Plus, Search, TrendingUp, TrendingDown, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export function DpBankHoursLedger() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await getBankHoursLedger())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('dp_bank_hours_ledger', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.employee_name || '').toLowerCase().includes(q)
  })

  const openNew = () => {
    setForm({ tipo: 'credito', data: new Date().toISOString().split('T')[0], situacao: 'Ativo' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.employee_name || !form.minutos) {
      toast.error('Colaborador e minutos são obrigatórios')
      return
    }
    setSaving(true)
    try {
      const minutos = parseInt(form.minutos) || 0
      const saldoAtual = await getBankHoursBalance(form.employee_name)
      const novoSaldo = form.tipo === 'credito' ? saldoAtual + minutos : saldoAtual - minutos
      await dpCreate('dp_bank_hours_ledger', {
        ...form,
        minutos,
        saldo_anterior: saldoAtual,
        saldo_atual: novoSaldo,
        aprovado: form.aprovado === 'true',
        aprovador: (user?.name as string) || 'Admin',
      })
      toast.success('Lançamento registrado')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  if (loading) return <DpLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Banco de Horas — Ledger</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar colaborador..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Nenhum lançamento encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <DpTable
          headers={[
            'Colaborador',
            'Data',
            'Tipo',
            'Descrição',
            'Minutos',
            'Saldo',
            'Validade',
            'Aprovado',
            'Situação',
          ]}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.tipo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.descricao || '—'}</td>
              <td className="px-3 py-3 font-bold">
                {r.tipo === 'credito' ? '+' : '-'}
                {minutesToTime(r.minutos || 0)}
              </td>
              <td className="px-3 py-3 font-bold text-[#005B2E]">
                {minutesToTime(r.saldo_atual || 0)}
              </td>
              <td className="px-3 py-3 text-xs">{r.validade || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.aprovado ? 'Sim' : 'Não'}</td>
              <td className="px-3 py-3">
                <DpStatusBadge status={r.situacao} />
              </td>
            </tr>
          ))}
        </DpTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Lançamento — Banco de Horas</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-sm font-semibold">Colaborador *</Label>
              <Input
                value={form.employee_name || ''}
                onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Data</Label>
              <Input
                type="date"
                value={form.data || ''}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo</Label>
              <Select
                value={form.tipo || 'credito'}
                onValueChange={(v) => setForm({ ...form, tipo: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="compensacao">Compensação</SelectItem>
                  <SelectItem value="expiracao">Expiração</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Minutos *</Label>
              <Input
                type="number"
                value={form.minutos || ''}
                onChange={(e) => setForm({ ...form, minutos: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Validade</Label>
              <Input
                type="date"
                value={form.validade || ''}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-sm font-semibold">Descrição</Label>
              <Input
                value={form.descricao || ''}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
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

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  getReverseOperations,
  createReverseOperation,
  updateReverseOperation,
} from '@/services/logistics'
import { getSalesReturns } from '@/services/sales'
import { getPurchaseReturns } from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { REVERSE_LOGISTICS_STATUS, REVERSE_LOGISTICS_TYPES } from '@/lib/logistics-types'
import { Plus, Search, Loader2, RotateCcw } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Solicitada: 'bg-amber-100 text-amber-700',
  Aprovada: 'bg-blue-100 text-blue-700',
  'Coleta Agendada': 'bg-cyan-100 text-cyan-700',
  Coletada: 'bg-indigo-100 text-indigo-700',
  'Em Conferência': 'bg-purple-100 text-purple-700',
  'Entrada no Estoque': 'bg-teal-100 text-teal-700',
  'Tratamento Fiscal': 'bg-orange-100 text-orange-700',
  Finalizada: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
}

export function LogisticsReverseLogistics() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [salesReturns, setSalesReturns] = useState(0)
  const [purchaseReturns, setPurchaseReturns] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [ops, sr, pr] = await Promise.all([
        getReverseOperations(),
        getSalesReturns().catch(() => []),
        getPurchaseReturns().catch(() => []),
      ])
      setRecords(ops)
      setSalesReturns(sr?.length || 0)
      setPurchaseReturns(pr?.length || 0)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_reverse_operations', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      String(r.numero_operacao || '')
        .toLowerCase()
        .includes(t) ||
      String(r.cliente_fornecedor || '')
        .toLowerCase()
        .includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      status: 'Solicitada',
      data_solicitacao: new Date().toISOString().split('T')[0],
      responsavel: (user?.name as string) || '',
      origem: 'Manual',
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createReverseOperation({
        ...form,
        numero_operacao: `REV-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        historico: [
          {
            action: 'Criada',
            user: user?.name || '',
            date: new Date().toISOString(),
          },
        ],
      })
      toast.success('Operação de logística reversa criada')
      setOpen(false)
      load()
    } catch {
      toast.error('Erro ao criar operação')
    }
    setSubmitting(false)
  }

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateReverseOperation(id, { status })
      toast.success('Status atualizado')
      load()
    } catch {
      toast.error('Erro ao atualizar status')
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
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar operação..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Operação
        </Button>
      </div>
      {(salesReturns > 0 || purchaseReturns > 0) && (
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <p className="text-xs text-muted-foreground">
            <RotateCcw className="w-3 h-3 inline mr-1" />
            Devoluções disponíveis: {salesReturns} de vendas, {purchaseReturns} de compras
          </p>
        </Card>
      )}
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Operação</th>
                <th className="text-left px-3 py-2 font-bold">Cliente/Fornecedor</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Origem</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-muted-foreground">
                    <RotateCcw className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhuma operação de logística reversa
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.numero_operacao}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.cliente_fornecedor || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{r.tipo_operacao || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">{r.origem || '—'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status as string] || 'bg-gray-100'}`}
                      >
                        {r.status as string}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <Select onValueChange={(v) => handleStatus(r.id as string, v)}>
                          <SelectTrigger className="h-7 w-36 text-xs focus-visible:ring-[#005B2E]">
                            <SelectValue placeholder="Alterar" />
                          </SelectTrigger>
                          <SelectContent>
                            {REVERSE_LOGISTICS_STATUS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Operação de Logística Reversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Tipo</Label>
                <Select
                  value={form.tipo_operacao}
                  onValueChange={(v) => setForm({ ...form, tipo_operacao: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVERSE_LOGISTICS_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Origem</Label>
                <Select value={form.origem} onValueChange={(v) => setForm({ ...form, origem: v })}>
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendas">Devolução de Vendas</SelectItem>
                    <SelectItem value="Compras">Devolução de Compras</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Cliente / Fornecedor</Label>
              <Input
                value={form.cliente_fornecedor || ''}
                onChange={(e) => setForm({ ...form, cliente_fornecedor: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Produto</Label>
                <Input
                  value={form.produto || ''}
                  onChange={(e) => setForm({ ...form, produto: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Quantidade</Label>
                <Input
                  value={form.quantidade || ''}
                  onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Motivo</Label>
              <Textarea
                value={form.motivo || ''}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
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
  getSalesOrders,
  getSalesReturns,
  createSalesReturn,
  updateSalesReturn,
  getNextSalesNumber,
  logSalesAudit,
} from '@/services/sales'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  STATUS_COLORS,
  SALES_RETURN_STATUS,
  RETURN_DESTINATIONS,
  FINANCIAL_TREATMENTS,
  type SalesOrder,
  type SalesReturn,
} from '@/lib/sales-types'
import { Search, Plus, Pencil, Loader2, FileText, X, Check } from 'lucide-react'
import { toast } from 'sonner'

export function SalesReturnsPanel() {
  const { user } = useAuth()
  const [returns, setReturns] = useState<SalesReturn[]>([])
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SalesReturn | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      const [rets, ords] = await Promise.all([getSalesReturns(), getSalesOrders()])
      setReturns(rets)
      setOrders(ords)
    } catch {
      setReturns([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_returns', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return returns.filter(
      (r) =>
        !term ||
        r?.return_number?.toLowerCase()?.includes(term) ||
        r?.client_name?.toLowerCase()?.includes(term) ||
        r?.order_number?.toLowerCase()?.includes(term),
    )
  }, [returns, search])

  const handleNew = () => {
    setEditing(null)
    setForm({ status: 'Solicitada' })
    setDialogOpen(true)
  }
  const handleEdit = (r: SalesReturn) => {
    setEditing(r)
    setForm({ ...r } as Record<string, string>)
    setDialogOpen(true)
  }

  const handleSave = async (finalize: boolean) => {
    try {
      const userName = (user?.name as string) || 'Sistema'
      const order = orders.find((o) => o.id === form.order_id)
      const data: Record<string, unknown> = {
        ...form,
        order_number: order?.order_number || '',
        client_name: order?.client_name || form.client_name,
        items: order?.items || [],
        total_value: order?.total_value || '0',
        status: finalize ? 'Finalizada' : form.status || 'Solicitada',
        responsible_user: userName,
        history: [
          ...(editing?.history || []),
          {
            action: finalize ? 'Finalizada' : 'Salvo',
            user: userName,
            date: new Date().toISOString(),
            note: '',
          },
        ],
      }
      if (editing) {
        await updateSalesReturn(editing.id, data)
        logSalesAudit(
          'update',
          'sales',
          editing.id,
          `Devolução ${editing.return_number} atualizada`,
        )
      } else {
        const { number } = await getNextSalesNumber('return')
        data.return_number = number
        await createSalesReturn(data)
        logSalesAudit('create', 'sales', '', `Devolução ${number} criada`)
      }
      toast.success(finalize ? 'Devolução finalizada' : 'Devolução salva')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar devolução')
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
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Devoluções de Vendas</h3>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Devolução
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por pedido, nota, cliente..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma devolução encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº Devolução</th>
                  <th className="text-left px-3 py-3 font-bold">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Pedido</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {r.return_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{r.client_name || '—'}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{r.order_number || '—'}</td>
                    <td className="px-3 py-3 font-bold">R$ {r.total_value || '0,00'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status] || ''}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(r)}
                        className="text-[#005B2E] hover:bg-[#005B2E]/10"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Devolução' : 'Nova Devolução'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Pedido de Venda</Label>
              <Select
                value={form.order_id || ''}
                onValueChange={(v) => {
                  const o = orders.find((ord) => ord.id === v)
                  setForm({ ...form, order_id: v, client_name: o?.client_name || '' })
                }}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione o pedido" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.order_number} — {o.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Motivo da Devolução</Label>
              <Textarea
                value={form.reason || ''}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Condição dos Produtos</Label>
                <Input
                  value={form.product_condition || ''}
                  onChange={(e) => setForm({ ...form, product_condition: e.target.value })}
                  placeholder="Ex: Novo, Avariado"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Destino dos Produtos</Label>
                <Select
                  value={form.destination || ''}
                  onValueChange={(v) => setForm({ ...form, destination: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_DESTINATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tratamento Financeiro</Label>
                <Select
                  value={form.financial_treatment || ''}
                  onValueChange={(v) => setForm({ ...form, financial_treatment: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCIAL_TREATMENTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Responsável pela Análise</Label>
                <Input
                  value={form.responsible_analyst || ''}
                  onChange={(e) => setForm({ ...form, responsible_analyst: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                value={form.status || 'Solicitada'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALES_RETURN_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea
                value={form.observations || ''}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              className="border-[#005B2E] text-[#005B2E]"
            >
              Salvar
            </Button>
            <Button
              onClick={() => handleSave(true)}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              <Check className="w-4 h-4 mr-2" /> Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

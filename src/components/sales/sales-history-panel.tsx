import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getSalesOrders, getSalesInvoices, getNfeRecords, getSalesReturns } from '@/services/sales'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  STATUS_COLORS,
  type SalesOrder,
  type SalesInvoice,
  type NfeRecord,
  type SalesReturn,
} from '@/lib/sales-types'
import { Search, Loader2, FileText, Eye, Printer, FileSpreadsheet, Copy } from 'lucide-react'
import { toast } from 'sonner'

export function SalesHistoryPanel() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [invoices, setInvoices] = useState<SalesInvoice[]>([])
  const [nfes, setNfes] = useState<NfeRecord[]>([])
  const [returns, setReturns] = useState<SalesReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timelineOrder, setTimelineOrder] = useState<SalesOrder | null>(null)

  const load = async () => {
    try {
      const [o, i, n, r] = await Promise.all([
        getSalesOrders(),
        getSalesInvoices(),
        getNfeRecords(),
        getSalesReturns(),
      ])
      setOrders(o)
      setInvoices(i)
      setNfes(n)
      setReturns(r)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return orders.filter((o) => {
      const ms =
        !term ||
        o?.order_number?.toLowerCase()?.includes(term) ||
        o?.client_name?.toLowerCase()?.includes(term) ||
        o?.salesperson_name?.toLowerCase()?.includes(term)
      const mf = statusFilter === 'all' || o?.status === statusFilter
      return ms && mf
    })
  }, [orders, search, statusFilter])

  const handlePrint = (o: SalesOrder) => {
    const html = `<!DOCTYPE html><html><head><title>Histórico ${o.order_number}</title></head><body style="font-family:Arial"><h1 style="color:#005B2E">Histórico de Venda ${o.order_number}</h1><p>Cliente: ${o.client_name}</p><p>Data: ${new Date(o.created).toLocaleDateString('pt-BR')}</p><p>Status: ${o.status}</p><p>Valor: R$ ${o.total_value}</p><script>window.onload=()=>window.print()</script></body></html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  const handleExport = () => {
    const headers = ['Data', 'Pedido', 'Cliente', 'Vendedor', 'Valor', 'Status']
    const rows = filtered.map((o) => [
      new Date(o.created).toLocaleDateString('pt-BR'),
      o.order_number,
      o.client_name,
      o.salesperson_name,
      `R$ ${o.total_value}`,
      o.status,
    ])
    const html = `<html><body><table border="1"><tr style="background:#005B2E;color:#fff">${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `historico_vendas_${new Date().toISOString().split('T')[0]}.xls`
    a.click()
    toast.success('Exportado com sucesso')
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
        <h3 className="text-lg font-bold">Histórico de Vendas</h3>
        <Button
          variant="outline"
          onClick={handleExport}
          className="border-[#005B2E] text-[#005B2E]"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por pedido, cliente, vendedor..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Faturado Totalmente">Faturado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma venda encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Data</th>
                  <th className="text-left px-3 py-3 font-bold">Pedido</th>
                  <th className="text-left px-3 py-3 font-bold">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Vendedor</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const inv = invoices.find((i) => i.order_id === o.id)
                  const nfe = nfes.find((n) => n.order_id === o.id)
                  const ret = returns.find((r) => r.order_id === o.id)
                  return (
                    <tr key={o.id} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-3 text-xs">
                        {new Date(o.created).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-mono font-bold text-[#C89B3C]">
                          {o.order_number}
                        </span>
                        {inv && (
                          <p className="text-[10px] text-muted-foreground">
                            NF: {inv.invoice_number}
                          </p>
                        )}
                        {nfe && (
                          <p className="text-[10px] text-muted-foreground">
                            NF-e: {nfe.nfe_number}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 font-medium">{o.client_name}</td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        {o.salesperson_name || '—'}
                      </td>
                      <td className="px-3 py-3 font-bold">R$ {o.total_value || '0,00'}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[o.status] || ''}`}
                        >
                          {o.status}
                        </span>
                        {ret && (
                          <p className="text-[10px] text-amber-600 mt-1">
                            Devolução: {ret.return_number}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setTimelineOrder(o)}
                            className="text-[#005B2E] hover:bg-[#005B2E]/10"
                            title="Visualizar Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePrint(o)}
                            className="text-[#005B2E] hover:bg-[#005B2E]/10"
                            title="Imprimir"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={!!timelineOrder} onOpenChange={(v) => !v && setTimelineOrder(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timeline — {timelineOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {timelineOrder && (
            <div className="space-y-3">
              <p className="text-sm">
                <strong>Cliente:</strong> {timelineOrder.client_name}
              </p>
              <p className="text-sm">
                <strong>Valor Total:</strong> R$ {timelineOrder.total_value}
              </p>
              <div className="border-l-2 border-[#005B2E]/30 pl-4 space-y-2">
                {timelineOrder.history?.map((h, i) => (
                  <div key={i} className="py-1">
                    <span className="text-xs font-bold text-[#005B2E]">{h.action}</span>
                    <p className="text-xs text-muted-foreground">
                      {h.user} — {new Date(h.date).toLocaleString('pt-BR')}
                    </p>
                    {h.note && <p className="text-xs">{h.note}</p>}
                  </div>
                ))}
                {timelineOrder.history?.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem histórico registrado.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

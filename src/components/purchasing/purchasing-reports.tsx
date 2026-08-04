import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getPurchaseRequests,
  getQuotations,
  getPurchaseOrders,
  getPurchaseInvoices,
} from '@/services/purchasing'
import { useAuth } from '@/hooks/use-auth'
import {
  type PurchaseRequest,
  type Quotation,
  type PurchaseOrder,
  type PurchaseInvoice,
} from '@/lib/purchasing-types'
import { printPurchasingReport, exportPurchasingXls } from '@/lib/purchasing-reports-export'
import { Printer, FileDown, FileSpreadsheet, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

const REPORT_TYPES = [
  { id: 'requests', label: 'Solicitações de Compra' },
  { id: 'quotations', label: 'Cotações' },
  { id: 'orders', label: 'Pedidos de Compra' },
  { id: 'supplier', label: 'Compras por Fornecedor' },
  { id: 'product', label: 'Compras por Produto' },
  { id: 'period', label: 'Compras por Período' },
  { id: 'cost_center', label: 'Compras por Centro de Custo' },
  { id: 'price_history', label: 'Histórico de Preços' },
  { id: 'savings', label: 'Economia obtida nas Cotações' },
]

export function PurchasingReports() {
  const { user } = useAuth()
  const [reportType, setReportType] = useState('requests')
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState(false)
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([])

  useEffect(() => {
    setLoading(true)
    setDataError(false)
    Promise.all([
      getPurchaseRequests(),
      getQuotations(),
      getPurchaseOrders(),
      getPurchaseInvoices(),
    ])
      .then(([r, q, o, i]) => {
        setRequests(r as unknown as PurchaseRequest[])
        setQuotations(q as unknown as Quotation[])
        setOrders(o as unknown as PurchaseOrder[])
        setInvoices(i as unknown as PurchaseInvoice[])
      })
      .catch(() => {
        setDataError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const report = useMemo(() => {
    const userName = (user?.name as string) || 'Usuário'
    switch (reportType) {
      case 'requests': {
        const headers = ['Nº', 'Solicitante', 'Empresa', 'Prioridade', 'Status', 'Data']
        const rows = requests.map((r) => [
          r.request_number || '—',
          r.requester || '—',
          r.company || '—',
          r.priority || '—',
          r.status || '—',
          r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—',
        ])
        return { headers, rows, title: 'Solicitações de Compra' }
      }
      case 'quotations': {
        const headers = ['Nº Cotação', 'Solicitação', 'Fornecedor Vencedor', 'Status', 'Data']
        const rows = quotations.map((q) => [
          q.quotation_number || '—',
          q.request_number || '—',
          q.winning_supplier_name || '—',
          q.status || '—',
          q.created ? new Date(q.created).toLocaleDateString('pt-BR') : '—',
        ])
        return { headers, rows, title: 'Cotações' }
      }
      case 'orders': {
        const headers = ['Nº Pedido', 'Fornecedor', 'Comprador', 'Valor Total', 'Status', 'Data']
        const rows = orders.map((o) => [
          o.order_number || '—',
          o.supplier_name || '—',
          o.buyer || '—',
          `R$ ${o.total_value || '0,00'}`,
          o.status || '—',
          o.created ? new Date(o.created).toLocaleDateString('pt-BR') : '—',
        ])
        return { headers, rows, title: 'Pedidos de Compra' }
      }
      case 'supplier': {
        const map: Record<string, { count: number; total: number }> = {}
        orders.forEach((o) => {
          const k = o.supplier_name || 'Sem fornecedor'
          if (!map[k]) map[k] = { count: 0, total: 0 }
          map[k].count++
          map[k].total += parseFloat(o.total_value) || 0
        })
        const headers = ['Fornecedor', 'Qtd. Pedidos', 'Valor Total']
        const rows = Object.entries(map).map(([k, v]) => [
          k,
          String(v.count),
          `R$ ${v.total.toFixed(2)}`,
        ])
        return { headers, rows, title: 'Compras por Fornecedor' }
      }
      case 'product': {
        const map: Record<string, { qty: number; total: number }> = {}
        orders.forEach((o) =>
          o.items?.forEach((it) => {
            const k = it.product || 'Sem produto'
            if (!map[k]) map[k] = { qty: 0, total: 0 }
            map[k].qty += parseFloat(it.quantity) || 0
            map[k].total += parseFloat(it.total) || 0
          }),
        )
        const headers = ['Produto', 'Qtd. Total', 'Valor Total']
        const rows = Object.entries(map).map(([k, v]) => [
          k,
          String(v.qty),
          `R$ ${v.total.toFixed(2)}`,
        ])
        return { headers, rows, title: 'Compras por Produto' }
      }
      case 'period': {
        const map: Record<string, { count: number; total: number }> = {}
        orders.forEach((o) => {
          if (!o.created) return
          const d = new Date(o.created)
          const k = `${d.getMonth() + 1}/${d.getFullYear()}`
          if (!map[k]) map[k] = { count: 0, total: 0 }
          map[k].count++
          map[k].total += parseFloat(o.total_value) || 0
        })
        const headers = ['Período', 'Qtd. Pedidos', 'Valor Total']
        const rows = Object.entries(map).map(([k, v]) => [
          k,
          String(v.count),
          `R$ ${v.total.toFixed(2)}`,
        ])
        return { headers, rows, title: 'Compras por Período' }
      }
      case 'cost_center': {
        const map: Record<string, number> = {}
        requests.forEach((r) => {
          const k = r.cost_center || 'Sem centro de custo'
          map[k] = (map[k] || 0) + 1
        })
        const headers = ['Centro de Custo', 'Qtd. Solicitações']
        const rows = Object.entries(map).map(([k, v]) => [k, String(v)])
        return { headers, rows, title: 'Compras por Centro de Custo' }
      }
      case 'price_history': {
        const headers = ['Produto', 'Preço Unit.', 'Nº NF', 'Fornecedor', 'Data']
        const rows: string[][] = []
        invoices.forEach((inv) =>
          inv.items?.forEach((it) =>
            rows.push([
              it.product || '—',
              `R$ ${it.unit_price || '0'}`,
              inv.invoice_number || '—',
              inv.supplier_name || '—',
              inv.created ? new Date(inv.created).toLocaleDateString('pt-BR') : '—',
            ]),
          ),
        )
        return { headers, rows, title: 'Histórico de Preços' }
      }
      case 'savings': {
        const headers = [
          'Nº Cotação',
          'Fornecedor Vencedor',
          'Menor Preço',
          'Preço Vencedor',
          'Economia',
        ]
        const rows: string[][] = []
        quotations.forEach((q) => {
          if (!q.supplier_quotes?.length) return
          const prices = q.supplier_quotes
            .map((s) => parseFloat(s.unit_value) || 0)
            .filter((v) => v > 0)
          if (prices.length < 2) return
          const lowest = Math.min(...prices)
          const winQuote = q.supplier_quotes.find((s) => s.supplier_id === q.winning_supplier_id)
          const winPrice = winQuote ? parseFloat(winQuote.unit_value) || 0 : 0
          const savings = winPrice - lowest
          rows.push([
            q.quotation_number || '—',
            q.winning_supplier_name || '—',
            `R$ ${lowest.toFixed(2)}`,
            `R$ ${winPrice.toFixed(2)}`,
            `R$ ${savings.toFixed(2)}`,
          ])
        })
        return { headers, rows, title: 'Economia obtida nas Cotações' }
      }
      default:
        return { headers: [], rows: [], title: '' }
    }
  }, [reportType, requests, quotations, orders, invoices, user])

  const userName = (user?.name as string) || 'Usuário'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatórios</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              if (!report.rows.length) {
                toast.error('Sem dados para exportar')
                return
              }
              printPurchasingReport(report.title, report.headers, report.rows, userName)
            }}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!report.rows.length) {
                toast.error('Sem dados para exportar')
                return
              }
              printPurchasingReport(report.title, report.headers, report.rows, userName)
            }}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileDown className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!report.rows.length) {
                toast.error('Sem dados para exportar')
                return
              }
              exportPurchasingXls(report.title, report.headers, report.rows, userName)
            }}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <Label className="text-xs mb-2 block">Tipo de Relatório</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {dataError ? (
        <Card className="border-2 border-dashed border-red-300">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-red-700">Erro ao carregar dados.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Não foi possível carregar os dados dos relatórios. Tente novamente mais tarde.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-[#005B2E] text-[#005B2E]"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : report.rows.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Sem dados para este relatório.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  {report.headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

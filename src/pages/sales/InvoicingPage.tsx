import { useState, useEffect, useMemo, useCallback } from 'react'
import { SalesPageWrapper } from '@/components/sales/sales-page-wrapper'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Receipt,
  FileCheck2,
  Eye,
  Printer,
  Download,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  Truck,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2,
  Boxes,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  invoiceSalesOrder,
  type SalesOrderRecord,
  type OrderItem,
  formatCurrency,
  formatDate,
} from '@/services/sales-invoicing-flow'
import type { SalesInvoice, NfeRecord } from '@/lib/sales-types'
import { getSalesInvoices, getNfeRecords } from '@/services/sales'
import { FocusNfePanel } from '@/components/fiscal/nfe-transmission'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export default function InvoicingPage() {
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Operador'

  // Lista de pedidos liberados para faturar
  const [orders, setOrders] = useState<SalesOrderRecord[]>([])
  const [invoices, setInvoices] = useState<SalesInvoice[]>([])
  const [nfeRecords, setNfeRecords] = useState<NfeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'fila' | 'notas'>('fila')

  // Seleção de pedido na fila
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  // Seleção de nota emitida
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  // Diálogo de faturar
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [invoicingLoading, setInvoicingLoading] = useState(false)
  const [carrierName, setCarrierName] = useState('')
  const [volumes, setVolumes] = useState('1')
  const [grossWeight, setGrossWeight] = useState('')
  const [netWeight, setNetWeight] = useState('')
  const [freightValue, setFreightValue] = useState('0')

  // Diálogo de visualização do pedido / nota
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<SalesInvoice | null>(null)

  // Diálogo Focus NFe para transmissão
  const [nfeTransmitDialogOpen, setNfeTransmitDialogOpen] = useState(false)
  const [nfeToTransmit, setNfeToTransmit] = useState<NfeRecord | null>(null)

  // Diálogo para visualizar XML
  const [xmlDialogOpen, setXmlDialogOpen] = useState(false)
  const [xmlContent, setXmlContent] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [allOrders, invList, nfeList] = await Promise.all([
        pb
          .collection('sales_orders')
          .getFullList<SalesOrderRecord>({
            filter: `faturamento_status = "pendente_faturamento" && is_invoiced != true`,
            sort: '-created',
          })
          .catch(async () => {
            // Fallback se não houver filtro composto: busca e filtra em memória
            const list = await pb.collection('sales_orders').getFullList<SalesOrderRecord>({
              sort: '-created',
            })
            return list.filter(
              (o) => o.faturamento_status === 'pendente_faturamento' && !o.is_invoiced,
            )
          }),
        getSalesInvoices().catch(() => [] as any),
        getNfeRecords().catch(() => [] as any),
      ])
      setOrders(allOrders)
      setInvoices(invList as SalesInvoice[])
      setNfeRecords(nfeList as NfeRecord[])
    } catch (err: any) {
      console.error('Erro ao carregar dados da Central de Faturamento:', err)
      toast.error('Erro ao carregar pedidos para faturamento')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('sales_orders', () => loadData())
  useRealtime('sales_invoices', () => loadData())
  useRealtime('nfe_records', () => loadData())

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  )

  const selectedOrderItems: OrderItem[] = useMemo(() => {
    if (!selectedOrder?.items) return []
    if (typeof selectedOrder.items === 'string') {
      try {
        return JSON.parse(selectedOrder.items) as OrderItem[]
      } catch {
        return []
      }
    }
    return Array.isArray(selectedOrder.items) ? (selectedOrder.items as OrderItem[]) : []
  }, [selectedOrder])

  const selectedInvoice = useMemo(
    () => invoices.find((i) => i.id === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId],
  )

  // Filtragem de pedidos na fila
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) =>
        o.order_number?.toLowerCase().includes(q) ||
        o.client_name?.toLowerCase().includes(q) ||
        o.company?.toLowerCase().includes(q) ||
        o.carrier_name?.toLowerCase().includes(q),
    )
  }, [orders, search])

  // Filtragem de notas emitidas
  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return invoices
    return invoices.filter(
      (inv) =>
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.order_number?.toLowerCase().includes(q) ||
        inv.client_name?.toLowerCase().includes(q) ||
        inv.carrier_name?.toLowerCase().includes(q),
    )
  }, [invoices, search])

  // Abre diálogo de faturamento pré-preenchendo dados do pedido selecionado
  const handleOpenInvoiceDialog = (order: SalesOrderRecord) => {
    setSelectedOrderId(order.id)
    setCarrierName(order.carrier_name || '')
    setVolumes(order.items && order.items.length > 0 ? String(order.items.length) : '1')
    setGrossWeight('')
    setNetWeight('')
    setFreightValue((order as any).freight_value || '0')
    setInvoiceDialogOpen(true)
  }

  // Executa faturamento através do serviço sales-invoicing-flow
  const handleConfirmInvoice = async () => {
    if (!selectedOrder) return
    setInvoicingLoading(true)
    try {
      const empId = selectedOrder.empresa_id || selectedOrder.company || 'default'
      const result = await invoiceSalesOrder(selectedOrder, empId, undefined, userName)
      if (!result.success) {
        throw new Error(result.error || 'Erro ao faturar pedido')
      }
      toast.success(
        `Nota ${result.numero_nota || ''} gerada com sucesso! Pedido #${selectedOrder.order_number} faturado.`,
      )
      setInvoiceDialogOpen(false)
      setSelectedOrderId(null)
      await loadData()
      // Troca para a aba de notas para o usuário ver a nota gerada
      setActiveTab('notas')
    } catch (err: any) {
      console.error('Falha ao faturar pedido:', err)
      toast.error(`Falha ao faturar: ${err.message || 'Erro desconhecido'}`)
    } finally {
      setInvoicingLoading(false)
    }
  }

  // Busca o registro de NFe correspondente a uma nota fiscal
  const findNfeRecordForInvoice = useCallback(
    (inv: SalesInvoice): NfeRecord | undefined => {
      return nfeRecords.find(
        (nfe) =>
          nfe.invoice_id === inv.id ||
          (inv.order_id && (nfe as any).sales_order_id === inv.order_id) ||
          (inv.order_id && (nfe as any).order_id === inv.order_id) ||
          (inv.order_number && (nfe as any).sales_order_number === inv.order_number),
      )
    },
    [nfeRecords],
  )

  // Ação: Visualizar DANFE ou Nota
  const handleViewDanfeOrInvoice = (inv: SalesInvoice) => {
    const nfe = findNfeRecordForInvoice(inv)
    if (nfe?.danfe_url) {
      window.open(nfe.danfe_url, '_blank', 'noopener,noreferrer')
      return
    }
    // Caso ainda não tenha danfe_url remoto, abre visualizador detalhado da nota
    setViewInvoice(inv)
    setViewInvoiceOpen(true)
  }

  // Ação: Imprimir / Baixar DANFE
  const handlePrintOrDownloadDanfe = async (inv: SalesInvoice) => {
    const nfe = findNfeRecordForInvoice(inv)

    // Se já temos a danfe_url (via Focus NFe ou upload), abre direto para impressão/download
    if (nfe?.danfe_url) {
      window.open(nfe.danfe_url, '_blank', 'noopener,noreferrer')
      return
    }

    // Se tem registro Focus NFe mas não baixou o DANFE direto, tenta consultar endpoint do Focus NFe
    if ((nfe as any)?.focus_nfe_ref || nfe?.chave_acesso) {
      try {
        toast.info('Consultando DANFE na Focus NFe...')
        const ref = (nfe as any)?.focus_nfe_ref || nfe?.chave_acesso
        const res = await pb.send(
          `/backend/v1/fiscal/focus-nfe/danfe?ref=${encodeURIComponent(ref)}`,
          {
            method: 'GET',
          },
        )
        if (res?.danfe_url) {
          window.open(res.danfe_url, '_blank', 'noopener,noreferrer')
          return
        }
      } catch {
        // Prossegue para o gerador de DANFE local/impressão
      }
    }

    // Impressão / visualização de espelho de DANFE local caso ainda não transmitido
    printLocalDanfeMirror(inv, nfe)
  }

  // Gera janela de impressão com layout de DANFE Simplificado / Espelho Fiscal
  const printLocalDanfeMirror = (inv: SalesInvoice, nfe?: NfeRecord) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      toast.error('O navegador bloqueou a abertura da janela de impressão')
      return
    }

    const items = (inv.items || []) as OrderItem[]
    const total = Number(inv.total_value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DANFE - NF-e ${inv.invoice_number}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; margin: 24px; color: #111; }
          .border-box { border: 2px solid #000; padding: 12px; margin-bottom: 12px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 12px; }
          .title { font-size: 20px; font-weight: bold; }
          .subtitle { font-size: 13px; color: #444; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px; font-size: 12px; }
          .grid-cell { background: #f9f9f9; padding: 6px; border: 1px solid #ddd; }
          .grid-label { font-weight: bold; font-size: 10px; color: #555; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          th { background: #eee; font-size: 11px; text-transform: uppercase; }
          .text-right { text-align: right; }
          .footer { margin-top: 24px; font-size: 11px; color: #666; text-align: center; border-top: 1px dashed #999; padding-top: 8px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">DANFE - DOCUMENTO AUXILIAR DA NF-e</div>
            <div class="subtitle">${inv.company || 'HURAM / JETRO'} | Filial: ${inv.branch || 'Matriz'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold;">NF-e Nº ${inv.invoice_number}</div>
            <div style="font-size: 11px;">Série: 1 | Emissão: ${new Date(inv.invoice_date || inv.created).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div class="border-box" style="margin-top: 12px;">
          <div class="grid-label">CHAVE DE ACESSO / IDENTIFICADOR</div>
          <div style="font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-top: 4px;">
            ${nfe?.chave_acesso || nfe?.focus_nfe_ref || 'HOMOLOGAÇÃO - AGUARDANDO PROTOCOLO SEFAZ'}
          </div>
          ${
            nfe?.focus_nfe_protocolo
              ? `<div style="font-size: 11px; color: #0284c7; margin-top: 4px;">Protocolo SEFAZ: ${nfe.focus_nfe_protocolo}</div>`
              : ''
          }
        </div>

        <div class="border-box">
          <div class="grid-label" style="margin-bottom: 6px;">DESTINATÁRIO / REMETENTE</div>
          <div class="grid">
            <div class="grid-cell" style="grid-column: span 2;">
              <div class="grid-label">Nome / Razão Social</div>
              <div style="font-weight: bold;">${inv.client_name || 'Consumidor Final'}</div>
            </div>
            <div class="grid-cell">
              <div class="grid-label">Pedido de Origem</div>
              <div>${inv.order_number || 'N/A'}</div>
            </div>
            <div class="grid-cell">
              <div class="grid-label">Data Emissão</div>
              <div>${new Date(inv.invoice_date || inv.created).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        </div>

        <div class="border-box">
          <div class="grid-label" style="margin-bottom: 6px;">DADOS DO TRANSPORTE / VOLUMES</div>
          <div class="grid">
            <div class="grid-cell" style="grid-column: span 2;">
              <div class="grid-label">Transportadora</div>
              <div>${inv.carrier_name || 'Próprio / Retirada'}</div>
            </div>
            <div class="grid-cell">
              <div class="grid-label">Quantidade Volumes</div>
              <div>${inv.volumes || 1}</div>
            </div>
            <div class="grid-cell">
              <div class="grid-label">Frete</div>
              <div>${Number(inv.freight_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            </div>
          </div>
        </div>

        <div class="border-box">
          <div class="grid-label" style="margin-bottom: 6px;">DADOS DOS PRODUTOS / SERVIÇOS</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Código</th>
                <th>Descrição do Produto</th>
                <th>Un</th>
                <th class="text-right">Qtd</th>
                <th class="text-right">Vlr Unit</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (it, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${it.product_code || '-'}</td>
                  <td>${it.product_name || 'Produto'}</td>
                  <td>${it.unit || 'UN'}</td>
                  <td class="text-right">${it.quantity || 0}</td>
                  <td class="text-right">${Number(it.unit_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">${Number(it.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="text-right" style="font-weight: bold; font-size: 13px;">TOTAL DA NOTA:</td>
                <td class="text-right" style="font-weight: bold; font-size: 13px;">${total}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="footer">
          Documento Auxiliar emitido pelo ERP Huram - Jetro On-line • Operador: ${inv.responsible_user || 'Sistema'}
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 24px; font-size: 14px; font-weight: bold; cursor: pointer; background: #0284c7; color: #fff; border: none; border-radius: 4px;">
            Imprimir DANFE
          </button>
        </div>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  // Transmitir NF-e via Focus NFe
  const handleTransmitNfe = (inv: SalesInvoice) => {
    const nfe = findNfeRecordForInvoice(inv)
    if (nfe && nfe.chave_acesso) {
      setNfeToTransmit(nfe)
      setNfeTransmitDialogOpen(true)
    } else {
      toast.error('Registro ou Chave de Acesso da NF-e não localizados para esta nota.')
    }
  }

  // Visualizar XML
  const handleViewXml = (inv: SalesInvoice) => {
    const nfe = findNfeRecordForInvoice(inv)
    if (nfe?.xml_conteudo) {
      setXmlContent(nfe.xml_conteudo)
      setXmlDialogOpen(true)
    } else if (nfe?.xml_url) {
      window.open(nfe.xml_url, '_blank', 'noopener,noreferrer')
    } else {
      toast.info('XML da nota ainda não gerado pela Sefaz/Focus NFe.')
    }
  }

  // Colunas da JetroTable para FILA DE FATURAMENTO (Pedidos Liberados)
  const readyOrdersColumns = useMemo<JetroColumnDef<SalesOrderRecord>[]>(() => {
    return [
      {
        id: 'order_number',
        header: 'Nº Pedido',
        accessorKey: 'order_number',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
            {row.order_number}
          </span>
        ),
      },
      {
        id: 'client_name',
        header: 'Cliente',
        accessorKey: 'client_name',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.client_name || 'Não informado'}</div>
            {row.customer_cnpj && (
              <div className="text-xs text-muted-foreground font-mono">{row.customer_cnpj}</div>
            )}
          </div>
        ),
      },
      {
        id: 'company',
        header: 'Empresa / Filial',
        accessorKey: 'company',
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-semibold">{row.company || 'Padrão'}</span>
            {row.branch && <span className="text-muted-foreground"> / {row.branch}</span>}
          </div>
        ),
      },
      {
        id: 'created',
        header: 'Data Liberação',
        accessorKey: 'created',
        cell: ({ row }) => {
          const dt = row.liberado_faturamento_at || row.updated || row.created
          return (
            <span className="text-xs text-muted-foreground">
              {dt ? new Date(dt).toLocaleString('pt-BR') : '-'}
            </span>
          )
        },
      },
      {
        id: 'carrier_name',
        header: 'Transportadora',
        accessorKey: 'carrier_name',
        cell: ({ row }) => <span className="text-xs">{row.carrier_name || 'A definir'}</span>,
      },
      {
        id: 'items_count',
        header: 'Itens',
        cell: ({ row }) => {
          const itemsArr = Array.isArray(row.items) ? row.items : []
          return (
            <Badge variant="outline" className="text-xs">
              {itemsArr.length} ite{itemsArr.length === 1 ? 'm' : 'ns'}
            </Badge>
          )
        },
      },
      {
        id: 'total_value',
        header: 'Valor Total',
        accessorKey: 'total_value',
        cell: ({ row }) => {
          const val = Number(row.total_value || 0)
          return (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Badge className="bg-sky-600 hover:bg-sky-700 text-white border-0 text-xs font-semibold">
            <FileCheck2 className="w-3 h-3 mr-1" />
            {row.faturamento_status === 'pendente_faturamento' ||
            row.faturamento_status === 'liberado'
              ? 'Liberado para Faturar'
              : row.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Ação',
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenInvoiceDialog(row)
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Receipt className="w-4 h-4 mr-1" />
            Faturar
          </Button>
        ),
      },
    ]
  }, [])

  // Colunas da JetroTable para NOTAS FISCAIS EMITIDAS
  const invoicesColumns = useMemo<JetroColumnDef<SalesInvoice>[]>(() => {
    return [
      {
        id: 'invoice_number',
        header: 'Nº Nota (NF)',
        accessorKey: 'invoice_number',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
            {row.invoice_number}
          </span>
        ),
      },
      {
        id: 'order_number',
        header: 'Pedido Origem',
        accessorKey: 'order_number',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="font-mono text-xs border-sky-300 text-sky-700 dark:text-sky-300"
          >
            {row.order_number || 'N/A'}
          </Badge>
        ),
      },
      {
        id: 'client_name',
        header: 'Cliente',
        accessorKey: 'client_name',
        cell: ({ row }) => <span className="font-medium text-xs">{row.client_name || '-'}</span>,
      },
      {
        id: 'invoice_date',
        header: 'Data Emissão',
        accessorKey: 'invoice_date',
        cell: ({ row }) => {
          const dt = row.invoice_date || row.created
          return (
            <span className="text-xs text-muted-foreground">
              {dt ? new Date(dt).toLocaleString('pt-BR') : '-'}
            </span>
          )
        },
      },
      {
        id: 'carrier_name',
        header: 'Transportadora',
        accessorKey: 'carrier_name',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.carrier_name || '-'}</span>
        ),
      },
      {
        id: 'total_value',
        header: 'Valor da Nota',
        accessorKey: 'total_value',
        cell: ({ row }) => {
          const val = Number(row.total_value || 0)
          return (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
              {val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )
        },
      },
      {
        id: 'nfe_status',
        header: 'Status Sefaz/Focus',
        cell: ({ row }) => {
          const nfe = findNfeRecordForInvoice(row)
          if (!nfe) {
            return (
              <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                Pendente Envio
              </Badge>
            )
          }
          if ((nfe as any).focus_nfe_status_sefaz === 'autorizado' || nfe.status === 'Autorizada') {
            return (
              <Badge className="bg-emerald-600 text-white text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Autorizada
              </Badge>
            )
          }
          if ((nfe as any).focus_nfe_status_sefaz === 'rejeitado' || nfe.status === 'Rejeitada') {
            return (
              <Badge variant="destructive" className="text-xs">
                Rejeitada
              </Badge>
            )
          }
          return (
            <Badge variant="secondary" className="text-xs">
              {(nfe as any).focus_nfe_status_sefaz || nfe.status || 'Gerada'}
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        header: 'Ações Fiscais',
        cell: ({ row }) => {
          const inv = row
          const nfe = findNfeRecordForInvoice(inv)
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-sky-700 hover:text-sky-800 hover:bg-sky-50"
                      onClick={() => handleViewDanfeOrInvoice(inv)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualizar Nota / DANFE</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                      onClick={() => handlePrintOrDownloadDanfe(inv)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Imprimir / Baixar DANFE</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                      onClick={() => handleTransmitNfe(inv)}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Transmitir Sefaz (Focus NFe)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {(nfe as any)?.xml_conteudo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-700 hover:bg-slate-100"
                        onClick={() => handleViewXml(inv)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver XML</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )
        },
      },
    ]
  }, [findNfeRecordForInvoice])

  // Totalizador da fila
  const totalFilaValor = useMemo(
    () => orders.reduce((acc, o) => acc + Number(o.total_value || 0), 0),
    [orders],
  )

  const totalNotasValor = useMemo(
    () => invoices.reduce((acc, i) => acc + Number(i.total_value || 0), 0),
    [invoices],
  )

  return (
    <SalesPageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Central de Faturamento
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Emissão e acompanhamento de Notas Fiscais dos pedidos liberados (Ciclo Huram)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData()}
          disabled={loading}
          className="gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Card className="border-l-4 border-l-sky-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pedidos Liberados p/ Faturar
              </div>
              <div className="text-2xl font-bold mt-1 text-sky-700 dark:text-sky-300">
                {orders.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Total:{' '}
                {totalFilaValor.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </div>
            <div className="p-3 bg-sky-100 dark:bg-sky-950/50 rounded-xl text-sky-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Notas Emitidas (Faturadas)
              </div>
              <div className="text-2xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
                {invoices.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Total:{' '}
                {totalNotasValor.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
              <Receipt className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Focus NFe / Transmissões
              </div>
              <div className="text-2xl font-bold mt-1 text-purple-700 dark:text-purple-300">
                {nfeRecords.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {nfeRecords.filter((n) => n.focus_nfe_status_sefaz === 'autorizado').length}{' '}
                autorizadas na Sefaz
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-950/50 rounded-xl text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Abas e Busca */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-lg border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('fila')
              setSelectedInvoiceId(null)
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'fila'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Fila de Faturamento ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('notas')
              setSelectedOrderId(null)
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'notas'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Notas Emitidas ({invoices.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === 'fila'
                  ? 'Buscar por número, cliente...'
                  : 'Buscar nota, pedido, cliente...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {activeTab === 'fila' && selectedOrder && (
            <Button
              size="sm"
              onClick={() => handleOpenInvoiceDialog(selectedOrder)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              Faturar Selecionado ({selectedOrder.order_number})
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'fila' ? (
        <div className="space-y-4">
          <div className="border rounded-lg bg-card overflow-hidden">
            <JetroTable
              screenId="vendas.faturamento.fila"
              columns={readyOrdersColumns}
              data={filteredOrders}
              rowKey="id"
              onRowClick={(row) => setSelectedOrderId(selectedOrderId === row.id ? null : row.id)}
              emptyMessage="Nenhum pedido liberado para faturamento no momento. Os pedidos aparecem aqui após a ação 'Liberar Faturamento'."
            />
          </div>

          {/* Master-Detalhe: Itens do Pedido Selecionado na Fila */}
          {selectedOrder && (
            <Card className="border shadow-sm animate-in fade-in-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      Pedido Selecionado:
                    </span>
                    <h3 className="text-base font-bold text-sky-800 dark:text-sky-300">
                      {selectedOrder.order_number} — {selectedOrder.client_name || 'Cliente'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenInvoiceDialog(selectedOrder)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Faturar este Pedido
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                        <th className="py-2 px-3 font-semibold">Código</th>
                        <th className="py-2 px-3 font-semibold">Produto</th>
                        <th className="py-2 px-3 font-semibold">Un</th>
                        <th className="py-2 px-3 font-semibold text-right">Qtd</th>
                        <th className="py-2 px-3 font-semibold text-right">Preço Unit.</th>
                        <th className="py-2 px-3 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrderItems.map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2 px-3 font-mono text-muted-foreground">
                            {it.product_code || '-'}
                          </td>
                          <td className="py-2 px-3 font-medium">{it.product_name || 'Produto'}</td>
                          <td className="py-2 px-3">{it.unit || 'UN'}</td>
                          <td className="py-2 px-3 text-right font-semibold">{it.quantity}</td>
                          <td className="py-2 px-3 text-right">
                            {Number(it.unit_price || 0).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                            {Number(it.total || 0).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-muted/20 font-bold">
                        <td colSpan={5} className="py-2.5 px-3 text-right">
                          Total do Pedido:
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 text-sm">
                          {Number(selectedOrder.total_value || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg bg-card overflow-hidden">
            <JetroTable
              screenId="vendas.faturamento.notas"
              columns={invoicesColumns}
              data={filteredInvoices}
              rowKey="id"
              onRowClick={(row) =>
                setSelectedInvoiceId(selectedInvoiceId === row.id ? null : row.id)
              }
              emptyMessage="Nenhuma nota fiscal emitida até o momento."
            />
          </div>

          {/* Master-Detalhe: Detalhes da Nota Fiscal Selecionada */}
          {selectedInvoice && (
            <Card className="border shadow-sm animate-in fade-in-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      Nota Fiscal Selecionada:
                    </span>
                    <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                      NF Nº {selectedInvoice.invoice_number} • Pedido Origem:{' '}
                      <span className="font-mono text-sky-700 dark:text-sky-400">
                        {selectedInvoice.order_number || 'N/A'}
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDanfeOrInvoice(selectedInvoice)}
                      className="gap-1.5 text-xs text-sky-700 hover:text-sky-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePrintOrDownloadDanfe(selectedInvoice)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir / Baixar DANFE
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/20 p-3 rounded-md">
                  <div>
                    <span className="text-muted-foreground block">Cliente:</span>
                    <span className="font-semibold">{selectedInvoice.client_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Data Faturamento:</span>
                    <span className="font-semibold">
                      {new Date(
                        selectedInvoice.invoice_date || selectedInvoice.created,
                      ).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Transportadora / Volumes:</span>
                    <span className="font-semibold">
                      {selectedInvoice.carrier_name || 'Próprio'} ({selectedInvoice.volumes || 1}{' '}
                      vol)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Valor Total da Nota:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {Number(selectedInvoice.total_value || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>

                {/* Itens gravados na nota */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                        <th className="py-2 px-3 font-semibold">Item</th>
                        <th className="py-2 px-3 font-semibold">Código</th>
                        <th className="py-2 px-3 font-semibold">Descrição</th>
                        <th className="py-2 px-3 font-semibold">Un</th>
                        <th className="py-2 px-3 font-semibold text-right">Qtd</th>
                        <th className="py-2 px-3 font-semibold text-right">Unitário</th>
                        <th className="py-2 px-3 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {((selectedInvoice.items || []) as OrderItem[]).map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2 px-3 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">
                            {it.product_code || '-'}
                          </td>
                          <td className="py-2 px-3 font-medium">{it.product_name || 'Produto'}</td>
                          <td className="py-2 px-3">{it.unit || 'UN'}</td>
                          <td className="py-2 px-3 text-right font-semibold">{it.quantity}</td>
                          <td className="py-2 px-3 text-right">
                            {Number(it.unit_price || 0).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                            {Number(it.total || 0).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* DIÁLOGO: Confirmar Faturamento e Gerar NF */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <Receipt className="w-5 h-5" />
              Emitir Nota Fiscal (Faturamento)
            </DialogTitle>
            <DialogDescription>
              Confirme os dados de expedição para faturar o pedido{' '}
              <strong className="text-foreground">{selectedOrder?.order_number}</strong>. Uma nova
              NF será gerada referenciando este pedido de origem.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-bold">{selectedOrder.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empresa / Filial:</span>
                  <span>
                    {selectedOrder.company || 'Padrão'} / {selectedOrder.branch || 'Matriz'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Itens / Valor:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedOrder.items?.length || 0} itens •{' '}
                    {Number(selectedOrder.total_value || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="inv-carrier" className="text-xs">
                    Transportadora
                  </Label>
                  <Input
                    id="inv-carrier"
                    placeholder="Nome da transportadora"
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inv-vol" className="text-xs">
                    Volumes
                  </Label>
                  <Input
                    id="inv-vol"
                    type="number"
                    min="1"
                    value={volumes}
                    onChange={(e) => setVolumes(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inv-freight" className="text-xs">
                    Valor do Frete (R$)
                  </Label>
                  <Input
                    id="inv-freight"
                    type="number"
                    step="0.01"
                    value={freightValue}
                    onChange={(e) => setFreightValue(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inv-gw" className="text-xs">
                    Peso Bruto (kg)
                  </Label>
                  <Input
                    id="inv-gw"
                    placeholder="Ex: 120.5"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inv-nw" className="text-xs">
                    Peso Líquido (kg)
                  </Label>
                  <Input
                    id="inv-nw"
                    placeholder="Ex: 110.0"
                    value={netWeight}
                    onChange={(e) => setNetWeight(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInvoiceDialogOpen(false)}
              disabled={invoicingLoading}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmInvoice}
              disabled={invoicingLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {invoicingLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Gerando Nota...
                </>
              ) : (
                <>
                  <Receipt className="w-3.5 h-3.5" />
                  Confirmar e Faturar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: Visualizador Detalhado da Nota */}
      <Dialog open={viewInvoiceOpen} onOpenChange={setViewInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sky-700">
              <FileText className="w-5 h-5" />
              Detalhes da Nota Fiscal Nº {viewInvoice?.invoice_number}
            </DialogTitle>
            <DialogDescription>
              Pedido de Origem: <strong>{viewInvoice?.order_number || 'N/A'}</strong>
            </DialogDescription>
          </DialogHeader>

          {viewInvoice && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-muted-foreground block">Cliente:</span>
                  <span className="font-bold">{viewInvoice.client_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Data Emissão:</span>
                  <span>
                    {new Date(viewInvoice.invoice_date || viewInvoice.created).toLocaleString(
                      'pt-BR',
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Transportadora:</span>
                  <span>{viewInvoice.carrier_name || 'Própria'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Volumes / Frete:</span>
                  <span>
                    {viewInvoice.volumes || 1} vol •{' '}
                    {Number(viewInvoice.freight_value || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Itens Faturados</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="py-1.5 px-2 text-left">Código</th>
                        <th className="py-1.5 px-2 text-left">Produto</th>
                        <th className="py-1.5 px-2 text-right">Qtd</th>
                        <th className="py-1.5 px-2 text-right">Vlr Unit</th>
                        <th className="py-1.5 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {((viewInvoice.items || []) as OrderItem[]).map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2 font-mono text-muted-foreground">
                            {it.product_code || '-'}
                          </td>
                          <td className="py-1.5 px-2">{it.product_name}</td>
                          <td className="py-1.5 px-2 text-right">{it.quantity}</td>
                          <td className="py-1.5 px-2 text-right">
                            {Number(it.unit_price || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-1.5 px-2 text-right font-semibold">
                            {Number(it.total || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t bg-muted/20 font-bold">
                      <tr>
                        <td colSpan={4} className="py-2 px-2 text-right">
                          Total da Nota:
                        </td>
                        <td className="py-2 px-2 text-right text-emerald-700">
                          {Number(viewInvoice.total_value || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewInvoiceOpen(false)}>
              Fechar
            </Button>
            {viewInvoice && (
              <Button
                size="sm"
                onClick={() => handlePrintOrDownloadDanfe(viewInvoice)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir DANFE
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: XML da NF-e */}
      <Dialog open={xmlDialogOpen} onOpenChange={setXmlDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-sky-600" />
              XML da NF-e
            </DialogTitle>
            <DialogDescription>
              Estrutura XML oficial do documento fiscal eletrônico
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-900 text-slate-100 p-4 rounded-md font-mono text-xs">
            <pre className="whitespace-pre-wrap">{xmlContent}</pre>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([xmlContent], { type: 'application/xml' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `nfe-${Date.now()}.xml`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Baixar Arquivo XML
            </Button>
            <Button size="sm" onClick={() => setXmlDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Transmissão Focus NFe */}
      <Dialog
        open={nfeTransmitDialogOpen}
        onOpenChange={(open) => {
          setNfeTransmitDialogOpen(open)
          if (!open) loadData()
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              Transmissão Focus NFe — Sefaz
            </DialogTitle>
            <DialogDescription>
              Status e comunicação em tempo real com os servidores da Sefaz via Focus NFe API
            </DialogDescription>
          </DialogHeader>
          {nfeToTransmit?.chave_acesso ? (
            <div className="py-2">
              <FocusNfePanel chaveAcesso={nfeToTransmit.chave_acesso} />
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Chave de acesso não localizada para transmissão.
            </div>
          )}
          <DialogFooter>
            <Button
              size="sm"
              onClick={() => {
                setNfeTransmitDialogOpen(false)
                loadData()
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SalesPageWrapper>
  )
}

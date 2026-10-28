import React, { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Building,
  DollarSign,
  Package,
  Truck,
  FileCheck,
  History,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useSystemParams } from '@/hooks/use-system-params'
import {
  getClients,
  getSalespeople,
  getCarriers,
  getPriceTableList,
  getPaymentConditions,
  getPaymentMethods,
  createSalesOrder,
  updateSalesOrder,
  getNextSalesNumber,
  logSalesAudit,
} from '@/services/sales'
import { getProducts } from '@/services/products'

import { FREIGHT_TYPES, type SalesOrder, type SalesOrderItem } from '@/lib/sales-types'
import {
  fiscalCfopService,
  resolveCfopByOperation,
  findMatchingCfop,
  determineCfop,
} from '@/lib/fiscal-cfop-service'
import { StandardOrderHeader } from './standard-order-header'
import { StandardOrderSummary } from './standard-order-summary'
import { StandardOrderActions } from './standard-order-actions'
import {
  validateSalesOrder,
  calculateItemMargin,
  normalizeSalesOrderStatus,
  type SalesItemRuleInput,
  type SalesPartnerCreditInfo,
} from '@/lib/order-sales-rules'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  order: SalesOrder | null
  onSaved: () => void
}

interface ItemRow extends SalesOrderItem {
  cfop?: string
  cost_average?: string // Somente leitura
  cost_replacement?: string // Somente leitura
  ncm?: string
  margin_percent?: string
}

const emptyItem: ItemRow = {
  code: '',
  product: '',
  unit: 'UN',
  quantity: '1',
  available_stock: '0',
  table_price: '0',
  unit_price: '0',
  discount: '0',
  addition: '0',
  total: '0',
  margin: '0',
  situation: 'OK',
  cfop: '5102',
  cost_average: '0',
  cost_replacement: '0',
  ncm: '',
  margin_percent: '0',
}

export function SalesOrderStandardEditor({ open, onOpenChange, order, onSaved }: Props) {
  const { user } = useAuth()
  const { getParamNumber } = useSystemParams()
  const maxDiscountParam = getParamNumber('Vendas', 'max_discount', 15)
  const minMarginParam = getParamNumber('Vendas', 'min_margin', 10)

  const [activeTab, setActiveTab] = useState('geral')
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [salespeople, setSalespeople] = useState<Array<Record<string, unknown>>>([])
  const [carriers, setCarriers] = useState<Array<Record<string, unknown>>>([])
  const [priceTables, setPriceTables] = useState<Array<Record<string, unknown>>>([])
  const [payConditions, setPayConditions] = useState<Array<Record<string, unknown>>>([])
  const [payMethods, setPayMethods] = useState<Array<Record<string, unknown>>>([])

  // Estado do formulário
  const [form, setForm] = useState<Record<string, string>>({})
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItem }])
  const [selectedPartner, setSelectedPartner] = useState<Record<string, unknown> | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [approvalReasons, setApprovalReasons] = useState<string[]>([])

  // Carrega listas de apoio
  useEffect(() => {
    if (open) {
      Promise.all([
        getProducts().catch(() => []),
        getClients().catch(() => []),
        getSalespeople().catch(() => []),
        getCarriers().catch(() => []),
        getPriceTableList().catch(() => []),
        getPaymentConditions().catch(() => []),
        getPaymentMethods().catch(() => []),
      ]).then(([prods, cls, sps, cars, pts, pcs, pms]) => {
        setProducts(prods as Array<Record<string, unknown>>)
        setClients(cls)
        setSalespeople(sps)
        setCarriers(cars)
        setPriceTables(pts)
        setPayConditions(pcs)
        setPayMethods(pms)
      })

      if (order) {
        setForm({
          id: order.id,
          order_number: order.order_number,
          client_id: order.client_id || '',
          client_name: order.client_name || '',
          company: order.company || 'DEC Eldorado',
          branch: order.branch || 'Matriz',
          operation_type: order.operation_type || 'Venda Mercadoria',
          salesperson_name: order.salesperson_name || '',
          price_table_id: order.price_table_id || '',
          payment_condition: order.payment_condition || '',
          payment_method: order.payment_method || '',
          delivery_date: order.delivery_date || '',
          carrier_name: order.carrier_name || '',
          freight_type: order.freight_type || 'CIF',
          delivery_address: order.delivery_address || '',
          cost_center: order.cost_center || 'COMERCIAL',
          internal_notes: order.internal_notes || '',
          fiscal_notes: order.fiscal_notes || '',
          freight_value: order.freight_value || '0',
          insurance_value: order.insurance_value || '0',
          other_expenses: order.other_expenses || '0',
          status: order.status || 'Rascunho',
          channel: (order as unknown as { channel?: string }).channel || 'Direto',
          customer_cnpj: (order as unknown as { customer_cnpj?: string }).customer_cnpj || '',
          customer_ie: (order as unknown as { customer_ie?: string }).customer_ie || '',
          customer_email: (order as unknown as { customer_email?: string }).customer_email || '',
          customer_phone: (order as unknown as { customer_phone?: string }).customer_phone || '',
        })
        const parsedItems: ItemRow[] = (order.items || []).map((it) => ({
          ...emptyItem,
          ...it,
          cfop: (it as unknown as { cfop?: string }).cfop || '5102',
          cost_average: (it as unknown as { cost_average?: string }).cost_average || '0',
          cost_replacement:
            (it as unknown as { cost_replacement?: string }).cost_replacement || '0',
        }))
        setItems(parsedItems.length > 0 ? parsedItems : [{ ...emptyItem }])
      } else {
        setForm({
          order_number: '',
          company: 'DEC Eldorado',
          branch: 'Matriz',
          operation_type: 'Venda Padrão',
          freight_type: 'CIF',
          freight_value: '0',
          insurance_value: '0',
          other_expenses: '0',
          status: 'Rascunho',
          channel: 'Direto',
        })
        setItems([{ ...emptyItem }])
        setSelectedPartner(null)
      }
      setValidationErrors([])
      setValidationWarnings([])
      setApprovalReasons([])
    }
  }, [open, order])

  // Vincula parceiro selecionado aos dados automáticos
  useEffect(() => {
    if (form.client_id && clients.length > 0) {
      const match = clients.find((c) => c.id === form.client_id)
      if (match) {
        setSelectedPartner(match)
        setForm((prev) => ({
          ...prev,
          client_name:
            (match.full_name as string) || (match.company_name as string) || prev.client_name,
          customer_cnpj: (match.cnpj as string) || (match.cpf as string) || '',
          customer_ie: (match.state_registration as string) || (match.ie as string) || '',
          customer_email: (match.email as string) || '',
          customer_phone: (match.phone as string) || (match.cellphone as string) || '',
          delivery_address:
            prev.delivery_address ||
            `${match.address_street || ''}, ${match.address_number || ''} - ${match.address_neighborhood || ''}, ${match.address_city || ''}/${match.address_state || ''}`,
          price_table_id: prev.price_table_id || (match.price_table_id as string) || '',
          salesperson_name: prev.salesperson_name || (match.salesperson_name as string) || '',
        }))
      }
    }
  }, [form.client_id, clients])

  // Cálculos financeiros
  const grossValue = useMemo(() => {
    return items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0)
  }, [items])

  const discountsValue = useMemo(() => {
    return items.reduce((s, i) => s + (parseFloat(i.discount) || 0), 0)
  }, [items])

  const additionsValue = useMemo(() => {
    return items.reduce((s, i) => s + (parseFloat(i.addition) || 0), 0)
  }, [items])

  const freightValue = parseFloat(form.freight_value) || 0
  const insuranceValue = parseFloat(form.insurance_value) || 0
  const expensesValue = parseFloat(form.other_expenses) || 0

  const totalValue = Math.max(
    0,
    grossValue - discountsValue + additionsValue + freightValue + insuranceValue + expensesValue,
  )

  // Margem global consolidada (Custo Médio SOMENTE LEITURA)
  const totalCost = useMemo(() => {
    return items.reduce((s, i) => {
      const qty = parseFloat(i.quantity) || 0
      const costAvg = parseFloat(i.cost_average || '0') || 0
      return s + costAvg * qty
    }, 0)
  }, [items])

  const totalMarginValue = Math.max(0, totalValue - totalCost)
  const totalMarginPercent = totalValue > 0 ? (totalMarginValue / totalValue) * 100 : 0

  // Atualização de item da tabela
  const updateItem = (index: number, field: keyof ItemRow, val: string) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it
        const next = { ...it, [field]: val }

        // Se alterou o produto, preenche dados mestres oficiais (incluindo custos protegidos)
        if (field === 'product') {
          const prod = products.find((p) => (p.name as string) === val)
          if (prod) {
            next.code = (prod.code as string) || ''
            next.unit = (prod.unit as string) || 'UN'
            next.available_stock = String((prod.stock as number) ?? 0)
            next.table_price = String((prod.price as number) ?? (prod.price as string) ?? '0')
            next.unit_price = String((prod.price as number) ?? (prod.price as string) ?? '0')
            // CUSTO MÉDIO E CUSTO DE REPOSIÇÃO OFICIAIS (SOMENTE LEITURA)
            next.cost_average = String(
              (prod.cost_average as number) ?? (prod.cost_price as number) ?? '0',
            )
            next.cost_replacement = String(
              (prod.last_cost as number) ?? (prod.cost_price as number) ?? '0',
            )
            next.ncm = (prod.ncm as string) || ''

            // Determina CFOP a partir do motor fiscal ativo (não editável à mão)
            const clientUf = (selectedPartner?.address_state as string) || 'ES'
            const isInterestadual = clientUf !== 'ES'
            const isIndustrializado = (prod.item_type as string) === 'produto_acabado'
            const fallbackCfop = isInterestadual
              ? isIndustrializado
                ? '6101'
                : '6102'
              : isIndustrializado
                ? '5101'
                : '5102'
            next.cfop = fallbackCfop

            // Chama motor fiscal assíncrono para resolução precisa por item
            fiscalCfopService
              .determineCfop({
                operacao_codigo: (form.operation_type as string) || 'VENDA_MERCADORIA',
                uf_emitente: 'ES',
                uf_destinatario: clientUf,
                itens: [
                  {
                    codigo: (prod.code as string) || '',
                    descricao: (prod.name as string) || '',
                    procedencia: isIndustrializado ? 'producao_propria' : 'mercadoria_terceiros',
                  },
                ],
              })
              .then((res) => {
                if (res.itens && res.itens[0]?.cfop) {
                  const resolvedCfop = res.itens[0].cfop
                  setItems((currentItems) =>
                    currentItems.map((item, i) =>
                      i === index ? { ...item, cfop: resolvedCfop } : item,
                    ),
                  )
                }
              })
              .catch(() => {
                // Mantém fallback caso serviço não responda
              })
          }
        }

        // Recalcular totais e margens do item
        if (['quantity', 'unit_price', 'discount', 'addition', 'product'].includes(field)) {
          const qty = parseFloat(next.quantity) || 0
          const unitP = parseFloat(next.unit_price) || 0
          const disc = parseFloat(next.discount) || 0
          const add = parseFloat(next.addition) || 0
          const costAvg = parseFloat(next.cost_average || '0') || 0

          const lineTotal = Math.max(0, qty * unitP - disc + add)
          next.total = lineTotal.toFixed(2)

          const marginCalc = calculateItemMargin(unitP, disc, add, qty, costAvg)
          next.margin_percent = marginCalc.marginPercent.toFixed(1)
          next.margin = marginCalc.marginTotal.toFixed(2)

          const avail = parseFloat(next.available_stock) || 0
          next.situation = avail >= qty ? 'OK' : 'Estoque insuficiente'
        }

        return next
      }),
    )
  }

  // Executa validação de regras de venda
  const runValidation = () => {
    const partnerCredit: SalesPartnerCreditInfo | null = selectedPartner
      ? {
          id: selectedPartner.id as string,
          name:
            (selectedPartner.full_name as string) || (selectedPartner.company_name as string) || '',
          credit_limit: parseFloat(String(selectedPartner.credit_limit || '0')) || 0,
          credit_situation: (selectedPartner.credit_situation as string) || 'Liberado',
          financial_restriction: Boolean(selectedPartner.financial_restriction),
          block_credit_sales: Boolean(selectedPartner.block_credit_sales),
        }
      : null

    const ruleItems: SalesItemRuleInput[] = items.map((it) => ({
      code: it.code,
      product: it.product,
      unit: it.unit,
      quantity: parseFloat(it.quantity) || 0,
      available_stock: parseFloat(it.available_stock) || 0,
      table_price: parseFloat(it.table_price) || 0,
      unit_price: parseFloat(it.unit_price) || 0,
      discount: parseFloat(it.discount) || 0,
      addition: parseFloat(it.addition) || 0,
      cost_average: parseFloat(it.cost_average || '0') || 0,
      cost_replacement: parseFloat(it.cost_replacement || '0') || 0,
      max_discount_percent: maxDiscountParam,
      min_margin_percent: minMarginParam,
    }))

    const isTerm = !form.payment_condition?.toLowerCase().includes('vista')

    const result = validateSalesOrder({
      partner: partnerCredit,
      items: ruleItems,
      orderTotal: totalValue,
      paymentCondition: form.payment_condition,
      isTermPayment: isTerm,
      systemMaxDiscountPercent: maxDiscountParam,
      systemMinMarginPercent: minMarginParam,
    })

    setValidationErrors(result.errors)
    setValidationWarnings(result.warnings)
    setApprovalReasons(result.approvalReasons)

    if (result.valid) {
      if (result.requiresApproval) {
        toast.warning('Pedido válido com pendências de alçada (requer aprovação).')
      } else {
        toast.success('Pedido validado com sucesso! Nenhuma divergência.')
      }
    } else {
      toast.error(`Existem ${result.errors.length} erro(s) que impedem o avanço do pedido.`)
    }

    return result
  }

  // Ações de persistência com transição segura
  const handleSaveOrder = async (targetStatus: string) => {
    // Se for validar ou confirmar, executa o motor primeiro
    if (targetStatus === 'Confirmado' || targetStatus === 'Aguardando Aprovação') {
      const val = runValidation()
      if (!val.valid) {
        toast.error('Corrija os erros listados antes de prosseguir.')
        return
      }
      if (targetStatus === 'Confirmado' && val.requiresApproval) {
        toast.error(
          'Este pedido requer aprovação gerencial devido a desconto/margem/crédito. Enviando para aprovação.',
        )
        targetStatus = 'Aguardando Aprovação'
      }
    }

    setSaving(true)
    try {
      const userName = (user?.name as string) || 'Operador'
      let num = form.order_number
      if (!num) {
        const nextNum = await getNextSalesNumber('order')
        num = nextNum.number
      }

      const orderData: Record<string, unknown> = {
        ...form,
        order_number: num,
        status: targetStatus,
        order_stage: targetStatus,
        gross_value: grossValue.toFixed(2),
        discount_value: discountsValue.toFixed(2),
        addition_value: additionsValue.toFixed(2),
        total_value: totalValue.toFixed(2),
        margin_estimated: totalMarginPercent.toFixed(1),
        credit_evaluated: true,
        items: items.filter((it) => it.product.trim()),
        responsible_user: userName,
        history: [
          ...(order?.history || []),
          {
            action: `Transição para ${targetStatus}`,
            user: userName,
            date: new Date().toISOString(),
            note:
              approvalReasons.length > 0 ? `Motivos de alçada: ${approvalReasons.join('; ')}` : '',
          },
        ],
      }

      if (order?.id) {
        await updateSalesOrder(order.id, orderData)
        logSalesAudit(
          'update',
          'sales',
          order.id,
          `Pedido de Venda ${num} alterado para status ${targetStatus}`,
        )
      } else {
        await createSalesOrder(orderData)
        logSalesAudit(
          'create',
          'sales',
          '',
          `Pedido de Venda ${num} criado com status ${targetStatus}`,
        )
      }

      toast.success(`Pedido salvo com status "${targetStatus}".`)
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao processar pedido'
      toast.error(`Falha: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    const printableWindow = window.open('', '_blank')
    if (!printableWindow) return
    const rowsHtml = items
      .map(
        (it) => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${it.code}</td>
        <td style="padding:6px;border:1px solid #ddd">${it.product}</td>
        <td style="padding:6px;border:1px solid #ddd">${it.unit}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">${it.quantity}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">R$ ${it.unit_price}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">R$ ${it.discount}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right"><strong>R$ ${it.total}</strong></td>
      </tr>
    `,
      )
      .join('')

    printableWindow.document.write(`
      <html>
        <head>
          <title>Pedido de Venda ${form.order_number || 'Novo'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #005B2E; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #005B2E; color: white; padding: 8px; text-align: left; }
            .header-info { display: flex; justify-content: space-between; border-bottom: 2px solid #005B2E; padding-bottom: 10px; }
            .totais { margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <div>
              <h1>ERP HURAM - PEDIDO DE VENDA</h1>
              <strong>Número:</strong> ${form.order_number || 'Rascunho'}<br/>
              <strong>Empresa:</strong> ${form.company} | <strong>Filial:</strong> ${form.branch}<br/>
              <strong>Cliente:</strong> ${form.client_name || 'Não informado'} (${form.customer_cnpj || 'Sem doc'})<br/>
            </div>
            <div style="text-align:right">
              <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br/>
              <strong>Vendedor:</strong> ${form.salesperson_name || 'Geral'}<br/>
              <strong>Status:</strong> ${form.status || 'Rascunho'}<br/>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Descrição</th><th>UN</th><th>Qtd</th><th>Preço Unit</th><th>Desc</th><th>Total</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="totais">
            <p>Subtotal: R$ ${grossValue.toFixed(2)}</p>
            <p>Descontos: -R$ ${discountsValue.toFixed(2)}</p>
            <p>Frete: R$ ${freightValue.toFixed(2)}</p>
            <h2 style="color:#005B2E">VALOR TOTAL: R$ ${totalValue.toFixed(2)}</h2>
          </div>
        </body>
      </html>
    `)
    printableWindow.document.close()
    printableWindow.print()
  }

  const currentStatus = normalizeSalesOrderStatus(form.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-[#005B2E]" />
              {order ? `Editar Pedido de Venda - ${form.order_number}` : 'Novo Pedido de Venda'}
            </DialogTitle>
            <Badge variant="outline" className="border-[#005B2E] text-[#005B2E] font-bold">
              v0.0.639
            </Badge>
          </div>
        </DialogHeader>

        {/* 1. Cabeçalho Padronizado */}
        <StandardOrderHeader
          orderType="Venda"
          orderNumber={form.order_number}
          companyName={form.company || 'DEC Eldorado'}
          companyCnpj={form.customer_cnpj}
          operationType={form.operation_type || 'Venda de Mercadorias'}
          emissionDate={new Date().toLocaleDateString('pt-BR')}
          expectedDeliveryDate={form.delivery_date}
          status={currentStatus}
          responsibleUser={form.salesperson_name || (user?.name as string)}
          partnerLabel="Cliente"
          partnerName={form.client_name}
          partnerDoc={form.customer_cnpj}
          paymentCondition={form.payment_condition}
          notes={form.internal_notes}
        />

        {/* Alertas de Validação em Tempo Real */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold">Inconsistências impeditivas:</AlertTitle>
            <AlertDescription className="text-xs space-y-0.5 mt-1">
              {validationErrors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {validationWarnings.length > 0 && (
          <Alert className="py-2 border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-xs font-bold">Avisos e pendências comerciais:</AlertTitle>
            <AlertDescription className="text-xs space-y-0.5 mt-1">
              {validationWarnings.map((w, i) => (
                <div key={i}>• {w}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* 2. As 6 Abas Padronizadas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-muted/60">
            <TabsTrigger value="geral" className="text-xs py-2 gap-1.5">
              <Building className="w-3.5 h-3.5" /> Dados Gerais
            </TabsTrigger>
            <TabsTrigger value="produtos" className="text-xs py-2 gap-1.5">
              <Package className="w-3.5 h-3.5" /> Produtos e Valores
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs py-2 gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="text-xs py-2 gap-1.5">
              <FileCheck className="w-3.5 h-3.5" /> Fiscal
            </TabsTrigger>
            <TabsTrigger value="logistica" className="text-xs py-2 gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Logística
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-xs py-2 gap-1.5">
              <History className="w-3.5 h-3.5" /> Anexos e Histórico
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: DADOS GERAIS */}
          <TabsContent value="geral" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Cliente Oficial *</Label>
                <Select
                  value={form.client_id || ''}
                  onValueChange={(v) => {
                    const cl = clients.find((c) => c.id === v)
                    setForm({
                      ...form,
                      client_id: v,
                      client_name: (cl?.full_name as string) || (cl?.company_name as string) || '',
                    })
                  }}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E] mt-1">
                    <SelectValue placeholder="Selecione o Cliente Oficial" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id as string} value={c.id as string}>
                        {(c.full_name as string) || (c.company_name as string) || '—'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Vendedor / RCA</Label>
                <Select
                  value={form.salesperson_name || ''}
                  onValueChange={(v) => setForm({ ...form, salesperson_name: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E] mt-1">
                    <SelectValue placeholder="Selecione o Vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {salespeople.map((s) => (
                      <SelectItem key={s.id as string} value={(s.name as string) || ''}>
                        {s.name as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Canal Comercial</Label>
                <Input
                  value={form.channel || 'Direto'}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Painel do Cliente Carregado */}
            {selectedPartner && (
              <div className="p-3 bg-muted/40 border rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between border-b pb-1 font-semibold text-foreground">
                  <span>Dados Cadastrais do Cliente</span>
                  <div className="flex gap-2">
                    <Badge
                      variant={selectedPartner.financial_restriction ? 'destructive' : 'secondary'}
                    >
                      Crédito: {(selectedPartner.credit_situation as string) || 'Liberado'}
                    </Badge>
                    <Badge variant="outline">
                      Limite: R${' '}
                      {parseFloat(String(selectedPartner.credit_limit || '0')).toFixed(2)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-muted-foreground">
                  <div>
                    <strong>CNPJ/CPF:</strong> {form.customer_cnpj || '—'}
                  </div>
                  <div>
                    <strong>IE:</strong> {form.customer_ie || '—'}
                  </div>
                  <div>
                    <strong>E-mail:</strong> {form.customer_email || '—'}
                  </div>
                  <div>
                    <strong>Telefone:</strong> {form.customer_phone || '—'}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Empresa Faturadora</Label>
                <Input
                  value={form.company || 'DEC Eldorado'}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Filial</Label>
                <Input
                  value={form.branch || 'Matriz'}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Tipo de Operação</Label>
                <Input
                  value={form.operation_type || 'Venda Mercadoria'}
                  onChange={(e) => setForm({ ...form, operation_type: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: PRODUTOS E VALORES */}
          <TabsContent value="produtos" className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground">Tabela de Itens do Pedido</span>
                <p className="text-[11px] text-muted-foreground">
                  Custos médios e de reposição são bloqueados para edição manual e apurados
                  oficialmente.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setItems([...items, { ...emptyItem }])}
                className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Produto
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted text-muted-foreground border-b">
                    <th className="p-2 text-left min-w-[200px]">Produto</th>
                    <th className="p-2 text-center w-16">Qtd</th>
                    <th className="p-2 text-center w-16">UN</th>
                    <th className="p-2 text-right w-24">Estoque</th>
                    <th className="p-2 text-right w-28">Preço Unit.</th>
                    <th className="p-2 text-right w-24">Desconto</th>
                    <th className="p-2 text-right w-24 bg-muted/40 font-mono">Custo Médio*</th>
                    <th className="p-2 text-right w-20">Margem %</th>
                    <th className="p-2 text-right w-28">Subtotal</th>
                    <th className="p-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="p-1.5">
                        <Select
                          value={it.product}
                          onValueChange={(val) => updateItem(idx, 'product', val)}
                        >
                          <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
                            <SelectValue placeholder="Selecione o produto..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id as string} value={(p.name as string) || ''}>
                                {p.name as string}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-1.5">
                        <Input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className="h-8 text-xs text-center"
                        />
                      </td>
                      <td className="p-1.5 text-center font-semibold text-muted-foreground">
                        {it.unit || 'UN'}
                      </td>
                      <td className="p-1.5 text-right font-mono text-[11px]">
                        <span
                          className={
                            parseFloat(it.available_stock) < parseFloat(it.quantity)
                              ? 'text-amber-600 font-bold'
                              : 'text-muted-foreground'
                          }
                        >
                          {it.available_stock || '0'}
                        </span>
                      </td>
                      <td className="p-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          value={it.unit_price}
                          onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                          className="h-8 text-xs text-right"
                        />
                      </td>
                      <td className="p-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          value={it.discount}
                          onChange={(e) => updateItem(idx, 'discount', e.target.value)}
                          className="h-8 text-xs text-right"
                        />
                      </td>
                      {/* CUSTO MÉDIO OFICIAL SOMENTE LEITURA */}
                      <td className="p-1.5 text-right bg-muted/40 font-mono text-muted-foreground text-[11px] select-none">
                        <div
                          className="flex items-center justify-end gap-1"
                          title="Custo apurado oficialmente pelo motor Huram"
                        >
                          <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
                          R$ {parseFloat(it.cost_average || '0').toFixed(2)}
                        </div>
                      </td>
                      <td className="p-1.5 text-right font-semibold">
                        <span
                          className={
                            parseFloat(it.margin_percent || '0') < minMarginParam
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {it.margin_percent || '0'}%
                        </span>
                      </td>
                      <td className="p-1.5 text-right font-bold text-foreground">
                        R$ {it.total || '0.00'}
                      </td>
                      <td className="p-1.5 text-center">
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                            className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border">
              <Lock className="w-3.5 h-3.5 text-[#005B2E]" />
              <span>
                <strong>Regra de Governança:</strong> Preço de custo e custo médio não são editáveis
                manualmente. As margens de contribuição respeitam o piso configurado de{' '}
                {minMarginParam}%.
              </span>
            </div>
          </TabsContent>

          {/* ABA 3: FINANCEIRO */}
          <TabsContent value="financeiro" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Condição de Pagamento</Label>
                <Select
                  value={form.payment_condition || ''}
                  onValueChange={(v) => setForm({ ...form, payment_condition: v })}
                >
                  <SelectTrigger className="mt-1 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    {payConditions.map((pc) => (
                      <SelectItem key={pc.id as string} value={(pc.name as string) || ''}>
                        {pc.name as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Forma de Pagamento</Label>
                <Select
                  value={form.payment_method || ''}
                  onValueChange={(v) => setForm({ ...form, payment_method: v })}
                >
                  <SelectTrigger className="mt-1 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    {payMethods.map((pm) => (
                      <SelectItem key={pm.id as string} value={(pm.name as string) || ''}>
                        {pm.name as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Tabela de Preços</Label>
                <Select
                  value={form.price_table_id || ''}
                  onValueChange={(v) => setForm({ ...form, price_table_id: v })}
                >
                  <SelectTrigger className="mt-1 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Tabela de Preço" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceTables.map((pt) => (
                      <SelectItem key={pt.id as string} value={pt.id as string}>
                        {(pt.table_name as string) || '—'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Valor do Frete (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.freight_value || '0'}
                  onChange={(e) => setForm({ ...form, freight_value: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Valor do Seguro (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.insurance_value || '0'}
                  onChange={(e) => setForm({ ...form, insurance_value: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Outras Despesas (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.other_expenses || '0'}
                  onChange={(e) => setForm({ ...form, other_expenses: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* ABA 4: FISCAL */}
          <TabsContent value="fiscal" className="space-y-4 pt-3">
            <div className="p-3 bg-muted/30 border rounded-lg space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#005B2E]" />
                Enquadramento Fiscal do Pedido (Motor CFOP Ativo)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label className="text-xs font-semibold">CFOP Predominante dos Itens</Label>
                  <div className="mt-1 p-2 bg-background border rounded font-mono text-sm text-[#005B2E] font-bold">
                    {items[0]?.cfop || '5102 - Venda de mercadoria adquirida de terceiros'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Destino Fiscal</Label>
                  <div className="mt-1 p-2 bg-background border rounded text-xs text-muted-foreground">
                    Operação Estadual/Interestadual calculada automaticamente pelo endereço do
                    cliente cadastrado.
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">
                  Observações Fiscais (Impresso na NF-e)
                </Label>
                <Textarea
                  value={form.fiscal_notes || ''}
                  onChange={(e) => setForm({ ...form, fiscal_notes: e.target.value })}
                  rows={3}
                  className="mt-1 text-xs"
                  placeholder="Informações complementares de interesse do fisco ou contribuinte..."
                />
              </div>
            </div>
          </TabsContent>

          {/* ABA 5: LOGÍSTICA E ENTREGA */}
          <TabsContent value="logistica" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Previsão de Entrega</Label>
                <Input
                  type="date"
                  value={form.delivery_date || ''}
                  onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Modalidade de Frete</Label>
                <Select
                  value={form.freight_type || 'CIF'}
                  onValueChange={(v) => setForm({ ...form, freight_type: v })}
                >
                  <SelectTrigger className="mt-1 focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREIGHT_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Transportadora</Label>
                <Select
                  value={form.carrier_name || ''}
                  onValueChange={(v) => setForm({ ...form, carrier_name: v })}
                >
                  <SelectTrigger className="mt-1 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione a transportadora" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((c) => (
                      <SelectItem key={c.id as string} value={(c.name as string) || ''}>
                        {c.name as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Endereço de Entrega</Label>
              <Input
                value={form.delivery_address || ''}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                className="mt-1 text-xs"
                placeholder="Rua, número, complemento, bairro, cidade - UF, CEP"
              />
            </div>
          </TabsContent>

          {/* ABA 6: ANEXOS E HISTÓRICO */}
          <TabsContent value="historico" className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Observações Internas (Não impressas)</Label>
              <Textarea
                value={form.internal_notes || ''}
                onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                rows={3}
                className="text-xs"
                placeholder="Anotações comerciais, instruções de faturamento, aprovações de exceção..."
              />
            </div>

            <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <History className="w-4 h-4 text-muted-foreground" />
                Trilha de Auditoria e Histórico de Eventos
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order?.history && order.history.length > 0 ? (
                  order.history.map((h, i) => (
                    <div key={i} className="text-xs border-b pb-1.5 flex justify-between">
                      <div>
                        <strong>{h.action}</strong>
                        {h.note && <p className="text-muted-foreground text-[11px]">{h.note}</p>}
                      </div>
                      <div className="text-right text-[11px] text-muted-foreground">
                        <span>{h.user}</span> •{' '}
                        <span>{new Date(h.date).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhum evento registrado ainda.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 3. Resumo Financeiro Consolidado Fixo */}
        <StandardOrderSummary
          grossValue={grossValue}
          discountsValue={discountsValue}
          additionsValue={additionsValue}
          freightValue={freightValue}
          insuranceValue={insuranceValue}
          expensesValue={expensesValue}
          totalValue={totalValue}
          estimatedMarginPercent={totalMarginPercent}
          estimatedMarginValue={totalMarginValue}
          showMargin={true}
          creditLimitAvailable={
            selectedPartner
              ? parseFloat(String(selectedPartner.credit_limit || '0')) - totalValue
              : undefined
          }
        />

        {/* 4. Barra de Ações Padronizada */}
        <StandardOrderActions
          status={currentStatus}
          loading={saving}
          onSaveDraft={() => handleSaveOrder('Rascunho')}
          onValidate={runValidation}
          onSubmitApproval={() => handleSaveOrder('Aguardando Aprovação')}
          onConfirm={() => handleSaveOrder('Confirmado')}
          onPrint={handlePrint}
          onCancel={() => handleSaveOrder('Cancelado')}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

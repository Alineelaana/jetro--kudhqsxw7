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
  Building,
  DollarSign,
  Package,
  Truck,
  FileCheck,
  History,
  Lock,
  ShoppingCart,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import {
  getSuppliers,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  getNextPurchaseNumber,
  getApprovalThreshold,
} from '@/services/purchasing'
import { getProducts } from '@/services/products'
import type { PurchaseOrder, OrderItem } from '@/lib/purchasing-types'
import { StandardOrderHeader } from './standard-order-header'
import { StandardOrderSummary } from './standard-order-summary'
import { StandardOrderActions } from './standard-order-actions'
import {
  validatePurchaseOrder,
  calculatePendingBalances,
  normalizePurchaseOrderStatus,
  type PurchaseItemRuleInput,
} from '@/lib/order-purchase-rules'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  order: PurchaseOrder | null
  onSaved: () => void
}

interface PurchaseItemRow extends OrderItem {
  unit?: string
  quoted_price?: string
  quantity_received?: string
  cfop?: string
}

const emptyItem: PurchaseItemRow = {
  code: '',
  product: '',
  unit: 'UN',
  quantity: '1',
  unit_price: '0',
  discount: '0',
  total: '0',
  quoted_price: '0',
  quantity_received: '0',
  cfop: '1102',
}

export function PurchaseOrderStandardEditor({ open, onOpenChange, order, onSaved }: Props) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('geral')
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [approvalThreshold, setApprovalThreshold] = useState(5000)

  // Formulário
  const [form, setForm] = useState<Record<string, string>>({})
  const [items, setItems] = useState<PurchaseItemRow[]>([{ ...emptyItem }])
  const [selectedSupplier, setSelectedSupplier] = useState<Record<string, unknown> | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [approvalReasons, setApprovalReasons] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      Promise.all([
        getSuppliers().catch(() => []),
        getProducts().catch(() => []),
        getApprovalThreshold().catch(() => 5000),
      ]).then(([sups, prods, th]) => {
        setSuppliers(sups as Array<Record<string, unknown>>)
        setProducts(prods as Array<Record<string, unknown>>)
        setApprovalThreshold(th || 5000)
      })

      if (order) {
        setForm({
          id: order.id,
          order_number: order.order_number,
          supplier_id: order.supplier_id || '',
          supplier_name: order.supplier_name || '',
          company: order.company || 'DEC Eldorado',
          branch: order.branch || 'Matriz',
          buyer: order.buyer || (user?.name as string) || '',
          payment_condition: order.payment_condition || '',
          payment_method: order.payment_method || '',
          delivery_forecast: order.delivery_forecast || '',
          freight: order.freight || '0',
          discounts: order.discounts || '0',
          other_expenses: order.other_expenses || '0',
          status: order.status || 'Rascunho',
          quotation_id: order.quotation_id || '',
          request_id: order.request_id || '',
          operation_type: 'Compra para Comercialização',
        })
        const parsedItems: PurchaseItemRow[] = (order.items || []).map((it) => ({
          ...emptyItem,
          ...it,
          unit: (it as unknown as { unit?: string }).unit || 'UN',
        }))
        setItems(parsedItems.length > 0 ? parsedItems : [{ ...emptyItem }])
      } else {
        setForm({
          order_number: '',
          company: 'DEC Eldorado',
          branch: 'Matriz',
          buyer: (user?.name as string) || '',
          freight: '0',
          discounts: '0',
          other_expenses: '0',
          status: 'Rascunho',
          operation_type: 'Compra Padrão',
        })
        setItems([{ ...emptyItem }])
        setSelectedSupplier(null)
      }
      setValidationErrors([])
      setValidationWarnings([])
      setApprovalReasons([])
    }
  }, [open, order])

  // Vincula fornecedor selecionado aos dados oficiais de parceiro
  useEffect(() => {
    if (form.supplier_id && suppliers.length > 0) {
      const match = suppliers.find((s) => s.id === form.supplier_id)
      if (match) {
        setSelectedSupplier(match)
        setForm((prev) => ({
          ...prev,
          supplier_name:
            (match.full_name as string) || (match.company_name as string) || prev.supplier_name,
          payment_condition: prev.payment_condition || (match.payment_terms as string) || '',
          payment_method: prev.payment_method || (match.payment_method as string) || '',
        }))
      }
    }
  }, [form.supplier_id, suppliers])

  // Cálculos financeiros
  const productsValue = useMemo(() => {
    return items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0)
  }, [items])

  const discountsValue = parseFloat(form.discounts) || 0
  const freightValue = parseFloat(form.freight) || 0
  const otherExpensesValue = parseFloat(form.other_expenses) || 0

  const totalValue = Math.max(0, productsValue - discountsValue + freightValue + otherExpensesValue)

  // Saldo pendente por item para acompanhamento
  const pendingBalances = useMemo(() => {
    const input: PurchaseItemRuleInput[] = items.map((it) => ({
      code: it.code,
      product: it.product,
      unit: it.unit || 'UN',
      quantity: parseFloat(it.quantity) || 0,
      unit_price: parseFloat(it.unit_price) || 0,
      discount: parseFloat(it.discount) || 0,
      quantity_received: parseFloat(it.quantity_received || '0') || 0,
    }))
    return calculatePendingBalances(input)
  }, [items])

  // Atualização de linha de compra
  const updateItem = (index: number, field: keyof PurchaseItemRow, val: string) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it
        const next = { ...it, [field]: val }

        if (field === 'product') {
          const prod = products.find((p) => (p.name as string) === val)
          if (prod) {
            next.code = (prod.code as string) || ''
            next.unit = (prod.unit as string) || 'UN'
            // O preço negociado inicial vem do último custo ou de tabela, mas pode ser livremente negociado
            next.unit_price = String((prod.last_cost as number) ?? (prod.price as number) ?? '0')
            next.cfop = '1102'
          }
        }

        if (['quantity', 'unit_price', 'discount', 'product'].includes(field)) {
          const qty = parseFloat(next.quantity) || 0
          const price = parseFloat(next.unit_price) || 0
          const disc = parseFloat(next.discount) || 0
          const lineTotal = Math.max(0, qty * price - disc)
          next.total = lineTotal.toFixed(2)
        }

        return next
      }),
    )
  }

  // Validação oficial de regras de compra
  const runValidation = () => {
    const ruleItems: PurchaseItemRuleInput[] = items.map((it) => ({
      code: it.code,
      product: it.product,
      unit: it.unit || 'UN',
      quantity: parseFloat(it.quantity) || 0,
      unit_price: parseFloat(it.unit_price) || 0,
      discount: parseFloat(it.discount) || 0,
      quoted_price: parseFloat(it.quoted_price || '0') || undefined,
      quantity_received: parseFloat(it.quantity_received || '0') || 0,
    }))

    const result = validatePurchaseOrder({
      supplierId: form.supplier_id,
      supplierName: form.supplier_name,
      items: ruleItems,
      orderTotal: totalValue,
      approvalThreshold,
      quotationTolerancePercent: 5,
    })

    setValidationErrors(result.errors)
    setValidationWarnings(result.warnings)
    setApprovalReasons(result.approvalReasons)

    if (result.valid) {
      if (result.requiresApproval) {
        toast.warning('Pedido válido com necessidade de aprovação de alçada gerencial.')
      } else {
        toast.success('Pedido de compra validado com sucesso!')
      }
    } else {
      toast.error(`Existem ${result.errors.length} erro(s) no pedido de compra.`)
    }

    return result
  }

  // Persistência com governança
  const handleSaveOrder = async (targetStatus: string) => {
    if (targetStatus === 'Aprovado' || targetStatus === 'Aguardando Aprovação') {
      const val = runValidation()
      if (!val.valid) {
        toast.error('Corrija os erros impeditivos antes de prosseguir.')
        return
      }
      if (targetStatus === 'Aprovado' && val.requiresApproval) {
        toast.warning(
          'Valor excede o limite de autoaprovação. Redirecionando para aprovação gerencial.',
        )
        targetStatus = 'Aguardando Aprovação'
      }
    }

    setSaving(true)
    try {
      const userName = (user?.name as string) || 'Comprador'
      let num = form.order_number
      if (!num) {
        const nextNum = await getNextPurchaseNumber('order')
        num = nextNum.number
      }

      const orderData: Record<string, unknown> = {
        ...form,
        order_number: num,
        status: targetStatus,
        order_stage: targetStatus,
        buyer_id: user?.id,
        items: items.filter((it) => it.product.trim()),
        products_value: productsValue.toFixed(2),
        discounts: discountsValue.toFixed(2),
        freight: freightValue.toFixed(2),
        other_expenses: otherExpensesValue.toFixed(2),
        total_value: totalValue.toFixed(2),
        pending_balance_items: pendingBalances,
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
        await updatePurchaseOrder(order.id, orderData)
      } else {
        await createPurchaseOrder(orderData)
      }

      toast.success(`Pedido de Compra gravado com status "${targetStatus}".`)
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao processar pedido de compra'
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
        <td style="padding:6px;border:1px solid #ddd">${it.unit || 'UN'}</td>
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
          <title>Pedido de Compra ${form.order_number || 'Novo'}</title>
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
              <h1>ERP HURAM - PEDIDO DE COMPRA</h1>
              <strong>Número:</strong> ${form.order_number || 'Rascunho'}<br/>
              <strong>Empresa:</strong> ${form.company} | <strong>Filial:</strong> ${form.branch}<br/>
              <strong>Fornecedor:</strong> ${form.supplier_name || 'Não informado'}<br/>
            </div>
            <div style="text-align:right">
              <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br/>
              <strong>Comprador:</strong> ${form.buyer || 'Padrão'}<br/>
              <strong>Status:</strong> ${form.status || 'Rascunho'}<br/>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Insumo/Produto</th><th>UN</th><th>Qtd</th><th>Preço Negociado</th><th>Desc</th><th>Total</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="totais">
            <p>Subtotal Produtos: R$ ${productsValue.toFixed(2)}</p>
            <p>Descontos: -R$ ${discountsValue.toFixed(2)}</p>
            <p>Frete: R$ ${freightValue.toFixed(2)}</p>
            <h2 style="color:#005B2E">VALOR TOTAL ESTIMADO: R$ ${totalValue.toFixed(2)}</h2>
          </div>
        </body>
      </html>
    `)
    printableWindow.document.close()
    printableWindow.print()
  }

  const currentStatus = normalizePurchaseOrderStatus(form.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#005B2E]" />
              {order ? `Editar Pedido de Compra - ${form.order_number}` : 'Novo Pedido de Compra'}
            </DialogTitle>
            <Badge variant="outline" className="border-[#005B2E] text-[#005B2E] font-bold">
              v0.0.638
            </Badge>
          </div>
        </DialogHeader>

        {/* 1. Cabeçalho Padronizado */}
        <StandardOrderHeader
          orderType="Compra"
          orderNumber={form.order_number}
          companyName={form.company || 'DEC Eldorado'}
          operationType={form.operation_type || 'Compra para Comercialização'}
          emissionDate={new Date().toLocaleDateString('pt-BR')}
          expectedDeliveryDate={form.delivery_forecast}
          status={currentStatus}
          responsibleUser={form.buyer || (user?.name as string)}
          partnerLabel="Fornecedor"
          partnerName={form.supplier_name}
          partnerDoc={
            selectedSupplier
              ? (selectedSupplier.cnpj as string) || (selectedSupplier.cpf as string)
              : undefined
          }
          paymentCondition={form.payment_condition}
        />

        {/* Alertas de Validação */}
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
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-xs font-bold">Avisos e alçadas de compra:</AlertTitle>
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
                <Label className="text-xs font-semibold">Fornecedor Oficial *</Label>
                <Select
                  value={form.supplier_id || ''}
                  onValueChange={(v) => {
                    const sup = suppliers.find((s) => s.id === v)
                    setForm({
                      ...form,
                      supplier_id: v,
                      supplier_name:
                        (sup?.full_name as string) || (sup?.company_name as string) || '',
                    })
                  }}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E] mt-1">
                    <SelectValue placeholder="Selecione o Fornecedor Oficial" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id as string} value={s.id as string}>
                        {(s.full_name as string) || (s.company_name as string) || '—'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Comprador Responsável</Label>
                <Input
                  value={form.buyer || ''}
                  onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Cotação Vinculada (Opcional)</Label>
                <Input
                  value={form.quotation_id || ''}
                  onChange={(e) => setForm({ ...form, quotation_id: e.target.value })}
                  placeholder="Nº da cotação aprovada"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Ficha rápida do fornecedor */}
            {selectedSupplier && (
              <div className="p-3 bg-muted/40 border rounded-lg space-y-1 text-xs">
                <div className="font-semibold text-foreground border-b pb-1">
                  Homologação e Dados Comerciais do Fornecedor
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-muted-foreground pt-1">
                  <div>
                    <strong>CNPJ/CPF:</strong>{' '}
                    {(selectedSupplier.cnpj as string) || (selectedSupplier.cpf as string) || '—'}
                  </div>
                  <div>
                    <strong>IE:</strong> {(selectedSupplier.state_registration as string) || '—'}
                  </div>
                  <div>
                    <strong>E-mail:</strong> {(selectedSupplier.email as string) || '—'}
                  </div>
                  <div>
                    <strong>Telefone:</strong> {(selectedSupplier.phone as string) || '—'}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Empresa Solicitante</Label>
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
                  value={form.operation_type || 'Compra para Comercialização'}
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
                <span className="text-xs font-bold text-foreground">
                  Itens / Insumos a Adquirir
                </span>
                <p className="text-[11px] text-muted-foreground">
                  O preço negociado reflete a negociação de compras e NÃO substitui o custo médio do
                  estoque.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setItems([...items, { ...emptyItem }])}
                className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Insumo/Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted text-muted-foreground border-b">
                    <th className="p-2 text-left min-w-[200px]">Insumo / Produto</th>
                    <th className="p-2 text-center w-16">Qtd</th>
                    <th className="p-2 text-center w-16">UN</th>
                    <th className="p-2 text-right w-28">Preço Negociado</th>
                    <th className="p-2 text-right w-24">Desconto</th>
                    <th className="p-2 text-right w-28">Subtotal</th>
                    <th className="p-2 text-center w-24">Saldo Pendente</th>
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
                            <SelectValue placeholder="Selecione o produto/insumo..." />
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
                      <td className="p-1.5 text-right font-bold text-foreground">
                        R$ {it.total || '0.00'}
                      </td>
                      <td className="p-1.5 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {pendingBalances[idx]?.quantity_pending || it.quantity} {it.unit || 'UN'}
                        </Badge>
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

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded border">
              <Lock className="w-4 h-4 text-[#005B2E] shrink-0" />
              <span>
                <strong>Regra Obrigatória do HURAM:</strong> O preço negociado no Pedido de Compra
                não altera o custo médio do estoque. O custo de aquisição e o custo médio oficial
                serão apurados estritamente pela entrada da nota fiscal (`purchase_invoices`) e seu
                motor imutável ponderado.
              </span>
            </div>
          </TabsContent>

          {/* ABA 3: FINANCEIRO */}
          <TabsContent value="financeiro" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Condição de Pagamento</Label>
                <Input
                  value={form.payment_condition || ''}
                  onChange={(e) => setForm({ ...form, payment_condition: e.target.value })}
                  placeholder="Ex: 30/60 dias, À Vista, 28 DDL..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Forma de Pagamento</Label>
                <Input
                  value={form.payment_method || ''}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  placeholder="Ex: Boleto Bancário, Pix, TED..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Descontos Globais (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.discounts || '0'}
                  onChange={(e) => setForm({ ...form, discounts: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Frete Previsto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.freight || '0'}
                  onChange={(e) => setForm({ ...form, freight: e.target.value })}
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

            <div className="p-3 bg-muted/20 border rounded-lg text-xs space-y-1">
              <strong>Governança de Obrigações Financeiras:</strong> A aprovação deste pedido de
              compra reserva orçamento interno, mas NÃO gera duplicatas definitivas no Contas a
              Pagar. O título financeiro oficial nasce da importação do XML / confirmação da fatura
              em `purchase_invoices`.
            </div>
          </TabsContent>

          {/* ABA 4: FISCAL */}
          <TabsContent value="fiscal" className="space-y-4 pt-3">
            <div className="p-3 bg-muted/30 border rounded-lg space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#005B2E]" />
                Enquadramento Fiscal Previsto na Entrada
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label className="text-xs font-semibold">CFOP de Entrada Previsto</Label>
                  <div className="mt-1 p-2 bg-background border rounded font-mono text-sm text-[#005B2E] font-bold">
                    1102 / 2102 - Compra para comercialização
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Regime Tributário do Fornecedor</Label>
                  <div className="mt-1 p-2 bg-background border rounded text-xs text-muted-foreground">
                    Carregado conforme o cadastro mestre do parceiro selecionado.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 5: LOGÍSTICA E ENTREGA */}
          <TabsContent value="logistica" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Previsão de Recebimento</Label>
                <Input
                  type="date"
                  value={form.delivery_forecast || ''}
                  onChange={(e) => setForm({ ...form, delivery_forecast: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Local de Entrega / Docas</Label>
                <Input placeholder="Galpão Principal - Doca 01" className="mt-1" />
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#005B2E]" />
                Quadro de Saldos Pendentes para Conferência Física
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted text-muted-foreground border-b">
                      <th className="p-1.5 text-left">Item</th>
                      <th className="p-1.5 text-center">Qtd Solicitada</th>
                      <th className="p-1.5 text-center">Qtd Recebida</th>
                      <th className="p-1.5 text-center">Saldo Pendente</th>
                      <th className="p-1.5 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingBalances.map((pb, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 font-medium">{pb.product || '—'}</td>
                        <td className="p-1.5 text-center">
                          {pb.quantity_ordered} {pb.unit}
                        </td>
                        <td className="p-1.5 text-center">
                          {pb.quantity_received} {pb.unit}
                        </td>
                        <td className="p-1.5 text-center font-bold text-[#005B2E]">
                          {pb.quantity_pending} {pb.unit}
                        </td>
                        <td className="p-1.5 text-center">
                          <Badge variant="outline" className="text-[10px]">
                            {pb.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ABA 6: ANEXOS E HISTÓRICO */}
          <TabsContent value="historico" className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Instruções de Compra e Justificativas</Label>
              <Textarea
                placeholder="Negociações especiais com o fornecedor, observações de alçada..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <History className="w-4 h-4 text-muted-foreground" />
                Histórico de Aprovações e Modificações
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
          grossValue={productsValue}
          discountsValue={discountsValue}
          freightValue={freightValue}
          expensesValue={otherExpensesValue}
          totalValue={totalValue}
          showMargin={false}
          budgetAvailable={50000}
        />

        {/* 4. Barra de Ações Padronizada */}
        <StandardOrderActions
          status={currentStatus}
          loading={saving}
          onSaveDraft={() => handleSaveOrder('Rascunho')}
          onValidate={runValidation}
          onSubmitApproval={() => handleSaveOrder('Aguardando Aprovação')}
          onConfirm={() => handleSaveOrder('Aprovado')}
          onPrint={handlePrint}
          onCancel={() => handleSaveOrder('Cancelado')}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

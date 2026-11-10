import { useState, useEffect, useMemo, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useBrand } from '@/hooks/use-brand'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Building2,
  UserCheck,
  FileSpreadsheet,
  FileCheck,
  PackageCheck,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { logSalesAudit } from '@/services/sales'

export interface SalesOrderWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (createdOrder: Record<string, unknown>) => void
}

export interface WizardOrderItem {
  product_id: string
  product_code: string
  product_name: string
  unit: string
  ean?: string
  ncm?: string
  available_stock: number
  table_price: number
  max_discount_allowed: number // percent
  discount_percent: number
  discount_value: number
  final_unit_price: number
  quantity: number
  total: number
  cfop: string
}

export function SalesOrderWizardDialog({
  open,
  onOpenChange,
  onSuccess,
}: SalesOrderWizardDialogProps) {
  const { user } = useAuth()
  const { brand, empresaAtivaId, empresasDoUsuario } = useBrand()
  const userName = user?.name || user?.login || 'Operador Vendas'

  // Etapa atual: 1 = Cabeçalho, 2 = Produtos, 3 = Conferência
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Listas do banco
  const [companies, setCompanies] = useState<
    Array<{ id: string; name: string; cnpj?: string; uf?: string }>
  >([])
  const [clients, setClients] = useState<Array<Record<string, unknown>>>([])
  const [salespeople, setSalespeople] = useState<
    Array<{ id: string; name: string; type: string; company_id?: string }>
  >([])
  const [priceTables, setPriceTables] = useState<Array<Record<string, unknown>>>([])
  const [fiscalOps, setFiscalOps] = useState<
    Array<{ codigo: string; nome: string; descricao?: string }>
  >([])
  const [rawProducts, setRawProducts] = useState<Array<Record<string, unknown>>>([])
  const [activeReservations, setActiveReservations] = useState<
    Array<{ product_id: string; quantity: number }>
  >([])

  // ETAPA 1 - Cabeçalho
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedSalespersonId, setSelectedSalespersonId] = useState('')
  const [selectedCgo, setSelectedCgo] = useState('VENDA_NORMAL')
  const [cfopDeterminado, setCfopDeterminado] = useState('5102')
  const [naturezaOperacao, setNaturezaOperacao] = useState(
    'Venda de mercadoria adquirida ou recebida de terceiros',
  )
  const [selectedPriceTableId, setSelectedPriceTableId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentCondition, setPaymentCondition] = useState('')
  const [negotiationType, setNegotiationType] = useState('À vista')
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  })
  const [observations, setObservations] = useState('')

  // Rascunho do cabeçalho salvo
  const [headerDraftSaved, setHeaderDraftSaved] = useState(false)

  // ETAPA 2 - Produtos
  const [items, setItems] = useState<WizardOrderItem[]>([])
  const [productSearch, setProductSearch] = useState('')

  // Carrega dados mestres
  useEffect(() => {
    if (!open) {
      setStep(1)
      setHeaderDraftSaved(false)
      setItems([])
      setProductSearch('')
      setSelectedCompanyId('')
      setSelectedClientId('')
      setSelectedSalespersonId('')
      setSelectedPriceTableId('')
      setPaymentMethod('')
      setPaymentCondition('')
      setObservations('')
      return
    }

    setLoadingData(true)
    Promise.all([
      // Empresas
      pb
        .collection('empresas')
        .getFullList({ filter: 'active != false', sort: '-padrao,name' })
        .catch(() =>
          pb
            .collection('empresas')
            .getFullList({ sort: '-padrao,name' })
            .catch(() => []),
        ),
      // Clientes
      pb
        .collection('partners')
        .getFullList({
          filter: 'partner_type ~ "Cliente" && active = true',
          sort: 'company_name',
        })
        .catch(() => []),
      // RCAs + Vendedores internos + Usuários comerciais
      (async () => {
        const unifiedList: Array<{ id: string; name: string; type: string; company_id?: string }> =
          []
        try {
          const rcas = await pb
            .collection('representantes')
            .getFullList({ filter: 'active != false' })
            .catch(() =>
              pb
                .collection('representantes')
                .getFullList()
                .catch(() => []),
            )
          for (const r of rcas) {
            unifiedList.push({
              id: r.id,
              name: (r.nome as string) || (r.razao_social as string) || 'RCA',
              type: 'RCA (Externo)',
              company_id: r.empresa_id as string,
            })
          }
        } catch {
          /* ignore */
        }

        try {
          const vends = await pb.collection('vendedores').getFullList({ filter: 'active = true' })
          for (const v of vends) {
            unifiedList.push({
              id: v.id,
              name: (v.name as string) || 'Vendedor',
              type: 'Vendedor Interno',
              company_id: v.empresa_id as string,
            })
          }
        } catch {
          /* ignore */
        }

        if (unifiedList.length === 0) {
          try {
            const users = await pb.collection('users').getFullList({ filter: 'active = true' })
            for (const u of users) {
              unifiedList.push({
                id: u.id,
                name: (u.name as string) || (u.login as string) || 'Usuário',
                type: 'Comercial / Interno',
                company_id: u.empresa_id as string,
              })
            }
          } catch {
            /* ignore */
          }
        }
        return unifiedList
      })(),
      // Tabelas de preço
      pb
        .collection('price_tables')
        .getFullList({ filter: 'active = true' })
        .catch(() => []),
      // Operações fiscais CGO
      pb
        .collection('fiscal_operations')
        .getFullList({ filter: 'ativa = true' })
        .catch(() => []),
      // Produtos
      pb
        .collection('products')
        .getFullList({ filter: 'active = true' })
        .catch(() => []),
      // Reservas ativas de estoque
      pb
        .collection('stock_reservations')
        .getFullList({ filter: 'status = "ativa"' })
        .catch(() => []),
    ])
      .then(([emps, cls, sps, pts, fops, prods, resvs]) => {
        const empList = (emps as Array<Record<string, unknown>>).map((e) => ({
          id: e.id as string,
          name: (e.razao_social as string) || (e.nome_fantasia as string) || 'Empresa',
          cnpj: (e.cnpj as string) || '',
          uf: (e.uf as string) || 'ES',
        }))

        // Respeita empresas vinculadas ao acesso do usuário se houver restrição
        const permittedEmpresaIds = new Set(empresasDoUsuario.map((e) => e.id))
        const filteredEmpList =
          empresasDoUsuario.length > 0
            ? empList.filter((e) => permittedEmpresaIds.has(e.id))
            : empList
        const finalCompanies = filteredEmpList.length > 0 ? filteredEmpList : empList
        setCompanies(finalCompanies)

        // Pré-preenchimento padrão com a empresa ativa no contexto do sistema
        const storedActiveId =
          typeof window !== 'undefined' ? localStorage.getItem('huram_empresa_ativa_id') || '' : ''
        const activeContextCompanyId =
          empresaAtivaId ||
          brand?.empresaId ||
          storedActiveId ||
          (user as { empresa_id?: string })?.empresa_id ||
          ''
        const isPermittedAndActive =
          Boolean(activeContextCompanyId) &&
          finalCompanies.some((c) => c.id === activeContextCompanyId)

        const initialCompanyId = isPermittedAndActive
          ? activeContextCompanyId
          : !activeContextCompanyId && finalCompanies.length === 1
            ? finalCompanies[0].id
            : ''
        setSelectedCompanyId(initialCompanyId)

        setClients(cls as Array<Record<string, unknown>>)
        setSalespeople(sps)
        if (sps.length > 0) {
          const matchingSp =
            (initialCompanyId && sps.find((s) => s.company_id === initialCompanyId)) || sps[0]
          setSelectedSalespersonId(matchingSp ? matchingSp.id : sps[0].id)
        }

        const priceTableList = pts as Array<Record<string, unknown>>
        setPriceTables(priceTableList)
        if (priceTableList.length > 0) {
          const matchingTable =
            (initialCompanyId &&
              priceTableList.find(
                (pt) =>
                  pt.empresa_id === initialCompanyId ||
                  pt.empresa === initialCompanyId ||
                  (initialCompanyId &&
                    pt.empresa === finalCompanies.find((c) => c.id === initialCompanyId)?.name),
              )) ||
            priceTableList[0]
          if (matchingTable && (matchingTable as Record<string, unknown>).id) {
            setSelectedPriceTableId((matchingTable as Record<string, unknown>).id as string)
          }
        }

        const opList = (fops as Array<Record<string, unknown>>).map((op) => ({
          codigo: (op.codigo as string) || 'VENDA_NORMAL',
          nome: (op.nome as string) || (op.descricao as string) || 'Venda Normal',
          descricao: op.descricao as string,
        }))
        setFiscalOps(opList)

        setRawProducts(prods as Array<Record<string, unknown>>)
        setActiveReservations(
          (resvs as Array<Record<string, unknown>>).map((r) => ({
            product_id: (r.product_id as string) || '',
            quantity: Number(r.quantity) || 0,
          })),
        )
      })
      .finally(() => setLoadingData(false))
  }, [open, empresaAtivaId, brand?.empresaId, empresasDoUsuario, user])

  // Cliente selecionado
  const currentClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null
  }, [clients, selectedClientId])

  // Empresa selecionada
  const currentCompany = useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || null
  }, [companies, selectedCompanyId])

  // Tabela selecionada
  const currentPriceTable = useMemo(() => {
    return priceTables.find((pt) => pt.id === selectedPriceTableId) || null
  }, [priceTables, selectedPriceTableId])

  // Vendedor selecionado
  const currentSalesperson = useMemo(() => {
    return salespeople.find((s) => s.id === selectedSalespersonId) || null
  }, [salespeople, selectedSalespersonId])

  // Atualização dinâmica do CGO / CFOP e Natureza da Operação
  useEffect(() => {
    const clientUf = (currentClient?.address_state as string) || 'ES'
    const companyUf = currentCompany?.uf || 'ES'
    const isInterestadual = clientUf.trim().toUpperCase() !== companyUf.trim().toUpperCase()

    // Regras fiscais dinâmicas do motor
    if (selectedCgo === 'BONIFICACAO') {
      const cfop = isInterestadual ? '6910' : '5910'
      setCfopDeterminado(cfop)
      setNaturezaOperacao(`Remessa em bonificação, doação ou brinde (${cfop})`)
    } else if (selectedCgo === 'REMESSA_DEMO') {
      const cfop = isInterestadual ? '6912' : '5912'
      setCfopDeterminado(cfop)
      setNaturezaOperacao(`Remessa para demonstração (${cfop})`)
    } else {
      // Venda normal
      const cfop = isInterestadual ? '6102' : '5102'
      setCfopDeterminado(cfop)
      setNaturezaOperacao(
        isInterestadual
          ? 'Venda de mercadoria adquirida ou recebida de terceiros para outro estado (6.102)'
          : 'Venda de mercadoria adquirida ou recebida de terceiros no estado (5.102)',
      )
    }
  }, [selectedCgo, currentClient, currentCompany])

  // Formas de pagamento dinâmicas pela tabela de preços
  const availablePaymentOptions = useMemo(() => {
    const defaultMethods = ['À vista — PIX', 'À vista — Transferência bancária', 'Boleto bancário']
    const defaultConditions = [
      'À vista (0 dias)',
      '7 dias direto',
      '14 dias direto',
      '28 dias (14/28)',
      '30/60 dias',
    ]

    if (!currentPriceTable) {
      return { methods: defaultMethods, conditions: defaultConditions }
    }

    // Lê parâmetros da tabela (ex: rules, formas_pagamento, condicoes_pagamento)
    const formasRaw = (currentPriceTable.formas_pagamento as string) || ''
    const condicoesRaw = (currentPriceTable.condicoes_pagamento as string) || ''

    let methods = defaultMethods
    let conditions = defaultConditions

    if (formasRaw.trim()) {
      const parsed = formasRaw
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (parsed.length > 0) methods = parsed
    }
    if (condicoesRaw.trim()) {
      const parsed = condicoesRaw
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (parsed.length > 0) conditions = parsed
    }

    return { methods, conditions }
  }, [currentPriceTable])

  // Define padrão de pagamento quando a tabela muda
  useEffect(() => {
    if (!paymentMethod && availablePaymentOptions.methods.length > 0) {
      setPaymentMethod(availablePaymentOptions.methods[0])
    }
    if (!paymentCondition && availablePaymentOptions.conditions.length > 0) {
      setPaymentCondition(availablePaymentOptions.conditions[0])
    }
  }, [availablePaymentOptions, paymentMethod, paymentCondition])

  // Média ponderada de prazo calculada pelas parcelas e vencimentos
  const mediaPrazoPonderada = useMemo(() => {
    // Se for à vista
    if (
      paymentCondition.toLowerCase().includes('vista') ||
      paymentMethod.toLowerCase().includes('pix') ||
      paymentMethod.toLowerCase().includes('transferência')
    ) {
      return 0
    }

    // Extrai números de dias da string de condição (ex: "14/28" -> [14, 28]; "7 dias" -> [7])
    const matches = paymentCondition.match(/\d+/g)
    if (!matches || matches.length === 0) return 0

    const days = matches.map(Number)
    // Se forem parcelas iguais, média simples dos dias é a média ponderada
    const sum = days.reduce((acc, d) => acc + d, 0)
    return Math.round(sum / days.length)
  }, [paymentCondition, paymentMethod])

  // Estoque disponível de cada produto considerando reservas ativas
  const getProductStockInfo = useCallback(
    (prodId: string, baseStock: number) => {
      const reserved = activeReservations
        .filter((r) => r.product_id === prodId)
        .reduce((sum, r) => sum + r.quantity, 0)
      const available = Math.max(0, baseStock - reserved)
      return { baseStock, reserved, available }
    },
    [activeReservations],
  )

  // Filtro de produtos para inclusão na etapa 2
  const filteredProductCatalog = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    return rawProducts
      .filter((p) => {
        if (!q) return true
        const name = String(p.name || '').toLowerCase()
        const code = String(p.code || '').toLowerCase()
        const ean = String(p.ean || '').toLowerCase()
        return name.includes(q) || code.includes(q) || ean.includes(q)
      })
      .slice(0, 15)
  }, [rawProducts, productSearch])

  // Adicionar produto ao pedido
  const handleAddProduct = (prod: Record<string, unknown>) => {
    const prodId = prod.id as string
    const existingIndex = items.findIndex((it) => it.product_id === prodId)

    // Preço e limite de desconto
    const basePrice =
      Number(prod.price) || parseFloat(String(prod.price || '0').replace(',', '.')) || 10.0
    const rawMaxDiscount =
      Number(prod.max_discount) || Number(currentPriceTable?.max_discount) || 15
    const stockRaw = Number(prod.stock) || 0
    const { available } = getProductStockInfo(prodId, stockRaw)

    if (available <= 0) {
      toast.error(`Produto "${prod.name}" sem estoque disponível no momento (0 un).`)
      return
    }

    if (existingIndex >= 0) {
      // Incrementa se houver estoque
      const current = items[existingIndex]
      const newQty = current.quantity + 1
      if (newQty > available) {
        toast.error(`Estoque insuficiente! Disponível: ${available} un.`)
        return
      }
      handleUpdateItemQuantity(existingIndex, newQty)
      toast.success(`Quantidade incrementada para "${prod.name}".`)
      return
    }

    const newItem: WizardOrderItem = {
      product_id: prodId,
      product_code: (prod.code as string) || 'PROD',
      product_name: (prod.name as string) || 'Produto',
      unit: (prod.unit as string) || 'UN',
      ean: (prod.ean as string) || '',
      ncm: (prod.ncm as string) || '',
      available_stock: available,
      table_price: basePrice,
      max_discount_allowed: rawMaxDiscount,
      discount_percent: 0,
      discount_value: 0,
      final_unit_price: basePrice,
      quantity: 1,
      total: basePrice,
      cfop: cfopDeterminado,
    }

    setItems((prev) => [...prev, newItem])
    toast.success(`Item "${prod.name}" adicionado com sucesso.`)
  }

  // Alterar quantidade de um item
  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it
        if (newQty <= 0) {
          toast.error('A quantidade deve ser maior que zero.')
          return it
        }
        if (newQty > it.available_stock) {
          toast.error(
            `Quantidade acima do estoque disponível (${it.available_stock} un). Operação bloqueada.`,
          )
          return it
        }
        const total = Math.max(0, newQty * it.final_unit_price)
        return {
          ...it,
          quantity: newQty,
          total: parseFloat(total.toFixed(2)),
        }
      }),
    )
  }

  // Alterar desconto percentual de um item
  const handleUpdateItemDiscountPercent = (index: number, newDiscountPct: number) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it
        if (newDiscountPct < 0) newDiscountPct = 0
        if (newDiscountPct > it.max_discount_allowed) {
          toast.error(
            `Desconto de ${newDiscountPct}% excede o limite autorizado de ${it.max_discount_allowed}% para esta tabela/produto.`,
          )
          return it
        }
        const discountVal = (it.table_price * newDiscountPct) / 100
        const finalPrice = Math.max(0, it.table_price - discountVal)
        const total = finalPrice * it.quantity
        return {
          ...it,
          discount_percent: newDiscountPct,
          discount_value: parseFloat(discountVal.toFixed(2)),
          final_unit_price: parseFloat(finalPrice.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
        }
      }),
    )
  }

  // Remover item
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Cálculos consolidados da etapa 2 e conferência
  const orderTotals = useMemo(() => {
    const gross = items.reduce((sum, it) => sum + it.table_price * it.quantity, 0)
    const discounts = items.reduce((sum, it) => sum + it.discount_value * it.quantity, 0)
    const net = items.reduce((sum, it) => sum + it.total, 0)
    const totalItemsQty = items.reduce((sum, it) => sum + it.quantity, 0)
    return {
      gross: parseFloat(gross.toFixed(2)),
      discounts: parseFloat(discounts.toFixed(2)),
      net: parseFloat(net.toFixed(2)),
      totalItemsQty,
    }
  }, [items])

  // Ação: SALVAR CABEÇALHO E CONTINUAR (Avançar para Etapa 2)
  const handleSaveHeaderAndContinue = () => {
    if (!selectedCompanyId) {
      toast.error('Selecione a empresa emissora do pedido.')
      return
    }
    if (!selectedClientId) {
      toast.error('Selecione o cliente cadastrado.')
      return
    }
    if (!selectedSalespersonId) {
      toast.error('Selecione o vendedor / RCA responsável.')
      return
    }
    if (!selectedPriceTableId) {
      toast.error('Selecione uma tabela de preços válida.')
      return
    }
    if (!paymentMethod) {
      toast.error('Selecione a forma de pagamento autorizada.')
      return
    }
    if (!paymentCondition) {
      toast.error('Selecione a condição de pagamento negociada.')
      return
    }

    setHeaderDraftSaved(true)
    setStep(2)
    toast.success('Cabeçalho validado com sucesso! Prossiga para a inclusão de itens.')
  }

  // Ação: Avançar para Conferência
  const handleGoToReview = () => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto ao pedido antes de prosseguir.')
      return
    }
    // Validação estrita de cada item
    for (const it of items) {
      if (it.quantity <= 0) {
        toast.error(`Quantidade inválida para o item "${it.product_name}".`)
        return
      }
      if (it.quantity > it.available_stock) {
        toast.error(
          `Estoque insuficiente para "${it.product_name}". Solicitado: ${it.quantity}, Disponível: ${it.available_stock}`,
        )
        return
      }
    }
    setStep(3)
  }

  // Ação: SALVAR PEDIDO FINAL (Gera número PV transacional, revalida estoque e grava)
  const handleFinalSaveOrder = async () => {
    if (items.length === 0) {
      toast.error('O pedido precisa de itens cadastrados.')
      return
    }

    setSubmitting(true)
    try {
      // 1. REVALIDAÇÃO DE ESTOQUE EM TEMPO REAL NO BANCO (Proteção contra concorrência)
      const freshProducts = await pb.collection('products').getFullList({ fields: 'id,name,stock' })
      const freshReservations = await pb
        .collection('stock_reservations')
        .getFullList({ filter: 'status = "ativa"' })

      for (const it of items) {
        const prodMatch = freshProducts.find((p) => p.id === it.product_id)
        const currentStock = prodMatch ? Number(prodMatch.stock) || 0 : 0
        const activeResQty = freshReservations
          .filter((r) => r.product_id === it.product_id)
          .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)
        const currentAvailable = Math.max(0, currentStock - activeResQty)

        if (it.quantity > currentAvailable) {
          toast.error(
            `Falha na revalidação concorrente de estoque! O produto "${it.product_name}" tem apenas ${currentAvailable} un disponíveis no momento. Ajuste o pedido.`,
          )
          setStep(2)
          setSubmitting(false)
          return
        }
      }

      // 2. GERAÇÃO DO NÚMERO SEQUENCIAL TRANSACIONAL VIA ENDPOINT DEDICADO
      let nextNumber = ''
      try {
        const numRes = await pb.send('/backend/v1/sales-numbers/next', {
          method: 'POST',
          body: JSON.stringify({ prefix: 'PV-' }),
          headers: { 'Content-Type': 'application/json' },
        })
        if (numRes && numRes.next_number) {
          nextNumber = numRes.next_number
        }
      } catch (err) {
        console.warn('Endpoint /sales-numbers/next falhou, usando fallback sequencial:', err)
      }

      // Fallback sequencial se o endpoint não responder
      if (!nextNumber) {
        const lastOrders = await pb.collection('sales_orders').getList(1, 1, {
          sort: '-created',
        })
        let lastSeq = 5
        if (lastOrders.items.length > 0) {
          const match = String(lastOrders.items[0].order_number || '').match(/(\d+)/)
          if (match) lastSeq = parseInt(match[1], 10)
        }
        nextNumber = `PV-${String(lastSeq + 1).padStart(6, '0')}`
      }

      const clientName =
        (currentClient?.company_name as string) ||
        (currentClient?.full_name as string) ||
        (currentClient?.trade_name as string) ||
        'Cliente'
      const companyName = currentCompany?.name || 'DEC Eldorado'
      const salespersonName = currentSalesperson?.name || userName

      // Monta itens no padrão oficial de sales_orders
      const formattedItems = items.map((it) => ({
        product_id: it.product_id,
        product_code: it.product_code,
        product_name: it.product_name,
        name: it.product_name,
        unit: it.unit,
        ncm: it.ncm || '',
        cfop: it.cfop || cfopDeterminado,
        quantity: it.quantity,
        unit_price: it.final_unit_price,
        table_price: it.table_price,
        discount_percent: it.discount_percent,
        discount: it.discount_value * it.quantity,
        total: it.total,
        total_price: it.total,
      }))

      const nowIso = new Date().toISOString()

      // 3. CRIAÇÃO DO PEDIDO DE VENDA
      const newOrderPayload = {
        order_number: nextNumber,
        empresa_id: selectedCompanyId,
        company_id: selectedCompanyId,
        company: companyName,
        branch: 'Matriz',
        client_id: selectedClientId,
        client_name: clientName,
        customer_cnpj: (currentClient?.cnpj as string) || (currentClient?.cpf as string) || '',
        customer_email: (currentClient?.email as string) || '',
        customer_phone: (currentClient?.phone as string) || '',
        salesperson_id: selectedSalespersonId,
        salesperson_name: salespersonName,
        price_table_id: selectedPriceTableId,
        price_table_name:
          (currentPriceTable?.table_name as string) ||
          (currentPriceTable?.name as string) ||
          (currentPriceTable?.description as string) ||
          'Tabela Padrão',
        operation_type: selectedCgo,
        cfop: cfopDeterminado,
        natureza_operacao: naturezaOperacao,
        payment_method: paymentMethod,
        payment_condition: paymentCondition,
        negotiation_type: negotiationType,
        delivery_date: deliveryDate,
        internal_notes: observations,
        gross_value: orderTotals.gross.toFixed(2),
        discount_value: orderTotals.discounts.toFixed(2),
        total_value: orderTotals.net.toFixed(2),
        items: formattedItems,
        status: 'Confirmado',
        separacao_status: 'pendente',
        faturamento_status: 'pendente_faturamento', // Encaminhado à Central de Faturamento
        responsible_user: userName,
        created_by_user: userName,
        history: [
          {
            action: 'Pedido Criado via Wizard de Venda',
            user: userName,
            date: nowIso,
            note: `Pedido gerado com numeração oficial ${nextNumber}. Itens: ${items.length}, Total Líquido: R$ ${orderTotals.net.toFixed(2)}, Média Prazo: ${mediaPrazoPonderada} dias.`,
          },
        ],
      }

      const createdOrder = await pb.collection('sales_orders').create(newOrderPayload)

      // 4. CRIAÇÃO DAS RESERVAS DE ESTOQUE (stock_reservations)
      for (const it of items) {
        try {
          await pb.collection('stock_reservations').create({
            order_id: createdOrder.id,
            order_number: nextNumber,
            product_id: it.product_id,
            product_code: it.product_code,
            product_name: it.product_name,
            quantity: it.quantity,
            empresa_id: selectedCompanyId,
            status: 'ativa',
          })
        } catch (resErr) {
          console.warn('Aviso: falha ao criar stock_reservation:', resErr)
        }
      }

      // 5. AUDITORIA
      logSalesAudit(
        'create',
        'sales',
        createdOrder.id,
        `Pedido de Venda ${nextNumber} criado por ${userName} para cliente ${clientName}. Total R$ ${orderTotals.net.toFixed(2)}`,
        null,
        newOrderPayload,
      )

      toast.success(`Pedido de Venda #${nextNumber} criado e confirmado com sucesso!`)
      onOpenChange(false)
      if (onSuccess) {
        onSuccess(createdOrder)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar pedido.'
      toast.error(`Erro ao gerar pedido: ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Topo do Wizard com Indicador Visual de Etapas */}
        <DialogHeader className="p-4 bg-muted/40 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-lg font-black text-[#005B2E] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#005B2E]" />
                Novo Pedido de Venda — HURAM ERP
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fluxo comercial de 2 etapas com cabeçalho dinâmico, validação de estoque e numeração
                transacional.
              </p>
            </div>
            {/* Indicadores Visuais de Etapa */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                  step === 1
                    ? 'bg-[#005B2E] text-white shadow-sm'
                    : headerDraftSaved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                <span>1. Cabeçalho</span>
                {headerDraftSaved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                  step === 2
                    ? 'bg-[#005B2E] text-white shadow-sm'
                    : items.length > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                <span>2. Produtos</span>
                {items.length > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                  step === 3
                    ? 'bg-[#005B2E] text-white shadow-sm'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span>3. Conferência</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo rolável das etapas */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
              <span className="text-xs text-muted-foreground">
                Carregando parâmetros e cadastros de apoio...
              </span>
            </div>
          ) : (
            <>
              {/* ETAPA 1: CABEÇALHO */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Empresa Emissora */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#005B2E]" />
                        Empresa Emissora <span className="text-rose-600">*</span>
                      </Label>
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => {
                          const newCompId = e.target.value
                          setSelectedCompanyId(newCompId)
                          if (newCompId) {
                            const matchingSp = salespeople.find((s) => s.company_id === newCompId)
                            if (matchingSp) {
                              setSelectedSalespersonId(matchingSp.id)
                            }
                            const compName = companies.find((c) => c.id === newCompId)?.name
                            const matchingPt = priceTables.find(
                              (pt) =>
                                pt.empresa_id === newCompId ||
                                pt.empresa === newCompId ||
                                (compName && pt.empresa === compName),
                            )
                            if (matchingPt) {
                              setSelectedPriceTableId(matchingPt.id as string)
                            }
                          }
                        }}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-[#005B2E]"
                      >
                        <option value="">Selecione a empresa...</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.cnpj ? `(${c.cnpj})` : ''} - {c.uf}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cliente */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#005B2E]" />
                        Cliente Cadastrado <span className="text-rose-600">*</span>
                      </Label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-[#005B2E]"
                      >
                        <option value="">Selecione o cliente...</option>
                        {clients.map((c) => {
                          const doc = (c.cnpj as string) || (c.cpf as string) || ''
                          const label =
                            (c.company_name as string) || (c.full_name as string) || 'Cliente'
                          return (
                            <option key={c.id as string} value={c.id as string}>
                              {label} {doc ? `(${doc})` : ''}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {/* Vendedor Unificado (RCAs + Internos) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#005B2E]" />
                        Vendedor / RCA Responsável <span className="text-rose-600">*</span>
                      </Label>
                      <select
                        value={selectedSalespersonId}
                        onChange={(e) => setSelectedSalespersonId(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-[#005B2E]"
                      >
                        <option value="">Selecione o vendedor ou RCA...</option>
                        {salespeople.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tabela de Preços Válida */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#005B2E]" />
                        Tabela de Preços <span className="text-rose-600">*</span>
                      </Label>
                      <select
                        value={selectedPriceTableId}
                        onChange={(e) => setSelectedPriceTableId(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-[#005B2E]"
                      >
                        <option value="">Selecione a tabela de preços...</option>
                        {priceTables.map((pt) => (
                          <option key={pt.id as string} value={pt.id as string}>
                            {(pt.table_name as string) ||
                              (pt.name as string) ||
                              (pt.description as string) ||
                              'Tabela de Preços'}{' '}
                            (Válida)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CGO / Operação Fiscal */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5 text-[#005B2E]" />
                        CGO / Operação Fiscal <span className="text-rose-600">*</span>
                      </Label>
                      <select
                        value={selectedCgo}
                        onChange={(e) => setSelectedCgo(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-[#005B2E]"
                      >
                        {fiscalOps.map((op) => (
                          <option key={op.codigo} value={op.codigo}>
                            {op.nome} ({op.codigo})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CFOP e Natureza (Automáticos e Travados) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        CFOP e Natureza da Operação (Automáticos)
                      </Label>
                      <div className="p-2 rounded-md bg-muted/60 border text-xs font-mono flex items-center justify-between">
                        <span className="font-bold text-[#005B2E]">CFOP: {cfopDeterminado}</span>
                        <span className="text-muted-foreground text-[11px] truncate max-w-[240px]">
                          {naturezaOperacao}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloco de Condições de Pagamento Dinâmicas */}
                  <Card className="border bg-[#005B2E]/5">
                    <CardHeader className="py-2.5 px-3 border-b bg-muted/30">
                      <CardTitle className="text-xs font-bold text-[#005B2E] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          Condições de Pagamento e Negociação da Tabela
                        </span>
                        <Badge variant="outline" className="text-[11px] font-mono bg-white">
                          Média Ponderada: {mediaPrazoPonderada} dias
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Forma de Pagamento</Label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {availablePaymentOptions.methods.map((m, idx) => (
                            <option key={idx} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Condição / Prazos</Label>
                        <select
                          value={paymentCondition}
                          onChange={(e) => setPaymentCondition(e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {availablePaymentOptions.conditions.map((c, idx) => (
                            <option key={idx} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Previsão de Entrega</Label>
                        <Input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observações */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Observações Comerciais / Logísticas
                    </Label>
                    <Textarea
                      rows={2}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Instruções de entrega, restrições ou dados complementares do pedido..."
                      className="text-xs resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 2: PRODUTOS */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Busca e Adição Rápida */}
                  <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <Input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar produto por código, descrição ou código de barras (EAN)..."
                        className="text-xs h-8 bg-white"
                      />
                    </div>

                    {productSearch.trim() && (
                      <div className="max-h-48 overflow-y-auto divide-y rounded-md border bg-white shadow-sm">
                        {filteredProductCatalog.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            Nenhum produto encontrado com o termo informado.
                          </div>
                        ) : (
                          filteredProductCatalog.map((prod) => {
                            const { available } = getProductStockInfo(
                              prod.id as string,
                              Number(prod.stock) || 0,
                            )
                            const basePrice =
                              Number(prod.price) ||
                              parseFloat(String(prod.price || '0').replace(',', '.')) ||
                              10.0
                            return (
                              <div
                                key={prod.id as string}
                                className="p-2 flex items-center justify-between text-xs hover:bg-muted/40 transition-colors"
                              >
                                <div>
                                  <span className="font-mono font-bold text-[#005B2E] mr-2">
                                    {String(prod.code || 'PROD')}
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    {String(prod.name)}
                                  </span>
                                  <span className="text-muted-foreground text-[11px] ml-2">
                                    (Disp: <strong>{available}</strong> {String(prod.unit || 'UN')})
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-foreground">
                                    R$ {basePrice.toFixed(2)}
                                  </span>
                                  <Button
                                    size="sm"
                                    type="button"
                                    onClick={() => handleAddProduct(prod)}
                                    disabled={available <= 0}
                                    className="h-7 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tabela de Itens Adicionados */}
                  <div className="border rounded-lg overflow-hidden bg-card">
                    <div className="py-2 px-3 bg-muted/40 border-b flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        Itens do Pedido ({items.length})
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Edição em tempo real com validação estrita de estoque e limite de desconto
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-500" />
                        <p className="text-xs font-semibold">Nenhum item adicionado ainda.</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Utilize a busca acima para incluir produtos da tabela no pedido.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-muted/50 text-muted-foreground border-b text-[11px] uppercase font-bold">
                              <th className="py-2 px-2">Código</th>
                              <th className="py-2 px-3">Descrição</th>
                              <th className="py-2 px-1 text-center">Un</th>
                              <th className="py-2 px-2 text-right">Estoque Disp.</th>
                              <th className="py-2 px-2 text-right">Preço Tab.</th>
                              <th className="py-2 px-2 text-right">% Desc. (Máx)</th>
                              <th className="py-2 px-2 text-right">Preço Final</th>
                              <th className="py-2 px-2 text-right">Qtd.</th>
                              <th className="py-2 px-3 text-right">Total</th>
                              <th className="py-2 px-1 text-center">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {items.map((it, idx) => (
                              <tr key={idx} className="hover:bg-muted/10">
                                <td className="py-2 px-2 font-mono font-bold text-muted-foreground">
                                  {it.product_code}
                                </td>
                                <td className="py-2 px-3 font-medium text-foreground max-w-[200px] truncate">
                                  {it.product_name}
                                </td>
                                <td className="py-2 px-1 text-center text-muted-foreground">
                                  {it.unit}
                                </td>
                                <td className="py-2 px-2 text-right font-mono">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      it.available_stock > 10
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    {it.available_stock}
                                  </Badge>
                                </td>
                                <td className="py-2 px-2 text-right font-mono">
                                  R$ {it.table_price.toFixed(2)}
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={it.max_discount_allowed}
                                      value={it.discount_percent}
                                      onChange={(e) =>
                                        handleUpdateItemDiscountPercent(idx, Number(e.target.value))
                                      }
                                      className="w-16 h-7 text-xs text-right font-mono"
                                    />
                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                      % (máx {it.max_discount_allowed}%)
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-right font-bold text-[#005B2E] font-mono">
                                  R$ {it.final_unit_price.toFixed(2)}
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <Input
                                    type="number"
                                    min={1}
                                    max={it.available_stock}
                                    value={it.quantity}
                                    onChange={(e) =>
                                      handleUpdateItemQuantity(idx, Number(e.target.value))
                                    }
                                    className="w-16 h-7 text-xs text-right font-mono"
                                  />
                                </td>
                                <td className="py-2 px-3 text-right font-black font-mono text-foreground">
                                  R$ {it.total.toFixed(2)}
                                </td>
                                <td className="py-2 px-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    className="text-rose-600 hover:text-rose-800 p-1"
                                    title="Remover item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Resumo Financeiro da Etapa 2 */}
                  {items.length > 0 && (
                    <div className="p-3 bg-[#005B2E]/5 rounded-lg border flex flex-wrap items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span>
                          Total de Itens: <strong>{orderTotals.totalItemsQty} un</strong>
                        </span>
                        <span>
                          Bruto: <strong>R$ {orderTotals.gross.toFixed(2)}</strong>
                        </span>
                        <span className="text-amber-800">
                          Descontos: <strong>R$ {orderTotals.discounts.toFixed(2)}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground mr-2">Valor Líquido:</span>
                        <span className="text-base font-black text-[#005B2E]">
                          R$ {orderTotals.net.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ETAPA 3: CONFERÊNCIA E FINALIZAÇÃO */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>
                      Conferência prévia dos dados comerciais, fiscais e financeiros. O número
                      oficial do pedido (PV-XXXXXX) será gerado transacionalmente na confirmação.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dados Comerciais */}
                    <Card className="border">
                      <CardHeader className="py-2.5 px-3 bg-muted/30 border-b">
                        <CardTitle className="text-xs font-bold text-foreground">
                          Dados Comerciais e Fiscais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 text-xs space-y-1.5">
                        <p>
                          <strong>Empresa:</strong> {currentCompany?.name}
                        </p>
                        <p>
                          <strong>Cliente:</strong>{' '}
                          {(currentClient?.company_name as string) ||
                            (currentClient?.full_name as string)}
                        </p>
                        <p>
                          <strong>Vendedor:</strong> {currentSalesperson?.name} (
                          {currentSalesperson?.type})
                        </p>
                        <p>
                          <strong>CGO / Operação:</strong> {selectedCgo}
                        </p>
                        <p>
                          <strong>CFOP Determinado:</strong>{' '}
                          <span className="font-mono text-[#005B2E] font-bold">
                            {cfopDeterminado}
                          </span>
                        </p>
                        <p>
                          <strong>Natureza da Operação:</strong> {naturezaOperacao}
                        </p>
                        <p>
                          <strong>Tabela de Preços:</strong>{' '}
                          {(currentPriceTable?.name as string) || 'Padrão'}
                        </p>
                        <p>
                          <strong>Previsão de Entrega:</strong> {deliveryDate}
                        </p>
                        {observations && (
                          <p className="text-muted-foreground">
                            <strong>Obs:</strong> {observations}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Dados Financeiros */}
                    <Card className="border">
                      <CardHeader className="py-2.5 px-3 bg-muted/30 border-b">
                        <CardTitle className="text-xs font-bold text-foreground">
                          Condições Financeiras e Prazos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 text-xs space-y-1.5">
                        <p>
                          <strong>Forma de Pagamento:</strong> {paymentMethod}
                        </p>
                        <p>
                          <strong>Condição Negociada:</strong> {paymentCondition}
                        </p>
                        <p>
                          <strong>Média de Prazo Ponderada:</strong>{' '}
                          <span className="font-bold text-[#005B2E]">
                            {mediaPrazoPonderada} dias
                          </span>
                        </p>
                        <div className="pt-2 border-t mt-2 space-y-1 font-mono">
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Valor Bruto:</span>
                            <span>R$ {orderTotals.gross.toFixed(2)}</span>
                          </p>
                          <p className="flex justify-between text-amber-800">
                            <span>Descontos Totais:</span>
                            <span>- R$ {orderTotals.discounts.toFixed(2)}</span>
                          </p>
                          <p className="flex justify-between text-base font-black text-[#005B2E] pt-1 border-t">
                            <span>Valor Líquido:</span>
                            <span>R$ {orderTotals.net.toFixed(2)}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lista resumida de itens conferidos */}
                  <div className="border rounded-lg overflow-hidden bg-card">
                    <div className="py-2 px-3 bg-muted/40 border-b font-bold text-xs">
                      Itens para Faturamento ({items.length})
                    </div>
                    <div className="max-h-40 overflow-y-auto divide-y text-xs">
                      {items.map((it, idx) => (
                        <div key={idx} className="p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-muted-foreground">
                              {it.product_code}
                            </span>
                            <span className="font-medium text-foreground">{it.product_name}</span>
                            <span className="text-muted-foreground">
                              x {it.quantity} {it.unit}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-foreground">
                            R$ {it.total.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé e Navegação entre Etapas */}
        <DialogFooter className="p-3 bg-muted/40 border-t flex flex-row items-center justify-between sm:justify-between">
          <div>
            {step === 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8"
              >
                Cancelar
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="text-xs h-8 gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar e Editar Cabeçalho
              </Button>
            )}

            {step === 3 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-xs h-8"
                >
                  Editar Cabeçalho
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="text-xs h-8 gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Editar Produtos
                </Button>
              </div>
            )}
          </div>

          <div>
            {step === 1 && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveHeaderAndContinue}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8 gap-1.5 font-semibold"
              >
                Salvar Cabeçalho e Continuar
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                size="sm"
                onClick={handleGoToReview}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8 gap-1.5 font-semibold"
              >
                Avançar para Conferência
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {step === 3 && (
              <Button
                type="button"
                size="sm"
                onClick={handleFinalSaveOrder}
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8 gap-1.5 font-bold shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Gerando Pedido Transacional...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Salvar Pedido (Gerar PV)
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

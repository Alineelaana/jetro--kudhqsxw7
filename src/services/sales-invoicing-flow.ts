import pb from '@/lib/pocketbase/client'

export type FaturamentoStatus =
  | 'pendente_liberacao'
  | 'pendente_faturamento'
  | 'faturado'
  | 'cancelado'

export type SeparacaoStatus = 'pendente' | 'confirmada'

export interface OrderItem {
  id?: string
  product_id?: string
  product_code?: string
  product_name?: string
  name?: string
  description?: string
  quantity: number
  unit_price: number
  price?: number
  unit?: string
  ncm?: string
  cfop?: string
  total?: number
  total_price?: number
}

export interface SalesOrderRecord {
  id: string
  order_number: string
  status: string
  client_id?: string
  client_name?: string
  customer_cnpj?: string
  customer_city?: string
  customer_district?: string
  customer_address?: string
  salesperson_id?: string
  salesperson_name?: string
  payment_condition?: string
  payment_method?: string
  delivery_date?: string
  carrier_name?: string
  freight_type?: string
  total_value?: string
  gross_value?: string
  items?: OrderItem[] | string
  company?: string
  branch?: string
  empresa_id?: string
  filial_id?: string
  stock_reserved?: boolean
  history?: Array<{
    date: string
    user: string
    action: string
    notes?: string
  }>
  approval_data?: {
    approved?: boolean
    approved_by?: string
    approved_at?: string
    status?: string
  }
  faturamento_status?: FaturamentoStatus | string
  invoicing_status?: string
  separacao_status?: SeparacaoStatus | string
  separacao_confirmada_at?: string
  separacao_confirmada_por?: string
  liberado_faturamento_at?: string
  liberado_faturamento_por?: string
  receivable_id?: string
  nfe_record_id?: string
  nfe_chave_acesso?: string
  nfe_numero?: string
  is_invoiced?: boolean
  invoiced_at?: string
  created: string
  updated: string
}

export interface StockCheckResult {
  product_id?: string
  product_name: string
  solicitado: number
  estoque_atual: number
  reservado_outros: number
  disponivel: number
  atende: boolean
}

export interface OrderVerificationResult {
  order_id: string
  order_number: string
  todos_disponiveis: boolean
  detalhes: StockCheckResult[]
}

export function parseOrderItems(items: unknown): OrderItem[] {
  if (!items) return []
  if (Array.isArray(items)) return items
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function resolveOrderInvoicingStatus(order: SalesOrderRecord): FaturamentoStatus {
  if (order.faturamento_status) {
    const fs = String(order.faturamento_status).toLowerCase()
    if (fs === 'faturado') return 'faturado'
    if (fs === 'cancelado') return 'cancelado'
    if (fs === 'pendente_faturamento') return 'pendente_faturamento'
    if (fs === 'pendente_liberacao') return 'pendente_liberacao'
  }

  const legacyStatus = (order.status || '').toLowerCase()
  if (legacyStatus === 'faturado' || order.is_invoiced) return 'faturado'
  if (legacyStatus === 'cancelado' || legacyStatus === 'rejeitado') return 'cancelado'
  if (
    legacyStatus === 'pronto para faturamento' ||
    legacyStatus === 'liberado para faturamento' ||
    legacyStatus === 'liberado'
  ) {
    return 'pendente_faturamento'
  }
  return 'pendente_liberacao'
}

export function formatCurrency(val: unknown): string {
  if (val === null || val === undefined || val === '') return 'R$ 0,00'
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.')) || 0
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(val: unknown): string {
  if (!val) return '—'
  try {
    return new Date(String(val)).toLocaleDateString('pt-BR')
  } catch {
    return String(val)
  }
}

function appendHistory(
  existingHistory: unknown,
  action: string,
  user: string,
  notes?: string,
): Array<{ date: string; user: string; action: string; notes?: string }> {
  let hist: Array<{ date: string; user: string; action: string; notes?: string }> = []
  if (Array.isArray(existingHistory)) {
    hist = [...existingHistory]
  } else if (typeof existingHistory === 'string') {
    try {
      const p = JSON.parse(existingHistory)
      if (Array.isArray(p)) hist = p
    } catch {
      hist = []
    }
  }
  hist.push({
    date: new Date().toISOString(),
    user: user || 'Operador',
    action,
    notes,
  })
  return hist
}

export async function confirmSalesOrder(
  order: SalesOrderRecord,
  userName = 'Operador',
): Promise<{ success: boolean; receivable_id?: string; error?: string }> {
  try {
    const curStatus = resolveOrderInvoicingStatus(order)
    if (curStatus === 'cancelado') {
      return { success: false, error: 'Pedido cancelado não pode ser confirmado.' }
    }
    if (curStatus === 'faturado') {
      return { success: false, error: 'Pedido já está faturado.' }
    }

    const items = parseOrderItems(order.items)
    const empId = order.empresa_id || order.company || ''
    const totalValStr = String(order.total_value || order.gross_value || '0').replace(',', '.')
    const totalValNum = parseFloat(totalValStr) || 0

    let receivableId = order.receivable_id
    if (!receivableId) {
      const recPayload: Record<string, unknown> = {
        numero_titulo: `PRV-${order.order_number || order.id.slice(0, 8)}`,
        cliente: order.client_name || 'Cliente',
        client_id: order.client_id || '',
        empresa: empId,
        documento_origem: `Pedido de Venda #${order.order_number || order.id}`,
        numero_pedido: order.order_number || order.id,
        data_emissao: new Date().toISOString().substring(0, 10),
        data_competencia: new Date().toISOString().substring(0, 10),
        data_vencimento:
          order.delivery_date ||
          new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
        valor_original: totalValNum.toFixed(2),
        valor_atualizado: totalValNum.toFixed(2),
        forma_recebimento: order.payment_method || 'Boleto Bancário',
        status: 'provisionado',
        observacoes: `Provisão financeira automática gerada na confirmação do pedido #${order.order_number}`,
        historico: [
          {
            data: new Date().toISOString(),
            usuario: userName,
            acao: 'Provisão criada na confirmação do pedido',
          },
        ],
      }
      try {
        const createdRec = await pb.collection('financial_receivables').create(recPayload)
        receivableId = createdRec.id
      } catch (errRec) {
        console.warn('Aviso: falha ao criar provisão financeira:', errRec)
      }
    }

    for (const it of items) {
      const q = Number(it.quantity) || 0
      if (q > 0) {
        try {
          await pb.collection('stock_reservations').create({
            order_id: order.id,
            order_number: order.order_number,
            product_id: it.product_id || it.id || '',
            product_code: it.product_code || '',
            product_name: it.product_name || it.name || it.description || 'Produto',
            quantity: q,
            status: 'ativa',
            empresa_id: empId,
          })
        } catch (errRes) {
          console.warn('Aviso: falha ao gravar stock_reservations:', errRes)
        }
      }
    }

    const newHistory = appendHistory(
      order.history,
      'Pedido Confirmado (Provisão e Reserva de Estoque ativadas)',
      userName,
    )
    await pb.collection('sales_orders').update(order.id, {
      status: 'Confirmado',
      faturamento_status: 'pendente_liberacao',
      stock_reserved: true,
      receivable_id: receivableId || '',
      history: newHistory,
    })

    return { success: true, receivable_id: receivableId }
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message || 'Falha ao confirmar pedido.'
    return { success: false, error: msg }
  }
}

export async function confirmOrderSeparation(
  order: SalesOrderRecord,
  userName = 'Operador',
): Promise<{ success: boolean; verification: OrderVerificationResult; error?: string }> {
  try {
    const items = parseOrderItems(order.items)
    if (items.length === 0) {
      return {
        success: false,
        verification: {
          order_id: order.id,
          order_number: order.order_number,
          todos_disponiveis: false,
          detalhes: [],
        },
        error: 'Pedido não possui itens para separação.',
      }
    }

    let allProducts: Array<{ id: string; name: string; code: string; stock: number }> = []
    try {
      allProducts = await pb.collection('products').getFullList({ fields: 'id,name,code,stock' })
    } catch {
      allProducts = []
    }

    let activeReservations: Array<{ order_id: string; product_id: string; quantity: number }> = []
    try {
      activeReservations = await pb
        .collection('stock_reservations')
        .getFullList({ filter: 'status = "ativa"' })
    } catch {
      activeReservations = []
    }

    const verificationDetails: StockCheckResult[] = []
    let allAvailable = true

    for (const it of items) {
      const q = Number(it.quantity) || 0
      const prodId = it.product_id || it.id || ''
      const prodCode = it.product_code || ''
      const prodName = it.product_name || it.name || it.description || 'Item'

      const prod = allProducts.find(
        (p) =>
          (prodId && p.id === prodId) ||
          (prodCode && p.code === prodCode) ||
          p.name.toLowerCase() === prodName.toLowerCase(),
      )

      const estoqueAtual = prod ? Number(prod.stock) || 0 : 0

      const reservadoOutros = activeReservations
        .filter((r) => r.order_id !== order.id && r.product_id === (prod?.id || prodId))
        .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)

      const disponivel = Math.max(0, estoqueAtual - reservadoOutros)
      const atende = estoqueAtual >= q || disponivel >= q

      if (!atende) {
        allAvailable = false
      }

      verificationDetails.push({
        product_id: prod?.id || prodId,
        product_name: prodName,
        solicitado: q,
        estoque_atual: estoqueAtual,
        reservado_outros: reservadoOutros,
        disponivel,
        atende,
      })
    }

    const verification: OrderVerificationResult = {
      order_id: order.id,
      order_number: order.order_number,
      todos_disponiveis: allAvailable,
      detalhes: verificationDetails,
    }

    if (!allAvailable) {
      const faltantes = verificationDetails
        .filter((d) => !d.atende)
        .map((d) => `${d.product_name} (solicitado: ${d.solicitado}, estoque: ${d.estoque_atual})`)
        .join('; ')
      return {
        success: false,
        verification,
        error: `Não há estoque suficiente para os itens: ${faltantes}`,
      }
    }

    const nowIso = new Date().toISOString()
    const newHistory = appendHistory(
      order.history,
      'Separação de Estoque Confirmada com Sucesso',
      userName,
    )

    await pb.collection('sales_orders').update(order.id, {
      separacao_status: 'confirmada',
      separacao_confirmada_at: nowIso,
      separacao_confirmada_por: userName,
      history: newHistory,
    })

    return { success: true, verification }
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message || 'Falha ao confirmar separação.'
    return {
      success: false,
      verification: {
        order_id: order.id,
        order_number: order.order_number,
        todos_disponiveis: false,
        detalhes: [],
      },
      error: msg,
    }
  }
}

export async function releaseOrderForInvoicing(
  order: SalesOrderRecord,
  userName = 'Operador',
): Promise<{ success: boolean; error?: string }> {
  try {
    const curStatus = resolveOrderInvoicingStatus(order)
    if (curStatus === 'cancelado') {
      return { success: false, error: 'Pedido cancelado não pode ser liberado para faturamento.' }
    }
    if (curStatus === 'faturado') {
      return { success: false, error: 'Pedido já está faturado.' }
    }

    if (order.separacao_status !== 'confirmada') {
      const sepRes = await confirmOrderSeparation(order, userName)
      if (!sepRes.success) {
        return {
          success: false,
          error:
            sepRes.error ||
            'Separação não pôde ser confirmada devido à falta de estoque. Liberação bloqueada.',
        }
      }
    }

    const nowIso = new Date().toISOString()
    const newHistory = appendHistory(
      order.history,
      'Liberado para Faturamento (Encaminhado para a Central de Faturamento)',
      userName,
    )

    await pb.collection('sales_orders').update(order.id, {
      status: 'Pronto para Faturamento',
      faturamento_status: 'pendente_faturamento',
      liberado_faturamento_at: nowIso,
      liberado_faturamento_por: userName,
      history: newHistory,
    })

    return { success: true }
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message || 'Falha ao liberar faturamento.'
    return { success: false, error: msg }
  }
}

export async function cancelSalesOrder(
  order: SalesOrderRecord,
  reason = 'Cancelamento solicitado pelo operador',
  userName = 'Operador',
): Promise<{ success: boolean; error?: string }> {
  try {
    if (resolveOrderInvoicingStatus(order) === 'faturado') {
      return { success: false, error: 'Pedido faturado não pode ser cancelado diretamente.' }
    }

    try {
      const reservations = await pb
        .collection('stock_reservations')
        .getFullList({ filter: `order_id = "${order.id}" && status = "ativa"` })
      for (const res of reservations) {
        await pb.collection('stock_reservations').update(res.id, { status: 'cancelada' })
      }
    } catch (errRes) {
      console.warn('Aviso: falha ao cancelar reservas de estoque:', errRes)
    }

    if (order.receivable_id) {
      try {
        await pb.collection('financial_receivables').update(order.receivable_id, {
          status: 'cancelado',
          observacoes: `Provisão cancelada devido ao cancelamento do pedido #${order.order_number}: ${reason}`,
        })
      } catch (errFin) {
        console.warn('Aviso: falha ao cancelar provisão financeira:', errFin)
      }
    }

    const newHistory = appendHistory(order.history, `Pedido Cancelado: ${reason}`, userName, reason)

    await pb.collection('sales_orders').update(order.id, {
      status: 'Cancelado',
      faturamento_status: 'cancelado',
      stock_reserved: false,
      cancellation_reason: reason,
      history: newHistory,
    })

    return { success: true }
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message || 'Falha ao cancelar pedido.'
    return { success: false, error: msg }
  }
}

export interface FaturarResult {
  success: boolean
  chave_acesso?: string
  numero_nota?: string
  nfe_record_id?: string
  error?: string
  status?: string
}

export async function invoiceSalesOrder(
  order: SalesOrderRecord,
  empresaId?: string,
  ambiente?: string,
  userName = 'Operador',
): Promise<FaturarResult> {
  try {
    const curStatus = resolveOrderInvoicingStatus(order)
    if (curStatus === 'faturado') {
      return { success: false, error: 'Pedido já faturado anteriormente.' }
    }
    if (curStatus === 'cancelado') {
      return { success: false, error: 'Pedido cancelado não pode ser faturado.' }
    }

    const items = parseOrderItems(order.items)
    if (items.length === 0) {
      return { success: false, error: 'Pedido sem itens para faturamento.' }
    }

    // Resolução resiliente da empresa emissora (empresaId, empresa_id ou company)
    let emp = (empresaId ||
      order.empresa_id ||
      (order as unknown as Record<string, unknown>).company_id ||
      order.company ||
      '') as string
    if (!emp) {
      return { success: false, error: 'Empresa emissora é obrigatória para faturar.' }
    }

    // Se emp não tem formato de ID PocketBase (15 chars alphanum) ou não existe como ID, tenta resolver pelo nome na coleção empresas
    if (emp && emp.length !== 15) {
      try {
        const found = await pb
          .collection('empresas')
          .getFirstListItem(
            `name = "${emp}" || razao_social = "${emp}" || nome_fantasia = "${emp}"`,
          )
        if (found?.id) {
          emp = found.id
        }
      } catch {
        // Prossegue com valor original caso a busca falhe
      }
    }

    // Buscar configuração Focus NFe da empresa para usar ambiente e série reais
    let serieEfetiva = '1'
    let ambienteEfetivo = ambiente || 'homologacao'
    try {
      let focusCfg = await pb
        .collection('fiscal_focus_nfe_config')
        .getFirstListItem(`empresa_id = "${emp}"`)
        .catch(() => null)

      // Fallback: se não encontrou por ID, tenta por emitente_ref ou padrão geral
      if (!focusCfg) {
        try {
          focusCfg = await pb.collection('fiscal_focus_nfe_config').getFirstListItem('')
        } catch {
          focusCfg = null
        }
      }

      if (focusCfg) {
        if (focusCfg.serie) {
          serieEfetiva = String(focusCfg.serie).trim() || '1'
        }
        if (focusCfg.ambiente) {
          ambienteEfetivo = String(focusCfg.ambiente).trim() || ambienteEfetivo
        }
      }
    } catch {
      // Se não houver configuração salva, utiliza os padrões informados
    }

    const fiscalItens = items.map((it) => ({
      name: it.product_name || it.name || it.description || 'Produto',
      ncm: it.ncm || '68029390',
      cfop: it.cfop || '5101',
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price || it.price) || 0,
      unit: it.unit || 'UN',
    }))

    const genBody = {
      empresa_id: emp,
      document_id: order.id,
      serie: serieEfetiva,
      ambiente: ambienteEfetivo,
      natureza_operacao: 'VENDA DE MERCADORIAS',
      destinatario: {
        nome: order.client_name || 'CLIENTE PADRAO',
        cnpj: (order.customer_cnpj || '00000000000191').replace(/\D/g, ''),
        cidade: order.customer_city || 'SERRA',
        uf: 'ES',
      },
      itens: fiscalItens,
    }

    let genResp: {
      success: boolean
      chave_acesso?: string
      numero_nota?: string
      error?: string
    } | null = null

    try {
      genResp = await pb.send<{
        success: boolean
        chave_acesso?: string
        numero_nota?: string
        error?: string
      }>('/backend/v1/huram/fiscal/nfe-generate', {
        method: 'POST',
        body: genBody,
      })
    } catch (sendErr: unknown) {
      const errObj = sendErr as {
        response?: Record<string, unknown>
        data?: Record<string, unknown>
        message?: string
        status?: number
      }
      const rawData =
        (errObj?.response?.data as Record<string, unknown> | undefined) ||
        (errObj?.response as Record<string, unknown> | undefined) ||
        (errObj?.data as Record<string, unknown> | undefined)

      const serverError =
        (typeof rawData?.error === 'string' && rawData.error) ||
        (typeof rawData?.message === 'string' && rawData.message) ||
        (typeof errObj?.response?.message === 'string' && errObj.response.message) ||
        (typeof errObj?.message === 'string' &&
          errObj.message !== 'Something went wrong.' &&
          errObj.message) ||
        ''

      return {
        success: false,
        error: serverError || `Erro no servidor fiscal (código ${errObj?.status || 500})`,
      }
    }

    if (!genResp || !genResp.success || !genResp.chave_acesso) {
      return {
        success: false,
        error: genResp?.error || 'Falha ao gerar XML da NF-e no motor fiscal.',
      }
    }

    const chave = genResp.chave_acesso
    const numNota = genResp.numero_nota || ''

    let statusSefaz = 'Gerada'
    try {
      const transResp = await pb.send<{
        success: boolean
        status?: string
        already_authorized?: boolean
        message?: string
        error?: string
      }>('/backend/v1/huram/fiscal/nfe-transmit', {
        method: 'POST',
        body: {
          chave_acesso: chave,
          ambiente: ambienteEfetivo,
        },
      })
      if (transResp?.status) {
        statusSefaz = transResp.status
      }
    } catch (transErr: unknown) {
      const errObj = transErr as {
        response?: Record<string, unknown>
        data?: Record<string, unknown>
        message?: string
      }
      const rawData =
        (errObj?.response?.data as Record<string, unknown> | undefined) ||
        (errObj?.response as Record<string, unknown> | undefined) ||
        (errObj?.data as Record<string, unknown> | undefined)

      const serverMsg =
        (typeof rawData?.error === 'string' && rawData.error) ||
        (typeof rawData?.message === 'string' && rawData.message) ||
        (typeof errObj?.response?.message === 'string' && errObj.response.message) ||
        (typeof errObj?.message === 'string' &&
          errObj.message !== 'Something went wrong.' &&
          errObj.message) ||
        ''

      console.warn('Aviso: transmissão imediata retornou pendência ou erro:', serverMsg || transErr)
    }

    let nfeRecId = ''
    try {
      const nfeRec = await pb
        .collection('nfe_records')
        .getFirstListItem(`chave_acesso = "${chave}"`)
      if (nfeRec) {
        nfeRecId = nfeRec.id
        await pb.collection('nfe_records').update(nfeRec.id, {
          sales_order_id: order.id,
          sales_order_number: order.order_number,
          order_id: order.id,
        })
      }
    } catch {
      // Ignora erro se não localizado imediatamente
    }

    const nowIso = new Date().toISOString()
    const newHistory = appendHistory(
      order.history,
      `Pedido Faturado com sucesso. NF-e nº ${numNota} gerada (Chave: ${chave}). Status: ${statusSefaz}`,
      userName,
    )

    await pb.collection('sales_orders').update(order.id, {
      status: 'Faturado',
      faturamento_status: 'faturado',
      is_invoiced: true,
      invoiced_at: nowIso,
      nfe_record_id: nfeRecId,
      nfe_chave_acesso: chave,
      nfe_numero: numNota,
      history: newHistory,
    })

    if (order.receivable_id) {
      try {
        await pb.collection('financial_receivables').update(order.receivable_id, {
          status: 'aberto',
          numero_nota_fiscal: numNota,
          documento_origem: `NF-e ${numNota} (Pedido #${order.order_number})`,
          observacoes: `Provisão convertida em título a receber definitivo pela NF-e ${numNota} (Chave: ${chave})`,
        })
      } catch (errFin) {
        console.warn('Aviso: falha ao atualizar provisão financeira para definitivo:', errFin)
      }
    }

    try {
      const reservations = await pb
        .collection('stock_reservations')
        .getFullList({ filter: `order_id = "${order.id}" && status = "ativa"` })
      for (const res of reservations) {
        await pb.collection('stock_reservations').update(res.id, { status: 'baixada' })
      }
    } catch (errRes) {
      console.warn('Aviso: falha ao baixar reservas de estoque:', errRes)
    }

    return {
      success: true,
      chave_acesso: chave,
      numero_nota: numNota,
      nfe_record_id: nfeRecId,
      status: statusSefaz,
    }
  } catch (err: unknown) {
    const errObj = err as {
      response?: Record<string, unknown>
      data?: Record<string, unknown>
      message?: string
    }
    const rawData =
      (errObj?.response?.data as Record<string, unknown> | undefined) ||
      (errObj?.response as Record<string, unknown> | undefined) ||
      (errObj?.data as Record<string, unknown> | undefined)

    const serverError =
      (typeof rawData?.error === 'string' && rawData.error) ||
      (typeof rawData?.message === 'string' && rawData.message) ||
      (typeof errObj?.response?.message === 'string' && errObj.response.message) ||
      (typeof errObj?.message === 'string' &&
        errObj.message !== 'Something went wrong.' &&
        errObj.message) ||
      ''

    const msg = serverError || 'Falha no faturamento do pedido.'
    return { success: false, error: msg }
  }
}

/**
 * Hook: b2b_portal_endpoints.js
 * Endpoints seguros para o Portal B2B:
 * 1. POST /backend/v1/b2b/signup: Self-service cadastro de cliente B2B
 * 2. GET /backend/v1/b2b/me: Dados do cliente autenticado e do parceiro vinculado
 * 3. GET /backend/v1/b2b/products: Catálogo liberado para B2B com preços do cliente
 * 4. POST /backend/v1/b2b/orders/create: Montagem e submissão de pedido B2B
 * 5. GET /backend/v1/b2b/orders: Lista de pedidos pertencentes EXCLUSIVAMENTE ao cliente autenticado
 * 6. GET /backend/v1/b2b/orders/{id}: Detalhe do pedido do cliente autenticado
 * 7. POST /backend/v1/b2b/admin/toggle-credit-flag: Gestor interno ativa/desativa exibir_limite_credito
 * 8. POST /backend/v1/b2b/admin/toggle-client-status: Gestor ativa/desativa acesso do cliente
 */

// 1. POST /backend/v1/b2b/signup
routerAdd('POST', '/backend/v1/b2b/signup', (e) => {
  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  const companyName = (body.company_name || body.razao_social || '').trim()
  const tradeName = (body.trade_name || body.nome_fantasia || companyName).trim()
  const cnpjRaw = (body.cnpj || '').trim()
  const phone = (body.phone || '').trim()
  const contactName = (body.contact_name || '').trim()
  const stateRegistration = (body.state_registration || body.ie || '').trim()
  const address = (body.address || '').trim()
  const addressNumber = (body.address_number || '').trim()
  const addressDistrict = (body.address_district || '').trim()
  const addressCity = (body.address_city || '').trim()
  const addressState = (body.address_state || '').trim()
  const cep = (body.cep || '').trim()
  const empresaId = (body.empresa_id || '').trim()
  const filialId = (body.filial_id || '').trim()

  if (!email || !password || !cnpjRaw || !companyName) {
    return e.json(400, {
      error: 'E-mail, senha, CNPJ e Razão Social são obrigatórios para cadastro no Portal B2B.',
    })
  }

  if (password.length < 6) {
    return e.json(400, {
      error: 'A senha deve ter no mínimo 6 caracteres.',
    })
  }

  // Verificar se o e-mail já existe na coleção clients
  try {
    const existingClient = $app.findFirstRecordByData('clients', 'email', email)
    if (existingClient) {
      return e.json(400, {
        error: 'Este e-mail já possui cadastro no Portal B2B. Efetue login ou recupere sua senha.',
      })
    }
  } catch (_) {
    // Não encontrado, prossegue normalmente
  }

  // Normalizar CNPJ para busca e conferência
  const cnpjClean = cnpjRaw.replace(/\D/g, '')

  let partnerRecord = null
  let isNewPartner = false

  // Buscar partner existente por CNPJ ou email
  try {
    const partners = $app.findRecordsByFilter(
      'partners',
      `cnpj ~ "${cnpjClean}" || cnpj = "${cnpjRaw}" || email = "${email}"`,
      '-created',
      1,
      0,
    )
    if (partners && partners.length > 0) {
      partnerRecord = partners[0]
    }
  } catch (_) {}

  // Se não existe partner correspondente, cria novo partner tipo 'Cliente'
  if (!partnerRecord) {
    try {
      const partnersCol = $app.findCollectionByNameOrId('partners')
      partnerRecord = new Record(partnersCol)
      partnerRecord.set('partner_type', 'Cliente')
      partnerRecord.set('person_type', 'PJ')
      partnerRecord.set('company_name', companyName)
      partnerRecord.set('trade_name', tradeName || companyName)
      partnerRecord.set('cnpj', cnpjRaw)
      partnerRecord.set('email', email)
      partnerRecord.set('phone', phone)
      partnerRecord.set('state_registration', stateRegistration)
      partnerRecord.set('address', address)
      partnerRecord.set('address_number', addressNumber)
      partnerRecord.set('address_district', addressDistrict)
      partnerRecord.set('address_city', addressCity)
      partnerRecord.set('address_state', addressState)
      partnerRecord.set('cep', cep)
      partnerRecord.set('active', true)
      partnerRecord.set('b2b_ativo', true)
      partnerRecord.set('b2b_status', 'ativo')
      partnerRecord.set('exibir_limite_credito', false) // Decisão 3: default false
      partnerRecord.set('canal_comercial', 'Portal B2B')
      partnerRecord.set('forma_atendimento', 'Portal B2B')
      if (empresaId) partnerRecord.set('empresa_id', empresaId)
      if (filialId) partnerRecord.set('filial_id', filialId)
      $app.save(partnerRecord)
      isNewPartner = true
    } catch (createPartnerErr) {
      return e.json(500, {
        error: 'Falha ao criar ficha cadastral do parceiro: ' + String(createPartnerErr),
      })
    }
  } else {
    // Partner existente: ativar flags B2B se ainda não ativas
    try {
      partnerRecord.set('b2b_ativo', true)
      if (!partnerRecord.getString('b2b_status')) {
        partnerRecord.set('b2b_status', 'ativo')
      }
      $app.save(partnerRecord)
    } catch (_) {}
  }

  // Criar registro na coleção auth clients
  let newClientAuth = null
  try {
    const clientsCol = $app.findCollectionByNameOrId('clients')
    newClientAuth = new Record(clientsCol)
    newClientAuth.set('email', email)
    newClientAuth.set('password', password)
    newClientAuth.set('passwordConfirm', password)
    newClientAuth.set('name', contactName || tradeName || companyName)
    newClientAuth.set('partner_id', partnerRecord.id)
    newClientAuth.set('cnpj', cnpjRaw)
    newClientAuth.set('company_name', companyName)
    newClientAuth.set('phone', phone)
    newClientAuth.set('active', true)
    newClientAuth.set('status', 'ativo')
    if (empresaId) newClientAuth.set('empresa_id', empresaId)
    if (filialId) newClientAuth.set('filial_id', filialId)
    $app.save(newClientAuth)

    // Atualizar client_id no partner
    partnerRecord.set('client_id', newClientAuth.id)
    $app.save(partnerRecord)
  } catch (clientErr) {
    return e.json(500, {
      error: 'Falha ao registrar credenciais do cliente B2B: ' + String(clientErr),
    })
  }

  // Gravar auditoria B2B
  try {
    const auditB2bCol = $app.findCollectionByNameOrId('b2b_audit_trail')
    const b2bLog = new Record(auditB2bCol)
    b2bLog.set('client_id', newClientAuth.id)
    b2bLog.set('partner_id', partnerRecord.id)
    b2bLog.set('user_name', companyName)
    b2bLog.set('cnpj', cnpjRaw)
    b2bLog.set('action', 'signup')
    b2bLog.set(
      'details',
      `Auto-cadastro B2B realizado com sucesso. Parceiro ${isNewPartner ? 'novo criado' : 'existente vinculado'}.`,
    )
    b2bLog.set('metadata', {
      email,
      company_name: companyName,
      is_new_partner: isNewPartner,
    })
    b2bLog.set('empresa_id', empresaId)
    b2bLog.set('filial_id', filialId)
    $app.save(b2bLog)
  } catch (_) {}

  // Notificar equipe interna do ERP
  try {
    const notifCol = $app.findCollectionByNameOrId('notifications')
    const admins = $app.findRecordsByFilter(
      '_pb_users_auth_',
      `active = true && (role = "SUP" || role = "COMERCIAL")`,
      '',
      10,
      0,
    )
    admins.forEach((admin) => {
      try {
        const n = new Record(notifCol)
        n.set('title', 'Novo Cadastro no Portal B2B')
        n.set(
          'message',
          `O cliente "${companyName}" (CNPJ ${cnpjRaw}) completou o auto-cadastro no Portal B2B.`,
        )
        n.set('recipient', admin.id)
        n.set('read', false)
        n.set('link', '/admin/b2b/clientes')
        n.set('type', 'other')
        $app.save(n)
      } catch (_) {}
    })
  } catch (_) {}

  return e.json(200, {
    success: true,
    message: 'Cadastro realizado com sucesso! Você já pode acessar o Portal B2B.',
    client_id: newClientAuth.id,
    partner_id: partnerRecord.id,
    company_name: companyName,
  })
})

// 2. GET /backend/v1/b2b/me
routerAdd('GET', '/backend/v1/b2b/me', (e) => {
  const clientAuth = e.auth && e.auth.collectionName === 'clients' ? e.auth : null
  if (!clientAuth) {
    return e.json(401, { error: 'Autenticação necessária na área B2B' })
  }

  const partnerId = clientAuth.getString('partner_id')
  let partner = null
  if (partnerId) {
    try {
      partner = $app.findRecordById('partners', partnerId)
    } catch (_) {}
  }

  // Verificar se a flag de limite de crédito está ativada no parceiro
  const exibirLimite = partner ? partner.getBool('exibir_limite_credito') === true : false
  const limiteCredito = exibirLimite && partner ? partner.getString('limite_credito') : null
  const limiteDisponivel =
    exibirLimite && partner ? partner.getString('limite_credito_disponivel') : null
  const situacaoCredito =
    exibirLimite && partner ? partner.getString('situacao_credito') : null

  return e.json(200, {
    client: {
      id: clientAuth.id,
      email: clientAuth.getString('email'),
      name: clientAuth.getString('name'),
      company_name: clientAuth.getString('company_name'),
      cnpj: clientAuth.getString('cnpj'),
      phone: clientAuth.getString('phone'),
      active: clientAuth.getBool('active'),
      status: clientAuth.getString('status') || 'ativo',
      empresa_id: clientAuth.getString('empresa_id'),
      filial_id: clientAuth.getString('filial_id'),
    },
    partner: partner
      ? {
          id: partner.id,
          company_name: partner.getString('company_name'),
          trade_name: partner.getString('trade_name'),
          cnpj: partner.getString('cnpj'),
          email: partner.getString('email'),
          phone: partner.getString('phone'),
          address: partner.getString('address'),
          address_number: partner.getString('address_number'),
          address_district: partner.getString('address_district'),
          address_city: partner.getString('address_city'),
          address_state: partner.getString('address_state'),
          cep: partner.getString('cep'),
          financial_restriction: partner.getBool('financial_restriction'),
          bloqueio_vendas_prazo: partner.getBool('bloqueio_vendas_prazo'),
          exibir_limite_credito: exibirLimite,
          limite_credito: limiteCredito,
          limite_credito_disponivel: limiteDisponivel,
          situacao_credito: situacaoCredito,
        }
      : null,
  })
})

// 3. GET /backend/v1/b2b/products
routerAdd('GET', '/backend/v1/b2b/products', (e) => {
  const clientAuth = e.auth && e.auth.collectionName === 'clients' ? e.auth : null
  if (!clientAuth) {
    return e.json(401, { error: 'Autenticação de cliente B2B necessária' })
  }

  try {
    let records = []
    try {
      records = $app.findRecordsByFilter(
        'products',
        'active = true',
        'name',
        200,
        0,
      )
    } catch (_) {
      records = []
    }

    const items = records.map((p) => {
      const rawPrice = p.getString('price') || '0'
      const cleanPrice = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.')) || 0

      return {
        id: p.id,
        code: p.getString('code'),
        name: p.getString('name'),
        description: p.getString('description'),
        unit: p.getString('unit') || 'un',
        price: cleanPrice,
        price_formatted: rawPrice,
        brand: p.getString('brand'),
        category: p.getString('category'),
        stock: p.getInt('stock') || 0,
        b2b_min_order_qty: p.getInt('b2b_min_order_qty') || 1,
        ean: p.getString('ean'),
        ncm: p.getString('ncm'),
      }
    })

    return e.json(200, { items })
  } catch (err) {
    return e.json(500, { error: 'Falha ao buscar catálogo B2B: ' + String(err) })
  }
})

// 4. POST /backend/v1/b2b/orders/create
routerAdd('POST', '/backend/v1/b2b/orders/create', (e) => {
  const clientAuth = e.auth && e.auth.collectionName === 'clients' ? e.auth : null
  if (!clientAuth) {
    return e.json(401, { error: 'Autenticação necessária' })
  }

  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const items = body.items || []
  const internalNotes = body.notes || body.observacoes || ''
  const deliveryAddress = body.delivery_address || ''
  const paymentCondition = body.payment_condition || 'A Combinar B2B'
  const paymentMethod = body.payment_method || 'Faturamento B2B'

  if (!items || items.length === 0) {
    return e.json(400, { error: 'O carrinho deve conter pelo menos 1 produto.' })
  }

  const partnerId = clientAuth.getString('partner_id')
  let partner = null
  if (partnerId) {
    try {
      partner = $app.findRecordById('partners', partnerId)
    } catch (_) {}
  }

  const clientName = partner
    ? partner.getString('company_name') || partner.getString('trade_name')
    : clientAuth.getString('company_name') || clientAuth.getString('name')
  const clientCnpj = partner ? partner.getString('cnpj') : clientAuth.getString('cnpj')

  // Calcular totais
  let grossTotal = 0
  const processedItems = []

  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const qty = parseFloat(it.quantity || it.quantidade || 1)
    const unitPrice = parseFloat(it.unit_price || it.preco || 0)
    const subtotal = qty * unitPrice
    grossTotal += subtotal

    processedItems.push({
      product_id: it.product_id || it.id,
      code: it.code || '',
      name: it.name || '',
      quantity: qty,
      unit: it.unit || 'un',
      unit_price: unitPrice,
      total_price: subtotal,
      notes: it.notes || '',
    })
  }

  const nowIso = new Date().toISOString()
  const yearStr = new Date().getFullYear().toString()
  const randomSeq = Math.floor(1000 + Math.random() * 9000).toString()
  const orderNumber = `B2B-${yearStr}-${randomSeq}`

  // Resolver empresa e filial para multitenancy
  let empresa = clientAuth.getString('empresa_id') || ''
  let filial = clientAuth.getString('filial_id') || ''
  if (!empresa) {
    try {
      const defaultEmpresas = $app.findRecordsByFilter('empresas', 'active = true', 'created', 1, 0)
      if (defaultEmpresas && defaultEmpresas.length > 0) {
        empresa = defaultEmpresas[0].getString('name') || defaultEmpresas[0].id
      }
    } catch (_) {}
  }

  try {
    const salesCol = $app.findCollectionByNameOrId('sales_orders')
    const order = new Record(salesCol)

    order.set('order_number', orderNumber)
    order.set('status', 'Aguardando Aprovação') // Decisão 2: nasce já submetido à aprovação
    order.set('order_stage', 'Aguardando Aprovação')
    order.set('sales_channel', 'Portal B2B')
    order.set('client_id', partnerId || clientAuth.id)
    order.set('client_name', clientName)
    order.set('customer_cnpj', clientCnpj)
    order.set('b2b_client_id', clientAuth.id)
    order.set('company', empresa)
    order.set('empresa_id', empresa)
    order.set('branch', filial)
    order.set('filial_id', filial)
    order.set('items', processedItems)
    order.set('gross_value', grossTotal.toFixed(2))
    order.set('total_value', grossTotal.toFixed(2))
    order.set('discount_value', '0.00')
    order.set('payment_condition', paymentCondition)
    order.set('payment_method', paymentMethod)
    order.set('delivery_address', deliveryAddress)
    order.set('internal_notes', internalNotes)
    order.set('stock_reserved', false)

    // Trilha inicial do pedido
    const initialHistory = [
      {
        action: 'Pedido Montado no Portal B2B',
        user: clientName,
        user_id: clientAuth.id,
        date: nowIso,
        order_type: 'venda',
        value: grossTotal,
        notes: 'Pedido gerado diretamente pelo cliente no autosserviço B2B.',
      },
      {
        action: 'Submetido para Aprovação',
        user: 'Portal B2B (Motor Automático)',
        user_id: clientAuth.id,
        date: nowIso,
        order_type: 'venda',
        value: grossTotal,
        reasons: ['Origem Portal B2B - Aprovação de Faturamento / Comercial'],
        note: 'Encaminhado diretamente para a Central de Aprovações.',
      },
    ]
    order.set('history', initialHistory)
    order.set('approval_trail', initialHistory)

    $app.save(order)

    // Gravar em order_approval_records para alimentar a Central de Aprovações imediatamente
    try {
      const recordsCol = $app.findCollectionByNameOrId('order_approval_records')
      const apprRec = new Record(recordsCol)
      apprRec.set('order_id', order.id)
      apprRec.set('order_number', orderNumber)
      apprRec.set('order_type', 'venda')
      apprRec.set('company', empresa)
      apprRec.set('branch', filial)
      apprRec.set('total_value', grossTotal)
      apprRec.set('requester_id', clientAuth.id)
      apprRec.set('requester_name', `Cliente B2B: ${clientName}`)
      apprRec.set('action', 'solicitado')
      apprRec.set('approval_reasons', ['Pedido Portal B2B'])
      apprRec.set('notes', `Pedido B2B submetido por ${clientName} no valor de R$ ${grossTotal.toFixed(2)}.`)
      $app.save(apprRec)
    } catch (_) {}

    // Notificar os aprovadores internos do ERP
    try {
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const approvers = $app.findRecordsByFilter(
        '_pb_users_auth_',
        `active = true && (role = "SUP" || role = "FINANCEIRO" || role = "COMERCIAL")`,
        '',
        15,
        0,
      )
      approvers.forEach((appr) => {
        try {
          const n = new Record(notifCol)
          n.set('title', 'Novo Pedido B2B Aguardando Aprovação')
          n.set(
            'message',
            `O pedido ${orderNumber} de R$ ${grossTotal.toFixed(2)} foi finalizado pelo cliente ${clientName} no Portal B2B e aguarda aprovação.`,
          )
          n.set('recipient', appr.id)
          n.set('read', false)
          n.set('link', '/admin/aprovacoes/pedidos')
          n.set('type', 'approval_pending')
          $app.save(n)
        } catch (_) {}
      })
    } catch (_) {}

    // Gravar auditoria B2B
    try {
      const auditB2bCol = $app.findCollectionByNameOrId('b2b_audit_trail')
      const b2bLog = new Record(auditB2bCol)
      b2bLog.set('client_id', clientAuth.id)
      b2bLog.set('partner_id', partnerId)
      b2bLog.set('user_name', clientName)
      b2bLog.set('cnpj', clientCnpj)
      b2bLog.set('action', 'order_placed')
      b2bLog.set('details', `Pedido nº ${orderNumber} de R$ ${grossTotal.toFixed(2)} finalizado com sucesso.`)
      b2bLog.set('metadata', {
        order_id: order.id,
        order_number: orderNumber,
        total_value: grossTotal,
        items_count: processedItems.length,
      })
      b2bLog.set('empresa_id', empresa)
      b2bLog.set('filial_id', filial)
      $app.save(b2bLog)
    } catch (_) {}

    return e.json(200, {
      success: true,
      message: 'Pedido finalizado com sucesso! Seu pedido já está na Central de Aprovações.',
      order_id: order.id,
      order_number: orderNumber,
      status: 'Aguardando Aprovação',
      total_value: grossTotal,
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao processar e salvar pedido: ' + String(err) })
  }
})

// 5. GET /backend/v1/b2b/orders
routerAdd('GET', '/backend/v1/b2b/orders', (e) => {
  const clientAuth = e.auth && e.auth.collectionName === 'clients' ? e.auth : null
  if (!clientAuth) {
    return e.json(401, { error: 'Autenticação necessária' })
  }

  const partnerId = clientAuth.getString('partner_id')
  const clientId = clientAuth.id

  try {
    let filter = `b2b_client_id = "${clientId}"`
    if (partnerId) {
      filter = `b2b_client_id = "${clientId}" || client_id = "${partnerId}"`
    }

    const orders = $app.findRecordsByFilter('sales_orders', filter, '-created', 100, 0)
    const result = orders.map((o) => {
      const items = o.get('items') || []
      return {
        id: o.id,
        order_number: o.getString('order_number') || o.id,
        status: o.getString('status') || 'Aguardando Aprovação',
        order_stage: o.getString('order_stage'),
        created: o.getString('created'),
        total_value: o.getString('total_value'),
        gross_value: o.getString('gross_value'),
        sales_channel: o.getString('sales_channel'),
        items_count: Array.isArray(items) ? items.length : 0,
        cancellation_reason: o.getString('cancellation_reason'),
        approved_by: o.getString('approved_by'),
        approved_at: o.getString('approved_at'),
      }
    })

    return e.json(200, { orders: result })
  } catch (err) {
    return e.json(500, { error: 'Falha ao listar pedidos: ' + String(err) })
  }
})

// 6. GET /backend/v1/b2b/orders/{id}
routerAdd('GET', '/backend/v1/b2b/orders/{id}', (e) => {
  const clientAuth = e.auth && e.auth.collectionName === 'clients' ? e.auth : null
  if (!clientAuth) {
    return e.json(401, { error: 'Autenticação necessária' })
  }

  const orderId = e.request.pathValue('id')
  if (!orderId) {
    return e.json(400, { error: 'ID do pedido é obrigatório' })
  }

  const partnerId = clientAuth.getString('partner_id')
  const clientId = clientAuth.id

  try {
    const order = $app.findRecordById('sales_orders', orderId)
    if (!order) {
      return e.json(404, { error: 'Pedido não encontrado' })
    }

    // Regra de segurança: Garantir que o pedido pertença ao cliente logado
    const orderClientId = order.getString('client_id')
    const orderB2bId = order.getString('b2b_client_id')

    const isOwner = orderB2bId === clientId || (partnerId && orderClientId === partnerId)
    if (!isOwner) {
      return e.json(403, { error: 'Acesso negado: este pedido não pertence à sua conta.' })
    }

    return e.json(200, {
      order: {
        id: order.id,
        order_number: order.getString('order_number') || order.id,
        status: order.getString('status'),
        order_stage: order.getString('order_stage'),
        created: order.getString('created'),
        updated: order.getString('updated'),
        gross_value: order.getString('gross_value'),
        total_value: order.getString('total_value'),
        payment_condition: order.getString('payment_condition'),
        payment_method: order.getString('payment_method'),
        delivery_address: order.getString('delivery_address'),
        internal_notes: order.getString('internal_notes'),
        items: order.get('items') || [],
        history: order.get('history') || [],
        cancellation_reason: order.getString('cancellation_reason'),
        approved_by: order.getString('approved_by'),
        approved_at: order.getString('approved_at'),
      },
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao buscar detalhe do pedido: ' + String(err) })
  }
})

// 7. POST /backend/v1/b2b/admin/toggle-credit-flag
// Usado pelo painel interno de gestão B2B para ativar ou desativar o campo exibir_limite_credito
routerAdd('POST', '/backend/v1/b2b/admin/toggle-credit-flag', (e) => {
  const auth = e.auth
  if (!auth || auth.collectionName !== 'users') {
    return e.json(401, { error: 'Autenticação de operador interno necessária' })
  }

  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const partnerId = body.partner_id
  const showCredit = body.exibir_limite_credito === true

  if (!partnerId) {
    return e.json(400, { error: 'partner_id é obrigatório' })
  }

  try {
    const partner = $app.findRecordById('partners', partnerId)
    if (!partner) {
      return e.json(404, { error: 'Parceiro não encontrado' })
    }

    partner.set('exibir_limite_credito', showCredit)
    $app.save(partner)

    // Auditoria da ação interna
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const audit = new Record(auditCol)
      audit.set('user_id', auth.id)
      audit.set('user_name', auth.getString('name') || 'Operador')
      audit.set('user_role', auth.getString('role') || 'PADRAO')
      audit.set('action', 'b2b_credit_flag_changed')
      audit.set('module', 'b2b')
      audit.set('target_collection', 'partners')
      audit.set('target_id', partnerId)
      audit.set(
        'target_summary',
        `Flag exibir_limite_credito alterada para "${showCredit ? 'ATIVADO' : 'DESATIVADO'}" no cliente ${partner.getString('company_name')}.`,
      )
      audit.set('criticidade', 'Média')
      audit.set('origem', 'Área da Empresa')
      $app.save(audit)
    } catch (_) {}

    return e.json(200, {
      success: true,
      partner_id: partnerId,
      exibir_limite_credito: showCredit,
      message: `Visualização de limite de crédito ${showCredit ? 'ativada' : 'desativada'} com sucesso.`,
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao atualizar flag de limite: ' + String(err) })
  }
})

// 8. POST /backend/v1/b2b/admin/toggle-client-status
// Usado pelo painel interno de gestão B2B para ativar ou suspender o acesso do cliente
routerAdd('POST', '/backend/v1/b2b/admin/toggle-client-status', (e) => {
  const auth = e.auth
  if (!auth || auth.collectionName !== 'users') {
    return e.json(401, { error: 'Autenticação de operador interno necessária' })
  }

  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const clientId = body.client_id
  const partnerId = body.partner_id
  const active = body.active === true
  const status = active ? 'ativo' : 'bloqueado'

  if (!clientId && !partnerId) {
    return e.json(400, { error: 'client_id ou partner_id é obrigatório' })
  }

  try {
    if (clientId) {
      const client = $app.findRecordById('clients', clientId)
      if (client) {
        client.set('active', active)
        client.set('status', status)
        $app.save(client)
      }
    }

    if (partnerId) {
      const partner = $app.findRecordById('partners', partnerId)
      if (partner) {
        partner.set('b2b_ativo', active)
        partner.set('b2b_status', status)
        $app.save(partner)
      }
    }

    return e.json(200, {
      success: true,
      active,
      status,
      message: `Status de acesso B2B atualizado para ${status}.`,
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao alterar status de acesso: ' + String(err) })
  }
})
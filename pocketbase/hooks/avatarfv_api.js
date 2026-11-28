// API de integração ERP ↔ AvatarFV (força de vendas) — /backend/v1/erp
//
// Server-to-server: o app AvatarFV chama o Huram com o header X-Avatar-Token,
// validado contra o secret AVATARFV_API_TOKEN ($os.getenv — nunca no código).
// Sem navegador no meio: sem CORS, sem sessão de usuário.
//
// Regras de plataforma respeitadas:
// - routerAdd com caminhos no padrão /backend/v1/erp/...
// - NENHUMA referência a funções/constantes de nível superior dentro dos
//   callbacks (Hook scoping error do JSVM): toda a lógica é embutida inline
//   (mesmo padrão de flex_api.js e focus_nfe_api.js).
// - Dado que ainda não existe no ERP (promoções, sugestões etc.) responde
//   lista vazia [] em vez de erro — o app continua funcionando.
// - POST /pedidos é idempotente por numero_pedido: reenvio não duplica.
//
// Rotas:
//   GET  /backend/v1/erp/produtos?empresa_id=&filial_id=&busca=
//   GET  /backend/v1/erp/produtos/ordens-compra?empresa_id=&filial_id=
//   GET  /backend/v1/erp/clientes?empresa_id=&rca_id=
//   GET  /backend/v1/erp/clientes/{id}/financeiro
//   GET  /backend/v1/erp/clientes/{id}/sugestoes
//   POST /backend/v1/erp/pedidos
//   GET  /backend/v1/erp/pedidos/{numero}/status
//
// Mapeamento de coleções (schema real do Huram):
//   produtos            → products (code, ean, name, brand, main_supplier,
//                         unit, master_units_per_box, stock, commission,
//                         description_complementar)
//   preços por tabela   → price_tables (status='ativa', product_code, price,
//                         table_type, data_inicial/data_final)
//   ordens de compra    → purchase_orders (status em aberto, items json,
//                         delivery_forecast)
//   clientes            → partners (partner_type='cliente', rca_id, endereço,
//                         cidade, grupo/segmento, bloqueios financeiros)
//   títulos             → financial_receivables (client_id, status,
//                         data_vencimento, valor_original)
//   pedidos             → sales_orders (items json, integration_order_number,
//                         status, order_stage, faturamento_status, is_invoiced)
//   sugestões           → derivado de sales_orders anteriores do cliente
//   promoções           → SEM coleção dedicada no ERP hoje: retorna []

routerAdd(
  'GET',
  '/backend/v1/erp/produtos',
  (e) => {
    const token = $os.getenv('AVATARFV_API_TOKEN')
    const got = String(e.requestInfo().headers['x_avatar_token'] || '')
    if (token === '' || got !== token) {
      return e.json(401, { error: 'Token inválido ou ausente (header X-Avatar-Token)' })
    }
    const q = e.requestInfo().query || {}
    const empresaId = String(q.empresa_id || '')
    const busca = String(q.busca || '')

    // Preços vigentes por tabela: apenas tabelas ativas
    let priceRows = []
    try {
      priceRows = e.app.findRecordsByFilter(
        'price_tables',
        "status = 'ativa' && active = true",
        '-updated',
        500,
        0,
      )
    } catch (err) {
      priceRows = []
    }
    // map[product_code] = lista de preços
    const priceMap = {}
    for (const t of priceRows) {
      const pc = String(t.getString('product_code') || '')
      if (pc === '') continue
      if (!priceMap[pc]) {
        priceMap[pc] = []
      }
      priceMap[pc].push({
        tabela: t.getString('table_name') || '',
        tipo: t.getString('table_type') || '',
        preco: Number(t.getString('price') || 0),
        desconto_percent: Number(t.getString('discount_percent') || 0),
        preco_final: Number(t.getString('final_price') || 0),
        data_inicial: t.getString('data_inicial') || '',
        data_final: t.getString('data_final') || '',
      })
    }

    let filter = 'active = true'
    if (empresaId !== '') {
      // products não tem empresa_id no schema atual: produtos são globais
    }
    if (busca !== '') {
      filter =
        "active = true && (name ~ '" +
        busca.replace(/'/g, "''") +
        "' || code ~ '" +
        busca.replace(/'/g, "''") +
        "' || ean ~ '" +
        busca.replace(/'/g, "''") +
        "')"
    }
    let prods = []
    try {
      prods = e.app.findRecordsByFilter('products', filter, 'code', 500, 0)
    } catch (err) {
      prods = []
    }

    const result = []
    for (const p of prods) {
      const code = String(p.getString('code') || '')
      const comissao = p.getString('commission') || ''
      result.push({
        id: p.id,
        codigo_interno: code,
        ean: p.getString('ean') || '',
        descricao: p.getString('name') || '',
        marca: p.getString('brand') || '',
        fornecedor: p.getString('main_supplier') || '',
        unidade_venda: p.getString('unit') || '',
        quantidade_por_caixa: Number(p.getString('master_units_per_box') || 0),
        estoque_atual: p.getFloat('stock'),
        descricao_detalhada: p.getString('description_complementar') || '',
        comissao: comissao === '' ? null : Number(comissao),
        precos_por_tabela: priceMap[code] || [],
        lotes: [], // sem coleção de lotes por validade no schema atual
        promocoes: [], // sem coleção de promoções dedicada no ERP hoje
      })
    }
    return e.json(200, { ok: true, total: result.length, produtos: result })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'GET',
  '/backend/v1/erp/produtos/ordens-compra',
  (e) => {
    const token = $os.getenv('AVATARFV_API_TOKEN')
    const got = String(e.requestInfo().headers['x_avatar_token'] || '')
    if (token === '' || got !== token) {
      return e.json(401, { error: 'Token inválido ou ausente (header X-Avatar-Token)' })
    }
    const q = e.requestInfo().query || {}
    const empresaId = String(q.empresa_id || '')
    const produtoId = String(q.produto_id || '')

    // Status "em aberto" nas purchase_orders do Huram
    const abertos = [
      'rascunho',
      'aguardando_aprovacao',
      'aprovado',
      'pendente',
      'emitido',
      'aberta',
      'aberto',
    ]
    let filter = ''
    for (let i = 0; i < abertos.length; i++) {
      filter += (i === 0 ? '' : ' || ') + "status = '" + abertos[i] + "'"
    }
    let orders = []
    try {
      orders = e.app.findRecordsByFilter('purchase_orders', '(' + filter + ')', '-created', 300, 0)
    } catch (err) {
      orders = []
    }

    const result = []
    for (const o of orders) {
      if (
        empresaId !== '' &&
        o.getString('empresa_id') !== '' &&
        o.getString('empresa_id') !== empresaId
      ) {
        continue
      }
      let items = []
      try {
        items = o.get('items') || []
      } catch (err) {
        items = []
      }
      if (!Array.isArray(items)) continue
      for (const it of items) {
        if (produtoId !== '' && String(it.product_id || '') !== produtoId) continue
        result.push({
          ordem_numero: o.getString('order_number') || '',
          produto_id: it.product_id || '',
          produto_codigo: it.product_code || '',
          produto_descricao: it.product_name || '',
          quantidade_comprada: Number(it.quantity || it.quantidade || 0),
          data_emissao: o.getString('created') || '',
          data_prevista_entrega: o.getString('delivery_forecast') || '',
          status: o.getString('status') || '',
          fornecedor: o.getString('supplier_name') || '',
        })
      }
    }
    return e.json(200, { ok: true, total: result.length, ordens_compra: result })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'GET',
  '/backend/v1/erp/clientes',
  (e) => {
    const token = $os.getenv('AVATARFV_API_TOKEN')
    const got = String(e.requestInfo().headers['x_avatar_token'] || '')
    if (token === '' || got !== token) {
      return e.json(401, { error: 'Token inválido ou ausente (header X-Avatar-Token)' })
    }
    const q = e.requestInfo().query || {}
    const rcaId = String(q.rca_id || '')
    const empresaId = String(q.empresa_id || '')
    if (rcaId === '') {
      return e.json(400, { error: 'rca_id é obrigatório (carteira por vendedor)' })
    }

    let filter = "partner_type = 'cliente' && rca_id = '" + rcaId.replace(/'/g, "''") + "'"
    if (empresaId !== '') {
      filter += " && empresa_id = '" + empresaId.replace(/'/g, "''") + "'"
    }
    let rows = []
    try {
      rows = e.app.findRecordsByFilter('partners', filter, 'name', 500, 0)
    } catch (err) {
      rows = []
    }

    const agora = new Date()
    const result = []
    for (const p of rows) {
      const bloqueado =
        p.getBool('blocked') ||
        p.getBool('financial_restriction') ||
        p.getBool('bloqueio_vendas_prazo')
      const restricoes = []
      if (p.getBool('financial_restriction') || p.getString('situacao_credito') !== '') {
        restricoes.push(p.getString('situacao_credito') || 'consulta')
      }
      if (p.getBool('bloqueio_vendas_prazo')) {
        restricoes.push('bloqueio_vendas_prazo')
      }
      // Dias sem comprar e positivado no mês: derivado dos pedidos do cliente
      let diasSemComprar = null
      let positivouMes = false
      try {
        const last = e.app.findFirstRecordByFilter(
          'sales_orders',
          "client_id = '" + p.id + "' && is_balance != true",
          '-created',
          1,
          0,
        )
        if (last) {
          const d = new Date(last.getString('created') || '')
          if (!isNaN(d.getTime())) {
            diasSemComprar = Math.floor((agora - d) / 86400000)
          }
        }
      } catch (err) {
        /* sem pedidos: mantém null */
      }
      try {
        const monthStart = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
        const pos = e.app.findFirstRecordByFilter(
          'sales_orders',
          "client_id = '" + p.id + "' && is_balance != true && created >= '" + monthStart + "'",
          '-created',
          1,
          0,
        )
        positivouMes = !!pos
      } catch (err) {
        positivouMes = false
      }
      result.push({
        id: p.id,
        nome:
          p.getString('full_name') ||
          p.getString('company_name') ||
          p.getString('trade_name') ||
          '',
        cnpj: p.getString('cnpj') || p.getString('cpf') || '',
        endereco: p.getString('address') || '',
        cidade: p.getString('address_city') || '',
        grupo: p.getString('segmento') || p.getString('perfil_cliente') || '',
        observacao: p.getString('observations') || '',
        bloqueio_financeiro: bloqueado,
        restricoes: restricoes,
        dias_sem_comprar: diasSemComprar,
        positivou_mes_corrente: positivouMes,
        rca_id: p.getString('rca_id') || '',
        rca_nome: p.getString('rca_nome') || '',
        empresa_id: p.getString('empresa_id') || '',
      })
    }
    return e.json(200, { ok: true, total: result.length, clientes: result })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'GET',
  '/backend/v1/erp/clientes/{id}/financeiro',
  (e) => {
    const token = $os.getenv('AVATARFV_API_TOKEN')
    const got = String(e.requestInfo().headers['x_avatar_token'] || '')
    if (token === '' || got !== token) {
      return e.json(401, { error: 'Token inválido ou ausente (header X-Avatar-Token)' })
    }
    const clientId = String(e.request.pathValue('id') || '')

    let rows = []
    try {
      rows = e.app.findRecordsByFilter(
        'financial_receivables',
        "client_id = '" + clientId.replace(/'/g, "''") + "'",
        '-data_vencimento',
        500,
        0,
      )
    } catch (err) {
      rows = []
    }

    const aVencer = []
    const vencidos = []
    const pagos = []
    const hoje = new Date().toISOString().slice(0, 10)
    let totalAVencer = 0
    let totalVencidos = 0
    let totalPagos = 0
    for (const t of rows) {
      const venc = t.getString('data_vencimento') || ''
      const valor = Number(t.getString('valor_original') || 0)
      const item = {
        titulo: t.getString('numero_titulo') || '',
        vencimento: venc,
        valor: valor,
        status: t.getString('status') || '',
        numero_pedido: t.getString('numero_pedido') || '',
      }
      const statusLower = item.status.toLowerCase()
      if (statusLower === 'pago' || statusLower === 'recebido' || statusLower === 'liquidado') {
        pagos.push(item)
        totalPagos += valor
      } else if (venc !== '' && venc < hoje) {
        vencidos.push(item)
        totalVencidos += valor
      } else {
        aVencer.push(item)
        totalAVencer += valor
      }
    }
    return e.json(200, {
      ok: true,
      a_vencer: aVencer,
      vencidos: vencidos,
      pagos: pagos,
      totalizador: {
        a_vencer: totalAVencer,
        vencidos: totalVencidos,
        pagos: totalPagos,
        geral: totalAVencer + totalVencidos + totalPagos,
      },
    })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'GET',
  '/backend/v1/erp/clientes/{id}/sugestoes',
  (e) => {
    const token = $os.getenv('AVATARFV_API_TOKEN')
    const got = String(e.requestInfo().headers['x_avatar_token'] || '')
    if (token === '' || got !== token) {
      return e.json(401, { error: 'Token inválido ou ausente (header X-Avatar-Token)' })
    }
    const clientId = String(e.request.pathValue('id') || '')

    // Sugestões: itens mais comprados em pedidos anteriores do cliente
    let orders = []
    try {
      orders = e.app.findRecordsByFilter(
        'sales_orders',
        "client_id = '" + clientId.replace(/'/g, "''") + "' && is_balance != true",
        '-created',
        100,
        0,
      )
    } catch (err) {
      orders = []
    }
    const mapa = {}
    for (const o of orders) {
      let items = []
      try {
        items = o.get('items') || []
      } catch (err) {
        items = []
      }
      if (!Array.isArray(items)) continue
      for (const it of items) {
        const pid = String(it.product_id || it.produto_id || '')
        if (pid === '') continue
        if (!mapa[pid]) {
          mapa[pid] = {
            produto_id: pid,
            produto_codigo: String(it.product_code || it.produto_codigo || ''),
            descricao: String(it.product_name || it.descricao || ''),
            unidade: String(it.unit || it.unidade || ''),
            vezes_comprado: 0,
            quantidade_total: 0,
            ultimo_preco: Number(it.unit_price || it.preco || 0),
          }
        }
        mapa[pid].vezes_comprado += 1
        mapa[pid].quantidade_total += Number(it.quantity || it.quantidade || 0)
      }
    }
    const sugestoes = Object.values(mapa).sort((a, b) => b.vezes_comprado - a.vezes_comprado)
    return e.json(200, { ok: true, total: sugestoes.length, sugestoes: sugestoes })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/erp/pedidos',
  (e) => {
    const token = $os.getenv('AVATARFV_API_TOKEN')
    const got = String(e.requestInfo().headers['x_avatar_token'] || '')
    if (token === '' || got !== token) {
      return e.json(401, { error: 'Token inválido ou ausente (header X-Avatar-Token)' })
    }
    const body = e.requestInfo().body || {}
    const numeroPedido = String(body.numero_pedido || '')
    const clienteId = String(body.cliente_id || '')
    const clienteNome = String(body.cliente_nome || '')
    const rcaId = String(body.rca_id || '')
    const rcaNome = String(body.rca_nome || '')
    const empresaId = String(body.empresa_id || '')
    const filialId = String(body.filial_id || '')
    const condicao = String(body.condicao_pagamento || '')
    const forma = String(body.forma_pagamento || '')
    const observacoes = String(body.observacoes || '')
    const itens = body.itens || []

    if (numeroPedido === '') {
      return e.json(400, { error: 'numero_pedido é obrigatório (idempotência)' })
    }
    if (clienteId === '') {
      return e.json(400, { error: 'cliente_id é obrigatório' })
    }
    if (!Array.isArray(itens) || itens.length === 0) {
      return e.json(400, { error: 'itens deve ser uma lista com pelo menos um item' })
    }

    // Idempotência: reenvio com o mesmo numero_pedido (integration_order_number)
    // não duplica — responde o pedido existente com o status atual.
    let existing = null
    try {
      existing = e.app.findFirstRecordByFilter(
        'sales_orders',
        "integration_order_number = '" + numeroPedido.replace(/'/g, "''") + "'",
      )
    } catch (err) {
      existing = null
    }
    if (existing) {
      return e.json(200, {
        ok: true,
        idempotent: true,
        numero_pedido: existing.getString('order_number') || numeroPedido,
        integration_order_number: existing.getString('integration_order_number') || '',
        status: existing.getString('status') || '',
        order_stage: existing.getString('order_stage') || '',
        order_id: existing.id,
      })
    }

    let total = 0
    for (const it of itens) {
      const qtd = Number(it.quantidade || it.quantity || 0)
      const preco = Number(it.preco || it.preco_unitario || it.unit_price || 0)
      total += qtd * preco
    }

    const col = e.app.findCollectionByNameOrId('sales_orders')
    const rec = new Record(col)
    rec.set('order_number', numeroPedido)
    rec.set('integration_order_number', numeroPedido)
    rec.set('status', 'aberto')
    rec.set('order_stage', 'cotacao')
    rec.set('client_id', clienteId)
    rec.set('client_name', clienteNome)
    rec.set('rca_id', rcaId)
    rec.set('rca_name', rcaNome)
    rec.set('salesperson_id', rcaId)
    rec.set('salesperson_name', rcaNome)
    rec.set('empresa_id', empresaId)
    rec.set('filial_id', filialId)
    rec.set('company', empresaId)
    rec.set('branch', filialId)
    rec.set('payment_condition', condicao)
    rec.set('payment_method', forma)
    rec.set('internal_notes', observacoes)
    rec.set('items', itens)
    rec.set('total_value', String(total))
    rec.set('sales_channel', 'avatarfv')
    rec.set('operation_type', 'pedido_fv')
    rec.set('history', [
      {
        acao: 'pedido_recebido_avatarfv',
        data: new Date().toISOString(),
        detalhe: 'Pedido criado pela integração AvatarFV',
      },
    ])
    try {
      e.app.save(rec)
    } catch (err) {
      return e.json(500, { error: 'Falha ao gravar o pedido no ERP: ' + (err.message || err) })
    }
    return e.json(201, {
      ok: true,
      numero_pedido: rec.getString('order_number'),
      integration_order_number: rec.getString('integration_order_number'),
      status: rec.getString('status'),
      order_stage: rec.getString('order_stage'),
      order_id: rec.id,
    })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'GET',
  '/backend/v1/erp/pedidos/{numero}/status',
  (e) => {
    const token = $os.getenv('AVATARFV_API_TOKEN')
    const got = String(e.requestInfo().headers['x_avatar_token'] || '')
    if (token === '' || got !== token) {
      return e.json(401, { error: 'Token inválido ou ausente (header X-Avatar-Token)' })
    }
    const numero = String(e.request.pathValue('numero') || '')

    let order = null
    try {
      order = e.app.findFirstRecordByFilter(
        'sales_orders',
        "integration_order_number = '" +
          numero.replace(/'/g, "''") +
          "' || order_number = '" +
          numero.replace(/'/g, "''") +
          "'",
      )
    } catch (err) {
      order = null
    }
    if (!order) {
      return e.json(404, { error: 'Pedido não encontrado no ERP', numero: numero })
    }

    // Em cotação / faturado / rejeitado, mapeado dos campos reais do ERP
    const stage = order.getString('order_stage') || ''
    const status = order.getString('status') || ''
    const isRejected = status.toLowerCase() === 'rejeitado' || status.toLowerCase() === 'cancelado'
    const isInvoiced =
      order.getBool('is_invoiced') || (order.getString('faturamento_status') || '') === 'faturado'
    let situacaoApp = 'em_cotacao'
    if (isRejected) {
      situacaoApp = 'rejeitado'
    } else if (isInvoiced) {
      situacaoApp = 'faturado'
    }
    return e.json(200, {
      ok: true,
      numero_pedido: numero,
      order_id: order.id,
      status_erp: status,
      order_stage: stage,
      faturamento_status: order.getString('faturamento_status') || '',
      situacao_app: situacaoApp,
      nfe_numero: order.getString('nfe_numero') || '',
      nfe_chave_acesso: order.getString('nfe_chave_acesso') || '',
      atualizado_em: order.getString('updated') || '',
    })
  },
  (e) => {
    e.next()
  },
)

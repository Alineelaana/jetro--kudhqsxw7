// Endpoint para simulação e geração de corte de pedidos com geração automática de Pedido de Saldo
// e aproveitamento de saldo pendente quando houver reposição de estoque.

routerAdd('POST', '/backend/v1/sales-orders/cut-and-generate-balance', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Autenticação necessária' })
  }

  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const orderId = body.order_id
  const cuts = body.cuts || [] // [{ product_code, product_name, cut_quantity, reason }]
  const operatorName = (authRecord && authRecord.getString('name')) || 'Sistema'

  if (!orderId) {
    return e.json(400, { error: 'order_id é obrigatório' })
  }

  try {
    const originalOrder = $app.findRecordById('sales_orders', orderId)
    if (!originalOrder) {
      return e.json(404, { error: 'Pedido não encontrado' })
    }

    const items = originalOrder.get('items') || []
    if (!Array.isArray(items) || items.length === 0) {
      return e.json(400, { error: 'Pedido não possui itens para corte' })
    }

    const cutMap = {}
    cuts.forEach((ct) => {
      if (ct.product_code) cutMap[ct.product_code] = ct
      else if (ct.product_name) cutMap[ct.product_name] = ct
    })

    const remainingItems = []
    const balanceItems = []
    const recordedCuts = []

    let originalTotal = 0
    let balanceTotal = 0

    items.forEach((item) => {
      const pCode = item.code || ''
      const pName = item.product || ''
      const reqQty = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      const cutInfo = cutMap[pCode] || cutMap[pName]

      if (cutInfo && parseFloat(cutInfo.cut_quantity) > 0) {
        const cutQty = Math.min(reqQty, parseFloat(cutInfo.cut_quantity))
        const fulfilledQty = Math.max(0, reqQty - cutQty)

        recordedCuts.push({
          code: pCode,
          product: pName,
          unit: item.unit || 'un',
          requested_quantity: reqQty,
          fulfilled_quantity: fulfilledQty,
          cut_quantity: cutQty,
          unit_price: unitPrice,
          total_cut_value: (cutQty * unitPrice).toFixed(2),
          reason: cutInfo.reason || 'Falta de estoque',
          cut_at: new Date().toISOString(),
          cut_by: operatorName,
        })

        if (fulfilledQty > 0) {
          const itemTotal = (fulfilledQty * unitPrice).toFixed(2)
          remainingItems.push({
            ...item,
            quantity: String(fulfilledQty),
            total: itemTotal,
            situation: 'Atendido Parcial',
          })
          originalTotal += fulfilledQty * unitPrice
        }

        if (cutQty > 0) {
          const cutTotal = (cutQty * unitPrice).toFixed(2)
          balanceItems.push({
            ...item,
            quantity: String(cutQty),
            total: cutTotal,
            situation: 'Saldo Pendente',
          })
          balanceTotal += cutQty * unitPrice
        }
      } else {
        remainingItems.push(item)
        originalTotal += reqQty * unitPrice
      }
    })

    if (balanceItems.length === 0) {
      return e.json(400, { error: 'Nenhum corte aplicável para gerar saldo' })
    }

    // 1. Criar o Pedido de Saldo vinculado
    const salesCol = $app.findCollectionByNameOrId('sales_orders')
    const balanceOrder = new Record(salesCol)

    const origOrderNum = originalOrder.getString('order_number') || ''
    const balanceOrderNum = origOrderNum + '-SLD'

    balanceOrder.set('order_number', balanceOrderNum)
    balanceOrder.set(
      'integration_order_number',
      originalOrder.getString('integration_order_number')
        ? originalOrder.getString('integration_order_number') + '-SLD'
        : '',
    )
    balanceOrder.set('client_id', originalOrder.getString('client_id'))
    balanceOrder.set('client_name', originalOrder.getString('client_name'))
    balanceOrder.set('salesperson_id', originalOrder.getString('salesperson_id'))
    balanceOrder.set('salesperson_name', originalOrder.getString('salesperson_name'))
    balanceOrder.set('price_table_id', originalOrder.getString('price_table_id'))
    balanceOrder.set('payment_condition', originalOrder.getString('payment_condition'))
    balanceOrder.set('payment_method', originalOrder.getString('payment_method'))
    balanceOrder.set('carrier_name', originalOrder.getString('carrier_name'))
    balanceOrder.set('delivery_address', originalOrder.getString('delivery_address'))
    balanceOrder.set('cost_center', originalOrder.getString('cost_center'))
    balanceOrder.set('company', originalOrder.getString('company') || 'Jetro')
    balanceOrder.set('branch', originalOrder.getString('branch') || 'Matriz')
    balanceOrder.set('team', originalOrder.getString('team'))
    balanceOrder.set('rca_id', originalOrder.getString('rca_id'))
    balanceOrder.set('rca_name', originalOrder.getString('rca_name'))
    balanceOrder.set('customer_group', originalOrder.getString('customer_group'))
    balanceOrder.set('customer_cnpj', originalOrder.getString('customer_cnpj'))
    balanceOrder.set('customer_city', originalOrder.getString('customer_city'))
    balanceOrder.set('customer_district', originalOrder.getString('customer_district'))
    balanceOrder.set('customer_address', originalOrder.getString('customer_address'))
    balanceOrder.set(
      'operation_type',
      originalOrder.getString('operation_type') || 'Pedido de Venda',
    )
    balanceOrder.set('sales_channel', 'Pedido de Saldo')
    balanceOrder.set('status', 'Pendente')
    balanceOrder.set('is_balance', true)
    balanceOrder.set('generated_balance', false)
    balanceOrder.set('original_order_id', originalOrder.id)
    balanceOrder.set('original_order_number', origOrderNum)
    balanceOrder.set('items', balanceItems)
    balanceOrder.set('gross_value', balanceTotal.toFixed(2))
    balanceOrder.set('total_value', balanceTotal.toFixed(2))
    balanceOrder.set('responsible_user', operatorName)
    balanceOrder.set('stock_reserved', false)
    balanceOrder.set('is_invoiced', false)
    balanceOrder.set(
      'internal_notes',
      'Pedido de saldo gerado a partir do pedido ' + origOrderNum + ' por falta de estoque',
    )
    balanceOrder.set('history', [
      {
        action: 'Pedido de Saldo Criado',
        user: operatorName,
        date: new Date().toISOString(),
        note: 'Gerado a partir do corte de estoque do pedido ' + origOrderNum,
      },
    ])

    $app.save(balanceOrder)

    // 2. Atualizar o Pedido Original
    originalOrder.set('generated_balance', true)
    originalOrder.set('balance_order_id', balanceOrder.id)
    originalOrder.set('balance_order_number', balanceOrderNum)
    originalOrder.set('cut_items', recordedCuts)
    originalOrder.set('items', remainingItems)
    originalOrder.set('gross_value', originalTotal.toFixed(2))
    originalOrder.set('total_value', originalTotal.toFixed(2))

    const origHist = originalOrder.get('history') || []
    origHist.push({
      action: 'Corte de Estoque e Geração de Saldo',
      user: operatorName,
      date: new Date().toISOString(),
      note: 'Itens cortados por falta de estoque. Gerado pedido de saldo ' + balanceOrderNum,
    })
    originalOrder.set('history', origHist)

    $app.save(originalOrder)

    // 3. Auditoria Jetro
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const aLog = new Record(auditCol)
      aLog.set('action', 'update')
      aLog.set('module', 'vendas')
      aLog.set('target_collection', 'sales_orders')
      aLog.set('target_id', originalOrder.id)
      aLog.set(
        'target_summary',
        'Corte de estoque no pedido ' + origOrderNum + ' gerando saldo ' + balanceOrderNum,
      )
      aLog.set('criticidade', 'Alta')
      aLog.set('origem', 'Área da Empresa')
      $app.save(aLog)
    } catch (_) {}

    return e.json(200, {
      success: true,
      original_order_id: originalOrder.id,
      original_order_number: origOrderNum,
      balance_order_id: balanceOrder.id,
      balance_order_number: balanceOrderNum,
      cuts: recordedCuts,
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao processar corte e saldo: ' + String(err) })
  }
})

// Endpoint para aproveitamento de saldo pendente quando houver reposição de estoque
routerAdd('POST', '/backend/v1/sales-orders/fulfill-balance', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Autenticação necessária' })
  }

  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const balanceOrderId = body.balance_order_id
  const operatorName = (authRecord && authRecord.getString('name')) || 'Sistema'

  if (!balanceOrderId) {
    return e.json(400, { error: 'balance_order_id é obrigatório' })
  }

  try {
    const balanceOrder = $app.findRecordById('sales_orders', balanceOrderId)
    if (!balanceOrder) {
      return e.json(404, { error: 'Pedido de saldo não encontrado' })
    }

    if (!balanceOrder.getBool('is_balance')) {
      return e.json(400, { error: 'O pedido informado não é um pedido de saldo' })
    }

    balanceOrder.set('status', 'Liberado')
    balanceOrder.set('stock_reserved', true)

    const hist = balanceOrder.get('history') || []
    hist.push({
      action: 'Aproveitamento de Saldo',
      user: operatorName,
      date: new Date().toISOString(),
      note: 'Estoque reposto. Pedido de saldo liberado para separação e faturamento.',
    })
    balanceOrder.set('history', hist)

    $app.save(balanceOrder)

    return e.json(200, {
      success: true,
      message: 'Pedido de saldo liberado para faturamento com sucesso',
      balance_order_id: balanceOrder.id,
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao aproveitar pedido de saldo: ' + String(err) })
  }
})

routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/ledger-query',
  (e) => {
    const body = e.requestInfo().body || {}

    const filterParts = []
    if (body.supplier_name) filterParts.push('supplier_name ~ "' + body.supplier_name + '"')
    if (body.buyer_name) filterParts.push('buyer_name ~ "' + body.buyer_name + '"')
    if (body.program) filterParts.push('program ~ "' + body.program + '"')
    if (body.campaign) filterParts.push('campaign ~ "' + body.campaign + '"')
    if (body.category) filterParts.push('category ~ "' + body.category + '"')
    if (body.brand) filterParts.push('brand ~ "' + body.brand + '"')
    if (body.competence_period)
      filterParts.push('competence_period = "' + body.competence_period + '"')
    if (body.seller) filterParts.push('seller ~ "' + body.seller + '"')
    if (body.sales_manager) filterParts.push('sales_manager ~ "' + body.sales_manager + '"')
    if (body.supervisor) filterParts.push('supervisor ~ "' + body.supervisor + '"')
    if (body.cost_center_code)
      filterParts.push('cost_center_code = "' + body.cost_center_code + '"')
    if (body.empresa) filterParts.push('company = "' + body.empresa + '"')
    if (body.filial) filterParts.push('branch = "' + body.filial + '"')

    const filterStr = filterParts.length > 0 ? filterParts.join(' && ') : ''

    let movements = []
    try {
      movements = $app.findRecordsByFilter(
        'supplier_allowance_movements',
        filterStr,
        '-created',
        1000,
        0,
      )
    } catch (err) {
      return e.json(200, {
        summary: [],
        analytical: [],
        kpis: {
          total_earned: 0,
          total_consumed: 0,
          total_received: 0,
          total_claims: 0,
          total_applied_compras: 0,
          total_consumed_trade: 0,
          total_consumed_marketing: 0,
          total_consumed_bonificacao: 0,
          total_available: 0,
          roi: 0,
        },
        total_movements: 0,
      })
    }

    const supplierMap = {}
    let totalEarned = 0,
      totalConsumed = 0,
      totalReceived = 0,
      totalClaims = 0
    let totalAppliedCompras = 0,
      totalConsumedTrade = 0,
      totalConsumedMarketing = 0,
      totalConsumedBonificacao = 0
    const analytical = []

    for (let i = 0; i < movements.length; i++) {
      const m = movements[i]
      const supplierName = m.getString('supplier_name') || '\u2014'
      const direction = m.getString('direction') || ''
      const movementType = m.getString('movement_type') || ''
      const category = m.getString('category') || ''
      const value = parseFloat(m.getString('value') || '0') || 0

      if (!supplierMap[supplierName]) {
        supplierMap[supplierName] = {
          supplier_name: supplierName,
          earned: 0,
          consumed: 0,
          received: 0,
          claim: 0,
          applied_compras: 0,
          consumed_trade: 0,
          consumed_marketing: 0,
          consumed_bonificacao: 0,
          pending_receipt: 0,
          available: 0,
          committed: 0,
        }
      }
      const s = supplierMap[supplierName]

      if (direction === 'credito') {
        s.earned += value
        totalEarned += value
        if (movementType === 'lancamento' || movementType === 'settlement') {
          s.received += value
          totalReceived += value
        }
      } else {
        s.consumed += value
        totalConsumed += value
        if (category === 'compras') {
          s.applied_compras += value
          totalAppliedCompras += value
        }
        if (category === 'trade') {
          s.consumed_trade += value
          totalConsumedTrade += value
        }
        if (category === 'marketing') {
          s.consumed_marketing += value
          totalConsumedMarketing += value
        }
        if (category === 'bonificacao') {
          s.consumed_bonificacao += value
          totalConsumedBonificacao += value
        }
        if (movementType === 'claim') {
          s.claim += value
          totalClaims += value
        }
      }

      analytical.push({
        id: m.id,
        created: m.getString('created') || '',
        supplier_name: supplierName,
        buyer_name: m.getString('buyer_name') || '',
        program: m.getString('program') || '',
        campaign: m.getString('campaign') || '',
        movement_type: movementType,
        direction: direction,
        value: m.getString('value') || '0',
        document_number: m.getString('document_number') || '',
        category: category,
        brand: m.getString('brand') || '',
        product_name: m.getString('product_name') || '',
        competence_period: m.getString('competence_period') || '',
        workflow_state: m.getString('workflow_state') || '',
        justification: m.getString('justification') || '',
        user: m.getString('user') || '',
        claim_status: m.getString('claim_status') || '',
        receipt_status: m.getString('receipt_status') || '',
        observations: m.getString('observations') || '',
        sales_manager: m.getString('sales_manager') || '',
        supervisor: m.getString('supervisor') || '',
        seller: m.getString('seller') || '',
      })
    }

    const summary = []
    for (const key in supplierMap) {
      const s = supplierMap[key]
      s.available = s.earned - s.consumed
      s.pending_receipt = s.earned - s.received
      summary.push(s)
    }

    const totalAvailable = totalEarned - totalConsumed
    const roi = totalEarned > 0 ? (totalAvailable / totalEarned) * 100 : 0

    return e.json(200, {
      summary: summary,
      analytical: analytical,
      kpis: {
        total_earned: totalEarned,
        total_consumed: totalConsumed,
        total_received: totalReceived,
        total_claims: totalClaims,
        total_applied_compras: totalAppliedCompras,
        total_consumed_trade: totalConsumedTrade,
        total_consumed_marketing: totalConsumedMarketing,
        total_consumed_bonificacao: totalConsumedBonificacao,
        total_available: totalAvailable,
        roi: roi,
      },
      total_movements: movements.length,
    })
  },
  $apis.requireAuth(),
)

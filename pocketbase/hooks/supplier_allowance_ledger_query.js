routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/ledger-query',
  (e) => {
    var body = e.requestInfo().body || {}
    var parts = []
    var filterKeys = [
      'supplier_name',
      'buyer_name',
      'program',
      'campaign',
      'action_ref',
      'category',
      'brand',
      'product_name',
      'cost_center_code',
      'result_center_code',
      'competence_period',
      'movement_type',
      'workflow_state',
      'claim_status',
      'receipt_status',
      'sales_manager',
      'supervisor',
      'seller',
      'negotiation_responsible',
      'usage_responsible',
    ]
    for (var fi = 0; fi < filterKeys.length; fi++) {
      var key = filterKeys[fi]
      if (body[key]) {
        parts.push(key + ' ~ "' + body[key] + '"')
      }
    }
    if (body.startDate) parts.push('created >= "' + body.startDate + ' 00:00:00"')
    if (body.endDate) parts.push('created <= "' + body.endDate + ' 23:59:59"')
    var filterStr = parts.length ? parts.join(' && ') : "id != ''"

    var movements = []
    try {
      movements = $app.findRecordsByFilter(
        'supplier_allowance_movements',
        filterStr,
        '-created',
        500,
        0,
      )
    } catch (_) {}

    var accounts = []
    try {
      accounts = $app.findRecordsByFilter(
        'supplier_allowance_accounts',
        "id != ''",
        '-created',
        500,
        0,
      )
    } catch (_) {}

    var summaryMap = {}
    var kpis = {
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
    }

    for (var i = 0; i < movements.length; i++) {
      var m = movements[i]
      var sKey = m.getString('supplier_name') || m.getString('account') || '—'
      if (!summaryMap[sKey]) {
        summaryMap[sKey] = {
          supplier_name: sKey,
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
      var v = parseFloat(m.getString('value') || '0')
      var d = m.getString('direction')
      var c = m.getString('category') || ''
      var t = m.getString('movement_type')
      if (d === 'credito') {
        summaryMap[sKey].earned += v
        if (t === 'lancamento' && m.getString('receipt_status') === 'received')
          summaryMap[sKey].received += v
        kpis.total_earned += v
        if (m.getString('receipt_status') === 'received') kpis.total_received += v
      } else {
        summaryMap[sKey].consumed += v
        kpis.total_consumed += v
        if (c === 'compras') {
          summaryMap[sKey].applied_compras += v
          kpis.total_applied_compras += v
        }
        if (c === 'trade') {
          summaryMap[sKey].consumed_trade += v
          kpis.total_consumed_trade += v
        }
        if (c === 'marketing') {
          summaryMap[sKey].consumed_marketing += v
          kpis.total_consumed_marketing += v
        }
        if (c === 'bonificacao') {
          summaryMap[sKey].consumed_bonificacao += v
          kpis.total_consumed_bonificacao += v
        }
      }
      if (m.getString('claim_status') === 'pending') {
        summaryMap[sKey].claim += v
        kpis.total_claims += v
      }
    }

    var summaryArr = []
    for (var sk in summaryMap) {
      var s = summaryMap[sk]
      s.pending_receipt = s.earned - s.received
      summaryArr.push(s)
    }

    for (var ai = 0; ai < accounts.length; ai++) {
      var a = accounts[ai]
      var bal = parseFloat(a.getString('current_balance') || '0')
      kpis.total_available += bal
    }
    kpis.roi = kpis.total_consumed > 0 ? (kpis.total_earned / kpis.total_consumed) * 100 : 0

    var analytical = []
    for (var mi = 0; mi < movements.length; mi++) {
      var mv = movements[mi]
      analytical.push({
        id: mv.id,
        created: mv.getString('created'),
        supplier_name: mv.getString('supplier_name'),
        buyer_name: mv.getString('buyer_name'),
        program: mv.getString('program'),
        campaign: mv.getString('campaign'),
        movement_type: mv.getString('movement_type'),
        direction: mv.getString('direction'),
        value: mv.getString('value'),
        document_number: mv.getString('document_number'),
        category: mv.getString('category'),
        brand: mv.getString('brand'),
        product_name: mv.getString('product_name'),
        competence_period: mv.getString('competence_period'),
        workflow_state: mv.getString('workflow_state'),
        justification: mv.getString('justification'),
        user: mv.getString('user'),
        claim_status: mv.getString('claim_status'),
        receipt_status: mv.getString('receipt_status'),
        observations: mv.getString('observations'),
        sales_manager: mv.getString('sales_manager'),
        supervisor: mv.getString('supervisor'),
        seller: mv.getString('seller'),
      })
    }

    return e.json(200, {
      summary: summaryArr,
      analytical: analytical,
      kpis: kpis,
      total_movements: movements.length,
    })
  },
  $apis.requireAuth(),
)

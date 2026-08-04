routerAdd(
  'POST',
  '/backend/v1/stock/lots/suggest',
  (e) => {
    var body = e.requestInfo().body || {}
    var productId = body.product_id || ''
    var quantity = parseInt(body.quantity) || 0
    var rule = body.rule || ''

    if (!productId) return e.badRequestError('product_id is required')
    if (quantity <= 0) return e.badRequestError('quantity must be positive')

    if (!rule) {
      try {
        var setting = $app.findFirstRecordByData('settings', 'key', 'lot_rule')
        if (setting) rule = setting.getString('value') || 'FEFO'
      } catch (_) {
        rule = 'FEFO'
      }
    }

    var batches = []
    try {
      batches = $app.findRecordsByFilter(
        'stock_batches',
        'produto_id = "' + productId + '" && situacao = "Disponível"',
        '',
        100,
        0,
      )
    } catch (_) {}

    if (rule === 'FIFO') {
      batches.sort(function (a, b) {
        return (a.getString('created') || '').localeCompare(b.getString('created') || '')
      })
    } else if (rule === 'FEFO') {
      batches.sort(function (a, b) {
        return (a.getString('data_validade') || '').localeCompare(
          b.getString('data_validade') || '',
        )
      })
    }

    var suggestions = []
    var remaining = quantity
    for (var i = 0; i < batches.length && remaining > 0; i++) {
      var avail = batches[i].getInt('quantidade_disponivel') || 0
      if (avail <= 0) continue
      var suggested = Math.min(avail, remaining)
      suggestions.push({
        batch_id: batches[i].id,
        lot_number: batches[i].getString('numero_lote') || '',
        expiry_date: batches[i].getString('data_validade') || '',
        available_qty: avail,
        suggested_qty: suggested,
      })
      remaining -= suggested
    }

    return e.json(200, { rule: rule, suggestions: suggestions, unfulfilled: remaining })
  },
  $apis.requireAuth(),
)

onRecordAfterCreateSuccess((e) => {
  var order = e.record
  var items = order.get('items')
  if (!items || items.length === 0) return e.next()

  var tableId = order.getString('price_table_id') || ''
  if (!tableId) return e.next()

  try {
    var table = null
    try {
      table = $app.findRecordById('price_tables', tableId)
    } catch (_) {}
    if (!table) return e.next()

    var rawItems = table.get('items')
    var tableItems = []
    if (typeof rawItems === 'string') {
      try {
        tableItems = JSON.parse(rawItems)
      } catch (_) {}
    } else if (Array.isArray(rawItems)) {
      tableItems = rawItems
    }
    if (!tableItems.length) return e.next()

    var apCol = $app.findCollectionByNameOrId('pricing_approvals')
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var approvers = $app.findRecordsByFilter(
      'users',
      "active != false && (role = 'SUP' || role = 'COMERCIAL')",
      '',
      0,
      0,
    )
    var created = 0

    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item || !item.product) continue
      var unitPrice = parseFloat(String(item.unit_price || '0').replace(',', '.')) || 0
      if (unitPrice <= 0) continue

      var matched = null
      for (var j = 0; j < tableItems.length; j++) {
        if (tableItems[j].code && item.code && tableItems[j].code === item.code) {
          matched = tableItems[j]
          break
        }
        if (tableItems[j].name && tableItems[j].name === item.product) {
          matched = tableItems[j]
          break
        }
      }
      if (!matched) continue

      var minPrice = parseFloat(String(matched.min_price || '0').replace(',', '.')) || 0
      if (minPrice <= 0 || unitPrice >= minPrice) continue

      var productId = matched.product_id || ''
      var productName = matched.name || item.product
      var productCode = matched.code || item.code || ''

      var currentPrice = 0
      if (productId) {
        try {
          var prod = $app.findRecordById('products', productId)
          currentPrice = parseFloat(String(prod.getString('price') || '0').replace(',', '.')) || 0
        } catch (_) {}
      }

      var marginPct = 0
      var ap = new Record(apCol)
      ap.set('product_id', productId)
      ap.set('product_code', productCode)
      ap.set('product_name', productName)
      ap.set('requested_price', unitPrice.toFixed(2))
      ap.set('current_price', currentPrice.toFixed(2))
      ap.set('margin_percent', marginPct.toFixed(2))
      ap.set('minimum_margin', String(minPrice))
      ap.set('status', 'pending')
      ap.set(
        'requester_name',
        (order.getString('salesperson_name') || 'Sistema') +
          ' - Pedido: ' +
          order.getString('order_number'),
      )
      $app.save(ap)
      created++

      var msg =
        'Preco abaixo do minimo - Pedido ' +
        order.getString('order_number') +
        ' - Produto: ' +
        productName +
        ' (' +
        productCode +
        '). Preco: R$ ' +
        unitPrice.toFixed(2) +
        ', Minimo: R$ ' +
        minPrice.toFixed(2)
      for (var a = 0; a < approvers.length; a++) {
        var n = new Record(notifCol)
        n.set('title', 'Aprovacao de preco necessaria')
        n.set('message', msg)
        n.set('type', 'approval_pending')
        n.set('recipient', approvers[a].id)
        n.set('read', false)
        n.set('link', '/admin')
        $app.save(n)
      }
    }

    if (created > 0) {
      $app
        .logger()
        .info(
          'sales_min_price_approval created',
          'approvals',
          created,
          'order',
          order.getString('order_number'),
        )
    }
  } catch (err) {
    $app.logger().error('sales_min_price_approval failed', 'error', String(err))
  }
  return e.next()
}, 'sales_orders')

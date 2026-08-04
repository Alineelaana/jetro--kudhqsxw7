cronAdd('price_table_approval_scan', '0 */4 * * *', () => {
  try {
    var activeTables = $app.findRecordsByFilter(
      'price_tables',
      'status = "ativa" && active != false',
      '',
      0,
      0,
    )
    var approvers = $app.findRecordsByFilter(
      'users',
      "active != false && (role = 'SUP' || role = 'COMERCIAL')",
      '',
      0,
      0,
    )
    if (approvers.length === 0) return

    var apCol = $app.findCollectionByNameOrId('pricing_approvals')
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var created = 0

    for (var t = 0; t < activeTables.length; t++) {
      var table = activeTables[t]
      var tableName = table.getString('table_name')

      var rawItems = table.get('items')
      var items = []
      if (typeof rawItems === 'string') {
        try {
          items = JSON.parse(rawItems)
        } catch (_) {
          items = []
        }
      } else if (Array.isArray(rawItems)) {
        items = rawItems
      }

      if (items.length === 0) {
        var tpId = table.getString('product_id')
        var tpPrice = parseFloat(String(table.getString('price') || '0').replace(',', '.')) || 0
        if (tpId && tpPrice > 0) {
          items = [
            {
              product_id: tpId,
              new_price: String(tpPrice),
              code: table.getString('product_code'),
              name: table.getString('product_name'),
            },
          ]
        }
      }

      for (var i = 0; i < items.length; i++) {
        var item = items[i]
        var productId = String(item.product_id || '')
        var productName = String(item.name || '')
        var productCode = String(item.code || '')
        var tablePrice =
          parseFloat(
            String(item.new_price || item.current_price || item.price || '0').replace(',', '.'),
          ) || 0
        if (!productId || tablePrice <= 0) continue

        try {
          var existing = $app.findRecordsByFilter(
            'pricing_approvals',
            "product_id = '" + productId + "' && status = 'pending'",
            '',
            1,
            0,
          )
          if (existing.length > 0) continue
        } catch (_) {
          continue
        }

        var cfg = null
        try {
          cfg = $app.findFirstRecordByFilter('pricing_config', "product_id = '" + productId + "'")
        } catch (_) {}

        var minMargin = cfg
          ? parseFloat(String(cfg.getString('minimum_margin') || '10').replace(',', '.')) || 10
          : 10
        var minPrice = cfg
          ? parseFloat(String(cfg.getString('minimum_price') || '0').replace(',', '.')) || 0
          : 0
        var finalCost = cfg
          ? parseFloat(String(cfg.getString('final_cost') || '0').replace(',', '.')) || 0
          : 0

        var isBelow = false
        var marginPct = 0
        if (minPrice > 0 && tablePrice < minPrice) {
          isBelow = true
          if (finalCost > 0) marginPct = ((tablePrice - finalCost) / tablePrice) * 100
        } else if (finalCost > 0) {
          marginPct = ((tablePrice - finalCost) / tablePrice) * 100
          if (marginPct < minMargin) isBelow = true
        }
        if (!isBelow) continue

        var currentPrice = 0
        try {
          var product = $app.findRecordById('products', productId)
          currentPrice =
            parseFloat(String(product.getString('price') || '0').replace(',', '.')) || 0
        } catch (_) {}

        var ap = new Record(apCol)
        ap.set('product_id', productId)
        ap.set('product_code', productCode)
        ap.set('product_name', productName)
        ap.set('requested_price', tablePrice.toFixed(2))
        ap.set('current_price', currentPrice.toFixed(2))
        ap.set('margin_percent', marginPct.toFixed(2))
        ap.set('minimum_margin', String(minMargin))
        ap.set('status', 'pending')
        ap.set('requester_name', 'Sistema - Tabela: ' + tableName)
        $app.save(ap)
        created++

        var msg =
          'Preco abaixo do minimo na tabela "' +
          tableName +
          '" - Produto: ' +
          productName +
          ' (' +
          productCode +
          '). Preco: R$ ' +
          tablePrice.toFixed(2) +
          ', Margem: ' +
          marginPct.toFixed(1) +
          '%'
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
    }

    if (created > 0) {
      $app.logger().info('price table approval scan completed', 'approvals_created', created)
    }
  } catch (err) {
    $app.logger().error('price table approval scan failed', 'error', String(err))
  }
})

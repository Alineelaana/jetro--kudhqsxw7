routerAdd(
  'GET',
  '/backend/v1/industrial/mrp',
  (e) => {
    try {
      var bomComponents = []
      try {
        bomComponents = $app.findRecordsByFilter('bom_components', '', 'ordem', 500, 0)
      } catch (_) {}

      var products = []
      try {
        products = $app.findRecordsByFilter('products', 'is_industrial = true', '-created', 500, 0)
      } catch (_) {}

      var productionOrders = []
      try {
        productionOrders = $app.findRecordsByFilter(
          'production_orders',
          "status != 'concluida' && status != 'cancelada'",
          '-created',
          200,
          0,
        )
      } catch (_) {}

      var stockBatches = []
      try {
        stockBatches = $app.findRecordsByFilter('stock_batches', '', '-created', 500, 0)
      } catch (_) {}

      var purchaseOrders = []
      try {
        purchaseOrders = $app.findRecordsByFilter(
          'purchase_orders',
          "status != 'Recebido Totalmente' && status != 'Cancelado'",
          '-created',
          200,
          0,
        )
      } catch (_) {}

      var stockMap = {}
      for (var i = 0; i < stockBatches.length; i++) {
        var pid = stockBatches[i].getString('produto_id')
        var qty = stockBatches[i].getFloat('quantidade_disponivel') || 0
        stockMap[pid] = (stockMap[pid] || 0) + qty
      }

      var needsMap = {}
      for (var j = 0; j < bomComponents.length; j++) {
        var comp = bomComponents[j]
        var itemId = comp.getString('item_id')
        var qtyStr = comp.getString('quantidade') || '0'
        var qty = parseFloat(qtyStr) || 0
        needsMap[itemId] = (needsMap[itemId] || 0) + qty
      }

      var openOrderMap = {}
      for (var k = 0; k < purchaseOrders.length; k++) {
        var po = purchaseOrders[k]
        var items = po.get('items')
        if (items && typeof items === 'object') {
          for (var m = 0; m < items.length; m++) {
            var code = items[m].code || ''
            openOrderMap[code] = (openOrderMap[code] || 0) + (parseFloat(items[m].quantity) || 0)
          }
        }
      }

      var suggestions = []
      for (var p = 0; p < products.length; p++) {
        var prod = products[p]
        var pid = prod.id
        var needed = needsMap[pid] || 0
        if (needed <= 0) continue

        var available = stockMap[pid] || 0
        var inTransit = openOrderMap[prod.getString('code') || ''] || 0
        var netNeed = needed - available - inTransit

        if (netNeed <= 0) continue

        var action = 'comprar'
        var priority = 'media'
        if (netNeed > 1000) priority = 'critica'
        else if (netNeed > 500) priority = 'alta'
        else if (netNeed > 100) priority = 'media'
        else priority = 'baixa'

        try {
          var boms = $app.findRecordsByFilter(
            'bom_versions',
            'product_id = "' + pid + '"',
            '-version',
            1,
            0,
          )
          if (boms.length > 0) action = 'produzir'
        } catch (_) {}

        suggestions.push({
          product_id: pid,
          product_name: prod.getString('name') || '',
          product_code: prod.getString('code') || '',
          required_quantity: needed,
          available_stock: available,
          in_transit: inTransit,
          open_orders: 0,
          net_need: netNeed,
          suggested_action: action,
          priority: priority,
        })
      }

      suggestions.sort(function (a, b) {
        var order = { critica: 0, alta: 1, media: 2, baixa: 3 }
        return (order[a.priority] || 4) - (order[b.priority] || 4)
      })

      return e.json(200, suggestions)
    } catch (err) {
      $app.logger().error('MRP calculation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao calcular MRP' })
    }
  },
  $apis.requireAuth(),
)

cronAdd('stock_price_alert_rescan', '0 */6 * * *', () => {
  try {
    var products = $app.findRecordsByFilter('products', 'active != false', '', 0, 0)
    var teamRoles = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var saCol = $app.findCollectionByNameOrId('stock_alerts')
    var paCol = $app.findCollectionByNameOrId('pricing_alerts')

    var allUsers = $app.findRecordsByFilter('users', 'active != false', '', 0, 0)
    var teamUsers = []
    for (var u = 0; u < allUsers.length; u++) {
      if (teamRoles.indexOf(allUsers[u].getString('role')) !== -1) {
        teamUsers.push(allUsers[u])
      }
    }

    for (var i = 0; i < products.length; i++) {
      var p = products[i]
      var productId = p.id
      var productCode = p.getString('code') || ''
      var productName = p.getString('name') || ''
      var stock = p.getInt('stock') || 0
      var minStock = p.getInt('min_stock') || 0

      if (stock < minStock) {
        try {
          var existingStock = $app.findRecordsByFilter(
            'stock_alerts',
            "product_id = '" + productId + "' && resolved = false",
            '',
            1,
            0,
          )
          if (existingStock.length === 0) {
            var sev = stock === 0 ? 'critical' : 'warning'
            var sMsg =
              'Produto "' +
              productName +
              '" (' +
              productCode +
              ') com estoque abaixo do minimo. Atual: ' +
              stock +
              ', Minimo: ' +
              minStock +
              '.'

            var sAlert = new Record(saCol)
            sAlert.set('product_id', productId)
            sAlert.set('product_code', productCode)
            sAlert.set('product_name', productName)
            sAlert.set('alert_type', 'below_min_stock')
            sAlert.set('severity', sev)
            sAlert.set('current_stock', stock)
            sAlert.set('min_stock', minStock)
            sAlert.set('message', sMsg)
            sAlert.set('resolved', false)
            $app.save(sAlert)

            var sLink = '/admin/produtos?alert_type=stock&alert_id=' + sAlert.id
            for (var s = 0; s < teamUsers.length; s++) {
              var sNotif = new Record(notifCol)
              sNotif.set('title', 'Estoque baixo')
              sNotif.set('message', sMsg)
              sNotif.set('type', 'stock_low')
              sNotif.set('recipient', teamUsers[s].id)
              sNotif.set('read', false)
              sNotif.set('link', sLink)
              $app.save(sNotif)
            }
          }
        } catch (_) {}
      }

      var priceStr = p.getString('price') || '0'
      var costStr = p.getString('cost_price') || '0'
      var price = parseFloat(String(priceStr).replace(',', '.')) || 0
      var cost = parseFloat(String(costStr).replace(',', '.')) || 0

      if (price > 0 && cost > 0 && price < cost) {
        try {
          var existingPrice = $app.findRecordsByFilter(
            'pricing_alerts',
            "product_id = '" + productId + "' && resolved = false && alert_type = 'below_cost'",
            '',
            1,
            0,
          )
          if (existingPrice.length === 0) {
            var pMsg =
              'Produto "' +
              productName +
              '" (' +
              productCode +
              ') com preco abaixo do custo. Preco: R$ ' +
              priceStr +
              ', Custo: R$ ' +
              costStr +
              '.'

            var pAlert = new Record(paCol)
            pAlert.set('product_id', productId)
            pAlert.set('product_code', productCode)
            pAlert.set('product_name', productName)
            pAlert.set('alert_type', 'below_cost')
            pAlert.set('severity', 'critical')
            pAlert.set('message', pMsg)
            pAlert.set('resolved', false)
            $app.save(pAlert)

            var pLink = '/admin/produtos?alert_type=price&alert_id=' + pAlert.id
            for (var pp = 0; pp < teamUsers.length; pp++) {
              var pNotif = new Record(notifCol)
              pNotif.set('title', 'Preco abaixo do custo')
              pNotif.set('message', pMsg)
              pNotif.set('type', 'price_below_cost')
              pNotif.set('recipient', teamUsers[pp].id)
              pNotif.set('read', false)
              pNotif.set('link', pLink)
              $app.save(pNotif)
            }
          }
        } catch (_) {}
      }
    }

    $app.logger().info('stock price alert rescan completed', 'products_scanned', products.length)
  } catch (err) {
    $app.logger().error('stock price alert rescan failed', 'error', String(err))
  }
})

onRecordAfterUpdateSuccess((e) => {
  var productId = e.record.id
  var productCode = e.record.getString('code') || ''
  var productName = e.record.getString('name') || ''
  var stock = e.record.getInt('stock') || 0
  var minStock = e.record.getInt('min_stock') || 0

  if (stock < minStock) {
    try {
      var existing = $app.findRecordsByFilter(
        'stock_alerts',
        "product_id = '" + productId + "' && resolved = false",
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        var severity = stock === 0 ? 'critical' : 'warning'
        var msg =
          'Produto "' +
          productName +
          '" (' +
          productCode +
          ') com estoque abaixo do minimo. Atual: ' +
          stock +
          ', Minimo: ' +
          minStock +
          '.'

        var saCol = $app.findCollectionByNameOrId('stock_alerts')
        var alert = new Record(saCol)
        alert.set('product_id', productId)
        alert.set('product_code', productCode)
        alert.set('product_name', productName)
        alert.set('alert_type', 'below_min_stock')
        alert.set('severity', severity)
        alert.set('current_stock', stock)
        alert.set('min_stock', minStock)
        alert.set('message', msg)
        alert.set('resolved', false)
        $app.save(alert)

        var users = $app.findRecordsByFilter('users', 'active != false', '', 0, 0)
        var teamRoles = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
        var notifCol = $app.findCollectionByNameOrId('notifications')
        var link = '/admin/produtos?alert_type=stock&alert_id=' + alert.id

        for (var i = 0; i < users.length; i++) {
          if (teamRoles.indexOf(users[i].getString('role')) === -1) continue
          var notif = new Record(notifCol)
          notif.set('title', 'Estoque baixo')
          notif.set('message', msg)
          notif.set('type', 'stock_low')
          notif.set('recipient', users[i].id)
          notif.set('read', false)
          notif.set('link', link)
          $app.save(notif)
        }
      }
    } catch (err) {
      $app.logger().error('stock alert update check failed', 'error', String(err))
    }
  }

  var priceStr = e.record.getString('price') || '0'
  var costStr = e.record.getString('cost_price') || '0'
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
        var priceMsg =
          'Produto "' +
          productName +
          '" (' +
          productCode +
          ') com preco abaixo do custo. Preco: R$ ' +
          priceStr +
          ', Custo: R$ ' +
          costStr +
          '.'

        var paCol = $app.findCollectionByNameOrId('pricing_alerts')
        var pAlert = new Record(paCol)
        pAlert.set('product_id', productId)
        pAlert.set('product_code', productCode)
        pAlert.set('product_name', productName)
        pAlert.set('alert_type', 'below_cost')
        pAlert.set('severity', 'critical')
        pAlert.set('message', priceMsg)
        pAlert.set('resolved', false)
        $app.save(pAlert)

        var users2 = $app.findRecordsByFilter('users', 'active != false', '', 0, 0)
        var teamRoles2 = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
        var notifCol2 = $app.findCollectionByNameOrId('notifications')
        var link2 = '/admin/produtos?alert_type=price&alert_id=' + pAlert.id

        for (var j = 0; j < users2.length; j++) {
          if (teamRoles2.indexOf(users2[j].getString('role')) === -1) continue
          var notif2 = new Record(notifCol2)
          notif2.set('title', 'Preco abaixo do custo')
          notif2.set('message', priceMsg)
          notif2.set('type', 'price_below_cost')
          notif2.set('recipient', users2[j].id)
          notif2.set('read', false)
          notif2.set('link', link2)
          $app.save(notif2)
        }
      }
    } catch (err2) {
      $app.logger().error('price alert update check failed', 'error', String(err2))
    }
  }

  return e.next()
}, 'products')

onRecordAfterUpdateSuccess((e) => {
  var order = e.record
  var oldStatus = ''
  var newStatus = order.getString('status') || ''

  try {
    oldStatus = order.original().getString('status') || ''
  } catch (_) {}

  if (oldStatus === newStatus) return e.next()

  try {
    var movCol = $app.findCollectionByNameOrId('stock_movements')
    var items = order.get('items')
    if (!items || items.length === 0) return e.next()

    var orderNum = order.getString('order_number') || ''
    var clientName = order.getString('client_name') || ''
    var responsible = order.getString('responsible_user') || 'Sistema'

    if (newStatus === 'Estoque Reservado' && oldStatus !== 'Estoque Reservado') {
      for (var i = 0; i < items.length; i++) {
        var item = items[i]
        if (!item || !item.product) continue
        var qty = parseInt(item.quantity) || 0
        if (qty <= 0) continue

        try {
          var prod = $app.findFirstRecordByFilter('products', 'name = "' + item.product + '"')
          if (prod) {
            var currentReserved = prod.getInt('estoque_reservado') || 0
            prod.set('estoque_reservado', currentReserved + qty)
            $app.save(prod)

            var mov = new Record(movCol)
            mov.set('produto_id', prod.id)
            mov.set('produto_nome', item.product)
            mov.set('produto_codigo', item.code || '')
            mov.set('tipo_movimentacao', 'Reserva')
            mov.set('documento_origem', orderNum)
            mov.set('documento_tipo', 'Pedido de Venda')
            mov.set('quantidade', qty)
            mov.set('saldo_anterior', prod.getInt('stock') || 0)
            mov.set('saldo_atual', prod.getInt('stock') || 0)
            mov.set('motivo', 'Reserva estoque - Pedido ' + orderNum)
            mov.set('responsavel', responsible)
            $app.save(mov)
          }
        } catch (_) {}
      }
    } else if (newStatus === 'Cancelado' && oldStatus === 'Estoque Reservado') {
      for (var j = 0; j < items.length; j++) {
        var item2 = items[j]
        if (!item2 || !item2.product) continue
        var qty2 = parseInt(item2.quantity) || 0
        if (qty2 <= 0) continue

        try {
          var prod2 = $app.findFirstRecordByFilter('products', 'name = "' + item2.product + '"')
          if (prod2) {
            var currentReserved2 = prod2.getInt('estoque_reservado') || 0
            var newReserved = Math.max(0, currentReserved2 - qty2)
            prod2.set('estoque_reservado', newReserved)
            $app.save(prod2)

            var mov2 = new Record(movCol)
            mov2.set('produto_id', prod2.id)
            mov2.set('produto_nome', item2.product)
            mov2.set('tipo_movimentacao', 'Liberação de Reserva')
            mov2.set('documento_origem', orderNum)
            mov2.set('documento_tipo', 'Pedido de Venda')
            mov2.set('quantidade', qty2)
            mov2.set('motivo', 'Liberação reserva - Cancelamento pedido ' + orderNum)
            mov2.set('responsavel', responsible)
            $app.save(mov2)
          }
        } catch (_) {}
      }
    } else if (newStatus === 'Faturado Totalmente' && oldStatus !== 'Faturado Totalmente') {
      for (var k = 0; k < items.length; k++) {
        var item3 = items[k]
        if (!item3 || !item3.product) continue
        var qty3 = parseInt(item3.quantity) || 0
        if (qty3 <= 0) continue

        try {
          var prod3 = $app.findFirstRecordByFilter('products', 'name = "' + item3.product + '"')
          if (prod3) {
            var currentStock3 = prod3.getInt('stock') || 0
            var currentReserved3 = prod3.getInt('estoque_reservado') || 0
            var newStock3 = Math.max(0, currentStock3 - qty3)
            var newReserved3 = Math.max(0, currentReserved3 - qty3)
            prod3.set('stock', newStock3)
            prod3.set('estoque_reservado', newReserved3)
            $app.save(prod3)

            var mov3 = new Record(movCol)
            mov3.set('produto_id', prod3.id)
            mov3.set('produto_nome', item3.product)
            mov3.set('tipo_movimentacao', 'Saída por Venda')
            mov3.set('documento_origem', orderNum)
            mov3.set('documento_tipo', 'Pedido de Venda')
            mov3.set('quantidade', qty3)
            mov3.set('saldo_anterior', currentStock3)
            mov3.set('saldo_atual', newStock3)
            mov3.set('motivo', 'Saída por venda - Pedido ' + orderNum + ' - Cliente: ' + clientName)
            mov3.set('responsavel', responsible)
            $app.save(mov3)
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    $app.logger().error('stock_on_sales_update hook failed', 'error', String(err))
  }

  return e.next()
}, 'sales_orders')

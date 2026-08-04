cronAdd('wms_replenishment_auto', '0 */2 * * *', () => {
  try {
    var replCol = $app.findCollectionByNameOrId('wms_replenishments')
    var products = $app.findRecordsByFilter('products', 'active != false', '-created', 200, 0)
    var created = 0

    for (var i = 0; i < products.length; i++) {
      var prod = products[i]
      var stock = prod.getInt('stock') || 0
      var minStock = prod.getInt('min_stock') || 0
      if (minStock <= 0 || stock > minStock) continue

      var prodId = prod.id
      try {
        $app.findFirstRecordByFilter(
          'wms_replenishments',
          "produto_id = '" + prodId + "' && status = 'Pendente'",
        )
        continue
      } catch (_) {}

      var repl = new Record(replCol)
      repl.set('numero_reabastecimento', 'REP-AUTO-' + prodId.slice(-6))
      repl.set('produto_id', prodId)
      repl.set('produto_nome', prod.getString('name') || '')
      repl.set('produto_codigo', prod.getString('code') || '')
      repl.set('quantidade', Math.max(minStock * 2 - stock, 1))
      repl.set('localizacao_origem', 'Reserva')
      repl.set('localizacao_destino', 'Pick Face')
      repl.set('status', 'Pendente')
      repl.set('operador', '')
      repl.set('motivo', 'Reabastecimento automatico - estoque abaixo do minimo')
      repl.set('prioridade', 'Alta')
      $app.save(repl)
      created++
    }

    if (created > 0) {
      $app.logger().info('wms_replenishment_auto completed', 'created', created)
    }
  } catch (err) {
    $app.logger().error('wms_replenishment_auto failed', 'error', String(err))
  }
})

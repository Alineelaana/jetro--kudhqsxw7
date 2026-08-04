onRecordAfterCreateSuccess((e) => {
  var mov = e.record
  var tipo = mov.getString('tipo_movimentacao') || ''
  var isEntry =
    tipo === 'Entrada por Compra' ||
    tipo === 'Entrada Manual' ||
    tipo === 'Entrada por Devolução' ||
    tipo === 'Ajuste Positivo'
  if (!isEntry) return e.next()

  var productId = mov.getString('produto_id') || ''
  if (!productId) return e.next()

  var unitCostStr = mov.getString('custo_unitario') || '0'
  var unitCost = parseFloat(unitCostStr.replace(',', '.')) || 0
  if (unitCost <= 0) return e.next()

  try {
    var prod = $app.findRecordById('products', productId)
    if (!prod) return e.next()

    prod.set('last_cost', unitCostStr)
    prod.set('cost_price', unitCostStr)
    $app.save(prod)

    try {
      var pc = $app.findFirstRecordByFilter('pricing_config', 'product_id = "' + productId + '"')
      if (pc) {
        pc.set('last_purchase_cost', unitCostStr)
        pc.set('replacement_cost', unitCostStr)
        pc.set('accounting_cost', unitCostStr)
        $app.save(pc)
      }
    } catch (_) {}
  } catch (err) {
    $app.logger().error('stock_cost_update failed', 'error', String(err))
  }

  return e.next()
}, 'stock_movements')

onRecordAfterUpdateSuccess((e) => {
  var inv = e.record
  var oldStatus = ''
  var newStatus = inv.getString('status') || ''
  try {
    oldStatus = inv.original().getString('status') || ''
  } catch (_) {}
  if (oldStatus === newStatus || newStatus !== 'Finalizado') return e.next()

  var items = inv.get('itens')
  if (!items || items.length === 0) return e.next()

  try {
    var adjCol = $app.findCollectionByNameOrId('stock_adjustments')
    var movCol = $app.findCollectionByNameOrId('stock_movements')
    var invNum = inv.getString('numero_inventario') || ''
    var responsible = inv.getString('responsavel') || 'Sistema'

    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item) continue
      var diff = (item.quantidade_contada || 0) - (item.quantidade_sistema || 0)
      if (diff === 0) continue

      var adj = new Record(adjCol)
      adj.set('numero_ajuste', 'AJU-' + invNum + '-' + (i + 1))
      adj.set('data', new Date().toISOString().split('T')[0])
      adj.set('produto_id', item.produto_id || '')
      adj.set('produto_nome', item.produto_nome || '')
      adj.set('produto_codigo', item.produto_codigo || '')
      adj.set('lote', item.lote || '')
      adj.set('validade', item.validade || '')
      adj.set('localizacao', item.localizacao || '')
      adj.set('tipo_ajuste', 'Correção de Inventário')
      adj.set('quantidade', Math.abs(diff))
      adj.set('motivo', item.motivo_diferenca || 'Ajuste inventário ' + invNum)
      adj.set('status', 'Aplicado')
      adj.set('saldo_anterior', item.quantidade_sistema || 0)
      adj.set('saldo_atual', item.quantidade_contada || 0)
      adj.set('responsavel', responsible)
      adj.set('documento_referencia', invNum)
      $app.save(adj)

      if (item.produto_id) {
        try {
          var prod = $app.findRecordById('products', item.produto_id)
          var cur = prod.getInt('stock') || 0
          var ns = cur + diff
          prod.set('stock', ns)
          $app.save(prod)
          var mov = new Record(movCol)
          mov.set('produto_id', item.produto_id)
          mov.set('produto_nome', item.produto_nome || '')
          mov.set('tipo_movimentacao', diff > 0 ? 'Ajuste Positivo' : 'Ajuste Negativo')
          mov.set('documento_origem', invNum)
          mov.set('documento_tipo', 'Inventário')
          mov.set('quantidade', Math.abs(diff))
          mov.set('saldo_anterior', cur)
          mov.set('saldo_atual', ns)
          mov.set('motivo', 'Ajuste inventário ' + invNum)
          mov.set('responsavel', responsible)
          $app.save(mov)
        } catch (_) {}
      }
    }
  } catch (err) {
    $app.logger().error('stock_inventory_approve failed', 'error', String(err))
  }
  return e.next()
}, 'stock_inventories')

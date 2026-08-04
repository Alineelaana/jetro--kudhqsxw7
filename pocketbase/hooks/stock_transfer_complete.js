onRecordAfterUpdateSuccess((e) => {
  var trf = e.record
  var oldStatus = ''
  var newStatus = trf.getString('status') || ''
  try {
    oldStatus = trf.original().getString('status') || ''
  } catch (_) {}
  if (oldStatus === newStatus) return e.next()

  var items = trf.get('itens')
  if (!items || items.length === 0) return e.next()

  try {
    var movCol = $app.findCollectionByNameOrId('stock_movements')
    var trfNum = trf.getString('numero_transferencia') || ''
    var responsible = trf.getString('responsavel') || 'Sistema'
    var isTransit = newStatus === 'Em Trânsito' && oldStatus !== 'Em Trânsito'
    var isReceived = newStatus === 'Recebida' && oldStatus !== 'Recebida'
    if (!isTransit && !isReceived) return e.next()

    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item || !item.produto_id) continue
      var qty = parseInt(item.quantidade_transferir) || 0
      if (qty <= 0) continue
      try {
        var prod = $app.findRecordById('products', item.produto_id)
        if (!prod) continue
        var cur = prod.getInt('stock') || 0
        var ns = isTransit ? cur - qty : cur + qty
        if (ns < 0) ns = 0
        prod.set('stock', ns)
        $app.save(prod)
        var mov = new Record(movCol)
        mov.set('produto_id', item.produto_id)
        mov.set('produto_nome', item.produto_nome || '')
        mov.set('tipo_movimentacao', 'Transferência')
        mov.set('documento_origem', trfNum)
        mov.set('documento_tipo', 'Transferência')
        mov.set('quantidade', qty)
        mov.set('saldo_anterior', cur)
        mov.set('saldo_atual', ns)
        mov.set(
          'motivo',
          isTransit ? 'Saída transferência ' + trfNum : 'Entrada transferência ' + trfNum,
        )
        mov.set('responsavel', responsible)
        $app.save(mov)
      } catch (_) {}
    }
  } catch (err) {
    $app.logger().error('stock_transfer_complete failed', 'error', String(err))
  }
  return e.next()
}, 'stock_transfers')

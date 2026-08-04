onRecordAfterUpdateSuccess((e) => {
  var receipt = e.record
  var oldStatus = ''
  var newStatus = receipt.getString('status') || ''
  try {
    oldStatus = receipt.original().getString('status') || ''
  } catch (_) {}
  if (oldStatus === newStatus || newStatus !== 'Recebido') return e.next()

  var items = receipt.get('itens')
  if (!items || items.length === 0) return e.next()

  try {
    var taskCol = $app.findCollectionByNameOrId('wms_putaway_tasks')
    var receiptNum = receipt.getString('numero_recebimento') || ''

    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item) continue
      var received = parseInt(item.quantidade_recebida) || 0
      if (received <= 0) continue

      var task = new Record(taskCol)
      task.set('numero_task', 'PUT-' + receiptNum + '-' + (i + 1))
      task.set('receipt_id', receipt.id)
      task.set('produto_id', item.produto_id || '')
      task.set('produto_nome', item.produto_nome || '')
      task.set('produto_codigo', item.produto_codigo || '')
      task.set('quantidade', received)
      task.set('localizacao_origem', 'Recebimento')
      task.set('localizacao_destino', '')
      task.set('lote', item.lote || '')
      task.set('validade', item.validade || '')
      task.set('status', 'Pendente')
      task.set('operador', '')
      task.set('prioridade', 'Normal')
      $app.save(task)
    }
  } catch (err) {
    $app.logger().error('wms_receipt_putaway failed', 'error', String(err))
  }
  return e.next()
}, 'wms_receipts')

onRecordAfterCreateSuccess((e) => {
  var batch = e.record
  var validade = batch.getString('data_validade') || ''
  if (!validade) return e.next()

  var d = new Date(validade)
  if (isNaN(d.getTime())) return e.next()
  var now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)

  if (d.getTime() < now.getTime() && batch.getString('situacao') !== 'Bloqueado') {
    try {
      var record = $app.findRecordById('stock_batches', batch.id)
      record.set('situacao', 'Bloqueado')
      $app.save(record)

      var prodId = batch.getString('produto_id') || ''
      var prodName = batch.getString('produto_nome') || ''
      var lotNum = batch.getString('numero_lote') || ''
      var saCol = $app.findCollectionByNameOrId('stock_alerts')
      var alert = new Record(saCol)
      alert.set('product_id', prodId)
      alert.set('product_name', prodName)
      alert.set('alert_type', 'below_min_stock')
      alert.set('severity', 'critical')
      alert.set('message', 'Lote ' + lotNum + ' vencido e bloqueado automaticamente.')
      alert.set('resolved', false)
      $app.save(alert)
    } catch (err) {
      $app.logger().error('stock_expiry_block failed', 'error', String(err))
    }
  }
  return e.next()
}, 'stock_batches')

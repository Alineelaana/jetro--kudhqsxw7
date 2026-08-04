onRecordAfterUpdateSuccess((e) => {
  var wave = e.record
  var oldStatus = ''
  try {
    oldStatus = wave.original().getString('status') || ''
  } catch (_) {}
  var newStatus = wave.getString('status') || ''
  if (oldStatus === newStatus || newStatus !== 'Liberada') return e.next()

  var items = wave.get('itens')
  if (!items || items.length === 0) return e.next()

  try {
    var sepCol = $app.findCollectionByNameOrId('wms_separations')
    var waveNum = wave.getString('numero_wave') || ''

    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item) continue

      var sep = new Record(sepCol)
      sep.set('numero_separacao', 'SEP-' + waveNum + '-' + (i + 1))
      sep.set('wave_id', wave.id)
      sep.set('pedido', item.pedido || '')
      sep.set('cliente', item.cliente || '')
      sep.set('rota', '')
      sep.set('produto_id', item.produto_id || '')
      sep.set('produto_nome', item.produto_nome || '')
      sep.set('produto_codigo', item.produto_codigo || '')
      sep.set('localizacao', item.localizacao || '')
      sep.set('lote', item.lote || '')
      sep.set('validade', item.validade || '')
      sep.set('quantidade_solicitada', item.quantidade || 0)
      sep.set('quantidade_separada', 0)
      sep.set('operador', '')
      sep.set('prioridade', wave.getString('prioridade') || 'Normal')
      sep.set('estrategia', 'Por Onda')
      sep.set('status', 'Aguardando Separação')
      $app.save(sep)
    }
  } catch (err) {
    $app.logger().error('wms_wave_release failed', 'error', String(err))
  }
  return e.next()
}, 'wms_waves')

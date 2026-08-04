routerAdd(
  'POST',
  '/backend/v1/collector/receiving-check',
  (e) => {
    var body = e.requestInfo().body || {}
    var receiptId = body.receipt_id || ''
    var produtoCodigo = body.produto_codigo || ''
    var lote = body.lote || ''
    var validade = body.validade || ''
    var qtdConferida = parseInt(body.quantidade_conferida) || 0
    var codigoBarras = body.codigo_barras || ''

    if (!receiptId) return e.badRequestError('receipt_id is required')
    if (!produtoCodigo) return e.badRequestError('produto_codigo is required')
    if (qtdConferida < 0) return e.badRequestError('quantidade_conferida must be >= 0')

    try {
      var receipt = $app.findRecordById('wms_receipts', receiptId)
      if (receipt.getString('status') !== 'Em Recebimento') {
        return e.badRequestError('Recebimento nao esta em conferencia')
      }

      var checkCol = $app.findCollectionByNameOrId('wms_receipt_checks')
      var userName = (e.auth && e.auth.getString('name')) || 'Coletor'

      var check = new Record(checkCol)
      check.set('numero_conferencia', 'CR-' + Date.now().toString(36).toUpperCase().slice(-6))
      check.set('receipt_id', receiptId)
      check.set('produto_codigo', produtoCodigo)
      check.set('produto_nome', body.produto_nome || '')
      check.set('codigo_barras', codigoBarras)
      check.set('lote', lote)
      check.set('data_validade', validade)
      check.set('quantidade_esperada', parseInt(body.quantidade_esperada) || 0)
      check.set('quantidade_recebida', qtdConferida)
      check.set('quantidade_conferida', qtdConferida)
      check.set('diferenca', qtdConferida - (parseInt(body.quantidade_esperada) || 0))
      check.set('responsavel', userName)
      check.set(
        'status',
        qtdConferida === parseInt(body.quantidade_esperada) ? 'Conferido' : 'Com Divergencia',
      )
      $app.save(check)

      return e.json(200, { id: check.id, status: check.getString('status') })
    } catch (err) {
      return e.json(400, { error: 'Erro na conferencia: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

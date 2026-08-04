routerAdd(
  'POST',
  '/backend/v1/collector/transfer',
  (e) => {
    var body = e.requestInfo().body || {}
    var produtoId = body.produto_id || ''
    var quantidade = parseInt(body.quantidade) || 0
    var locOrigem = body.localizacao_origem || ''
    var locDestino = body.localizacao_destino || ''
    var lote = body.lote || ''
    var validade = body.validade || ''
    var codigoBarras = body.codigo_barras || ''

    if (!produtoId) return e.badRequestError('produto_id is required')
    if (quantidade <= 0) return e.badRequestError('quantidade must be positive')
    if (!locOrigem) return e.badRequestError('localizacao_origem is required')
    if (!locDestino) return e.badRequestError('localizacao_destino is required')
    if (locOrigem === locDestino) return e.badRequestError('Origem e destino nao podem ser iguais')

    try {
      var prod = $app.findRecordById('products', produtoId)
      if (!prod) return e.badRequestError('Produto nao encontrado')

      if (lote) {
        try {
          var batch = $app.findFirstRecordByFilter(
            'stock_batches',
            "numero_lote = '" + lote + "' && produto_id = '" + produtoId + "'",
          )
          var situacao = batch.getString('situacao') || ''
          if (situacao === 'Bloqueado') return e.badRequestError('Lote bloqueado')
          var valStr = batch.getString('data_validade') || ''
          if (valStr) {
            var valDate = new Date(valStr)
            if (!isNaN(valDate.getTime()) && valDate < new Date()) {
              return e.badRequestError('Produto vencido')
            }
          }
        } catch (_) {}
      }

      var userName = (e.auth && e.auth.getString('name')) || 'Coletor'
      var trfCol = $app.findCollectionByNameOrId('stock_transfers')
      var trf = new Record(trfCol)
      trf.set('numero_transferencia', 'TRF-COL-' + Date.now().toString(36).toUpperCase().slice(-6))
      trf.set('data', new Date().toISOString().split('T')[0])
      trf.set('localizacao_origem', locOrigem)
      trf.set('localizacao_destino', locDestino)
      trf.set('responsavel', userName)
      trf.set('motivo', 'Transferencia via coletor')
      trf.set('status', 'Aprovada')
      trf.set('itens', [
        {
          produto_id: produtoId,
          produto_nome: prod.getString('name') || '',
          lote: lote,
          validade: validade,
          quantidade_transferir: quantidade,
        },
      ])
      trf.set('fiscal_integrado', false)
      $app.save(trf)

      return e.json(200, {
        id: trf.id,
        numero_transferencia: trf.getString('numero_transferencia'),
      })
    } catch (err) {
      return e.json(400, { error: 'Erro na transferencia: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

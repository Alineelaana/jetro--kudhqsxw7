routerAdd(
  'POST',
  '/backend/v1/collector/separation',
  (e) => {
    var body = e.requestInfo().body || {}
    var separationId = body.separation_id || ''
    var qtdSeparada = parseInt(body.quantidade_separada) || 0
    var lote = body.lote || ''
    var localizacao = body.localizacao || ''
    var codigoBarras = body.codigo_barras || ''

    if (!separationId) return e.badRequestError('separation_id is required')
    if (qtdSeparada < 0) return e.badRequestError('quantidade_separada must be >= 0')

    try {
      var sep = $app.findRecordById('wms_separations', separationId)
      if (
        sep.getString('status') !== 'Em Separacao' &&
        sep.getString('status') !== 'Aguardando Separação'
      ) {
        return e.badRequestError('Separacao nao esta disponivel')
      }

      var qtdSolicitada = sep.getInt('quantidade_solicitada') || 0
      if (qtdSeparada > qtdSolicitada) {
        return e.badRequestError('Quantidade separada maior que solicitada: ' + qtdSolicitada)
      }

      if (lote) {
        try {
          var batch = $app.findFirstRecordByFilter(
            'stock_batches',
            "numero_lote = '" + lote + "' && produto_id = '" + sep.getString('produto_id') + "'",
          )
          var situacao = batch.getString('situacao') || ''
          if (situacao === 'Bloqueado') return e.badRequestError('Lote bloqueado: ' + lote)
          var valStr = batch.getString('data_validade') || ''
          if (valStr) {
            var valDate = new Date(valStr)
            if (!isNaN(valDate.getTime()) && valDate < new Date()) {
              return e.badRequestError('Produto vencido - lote: ' + lote)
            }
          }
        } catch (_) {}
      }

      var userName = (e.auth && e.auth.getString('name')) || 'Coletor'
      sep.set('quantidade_separada', qtdSeparada)
      sep.set('lote', lote)
      sep.set('localizacao', localizacao)
      sep.set('operador', userName)
      sep.set(
        'status',
        qtdSeparada === qtdSolicitada ? 'Separada' : qtdSeparada > 0 ? 'Com Falta' : 'Em Separacao',
      )
      $app.save(sep)

      if (sep.getString('status') === 'Separada') {
        var ecCol = $app.findCollectionByNameOrId('wms_expedition_checks')
        var ec = new Record(ecCol)
        ec.set('numero_conferencia', 'CE-' + Date.now().toString(36).toUpperCase().slice(-6))
        ec.set('pedido', sep.getString('pedido') || '')
        ec.set('cliente', sep.getString('cliente') || '')
        ec.set('produto_id', sep.getString('produto_id') || '')
        ec.set('produto_nome', sep.getString('produto_nome') || '')
        ec.set('lote', lote)
        ec.set('quantidade_separada', qtdSeparada)
        ec.set('quantidade_conferida', 0)
        ec.set('diferenca', 0)
        ec.set('responsavel', userName)
        ec.set('status', 'Aguardando Conferência')
        $app.save(ec)
      }

      return e.json(200, { id: sep.id, status: sep.getString('status') })
    } catch (err) {
      return e.json(400, { error: 'Erro na separacao: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

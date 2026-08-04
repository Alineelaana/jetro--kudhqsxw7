onRecordUpdate((e) => {
  var ship = e.record
  var oldStatus = ''
  try {
    oldStatus = ship.original().getString('status') || ''
  } catch (_) {}
  var newStatus = ship.getString('status') || ''
  if (oldStatus === newStatus || newStatus !== 'Liberada') {
    e.next()
    return
  }

  var errors = {}

  if (!ship.getString('nota_fiscal')) {
    errors.nota_fiscal = 'Nota fiscal não autorizada — expedicao nao pode ser liberada'
  }

  try {
    var divergences = $app.findRecordsByFilter(
      'wms_expedition_checks',
      "status = 'Com Divergencia'",
      '-created',
      50,
      0,
    )
    if (divergences.length > 0) {
      var hasUnresolved = false
      for (var d = 0; d < divergences.length; d++) {
        if (divergences[d].getString('pedido') === ship.getString('pedido')) {
          hasUnresolved = true
          break
        }
      }
      if (hasUnresolved) {
        errors.divergencia = 'Existem divergencias nao resolvidas na conferencia de expedicao'
      }
    }
  } catch (_) {}

  try {
    var seps = $app.findRecordsByFilter(
      'wms_separations',
      "status = 'Com Divergencia' || status = 'Aguardando Separacao'",
      '-created',
      50,
      0,
    )
    for (var s = 0; s < seps.length; s++) {
      if (seps[s].getString('pedido') === ship.getString('pedido')) {
        errors.separacao = 'Existem separacoes pendentes ou com divergencia para este pedido'
        break
      }
    }
  } catch (_) {}

  try {
    var batches = $app.findRecordsByFilter(
      'stock_batches',
      "situacao = 'Bloqueado'",
      '-created',
      100,
      0,
    )
    for (var b = 0; b < batches.length; b++) {
      var valStr = batches[b].getString('data_validade') || ''
      if (valStr) {
        var valDate = new Date(valStr)
        if (!isNaN(valDate.getTime()) && valDate < new Date()) {
          errors.produto = 'Produto vencido ou lote bloqueado detectado'
          break
        }
      }
    }
  } catch (_) {}

  var keys = Object.keys(errors)
  if (keys.length > 0) {
    throw new BadRequestError('Expedicao bloqueada: ' + errors[keys[0]], errors)
  }

  e.next()
}, 'wms_shippings')

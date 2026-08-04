routerAdd(
  'POST',
  '/backend/v1/wms/alerts/scan',
  (e) => {
    var created = 0
    var alertCol = $app.findCollectionByNameOrId('wms_operational_alerts')

    function createAlert(tipo, severidade, produtoId, produtoNome, mensagem) {
      var existing = $app.findRecordsByFilter(
        'wms_operational_alerts',
        "tipo = '" + tipo + "' && produto_id = '" + produtoId + "' && resolved = false",
        '-created',
        1,
        0,
      )
      if (existing && existing.length > 0) return
      var alert = new Record(alertCol)
      alert.set('tipo', tipo)
      alert.set('severidade', severidade)
      alert.set('produto_id', produtoId || '')
      alert.set('produto_nome', produtoNome || '')
      alert.set('mensagem', mensagem)
      alert.set('resolved', false)
      $app.save(alert)
      created++
    }

    try {
      var receipts = $app.findRecordsByFilter(
        'wms_receipts',
        "status = 'Pendente'",
        '-created',
        50,
        0,
      )
      for (var i = 0; i < receipts.length; i++) {
        var r = receipts[i]
        var prev = r.getString('data_prevista')
        if (prev) {
          var d = new Date(prev)
          if (d < new Date()) {
            createAlert(
              'receipt_delayed',
              'warning',
              '',
              r.getString('fornecedor'),
              'Recebimento ' + r.getString('numero_recebimento') + ' atrasado',
            )
          }
        }
      }
    } catch (_) {}

    try {
      var tasks = $app.findRecordsByFilter(
        'wms_putaway_tasks',
        "status = 'Pendente'",
        '-created',
        50,
        0,
      )
      for (var j = 0; j < tasks.length; j++) {
        var t = tasks[j]
        createAlert(
          'putaway_pending',
          'info',
          t.getString('produto_id'),
          t.getString('produto_nome'),
          'Produto aguardando enderecamento: ' + t.getString('numero_task'),
        )
      }
    } catch (_) {}

    try {
      var checks = $app.findRecordsByFilter(
        'wms_receipt_checks',
        "status = 'Com Divergencia'",
        '-created',
        50,
        0,
      )
      for (var k = 0; k < checks.length; k++) {
        var c = checks[k]
        createAlert(
          'receiving_divergence',
          'critical',
          c.getString('produto_id'),
          c.getString('produto_nome'),
          'Divergencia no recebimento: ' + c.getString('numero_conferencia'),
        )
      }
    } catch (_) {}

    try {
      var expChecks = $app.findRecordsByFilter(
        'wms_expedition_checks',
        "status = 'Com Divergencia'",
        '-created',
        50,
        0,
      )
      for (var m = 0; m < expChecks.length; m++) {
        var ec = expChecks[m]
        createAlert(
          'expedition_divergence',
          'critical',
          ec.getString('produto_id'),
          ec.getString('produto_nome'),
          'Divergencia na expedicao: ' + ec.getString('numero_conferencia'),
        )
      }
    } catch (_) {}

    try {
      var seps = $app.findRecordsByFilter(
        'wms_separations',
        "status = 'Aguardando Separacao' && prioridade = 'Urgente'",
        '-created',
        50,
        0,
      )
      for (var n = 0; n < seps.length; n++) {
        var s = seps[n]
        createAlert(
          'separation_delayed',
          'warning',
          s.getString('produto_id'),
          s.getString('produto_nome'),
          'Separacao urgente pendente: ' + s.getString('numero_separacao'),
        )
      }
    } catch (_) {}

    return e.json(200, { created: created })
  },
  $apis.requireAuth(),
)

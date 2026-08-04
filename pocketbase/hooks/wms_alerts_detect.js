routerAdd(
  'POST',
  '/backend/v1/wms/alerts/scan',
  (e) => {
    var created = 0
    var alertCol = $app.findCollectionByNameOrId('wms_operational_alerts')

    function createAlert(tipo, severidade, produtoId, produtoNome, mensagem, responsavel) {
      try {
        var existing = $app.findRecordsByFilter(
          'wms_operational_alerts',
          "tipo = '" + tipo + "' && produto_id = '" + produtoId + "' && resolved = false",
          '-created',
          1,
          0,
        )
        if (existing && existing.length > 0) return
      } catch (_) {}
      var alert = new Record(alertCol)
      alert.set('tipo', tipo)
      alert.set('severidade', severidade)
      alert.set('produto_id', produtoId || '')
      alert.set('produto_nome', produtoNome || '')
      alert.set('mensagem', mensagem)
      alert.set('responsavel', responsavel || '')
      alert.set('resolved', false)
      alert.set('read', false)
      $app.save(alert)
      created++
    }

    function fmtDate(ms) {
      return new Date(Date.now() - ms).toISOString().replace('T', ' ').substring(0, 19)
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
              r.getString('responsavel'),
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
          t.getString('operador'),
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
          c.getString('responsavel'),
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
          ec.getString('responsavel'),
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
          s.getString('operador'),
        )
      }
    } catch (_) {}

    try {
      var batches = $app.findRecordsByFilter('stock_batches', '', '-created', 100, 0)
      var now = new Date()
      var sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      for (var b = 0; b < batches.length; b++) {
        var batch = batches[b]
        var valStr = batch.getString('validity') || batch.getString('validade')
        if (!valStr) continue
        var valDate = new Date(valStr)
        if (isNaN(valDate.getTime())) continue
        var situacao = batch.getString('situacao') || batch.getString('situation') || ''
        if (situacao === 'Bloqueado' || situacao === 'Blocked') {
          createAlert(
            'lot_blocked',
            'critical',
            batch.getString('product_id') || batch.getString('produto_id'),
            batch.getString('product_name') || batch.getString('produto_nome'),
            'Lote bloqueado: ' + (batch.getString('lot') || batch.getString('lote') || ''),
            '',
          )
        }
        if (valDate < now) {
          createAlert(
            'product_expired',
            'critical',
            batch.getString('product_id') || batch.getString('produto_id'),
            batch.getString('product_name') || batch.getString('produto_nome'),
            'Produto vencido - Lote: ' +
              (batch.getString('lot') || batch.getString('lote') || '') +
              ' Validade: ' +
              valStr,
            '',
          )
        } else if (valDate <= sevenDays) {
          createAlert(
            'product_expiring',
            'warning',
            batch.getString('product_id') || batch.getString('produto_id'),
            batch.getString('product_name') || batch.getString('produto_nome'),
            'Produto proximo do vencimento - Lote: ' +
              (batch.getString('lot') || batch.getString('lote') || '') +
              ' Validade: ' +
              valStr,
            '',
          )
        }
      }
    } catch (_) {}

    try {
      var invs = $app.findRecordsByFilter(
        'stock_inventories',
        "status != 'Finalizado' && status != 'Cancelado'",
        '-created',
        50,
        0,
      )
      for (var inv = 0; inv < invs.length; inv++) {
        var invRec = invs[inv]
        createAlert(
          'inventory_pending',
          'info',
          '',
          '',
          'Inventario pendente: ' +
            (invRec.getString('type') || invRec.getString('tipo') || invRec.id),
          invRec.getString('responsible') || invRec.getString('responsavel'),
        )
      }
    } catch (_) {}

    try {
      var stuckTasks = $app.findRecordsByFilter(
        'wms_putaway_tasks',
        "status = 'Em Andamento'",
        '-created',
        50,
        0,
      )
      for (var st = 0; st < stuckTasks.length; st++) {
        var stuckTask = stuckTasks[st]
        var taskCreated = stuckTask.getDateTime('created')
        if (taskCreated) {
          var taskDate = new Date(taskCreated.string())
          if (now.getTime() - taskDate.getTime() > 24 * 60 * 60 * 1000) {
            createAlert(
              'task_stopped',
              'warning',
              stuckTask.getString('produto_id'),
              stuckTask.getString('produto_nome'),
              'Tarefa parada ha mais de 24h: ' + stuckTask.getString('numero_task'),
              stuckTask.getString('operador'),
            )
          }
        }
      }
    } catch (_) {}

    try {
      var collectors = $app.findRecordsByFilter(
        'wms_collectors',
        "status = 'Em Uso'",
        '-created',
        50,
        0,
      )
      for (var col = 0; col < collectors.length; col++) {
        var coll = collectors[col]
        var lastComm = coll.getString('ultima_comunicacao')
        if (lastComm) {
          var commDate = new Date(lastComm)
          if (
            !isNaN(commDate.getTime()) &&
            now.getTime() - commDate.getTime() > 2 * 60 * 60 * 1000
          ) {
            createAlert(
              'collector_offline',
              'warning',
              '',
              coll.getString('codigo_equipamento'),
              'Coletor sem comunicacao ha mais de 2h: ' + coll.getString('codigo_equipamento'),
              coll.getString('operador_atual'),
            )
          }
        }
      }
    } catch (_) {}

    try {
      var locs = $app.findRecordsByFilter('stock_locations', '', '-created', 100, 0)
      for (var loc = 0; loc < locs.length; loc++) {
        var locRec = locs[loc]
        var occupied = locRec.getBool('occupied')
        var capacity = locRec.getNumber('capacity')
        var used = locRec.getNumber('used')
        if (capacity > 0 && used >= capacity) {
          createAlert(
            'location_full',
            'warning',
            '',
            locRec.getString('name') || locRec.getString('codigo'),
            'Localizacao lotada: ' + (locRec.getString('name') || locRec.getString('codigo') || ''),
            '',
          )
        }
      }
    } catch (_) {}

    try {
      var pickings = $app.findRecordsByFilter(
        'stock_pickings',
        "status != 'Concluido' && status != 'Cancelado'",
        '-created',
        50,
        0,
      )
      for (var pk = 0; pk < pickings.length; pk++) {
        var pkRec = pickings[pk]
        var pkQty = pkRec.getNumber('quantity') || pkRec.getNumber('quantidade') || 0
        var pkMin = pkRec.getNumber('min_quantity') || pkRec.getNumber('min_quantity') || 0
        if (pkMin > 0 && pkQty < pkMin) {
          createAlert(
            'picking_below_min',
            'warning',
            pkRec.getString('product_id') || pkRec.getString('produto_id'),
            pkRec.getString('product_name') || pkRec.getString('produto_nome'),
            'Picking abaixo do minimo: ' +
              (pkRec.getString('product_name') || pkRec.getString('produto_nome') || ''),
            '',
          )
        }
      }
    } catch (_) {}

    return e.json(200, { created: created })
  },
  $apis.requireAuth(),
)

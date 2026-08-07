routerAdd(
  'POST',
  '/backend/v1/industrial/phase/cost-feed',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''
      if (role !== 'SUP' && role !== 'FINANCEIRO' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP, FINANCEIRO or PADRAO can feed costs')

      var phaseId = body.phase_id || ''
      if (!phaseId) return e.badRequestError('phase_id required')
      var phase = $app.findRecordById('industrial_phases', phaseId)
      var orderId = phase.getString('production_order_id') || ''
      var resourceId = phase.getString('resource_id') || ''

      var apontamentos = []
      try {
        var f = 'production_order_id = "' + orderId + '"'
        if (resourceId) f += ' && resource_id = "' + resourceId + '"'
        apontamentos = $app.findRecordsByFilter('industrial_apontamentos', f, '-created', 500, 0)
      } catch (_) {}

      var costMap = { labor: 0, machine: 0, energy: 0, losses: 0, reworks: 0 }
      var producedQty = 0
      for (var i = 0; i < apontamentos.length; i++) {
        var a = apontamentos[i]
        var t = a.getString('type') || ''
        var dur = a.getFloat('duration_minutes') || 0
        if (t === 'producao') {
          costMap.labor += dur * 0.5
          costMap.machine += dur * 0.3
          costMap.energy += dur * 0.1
          producedQty += a.getFloat('quantity_produced') || 0
        }
        if (t === 'refugo' || t === 'perda') {
          costMap.losses += (a.getFloat('quantity_rejected') || 0) * 2.5
        }
        if (t === 'rework') {
          costMap.reworks += dur * 0.7
        }
      }

      var pcCol = $app.findCollectionByNameOrId('industrial_phase_costs')
      var totalCost = 0
      var costKeys = Object.keys(costMap)
      for (var c = 0; c < costKeys.length; c++) {
        var ct = costKeys[c]
        var amt = costMap[ct]
        if (amt <= 0) continue
        totalCost += amt
        var pc = new Record(pcCol)
        pc.set('phase_id', phaseId)
        pc.set('cost_type', ct)
        pc.set('amount', amt.toFixed(2))
        pc.set('description', 'Auto-calculated from apontamentos')
        pc.set('responsible', authUser.getString('name') || authUser.email)
        $app.save(pc)
      }

      phase.set(
        'cost_summary',
        JSON.stringify({
          total: totalCost.toFixed(2),
          produced: producedQty,
          unit_cost: producedQty > 0 ? (totalCost / producedQty).toFixed(2) : '0',
        }),
      )
      $app.save(phase)

      if (totalCost > 0) {
        try {
          var fmCol = $app.findCollectionByNameOrId('financial_movements')
          var order = $app.findRecordById('production_orders', orderId)
          var fm = new Record(fmCol)
          fm.set('data_hora', new Date().toISOString())
          fm.set('tipo_movimentacao', 'Ajuste')
          fm.set('documento', 'Fase-' + phase.getString('operation_name'))
          fm.set('cliente_fornecedor', 'Industrial')
          fm.set('conta', 'Custos Industriais')
          fm.set('saida', totalCost.toFixed(2))
          fm.set('centro_custo', 'Producao')
          fm.set(
            'observacoes',
            'Custos fase ' +
              phase.getString('operation_name') +
              ' OP ' +
              order.getString('order_number'),
          )
          $app.save(fm)
        } catch (_) {}
      }

      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', 'phase_cost_feed')
        log.set('module', 'industrial')
        log.set('target_collection', 'industrial_phases')
        log.set('target_id', phaseId)
        log.set('target_summary', 'Total: ' + totalCost.toFixed(2))
        $app.save(log)
      } catch (_) {}

      return e.json(200, {
        phase_id: phaseId,
        total_cost: totalCost.toFixed(2),
        produced_quantity: producedQty,
        costs: costMap,
      })
    } catch (err) {
      $app.logger().error('Phase cost feed failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao alimentar custos da fase' })
    }
  },
  $apis.requireAuth(),
)

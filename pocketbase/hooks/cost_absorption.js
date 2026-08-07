routerAdd(
  'POST',
  '/backend/v1/industrial/cost/absorb',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''
      if (role !== 'SUP' && role !== 'FINANCEIRO')
        return e.forbiddenError('Only SUP or FINANCEIRO can absorb costs')

      var orderId = body.order_id || ''
      if (!orderId) return e.badRequestError('order_id required')

      var order = $app.findRecordById('production_orders', orderId)
      var productId = order.getString('product_id') || ''

      var apontamentos = []
      try {
        apontamentos = $app.findRecordsByFilter(
          'industrial_apontamentos',
          'production_order_id = "' + orderId + '"',
          '-created',
          500,
          0,
        )
      } catch (_) {}

      var totalProduced = 0
      var totalRejected = 0
      var totalSetupMinutes = 0
      var totalOperationMinutes = 0
      var stoppageMinutes = 0

      for (var i = 0; i < apontamentos.length; i++) {
        var a = apontamentos[i]
        var type = a.getString('type') || ''
        if (type === 'producao') totalProduced += a.getFloat('quantity_produced') || 0
        if (type === 'refugo' || type === 'perda')
          totalRejected += a.getFloat('quantity_rejected') || 0
        if (type === 'parada' || type === 'manutencao')
          stoppageMinutes += a.getFloat('duration_minutes') || 0
        if (type === 'inicio' || type === 'fim') {
          var dur = a.getFloat('duration_minutes') || 0
          totalOperationMinutes += dur
        }
      }

      var standardCost = null
      try {
        var costs = $app.findRecordsByFilter(
          'industrial_costs',
          'item_id = "' + productId + '" && cost_type = "padrao"',
          '-version',
          1,
          0,
        )
        if (costs.length > 0) standardCost = costs[0]
      } catch (_) {}

      var standardTotal = 0
      var standardUnit = 0
      if (standardCost) {
        standardTotal = parseFloat(standardCost.getString('total_cost') || '0')
        standardUnit = parseFloat(standardCost.getString('unit_cost') || '0')
      }

      var actualUnitCost = totalProduced > 0 ? standardTotal / totalProduced : 0
      var deviation = actualUnitCost - standardUnit
      var deviationPercent = standardUnit > 0 ? (deviation / standardUnit) * 100 : 0

      var result = {
        order_id: orderId,
        total_produced: totalProduced,
        total_rejected: totalRejected,
        operation_minutes: totalOperationMinutes,
        stoppage_minutes: stoppageMinutes,
        standard_total_cost: standardTotal,
        standard_unit_cost: standardUnit,
        actual_unit_cost: actualUnitCost,
        deviation: deviation,
        deviation_percent: deviationPercent,
        wip_value: totalProduced > 0 ? standardTotal * (totalProduced / 1000) : 0,
      }

      try {
        var fmCol = $app.findCollectionByNameOrId('financial_movements')
        var fm = new Record(fmCol)
        fm.set('data_hora', new Date().toISOString())
        fm.set('tipo_movimentacao', 'Ajuste')
        fm.set('documento', 'OP-' + order.getString('order_number'))
        fm.set('cliente_fornecedor', 'Industrial')
        fm.set('conta', 'Custos Industriais')
        fm.set('saida', String(standardTotal.toFixed(2)))
        fm.set('centro_custo', 'Producao')
        fm.set('observacoes', 'Absorcao de custos OP ' + order.getString('order_number'))
        $app.save(fm)
      } catch (_) {}

      return e.json(200, result)
    } catch (err) {
      $app.logger().error('Cost absorption failed', 'error', String(err))
      return e.json(500, { error: 'Falha na absorcao de custos' })
    }
  },
  $apis.requireAuth(),
)

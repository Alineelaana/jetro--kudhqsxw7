routerAdd(
  'POST',
  '/backend/v1/industrial/demand-to-order',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''
      if (role !== 'SUP' && role !== 'PADRAO' && role !== 'COMERCIAL')
        return e.forbiddenError('Insufficient permissions')

      var demandId = body.demand_id || ''
      if (!demandId) return e.badRequestError('demand_id required')
      var demand = $app.findRecordById('industrial_demand', demandId)
      if (demand.getString('status') === 'fulfilled')
        return e.badRequestError('Demand already fulfilled')

      var counter = null
      try {
        counter = $app.findFirstRecordByData('settings', 'key', 'production_order_sequence')
      } catch (_) {}
      var nextNum = 1
      var sCol = $app.findCollectionByNameOrId('settings')
      if (counter) {
        nextNum = parseInt(counter.getString('value') || '0', 10) + 1
        counter.set('value', String(nextNum))
        $app.save(counter)
      } else {
        var sr = new Record(sCol)
        sr.set('key', 'production_order_sequence')
        sr.set('value', '1')
        $app.save(sr)
      }
      var yr = new Date().getFullYear()
      var seqStr = String(nextNum)
      while (seqStr.length < 4) seqStr = '0' + seqStr
      var orderNumber = 'OP-' + yr + '-' + seqStr

      var poCol = $app.findCollectionByNameOrId('production_orders')
      var order = new Record(poCol)
      order.set('order_number', orderNumber)
      order.set('status', 'rascunho')
      order.set('product_id', demand.getString('product_id') || '')
      order.set('quantity', String(demand.getFloat('quantity') || 0))
      order.set('unit', demand.getString('unit') || '')
      order.set('start_date', new Date().toISOString().split('T')[0])
      order.set('end_date', demand.getString('due_date') || '')
      order.set('responsible', authUser.getString('name') || authUser.email)
      order.set('production_scenario', demand.getString('scenario') || 'made_to_order')
      order.set('demand_id', demandId)
      $app.save(order)

      demand.set('status', 'planned')
      demand.set('production_order_id', order.id)
      $app.save(demand)

      try {
        var productId = demand.getString('product_id') || ''
        var routes = $app.findRecordsByFilter(
          'production_routes',
          'product_id = "' + productId + '" && status = "ativo"',
          '-version',
          1,
          0,
        )
        if (routes.length > 0) {
          var ops = $app.findRecordsByFilter(
            'production_route_operations',
            'route_id = "' + routes[0].id + '"',
            'order',
            50,
            0,
          )
          var phCol = $app.findCollectionByNameOrId('industrial_phases')
          for (var i = 0; i < ops.length; i++) {
            var op = ops[i]
            var ph = new Record(phCol)
            ph.set('production_order_id', order.id)
            ph.set('sequence', i + 1)
            ph.set('operation_name', op.getString('name') || 'Operacao ' + (i + 1))
            ph.set('resource_id', op.getString('resource_id') || '')
            ph.set(
              'expected_time_minutes',
              parseFloat(op.getString('tempo_operacao') || '0') *
                (demand.getFloat('quantity') || 1),
            )
            ph.set('setup_time_minutes', parseFloat(op.getString('tempo_setup') || '0'))
            ph.set('status', 'pending')
            ph.set('quality_status', 'pending')
            ph.set('responsible', authUser.getString('name') || authUser.email)
            $app.save(ph)
          }
        } else {
          var phCol2 = $app.findCollectionByNameOrId('industrial_phases')
          var defPh = new Record(phCol2)
          defPh.set('production_order_id', order.id)
          defPh.set('sequence', 1)
          defPh.set('operation_name', 'Producao')
          defPh.set('status', 'pending')
          defPh.set('quality_status', 'pending')
          defPh.set('responsible', authUser.getString('name') || authUser.email)
          $app.save(defPh)
        }
      } catch (_) {}

      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', 'demand_to_order')
        log.set('module', 'industrial')
        log.set('target_collection', 'production_orders')
        log.set('target_id', order.id)
        log.set('target_summary', orderNumber + ' from demand ' + demand.getString('demand_number'))
        $app.save(log)
      } catch (_) {}

      return e.json(200, { order_id: order.id, order_number: orderNumber, demand_id: demandId })
    } catch (err) {
      $app.logger().error('Demand to order failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao converter demanda em ordem' })
    }
  },
  $apis.requireAuth(),
)

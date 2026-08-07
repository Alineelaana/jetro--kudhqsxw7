routerAdd(
  'GET',
  '/backend/v1/industrial/aps/schedule',
  (e) => {
    try {
      var query = e.requestInfo().query || {}
      var resourceId = query.resource_id || ''

      var orders = []
      try {
        orders = $app.findRecordsByFilter(
          'production_orders',
          'status = "liberada" || status = "planejada"',
          '-created',
          100,
          0,
        )
      } catch (_) {}

      var existingSchedules = []
      try {
        var schedFilter = 'status != "cancelado" && status != "concluido"'
        if (resourceId) schedFilter = 'resource_id = "' + resourceId + '" && ' + schedFilter
        existingSchedules = $app.findRecordsByFilter(
          'aps_schedules',
          schedFilter,
          'scheduled_start',
          500,
          0,
        )
      } catch (_) {}

      var resourceSlots = {}
      for (var s = 0; s < existingSchedules.length; s++) {
        var sch = existingSchedules[s]
        var rid = sch.getString('resource_id') || ''
        if (!resourceSlots[rid]) resourceSlots[rid] = []
        resourceSlots[rid].push({
          start: sch.getString('scheduled_start'),
          end: sch.getString('scheduled_end'),
          duration: sch.getFloat('duration_minutes') || 0,
        })
      }

      var resources = []
      try {
        var resFilter = 'active = true'
        if (resourceId) resFilter = 'id = "' + resourceId + '"'
        resources = $app.findRecordsByFilter('production_resources', resFilter, 'name', 50, 0)
      } catch (_) {}

      var suggestions = []
      var now = new Date()

      for (var i = 0; i < orders.length; i++) {
        var order = orders[i]
        var productId = order.getString('product_id') || ''
        var qty = parseFloat(order.getString('quantity') || '0')

        var route = null
        try {
          var routes = $app.findRecordsByFilter(
            'production_routes',
            'product_id = "' + productId + '" && status = "ativo"',
            '-version',
            1,
            0,
          )
          if (routes.length > 0) route = routes[0]
        } catch (_) {}

        var operations = []
        if (route) {
          try {
            operations = $app.findRecordsByFilter(
              'production_route_operations',
              'route_id = "' + route.id + '"',
              'order',
              50,
              0,
            )
          } catch (_) {}
        }

        var totalMinutes = 0
        var opSequence = []
        for (var j = 0; j < operations.length; j++) {
          var op = operations[j]
          var setupMin = parseFloat(op.getString('tempo_setup') || '0')
          var opMin = parseFloat(op.getString('tempo_operacao') || '0')
          var duration = setupMin + opMin * qty
          totalMinutes += duration

          var resId = op.getString('resource_id') || ''
          var resName = ''
          try {
            var res = $app.findRecordById('production_resources', resId)
            resName = res.getString('name') || ''
          } catch (_) {}

          opSequence.push({
            operation: op.getString('name') || '',
            resource_id: resId,
            resource_name: resName,
            duration_minutes: Math.round(duration),
            sequence: j + 1,
          })
        }

        suggestions.push({
          order_id: order.id,
          order_number: order.getString('order_number') || '',
          product_id: productId,
          quantity: qty,
          total_duration_minutes: Math.round(totalMinutes),
          operations: opSequence,
          suggested_start: now.toISOString(),
        })

        now = new Date(now.getTime() + totalMinutes * 60000)
      }

      return e.json(200, {
        total_orders: suggestions.length,
        resources_available: resources.length,
        suggestions: suggestions,
      })
    } catch (err) {
      $app.logger().error('APS schedule failed', 'error', String(err))
      return e.json(500, { error: 'Falha no APS' })
    }
  },
  $apis.requireAuth(),
)

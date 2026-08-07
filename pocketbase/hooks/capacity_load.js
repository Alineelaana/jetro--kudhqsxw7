routerAdd(
  'GET',
  '/backend/v1/industrial/capacity/load',
  (e) => {
    try {
      var query = e.requestInfo().query || {}
      var period = query.period || new Date().toISOString().substring(0, 7)

      var resources = []
      try {
        resources = $app.findRecordsByFilter(
          'production_resources',
          'active = true',
          'name',
          100,
          0,
        )
      } catch (_) {}

      var schedules = []
      try {
        schedules = $app.findRecordsByFilter(
          'aps_schedules',
          'status != "cancelado"',
          'scheduled_start',
          500,
          0,
        )
      } catch (_) {}

      var result = []

      for (var i = 0; i < resources.length; i++) {
        var res = resources[i]
        var resId = res.id
        var capacityPerHour = res.getFloat('capacity_per_hour') || 0
        var availableHours = capacityPerHour * 22 * 7.5

        var committedMinutes = 0
        var scheduledOps = []

        for (var j = 0; j < schedules.length; j++) {
          var sch = schedules[j]
          if (sch.getString('resource_id') === resId) {
            committedMinutes += sch.getFloat('duration_minutes') || 0
            scheduledOps.push({
              order_id: sch.getString('production_order_id'),
              operation: sch.getString('operation_name'),
              start: sch.getString('scheduled_start'),
              end: sch.getString('scheduled_end'),
              duration: sch.getFloat('duration_minutes') || 0,
              status: sch.getString('status'),
            })
          }
        }

        var committedHours = committedMinutes / 60
        var utilization = availableHours > 0 ? (committedHours / availableHours) * 100 : 0
        var isBottleneck = utilization > 85

        result.push({
          resource_id: resId,
          resource_name: res.getString('name') || '',
          resource_type: res.getString('tipo') || '',
          available_hours: Math.round(availableHours * 100) / 100,
          committed_hours: Math.round(committedHours * 100) / 100,
          utilization: Math.round(utilization * 100) / 100,
          is_bottleneck: isBottleneck,
          scheduled_operations: scheduledOps.length,
          operations: scheduledOps.slice(0, 10),
        })
      }

      result.sort(function (a, b) {
        return b.utilization - a.utilization
      })

      return e.json(200, {
        period: period,
        total_resources: result.length,
        bottlenecks: result.filter(function (r) {
          return r.is_bottleneck
        }).length,
        resources: result,
      })
    } catch (err) {
      $app.logger().error('Capacity load failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao calcular carga de capacidade' })
    }
  },
  $apis.requireAuth(),
)

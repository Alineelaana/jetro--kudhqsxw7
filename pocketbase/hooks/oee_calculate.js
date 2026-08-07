routerAdd(
  'GET',
  '/backend/v1/industrial/oee/calculate',
  (e) => {
    try {
      var query = e.requestInfo().query || {}
      var resourceId = query.resource_id || ''
      var period = query.period || ''

      var apontamentos = []
      try {
        var filter = ''
        if (resourceId) filter = 'resource_id = "' + resourceId + '"'
        if (period) {
          if (filter) filter += ' && '
          filter += 'created >= "' + period + '-01 00:00:00"'
        }
        apontamentos = $app.findRecordsByFilter(
          'industrial_apontamentos',
          filter || '',
          '-created',
          500,
          0,
        )
      } catch (_) {}

      var plannedTime = 0
      var runTime = 0
      var totalProduced = 0
      var totalRejected = 0
      var setupMinutes = 0
      var stoppageMinutes = 0
      var stoppageCount = 0
      var maintenanceMinutes = 0
      var maintenanceCount = 0

      for (var i = 0; i < apontamentos.length; i++) {
        var a = apontamentos[i]
        var type = a.getString('type') || ''
        var dur = a.getFloat('duration_minutes') || 0

        if (type === 'inicio') plannedTime += dur
        if (type === 'producao') {
          runTime += dur
          totalProduced += a.getFloat('quantity_produced') || 0
        }
        if (type === 'refugo' || type === 'perda')
          totalRejected += a.getFloat('quantity_rejected') || 0
        if (type === 'pausa' || type === 'parada') {
          stoppageMinutes += dur
          stoppageCount++
        }
        if (type === 'manutencao') {
          maintenanceMinutes += dur
          maintenanceCount++
        }
      }

      var downtime = stoppageMinutes + maintenanceMinutes
      var availability = plannedTime > 0 ? ((plannedTime - downtime) / plannedTime) * 100 : 0
      var performance =
        runTime > 0 && plannedTime > 0 ? (runTime / (plannedTime - downtime)) * 100 : 0
      var qualityRate =
        totalProduced + totalRejected > 0
          ? (totalProduced / (totalProduced + totalRejected)) * 100
          : 100
      var oee = (availability * performance * qualityRate) / 10000

      var mtbf = stoppageCount > 0 ? (plannedTime - downtime) / stoppageCount : 0
      var mttr = stoppageCount > 0 ? stoppageMinutes / stoppageCount : 0

      var result = {
        resource_id: resourceId,
        period: period,
        oee: Math.round(oee * 100) / 100,
        availability: Math.round(availability * 100) / 100,
        performance: Math.round(performance * 100) / 100,
        quality_rate: Math.round(qualityRate * 100) / 100,
        mtbf_hours: Math.round((mtbf / 60) * 100) / 100,
        mttr_hours: Math.round((mttr / 60) * 100) / 100,
        planned_time_minutes: plannedTime,
        run_time_minutes: runTime,
        downtime_minutes: downtime,
        total_produced: totalProduced,
        total_rejected: totalRejected,
        stoppage_count: stoppageCount,
        maintenance_count: maintenanceCount,
        setup_time_minutes: setupMinutes,
        efficiency: Math.round(oee * 100) / 100,
        bottleneck: downtime > plannedTime * 0.2,
      }

      return e.json(200, result)
    } catch (err) {
      $app.logger().error('OEE calculation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao calcular OEE' })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/platform/monitoring/health',
  (e) => {
    var result = {
      timestamp: new Date().toISOString(),
      services: {},
      summary: { total: 0, healthy: 0, degraded: 0, down: 0, unknown: 0 },
    }

    try {
      var entries = $app.findRecordsByFilter('platform_monitoring', '', 'service_type', 200, 0)
      result.summary.total = entries.length
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i]
        var status = entry.getString('status')
        var name = entry.getString('service_name')
        var type = entry.getString('service_type')
        result.services[name] = {
          type: type,
          status: status,
          last_run: entry.getString('last_run_at'),
          errors: entry.getInt('error_count'),
          successes: entry.getInt('success_count'),
        }
        if (status === 'healthy') result.summary.healthy++
        else if (status === 'degraded') result.summary.degraded++
        else if (status === 'down') result.summary.down++
        else result.summary.unknown++
      }
    } catch (err) {
      $app.logger().error('monitoring health check failed', 'error', String(err))
    }

    return e.json(200, result)
  },
  $apis.requireAuth(),
)

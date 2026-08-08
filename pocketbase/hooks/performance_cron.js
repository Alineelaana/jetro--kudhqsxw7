onServe((e) => {
  e.next()

  cronAdd('performance_compute_cron', '0 2 * * *', () => {
    try {
      var baseUrl = $secrets.get('PB_INSTANCE_URL') || ''
      if (!baseUrl) return
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)
      var token = $secrets.get('PB_SUPERUSER_TOKEN') || ''
      if (!token) return

      var endpoints = [
        '/backend/v1/performance/compute',
        '/backend/v1/performance/ai-analyze',
        '/backend/v1/performance/predict',
      ]
      for (var i = 0; i < endpoints.length; i++) {
        try {
          var res = $http.send({
            url: baseUrl + endpoints[i],
            method: 'POST',
            headers: { 'X-Internal-Secret': token, 'Content-Type': 'application/json' },
            body: '{}',
            timeout: 120,
          })
          if (res.statusCode !== 200) {
            $app
              .logger()
              .error(
                'performance cron endpoint failed',
                'endpoint',
                endpoints[i],
                'status',
                res.statusCode,
              )
          }
        } catch (err2) {
          $app
            .logger()
            .error('performance cron call error', 'endpoint', endpoints[i], 'error', String(err2))
        }
      }
      $app.logger().info('performance cron completed')
    } catch (err) {
      $app.logger().error('performance cron error', 'error', String(err))
    }
  })
})

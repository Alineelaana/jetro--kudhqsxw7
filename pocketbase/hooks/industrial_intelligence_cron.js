onServe((e) => {
  e.next()

  cronAdd('industrial_intelligence_auto', '0 */6 * * *', () => {
    try {
      var baseUrl = $secrets.get('PB_INSTANCE_URL') || ''
      if (!baseUrl) return
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)

      var token = $secrets.get('PB_SUPERUSER_TOKEN') || ''
      if (!token) return

      var res = $http.send({
        url: baseUrl + '/backend/v1/industrial/intelligence/detect',
        method: 'POST',
        headers: {
          'X-Internal-Secret': token,
          'Content-Type': 'application/json',
        },
        body: '{}',
        timeout: 120,
      })

      if (res.statusCode === 200) {
        $app.logger().info('intelligence auto-detect completed')
      } else {
        var errBody = ''
        try {
          errBody = String(res.body || '')
        } catch (_) {}
        $app
          .logger()
          .error(
            'intelligence auto-detect failed',
            'status',
            res.statusCode,
            'body',
            errBody.substring(0, 200),
          )
      }
    } catch (err) {
      $app.logger().error('intelligence cron error', 'error', String(err))
    }
  })
})

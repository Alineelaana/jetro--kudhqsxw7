routerAdd(
  'POST',
  '/backend/v1/audit/auto-archive',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'SUP') {
      return e.forbiddenError('Apenas SUP')
    }

    var config = {}
    try {
      var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
      config = JSON.parse(rec.getString('value'))
    } catch (_) {}

    var days = parseInt(config.auto_archive_days || '90', 10)
    var cutoff = new Date(Date.now() - days * 86400000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)

    var totalArchived = 0
    var hasMore = true

    while (hasMore) {
      try {
        var records = $app.findRecordsByFilter(
          'audit_logs',
          'created < "' + cutoff + '" && archived = false',
          'created',
          200,
          0,
        )
        if (records.length === 0) {
          hasMore = false
          break
        }
        for (var i = 0; i < records.length; i++) {
          records[i].set('archived', true)
          $app.save(records[i])
          totalArchived++
        }
        if (records.length < 200) {
          hasMore = false
        }
      } catch (err) {
        hasMore = false
      }
    }

    $app.logger().info('auto-archive executed', 'archived', totalArchived, 'cutoff', cutoff)

    return e.json(200, { archived: totalArchived, cutoff: cutoff })
  },
  $apis.requireAuth(),
)

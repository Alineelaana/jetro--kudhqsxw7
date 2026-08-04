onServe((e) => {
  e.next()

  cronAdd('audit_auto_archive', '0 * * * *', () => {
    var config = {}
    try {
      var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
      config = JSON.parse(rec.getString('value'))
    } catch (_) {
      return
    }

    if (!config.auto_archive_enabled) return

    var days = parseInt(config.auto_archive_days || '90', 10)
    var cutoff = new Date(Date.now() - days * 86400000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)

    try {
      var records = $app.findRecordsByFilter(
        'audit_logs',
        'created < "' + cutoff + '" && archived = false',
        'created',
        500,
        0,
      )
      var count = 0
      for (var i = 0; i < records.length; i++) {
        records[i].set('archived', true)
        $app.save(records[i])
        count++
      }
      if (count > 0) {
        $app.logger().info('cron auto-archive completed', 'archived', count)
      }
    } catch (err) {
      $app.logger().error('cron auto-archive failed', 'error', String(err))
    }
  })

  cronAdd('audit_scheduled_report', '0 6 * * *', () => {
    var config = {}
    try {
      var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
      config = JSON.parse(rec.getString('value'))
    } catch (_) {
      return
    }

    if (!config.scheduled_report_enabled) return

    var now = new Date()
    var freq = config.scheduled_report_frequency || 'weekly'
    var shouldRun = false
    if (freq === 'daily') shouldRun = true
    else if (freq === 'weekly' && now.getDay() === 1) shouldRun = true
    else if (freq === 'monthly' && now.getDate() === 1) shouldRun = true
    if (!shouldRun) return

    var periodDays = freq === 'daily' ? 1 : freq === 'weekly' ? 7 : 30
    var since = new Date(now.getTime() - periodDays * 86400000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)

    try {
      var supUsers = $app.findRecordsByFilter(
        'users',
        "role = 'SUP' && active = true",
        '-created',
        100,
        0,
      )
      var notifCol = $app.findCollectionByNameOrId('notifications')
      for (var i = 0; i < supUsers.length; i++) {
        try {
          var notif = new Record(notifCol)
          notif.set('title', 'Relatorio de Auditoria Disponivel')
          notif.set('message', 'O relatorio periodico de conformidade foi gerado automaticamente.')
          notif.set('recipient', supUsers[i].id)
          notif.set('read', false)
          notif.set('link', '/admin?tab=auditoria')
          $app.saveNoValidate(notif)
        } catch (_) {}
      }
    } catch (_) {}

    try {
      var lrRec = $app.findFirstRecordByData('settings', 'key', 'audit_report_last_run')
      lrRec.set('value', now.toISOString())
      $app.save(lrRec)
    } catch (_) {
      try {
        var sCol = $app.findCollectionByNameOrId('settings')
        var nLr = new Record(sCol)
        nLr.set('key', 'audit_report_last_run')
        nLr.set('value', now.toISOString())
        $app.save(nLr)
      } catch (_) {}
    }

    $app.logger().info('cron scheduled report sent', 'frequency', freq)
  })
})

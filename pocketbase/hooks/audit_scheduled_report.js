routerAdd(
  'POST',
  '/backend/v1/audit/scheduled-report',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'SUP') {
      return e.forbiddenError('Apenas SUP')
    }

    var config = {}
    try {
      var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
      config = JSON.parse(rec.getString('value'))
    } catch (_) {}

    var now = new Date()
    var freq = config.scheduled_report_frequency || 'weekly'
    var periodDays = freq === 'daily' ? 1 : freq === 'weekly' ? 7 : 30
    var since = new Date(now.getTime() - periodDays * 86400000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)

    var counts = { total: 0, critical: 0, logins: 0, failedLogins: 0 }

    try {
      var records = $app.findRecordsByFilter(
        'audit_logs',
        'created >= "' + since + '"',
        '-created',
        500,
        0,
      )
      counts.total = records.length
      for (var i = 0; i < records.length; i++) {
        var crit = records[i].getString('criticidade')
        var act = records[i].getString('action')
        if (crit === 'Critica') counts.critical++
        if (act === 'login') counts.logins++
        if (act === 'login_failed') counts.failedLogins++
      }
    } catch (_) {}

    try {
      var supUsers = $app.findRecordsByFilter(
        'users',
        "role = 'SUP' && active = true",
        '-created',
        100,
        0,
      )
      var notifCol = $app.findCollectionByNameOrId('notifications')
      var msg =
        'Relatorio de conformidade (' +
        freq +
        '). Periodo: ' +
        periodDays +
        ' dias. Total: ' +
        counts.total +
        ' eventos, ' +
        counts.critical +
        ' criticos, ' +
        counts.logins +
        ' logins, ' +
        counts.failedLogins +
        ' tentativas invalidas.'

      for (var j = 0; j < supUsers.length; j++) {
        try {
          var notif = new Record(notifCol)
          notif.set('title', 'Relatorio de Auditoria Disponivel')
          notif.set('message', msg)
          notif.set('recipient', supUsers[j].id)
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

    $app
      .logger()
      .info('scheduled report generated', 'period', since, 'stats', JSON.stringify(counts))

    return e.json(200, { success: true, stats: counts, period: since + ' to now' })
  },
  $apis.requireAuth(),
)

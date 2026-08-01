routerAdd(
  'POST',
  '/backend/v1/backup/settings',
  (e) => {
    var body = e.requestInfo().body || {}
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    var ip = '',
      ua = ''
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}

    var updates = {
      auto_backup_daily: body.daily ? 'true' : 'false',
      auto_backup_weekly: body.weekly ? 'true' : 'false',
      auto_backup_type: body.type || 'full',
    }

    var prevValues = {}
    for (var key in updates) {
      try {
        var rec = $app.findFirstRecordByData('settings', 'key', key)
        prevValues[key] = rec.getString('value')
        rec.set('value', updates[key])
        $app.save(rec)
      } catch (_) {
        try {
          var sCol = $app.findCollectionByNameOrId('settings')
          var newRec = new Record(sCol)
          newRec.set('key', key)
          newRec.set('value', updates[key])
          $app.save(newRec)
        } catch (_) {}
      }
    }

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email || '')
      log.set('user_role', authUser.getString('role'))
      log.set('action', 'settings_change')
      log.set('module', 'backup')
      log.set('target_collection', 'settings')
      log.set('target_id', '')
      log.set('target_summary', 'Configuracoes de backup automatico')
      log.set('previous_value', prevValues)
      log.set('new_value', updates)
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      $app.save(log)
    } catch (_) {}

    return e.json(200, { success: true, settings: updates })
  },
  $apis.requireAuth(),
)

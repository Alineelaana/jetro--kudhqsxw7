routerAdd(
  'GET',
  '/backend/v1/backup/settings',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    function getSetting(key) {
      try {
        return $app.findFirstRecordByData('settings', 'key', key).getString('value')
      } catch (_) {
        return ''
      }
    }

    return e.json(200, {
      daily: getSetting('auto_backup_daily') === 'true',
      weekly: getSetting('auto_backup_weekly') === 'true',
      type: getSetting('auto_backup_type') || 'full',
      last_run: getSetting('auto_backup_last_run') || '',
    })
  },
  $apis.requireAuth(),
)

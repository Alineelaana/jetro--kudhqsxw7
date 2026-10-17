routerAdd(
  'POST',
  '/backend/v1/backup/auto-check',
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

    var createdInitial = false
    try {
      var initBackup = null
      try {
        initBackup = $app.findFirstRecordByData('backups', 'version_name', 'Jetro v1.0')
      } catch (_) {}
      if (initBackup && initBackup.getString('status') === 'pending') {
        var initData = {
          version: 'Jetro v1.0',
          type: 'full',
          timestamp: new Date().toISOString(),
          created_by: 'Sistema',
          collections: {},
          note: 'Backup inicial gerado automaticamente',
        }
        var initJson = JSON.stringify(initData)
        var initFile = $filesystem.fileFromBytes(
          initJson,
          'backup_Jetro_v1.0_' + Date.now() + '.json',
        )
        initBackup.set('version_name', 'Jetro v1.0')
        initBackup.set('backup_data', initJson)
        initBackup.set('file', initFile)
        initBackup.set('file_size', initJson.length)
        initBackup.set('status', 'active')
        $app.save(initBackup)
        createdInitial = true
      }
    } catch (_) {}

    var dailyEnabled = getSetting('auto_backup_daily') === 'true'
    var weeklyEnabled = getSetting('auto_backup_weekly') === 'true'
    var lastRun = getSetting('auto_backup_last_run')
    var backupType = getSetting('auto_backup_type') || 'full'
    var autoCreated = false

    var now = Date.now()
    var lastRunTime = lastRun ? new Date(lastRun).getTime() : 0
    var dayMs = 86400000
    var weekMs = 604800000

    var shouldRun = false
    if (dailyEnabled && now - lastRunTime >= dayMs) shouldRun = true
    if (weeklyEnabled && now - lastRunTime >= weekMs) shouldRun = true

    if (shouldRun) {
      var autoVersion = 'Auto Backup ' + new Date().toISOString().split('T')[0]
      var backupCol = $app.findCollectionByNameOrId('backups')
      var autoRec = new Record(backupCol)
      autoRec.set('version_name', autoVersion)
      autoRec.set('backup_type', backupType)
      autoRec.set(
        'backup_data',
        JSON.stringify({
          version: autoVersion,
          type: backupType,
          timestamp: new Date().toISOString(),
          note: 'Backup automatico',
        }),
      )
      autoRec.set('file_size', 0)
      autoRec.set('observations', 'Backup automatico gerado pelo sistema')
      autoRec.set('status', 'active')
      autoRec.set('created_by_name', 'Sistema (Automatico)')
      autoRec.set('created_by_role', 'SUP')
      autoRec.set('auto_generated', true)
      $app.save(autoRec)

      try {
        var lrRec = $app.findFirstRecordByData('settings', 'key', 'auto_backup_last_run')
        lrRec.set('value', new Date().toISOString())
        $app.save(lrRec)
      } catch (_) {}
      autoCreated = true
    }

    return e.json(200, {
      initial_created: createdInitial,
      auto_created: autoCreated,
      daily_enabled: dailyEnabled,
      weekly_enabled: weeklyEnabled,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/backup/{id}/restore',
  (e) => {
    var id = e.request.pathValue('id')
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    var record = $app.findRecordById('backups', id)
    var backupDataStr = record.getString('backup_data')
    if (!backupDataStr) return e.badRequestError('Backup nao contem dados para restauracao')

    var backupData = JSON.parse(backupDataStr)
    var ip = '',
      ua = ''
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}

    var restoredCount = 0
    var RESTORE_COLS = [
      'settings',
      'budget_form_fields',
      'budget_requests',
      'partner_types',
      'partners',
      'ai_training',
      'cms_content',
      'cms_versions',
      'cms_history',
      'cms_media',
      'cms_publication',
      'vitrine_items',
      'chat_conversations',
      'chat_messages',
      'chat_ratings',
    ]

    if (backupData.collections) {
      for (var colName in backupData.collections) {
        if (RESTORE_COLS.indexOf(colName) === -1) continue
        var backupRecords = backupData.collections[colName]
        if (!backupRecords || !backupRecords.length) continue

        try {
          var existing = $app.findRecordsByFilter(colName, "id != ''", '', 100000, 0)
          for (var i = 0; i < existing.length; i++) {
            $app.delete(existing[i])
          }
        } catch (_) {}

        try {
          var col = $app.findCollectionByNameOrId(colName)
          for (var j = 0; j < backupRecords.length; j++) {
            try {
              var rec = new Record(col)
              var data = backupRecords[j]
              for (var key in data) {
                if (key === 'id') continue
                try {
                  rec.set(key, data[key])
                } catch (_) {}
              }
              $app.save(rec)
              restoredCount++
            } catch (_) {}
          }
        } catch (_) {}
      }
    }

    record.set('status', 'restored')
    $app.save(record)

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email || '')
      log.set('user_role', authUser.getString('role'))
      log.set('action', 'restore')
      log.set('module', 'backup')
      log.set('target_collection', 'backups')
      log.set('target_id', id)
      log.set('target_summary', record.getString('version_name'))
      log.set('previous_value', null)
      log.set('new_value', { restored_records: restoredCount })
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      $app.save(log)
    } catch (_) {}

    return e.json(200, { success: true, restored_records: restoredCount })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/backup/{id}/delete',
  (e) => {
    var id = e.request.pathValue('id')
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    var record = $app.findRecordById('backups', id)

    var vName = record.getString('version_name')
    if (vName === 'Jetro v1.0' || vName === 'VeloraLog v1.0') {
      return e.badRequestError('O backup inicial Jetro v1.0 nao pode ser excluido.')
    }

    var ip = '',
      ua = ''
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}

    var versionName = record.getString('version_name')
    var backupType = record.getString('backup_type')

    try {
      var fsys = $app.newFilesystem()
      var fileKey = record.baseFilesPath() + '/' + record.getString('file')
      if (record.getString('file')) {
        fsys.delete(fileKey)
      }
      fsys.close()
    } catch (_) {}

    $app.delete(record)

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email || '')
      log.set('user_role', authUser.getString('role'))
      log.set('action', 'delete')
      log.set('module', 'backup')
      log.set('target_collection', 'backups')
      log.set('target_id', id)
      log.set('target_summary', versionName + ' (' + backupType + ')')
      log.set('previous_value', { version: versionName, type: backupType })
      log.set('new_value', null)
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      $app.save(log)
    } catch (_) {}

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)

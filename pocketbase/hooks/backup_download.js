routerAdd(
  'POST',
  '/backend/v1/backup/{id}/download',
  (e) => {
    var id = e.request.pathValue('id')
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    var record = $app.findRecordById('backups', id)
    var fileName = record.getString('file')
    if (!fileName) return e.badRequestError('Backup nao possui arquivo')

    var ip = '',
      ua = ''
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email || '')
      log.set('user_role', authUser.getString('role'))
      log.set('action', 'download')
      log.set('module', 'backup')
      log.set('target_collection', 'backups')
      log.set('target_id', id)
      log.set('target_summary', record.getString('version_name'))
      log.set('previous_value', null)
      log.set('new_value', null)
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      $app.save(log)
    } catch (_) {}

    return e.json(200, {
      success: true,
      download_url: '/api/files/backups/' + id + '/' + fileName,
      file_name: fileName,
    })
  },
  $apis.requireAuth(),
)

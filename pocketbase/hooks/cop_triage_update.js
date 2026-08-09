routerAdd(
  'POST',
  '/backend/v1/cop/triage/{collection}/{id}',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var collection = e.request.pathValue('collection')
    if (collection !== 'audit_logs' && collection !== 'audit_alerts') {
      return e.badRequestError('Invalid collection for triage')
    }

    var id = e.request.pathValue('id')
    var body = e.requestInfo().body || {}
    var record = $app.findRecordById(collection, id)

    var updates = {}
    var fields = [
      'triage_responsible',
      'triage_status',
      'triage_recurrence_count',
      'triage_resolved_by',
      'triage_resolved_at',
    ]
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i]
      if (body[f] !== undefined && body[f] !== null) {
        if (f === 'triage_recurrence_count') {
          record.set(f, Number(body[f]))
        } else {
          record.set(f, String(body[f]))
        }
        updates[f] = body[f]
      }
    }

    $app.save(record)

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('user_role', authUser.getString('role'))
      log.set('action', 'triage_update')
      log.set('module', 'cop')
      log.set('target_collection', collection)
      log.set('target_id', id)
      log.set('target_summary', 'Triage update on ' + collection + ' ' + id)
      log.set('new_value', updates)
      log.set('criticidade', 'Baixa')
      log.set('origem', 'Área da Empresa')
      log.set('is_suspicious', false)
      log.set('archived', false)
      $app.save(log)
    } catch (_) {}

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)

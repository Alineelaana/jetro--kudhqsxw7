onRecordAfterUpdateSuccess((e) => {
  var changes = []
  var fields = [
    'name',
    'corporate_name',
    'responsible',
    'contact_phone',
    'contact_email',
    'main_buyer',
    'manager_rca',
    'credit_limit',
    'status',
    'restriction_policy',
    'observations',
  ]
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i]
    var oldVal = e.record.original().getString(f)
    var newVal = e.record.getString(f)
    if (oldVal !== newVal) {
      changes.push({ field: f, old: oldVal, new: newVal })
    }
  }
  if (changes.length === 0) return e.next()

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('action', 'network_updated')
    log.set('module', 'Cadastros')
    log.set('target_collection', 'client_networks')
    log.set('target_id', e.record.id)
    log.set('target_summary', e.record.getString('name') || '')
    log.set('new_value', JSON.stringify(changes))
    log.set('criticidade', 'Media')
    log.set('origem', 'Area da Empresa')
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'client_networks')

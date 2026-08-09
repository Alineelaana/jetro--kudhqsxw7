onRecordUpdateRequest((e) => {
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

  var changes = []
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i]
    var oldVal = e.record.original().getString(f)
    var newVal = e.record.getString(f)
    if (oldVal !== newVal) {
      changes.push({ field: f, old: oldVal, new: newVal })
    }
  }

  if (changes.length === 0) {
    e.next()
    return
  }

  var authUser = e.auth
  var body = e.requestInfo().body || {}
  var justification = body.justification || 'Atualização de rede/grupo econômico'
  var recordId = e.record.id
  var recordName = e.record.getString('name') || ''

  e.next()

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', authUser ? authUser.id : '')
    log.set('user_name', authUser ? authUser.getString('name') || authUser.email || '' : '')
    log.set('user_role', authUser ? authUser.getString('role') || '' : '')
    log.set('action', 'network_updated')
    log.set('module', 'Cadastros')
    log.set('target_collection', 'client_networks')
    log.set('target_id', recordId)
    log.set('target_summary', recordName)
    log.set('new_value', JSON.stringify(changes))
    log.set('criticidade', 'Média')
    log.set('origem', 'Área da Empresa')
    log.set('justification', justification)
    $app.save(log)
  } catch (_) {}

  return
}, 'client_networks')

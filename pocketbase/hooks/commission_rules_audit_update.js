onRecordUpdateRequest((e) => {
  var FIELDS = [
    'role',
    'percentage',
    'split_percentage',
    'priority',
    'applicability',
    'active',
    'empresa',
    'filial',
  ]

  var oldValues = {}
  var newValues = {}
  var hasChange = false
  for (var i = 0; i < FIELDS.length; i++) {
    var f = FIELDS[i]
    oldValues[f] = e.record.original().getString(f)
    newValues[f] = e.record.getString(f)
    if (oldValues[f] !== newValues[f]) hasChange = true
  }
  if (!hasChange) {
    e.next()
    return
  }

  var userId = ''
  var userName = 'Sistema'
  var userRole = ''
  var empresa = ''
  var filial = ''
  try {
    var auth = e.requestInfo().auth
    if (auth) {
      userId = auth.id || ''
      userName = auth.getString('name') || auth.getString('email') || 'Sistema'
      userRole = auth.getString('role') || ''
      empresa = auth.getString('empresa_id') || ''
      filial = auth.getString('filial_id') || ''
    }
  } catch (_) {}

  e.next()

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var audit = new Record(auditCol)
    audit.set('user_id', userId)
    audit.set('user_name', userName)
    audit.set('user_role', userRole)
    audit.set('action', 'update_commission_rule')
    audit.set('module', 'Comercial')
    audit.set('target_collection', 'commission_rules')
    audit.set('target_id', e.record.id)
    audit.set('target_summary', 'Regra: ' + newValues.role + ' (' + newValues.percentage + '%)')
    audit.set('previous_value', JSON.stringify(oldValues))
    audit.set('new_value', JSON.stringify(newValues))
    audit.set('criticidade', 'Media')
    audit.set('origem', 'Area da Empresa')
    audit.set('is_suspicious', false)
    audit.set('archived', false)
    audit.set('empresa', empresa)
    audit.set('filial', filial)
    $app.save(audit)
  } catch (err) {
    $app.logger().error('audit failed for commission rule update', 'error', String(err))
  }
}, 'commission_rules')

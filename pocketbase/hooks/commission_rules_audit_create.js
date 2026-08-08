onRecordCreateRequest((e) => {
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

  var values = {}
  for (var i = 0; i < FIELDS.length; i++) {
    values[FIELDS[i]] = e.record.getString(FIELDS[i])
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
    audit.set('action', 'create_commission_rule')
    audit.set('module', 'Comercial')
    audit.set('target_collection', 'commission_rules')
    audit.set('target_id', e.record.id)
    audit.set('target_summary', 'Regra: ' + values.role + ' (' + values.percentage + '%)')
    audit.set('previous_value', JSON.stringify({}))
    audit.set('new_value', JSON.stringify(values))
    audit.set('criticidade', 'Media')
    audit.set('origem', 'Area da Empresa')
    audit.set('is_suspicious', false)
    audit.set('archived', false)
    audit.set('empresa', empresa)
    audit.set('filial', filial)
    $app.save(audit)
  } catch (err) {
    $app.logger().error('audit failed for commission rule create', 'error', String(err))
  }
}, 'commission_rules')

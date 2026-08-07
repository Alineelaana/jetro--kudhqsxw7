onRecordUpdateRequest((e) => {
  var authUser = e.auth

  var original = e.record.original()
  var SECURITY_FIELDS = ['role', 'empresa_id', 'filial_id', 'active', 'mfa_enabled', 'mfa_secret']
  var changes = []

  for (var i = 0; i < SECURITY_FIELDS.length; i++) {
    var field = SECURITY_FIELDS[i]
    var oldVal = original ? original.getString(field) : ''
    var newVal = e.record.getString(field)
    if (oldVal !== newVal) {
      changes.push({ field: field, old_value: oldVal, new_value: newVal })
    }
  }

  if (changes.length > 0) {
    e.set('audit_security_changes', JSON.stringify(changes))
    e.set('audit_auth_user_id', authUser ? authUser.id : '')
    e.set(
      'audit_auth_user_name',
      authUser ? authUser.getString('name') || authUser.email || '' : '',
    )
    e.set('audit_auth_user_role', authUser ? authUser.getString('role') : '')
    e.set('audit_target_id', e.record.id)
    e.set('audit_target_name', e.record.getString('name') || e.record.getString('email') || '')
  }

  e.next()

  var changesJson = ''
  try {
    changesJson = e.get('audit_security_changes')
  } catch (_) {}
  if (!changesJson) return

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', e.get('audit_auth_user_id') || '')
    log.set('user_name', e.get('audit_auth_user_name') || '')
    log.set('user_role', e.get('audit_auth_user_role') || '')
    log.set('action', 'security_update')
    log.set('module', 'auth')
    log.set('target_collection', 'users')
    log.set('target_id', e.get('audit_target_id') || '')
    log.set('target_summary', e.get('audit_target_name') || '')
    log.set('new_value', JSON.parse(changesJson))
    log.set('origem', 'Área da Empresa')
    log.set('criticidade', 'Alta')
    log.set('is_suspicious', false)
    log.set('archived', false)
    $app.save(log)
  } catch (err) {
    $app.logger().error('security audit log failed', 'error', String(err))
  }
}, 'users')

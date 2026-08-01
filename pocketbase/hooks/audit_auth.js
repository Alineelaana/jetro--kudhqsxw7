routerAdd('POST', '/backend/v1/audit/auth', (e) => {
  var body = e.requestInfo().body || {}
  var action = body.action || ''
  if (action !== 'login' && action !== 'logout' && action !== 'login_failed') {
    return e.badRequestError('invalid action')
  }

  var identity = body.identity || ''
  var authUser = e.auth
  var ip = ''
  var ua = ''
  try {
    ip = e.request.remoteAddr || ''
  } catch (_) {}
  try {
    ua = (e.requestInfo().headers || {})['user_agent'] || ''
  } catch (_) {}

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', authUser ? authUser.id : '')
    if (action === 'login_failed') {
      log.set('user_name', identity || '')
      log.set('user_role', '')
    } else {
      log.set('user_name', authUser ? authUser.getString('name') || authUser.email || '' : identity)
      log.set('user_role', authUser ? authUser.getString('role') : '')
    }
    log.set('action', action)
    log.set('module', 'auth')
    log.set('target_collection', 'users')
    log.set('target_id', authUser ? authUser.id : '')
    if (action === 'login_failed') {
      log.set('target_summary', 'Tentativa de login falhou: ' + identity)
    } else {
      log.set(
        'target_summary',
        authUser ? authUser.getString('name') || authUser.email || identity : identity,
      )
    }
    log.set('previous_value', null)
    log.set('new_value', null)
    log.set('ip_address', ip)
    log.set('user_agent', ua)
    $app.save(log)
  } catch (err) {
    $app.logger().error('audit auth log failed', 'error', String(err))
  }

  return e.json(200, { ok: true })
})

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

  var session_id = ''
  if (authUser) {
    try {
      var authHeader = (e.requestInfo().headers || {})['authorization'] || ''
      var token = authHeader.replace(/^Bearer\s+/i, '')
      if (token) {
        session_id = $security.sha256(token).substring(0, 16)
      }
    } catch (_) {}
  }

  var browser = 'Desconhecido'
  var osName = 'Desconhecido'
  var device = 'Desktop'
  if (ua) {
    if (ua.indexOf('Edg/') > -1) browser = 'Microsoft Edge'
    else if (ua.indexOf('Chrome') > -1) browser = 'Google Chrome'
    else if (ua.indexOf('Firefox') > -1) browser = 'Mozilla Firefox'
    else if (ua.indexOf('Safari') > -1) browser = 'Safari'
    if (ua.indexOf('Windows') > -1) osName = 'Windows'
    else if (ua.indexOf('Mac OS') > -1) osName = 'macOS'
    else if (ua.indexOf('Android') > -1) osName = 'Android'
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) osName = 'iOS'
    else if (ua.indexOf('Linux') > -1) osName = 'Linux'
    if (ua.indexOf('Mobile') > -1 || ua.indexOf('iPhone') > -1) device = 'Mobile'
    else if (ua.indexOf('iPad') > -1) device = 'Tablet'
  }

  if (action === 'login' && session_id) {
    try {
      var sessCol = $app.findCollectionByNameOrId('audit_sessions')
      var existing = null
      try {
        existing = $app.findFirstRecordByData('audit_sessions', 'session_id', session_id)
      } catch (_) {}
      if (!existing) {
        var sess = new Record(sessCol)
        sess.set('session_id', session_id)
        sess.set('user_id', authUser ? authUser.id : '')
        sess.set(
          'user_name',
          authUser ? authUser.getString('name') || authUser.email || identity : identity,
        )
        sess.set('login_time', new Date().toISOString().replace('T', ' ').substring(0, 19))
        sess.set('ip_address', ip)
        sess.set('browser', browser)
        sess.set('os', osName)
        sess.set('device', device)
        sess.set('origin', 'Área da Empresa')
        sess.set('status', 'active')
        $app.save(sess)
      }
    } catch (err) {
      $app.logger().error('session creation failed', 'error', String(err))
    }
  } else if (action === 'logout' && session_id) {
    try {
      var sessRec = $app.findFirstRecordByData('audit_sessions', 'session_id', session_id)
      sessRec.set('logout_time', new Date().toISOString().replace('T', ' ').substring(0, 19))
      sessRec.set('status', 'closed')
      $app.save(sessRec)
    } catch (_) {}
  }

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', authUser ? authUser.id : '')
    if (action === 'login_failed') {
      log.set('user_name', identity || '')
      log.set('user_role', '')
    } else {
      log.set(
        'user_name',
        authUser ? authUser.getString('name') || authUser.email || identity : identity,
      )
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
    log.set('session_id', session_id)
    log.set('browser', browser)
    log.set('os', osName)
    log.set('device', device)
    log.set('origem', 'Área da Empresa')
    log.set('criticidade', 'Baixa')
    log.set('is_suspicious', false)
    log.set('archived', false)
    $app.save(log)
  } catch (err) {
    $app.logger().error('audit auth log failed', 'error', String(err))
  }

  return e.json(200, { ok: true, session_id: session_id })
})

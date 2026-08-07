function padLeft(s, n, c) {
  s = String(s)
  while (s.length < n) s = c + s
  return s
}

function generateTOTP(secretHex, timeStep) {
  var timeBytes = ''
  for (var i = 7; i >= 0; i--) {
    timeBytes += String.fromCharCode((timeStep >>> (i * 8)) & 0xff)
  }
  var hmac = $security.hs256(timeBytes, secretHex)
  var offset = parseInt(hmac.substring(hmac.length - 1), 16)
  var truncated = parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff
  return padLeft(String(truncated % 1000000), 6, '0')
}

function verifyTOTP(secretHex, code) {
  var now = Math.floor(new Date().getTime() / 1000)
  var currentStep = Math.floor(now / 30)
  for (var delta = -1; delta <= 1; delta++) {
    if (generateTOTP(secretHex, currentStep + delta) === code) return true
  }
  return false
}

routerAdd(
  'POST',
  '/backend/v1/mfa/verify',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    var body = e.requestInfo().body || {}
    var code = String(body.code || '').trim()
    if (!code) return e.badRequestError('code is required')

    var record = $app.findRecordById('users', authUser.id)
    var secret = record.getString('mfa_secret')
    if (!secret) return e.badRequestError('MFA not set up')

    if (!verifyTOTP(secret, code)) {
      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', authUser.getString('role'))
        log.set('action', 'mfa_verify_failed')
        log.set('module', 'auth')
        log.set('target_collection', 'users')
        log.set('target_id', authUser.id)
        log.set('origem', 'Área da Empresa')
        log.set('criticidade', 'Alta')
        log.set('is_suspicious', true)
        log.set('archived', false)
        $app.save(log)
      } catch (_) {}
      return e.json(401, { error: 'Invalid MFA code' })
    }

    record.set('mfa_enabled', true)
    record.set('mfa_verified_at', new Date().toISOString())
    $app.saveNoValidate(record)

    try {
      var aCol2 = $app.findCollectionByNameOrId('audit_logs')
      var log2 = new Record(aCol2)
      log2.set('user_id', authUser.id)
      log2.set('user_name', authUser.getString('name') || authUser.email)
      log2.set('user_role', authUser.getString('role'))
      log2.set('action', 'mfa_verify_success')
      log2.set('module', 'auth')
      log2.set('target_collection', 'users')
      log2.set('target_id', authUser.id)
      log2.set('origem', 'Área da Empresa')
      log2.set('criticidade', 'Baixa')
      log2.set('is_suspicious', false)
      log2.set('archived', false)
      $app.save(log2)
    } catch (_) {}

    return e.json(200, { verified: true, enabled: true })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/mfa/login-verify',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    var body = e.requestInfo().body || {}
    var code = String(body.code || '').trim()
    if (!code) return e.badRequestError('code is required')

    var record = $app.findRecordById('users', authUser.id)
    var secret = record.getString('mfa_secret')
    if (!secret) return e.badRequestError('MFA not set up')

    if (!verifyTOTP(secret, code)) {
      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', authUser.getString('role'))
        log.set('action', 'mfa_login_failed')
        log.set('module', 'auth')
        log.set('target_collection', 'users')
        log.set('target_id', authUser.id)
        log.set('origem', 'Área da Empresa')
        log.set('criticidade', 'Alta')
        log.set('is_suspicious', true)
        log.set('archived', false)
        $app.save(log)
      } catch (_) {}
      return e.json(401, { error: 'Invalid MFA code' })
    }

    record.set('mfa_verified_at', new Date().toISOString())
    $app.saveNoValidate(record)

    try {
      var aCol2 = $app.findCollectionByNameOrId('audit_logs')
      var log2 = new Record(aCol2)
      log2.set('user_id', authUser.id)
      log2.set('user_name', authUser.getString('name') || authUser.email)
      log2.set('user_role', authUser.getString('role'))
      log2.set('action', 'mfa_login_success')
      log2.set('module', 'auth')
      log2.set('target_collection', 'users')
      log2.set('target_id', authUser.id)
      log2.set('origem', 'Área da Empresa')
      log2.set('criticidade', 'Baixa')
      log2.set('is_suspicious', false)
      log2.set('archived', false)
      $app.save(log2)
    } catch (_) {}

    return e.json(200, { verified: true })
  },
  $apis.requireAuth(),
)

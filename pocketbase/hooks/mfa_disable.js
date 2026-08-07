routerAdd(
  'POST',
  '/backend/v1/mfa/disable',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    var body = e.requestInfo().body || {}
    var code = String(body.code || '').trim()
    if (!code) return e.badRequestError('code is required')

    var record = $app.findRecordById('users', authUser.id)
    var secret = record.getString('mfa_secret')
    if (!secret) return e.badRequestError('MFA not set up')

    var now = Math.floor(new Date().getTime() / 1000)
    var currentStep = Math.floor(now / 30)
    var verified = false
    for (var delta = -1; delta <= 1; delta++) {
      var timeStep = currentStep + delta
      var timeBytes = ''
      for (var i = 7; i >= 0; i--) {
        timeBytes += String.fromCharCode((timeStep >>> (i * 8)) & 0xff)
      }
      var hmac = $security.hs256(timeBytes, secret)
      var offset = parseInt(hmac.substring(hmac.length - 1), 16)
      var truncated = parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff
      var totp = String(truncated % 1000000)
      while (totp.length < 6) totp = '0' + totp
      if (totp === code) {
        verified = true
        break
      }
    }

    if (!verified) {
      return e.json(401, { error: 'Invalid MFA code' })
    }

    record.set('mfa_secret', '')
    record.set('mfa_enabled', false)
    record.set('mfa_verified_at', '')
    $app.saveNoValidate(record)

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('user_role', authUser.getString('role'))
      log.set('action', 'mfa_disabled')
      log.set('module', 'auth')
      log.set('target_collection', 'users')
      log.set('target_id', authUser.id)
      log.set('target_summary', 'MFA disabled by user')
      log.set('origem', 'Área da Empresa')
      log.set('criticidade', 'Alta')
      log.set('is_suspicious', false)
      log.set('archived', false)
      $app.save(log)
    } catch (_) {}

    return e.json(200, { disabled: true })
  },
  $apis.requireAuth(),
)

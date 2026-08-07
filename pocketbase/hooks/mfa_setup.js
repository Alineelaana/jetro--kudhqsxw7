function padLeft(s, n, c) {
  s = String(s)
  while (s.length < n) s = c + s
  return s
}

function generateSecret() {
  var rand = $security.randomString(20)
  var hex = ''
  for (var i = 0; i < rand.length; i++) {
    hex += padLeft(rand.charCodeAt(i).toString(16), 2, '0')
  }
  return hex
}

function base32EncodeHex(hexStr) {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  var bits = ''
  for (var i = 0; i + 1 < hexStr.length; i += 2) {
    bits += padLeft(parseInt(hexStr.substring(i, i + 2), 16).toString(2), 8, '0')
  }
  while (bits.length % 5 !== 0) bits += '0'
  var result = ''
  for (var j = 0; j < bits.length; j += 5) {
    result += alphabet[parseInt(bits.substring(j, j + 5), 2)]
  }
  return result
}

routerAdd(
  'POST',
  '/backend/v1/mfa/setup',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var role = authUser.getString('role') || ''
    if (role !== 'SUP') return e.forbiddenError('MFA is only available for admin users')

    var secretHex = generateSecret()
    var secretBase32 = base32EncodeHex(secretHex)
    var email = authUser.email || ''
    var label = 'VeloraLog:' + email
    var otpauthUrl =
      'otpauth://totp/' +
      encodeURIComponent(label) +
      '?secret=' +
      secretBase32 +
      '&issuer=VeloraLog&algorithm=SHA256&digits=6&period=30'

    var record = $app.findRecordById('users', authUser.id)
    record.set('mfa_secret', secretHex)
    record.set('mfa_enabled', false)
    $app.saveNoValidate(record)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || email)
      log.set('user_role', role)
      log.set('action', 'mfa_setup')
      log.set('module', 'auth')
      log.set('target_collection', 'users')
      log.set('target_id', authUser.id)
      log.set('target_summary', 'MFA setup initiated')
      log.set('origem', 'Área da Empresa')
      log.set('criticidade', 'Alta')
      log.set('is_suspicious', false)
      log.set('archived', false)
      $app.save(log)
    } catch (err) {
      $app.logger().error('mfa setup audit failed', 'error', String(err))
    }

    return e.json(200, { secret: secretBase32, otpauth_url: otpauthUrl })
  },
  $apis.requireAuth(),
)

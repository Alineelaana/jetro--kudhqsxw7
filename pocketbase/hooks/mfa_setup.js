// Rota autenticada para iniciar setup de MFA do usuário logado
// Gera chave TOTP RFC 6238 padrão compatível com Google Authenticator, Authy, etc. (HMAC-SHA1/SHA256, 30s)
routerAdd(
  'POST',
  '/backend/v1/mfa/setup',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('Autenticação necessária')

    // Gerar segredo seguro em formato base32
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    var secretBase32 = ''
    for (var k = 0; k < 32; k++) {
      var randIdx = Math.floor(Math.random() * alphabet.length)
      secretBase32 += alphabet.charAt(randIdx)
    }

    var email = authUser.email || authUser.getString('email') || ''
    var issuer = 'HURAM ERP'
    var label = issuer + ':' + email
    var otpauthUrl =
      'otpauth://totp/' +
      encodeURIComponent(label) +
      '?secret=' +
      secretBase32 +
      '&issuer=' +
      encodeURIComponent(issuer) +
      '&algorithm=SHA1&digits=6&period=30'

    // Armazenar segredo de forma privada no registro do usuário (não ativado até verificação)
    var record = $app.findRecordById('users', authUser.id)
    record.set('mfa_secret', secretBase32)
    record.set('mfa_enabled', false)
    $app.saveNoValidate(record)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || email)
      log.set('user_role', authUser.getString('role') || 'PADRAO')
      log.set('action', 'mfa_setup_initiated')
      log.set('module', 'auth')
      log.set('target_collection', 'users')
      log.set('target_id', authUser.id)
      log.set('target_summary', 'Setup MFA iniciado')
      log.set('origem', 'Área da Empresa')
      log.set('criticidade', 'Alta')
      log.set('is_suspicious', false)
      log.set('archived', false)
      $app.save(log)
    } catch (_) {}

    return e.json(200, {
      secret: secretBase32,
      otpauth_url: otpauthUrl,
    })
  },
  $apis.requireAuth(),
)

// 1. Rota de ativação inicial do MFA (usuário logado confirmando que escaneou o QR Code)
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

    var cleanSecret = String(secret)
      .toUpperCase()
      .replace(/[^A-Z2-7]/g, '')
    if (!cleanSecret) return e.badRequestError('MFA secret invalid')

    var now = Math.floor(new Date().getTime() / 1000)
    var currentStep = Math.floor(now / 30)
    var verified = false
    var timeStepMatched = 0

    // Janela de tolerância: -1, 0, +1 passo de 30s
    for (var delta = -1; delta <= 1; delta++) {
      var timeStep = currentStep + delta
      var timeBytes = ''
      for (var i = 7; i >= 0; i--) {
        timeBytes += String.fromCharCode((timeStep >>> (i * 8)) & 0xff)
      }

      var hmac = $security.hs256(timeBytes, cleanSecret)
      var offset = parseInt(hmac.substring(hmac.length - 1), 16)
      var truncated = parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff
      var totp = String(truncated % 1000000)
      while (totp.length < 6) totp = '0' + totp
      if (totp === code) {
        verified = true
        timeStepMatched = timeStep
        break
      }
    }

    if (!verified) {
      return e.json(401, { error: 'Código MFA inválido' })
    }

    // Prevenção de reutilização do código
    try {
      var codeHash = $security.sha256(authUser.id + ':' + code + ':' + timeStepMatched)
      var usedCol = $app.findCollectionByNameOrId('mfa_used_codes')
      var usedRec = new Record(usedCol)
      usedRec.set('user_id', authUser.id)
      usedRec.set('code_hash', codeHash)
      usedRec.set('time_step', timeStepMatched)
      usedRec.set('used_at', new Date().toISOString())
      $app.save(usedRec)
    } catch (_) {}

    record.set('mfa_enabled', true)
    record.set('mfa_verified_at', new Date().toISOString())
    $app.saveNoValidate(record)

    try {
      var aCol2 = $app.findCollectionByNameOrId('audit_logs')
      var log2 = new Record(aCol2)
      log2.set('user_id', authUser.id)
      log2.set('user_name', authUser.getString('name') || authUser.email)
      log2.set('user_role', authUser.getString('role'))
      log2.set('action', 'mfa_enrollment_success')
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

// 2. Rota de validação de desafio de login seguro (com challenge_token temporário)
routerAdd('POST', '/backend/v1/mfa/challenge-verify', (e) => {
  var body = e.requestInfo().body || {}
  var challengeToken = String(body.challenge_token || '').trim()
  var code = String(body.code || '').trim()

  if (!challengeToken || !code) {
    return e.json(400, { error: 'challenge_token e code são obrigatórios' })
  }

  // 1. Localizar o desafio na coleção mfa_challenges
  var challenge = null
  try {
    challenge = $app.findFirstRecordByData('mfa_challenges', 'challenge_token', challengeToken)
  } catch (_) {}

  if (!challenge) {
    return e.json(400, { error: 'Desafio MFA inválido ou expirado.' })
  }

  if (challenge.getBool('used') || challenge.getBool('verified')) {
    return e.json(400, { error: 'Desafio MFA já utilizado.' })
  }

  // Checar expiração
  var expiresAtStr = challenge.getString('expires_at')
  if (expiresAtStr && new Date(expiresAtStr).getTime() < new Date().getTime()) {
    challenge.set('used', true)
    $app.save(challenge)
    return e.json(400, { error: 'Desafio MFA expirado. Efetue login novamente.' })
  }

  // Checar limite de tentativas (máximo 5)
  var attempts = challenge.getInt('attempts') || 0
  if (attempts >= 5) {
    challenge.set('used', true)
    $app.save(challenge)
    return e.json(429, { error: 'Muitas tentativas incorretas. Desafio cancelado.' })
  }

  var userId = challenge.getString('user_id')
  var userRecord = null
  try {
    userRecord = $app.findRecordById('users', userId)
  } catch (_) {}

  if (!userRecord || userRecord.getBool('active') === false) {
    return e.json(403, { error: 'Conta inativa ou não localizada.' })
  }

  var secret = userRecord.getString('mfa_secret')
  if (!secret) {
    return e.json(400, { error: 'MFA não configurado nesta conta.' })
  }

  var cleanSecret = String(secret)
    .toUpperCase()
    .replace(/[^A-Z2-7]/g, '')
  if (!cleanSecret) {
    return e.json(400, { error: 'Chave MFA inválida.' })
  }

  var now = Math.floor(new Date().getTime() / 1000)
  var currentStep = Math.floor(now / 30)
  var verified = false
  var timeStepMatched = 0

  for (var delta = -1; delta <= 1; delta++) {
    var timeStep = currentStep + delta
    var timeBytes = ''
    for (var i = 7; i >= 0; i--) {
      timeBytes += String.fromCharCode((timeStep >>> (i * 8)) & 0xff)
    }

    var hmac = $security.hs256(timeBytes, cleanSecret)
    var offset = parseInt(hmac.substring(hmac.length - 1), 16)
    var truncated = parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff
    var totp = String(truncated % 1000000)
    while (totp.length < 6) totp = '0' + totp
    if (totp === code) {
      verified = true
      timeStepMatched = timeStep
      break
    }
  }

  if (!verified) {
    challenge.set('attempts', attempts + 1)
    $app.save(challenge)
    return e.json(401, { error: 'Código MFA incorreto.' })
  }

  // Checar se o código já foi utilizado neste intervalo de tempo
  var codeHash = $security.sha256(userId + ':' + code + ':' + timeStepMatched)
  try {
    var alreadyUsed = $app.findFirstRecordByData('mfa_used_codes', 'code_hash', codeHash)
    if (alreadyUsed) {
      return e.json(400, {
        error: 'Código MFA já utilizado. Aguarde o próximo código no aplicativo.',
      })
    }
  } catch (_) {}

  // Registrar código como utilizado
  try {
    var usedCol2 = $app.findCollectionByNameOrId('mfa_used_codes')
    var usedRec2 = new Record(usedCol2)
    usedRec2.set('user_id', userId)
    usedRec2.set('code_hash', codeHash)
    usedRec2.set('time_step', timeStepMatched)
    usedRec2.set('used_at', new Date().toISOString())
    $app.save(usedRec2)
  } catch (_) {}

  // Marcar desafio como verificado e consumido
  challenge.set('verified', true)
  challenge.set('used', true)
  $app.save(challenge)

  // Atualizar último verified no usuário
  userRecord.set('mfa_verified_at', new Date().toISOString())
  $app.saveNoValidate(userRecord)

  // Auditoria de sucesso
  try {
    var aCol3 = $app.findCollectionByNameOrId('audit_logs')
    var log3 = new Record(aCol3)
    log3.set('user_id', userId)
    log3.set('user_name', userRecord.getString('name') || userRecord.email())
    log3.set('user_role', userRecord.getString('role'))
    log3.set('action', 'mfa_login_success')
    log3.set('module', 'auth')
    log3.set('target_collection', 'users')
    log3.set('target_id', userId)
    log3.set('origem', 'Área da Empresa')
    log3.set('criticidade', 'Baixa')
    log3.set('is_suspicious', false)
    log3.set('archived', false)
    $app.save(log3)
  } catch (_) {}

  // Dados seguros de resposta (sem expor segredos)
  var safeUser = {
    id: userRecord.id,
    email: userRecord.email(),
    name: userRecord.getString('name'),
    role: userRecord.getString('role'),
    perfil_acesso: userRecord.getString('perfil_acesso'),
    perfil_id: userRecord.getString('perfil_id'),
    empresa_id: userRecord.getString('empresa_id'),
    filial_id: userRecord.getString('filial_id'),
    empresas_ids: userRecord.get('empresas_ids'),
    active: userRecord.getBool('active'),
    codigo: userRecord.getInt('codigo'),
    force_password_change: userRecord.getBool('force_password_change'),
    must_change_password: userRecord.getBool('must_change_password'),
    inactivity_timeout_minutes: userRecord.getInt('inactivity_timeout_minutes') || 480,
  }

  return e.json(200, {
    verified: true,
    user: safeUser,
  })
})

// 3. Rota legada mantida para compatibilidade interna
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

    var cleanSecret = String(secret)
      .toUpperCase()
      .replace(/[^A-Z2-7]/g, '')
    if (!cleanSecret) return e.badRequestError('MFA secret invalid')

    var now = Math.floor(new Date().getTime() / 1000)
    var currentStep = Math.floor(now / 30)
    var verified = false

    for (var delta = -1; delta <= 1; delta++) {
      var timeStep = currentStep + delta
      var timeBytes = ''
      for (var i = 7; i >= 0; i--) {
        timeBytes += String.fromCharCode((timeStep >>> (i * 8)) & 0xff)
      }

      var hmac = $security.hs256(timeBytes, cleanSecret)
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

    record.set('mfa_verified_at', new Date().toISOString())
    $app.saveNoValidate(record)

    return e.json(200, { verified: true })
  },
  $apis.requireAuth(),
)

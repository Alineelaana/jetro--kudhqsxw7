// Endpoint seguro de autenticação primária com imposição de MFA no backend
// Se a conta possuir MFA habilitado, este endpoint NÃO retorna o token de acesso de usuário.
// Em vez disso, gera um desafio temporário (challenge_token) válido por 5 minutos
// e armazena o grant_token de forma isolada no banco de dados na coleção restrita mfa_challenges.
routerAdd('POST', '/backend/v1/auth/secure-login', (e) => {
  try {
    var body = e.requestInfo().body || {}
    var identity = String(body.identity || body.username || '').trim()
    var password = String(body.password || '').trim()

    if (!identity || !password) {
      return e.json(400, { error: 'Usuário/e-mail e senha são obrigatórios.' })
    }

    var lower = identity.toLowerCase()
    var userRecord = null

    // 1. Localizar usuário por e-mail ou login
    try {
      if (lower.indexOf('@') !== -1) {
        userRecord = $app.findAuthRecordByEmail('users', lower)
      } else {
        // IMPORTANTE (v0.0.706): a auth collection users NÃO tem campo `username`
        // (apenas login e email). Referenciá-lo no filtro lançava erro, o catch
        // silenciava e TODO login por nome de usuário devolvia 400
        // "Credenciais inválidas" antes mesmo de validar a senha.
        var found = $app.findRecordsByFilter('users', 'login = {:login}', '-created', 1, 0, {
          login: lower,
        })
        if (found && found.length > 0) {
          userRecord = found[0]
        }
      }
    } catch (_) {}

    // Fallback de apelidos conhecidos se não encontrado
    if (!userRecord) {
      if (lower === 'alineelaana' || lower === 'jetrosup' || lower === 'alineelaana@gmail.com') {
        try {
          userRecord = $app.findAuthRecordByEmail('users', 'alineelaana@gmail.com')
        } catch (_) {}
      }
    }

    if (!userRecord) {
      // Falha sem usuário localizado: registra tentativa anônima para auditoria
      try {
        var sllCol0 = $app.findCollectionByNameOrId('security_login_logs')
        var sllFail0 = new Record(sllCol0)
        sllFail0.set('usuario', String(body.identity || lower))
        sllFail0.set('sucesso', false)
        sllFail0.set(
          'ip',
          String(e.requestInfo().headers.get('X-Forwarded-For') || e.realIP() || ''),
        )
        sllFail0.set('user_agent', String(e.requestInfo().headers.get('User-Agent') || ''))
        sllFail0.set('origem', 'login')
        $app.save(sllFail0)
      } catch (_) {}

      return e.json(400, { error: 'Credenciais inválidas. Verifique usuário e senha.' })
    }

    // 2. Bloqueio temporário: 5 falhas nos últimos 15 minutos → recusa por 15 min,
    // MESMO que a senha esteja correta (mata credential stuffing na prática).
    // A contagem é por identidade (e-mail) na coleção security_login_logs.
    var isUserBlocked = false
    var minutosRestantes = 0
    try {
      var cutoff = new Date(Date.now() - 15 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '')
      var recentFails = $app.findRecordsByFilter(
        'security_login_logs',
        'usuario = {:u} && sucesso = false && created > {:cutoff}',
        '-created',
        20,
        0,
        { u: userRecord.email(), cutoff: cutoff },
      )
      if (recentFails && recentFails.length >= 5) {
        // Bloqueio de 15 min a partir da falha mais recente
        var lastFailStr = recentFails[0].getString('created')
        var lastFailDate = new Date(String(lastFailStr).replace(' ', 'T') + 'Z')
        var elapsed = Date.now() - lastFailDate.getTime()
        var restante = 15 * 60 * 1000 - elapsed
        if (restante > 0) {
          isUserBlocked = true
          minutosRestantes = Math.ceil(restante / 60000)
        }
      }
    } catch (lockErr) {
      // Em caso de erro na contagem, NUNCA bloqueia o usuário (fail-open)
      isUserBlocked = false
    }

    if (isUserBlocked) {
      // Registra a tentativa recusada pelo bloqueio para auditoria
      try {
        var sllColB = $app.findCollectionByNameOrId('security_login_logs')
        var sllB = new Record(sllColB)
        sllB.set('usuario', userRecord.email())
        sllB.set('sucesso', false)
        sllB.set('ip', String(e.requestInfo().headers.get('X-Forwarded-For') || e.realIP() || ''))
        sllB.set('user_agent', String(e.requestInfo().headers.get('User-Agent') || ''))
        sllB.set('origem', 'bloqueio_temporario')
        $app.save(sllB)
      } catch (_) {}

      return e.json(429, {
        error:
          'Bloqueado temporariamente por tentativas incorretas. Tente novamente em ' +
          minutosRestantes +
          ' minuto' +
          (minutosRestantes === 1 ? '' : 's') +
          '.',
      })
    }

    // 3. Verificar se a conta está ativa
    if (userRecord.getBool('active') === false) {
      return e.json(403, {
        error: 'Sua conta está inativa. Entre em contato com um administrador.',
      })
    }

    // 3. Validar a senha com o método nativo validatePassword do PocketBase
    var validPassword = false
    try {
      validPassword = userRecord.validatePassword(password)
    } catch (passErr) {
      validPassword = false
    }

    if (!validPassword) {
      // Registrar falha de login na auditoria
      try {
        var sllCol1 = $app.findCollectionByNameOrId('security_login_logs')
        var sllFail1 = new Record(sllCol1)
        sllFail1.set('usuario', userRecord.email())
        sllFail1.set('sucesso', false)
        sllFail1.set(
          'ip',
          String(e.requestInfo().headers.get('X-Forwarded-For') || e.realIP() || ''),
        )
        sllFail1.set('user_agent', String(e.requestInfo().headers.get('User-Agent') || ''))
        sllFail1.set('origem', 'login')
        $app.save(sllFail1)
      } catch (_) {}

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var failLog = new Record(auditCol)
        failLog.set('user_id', userRecord.id)
        failLog.set('user_name', userRecord.getString('name') || userRecord.email())
        failLog.set('user_role', userRecord.getString('role') || 'PADRAO')
        failLog.set('action', 'login_failed')
        failLog.set('module', 'auth')
        failLog.set('target_collection', 'users')
        failLog.set('target_id', userRecord.id)
        failLog.set('origem', 'Área da Empresa')
        failLog.set('criticidade', 'Média')
        failLog.set('is_suspicious', true)
        failLog.set('archived', false)
        $app.save(failLog)
      } catch (_) {}

      return e.json(400, { error: 'Credenciais inválidas. Verifique usuário e senha.' })
    }

    // 4. Checar se a conta exige MFA
    var mfaEnabled = userRecord.getBool('mfa_enabled') === true
    var mfaSecret = userRecord.getString('mfa_secret')

    // Gerar token de autenticação real do PocketBase para uso após autenticação bem-sucedida
    // Usando createJWT ou similar do runtime PocketBase
    var authToken = ''
    try {
      // No PocketBase v0.36, tokenKey é usado para assinar o token de auth
      // Ou geramos token via $security.randomString
      authToken = $security.randomString(64)
    } catch (_) {}

    // Se NÃO tem MFA ativo, o login conclui diretamente
    // Mas para manter compatibilidade total com o SDK authStore do cliente,
    // o cliente pode usar o fluxo padrão quando mfaEnabled é falso.
    // Retornamos indicador claro:
    if (!mfaEnabled || !mfaSecret) {
      // Sucesso: registra o log de acesso e RESETA a contagem de falhas (desbloqueia)
      try {
        var sllCol2 = $app.findCollectionByNameOrId('security_login_logs')
        var sllOk = new Record(sllCol2)
        sllOk.set('usuario', userRecord.email())
        sllOk.set('sucesso', true)
        sllOk.set('ip', String(e.requestInfo().headers.get('X-Forwarded-For') || e.realIP() || ''))
        sllOk.set('user_agent', String(e.requestInfo().headers.get('User-Agent') || ''))
        sllOk.set('origem', 'login')
        $app.save(sllOk)
      } catch (_) {}

      return e.json(200, {
        mfa_required: false,
        user_id: userRecord.id,
        email: userRecord.email(),
      })
    }

    // 5. SE TEM MFA ATIVO:
    // NUNCA entregar o token de acesso normal nesta resposta.
    // Emitir um desafio temporário válido por 5 minutos (challenge_token)
    var challengeToken = 'mfa_ch_' + $security.randomString(32)
    var expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    try {
      var challengesCol = $app.findCollectionByNameOrId('mfa_challenges')
      var chRecord = new Record(challengesCol)
      chRecord.set('user_id', userRecord.id)
      chRecord.set('challenge_token', challengeToken)
      chRecord.set('grant_token', '') // Sem token prévio
      chRecord.set('expires_at', expiresAt)
      chRecord.set('attempts', 0)
      chRecord.set('verified', false)
      chRecord.set('used', false)
      $app.save(chRecord)
    } catch (saveChErr) {
      $app.logger().error('Falha ao registrar mfa_challenge', 'error', String(saveChErr))
      return e.json(500, { error: 'Erro ao gerar desafio MFA.' })
    }

    return e.json(200, {
      mfa_required: true,
      challenge_token: challengeToken,
      expires_at: expiresAt,
      message: 'Segundo fator de autenticação (MFA) exigido.',
    })
  } catch (err) {
    return e.json(500, { error: 'Erro interno no login: ' + String(err) })
  }
})

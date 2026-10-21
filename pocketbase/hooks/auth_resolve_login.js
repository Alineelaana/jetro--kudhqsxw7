routerAdd('POST', '/backend/v1/auth/resolve-identity', (e) => {
  try {
    var body = e.requestInfo().body || {}
    var rawIdentity = (body.identity || '').toString().trim()
    if (!rawIdentity) {
      return e.json(400, { error: 'identity is required' })
    }

    var lower = rawIdentity.toLowerCase()

    // Aliases do Administrador Master (SUP)
    if (
      lower === 'alineelaana' ||
      lower === 'jetrosup' ||
      lower === 'jetrosup@jetro.com.br' ||
      lower === 'alineelaana@gmail.com' ||
      lower === 'aline'
    ) {
      return e.json(200, { email: 'alineelaana@gmail.com', resolved: true })
    }

    // Se já contém @, autentica diretamente pelo próprio e-mail
    if (rawIdentity.indexOf('@') !== -1) {
      return e.json(200, { email: rawIdentity, resolved: false })
    }

    // Normalização: minúsculas, trim, aceita letras, números, pontos, traços e underscores
    var normalized = lower.replace(/[^a-z0-9._-]/g, '')
    var safe = normalized.replace(/["\\]/g, '')

    // 1. Tentar busca direta no campo 'login'
    if (safe) {
      try {
        var records = $app.findRecordsByFilter('users', 'login = "' + safe + '"', '', 1, 0)

        if (records && records.length > 0) {
          var userRec = records[0]
          var email = userRec.get('email') || ''
          if (email) {
            return e.json(200, { email: email, resolved: true, user_id: userRec.id })
          }
        }
      } catch (errFind) {
        // Ignora erro 400/parse da query e cai para a busca em memória
        console.log('resolve-identity findRecordsByFilter notice:', errFind)
      }
    }

    // 2. Busca flexível / case-insensitive / prefixo em memória (ex.: "patricia" encontra "patricia.brum")
    try {
      var allMatches = $app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
      var candidate = null

      for (var i = 0; i < allMatches.length; i++) {
        var u = allMatches[i]
        var uLogin = (u.get('login') || '').toString().trim().toLowerCase()
        var uEmail = (u.get('email') || '').toString().trim().toLowerCase()

        // Match exato com login
        if (uLogin && (uLogin === lower || uLogin === normalized)) {
          candidate = u
          break
        }

        // Match com prefixo de login (ex: digitou "patricia", uLogin é "patricia.brum" ou vice-versa)
        if (!candidate && uLogin) {
          if (uLogin.indexOf(normalized + '.') === 0 || normalized.indexOf(uLogin + '.') === 0) {
            candidate = u
          }
        }

        // Match com a parte antes do @ do e-mail
        if (!candidate && uEmail) {
          var emailPrefix = uEmail.split('@')[0]
          if (emailPrefix === lower || emailPrefix === normalized) {
            candidate = u
          } else if (
            emailPrefix.indexOf(normalized + '.') === 0 ||
            normalized.indexOf(emailPrefix + '.') === 0
          ) {
            candidate = u
          }
        }
      }

      if (candidate) {
        var candidateEmail = candidate.get('email') || ''
        if (candidateEmail) {
          return e.json(200, { email: candidateEmail, resolved: true, user_id: candidate.id })
        }
      }
    } catch (errMem) {
      console.log('resolve-identity memory search notice:', errMem)
    }

    // Fallback gracioso: retorna o valor original sem erro para tentar autenticar direto
    return e.json(200, { email: rawIdentity, resolved: false })
  } catch (err) {
    // Nunca derrubar o fluxo de login com status 500 — responde 200 com fallback
    console.log('resolve-identity unhandled error:', err)
    var fallbackIdentity = ''
    try {
      var b = e.requestInfo().body || {}
      fallbackIdentity = (b.identity || '').toString().trim()
    } catch (_) {}
    return e.json(200, { email: fallbackIdentity, resolved: false })
  }
})

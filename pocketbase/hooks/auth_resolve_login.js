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

    // Buscar usuário pelo campo login ou username (sem case sensitivity via SQLite)
    var safe = rawIdentity.replace(/["\\]/g, '')
    var records = $app.findRecordsByFilter(
      'users',
      'login = "' + safe + '" || username = "' + safe + '"',
      '',
      1,
      0,
    )

    if (records.length > 0) {
      var userRec = records[0]
      var email = userRec.get('email') || ''
      if (email) {
        return e.json(200, { email: email, resolved: true, user_id: userRec.id })
      }
    }

    // Se não encontrou pelo login exato, tentar case-insensitive em memória
    var allMatches = $app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
    for (var i = 0; i < allMatches.length; i++) {
      var u = allMatches[i]
      var uLogin = (u.get('login') || '').toString().trim().toLowerCase()
      var uUser = (u.get('username') || '').toString().trim().toLowerCase()
      if (uLogin === lower || uUser === lower) {
        var uEmail = u.get('email') || ''
        if (uEmail) {
          return e.json(200, { email: uEmail, resolved: true, user_id: u.id })
        }
      }
    }

    // Caso não encontre, retorna a própria identidade para o PocketBase avaliar
    return e.json(200, { email: rawIdentity, resolved: false })
  } catch (err) {
    return e.json(500, { error: err.message || 'Erro ao resolver login' })
  }
})

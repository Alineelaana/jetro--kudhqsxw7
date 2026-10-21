// Router hook para resolver login ou e-mail de usuários sem ambiguidade
routerAdd('POST', '/backend/v1/auth/resolve-identity', (e) => {
  try {
    const data = e.requestInfo().body || {}
    let identity = (data.identity || '').trim()
    if (!identity) {
      return e.json(400, { error: 'Identidade não informada' })
    }

    const lower = identity.toLowerCase()

    // 1. Caso especial: Aline (Admin global / SUP)
    if (
      lower === 'alineelaana' ||
      lower === 'jetrosup' ||
      lower === 'jetrosup@jetro.com.br' ||
      lower === 'alineelaana@gmail.com'
    ) {
      return e.json(200, {
        resolved: true,
        email: 'alineelaana@gmail.com',
        user_id: 'ixt73p3a017u157',
        name: 'Aline Lana',
      })
    }

    // 2. Se já é um e-mail válido, buscar diretamente por e-mail
    if (lower.indexOf('@') !== -1) {
      try {
        const u = $app.findAuthRecordByEmail('users', lower)
        if (u) {
          return e.json(200, {
            resolved: true,
            email: u.email(),
            user_id: u.id,
            name: u.get('name') || '',
          })
        }
      } catch (_) {}
    }

    // 3. Sanitizar string para busca segura
    const safe = lower.replace(/[^a-z0-9._-]/g, '')

    // 4. Mapeamento explícito de apelidos/logins rápidos para as contas unificadas multiempresa
    const aliases = {
      // Aline (Código 1)
      aline: 'aline.lana@deceldorado.com.br',
      'aline.dec': 'aline.lana@deceldorado.com.br',
      'aline.gr': 'aline.lana@deceldorado.com.br',
      'aline.eldorado': 'aline.lana@deceldorado.com.br',
      'aline.granromano': 'aline.lana@deceldorado.com.br',
      'aline.lana': 'aline.lana@deceldorado.com.br',

      // Junão (Código 2)
      junao: 'junior@deceldorado.com.br',
      'junao.dec': 'junior@deceldorado.com.br',
      'junao.eldorado': 'junior@deceldorado.com.br',
      'junao.gr': 'junior@deceldorado.com.br',
      'junao.granromano': 'junior@deceldorado.com.br',
      junior: 'junior@deceldorado.com.br',

      // Renata (Código 3)
      renata: 'renata@deceldorado.com.br',
      'renata.dec': 'renata@deceldorado.com.br',
      'renata.eldorado': 'renata@deceldorado.com.br',
      'renata.gr': 'renata@deceldorado.com.br',
      'renata.granromano': 'renata@deceldorado.com.br',

      // Alef (Código 4)
      alef: 'alef@deceldorado.com.br',
      'alef.dec': 'alef@deceldorado.com.br',
      'alef.eldorado': 'alef@deceldorado.com.br',
      'alef.gr': 'alef@deceldorado.com.br',
      'alef.granromano': 'alef@deceldorado.com.br',

      // Rogério (Código 5)
      rogerio: 'rogerio.roque@granfoods.ind.br',
      'rogerio.roque': 'rogerio.roque@granfoods.ind.br',
      'rogerio.gr': 'rogerio.roque@granfoods.ind.br',
      'rogerio.granromano': 'rogerio.roque@granfoods.ind.br',
      'rogerio.dec': 'rogerio.roque@granfoods.ind.br',
      'rogerio.eldorado': 'rogerio.roque@granfoods.ind.br',

      // Patrícia (Código 6)
      patricia: 'patricia.brum@deceldorado.com.br',
      'patricia.brum': 'patricia.brum@deceldorado.com.br',
      'patricia.dec': 'patricia.brum@deceldorado.com.br',
      'patricia.eldorado': 'patricia.brum@deceldorado.com.br',
      'patricia.gr': 'patricia.brum@deceldorado.com.br',
      'patricia.granromano': 'patricia.brum@deceldorado.com.br',

      // Janaína (Código 7)
      janaina: 'janaina.nogueira@deceldorado.com.br',
      'janaina.nogueira': 'janaina.nogueira@deceldorado.com.br',
      'janaina.dec': 'janaina.nogueira@deceldorado.com.br',
      'janaina.eldorado': 'janaina.nogueira@deceldorado.com.br',
      'janaina.gr': 'janaina.nogueira@deceldorado.com.br',
      'janaina.granromano': 'janaina.nogueira@deceldorado.com.br',
    }

    if (aliases[safe]) {
      const targetEmail = aliases[safe]
      try {
        const u = $app.findAuthRecordByEmail('users', targetEmail)
        if (u) {
          return e.json(200, {
            resolved: true,
            email: u.email(),
            user_id: u.id,
            name: u.get('name') || '',
          })
        }
      } catch (_) {}
    }

    // 5. Busca no banco por campo login exato
    try {
      const records = $app.findRecordsByFilter(
        'users',
        'login = {:login} || username = {:login}',
        '-created',
        5,
        0,
        { login: safe },
      )

      if (records && records.length > 0) {
        const u = records[0]
        return e.json(200, {
          resolved: true,
          email: u.email(),
          user_id: u.id,
          name: u.get('name') || '',
        })
      }
    } catch (_) {}

    // 6. Busca por prefixo no email (ex.: patricia@...)
    try {
      const records = $app.findRecordsByFilter('users', 'email ~ {:prefix}', '-created', 5, 0, {
        prefix: safe,
      })

      if (records && records.length > 0) {
        const u = records[0]
        return e.json(200, {
          resolved: true,
          email: u.email(),
          user_id: u.id,
          name: u.get('name') || '',
        })
      }
    } catch (_) {}

    return e.json(404, {
      resolved: false,
      error: 'Usuário não encontrado',
    })
  } catch (err) {
    console.log('auth_resolve_login error:', err)
    return e.json(500, { error: 'Erro ao resolver login' })
  }
})

// Migration to update user Aline's email and password idempotently
migrate(
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return

      let user = null

      // 1. Localizar pelo ID exato '4h8ha8xhb43nxvg'
      try {
        user = app.findRecordById('users', '4h8ha8xhb43nxvg')
      } catch (_) {}

      // 2. Localizar por email atual
      if (!user) {
        try {
          user = app.findAuthRecordByEmail('users', 'aline@deceldorado.com.br')
        } catch (_) {}
      }

      // 3. Localizar por email já atualizado (idempotência)
      if (!user) {
        try {
          user = app.findAuthRecordByEmail('users', 'aline.lana@deceldorado.com.br')
        } catch (_) {}
      }

      // 4. Localizar por login 'aline' e código 1
      if (!user) {
        try {
          const list = app.findRecordsByFilter(
            'users',
            'login = "aline" || (codigo = 1 && role = "SUP")',
            'created',
            1,
            0,
          )
          if (list && list.length > 0) user = list[0]
        } catch (_) {}
      }

      if (user) {
        // Atualiza email para aline.lana@deceldorado.com.br
        user.setEmail('aline.lana@deceldorado.com.br')
        // Redefine a senha para Huram@2026 (o PocketBase gera o hash automaticamente)
        user.setPassword('Huram@2026')
        // Garante que o registro permaneça ativo e verificado
        user.setVerified(true)
        user.set('active', true)

        // Preserva todos os outros campos (perfil, empresa, permissões, cargo, codigo, flags)
        app.save(user)
        console.log(
          'Migration 0281: Usuário Aline (id=' +
            user.id +
            ', codigo=' +
            user.get('codigo') +
            ') atualizado com sucesso para email=aline.lana@deceldorado.com.br e senha redefinida.',
        )
      } else {
        console.log('Migration 0281: Nenhum registro do usuário Aline encontrado (no-op).')
      }
    } catch (err) {
      console.log('Migration 0281 error:', err)
      throw err
    }
  },
  (app) => {
    try {
      let user = null
      try {
        user = app.findRecordById('users', '4h8ha8xhb43nxvg')
      } catch (_) {}

      if (!user) {
        try {
          user = app.findAuthRecordByEmail('users', 'aline.lana@deceldorado.com.br')
        } catch (_) {}
      }

      if (user) {
        user.setEmail('aline@deceldorado.com.br')
        app.save(user)
      }
    } catch (_) {}
  },
)

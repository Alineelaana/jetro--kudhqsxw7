migrate(
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return

      // Decisão de arquitetura e governança:
      // A conta SUP (Aline Lana / alineelaana@gmail.com) é a conta mestra de administração global
      // do sistema ERP HURAM, não sendo funcionária operacional.
      // Atribuímos o código 0 para a conta SUP, reservando a numeração 1 a 7 exclusivamente
      // para os usuários operacionais fixos:
      // Aline (operacional) = 1, Junão = 2, Renata = 3, Alef = 4, Rogério = 5, Patrícia = 6, Janaína = 7.
      // Novos funcionários criados subsequentemente receberão números a partir de 8.

      // 1. Identificar conta SUP e atribuir código 0 se estiver duplicado (ou não for 0)
      let supUser = null
      try {
        supUser = app.findAuthRecordByEmail('users', 'alineelaana@gmail.com')
      } catch (_) {}

      if (!supUser) {
        try {
          const list = app.findRecordsByFilter(
            'users',
            'role = "SUP" || perfil_acesso = "SUP"',
            'created',
            1,
            0,
          )
          if (list && list.length > 0) supUser = list[0]
        } catch (_) {}
      }

      if (supUser) {
        supUser.set('codigo', 0)
        supUser.set('verified', true)
        app.save(supUser)
      }

      // 2. Garantir códigos fixos 1–7 dos 7 usuários operacionais intactos e verified = true
      const operationalUsersMap = [
        { code: 1, email: 'aline@deceldorado.com.br', login: 'aline' },
        { code: 2, email: 'junior@deceldorado.com.br', login: 'junao' },
        { code: 3, email: 'renata@deceldorado.com.br', login: 'renata' },
        { code: 4, email: 'alef@deceldorado.com.br', login: 'alef' },
        { code: 5, email: 'rogerio.roque@granfoods.ind.br', login: 'rogerio.roque' },
        { code: 6, email: 'patricia.brum@deceldorado.com.br', login: 'patricia.brum' },
        { code: 7, email: 'janaina.nogueira@deceldorado.com.br', login: 'janaina.nogueira' },
      ]

      for (let i = 0; i < operationalUsersMap.length; i++) {
        const item = operationalUsersMap[i]
        let userRec = null
        try {
          userRec = app.findAuthRecordByEmail('users', item.email)
        } catch (_) {}

        if (!userRec) {
          try {
            const list = app.findRecordsByFilter('users', 'login = {:login}', 'created', 1, 0, {
              login: item.login,
            })
            if (list && list.length > 0) userRec = list[0]
          } catch (_) {}
        }

        if (userRec) {
          userRec.set('codigo', item.code)
          userRec.set('verified', true)
          app.save(userRec)
        }
      }

      // 3. Garantir verified = true para todos os usuários existentes
      // e resolver eventuais outros conflitos de código duplicado
      const allUsers = app.findRecordsByFilter('users', 'id != ""', 'codigo,created', 0, 0)
      const usedCodes = {}
      if (supUser) {
        usedCodes[0] = true
      }
      for (let i = 1; i <= 7; i++) {
        usedCodes[i] = true
      }

      let nextAvailableCode = 8
      for (let i = 0; i < allUsers.length; i++) {
        const u = allUsers[i]
        u.set('verified', true)

        // Se for o SUP ou um dos 7 operacionais, já foi verificado e garantido
        if (supUser && u.id === supUser.id) {
          app.save(u)
          continue
        }

        const isOperational = operationalUsersMap.some((op) => op.email === u.get('email'))
        if (isOperational) {
          app.save(u)
          continue
        }

        // Para outros usuários, verificar se há código atribuído e se colide
        const currentCode = u.get('codigo')
        if (
          typeof currentCode !== 'number' ||
          currentCode === null ||
          currentCode === undefined ||
          currentCode <= 0 ||
          usedCodes[currentCode]
        ) {
          while (usedCodes[nextAvailableCode]) {
            nextAvailableCode++
          }
          u.set('codigo', nextAvailableCode)
          usedCodes[nextAvailableCode] = true
          nextAvailableCode++
        } else {
          usedCodes[currentCode] = true
        }

        app.save(u)
      }

      // 4. Ajustar restrição do campo 'codigo' para permitir 0 (min: 0)
      const codigoField = usersCol.fields.getByName('codigo')
      if (codigoField) {
        codigoField.min = 0
      }

      // 5. Garantir índice único no campo codigo (CREATE UNIQUE INDEX `idx_users_codigo` ON `users` (`codigo`))
      const existingIndexes = usersCol.indexes || []
      const indexDefinition =
        'CREATE UNIQUE INDEX `idx_users_codigo` ON `users` (`codigo`) WHERE `codigo` IS NOT NULL'

      let hasCodigoIndex = false
      for (let i = 0; i < existingIndexes.length; i++) {
        if (
          existingIndexes[i].indexOf('idx_users_codigo') !== -1 ||
          existingIndexes[i].indexOf('(`codigo`)') !== -1
        ) {
          hasCodigoIndex = true
          break
        }
      }

      if (!hasCodigoIndex) {
        existingIndexes.push(indexDefinition)
        usersCol.indexes = existingIndexes
      }

      app.save(usersCol)
    } catch (err) {
      console.log('Migration 0276 error:', err)
      throw err
    }
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return
      usersCol.indexes = (usersCol.indexes || []).filter(
        (idx) => idx.indexOf('idx_users_codigo') === -1,
      )
      app.save(usersCol)
    } catch (_) {}
  },
)

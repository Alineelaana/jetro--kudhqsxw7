migrate(
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return

      // 1. Garantir campo numérico 'codigo'
      if (!usersCol.fields.getByName('codigo')) {
        usersCol.fields.add(
          new NumberField({
            name: 'codigo',
            min: 1,
            onlyInt: true,
          }),
        )
      }

      // 2. Ajustar índice único de login para composto (empresa_id + login)
      // para permitir que usuários existam nas duas empresas sem conflito
      const existingIndexes = usersCol.indexes || []
      const filteredIndexes = existingIndexes.filter((idx) => idx.indexOf('idx_users_login') === -1)

      const compoundIndex =
        "CREATE UNIQUE INDEX `idx_users_empresa_login` ON `users` (`empresa_id`, `login`) WHERE `login` != ''"

      let hasCompound = false
      for (let i = 0; i < filteredIndexes.length; i++) {
        if (
          filteredIndexes[i].indexOf('idx_users_empresa_login') !== -1 ||
          filteredIndexes[i].indexOf('(`empresa_id`, `login`)') !== -1
        ) {
          hasCompound = true
          break
        }
      }

      if (!hasCompound) {
        filteredIndexes.push(compoundIndex)
      }

      usersCol.indexes = filteredIndexes
      app.save(usersCol)

      // Identificar empresas e filiais
      const decId = '0jcxfj3r9a7gogd'
      const decFilialId = '51ma2zu30b85j2l'
      const grId = 't4wx2m5n5jucy9z'
      const grFilialId = 'fhy6eznfyr8krxq'

      // Perfis
      let rhDpPerfilId = 'kkijxsp801zif1l'
      let padraoPerfilId = 'g56p9yl4qhrqyz3'

      try {
        const rhRec = app.findFirstRecordByData('perfis_permissoes', 'code', 'RH / DP')
        if (rhRec) rhDpPerfilId = rhRec.id
      } catch (_) {}

      try {
        const padraoRec = app.findFirstRecordByData('perfis_permissoes', 'code', 'PADRAO')
        if (padraoRec) padraoPerfilId = padraoRec.id
      } catch (_) {}

      const tempPassword = 'huram123'

      // Função auxiliar para encontrar ou criar usuário
      const ensureUser = (params) => {
        let user = null
        try {
          if (params.email) {
            user = app.findAuthRecordByEmail('users', params.email)
          }
        } catch (_) {}

        if (!user && params.filter) {
          try {
            const list = app.findRecordsByFilter('users', params.filter, '', 1, 0)
            if (list && list.length > 0) user = list[0]
          } catch (_) {}
        }

        if (!user) {
          user = new Record(usersCol)
          user.setPassword(params.password || tempPassword)
          if (params.email) user.setEmail(params.email)
          user.set('emailVisibility', false)
          user.set('verified', false)
        }

        if (params.name !== undefined) user.set('name', params.name)
        if (params.login !== undefined) {
          user.set('login', params.login)
          user.set('username', params.login)
        }
        if (params.codigo !== undefined) user.set('codigo', params.codigo)
        if (params.empresa_id !== undefined) user.set('empresa_id', params.empresa_id)
        if (params.filial_id !== undefined) user.set('filial_id', params.filial_id)
        if (params.role !== undefined) user.set('role', params.role)
        if (params.perfil_id !== undefined) user.set('perfil_id', params.perfil_id)
        if (params.perfil_acesso !== undefined) user.set('perfil_acesso', params.perfil_acesso)
        if (params.cargo !== undefined) user.set('cargo', params.cargo)
        if (params.departamento !== undefined) user.set('departamento', params.departamento)
        if (params.active !== undefined) user.set('active', params.active)
        if (params.inactivity_timeout_minutes !== undefined) {
          user.set('inactivity_timeout_minutes', params.inactivity_timeout_minutes)
        }

        app.save(user)
        return user
      }

      // 1. Aline (Código 1) - Perfil RH / DP nas duas empresas
      // Dec Eldorado
      ensureUser({
        filter: 'email = "aline@deceldorado.com.br" || login = "aline.dec"',
        email: 'aline@deceldorado.com.br',
        name: 'Aline',
        login: 'aline.dec',
        codigo: 1,
        empresa_id: decId,
        filial_id: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Recursos Humanos / DP',
        departamento: 'Recursos Humanos',
        active: true,
        inactivity_timeout_minutes: 480,
      })
      // Gran Romano
      ensureUser({
        filter: 'email = "aline@granromano.com.br" || login = "aline.gr"',
        email: 'aline@granromano.com.br',
        name: 'Aline',
        login: 'aline.gr',
        codigo: 1,
        empresa_id: grId,
        filial_id: grFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Recursos Humanos / DP',
        departamento: 'Recursos Humanos',
        active: true,
        inactivity_timeout_minutes: 480,
      })

      // Usuária global Aline Lana (SUP) recebe também código 1
      try {
        const alineSup = app.findAuthRecordByEmail('users', 'alineelaana@gmail.com')
        if (alineSup) {
          alineSup.set('codigo', 1)
          app.save(alineSup)
        }
      } catch (_) {}

      // 2. Junão (Código 2) - Perfil RH / DP nas duas empresas
      // Dec Eldorado (já existente como junior@deceldorado.com.br)
      ensureUser({
        filter: 'email = "junior@deceldorado.com.br" || login = "junao"',
        email: 'junior@deceldorado.com.br',
        name: 'Junão',
        login: 'junao',
        codigo: 2,
        empresa_id: decId,
        filial_id: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Diretor / CEO',
        active: true,
        inactivity_timeout_minutes: 480,
      })
      // Gran Romano (réplica)
      ensureUser({
        filter: 'email = "junao@granromano.com.br" || login = "junao.gr"',
        email: 'junao@granromano.com.br',
        name: 'Junão',
        login: 'junao.gr',
        codigo: 2,
        empresa_id: grId,
        filial_id: grFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Diretor / CEO',
        active: true,
        inactivity_timeout_minutes: 480,
      })

      // 3. Renata (Código 3) - Perfil RH / DP nas duas empresas
      // Dec Eldorado (já existente como renata@deceldorado.com.br)
      ensureUser({
        filter: 'email = "renata@deceldorado.com.br" || login = "renata"',
        email: 'renata@deceldorado.com.br',
        name: 'Renata',
        login: 'renata',
        codigo: 3,
        empresa_id: decId,
        filial_id: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Diretora ADM',
        active: true,
        inactivity_timeout_minutes: 480,
      })
      // Gran Romano (réplica)
      ensureUser({
        filter: 'email = "renata@granromano.com.br" || login = "renata.gr"',
        email: 'renata@granromano.com.br',
        name: 'Renata',
        login: 'renata.gr',
        codigo: 3,
        empresa_id: grId,
        filial_id: grFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Diretora ADM',
        active: true,
        inactivity_timeout_minutes: 480,
      })

      // 4. Alef (Código 4) - Mesmo perfil (PADRAO) nas duas empresas
      // Dec Eldorado (já existente)
      ensureUser({
        filter: 'email = "alef@deceldorado.com.br" || login = "alef"',
        email: 'alef@deceldorado.com.br',
        name: 'Alef',
        login: 'alef',
        codigo: 4,
        empresa_id: decId,
        filial_id: decFilialId,
        role: 'PADRAO',
        perfil_id: padraoPerfilId,
        perfil_acesso: 'PADRAO',
        active: true,
      })
      // Gran Romano (réplica)
      ensureUser({
        filter: 'email = "alef@granromano.com.br" || login = "alef.gr"',
        email: 'alef@granromano.com.br',
        name: 'Alef',
        login: 'alef.gr',
        codigo: 4,
        empresa_id: grId,
        filial_id: grFilialId,
        role: 'PADRAO',
        perfil_id: padraoPerfilId,
        perfil_acesso: 'PADRAO',
        active: true,
      })

      // 5. Rogério (Código 5) - Mesmo perfil (PADRAO) nas duas empresas
      // Gran Romano (já existente como rogerio.roque@granfoods.ind.br)
      ensureUser({
        filter:
          'email = "rogerio.roque@granfoods.ind.br" || email = "rogerio@granromano.com.br" || login = "rogerio" || login = "rogerio.roque"',
        email: 'rogerio.roque@granfoods.ind.br',
        name: 'Rogerio',
        login: 'rogerio.roque',
        codigo: 5,
        empresa_id: grId,
        filial_id: grFilialId,
        role: 'PADRAO',
        perfil_id: padraoPerfilId,
        perfil_acesso: 'PADRAO',
        active: true,
      })
      // Dec Eldorado (réplica)
      ensureUser({
        filter: 'email = "rogerio@deceldorado.com.br" || login = "rogerio.dec"',
        email: 'rogerio@deceldorado.com.br',
        name: 'Rogerio',
        login: 'rogerio.dec',
        codigo: 5,
        empresa_id: decId,
        filial_id: decFilialId,
        role: 'PADRAO',
        perfil_id: padraoPerfilId,
        perfil_acesso: 'PADRAO',
        active: true,
      })

      // 6. Patricia (Código 6) - Mesmo perfil (RH / DP) nas duas empresas
      // Dec Eldorado (existente patricia.brum@deceldorado.com.br)
      ensureUser({
        filter:
          'email = "patricia.brum@deceldorado.com.br" || login = "patricia" || login = "patricia.brum"',
        email: 'patricia.brum@deceldorado.com.br',
        name: 'Patricia',
        login: 'patricia.brum',
        codigo: 6,
        empresa_id: decId,
        filial_id: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Departamento Pessoal',
        departamento: 'Departamento Pessoal',
        active: true,
      })
      // Gran Romano (réplica)
      ensureUser({
        filter: 'email = "patricia@granromano.com.br" || login = "patricia.gr"',
        email: 'patricia@granromano.com.br',
        name: 'Patricia',
        login: 'patricia.gr',
        codigo: 6,
        empresa_id: grId,
        filial_id: grFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Departamento Pessoal',
        departamento: 'Departamento Pessoal',
        active: true,
      })

      // 7. Janaína (Código 7) - Mesmo perfil (RH / DP) nas duas empresas
      // Dec Eldorado (existente janaina.nogueira@deceldorado.com.br)
      ensureUser({
        filter:
          'email = "janaina.nogueira@deceldorado.com.br" || login = "janaina" || login = "janaina.nogueira"',
        email: 'janaina.nogueira@deceldorado.com.br',
        name: 'Janaína',
        login: 'janaina.nogueira',
        codigo: 7,
        empresa_id: decId,
        filial_id: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Recursos Humanos',
        departamento: 'Recursos Humanos',
        active: true,
      })
      // Gran Romano (réplica)
      ensureUser({
        filter: 'email = "janaina@granromano.com.br" || login = "janaina.gr"',
        email: 'janaina@granromano.com.br',
        name: 'Janaína',
        login: 'janaina.gr',
        codigo: 7,
        empresa_id: grId,
        filial_id: grFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Recursos Humanos',
        departamento: 'Recursos Humanos',
        active: true,
      })

      // Backfill de outros usuários caso existam sem código
      const allUsers = app.findRecordsByFilter('users', 'id != ""', 'created', 0, 0)
      let nextAvailableCode = 8
      for (let i = 0; i < allUsers.length; i++) {
        const u = allUsers[i]
        const currentCode = u.get('codigo')
        if (!currentCode || currentCode <= 0) {
          u.set('codigo', nextAvailableCode++)
          app.save(u)
        }
      }
    } catch (err) {
      console.log('Migration 0274 error:', err)
      throw err
    }
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return
      usersCol.fields.removeByName('codigo')
      app.save(usersCol)
    } catch (_) {}
  },
)

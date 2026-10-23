// Migração 0289: Hardening de Segurança, Correção de Elevação de Privilégios, Desafio MFA e Eliminação de Senhas Fixas
migrate(
  (app) => {
    // 1. Criar coleção para desafios temporários de MFA (mfa_challenges)
    try {
      const existingChallenges = app.findCollectionByNameOrId('mfa_challenges')
      if (!existingChallenges) {
        throw new Error('not found')
      }
    } catch (_) {
      const challengesCol = new Collection({
        name: 'mfa_challenges',
        type: 'base',
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'user_id', type: 'text', required: true },
          { name: 'challenge_token', type: 'text', required: true },
          { name: 'grant_token', type: 'text', required: false },
          { name: 'expires_at', type: 'text', required: true },
          { name: 'attempts', type: 'number', required: false },
          { name: 'verified', type: 'bool', required: false },
          { name: 'used', type: 'bool', required: false },
          { name: 'ip_address', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(challengesCol)
      console.log('Migration 0289: Coleção mfa_challenges criada com sucesso.')
    }

    // 2. Criar coleção para rastreamento de códigos TOTP reutilizados (mfa_used_codes)
    try {
      const existingUsedCodes = app.findCollectionByNameOrId('mfa_used_codes')
      if (!existingUsedCodes) {
        throw new Error('not found')
      }
    } catch (_) {
      const usedCodesCol = new Collection({
        name: 'mfa_used_codes',
        type: 'base',
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'user_id', type: 'text', required: true },
          { name: 'code_hash', type: 'text', required: true },
          { name: 'time_step', type: 'number', required: true },
          { name: 'used_at', type: 'text', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(usedCodesCol)
      console.log('Migration 0289: Coleção mfa_used_codes criada com sucesso.')
    }

    // 3. Atualizar regras de RLS da coleção users para impedir elevação de privilégio
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (usersCol) {
      // Bloquear criação pública de usuários: apenas administradores SUP autenticados podem criar usuários
      usersCol.createRule = "@request.auth.id != '' && @request.auth.role = 'SUP'"

      // Bloquear edição não autorizada:
      // Usuários SUP podem atualizar qualquer registro.
      // Usuários comuns podem atualizar apenas o próprio registro e NUNCA alterar papéis, permissões, empresas,
      // status ativo, código, campos MFA ou flags de redefinição de senha.
      usersCol.updateRule =
        "@request.auth.id != '' && (@request.auth.role = 'SUP' || (" +
        'id = @request.auth.id && ' +
        '@request.body.role:changed = false && ' +
        '@request.body.perfil_acesso:changed = false && ' +
        '@request.body.perfil_id:changed = false && ' +
        '@request.body.active:changed = false && ' +
        '@request.body.empresa_id:changed = false && ' +
        '@request.body.filial_id:changed = false && ' +
        '@request.body.empresas_ids:changed = false && ' +
        '@request.body.mfa_secret:changed = false && ' +
        '@request.body.mfa_enabled:changed = false && ' +
        '@request.body.mfa_verified_at:changed = false && ' +
        '@request.body.codigo:changed = false && ' +
        '@request.body.force_password_change:changed = false && ' +
        '@request.body.must_change_password:changed = false' +
        '))'

      // Exclusão permitida exclusivamente para SUP
      usersCol.deleteRule = "@request.auth.role = 'SUP'"

      app.save(usersCol)
      console.log(
        'Migration 0289: Regras de RLS da coleção users fortalecidas contra elevação de privilégio.',
      )
    }

    // 4. Tratamento de contas afetadas por credenciais históricas previsíveis (Problema 3)
    // Localizar a conta afetada pela migração 0281 (Aline Lana) e contas correlatas
    try {
      const candidates = []

      try {
        const uById = app.findRecordById('users', '4h8ha8xhb43nxvg')
        if (uById) candidates.push(uById)
      } catch (_) {}

      try {
        const uByEmail1 = app.findAuthRecordByEmail('users', 'aline.lana@deceldorado.com.br')
        if (uByEmail1) candidates.push(uByEmail1)
      } catch (_) {}

      try {
        const uByEmail2 = app.findAuthRecordByEmail('users', 'aline@deceldorado.com.br')
        if (uByEmail2) candidates.push(uByEmail2)
      } catch (_) {}

      try {
        const uByEmail3 = app.findAuthRecordByEmail('users', 'alineelaana@gmail.com')
        if (uByEmail3) candidates.push(uByEmail3)
      } catch (_) {}

      const handledIds = {}
      for (let i = 0; i < candidates.length; i++) {
        const user = candidates[i]
        if (!user || handledIds[user.id]) continue
        handledIds[user.id] = true

        // Marcar para troca obrigatória de senha no próximo acesso
        user.set('force_password_change', true)
        user.set('must_change_password', true)

        // Salvar com privilégio de backend
        app.save(user)
        console.log(
          'Migration 0289: Usuário ' +
            user.id +
            ' (' +
            user.email() +
            ') marcado com redefinição de senha obrigatória.',
        )

        // Invalidar sessões ativas existentes na audit_sessions para evitar uso continuado de tokens antigos
        try {
          const sessList = app.findRecordsByFilter(
            'audit_sessions',
            'user_id = {:userId} && status = "active"',
            '-created',
            50,
            0,
            { userId: user.id },
          )
          for (let s = 0; s < sessList.length; s++) {
            sessList[s].set('status', 'closed')
            sessList[s].set('is_invalidated', true)
            sessList[s].set(
              'terminated_reason',
              'Segurança: invalidação preventiva de credencial prévia (Migração 0289)',
            )
            app.save(sessList[s])
          }
        } catch (_) {}
      }
    } catch (err) {
      console.log('Migration 0289 warning (sessões/reset):', err)
    }

    // 5. Garantir que a conta da coleção 'clients' (seed 0027) não mantenha credencial fixa conhecida
    try {
      const client = app.findAuthRecordByEmail('clients', 'alineelaana@gmail.com')
      if (client) {
        // Redefinir para senha aleatória de alta entropia
        const randPass = $security.randomString(32) + $security.randomString(32)
        client.setPassword(randPass)
        app.save(client)
        console.log(
          'Migration 0289: Credencial de demonstração em clients anonimizada com entropia criptográfica.',
        )
      }
    } catch (_) {}
  },
  (app) => {
    // Reversão
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (usersCol) {
        usersCol.createRule = ''
        usersCol.updateRule =
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || id = @request.auth.id)"
        app.save(usersCol)
      }
    } catch (_) {}
  },
)

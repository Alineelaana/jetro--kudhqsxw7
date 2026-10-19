migrate(
  (app) => {
    let user = null

    // 1. Tenta localizar pelo id conhecido
    try {
      user = app.findRecordById('users', 't2ls955cvcpburb')
    } catch (_) {}

    // 2. Se não achou por id, tenta pelo email atual
    if (!user) {
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', 'jetrosup@jetro.com.br')
      } catch (_) {}
    }

    // 3. Tenta por username legado 'jetrosup'
    if (!user) {
      try {
        user = app.findFirstRecordByData('users', 'username', 'jetrosup')
      } catch (_) {}
    }

    // 4. Se já foi alterado para alineelaana@gmail.com, carrega para garantir idempotência
    if (!user) {
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com')
      } catch (_) {}
    }

    if (user) {
      // Atualiza email e nome solicitados pelo usuário
      user.setEmail('alineelaana@gmail.com')
      user.set('name', 'Aline Lana')

      // Garante que a conta permanece verificada, ativa e com permissão SUP
      user.setVerified(true)
      user.set('role', 'SUP')
      user.set('active', true)

      // NÃO altera a senha (não chama setPassword nem mexe em passwordHash)
      // Preserva todos os demais campos existentes do registro (avatar, fuso_horario, attendant_status, etc.)
      app.save(user)
      console.log(
        'Migração 0259: Dados do usuário SUP atualizados com sucesso (id=' +
          user.id +
          ', email=alineelaana@gmail.com, name=Aline Lana, role=SUP).',
      )
    } else {
      console.log(
        'Migração 0259: Nenhum registro de usuário correspondente encontrado. No-op em banco vazio.',
      )
    }
  },
  (app) => {
    try {
      let user = null
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com')
      } catch (_) {}

      if (!user) {
        try {
          user = app.findRecordById('users', 't2ls955cvcpburb')
        } catch (_) {}
      }

      if (user) {
        user.setEmail('jetrosup@jetro.com.br')
        user.set('name', 'Jetro Admin')
        user.setVerified(true)
        user.set('role', 'SUP')
        app.save(user)
      }
    } catch (_) {}
  },
)

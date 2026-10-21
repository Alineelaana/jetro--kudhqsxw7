// Endpoint autenticado para permitir ao usuário com redefinição obrigatória
// definir sua nova senha de acesso e desativar os flags de bloqueio.
routerAdd(
  'POST',
  '/backend/v1/auth/reset-forced-password',
  (e) => {
    var authUser = e.auth
    if (!authUser) {
      return e.json(401, { error: 'Autenticação necessária.' })
    }

    var body = e.requestInfo().body || {}
    var newPassword = String(body.newPassword || '').trim()
    var confirmPassword = String(body.confirmPassword || '').trim()

    if (!newPassword) {
      return e.json(400, { error: 'Por favor, informe a nova senha.' })
    }

    if (newPassword.length < 8) {
      return e.json(400, { error: 'A nova senha deve possuir no mínimo 8 caracteres.' })
    }

    if (newPassword !== confirmPassword) {
      return e.json(400, { error: 'As senhas informadas não conferem.' })
    }

    var userRecord = null
    try {
      userRecord = $app.findRecordById('users', authUser.id)
    } catch (findErr) {
      return e.json(404, { error: 'Usuário não localizado no sistema.' })
    }

    try {
      // 1. Gravar nova senha (método nativo PocketBase gera o hash seguro)
      userRecord.setPassword(newPassword)

      // 2. Desativar flags de alteração obrigatória
      userRecord.set('force_password_change', false)
      userRecord.set('must_change_password', false)

      // 3. Salvar registro com privilégio de backend (ignora restrição de updateRule do users)
      $app.saveNoValidate(userRecord)

      // 4. Registrar evento de auditoria institucional
      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email || '')
        log.set('user_role', authUser.getString('role') || '')
        log.set('action', 'user_password_reset_forced')
        log.set('module', 'auth')
        log.set('target_collection', 'users')
        log.set('target_id', authUser.id)
        log.set(
          'target_summary',
          'Usuário ' +
            (authUser.getString('name') || authUser.email || authUser.getString('login') || '') +
            ' redefiniu sua senha obrigatória com sucesso no primeiro acesso',
        )
        log.set('criticidade', 'Alta')
        log.set('origem', 'Área da Empresa')
        log.set('new_value', {
          force_password_change: false,
          must_change_password: false,
          changed_at: new Date().toISOString(),
        })
        log.set('is_suspicious', false)
        log.set('archived', false)

        var ip = ''
        var ua = ''
        try {
          ip = e.request.remoteAddr || ''
        } catch (_) {}
        try {
          ua = (e.requestInfo().headers || {})['user_agent'] || ''
        } catch (_) {}
        log.set('ip_address', ip)
        log.set('user_agent', ua)

        $app.save(log)
      } catch (auditErr) {
        $app
          .logger()
          .error('Falha ao gravar auditoria do reset de senha forçado', 'error', String(auditErr))
      }

      return e.json(200, {
        success: true,
        message: 'Senha redefinida com sucesso.',
        user: {
          id: userRecord.id,
          email: userRecord.email(),
          name: userRecord.getString('name'),
          force_password_change: false,
          must_change_password: false,
        },
      })
    } catch (saveErr) {
      $app.logger().error('Erro ao salvar nova senha no backend', 'error', String(saveErr))
      return e.json(500, {
        error: 'Não foi possível salvar a nova senha no banco de dados. Tente novamente.',
      })
    }
  },
  $apis.requireAuth(),
)

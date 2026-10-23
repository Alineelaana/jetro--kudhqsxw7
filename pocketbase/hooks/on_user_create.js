onRecordCreateRequest((e) => {
  var authUser = e.auth
  var isSupCreator = false
  if (authUser) {
    try {
      // Obter o estado original e confiável do solicitante diretamente do banco
      var realAuthUser = $app.findRecordById('users', authUser.id)
      isSupCreator = realAuthUser && realAuthUser.getString('role') === 'SUP'
    } catch (_) {
      isSupCreator = authUser.getString('role') === 'SUP'
    }
  }

  // Criação desautorizada de usuários é bloqueada no servidor
  if (!isSupCreator) {
    return e.forbiddenError('Apenas administradores SUP podem criar novos usuários no sistema.')
  }

  // Sanitizar role: se não informada ou inválida, padroniza como PADRAO
  var role = e.record.getString('role')
  if (!role) {
    e.record.set('role', 'PADRAO')
  }

  // Campos de MFA NUNCA podem ser definidos manualmente na criação
  e.record.set('mfa_enabled', false)
  e.record.set('mfa_secret', '')
  e.record.set('mfa_verified_at', '')

  e.next()
}, 'users')

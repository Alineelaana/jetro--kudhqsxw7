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

  // BUG 1 (correção): usuário criado pelo admin deve conseguir logar no
  // PRIMEIRO acesso com a senha definida no cadastro.
  //  - verified = true: conta criada por administrador não nasce pendente de verificação;
  //  - force_password_change / must_change_password só permanecem verdadeiros se o
  //    admin os enviou EXPLICITAMENTE como true no corpo da requisição — nunca por
  //    padrão (por padrão eles bloqueavam o primeiro login sem mensagem clara).
  e.record.set('verified', true)
  var body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {
    body = {}
  }
  if (body.force_password_change !== true) {
    e.record.set('force_password_change', false)
  }
  if (body.must_change_password !== true) {
    e.record.set('must_change_password', false)
  }

  e.next()
}, 'users')

// Criação de usuários — HURAM
//
// CAUSA RAIZ do erro "verified: Values don't match.":
// No PocketBase v0.23+, hooks de REQUISIÇÃO (onRecordCreateRequest) rodam ANTES
// da validação do formulário. Ao alterar campos do registro ali (ex.: `verified`),
// o validador compara o valor enviado pelo cliente (ausente) com o valor alterado
// pelo hook (true) e falha com validation_values_mismatch.
//
// CORREÇÃO DEFINITIVA:
//  - onRecordCreateRequest: APENAS autorização (quem pode criar). Nenhum e.record.set aqui.
//  - onRecordCreate (hook de BANCO): roda DEPOIS da validação — é o lugar seguro para
//    sanitizar campos (verified, role, MFA).
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

  e.next()
}, 'users')

// Hook de BANCO (após validação): mutações de campos não disparam
// "Values don't match" aqui.
onRecordCreate((e) => {
  // Sanitizar role: se não informada ou vazia, padroniza como PADRAO
  var role = e.record.getString('role')
  if (!role) {
    e.record.set('role', 'PADRAO')
  }

  // Campos de MFA NUNCA podem ser definidos manualmente na criação
  e.record.set('mfa_enabled', false)
  e.record.set('mfa_secret', '')
  e.record.set('mfa_verified_at', '')

  // Usuário criado pelo administrador nasce verificado: consegue logar no
  // PRIMEIRO acesso com a senha definida no cadastro, sem pendência de
  // verificação de e-mail.
  e.record.set('verified', true)

  // force_password_change / must_change_password: o formulário envia o valor
  // real do toggle (o serviço já grava false quando ausente), nada a forçar aqui.

  // CRÍTICO: sem e.next() o PocketBase NÃO grava o registro, mas a API ainda
  // responde 200 — o "usuário criado" nunca existia no banco e o vínculo em
  // usuarios_empresas falhava com 400 (relação usuario apontando para um
  // registro inexistente), deixando a tela com sucesso falso.
  e.next()
}, 'users')

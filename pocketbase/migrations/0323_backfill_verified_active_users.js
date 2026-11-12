// Migração 0323: backfill de verificação dos usuários criados pelo administrador
// ANTES da correção do hook on_user_create (v0.0.702/703).
//
// CONTEXTUALIZAÇÃO (v0.0.704):
// Usuários criados pelo SUP antes da correção (ex.: sairana.duarte, código 13,
// criada em 2026-11-05) ficaram com verified = false e não conseguiam acessar o
// sistema. Como o ERP gerencia verificação internamente (nenhum e-mail de
// verificação é enviado e o login de conta criada por administrador nunca deve
// ser bloqueado por "e-mail não verificado"), todo usuário ATIVO criado pelo
// administrador deve estar com verified = true.
//
// IDEMPOTENTE: seleciona apenas registros ativos com verified = false; em uma
// base já corrigida não altera nada (no-op), podendo ser reaplicada com
// segurança em qualquer cópia do projeto.
migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // Garantia estrutural: o ERP gerencia a verificação internamente — a auth
    // collection NÃO pode exigir e-mail verificado para autenticar (onlyVerified).
    if (usersCol.onlyVerified) {
      usersCol.onlyVerified = false
      app.save(usersCol)
      console.log('Migration 0323: onlyVerified desativado na auth collection users.')
    }

    // Backfill: usuários ativos criados antes da correção nasceram sem verified
    let backfilled = 0
    const pending = app.findRecordsByFilter(
      'users',
      'active = true && verified = false',
      '-created',
      500,
      0,
    )
    for (let i = 0; i < pending.length; i++) {
      const user = pending[i]
      user.set('verified', true)
      app.save(user)
      backfilled++
      console.log(
        'Migration 0323: usuário ' +
          (user.getString('login') || user.email() || user.id) +
          ' (código ' +
          user.getInt('codigo') +
          ') verificado (verified = true).',
      )
    }

    console.log('Migration 0323 concluída: ' + backfilled + ' usuário(s) ativo(s) verificado(s).')
  },
  (app) => {
    // Revert: apenas restaura o onlyVerified padrão do PocketBase (false já é o default;
    // os registros verificados permanecem — backfill não é destrutivo).
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (usersCol && !usersCol.onlyVerified) {
      // manter onlyVerified = false: o sistema gerencia verificação internamente
      console.log('Migration 0323 (revert): onlyVerified permanece desativado por design.')
    }
  },
)

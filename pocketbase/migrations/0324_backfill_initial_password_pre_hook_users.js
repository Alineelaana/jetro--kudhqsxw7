// Migração 0324: backfill de senha inicial utilizável para usuários criados no
// período PRÉ-correção do fluxo de cadastro (v0.0.703), cuja senha nunca ficou
// utilizável no primeiro acesso.
//
// EVIDÊNCIA (produção, 2026-11-12):
// - Logs de requests: POST /backend/v1/auth/secure-login → 400 e
//   POST /backend/v1/auth/resolve-identity → 404 para "sairana.duarte".
// - Causa raiz dupla, corrigida nesta rodada:
//   1) Os hooks de login consultavam o campo inexistente `username`
//      ("login = {:x} || username = {:x}"), o filtro lançava erro, o catch
//      silenciava e o endpoint devolvia "Credenciais inválidas" ANTES de
//      validar a senha (o campo `login` é o único identificador curto da auth
//      collection `users`);
//   2) Contas criadas no período afetado podem ter senha inicial gravada de
//      forma não utilizável (cadastro anterior ao fluxo corrigido).
//
// AÇÃO: define a senha inicial padrão institucional ("12345678", informada
// oficialmente pela administração DEC Eldorado/Gran Romano) para as 5 contas
// específicas do período, MANTENDO must_change_password = true e
// force_password_change = true, para que a troca de senha no primeiro acesso
// permaneça OBRIGATÓRIA (tela ForcePasswordResetScreen → endpoint
// /backend/v1/auth/reset-forced-password).
//
// IDEMPOTENTE: só atua sobre as 5 contas listadas por ID; a redefinição é
// gravada com saveNoValidate (privilégio de backend) e o restante da base não
// é tocado. Em uma base já corrigida, o efeito é apenas reafirmar a senha
// padrão dessas contas — comportamento desejado e seguro, pois a troca no
// primeiro acesso continua obrigatória.
migrate(
  (app) => {
    const INITIAL_PASSWORD = '12345678'

    // login → id (confirmados em produção em 2026-11-12)
    const targets = [
      { id: 'ib0s8qmgoc464om', login: 'ana.luiza' },
      { id: '4oyrl25xhewngdp', login: 'hilton.andrade' },
      { id: 'rs4uukblwmuxbuh', login: 'pedro.vilela' },
      { id: '3sw65vzjkl8ehes', login: 'alessandra.moura' },
      { id: '5xmppmdm528q571', login: 'sairana.duarte' },
    ]

    let fixed = 0
    for (let i = 0; i < targets.length; i++) {
      let user = null
      try {
        user = app.findRecordById('users', targets[i].id)
      } catch (_) {
        console.log('Migration 0324: usuário ' + targets[i].login + ' não encontrado — ignorado.')
        continue
      }

      user.setPassword(INITIAL_PASSWORD)
      user.set('must_change_password', true)
      user.set('force_password_change', true)
      user.set('verified', true)
      user.set('active', true)
      app.saveNoValidate(user)
      fixed++
      console.log(
        'Migration 0324: senha inicial redefinida para ' +
          targets[i].login +
          ' (código ' +
          user.getInt('codigo') +
          '), com troca obrigatória no primeiro acesso.',
      )
    }

    console.log('Migration 0324 concluída: ' + fixed + ' conta(s) com senha inicial utilizável.')
  },
  (app) => {
    // Revert: não há restauração segura da senha anterior (hash desconhecido).
    // As contas mantêm must_change_password = true; um administrador pode
    // redefinir as senhas pela tela de usuários se necessário.
    console.log('Migration 0324 (revert): nada a desfazer — senhas anteriores eram inutilizáveis.')
  },
)

// Migração 0357 — Coleção security_login_logs (aditiva e idempotente)
// Log de acesso à tela de login: sucesso/falha por usuário, IP, user agent e origem.
// Leitura restrita a administradores (SUP / perfil de administração / e-mail do admin principal).
// A gravação é feita exclusivamente por hooks (auth_secure_login.js), que ignora regras de API.
// origem = 'login' (tentativa normal) ou 'bloqueio_temporario' (tentativa recusada pelo bloqueio).

migrate(
  (app) => {
    // Idempotência: se a coleção já existir, não faz nada
    try {
      app.findCollectionByNameOrId('security_login_logs')
      return
    } catch (_) {}

    var adminOnlyRule =
      '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.email = "alineelaana@gmail.com" || @request.auth.perfil_acesso ~ "SUP" || @request.auth.perfil_acesso ~ "ADMIN")'

    var collection = new Collection({
      type: 'base',
      name: 'security_login_logs',
      listRule: adminOnlyRule,
      viewRule: adminOnlyRule,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'usuario', type: 'text' },
        { name: 'sucesso', type: 'bool' },
        { name: 'ip', type: 'text' },
        { name: 'user_agent', type: 'text' },
        { name: 'origem', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sll_usuario_created ON security_login_logs (usuario, created)',
        'CREATE INDEX idx_sll_sucesso ON security_login_logs (sucesso)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    // Revert: remove a coleção se existir
    try {
      var existing = app.findCollectionByNameOrId('security_login_logs')
      app.delete(existing)
    } catch (_) {}
  },
)

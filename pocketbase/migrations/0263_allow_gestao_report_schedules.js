migrate(
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('report_schedules')
      // Atualiza regras para permitir acesso dos próprios agendamentos ao usuário autenticado (incluindo Gestão / PADRAO)
      // e permitir SUP / perfis autorizados
      col.listRule =
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP' || @request.auth.role = 'PADRAO' || @request.auth.role = 'GESTAO' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO')"
      col.viewRule =
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP' || @request.auth.role = 'PADRAO' || @request.auth.role = 'GESTAO' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO')"
      col.createRule = "@request.auth.id != ''"
      col.updateRule =
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP')"
      col.deleteRule =
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP')"
      app.save(col)
    } catch (_) {}

    try {
      const execCol = app.findCollectionByNameOrId('report_schedule_executions')
      execCol.listRule =
        "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.role = 'PADRAO' || @request.auth.role = 'GESTAO' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO' || @request.auth.id = schedule_id.user_id)"
      execCol.viewRule =
        "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.role = 'PADRAO' || @request.auth.role = 'GESTAO' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO' || @request.auth.id = schedule_id.user_id)"
      app.save(execCol)
    } catch (_) {}
  },
  (app) => {
    // Reversão
  },
)

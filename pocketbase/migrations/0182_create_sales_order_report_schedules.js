migrate(
  (app) => {
    let schedulesCol
    try {
      schedulesCol = app.findCollectionByNameOrId('sales_order_report_schedules')
    } catch (_) {
      schedulesCol = new Collection({
        name: 'sales_order_report_schedules',
        type: 'base',
        // Usuário gerencia os próprios agendamentos; administradores (SUP) podem ver/gerenciar todos
        listRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP')",
        viewRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP')",
        createRule: "@request.auth.id != ''",
        updateRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP')",
        deleteRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP')",
        fields: [
          { name: 'name', type: 'text', required: true },
          {
            name: 'user_id',
            type: 'relation',
            required: true,
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            maxSelect: 1,
          },
          { name: 'user_email', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'user_role', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          {
            name: 'frequency',
            type: 'select',
            required: true,
            values: ['daily', 'weekly'],
            maxSelect: 1,
          },
          { name: 'day_of_week', type: 'number' }, // 0 (domingo) .. 6 (sábado) para weekly
          { name: 'time_of_day', type: 'text', required: true }, // "HH:MM" no fuso local
          { name: 'timezone', type: 'text' }, // Padrão "America/Sao_Paulo"
          { name: 'recipients', type: 'text', required: true }, // Lista separada por vírgula
          { name: 'formats', type: 'json' }, // ["xlsx", "pdf"]
          { name: 'filters', type: 'json' }, // Objeto QueryFilters capturado da tela
          { name: 'filter_labels', type: 'json' }, // Rótulos amigáveis para exibir no corpo do e-mail
          { name: 'skip_if_empty', type: 'bool' }, // Se true, não envia e-mail quando 0 pedidos
          { name: 'active', type: 'bool' },
          { name: 'last_run_at', type: 'text' },
          { name: 'last_run_status', type: 'text' }, // "success" | "error" | "skipped_empty"
          { name: 'last_run_error', type: 'text' },
          { name: 'last_run_count', type: 'number' },
          { name: 'last_run_total', type: 'text' },
          { name: 'execution_count', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_rep_sched_user ON sales_order_report_schedules (user_id)',
          'CREATE INDEX idx_rep_sched_active ON sales_order_report_schedules (active)',
          'CREATE INDEX idx_rep_sched_freq ON sales_order_report_schedules (frequency)',
        ],
      })
      app.save(schedulesCol)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('sales_order_report_schedules')
      if (col) app.delete(col)
    } catch (_) {}
  },
)

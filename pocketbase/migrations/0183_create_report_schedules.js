migrate(
  (app) => {
    let schedulesCol
    try {
      schedulesCol = app.findCollectionByNameOrId('report_schedules')
    } catch (_) {
      schedulesCol = new Collection({
        name: 'report_schedules',
        type: 'base',
        listRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO')",
        viewRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO')",
        createRule: "@request.auth.id != ''",
        updateRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO')",
        deleteRule:
          "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'SUP' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO')",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'module', type: 'text', required: true },
          { name: 'report_id', type: 'text', required: true },
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
            values: ['daily', 'weekly', 'biweekly', 'monthly'],
            maxSelect: 1,
          },
          { name: 'days_of_week', type: 'json' }, // [0,1,2,3,4,5,6]
          { name: 'day_of_month', type: 'number' }, // 1..31
          { name: 'start_date', type: 'text' }, // YYYY-MM-DD
          { name: 'end_date', type: 'text' }, // YYYY-MM-DD
          { name: 'time_of_day', type: 'text', required: true }, // "HH:MM"
          { name: 'timezone', type: 'text' }, // "America/Sao_Paulo"
          { name: 'recipients', type: 'text', required: true },
          { name: 'recipients_cc', type: 'text' },
          { name: 'email_subject', type: 'text' },
          { name: 'email_message', type: 'text' },
          { name: 'formats', type: 'json' }, // ["xlsx", "pdf"]
          { name: 'filters', type: 'json' },
          { name: 'filter_labels', type: 'json' },
          { name: 'dynamic_date_range', type: 'text' }, // today, yesterday, last_7_days, last_week, last_fortnight, last_month, current_month, custom
          { name: 'skip_if_empty', type: 'bool' },
          { name: 'active', type: 'bool' },
          {
            name: 'status',
            type: 'select',
            values: ['active', 'paused', 'error', 'needs_review'],
            maxSelect: 1,
          },
          { name: 'last_run_at', type: 'text' },
          { name: 'last_run_status', type: 'text' },
          { name: 'last_run_error', type: 'text' },
          { name: 'last_run_count', type: 'number' },
          { name: 'last_run_total', type: 'text' },
          { name: 'next_run_at', type: 'text' },
          { name: 'execution_count', type: 'number' },
          { name: 'retry_count', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_gen_sched_user ON report_schedules (user_id)',
          'CREATE INDEX idx_gen_sched_active ON report_schedules (active)',
          'CREATE INDEX idx_gen_sched_freq ON report_schedules (frequency)',
          'CREATE INDEX idx_gen_sched_report ON report_schedules (report_id)',
          'CREATE INDEX idx_gen_sched_module ON report_schedules (module)',
        ],
      })
      app.save(schedulesCol)
    }

    let executionsCol
    try {
      executionsCol = app.findCollectionByNameOrId('report_schedule_executions')
    } catch (_) {
      executionsCol = new Collection({
        name: 'report_schedule_executions',
        type: 'base',
        listRule:
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO' || @request.auth.id = schedule_id.user_id)",
        viewRule:
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.role = 'COMERCIAL' || @request.auth.role = 'FINANCEIRO' || @request.auth.id = schedule_id.user_id)",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
        deleteRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
        fields: [
          {
            name: 'schedule_id',
            type: 'relation',
            required: true,
            collectionId: schedulesCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'schedule_name', type: 'text' },
          { name: 'report_id', type: 'text' },
          {
            name: 'triggered_by',
            type: 'select',
            values: ['cron', 'manual', 'test'],
            maxSelect: 1,
          },
          { name: 'user_id', type: 'text' },
          { name: 'user_email', type: 'text' },
          { name: 'executed_at', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['success', 'error', 'skipped_empty', 'running'],
            maxSelect: 1,
          },
          { name: 'record_count', type: 'number' },
          { name: 'total_value', type: 'text' },
          { name: 'recipients', type: 'text' },
          { name: 'recipients_cc', type: 'text' },
          { name: 'formats', type: 'json' },
          { name: 'error_message', type: 'text' },
          { name: 'execution_duration_ms', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_exec_sched_id ON report_schedule_executions (schedule_id)',
          'CREATE INDEX idx_exec_status ON report_schedule_executions (status)',
          'CREATE INDEX idx_exec_date ON report_schedule_executions (executed_at DESC)',
        ],
      })
      app.save(executionsCol)
    }
  },
  (app) => {
    try {
      const col2 = app.findCollectionByNameOrId('report_schedule_executions')
      if (col2) app.delete(col2)
    } catch (_) {}
    try {
      const col1 = app.findCollectionByNameOrId('report_schedules')
      if (col1) app.delete(col1)
    } catch (_) {}
  },
)

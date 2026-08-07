migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'platform_workflows',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'workflow_key', type: 'text', required: true },
          { name: 'entity_type', type: 'text', required: true },
          { name: 'entity_id', type: 'text' },
          { name: 'entity_number', type: 'text' },
          { name: 'entity_summary', type: 'text' },
          { name: 'current_step', type: 'text', required: true },
          { name: 'steps', type: 'json' },
          { name: 'history', type: 'json' },
          {
            name: 'status',
            type: 'select',
            values: ['pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'completed'],
            maxSelect: 1,
            required: true,
          },
          { name: 'assigned_to', type: 'text' },
          { name: 'assigned_role', type: 'text' },
          { name: 'module_origin', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created_by', type: 'text' },
          { name: 'created_by_name', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_pw_key ON platform_workflows (workflow_key)',
          'CREATE INDEX idx_pw_entity ON platform_workflows (entity_type, entity_id)',
          'CREATE INDEX idx_pw_status ON platform_workflows (status)',
          'CREATE INDEX idx_pw_assigned ON platform_workflows (assigned_to)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'platform_agenda_events',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP' || @request.body.created_by = @request.auth.id",
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          {
            name: 'event_type',
            type: 'select',
            values: [
              'meeting',
              'visit',
              'training',
              'maintenance',
              'production',
              'approval',
              'commitment',
              'fiscal_deadline',
              'rh_event',
              'crm_activity',
              'financial_deadline',
              'project_milestone',
              'other',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'module_origin', type: 'text' },
          { name: 'start_date', type: 'text', required: true },
          { name: 'end_date', type: 'text' },
          { name: 'all_day', type: 'bool' },
          { name: 'location', type: 'text' },
          { name: 'assigned_to', type: 'text' },
          { name: 'assigned_name', type: 'text' },
          { name: 'related_entity_type', type: 'text' },
          { name: 'related_entity_id', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'],
            maxSelect: 1,
          },
          {
            name: 'priority',
            type: 'select',
            values: ['low', 'medium', 'high', 'critical'],
            maxSelect: 1,
          },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created_by', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_pae_start ON platform_agenda_events (start_date)',
          'CREATE INDEX idx_pae_type ON platform_agenda_events (event_type)',
          'CREATE INDEX idx_pae_assigned ON platform_agenda_events (assigned_to)',
          'CREATE INDEX idx_pae_status ON platform_agenda_events (status)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'platform_monitoring',
        type: 'base',
        listRule:
          "@request.auth.role = 'SUP' || @request.auth.role = 'FINANCEIRO' || @request.auth.role = 'COMERCIAL'",
        viewRule:
          "@request.auth.role = 'SUP' || @request.auth.role = 'FINANCEIRO' || @request.auth.role = 'COMERCIAL'",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'service_name', type: 'text', required: true },
          {
            name: 'service_type',
            type: 'select',
            values: [
              'cron',
              'job',
              'queue',
              'integration',
              'webhook',
              'ai',
              'bi',
              'cache',
              'workflow',
              'notification',
              'scheduler',
            ],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'status',
            type: 'select',
            values: ['healthy', 'degraded', 'down', 'unknown'],
            maxSelect: 1,
            required: true,
          },
          { name: 'last_run_at', type: 'text' },
          { name: 'next_run_at', type: 'text' },
          { name: 'last_result', type: 'text' },
          { name: 'error_count', type: 'number' },
          { name: 'success_count', type: 'number' },
          { name: 'avg_duration_ms', type: 'number' },
          { name: 'details', type: 'json' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_pm_type ON platform_monitoring (service_type)',
          'CREATE INDEX idx_pm_status ON platform_monitoring (status)',
          'CREATE INDEX idx_pm_name ON platform_monitoring (service_name)',
        ],
      }),
    )

    var notifCol = app.findCollectionByNameOrId('notifications')
    notifCol.fields.add(
      new SelectField({
        name: 'type',
        required: true,
        values: [
          'budget_created',
          'budget_saved',
          'stock_low',
          'price_below_cost',
          'approval_pending',
          'account_due',
          'document_expiring',
          'order_delayed',
          'delivery_delayed',
          'negative_margin',
          'integration_error',
          'certificate_expiring',
          'processing_failure',
          'workflow_step',
          'agenda_reminder',
          'monitoring_alert',
          'other',
        ],
        maxSelect: 1,
      }),
    )
    app.save(notifCol)

    console.log('PLA-0111: Platform Layer collections created, notifications extended')
  },
  (app) => {
    var cols = ['platform_monitoring', 'platform_agenda_events', 'platform_workflows']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

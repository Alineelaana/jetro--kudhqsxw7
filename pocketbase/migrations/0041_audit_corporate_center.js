migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('audit_logs')

    if (!col.fields.getByName('criticidade')) {
      col.fields.add(
        new SelectField({
          name: 'criticidade',
          values: ['Baixa', 'Média', 'Alta', 'Crítica'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('origem')) {
      col.fields.add(
        new SelectField({
          name: 'origem',
          values: [
            'Área da Empresa',
            'Portal do Cliente',
            'Portal do Fornecedor',
            'Aplicativo',
            'API',
            'Integração',
            'Importação',
            'Exportação',
            'Inteligência Artificial',
            'Automação',
            'Fluxo Inteligente',
          ],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('session_id')) col.fields.add(new TextField({ name: 'session_id' }))
    if (!col.fields.getByName('browser')) col.fields.add(new TextField({ name: 'browser' }))
    if (!col.fields.getByName('os')) col.fields.add(new TextField({ name: 'os' }))
    if (!col.fields.getByName('device')) col.fields.add(new TextField({ name: 'device' }))
    if (!col.fields.getByName('approval_responsible'))
      col.fields.add(new TextField({ name: 'approval_responsible' }))
    if (!col.fields.getByName('justification'))
      col.fields.add(new TextField({ name: 'justification' }))
    if (!col.fields.getByName('is_suspicious'))
      col.fields.add(new BoolField({ name: 'is_suspicious' }))
    if (!col.fields.getByName('archived')) col.fields.add(new BoolField({ name: 'archived' }))

    col.updateRule = "@request.auth.id = '___never___'"
    col.deleteRule = "@request.auth.id = '___never___'"

    col.addIndex('idx_audit_logs_criticidade', false, 'criticidade', '')
    col.addIndex('idx_audit_logs_origem', false, 'origem', '')
    col.addIndex('idx_audit_logs_session_id', false, 'session_id', '')
    col.addIndex('idx_audit_logs_ip_address', false, 'ip_address', '')
    col.addIndex('idx_audit_logs_archived', false, 'archived', '')

    app.save(col)

    app.save(
      new Collection({
        name: 'audit_sessions',
        type: 'base',
        listRule: "@request.auth.role = 'SUP'",
        viewRule: "@request.auth.role = 'SUP'",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'session_id', type: 'text' },
          { name: 'user_id', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'login_time', type: 'text' },
          { name: 'logout_time', type: 'text' },
          { name: 'ip_address', type: 'text' },
          { name: 'browser', type: 'text' },
          { name: 'os', type: 'text' },
          { name: 'device', type: 'text' },
          {
            name: 'origin',
            type: 'select',
            values: [
              'Área da Empresa',
              'Portal do Cliente',
              'Portal do Fornecedor',
              'Aplicativo',
              'API',
              'Integração',
              'Importação',
              'Exportação',
              'Inteligência Artificial',
              'Automação',
              'Fluxo Inteligente',
            ],
            maxSelect: 1,
          },
          { name: 'status', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_audit_sessions_session_id ON audit_sessions (session_id)',
          'CREATE INDEX idx_audit_sessions_user_id ON audit_sessions (user_id)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'audit_alerts',
        type: 'base',
        listRule: "@request.auth.role = 'SUP'",
        viewRule: "@request.auth.role = 'SUP'",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'alert_type', type: 'text' },
          {
            name: 'severity',
            type: 'select',
            values: ['info', 'warning', 'critical'],
            maxSelect: 1,
          },
          { name: 'description', type: 'text' },
          { name: 'audit_log_id', type: 'text' },
          { name: 'session_id', type: 'text' },
          { name: 'user_id', type: 'text' },
          { name: 'resolved', type: 'bool' },
          { name: 'resolved_by', type: 'text' },
          { name: 'resolved_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_audit_alerts_alert_type ON audit_alerts (alert_type)',
          'CREATE INDEX idx_audit_alerts_resolved ON audit_alerts (resolved)',
        ],
      }),
    )
  },
  (app) => {
    var col = app.findCollectionByNameOrId('audit_logs')
    var toRemove = [
      'criticidade',
      'origem',
      'session_id',
      'browser',
      'os',
      'device',
      'approval_responsible',
      'justification',
      'is_suspicious',
      'archived',
    ]
    for (var i = 0; i < toRemove.length; i++) {
      try {
        var f = col.fields.getByName(toRemove[i])
        if (f) col.fields.remove(f)
      } catch (_) {}
    }
    col.removeIndex('idx_audit_logs_criticidade')
    col.removeIndex('idx_audit_logs_origem')
    col.removeIndex('idx_audit_logs_session_id')
    col.removeIndex('idx_audit_logs_ip_address')
    col.removeIndex('idx_audit_logs_archived')
    col.updateRule = null
    col.deleteRule = null
    app.save(col)
    try {
      app.delete(app.findCollectionByNameOrId('audit_sessions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('audit_alerts'))
    } catch (_) {}
  },
)

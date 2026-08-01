migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'audit_logs',
        type: 'base',
        listRule: "@request.auth.role = 'SUP'",
        viewRule: "@request.auth.role = 'SUP'",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'user_id', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'user_role', type: 'text' },
          { name: 'action', type: 'text' },
          { name: 'module', type: 'text' },
          { name: 'target_collection', type: 'text' },
          { name: 'target_id', type: 'text' },
          { name: 'target_summary', type: 'text' },
          { name: 'previous_value', type: 'json' },
          { name: 'new_value', type: 'json' },
          { name: 'ip_address', type: 'text' },
          { name: 'user_agent', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_audit_logs_created ON audit_logs (created)',
          'CREATE INDEX idx_audit_logs_module ON audit_logs (module)',
          'CREATE INDEX idx_audit_logs_action ON audit_logs (action)',
          'CREATE INDEX idx_audit_logs_user_role ON audit_logs (user_role)',
          'CREATE INDEX idx_audit_logs_user_name ON audit_logs (user_name)',
          'CREATE INDEX idx_audit_logs_target_collection ON audit_logs (target_collection)',
        ],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('audit_logs'))
    } catch (_) {}
  },
)

migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    app.save(
      new Collection({
        name: 'validity_rules',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'module', type: 'text', required: true },
          { name: 'entity_type', type: 'text', required: true },
          { name: 'entity_label', type: 'text' },
          { name: 'validity_field', type: 'text', required: true },
          { name: 'antecedent_days', type: 'json' },
          { name: 'criticidade_mapping', type: 'json' },
          { name: 'recipients', type: 'json' },
          { name: 'escalation_config', type: 'json' },
          { name: 'recurrence_days', type: 'number' },
          { name: 'channels', type: 'json' },
          { name: 'active', type: 'bool' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_valrules_module ON validity_rules (module)',
          'CREATE INDEX idx_valrules_entity ON validity_rules (entity_type)',
          'CREATE INDEX idx_valrules_active ON validity_rules (active)',
        ],
      }),
    )

    var rulesColId = app.findCollectionByNameOrId('validity_rules').id

    app.save(
      new Collection({
        name: 'validity_alerts',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'rule_id', type: 'relation', collectionId: rulesColId, maxSelect: 1 },
          { name: 'entity_type', type: 'text', required: true },
          { name: 'entity_id', type: 'text', required: true },
          { name: 'entity_name', type: 'text' },
          { name: 'validity_field', type: 'text' },
          { name: 'validity_date', type: 'date' },
          { name: 'days_remaining', type: 'number' },
          {
            name: 'criticidade',
            type: 'select',
            values: ['Informativo', 'Atenção', 'Urgente', 'Crítico', 'Vencido'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['Novo', 'Visualizado', 'Em Tratamento', 'Resolvido', 'Ignorado', 'Vencido'],
            maxSelect: 1,
          },
          { name: 'assignee', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'module', type: 'text' },
          { name: 'timeline', type: 'json' },
          { name: 'snooze_until', type: 'date' },
          { name: 'justification', type: 'text' },
          { name: 'resolution_note', type: 'text' },
          { name: 'metadata', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_valalerts_status ON validity_alerts (status)',
          'CREATE INDEX idx_valalerts_crit ON validity_alerts (criticidade)',
          'CREATE INDEX idx_valalerts_vdate ON validity_alerts (validity_date)',
          'CREATE INDEX idx_valalerts_assignee ON validity_alerts (assignee)',
          'CREATE INDEX idx_valalerts_company ON validity_alerts (company)',
          'CREATE INDEX idx_valalerts_branch ON validity_alerts (branch)',
          'CREATE INDEX idx_valalerts_module ON validity_alerts (module)',
          'CREATE INDEX idx_valalerts_entity ON validity_alerts (entity_type, entity_id)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'corporate_documents',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'tipo', type: 'text', required: true },
          { name: 'numero', type: 'text' },
          { name: 'titular', type: 'text' },
          { name: 'emissao', type: 'date' },
          { name: 'validade', type: 'date' },
          { name: 'orgao_emissor', type: 'text' },
          { name: 'responsavel', type: 'text' },
          {
            name: 'anexo',
            type: 'file',
            maxSelect: 1,
            maxSize: 10485760,
            mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          },
          { name: 'status', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_corpdoc_tipo ON corporate_documents (tipo)',
          'CREATE INDEX idx_corpdoc_validade ON corporate_documents (validade)',
          'CREATE INDEX idx_corpdoc_empresa ON corporate_documents (empresa)',
        ],
      }),
    )
  },
  (app) => {
    var cols = ['corporate_documents', 'validity_alerts', 'validity_rules']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

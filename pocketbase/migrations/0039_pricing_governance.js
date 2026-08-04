migrate(
  (app) => {
    var pc = app.findCollectionByNameOrId('pricing_config')
    var newFields = [
      'cbs',
      'ibs',
      'selective_tax',
      'cashback',
      'maximum_margin',
      'market_avg_price',
      'market_lowest_price',
      'market_highest_price',
      'market_position',
    ]
    for (var i = 0; i < newFields.length; i++) {
      if (!pc.fields.getByName(newFields[i])) {
        pc.fields.add(new TextField({ name: newFields[i] }))
      }
    }
    app.save(pc)

    app.save(
      new Collection({
        name: 'price_vault',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'product_id', type: 'text', required: true },
          { name: 'product_code', type: 'text' },
          { name: 'product_name', type: 'text' },
          { name: 'version_number', type: 'number' },
          { name: 'field_changed', type: 'text' },
          { name: 'previous_value', type: 'text' },
          { name: 'new_value', type: 'text' },
          { name: 'previous_margin', type: 'text' },
          { name: 'new_margin', type: 'text' },
          { name: 'previous_cost', type: 'text' },
          { name: 'new_cost', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'user_role', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'reason', type: 'text' },
          { name: 'justification', type: 'text' },
          { name: 'related_document', type: 'text' },
          { name: 'related_campaign', type: 'text' },
          { name: 'observations', type: 'text' },
          { name: 'approval_id', type: 'text' },
          { name: 'approval_status', type: 'text' },
          { name: 'approved_at', type: 'text' },
          { name: 'approved_by', type: 'text' },
          { name: 'electronic_signature', type: 'text' },
          { name: 'is_restored', type: 'bool' },
          { name: 'restored_from_version', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_price_vault_product ON price_vault (product_id)',
          'CREATE INDEX idx_price_vault_created ON price_vault (created)',
          'CREATE INDEX idx_price_vault_user ON price_vault (user_name)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'pricing_risk_monitor',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: null,
        fields: [
          { name: 'product_id', type: 'text', required: true },
          { name: 'product_code', type: 'text' },
          { name: 'product_name', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'user_role', type: 'text' },
          { name: 'change_type', type: 'text' },
          { name: 'risk_index', type: 'number' },
          { name: 'risk_factors', type: 'json' },
          { name: 'previous_value', type: 'text' },
          { name: 'new_value', type: 'text' },
          { name: 'change_percentage', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'requires_approval', type: 'bool' },
          { name: 'approval_status', type: 'text' },
          { name: 'resolved', type: 'bool' },
          { name: 'resolved_by', type: 'text' },
          { name: 'resolved_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_pricing_risk_product ON pricing_risk_monitor (product_id)',
          'CREATE INDEX idx_pricing_risk_user ON pricing_risk_monitor (user_name)',
          'CREATE INDEX idx_pricing_risk_index ON pricing_risk_monitor (risk_index)',
          'CREATE INDEX idx_pricing_risk_created ON pricing_risk_monitor (created)',
        ],
      }),
    )
  },
  (app) => {
    var cols = ['price_vault', 'pricing_risk_monitor']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
    var pc = app.findCollectionByNameOrId('pricing_config')
    var fields = [
      'cbs',
      'ibs',
      'selective_tax',
      'cashback',
      'maximum_margin',
      'market_avg_price',
      'market_lowest_price',
      'market_highest_price',
      'market_position',
    ]
    for (var j = 0; j < fields.length; j++) {
      var f = pc.fields.getByName(fields[j])
      if (f) pc.fields.remove(f)
    }
    app.save(pc)
  },
)

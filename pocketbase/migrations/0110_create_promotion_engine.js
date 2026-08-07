migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'promotion_rules',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          {
            name: 'promo_type',
            type: 'select',
            values: [
              'buy_x_get_y',
              'percentage',
              'fixed_discount',
              'min_value',
              'mix',
              'specific_product',
              'brand',
              'supplier',
              'category',
              'combo',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'conditions', type: 'json' },
          { name: 'benefits', type: 'json' },
          {
            name: 'cumulativity',
            type: 'select',
            values: ['cumulative', 'non_cumulative', 'priority', 'most_advantageous'],
            maxSelect: 1,
          },
          { name: 'priority', type: 'number' },
          { name: 'limits', type: 'json' },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'ativo', 'pausado', 'encerrado', 'expirado'],
            maxSelect: 1,
          },
          { name: 'start_date', type: 'text' },
          { name: 'end_date', type: 'text' },
          { name: 'applicable_channels', type: 'json' },
          { name: 'version', type: 'number' },
          { name: 'is_active', type: 'bool' },
          { name: 'campaign_id', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created_by', type: 'text' },
          { name: 'created_by_name', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_promo_rules_status ON promotion_rules (status)',
          'CREATE INDEX idx_promo_rules_company ON promotion_rules (company)',
          'CREATE INDEX idx_promo_rules_dates ON promotion_rules (start_date, end_date)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'promotion_applications',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'promotion_id', type: 'text', required: true },
          { name: 'promotion_name', type: 'text' },
          { name: 'promotion_version', type: 'number' },
          { name: 'order_id', type: 'text' },
          { name: 'order_number', type: 'text' },
          { name: 'client_id', type: 'text' },
          { name: 'client_name', type: 'text' },
          { name: 'benefits_applied', type: 'json' },
          { name: 'discount_value', type: 'text' },
          { name: 'bonification_value', type: 'text' },
          { name: 'margin_before', type: 'text' },
          { name: 'margin_after', type: 'text' },
          { name: 'applied_by', type: 'text' },
          { name: 'applied_by_name', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_promo_apps_promo ON promotion_applications (promotion_id)',
          'CREATE INDEX idx_promo_apps_order ON promotion_applications (order_id)',
          'CREATE INDEX idx_promo_apps_client ON promotion_applications (client_id)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'campaign_partials',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'campaign_id', type: 'text', required: true },
          { name: 'campaign_name', type: 'text' },
          { name: 'partial_number', type: 'number' },
          { name: 'snapshot_date', type: 'text' },
          { name: 'participants', type: 'json' },
          { name: 'is_closing_snapshot', type: 'bool' },
          { name: 'competencia', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created_by', type: 'text' },
          { name: 'created_by_name', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_cp_campaign ON campaign_partials (campaign_id)',
          'CREATE INDEX idx_cp_closing ON campaign_partials (is_closing_snapshot)',
          'CREATE INDEX idx_cp_date ON campaign_partials (snapshot_date)',
        ],
      }),
    )
  },
  (app) => {
    var cols = ['campaign_partials', 'promotion_applications', 'promotion_rules']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

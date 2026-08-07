migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var RS = "@request.auth.role = 'SUP'"
    var A = [
      new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
      new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
    ]
    function T(n) {
      return new TextField({ name: n })
    }
    function N(n) {
      return new NumberField({ name: n })
    }
    function B(n) {
      return new BoolField({ name: n })
    }
    function J(n) {
      return new JSONField({ name: n })
    }
    function S(n, v) {
      return new SelectField({ name: n, values: v, maxSelect: 1 })
    }
    function mk(name, fields, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: RS,
          fields: fields.concat(A),
          indexes: indexes || [],
        }),
      )
    }

    mk(
      'controladoria_dre_structure',
      [
        T('line_key'),
        T('label'),
        S('group', ['Receitas', 'Custos', 'Despesas', 'Resultado', 'Impostos']),
        N('level'),
        N('order'),
        S('formula_type', ['sum', 'subtract', 'percentage', 'custom']),
        T('formula_expression'),
        S('sign', ['positive', 'negative']),
        B('is_calculated'),
        B('is_active'),
        T('company'),
        T('observations'),
      ],
      ['CREATE INDEX idx_ctrl_dre_structure_order ON controladoria_dre_structure (order)'],
    )

    mk(
      'controladoria_account_mapping',
      [
        T('account_code'),
        T('account_name'),
        T('dre_line_key'),
        T('reclassification_target'),
        S('mapping_type', ['automatic', 'manual']),
        B('is_active'),
        T('company'),
      ],
      ['CREATE INDEX idx_ctrl_acct_mapping_code ON controladoria_account_mapping (account_code)'],
    )

    mk(
      'controladoria_reclassifications',
      [
        T('period'),
        T('source_account_code'),
        T('source_account_name'),
        T('target_dre_line'),
        T('original_dre_line'),
        T('value'),
        T('justification'),
        S('status', ['pending', 'approved', 'rejected']),
        T('user_name'),
        T('company'),
        T('branch'),
      ],
      ['CREATE INDEX idx_ctrl_reclass_period ON controladoria_reclassifications (period)'],
    )

    mk(
      'controladoria_result_versions',
      [
        S('version_type', [
          'oficial',
          'contabil',
          'gerencial',
          'orcado',
          'forecast',
          'rolling_forecast',
          'reforecast',
          'simulado',
          'consolidado',
        ]),
        T('period'),
        T('label'),
        T('description'),
        S('status', ['draft', 'active', 'archived']),
        B('is_current'),
        T('company'),
        T('branch'),
        T('created_by'),
        T('created_by_name'),
      ],
      ['CREATE INDEX idx_ctrl_versions_period ON controladoria_result_versions (period)'],
    )

    mk(
      'controladoria_budgets',
      [
        T('version_id'),
        T('period'),
        T('dre_line_key'),
        T('cost_center'),
        T('value'),
        T('company'),
        T('branch'),
        T('observations'),
      ],
      ['CREATE INDEX idx_ctrl_budgets_period ON controladoria_budgets (period)'],
    )

    mk(
      'controladoria_forecasts',
      [
        T('version_id'),
        T('period'),
        T('dre_line_key'),
        T('cost_center'),
        T('value'),
        S('forecast_type', ['forecast', 'rolling_forecast', 'reforecast']),
        T('company'),
        T('branch'),
      ],
      ['CREATE INDEX idx_ctrl_forecasts_period ON controladoria_forecasts (period)'],
    )

    mk(
      'controladoria_closing',
      [
        T('period'),
        T('company'),
        T('branch'),
        S('status', ['open', 'in_review', 'pending_approval', 'approved', 'closed', 'reopened']),
        T('responsible'),
        T('approver'),
        J('checklist'),
        J('timeline'),
        T('snapshot_id'),
        T('closing_date'),
        T('justification'),
        T('reopen_reason'),
      ],
      ['CREATE INDEX idx_ctrl_closing_period ON controladoria_closing (period)'],
    )

    mk(
      'controladoria_snapshots',
      [
        T('period'),
        T('version_type'),
        J('data'),
        T('hash'),
        T('created_by'),
        T('created_by_name'),
        T('closing_id'),
        T('company'),
        T('branch'),
      ],
      ['CREATE INDEX idx_ctrl_snapshots_period ON controladoria_snapshots (period)'],
    )

    mk(
      'controladoria_kpis',
      [
        T('name'),
        S('category', [
          'rentabilidade',
          'liquidez',
          'eficiencia',
          'crescimento',
          'estrutura',
          'capital_giro',
        ]),
        T('formula'),
        T('formula_description'),
        S('periodicity', ['diario', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual']),
        T('target'),
        T('responsible'),
        S('criticality', ['baixa', 'media', 'alta', 'critica']),
        T('lower_limit'),
        T('upper_limit'),
        T('unit'),
        T('trend'),
        T('materiality_id'),
        T('data_source'),
        B('is_active'),
      ],
      ['CREATE INDEX idx_ctrl_kpis_category ON controladoria_kpis (category)'],
    )

    mk(
      'controladoria_drivers',
      [
        T('name'),
        S('type', ['financial', 'operational']),
        T('category'),
        T('formula'),
        T('data_source'),
        T('description'),
        T('unit'),
        B('is_active'),
      ],
      ['CREATE INDEX idx_ctrl_drivers_type ON controladoria_drivers (type)'],
    )

    mk(
      'controladoria_materiality',
      [
        T('indicator_name'),
        T('limit'),
        T('tolerance'),
        S('criticality', ['baixa', 'media', 'alta', 'critica']),
        T('impact'),
        S('relevance', ['baixa', 'media', 'alta']),
        S('severity', ['info', 'warning', 'critical']),
        T('justification'),
        B('is_active'),
      ],
      ['CREATE INDEX idx_ctrl_materiality_crit ON controladoria_materiality (criticality)'],
    )

    mk(
      'controladoria_simulations',
      [
        T('scenario_name'),
        S('scenario_type', [
          'price_increase',
          'cost_reduction',
          'mix_change',
          'sales_increase',
          'expense_reduction',
          'exchange_rate',
          'supplier_change',
          'tax_change',
        ]),
        J('parameters'),
        J('results'),
        T('base_version'),
        S('status', ['draft', 'completed', 'archived']),
        T('user_name'),
        T('company'),
        T('branch'),
      ],
      ['CREATE INDEX idx_ctrl_simulations_type ON controladoria_simulations (scenario_type)'],
    )

    mk(
      'controladoria_consolidation',
      [
        T('group_name'),
        J('companies'),
        J('eliminations'),
        S('consolidation_type', ['parcial', 'total']),
        T('period'),
        S('status', ['draft', 'completed']),
        J('results'),
      ],
      ['CREATE INDEX idx_ctrl_consolidation_period ON controladoria_consolidation (period)'],
    )

    mk(
      'controladoria_comments',
      [
        S('entity_type', ['dre_line', 'period', 'cost_center', 'analysis']),
        T('entity_id'),
        T('period'),
        T('line_key'),
        T('cost_center'),
        T('comment'),
        T('user_name'),
        T('user_role'),
        T('company'),
        T('branch'),
      ],
      ['CREATE INDEX idx_ctrl_comments_entity ON controladoria_comments (entity_type, entity_id)'],
    )

    mk(
      'controladoria_saved_views',
      [
        T('name'),
        S('view_type', ['dre', 'kpis', 'margins', 'rentability', 'variations', 'closing']),
        J('filters'),
        J('columns'),
        J('groupings'),
        J('comparison'),
        T('user_name'),
        B('is_shared'),
        T('company'),
      ],
      ['CREATE INDEX idx_ctrl_saved_views_type ON controladoria_saved_views (view_type)'],
    )

    console.log('0115: Controladoria collections created')
  },
  (app) => {
    var cols = [
      'controladoria_saved_views',
      'controladoria_comments',
      'controladoria_consolidation',
      'controladoria_simulations',
      'controladoria_materiality',
      'controladoria_drivers',
      'controladoria_kpis',
      'controladoria_snapshots',
      'controladoria_closing',
      'controladoria_forecasts',
      'controladoria_budgets',
      'controladoria_result_versions',
      'controladoria_reclassifications',
      'controladoria_account_mapping',
      'controladoria_dre_structure',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

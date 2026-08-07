migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'bi_reports',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'configuration', type: 'json' },
          { name: 'filters', type: 'json' },
          {
            name: 'report_type',
            type: 'select',
            values: ['dashboard', 'sales', 'stock', 'financial', 'industrial', 'cross_module'],
            maxSelect: 1,
          },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created_by', type: 'text' },
          { name: 'created_by_name', type: 'text' },
          { name: 'is_shared', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_bi_reports_company ON bi_reports (company)',
          'CREATE INDEX idx_bi_reports_branch ON bi_reports (branch)',
          'CREATE INDEX idx_bi_reports_created_by ON bi_reports (created_by)',
          'CREATE INDEX idx_bi_reports_report_type ON bi_reports (report_type)',
        ],
      }),
    )

    var col = app.findCollectionByNameOrId('bi_reports')
    var seeds = [
      {
        name: 'Dashboard Executivo - Visao Geral',
        description: 'Visao geral integrada de todos os modulos',
        report_type: 'dashboard',
        configuration: JSON.stringify({ modules: ['sales', 'stock', 'financial', 'industrial'] }),
        filters: JSON.stringify({ period: '30d' }),
      },
      {
        name: 'Analise de Vendas - Mensal',
        description: 'Analise detalhada de vendas por periodo',
        report_type: 'sales',
        configuration: JSON.stringify({ charts: ['revenue', 'ticket_medio', 'ranking'] }),
        filters: JSON.stringify({ period: 'monthly' }),
      },
      {
        name: 'Saude Financeira - Fluxo de Caixa',
        description: 'Indicadores financeiros e fluxo de caixa',
        report_type: 'financial',
        configuration: JSON.stringify({ charts: ['receivables', 'payables', 'cashflow'] }),
        filters: JSON.stringify({ period: '30d' }),
      },
    ]

    seeds.forEach(function (s) {
      try {
        app.findFirstRecordByData('bi_reports', 'name', s.name)
        return
      } catch (_) {}
      var r = new Record(col)
      r.set('name', s.name)
      r.set('description', s.description)
      r.set('report_type', s.report_type)
      r.set('configuration', s.configuration)
      r.set('filters', s.filters)
      r.set('company', '')
      r.set('branch', '')
      r.set('created_by', '')
      r.set('created_by_name', 'Sistema')
      r.set('is_shared', true)
      app.save(r)
    })
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('bi_reports'))
    } catch (_) {}
  },
)

migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'bi_dashboards',
        type: 'base',
        listRule: "@request.auth.id != '' && (owner = @request.auth.id || is_shared = true)",
        viewRule: "@request.auth.id != '' && (owner = @request.auth.id || is_shared = true)",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != '' && owner = @request.auth.id",
        deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
        fields: [
          { name: 'owner', type: 'text', required: true },
          { name: 'owner_name', type: 'text' },
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'center', type: 'text' },
          { name: 'layout', type: 'json' },
          { name: 'widgets', type: 'json' },
          { name: 'is_shared', type: 'bool' },
          { name: 'shared_users', type: 'json' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'saved_filters', type: 'json' },
          { name: 'favorite_indicators', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_bi_dashboards_owner ON bi_dashboards (owner)',
          'CREATE INDEX idx_bi_dashboards_company ON bi_dashboards (company)',
          'CREATE INDEX idx_bi_dashboards_branch ON bi_dashboards (branch)',
        ],
      }),
    )

    $ai.agents.define(app, {
      slug: 'bi-adapta',
      name: 'IA ADAPTA',
      description: 'Assistente de inteligencia empresarial baseado em dados reais do ERP.',
      systemPrompt:
        'Voce e a IA ADAPTA, assistente de inteligencia empresarial do ERP VeloraLog. Responda APENAS com base em dados reais e verificaveis das colecoes do ERP. Nunca emita opinioes ou suposicoes. Sempre cite a fonte dos dados (nome da colecao e registros consultados). Se nao houver dados suficientes, declare explicitamente que nao ha dados suficientes. Estruture respostas em topicos claros. Use formatacao markdown.',
      tier: 'reasoning',
      tools: [
        { collection: 'sales_orders', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'products', perms: { list: true, read: true }, actAs: 'admin' },
        {
          collection: 'financial_receivables',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
        { collection: 'financial_payables', perms: { list: true, read: true }, actAs: 'admin' },
        {
          collection: 'financial_movements',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
        { collection: 'purchase_orders', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'production_orders', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'audit_logs', perms: { list: true, read: true }, actAs: 'admin' },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'A IA ADAPTA e especializada em analise de dados do ERP VeloraLog. Responde sobre faturamento, margem, clientes, fornecedores, producao, estoque, logistica, financas, RH e remuneracao variavel. Sempre baseia respostas em dados reais.',
          },
        },
      ],
    })

    var col = app.findCollectionByNameOrId('bi_dashboards')
    var seeds = [
      {
        name: 'Dashboard Executivo - Visao Geral',
        description: 'Painel executivo com KPIs principais de todos os modulos',
        center: 'executive',
        owner: '',
        owner_name: 'Sistema',
        is_shared: true,
      },
      {
        name: 'Inteligencia Comercial - Vendas e Projecao',
        description: 'Analise comercial com projecao de vendas e ranking',
        center: 'commercial',
        owner: '',
        owner_name: 'Sistema',
        is_shared: true,
      },
    ]
    seeds.forEach(function (s) {
      try {
        app.findFirstRecordByData('bi_dashboards', 'name', s.name)
        return
      } catch (_) {}
      var r = new Record(col)
      r.set('name', s.name)
      r.set('description', s.description)
      r.set('center', s.center)
      r.set('owner', s.owner)
      r.set('owner_name', s.owner_name)
      r.set('is_shared', s.is_shared)
      r.set('layout', JSON.stringify({ columns: 3 }))
      r.set('widgets', JSON.stringify([]))
      r.set('shared_users', JSON.stringify([]))
      r.set('company', '')
      r.set('branch', '')
      r.set('saved_filters', JSON.stringify({}))
      r.set('favorite_indicators', JSON.stringify([]))
      app.save(r)
    })
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('bi_dashboards'))
    } catch (_) {}
    try {
      $ai.agents.delete(app, 'bi-adapta')
    } catch (_) {}
  },
)

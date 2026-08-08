migrate(
  (app) => {
    const collection = new Collection({
      name: 'trade_marketing_actions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'action_type', type: 'text' },
        { name: 'objective', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'team', type: 'text' },
        { name: 'supplier', type: 'text' },
        { name: 'industry', type: 'text' },
        { name: 'brand', type: 'text' },
        { name: 'product', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'channel', type: 'text' },
        { name: 'client', type: 'text' },
        { name: 'pdv', type: 'text' },
        { name: 'start_date', type: 'text' },
        { name: 'end_date', type: 'text' },
        { name: 'time', type: 'text' },
        {
          name: 'recurrence',
          type: 'select',
          values: ['nenhuma', 'diaria', 'semanal', 'mensal', 'anual', 'personalizada'],
          maxSelect: 1,
        },
        {
          name: 'priority',
          type: 'select',
          values: ['baixa', 'normal', 'alta', 'urgente', 'critica'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: [
            'ideia',
            'planejamento',
            'orcamento',
            'solicitacao_verba',
            'aprovacao',
            'programacao',
            'execucao',
            'evidencias',
            'medicao_resultado',
            'prestacao_contas',
            'encerramento',
            'cancelado',
          ],
          maxSelect: 1,
        },
        { name: 'budget_planned', type: 'text' },
        { name: 'verba_id', type: 'text' },
        { name: 'verba_name', type: 'text' },
        { name: 'cost_actual', type: 'text' },
        { name: 'campaign_id', type: 'text' },
        { name: 'campaign_name', type: 'text' },
        { name: 'promotion_id', type: 'text' },
        { name: 'promotion_name', type: 'text' },
        { name: 'goal_id', type: 'text' },
        { name: 'goal_name', type: 'text' },
        { name: 'checklist', type: 'json' },
        { name: 'indicators', type: 'json' },
        { name: 'observations', type: 'text' },
        { name: 'agenda_event_id', type: 'text' },
        { name: 'workflow_id', type: 'text' },
        { name: 'attachments', type: 'json' },
        { name: 'evidence', type: 'json' },
        { name: 'results', type: 'json' },
        { name: 'location_city', type: 'text' },
        { name: 'location_state', type: 'text' },
        { name: 'created_by', type: 'text' },
        { name: 'created_by_name', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tm_status ON trade_marketing_actions (status)',
        'CREATE INDEX idx_tm_resp ON trade_marketing_actions (responsible_id)',
        'CREATE INDEX idx_tm_dates ON trade_marketing_actions (start_date, end_date)',
        'CREATE INDEX idx_tm_campaign ON trade_marketing_actions (campaign_id)',
        'CREATE INDEX idx_tm_supplier ON trade_marketing_actions (supplier)',
      ],
    })
    app.save(collection)

    var seedData = [
      {
        title: 'Campanha Promocional Verao 2026',
        action_type: 'campanha_promocional',
        status: 'programacao',
        priority: 'alta',
        start_date: '2026-08-15',
        end_date: '2026-08-30',
        responsible_name: 'Marcos Silva',
        supplier: 'Industria Alimentos SA',
        campaign_name: 'Verao Premium',
        budget_planned: '15000',
        region: 'Sudeste',
        channel: 'Varejo',
        objective: 'Aumentar vendas em 20%',
      },
      {
        title: 'Degustacao PDV - Centro',
        action_type: 'degustacao',
        status: 'execucao',
        priority: 'urgente',
        start_date: '2026-08-05',
        end_date: '2026-08-10',
        responsible_name: 'Ana Costa',
        supplier: 'Bebidas VT',
        pdv: 'Supermercado Central',
        budget_planned: '3500',
        region: 'Sul',
        channel: 'PDV',
        objective: 'Gerar trial de produto',
      },
      {
        title: 'Campanha Digital Lancamento',
        action_type: 'campanha_digital',
        status: 'planejamento',
        priority: 'normal',
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        responsible_name: 'Carlos Pereira',
        supplier: 'Tech Solutions',
        campaign_name: 'Digital Launch',
        budget_planned: '8000',
        region: 'Nacional',
        channel: 'Online',
        objective: 'Gerar 5000 leads',
      },
      {
        title: 'Feira do Setor 2026',
        action_type: 'feira',
        status: 'ideia',
        priority: 'alta',
        start_date: '2026-10-15',
        end_date: '2026-10-18',
        responsible_name: 'Marcos Silva',
        supplier: 'Organizacao Eventos',
        budget_planned: '25000',
        region: 'Centro-Oeste',
        channel: 'Eventos',
        objective: 'Networking e brand awareness',
      },
    ]

    for (var i = 0; i < seedData.length; i++) {
      try {
        app.findFirstRecordByData('trade_marketing_actions', 'title', seedData[i].title)
      } catch (_) {
        var col = app.findCollectionByNameOrId('trade_marketing_actions')
        var rec = new Record(col)
        var key = Object.keys(seedData[i])
        for (var j = 0; j < key.length; j++) {
          rec.set(key[j], seedData[i][key[j]])
        }
        rec.set('recurrence', 'nenhuma')
        rec.set('checklist', [
          { label: 'Material aprovado', checked: false },
          { label: 'Verba aprovada', checked: false },
          { label: 'Estoque disponivel', checked: false },
          { label: 'Equipe confirmada', checked: false },
          { label: 'Comunicacao enviada', checked: false },
          { label: 'PDV confirmado', checked: false },
          { label: 'Transporte', checked: false },
          { label: 'Materiais enviados', checked: false },
          { label: 'Fornecedor confirmado', checked: false },
          { label: 'Fotos obrigatorias', checked: false },
          { label: 'Relatorio final', checked: false },
        ])
        rec.set('indicators', {})
        rec.set('attachments', {})
        rec.set('evidence', {})
        rec.set('results', {})
        rec.set('created_by', '')
        rec.set('created_by_name', 'Sistema')
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('trade_marketing_actions')
      app.delete(col)
    } catch (_) {}
  },
)

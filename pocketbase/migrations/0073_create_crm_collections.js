migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var U = '_pb_users_auth_'

    var cleanup = [
      'crm_history',
      'crm_automation_rules',
      'crm_goals',
      'crm_proposals',
      'crm_activities',
      'crm_opportunities',
      'crm_leads',
      'crm_loss_reasons',
      'crm_funnel_stages',
    ]
    cleanup.forEach(function (n) {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (_) {}
      try {
        app
          .db()
          .newQuery('DROP TABLE IF EXISTS ' + n)
          .execute()
      } catch (_) {}
    })

    app.save(
      new Collection({
        name: 'crm_funnel_stages',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'order', type: 'number' },
          { name: 'probability', type: 'number' },
          { name: 'color', type: 'text' },
          { name: 'sla_days', type: 'number' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_crm_fs_order ON crm_funnel_stages (order)',
          'CREATE INDEX idx_crm_fs_active ON crm_funnel_stages (active)',
        ],
      }),
    )
    var fsId = app.findCollectionByNameOrId('crm_funnel_stages').id

    app.save(
      new Collection({
        name: 'crm_loss_reasons',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_crm_lr_active ON crm_loss_reasons (active)'],
      }),
    )
    var lrId = app.findCollectionByNameOrId('crm_loss_reasons').id

    app.save(
      new Collection({
        name: 'crm_leads',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'lead_number', type: 'text', required: true },
          { name: 'name', type: 'text', required: true },
          { name: 'trade_name', type: 'text' },
          { name: 'person_type', type: 'select', values: ['PF', 'PJ'], maxSelect: 1 },
          { name: 'cpf_cnpj', type: 'text' },
          { name: 'phone', type: 'text' },
          { name: 'whatsapp', type: 'text' },
          { name: 'email', type: 'text' },
          { name: 'city', type: 'text' },
          { name: 'state', type: 'text' },
          { name: 'segment', type: 'text' },
          { name: 'company_size', type: 'text' },
          { name: 'lead_source', type: 'text' },
          { name: 'campaign', type: 'text' },
          { name: 'product_interest', type: 'text' },
          { name: 'responsible_id', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'responsible_name', type: 'text' },
          { name: 'entry_date', type: 'text' },
          { name: 'next_action', type: 'text' },
          { name: 'observations', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'qualification_data', type: 'json' },
          { name: 'temperature', type: 'text' },
          { name: 'qualification_score', type: 'number' },
          { name: 'converted', type: 'bool' },
          { name: 'client_id', type: 'text' },
          { name: 'opportunity_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_crm_leads_status ON crm_leads (status)',
          'CREATE INDEX idx_crm_leads_resp ON crm_leads (responsible_id)',
          'CREATE INDEX idx_crm_leads_created ON crm_leads (created)',
          'CREATE UNIQUE INDEX idx_crm_leads_num ON crm_leads (lead_number)',
        ],
      }),
    )
    var leadsId = app.findCollectionByNameOrId('crm_leads').id

    app.save(
      new Collection({
        name: 'crm_opportunities',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'opportunity_number', type: 'text', required: true },
          { name: 'lead_id', type: 'relation', collectionId: leadsId, maxSelect: 1 },
          { name: 'client_id', type: 'text' },
          { name: 'client_name', type: 'text' },
          { name: 'title', type: 'text', required: true },
          { name: 'company', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'responsible_id', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'responsible_name', type: 'text' },
          { name: 'product_service', type: 'text' },
          { name: 'estimated_value', type: 'text' },
          { name: 'probability', type: 'number' },
          { name: 'open_date', type: 'text' },
          { name: 'expected_close_date', type: 'text' },
          { name: 'stage_id', type: 'relation', collectionId: fsId, maxSelect: 1 },
          { name: 'stage_name', type: 'text' },
          { name: 'competitors', type: 'json' },
          { name: 'next_action', type: 'text' },
          { name: 'observations', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'loss_reason_id', type: 'relation', collectionId: lrId, maxSelect: 1 },
          { name: 'loss_competitor', type: 'text' },
          { name: 'loss_value', type: 'text' },
          { name: 'loss_observations', type: 'text' },
          { name: 'loss_reopenable', type: 'bool' },
          { name: 'loss_recontact_date', type: 'text' },
          { name: 'proposal_id', type: 'text' },
          { name: 'order_id', type: 'text' },
          { name: 'contract_id', type: 'text' },
          { name: 'stage_entered_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_crm_opp_status ON crm_opportunities (status)',
          'CREATE INDEX idx_crm_opp_stage ON crm_opportunities (stage_id)',
          'CREATE INDEX idx_crm_opp_resp ON crm_opportunities (responsible_id)',
          'CREATE UNIQUE INDEX idx_crm_opp_num ON crm_opportunities (opportunity_number)',
        ],
      }),
    )
    var oppId = app.findCollectionByNameOrId('crm_opportunities').id

    app.save(
      new Collection({
        name: 'crm_activities',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'type', type: 'text' },
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'lead_id', type: 'relation', collectionId: leadsId, maxSelect: 1 },
          { name: 'opportunity_id', type: 'relation', collectionId: oppId, maxSelect: 1 },
          { name: 'client_id', type: 'text' },
          { name: 'client_name', type: 'text' },
          { name: 'responsible_id', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'responsible_name', type: 'text' },
          { name: 'scheduled_date', type: 'text' },
          { name: 'scheduled_time', type: 'text' },
          { name: 'duration_minutes', type: 'number' },
          { name: 'status', type: 'text' },
          { name: 'priority', type: 'text' },
          { name: 'result', type: 'text' },
          { name: 'follow_up_required', type: 'bool' },
          { name: 'follow_up_date', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_crm_act_date ON crm_activities (scheduled_date)',
          'CREATE INDEX idx_crm_act_status ON crm_activities (status)',
          'CREATE INDEX idx_crm_act_resp ON crm_activities (responsible_id)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'crm_proposals',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'proposal_number', type: 'text', required: true },
          { name: 'opportunity_id', type: 'relation', collectionId: oppId, maxSelect: 1 },
          { name: 'client_name', type: 'text' },
          { name: 'title', type: 'text', required: true },
          { name: 'responsible_id', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'responsible_name', type: 'text' },
          { name: 'items', type: 'json' },
          { name: 'subtotal', type: 'text' },
          { name: 'discount', type: 'text' },
          { name: 'total', type: 'text' },
          { name: 'payment_terms', type: 'text' },
          { name: 'delivery_terms', type: 'text' },
          { name: 'validity_date', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'sent_date', type: 'text' },
          { name: 'approved_date', type: 'text' },
          { name: 'rejected_reason', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_crm_prop_status ON crm_proposals (status)',
          'CREATE UNIQUE INDEX idx_crm_prop_num ON crm_proposals (proposal_number)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'crm_goals',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'type', type: 'text' },
          { name: 'target_value', type: 'text' },
          { name: 'realized_value', type: 'text' },
          { name: 'period', type: 'text' },
          { name: 'responsible_id', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'responsible_name', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'product_service', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'region', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_crm_goals_active ON crm_goals (active)'],
      }),
    )

    app.save(
      new Collection({
        name: 'crm_automation_rules',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'trigger', type: 'text' },
          { name: 'conditions', type: 'json' },
          { name: 'actions', type: 'json' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_crm_auto_active ON crm_automation_rules (active)'],
      }),
    )

    app.save(
      new Collection({
        name: 'crm_history',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: SA,
        deleteRule: null,
        fields: [
          { name: 'entity_type', type: 'text' },
          { name: 'entity_id', type: 'text' },
          { name: 'entity_name', type: 'text' },
          { name: 'type', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'user_id', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'user_name', type: 'text' },
          { name: 'date', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_crm_hist_entity ON crm_history (entity_type, entity_id)',
          'CREATE INDEX idx_crm_hist_date ON crm_history (date)',
        ],
      }),
    )

    var adminUserId = ''
    try {
      adminUserId = app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com').id
    } catch (_) {}

    var stagesData = [
      ['Novo Lead', 1, 10, '#3b82f6', 7],
      ['Qualificação', 2, 20, '#06b6d4', 7],
      ['Primeiro Contato', 3, 30, '#8b5cf6', 5],
      ['Diagnóstico', 4, 40, '#f59e0b', 10],
      ['Proposta', 5, 60, '#ec4899', 7],
      ['Negociação', 6, 70, '#f97316', 5],
      ['Aguardando Decisão', 7, 80, '#eab308', 5],
      ['Fechamento', 8, 100, '#22c55e', 3],
    ]
    var fsCol = app.findCollectionByNameOrId('crm_funnel_stages')
    stagesData.forEach(function (s) {
      try {
        app.findFirstRecordByData('crm_funnel_stages', 'name', s[0])
        return
      } catch (_) {}
      var r = new Record(fsCol)
      r.set('name', s[0])
      r.set('order', s[1])
      r.set('probability', s[2])
      r.set('color', s[3])
      r.set('sla_days', s[4])
      r.set('active', true)
      app.save(r)
    })

    var lossData = [
      'Preço elevado',
      'Concorrente com melhor proposta',
      'Produto/Serviço não atende',
      'Sem orçamento',
      'Decisão adiada',
      'Não tem interesse',
      'Sem retorno do cliente',
      'Escolheu concorrente',
      'Problema de prazo',
      'Outro',
    ]
    var lrCol = app.findCollectionByNameOrId('crm_loss_reasons')
    lossData.forEach(function (n) {
      try {
        app.findFirstRecordByData('crm_loss_reasons', 'name', n)
        return
      } catch (_) {}
      var r = new Record(lrCol)
      r.set('name', n)
      r.set('active', true)
      app.save(r)
    })

    var leadsCol = app.findCollectionByNameOrId('crm_leads')
    var sampleLeads = [
      [
        'Transportadora Express LTDA',
        'Transportadora Express',
        'PJ',
        '12.345.678/0001-90',
        '(27) 3322-1100',
        '(27) 99876-5432',
        'contato@transportadoraexpress.com.br',
        'Vitória',
        'ES',
        'Logística',
        'Média',
        'Site',
        'Campanha Google',
        'Transporte de Cargas',
        'Novo',
        'Frio',
      ],
      [
        'Comércio Atacadista Silva',
        'Silva Atacado',
        'PJ',
        '98.765.432/0001-10',
        '(27) 3333-4455',
        '(27) 99888-7766',
        'compras@silvaatacado.com.br',
        'Vila Velha',
        'ES',
        'Atacado',
        'Grande',
        'Indicação',
        '',
        'Armazenagem',
        'Em Contato',
        'Morno',
      ],
      [
        'João Carlos Mendes',
        '',
        'PF',
        '123.456.789-00',
        '(27) 99654-1234',
        '(27) 99654-1234',
        'joao.mendes@email.com',
        'Serra',
        'ES',
        'Varejo',
        'Pequeno',
        'WhatsApp',
        '',
        'Distribuição Urbana',
        'Qualificado',
        'Quente',
      ],
    ]
    sampleLeads.forEach(function (l, i) {
      try {
        app.findFirstRecordByData(
          'crm_leads',
          'lead_number',
          'LEAD-' + String(i + 1).padStart(5, '0'),
        )
        return
      } catch (_) {}
      var r = new Record(leadsCol)
      r.set('lead_number', 'LEAD-' + String(i + 1).padStart(5, '0'))
      r.set('name', l[0])
      r.set('trade_name', l[1] || '')
      r.set('person_type', l[2])
      r.set('cpf_cnpj', l[3])
      r.set('phone', l[4])
      r.set('whatsapp', l[5])
      r.set('email', l[6])
      r.set('city', l[7])
      r.set('state', l[8])
      r.set('segment', l[9])
      r.set('company_size', l[10])
      r.set('lead_source', l[11])
      r.set('campaign', l[12])
      r.set('product_interest', l[13])
      r.set('status', l[14])
      r.set('temperature', l[15])
      r.set('entry_date', new Date().toISOString().split('T')[0])
      if (adminUserId) r.set('responsible_id', adminUserId)
      r.set('company', 'Velora Log')
      r.set('filial', 'Matriz')
      r.set('qualification_score', l[15] === 'Quente' ? 80 : l[15] === 'Morno' ? 50 : 20)
      app.save(r)
    })

    var oppCol = app.findCollectionByNameOrId('crm_opportunities')
    var stage1Id = ''
    var stage5Id = ''
    try {
      stage1Id = app.findFirstRecordByData('crm_funnel_stages', 'name', 'Novo Lead').id
    } catch (_) {}
    try {
      stage5Id = app.findFirstRecordByData('crm_funnel_stages', 'name', 'Proposta').id
    } catch (_) {}
    var sampleOpps = [
      [
        'OPP-00001',
        'Transportadora Express LTDA',
        'Contrato Logística Anual',
        'Transporte de Cargas',
        '45000',
        'Em Aberto',
        stage1Id,
        10,
      ],
      [
        'OPP-00002',
        'Comércio Atacadista Silva',
        'Armazenagem + Distribuição',
        'Armazenagem',
        '28000',
        'Em Negociação',
        stage5Id,
        60,
      ],
    ]
    sampleOpps.forEach(function (o) {
      try {
        app.findFirstRecordByData('crm_opportunities', 'opportunity_number', o[0])
        return
      } catch (_) {}
      var r = new Record(oppCol)
      r.set('opportunity_number', o[0])
      r.set('client_name', o[1])
      r.set('title', o[2])
      r.set('product_service', o[3])
      r.set('estimated_value', o[4])
      r.set('status', o[5])
      if (o[6]) r.set('stage_id', o[6])
      r.set('probability', o[7])
      r.set('open_date', new Date().toISOString().split('T')[0])
      if (adminUserId) r.set('responsible_id', adminUserId)
      r.set('company', 'Velora Log')
      r.set('filial', 'Matriz')
      r.set('stage_entered_at', new Date().toISOString())
      app.save(r)
    })
  },
  (app) => {
    var cols = [
      'crm_history',
      'crm_automation_rules',
      'crm_goals',
      'crm_proposals',
      'crm_activities',
      'crm_opportunities',
      'crm_leads',
      'crm_loss_reasons',
      'crm_funnel_stages',
    ]
    cols.forEach(function (n) {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (_) {}
      try {
        app
          .db()
          .newQuery('DROP TABLE IF EXISTS ' + n)
          .execute()
      } catch (_) {}
    })
  },
)

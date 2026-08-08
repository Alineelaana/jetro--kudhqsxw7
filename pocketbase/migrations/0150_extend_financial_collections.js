migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('financial_collections')

    var newFields = [
      ['client_id', 'text'],
      ['aging_bucket', 'text'],
      ['collection_priority', 'text'],
      ['risk_classification', 'text'],
      ['risk_factors', 'json'],
      ['risk_score', 'number'],
      ['promise_value', 'text'],
      ['promise_date', 'text'],
      ['promise_status', 'text'],
      ['promise_payment_method', 'text'],
      ['promise_responsible', 'text'],
      ['dispute_reason', 'text'],
      ['dispute_status', 'text'],
      ['dispute_responsible', 'text'],
      ['dispute_deadline', 'text'],
      ['next_action_type', 'text'],
      ['next_action_date', 'text'],
      ['next_action_time', 'text'],
      ['next_action_priority', 'text'],
      ['next_action_responsible', 'text'],
      ['contacts_log', 'json'],
      ['negotiations_log', 'json'],
      ['title_ids', 'json'],
      ['collection_type', 'text'],
    ]

    for (var i = 0; i < newFields.length; i++) {
      var name = newFields[i][0]
      var type = newFields[i][1]
      if (!col.fields.getByName(name)) {
        if (type === 'text') col.fields.add(new TextField({ name: name }))
        else if (type === 'number') col.fields.add(new NumberField({ name: name }))
        else if (type === 'json') col.fields.add(new JSONField({ name: name }))
      }
    }

    col.addIndex('idx_fin_col_priority', false, 'collection_priority', '')
    col.addIndex('idx_fin_col_promise', false, 'promise_status', '')
    col.addIndex('idx_fin_col_risk', false, 'risk_classification', '')
    app.save(col)

    var recvCol = app.findCollectionByNameOrId('financial_receivables')
    var seeds = [
      ['REC-001', 'Empresa Alpha Ltda', '2026-07-15', '10000', '4000', 'Parcialmente Recebido'],
      ['REC-002', 'Empresa Alpha Ltda', '2026-07-20', '5000', '0', 'Vencido'],
      ['REC-003', 'Comercio Beta ME', '2026-08-01', '8000', '0', 'Vencido'],
      ['REC-004', 'Distribuidora Gamma SA', '2026-06-10', '15000', '0', 'Vencido'],
      ['REC-005', 'Comercio Beta ME', '2026-08-08', '3000', '0', 'Em Aberto'],
      ['REC-006', 'Delta Comercio Ltda', '2026-07-10', '5000', '5000', 'Recebido'],
      ['REC-007', 'Epsilon Distribuidora', '2026-07-05', '10000', '6000', 'Parcialmente Recebido'],
      ['REC-008', 'Zeta Mercantil SA', '2026-06-01', '8000', '0', 'Vencido'],
    ]
    for (var j = 0; j < seeds.length; j++) {
      var s = seeds[j]
      try {
        app.findFirstRecordByData('financial_receivables', 'numero_titulo', s[0])
      } catch (_) {
        var r = new Record(recvCol)
        r.set('numero_titulo', s[0])
        r.set('cliente', s[1])
        r.set('data_vencimento', s[2])
        r.set('valor_original', s[3])
        r.set('valor_recebido', s[4])
        r.set('status', s[5])
        r.set('empresa', 'Velora Log')
        r.set('filial', 'Matriz')
        app.save(r)
      }
    }

    var colCol = app.findCollectionByNameOrId('financial_collections')
    var colSeeds = [
      ['Empresa Alpha Ltda', 'Em Cobranca', 'alto', 'Alta', '5000', '2026-08-15', 'Pendente'],
      ['Comercio Beta ME', 'Aguardando Contato', 'medio', 'Media', '', '', ''],
      ['Distribuidora Gamma SA', 'Em Cobranca', 'critico', 'Urgente', '', '', ''],
      ['Delta Comercio Ltda', 'Pago', 'baixo', 'Baixa', '5000', '2026-07-10', 'Cumprida'],
      [
        'Epsilon Distribuidora',
        'Em Cobranca',
        'medio',
        'Alta',
        '10000',
        '2026-07-05',
        'Parcialmente cumprida',
      ],
      ['Zeta Mercantil SA', 'Em Cobranca', 'critico', 'Urgente', '8000', '2026-07-01', 'Quebrada'],
    ]
    for (var k = 0; k < colSeeds.length; k++) {
      var cs = colSeeds[k]
      try {
        app.findFirstRecordByData('financial_collections', 'cliente', cs[0])
      } catch (_) {
        var cr = new Record(colCol)
        cr.set('cliente', cs[0])
        cr.set('status', cs[1])
        cr.set('risk_classification', cs[2])
        cr.set('collection_priority', cs[3])
        cr.set('promise_value', cs[4])
        cr.set('promise_date', cs[5])
        cr.set('promise_status', cs[6])
        cr.set('responsavel_cobranca', 'Carlos Cobranca')
        cr.set('empresa', 'Velora Log')
        cr.set('filial', 'Matriz')
        cr.set('dias_atraso', 30)
        cr.set('valor_original', '10000')
        cr.set('valor_atualizado', '10000')
        cr.set('contacts_log', [])
        cr.set('negotiations_log', [])
        cr.set('historico', [
          {
            date: '2026-08-01T10:00:00Z',
            user: 'Carlos Cobranca',
            action: 'created',
            observation: 'Cliente adicionado a carteira de cobranca',
          },
        ])
        app.save(cr)
      }
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('financial_collections')
    var toRemove = [
      'client_id',
      'aging_bucket',
      'collection_priority',
      'risk_classification',
      'risk_factors',
      'risk_score',
      'promise_value',
      'promise_date',
      'promise_status',
      'promise_payment_method',
      'promise_responsible',
      'dispute_reason',
      'dispute_status',
      'dispute_responsible',
      'dispute_deadline',
      'next_action_type',
      'next_action_date',
      'next_action_time',
      'next_action_priority',
      'next_action_responsible',
      'contacts_log',
      'negotiations_log',
      'title_ids',
      'collection_type',
    ]
    for (var i = 0; i < toRemove.length; i++) {
      var f = col.fields.getByName(toRemove[i])
      if (f) col.fields.remove(f)
    }
    col.removeIndex('idx_fin_col_priority')
    col.removeIndex('idx_fin_col_promise')
    col.removeIndex('idx_fin_col_risk')
    app.save(col)
  },
)

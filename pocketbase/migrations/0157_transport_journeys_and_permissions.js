migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    try {
      app.findCollectionByNameOrId('transport_journeys')
    } catch (_) {
      app.save(
        new Collection({
          name: 'transport_journeys',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            { name: 'numero_viagem', type: 'text' },
            { name: 'status', type: 'text' },
            { name: 'rota', type: 'text' },
            { name: 'veiculo', type: 'text' },
            { name: 'motorista', type: 'text' },
            { name: 'transportadora', type: 'text' },
            { name: 'romaneio_id', type: 'text' },
            { name: 'numero_romaneio', type: 'text' },
            { name: 'origem', type: 'text' },
            { name: 'destino', type: 'text' },
            { name: 'data_prevista_saida', type: 'text' },
            { name: 'data_prevista_chegada', type: 'text' },
            { name: 'data_saida', type: 'text' },
            { name: 'data_chegada', type: 'text' },
            { name: 'peso_total', type: 'text' },
            { name: 'volume_total', type: 'text' },
            { name: 'quantidade_entregas', type: 'number' },
            { name: 'valor_frete', type: 'text' },
            { name: 'custo_total', type: 'text' },
            { name: 'tipo_transporte', type: 'text' },
            { name: 'empresa', type: 'text' },
            { name: 'filial', type: 'text' },
            { name: 'responsavel', type: 'text' },
            { name: 'observacoes', type: 'text' },
            { name: 'entregas', type: 'json' },
            { name: 'documentos', type: 'json' },
            { name: 'ocorrencias', type: 'json' },
            { name: 'rastreamento', type: 'json' },
            { name: 'comprovantes', type: 'json' },
            { name: 'historico', type: 'json' },
          ].concat(ad),
          indexes: [
            'CREATE INDEX idx_transport_journeys_status ON transport_journeys (status)',
            'CREATE INDEX idx_transport_journeys_created ON transport_journeys (created DESC)',
          ],
        }),
      )
    }

    var paramsCol = app.findCollectionByNameOrId('system_parameters')

    var TRANS_PERMS = [
      {
        key: 'trans_view',
        label: 'Visualizar Transporte',
        roles: ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'],
      },
      { key: 'trans_plan_load', label: 'Planejar Carga', roles: ['SUP', 'PADRAO', 'SDR'] },
      { key: 'trans_create_route', label: 'Criar Rota', roles: ['SUP', 'PADRAO'] },
      { key: 'trans_release_journey', label: 'Liberar Viagem', roles: ['SUP', 'PADRAO'] },
      { key: 'trans_update_delivery', label: 'Atualizar Entrega', roles: ['SUP', 'PADRAO', 'SDR'] },
      {
        key: 'trans_register_occurrence',
        label: 'Registrar Ocorrência',
        roles: ['SUP', 'PADRAO', 'SDR', 'Vendedor'],
      },
      { key: 'trans_approve_freight', label: 'Aprovar Frete', roles: ['SUP'] },
      { key: 'trans_register_vehicle', label: 'Cadastrar Veículo', roles: ['SUP', 'PADRAO'] },
      { key: 'trans_register_driver', label: 'Cadastrar Motorista', roles: ['SUP', 'PADRAO'] },
      {
        key: 'trans_view_costs',
        label: 'Visualizar Custos de Transporte',
        roles: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        key: 'trans_view_tracking',
        label: 'Visualizar Rastreamento',
        roles: ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'],
      },
      { key: 'trans_cancel_journey', label: 'Cancelar Viagem', roles: ['SUP'] },
      {
        key: 'trans_export',
        label: 'Exportar Dados de Transporte',
        roles: ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'],
      },
    ]

    var LOG_PERMS = [
      {
        key: 'log_view',
        label: 'Visualizar Logística',
        roles: ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        key: 'log_plan_operation',
        label: 'Planejar Operação Logística',
        roles: ['SUP', 'PADRAO', 'SDR'],
      },
      { key: 'log_prioritize', label: 'Priorizar Movimentações', roles: ['SUP', 'PADRAO', 'SDR'] },
      {
        key: 'log_track',
        label: 'Acompanhar Fluxo End-to-End',
        roles: ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        key: 'log_manage_exceptions',
        label: 'Gerenciar Exceções Logísticas',
        roles: ['SUP', 'PADRAO'],
      },
      { key: 'log_manage_transfers', label: 'Gerenciar Transferências', roles: ['SUP', 'PADRAO'] },
      { key: 'log_manage_collections', label: 'Gerenciar Coletas', roles: ['SUP', 'PADRAO'] },
      { key: 'log_approve_reverse', label: 'Aprovar Logística Reversa', roles: ['SUP', 'PADRAO'] },
      {
        key: 'log_view_consolidated_costs',
        label: 'Visualizar Custos Consolidados',
        roles: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        key: 'log_export',
        label: 'Exportar Dados Logísticos',
        roles: ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'],
      },
    ]

    var allPerms = TRANS_PERMS.concat(LOG_PERMS)
    for (var i = 0; i < allPerms.length; i++) {
      var p = allPerms[i]
      try {
        app.findFirstRecordByData('system_parameters', 'key', p.key)
      } catch (_) {
        var rec = new Record(paramsCol)
        rec.set('module', p.key.startsWith('trans_') ? 'transporte' : 'logistics')
        rec.set('key', p.key)
        rec.set('label', p.label)
        rec.set('value', JSON.stringify({ roles: p.roles }))
        rec.set('value_type', 'json')
        rec.set('active', true)
        app.save(rec)
      }
    }

    var journeyCol = app.findCollectionByNameOrId('transport_journeys')
    var seeds = [
      {
        numero_viagem: 'VIA-001',
        status: 'Em Trânsito',
        rota: 'Rota Norte ES',
        veiculo: 'ABC1D23',
        motorista: 'João Silva',
        transportadora: 'Próprio',
        origem: 'Vitória/ES',
        destino: 'Linhares/ES',
        data_prevista_saida: '2026-08-10',
        data_prevista_chegada: '2026-08-10',
        quantidade_entregas: 5,
        valor_frete: '1250.00',
        custo_total: '980.00',
        tipo_transporte: 'Próprio',
      },
      {
        numero_viagem: 'VIA-002',
        status: 'Planejada',
        rota: 'Rota Sul ES',
        veiculo: 'DEF2G34',
        motorista: 'Carlos Santos',
        transportadora: 'Terceirizado',
        origem: 'Vitória/ES',
        destino: 'Cachoeiro de Itapemirim/ES',
        data_prevista_saida: '2026-08-12',
        data_prevista_chegada: '2026-08-12',
        quantidade_entregas: 3,
        valor_frete: '890.00',
        custo_total: '720.00',
        tipo_transporte: 'Terceirizado',
      },
      {
        numero_viagem: 'VIA-003',
        status: 'Finalizada',
        rota: 'Rota Metropolitana',
        veiculo: 'GHI3H45',
        motorista: 'Pedro Oliveira',
        transportadora: 'Próprio',
        origem: 'Vila Velha/ES',
        destino: 'Serra/ES',
        data_prevista_saida: '2026-08-08',
        data_prevista_chegada: '2026-08-08',
        data_saida: '2026-08-08',
        data_chegada: '2026-08-08',
        quantidade_entregas: 8,
        valor_frete: '650.00',
        custo_total: '480.00',
        tipo_transporte: 'Próprio',
      },
    ]
    for (var j = 0; j < seeds.length; j++) {
      var s = seeds[j]
      try {
        app.findFirstRecordByData('transport_journeys', 'numero_viagem', s.numero_viagem)
      } catch (_) {
        var jr = new Record(journeyCol)
        for (var k in s) {
          jr.set(k, s[k])
        }
        jr.set('entregas', [])
        jr.set('documentos', [])
        jr.set('ocorrencias', [])
        jr.set('rastreamento', [])
        jr.set('comprovantes', [])
        jr.set('historico', [{ action: 'Criada', date: new Date().toISOString() }])
        jr.set('responsavel', 'Sistema')
        jr.set('observacoes', '')
        jr.set('peso_total', '0')
        jr.set('volume_total', '0')
        app.save(jr)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('transport_journeys'))
    } catch (_) {}
    var keys = [
      'trans_view',
      'trans_plan_load',
      'trans_create_route',
      'trans_release_journey',
      'trans_update_delivery',
      'trans_register_occurrence',
      'trans_approve_freight',
      'trans_register_vehicle',
      'trans_register_driver',
      'trans_view_costs',
      'trans_view_tracking',
      'trans_cancel_journey',
      'trans_export',
      'log_view',
      'log_plan_operation',
      'log_prioritize',
      'log_track',
      'log_manage_exceptions',
      'log_manage_transfers',
      'log_manage_collections',
      'log_approve_reverse',
      'log_view_consolidated_costs',
      'log_export',
    ]
    for (var i = 0; i < keys.length; i++) {
      try {
        app.delete(app.findFirstRecordByData('system_parameters', 'key', keys[i]))
      } catch (_) {}
    }
  },
)

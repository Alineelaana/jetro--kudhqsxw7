migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]
    function mk(name, fields, rules, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: rules[0],
          viewRule: rules[1],
          createRule: rules[2],
          updateRule: rules[3],
          deleteRule: rules[4],
          fields: fields.concat(ad),
          indexes: indexes || [],
        }),
      )
    }
    var usersId = '_pb_users_auth_'

    var _cleanupCols = [
      'fluxo_etapa_status',
      'atendimento_historico',
      'service_centers',
      'fluxo_etapas',
      'fluxos_inteligentes',
      'atendimento_motivos',
      'atendimento_setores',
    ]
    _cleanupCols.forEach(function (name) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {}
    })

    mk(
      'atendimento_setores',
      [
        { name: 'nome', type: 'text', required: true },
        { name: 'gerente_id', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'email', type: 'text' },
        { name: 'active', type: 'bool' },
      ],
      [R, R, R, R, SA],
      ['CREATE INDEX idx_atend_setores_active ON atendimento_setores (active)'],
    )

    var setoresId = app.findCollectionByNameOrId('atendimento_setores').id

    mk(
      'atendimento_motivos',
      [
        { name: 'nome', type: 'text', required: true },
        { name: 'setor_id', type: 'relation', collectionId: setoresId, maxSelect: 1 },
        { name: 'sla_horas', type: 'number' },
        { name: 'active', type: 'bool' },
      ],
      [R, R, R, R, SA],
      ['CREATE INDEX idx_atend_motivos_active ON atendimento_motivos (active)'],
    )

    var motivosId = app.findCollectionByNameOrId('atendimento_motivos').id

    mk(
      'fluxos_inteligentes',
      [
        { name: 'nome', type: 'text', required: true },
        { name: 'motivo_id', type: 'relation', collectionId: motivosId, maxSelect: 1 },
        { name: 'setor_id', type: 'relation', collectionId: setoresId, maxSelect: 1 },
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        {
          name: 'prioridade',
          type: 'select',
          values: ['Baixa', 'Normal', 'Alta', 'Urgente'],
          maxSelect: 1,
        },
        { name: 'sla_hours', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['Ativo', 'Inativo', 'Em Configuração'],
          maxSelect: 1,
        },
        { name: 'documentos_obrigatorios', type: 'json' },
      ],
      [R, R, R, R, SA],
      ['CREATE INDEX idx_fluxos_status ON fluxos_inteligentes (status)'],
    )

    var fluxosId = app.findCollectionByNameOrId('fluxos_inteligentes').id

    mk(
      'fluxo_etapas',
      [
        {
          name: 'fluxo_id',
          type: 'relation',
          collectionId: fluxosId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'ordem', type: 'number' },
        { name: 'nome', type: 'text', required: true },
        { name: 'setor_id', type: 'relation', collectionId: setoresId, maxSelect: 1 },
        { name: 'usuario_id', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'tempo_maximo_minutos', type: 'number' },
        { name: 'descricao_atividade', type: 'text' },
        { name: 'obrigatoria', type: 'bool' },
        { name: 'permitir_anexos', type: 'bool' },
        { name: 'exigir_observacao', type: 'bool' },
        { name: 'exigir_aprovacao', type: 'bool' },
        { name: 'checklist', type: 'json' },
        { name: 'parallel', type: 'bool' },
      ],
      [R, R, R, R, SA],
      ['CREATE INDEX idx_fluxo_etapas_fluxo ON fluxo_etapas (fluxo_id)'],
    )

    var etapasId = app.findCollectionByNameOrId('fluxo_etapas').id

    mk(
      'service_centers',
      [
        { name: 'protocol', type: 'text', required: true },
        { name: 'client_id', type: 'text' },
        { name: 'client_name', type: 'text' },
        { name: 'client_email', type: 'text' },
        { name: 'client_phone', type: 'text' },
        { name: 'motivo_id', type: 'relation', collectionId: motivosId, maxSelect: 1 },
        { name: 'setor_id', type: 'relation', collectionId: setoresId, maxSelect: 1 },
        { name: 'origem', type: 'text' },
        { name: 'tipo', type: 'text' },
        { name: 'prioridade', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'descricao', type: 'text' },
        { name: 'pedido_id', type: 'text' },
        { name: 'nf_id', type: 'text' },
        { name: 'chave_nf', type: 'text' },
        { name: 'data_abertura', type: 'text' },
        { name: 'hora_abertura', type: 'text' },
        { name: 'usuario_abertura', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        { name: 'sla_limite', type: 'text' },
        { name: 'sla_cumprido', type: 'bool' },
        { name: 'data_encerramento', type: 'text' },
        { name: 'usuario_encerramento', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'flow_id', type: 'relation', collectionId: fluxosId, maxSelect: 1 },
        { name: 'current_stage_id', type: 'text' },
        { name: 'data_hora_limite', type: 'text' },
        { name: 'classificacao_ia_sugerida', type: 'json' },
        { name: 'classificacao_ia_confirmada', type: 'bool' },
        { name: 'affected_items', type: 'json' },
        { name: 'internal_comments', type: 'json' },
        { name: 'client_messages', type: 'json' },
        { name: 'cancel_reason', type: 'text' },
      ],
      [R, R, R, R, SA],
      [
        'CREATE INDEX idx_sc_status ON service_centers (status)',
        'CREATE INDEX idx_sc_motivo ON service_centers (motivo_id)',
        'CREATE INDEX idx_sc_setor ON service_centers (setor_id)',
        'CREATE INDEX idx_sc_client ON service_centers (client_id)',
        'CREATE INDEX idx_sc_created ON service_centers (created)',
      ],
    )

    var scId = app.findCollectionByNameOrId('service_centers').id

    mk(
      'atendimento_historico',
      [
        {
          name: 'atendimento_id',
          type: 'relation',
          collectionId: scId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'tipo', type: 'text' },
        { name: 'usuario_id', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'data_hora', type: 'text' },
        { name: 'conteudo', type: 'text' },
        { name: 'anexos', type: 'json' },
        { name: 'old_value', type: 'text' },
        { name: 'new_value', type: 'text' },
      ],
      [R, R, R, R, SA],
      ['CREATE INDEX idx_atend_hist_atend ON atendimento_historico (atendimento_id)'],
    )

    mk(
      'fluxo_etapa_status',
      [
        {
          name: 'atendimento_id',
          type: 'relation',
          collectionId: scId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'etapa_id', type: 'relation', collectionId: etapasId, maxSelect: 1 },
        { name: 'status', type: 'text' },
        { name: 'data_inicio', type: 'text' },
        { name: 'data_fim', type: 'text' },
        { name: 'usuario_responsavel', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'observacoes', type: 'text' },
        { name: 'anexos', type: 'json' },
        { name: 'tempo_gasto_minutos', type: 'number' },
        { name: 'data_hora_limite', type: 'text' },
        { name: 'checklist_progress', type: 'json' },
        { name: 'approval_status', type: 'text' },
        { name: 'approval_comment', type: 'text' },
        { name: 'approval_user', type: 'relation', collectionId: usersId, maxSelect: 1 },
      ],
      [R, R, R, R, SA],
      [
        'CREATE INDEX idx_fes_atend ON fluxo_etapa_status (atendimento_id)',
        'CREATE INDEX idx_fes_etapa ON fluxo_etapa_status (etapa_id)',
        'CREATE INDEX idx_fes_status ON fluxo_etapa_status (status)',
      ],
    )

    var adminUserId = ''
    try {
      adminUserId = app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com').id
    } catch (_) {}

    var setoresData = [
      ['Financeiro', 24],
      ['Logística', 4],
      ['Fiscal', 8],
      ['Comercial', 8],
      ['Compras', 24],
      ['TI', 24],
      ['RH', 48],
    ]
    var setorIds = {}
    var setoresCol = app.findCollectionByNameOrId('atendimento_setores')
    setoresData.forEach(function (s) {
      try {
        app.findFirstRecordByData('atendimento_setores', 'nome', s[0])
        return
      } catch (_) {}
      var r = new Record(setoresCol)
      r.set('nome', s[0])
      r.set('active', true)
      if (s[0] === 'Financeiro' && adminUserId) r.set('gerente_id', adminUserId)
      app.save(r)
    })
    setoresData.forEach(function (s) {
      try {
        setorIds[s[0]] = app.findFirstRecordByData('atendimento_setores', 'nome', s[0]).id
      } catch (_) {}
    })

    var motivosData = [
      ['Produto Avariado', 'Logística', 4],
      ['Produto Faltando', 'Logística', 4],
      ['Produto Incorreto', 'Comercial', 8],
      ['Troca', 'Comercial', 8],
      ['Devolução', 'Comercial', 8],
      ['Garantia', 'Comercial', 24],
      ['Divergência na NF', 'Fiscal', 8],
      ['Divergência no Pedido', 'Comercial', 8],
      ['Cobrança Indevida', 'Financeiro', 8],
      ['Boleto', 'Financeiro', 24],
      ['Financeiro', 'Financeiro', 24],
      ['Entrega em Atraso', 'Logística', 4],
      ['Entrega Parcial', 'Logística', 4],
      ['Problema Logístico', 'Logística', 4],
      ['Problema Comercial', 'Comercial', 8],
      ['Cadastro', 'TI', 24],
      ['Reclamação', 'Comercial', 8],
      ['Sugestão', 'TI', 48],
      ['Elogio', 'Comercial', 48],
      ['Dúvida', 'Comercial', 48],
      ['Outro', 'Comercial', 24],
    ]
    var motivosCol = app.findCollectionByNameOrId('atendimento_motivos')
    var motivoIds = {}
    motivosData.forEach(function (m) {
      try {
        app.findFirstRecordByData('atendimento_motivos', 'nome', m[0])
        return
      } catch (_) {}
      var r = new Record(motivosCol)
      r.set('nome', m[0])
      r.set('sla_horas', m[2])
      r.set('active', true)
      if (setorIds[m[1]]) r.set('setor_id', setorIds[m[1]])
      app.save(r)
    })
    try {
      motivoIds['Produto Avariado'] = app.findFirstRecordByData(
        'atendimento_motivos',
        'nome',
        'Produto Avariado',
      ).id
    } catch (_) {}
    try {
      motivoIds['Cobrança Indevida'] = app.findFirstRecordByData(
        'atendimento_motivos',
        'nome',
        'Cobrança Indevida',
      ).id
    } catch (_) {}

    var fluxosCol = app.findCollectionByNameOrId('fluxos_inteligentes')
    var etapasCol = app.findCollectionByNameOrId('fluxo_etapas')

    try {
      app.findFirstRecordByData('fluxos_inteligentes', 'nome', 'Fluxo Produto Avariado')
    } catch (_) {
      if (motivoIds['Produto Avariado']) {
        var f1 = new Record(fluxosCol)
        f1.set('nome', 'Fluxo Produto Avariado')
        f1.set('motivo_id', motivoIds['Produto Avariado'])
        f1.set('prioridade', 'Alta')
        f1.set('sla_hours', 8)
        f1.set('status', 'Ativo')
        f1.set('documentos_obrigatorios', ['Foto do produto', 'Foto da embalagem', 'Foto da NF'])
        app.save(f1)
        var stages1 = [
          ['Receber Atendimento', 'Comercial', 30, 'Receber e registrar o atendimento inicial'],
          ['Validar NF', 'Fiscal', 60, 'Verificar número e dados da NF'],
          ['Verificar Lote', 'Logística', 60, 'Conferir lote e validade do produto'],
          ['Verificar Fotos', 'Logística', 30, 'Analisar fotos enviadas do produto'],
          ['Encaminhar à Logística', 'Logística', 30, 'Encaminhar caso para análise logística'],
          [
            'Avaliar Necessidade de Coleta',
            'Logística',
            120,
            'Decidir se há necessidade de coleta do produto',
          ],
          [
            'Autorizar Troca/Devolução',
            'Comercial',
            120,
            'Autorizar a troca ou devolução do produto',
          ],
          [
            'Atualizar Financeiro',
            'Financeiro',
            60,
            'Atualizar sistema financeiro com créditos/estornos',
          ],
          ['Informar Cliente', 'Comercial', 30, 'Comunicar decisão ao cliente'],
          ['Fechar Atendimento', 'Comercial', 30, 'Finalizar o atendimento'],
        ]
        stages1.forEach(function (st, i) {
          var e = new Record(etapasCol)
          e.set('fluxo_id', f1.id)
          e.set('ordem', i + 1)
          e.set('nome', st[0])
          if (setorIds[st[1]]) e.set('setor_id', setorIds[st[1]])
          e.set('tempo_maximo_minutos', st[2])
          e.set('descricao_atividade', st[3])
          e.set('obrigatoria', true)
          e.set('permitir_anexos', true)
          if (st[0] === 'Autorizar Troca/Devolução') e.set('exigir_aprovacao', true)
          app.save(e)
        })
      }
    }

    try {
      app.findFirstRecordByData('fluxos_inteligentes', 'nome', 'Fluxo Cobrança Indevida')
    } catch (_) {
      if (motivoIds['Cobrança Indevida']) {
        var f2 = new Record(fluxosCol)
        f2.set('nome', 'Fluxo Cobrança Indevida')
        f2.set('motivo_id', motivoIds['Cobrança Indevida'])
        f2.set('prioridade', 'Alta')
        f2.set('sla_hours', 8)
        f2.set('status', 'Ativo')
        f2.set('documentos_obrigatorios', ['Comprovante de pagamento', 'NF original'])
        app.save(f2)
        var stages2 = [
          ['Receber Atendimento', 'Financeiro', 30, 'Receber e registrar a reclamação de cobrança'],
          ['Verificar Cobrança', 'Financeiro', 60, 'Analisar a cobrança questionada'],
          [
            'Validar com Financeiro',
            'Financeiro',
            120,
            'Validar a divergência com o setor financeiro',
          ],
          ['Corrigir Boleto', 'Financeiro', 60, 'Realizar a correção do boleto ou cobrança'],
          ['Notificar Cliente', 'Financeiro', 30, 'Comunicar a resolução ao cliente'],
          ['Fechar Atendimento', 'Financeiro', 30, 'Finalizar o atendimento'],
        ]
        stages2.forEach(function (st, i) {
          var e = new Record(etapasCol)
          e.set('fluxo_id', f2.id)
          e.set('ordem', i + 1)
          e.set('nome', st[0])
          if (setorIds[st[1]]) e.set('setor_id', setorIds[st[1]])
          e.set('tempo_maximo_minutos', st[2])
          e.set('descricao_atividade', st[3])
          e.set('obrigatoria', true)
          if (st[0] === 'Validar com Financeiro') e.set('exigir_aprovacao', true)
          app.save(e)
        })
      }
    }
  },
  (app) => {
    var cols = [
      'fluxo_etapa_status',
      'atendimento_historico',
      'service_centers',
      'fluxo_etapas',
      'fluxos_inteligentes',
      'atendimento_motivos',
      'atendimento_setores',
    ]
    cols.forEach(function (name) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {}
    })
  },
)

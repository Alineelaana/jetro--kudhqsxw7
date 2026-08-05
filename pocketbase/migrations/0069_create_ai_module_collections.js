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
    function J(n) {
      return new JSONField({ name: n })
    }
    function S(n, v) {
      return new SelectField({ name: n, values: v, maxSelect: 1 })
    }

    function mk(name, fields, rules, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: rules.listRule,
          viewRule: rules.viewRule,
          createRule: rules.createRule,
          updateRule: rules.updateRule,
          deleteRule: rules.deleteRule,
          fields: fields.concat(A),
          indexes: indexes || [],
        }),
      )
    }

    var stdRules = {
      listRule: R,
      viewRule: R,
      createRule: R,
      updateRule: R,
      deleteRule: RS,
    }

    var publicCreateRules = {
      listRule: R,
      viewRule: R,
      createRule: '',
      updateRule: R,
      deleteRule: null,
    }

    var supRules = {
      listRule: R,
      viewRule: R,
      createRule: RS,
      updateRule: RS,
      deleteRule: RS,
    }

    mk(
      'ai_module_settings',
      [
        T('assistant_name'),
        T('language'),
        T('communication_tone'),
        T('working_hours'),
        N('interaction_limit'),
        N('response_time'),
        N('transfer_time'),
        S('autonomy_level', [
          'Somente Consultar',
          'Consultar e Sugerir',
          'Preparar Ações',
          'Executar com Confirmação',
          'Executar Ações Autorizadas',
        ]),
        J('actions_requiring_confirmation'),
        J('actions_requiring_approval'),
        N('history_retention'),
        J('allowed_channels'),
        J('empresas'),
        J('perfis_acesso'),
      ],
      supRules,
      [],
    )

    mk(
      'ai_agents',
      [
        T('name'),
        T('description'),
        T('objective'),
        T('empresa'),
        T('filial'),
        T('departamento'),
        T('module'),
        T('responsible'),
        T('behavior_model'),
        J('knowledge_base'),
        J('allowed_tools'),
        J('permissions'),
        T('working_hours'),
        S('status', ['Em Configuração', 'Em Teste', 'Ativo', 'Pausado', 'Com Erro', 'Inativo']),
        T('agent_type'),
        J('identity'),
        J('objectives'),
        J('integrations'),
      ],
      stdRules,
      [],
    )

    mk(
      'ai_automations',
      [
        T('name'),
        T('description'),
        T('start_event'),
        J('conditions'),
        J('actions'),
        T('responsible'),
        T('empresa'),
        T('filial'),
        T('frequency'),
        T('schedule'),
        T('priority'),
        S('status', ['Rascunho', 'Em Teste', 'Ativa', 'Pausada', 'Com Erro', 'Inativa']),
        T('last_run'),
        N('run_count'),
      ],
      stdRules,
      [],
    )

    mk(
      'ai_smart_flows',
      [
        T('name'),
        T('description'),
        T('flow_type'),
        J('stages'),
        S('status', ['Rascunho', 'Em Teste', 'Ativo', 'Pausado', 'Arquivado']),
        N('version'),
        T('responsible'),
        T('empresa'),
        T('filial'),
        J('execution_history'),
      ],
      stdRules,
      [],
    )

    mk(
      'ai_knowledge_base',
      [
        T('title'),
        T('category'),
        T('description'),
        T('empresa'),
        T('filial'),
        T('departamento'),
        J('linked_agents'),
        T('content_type'),
        T('format'),
        T('content'),
        T('file_url'),
        T('responsible'),
        N('version'),
        T('expiry_date'),
        S('status', [
          'Aguardando Processamento',
          'Em Processamento',
          'Ativo',
          'Com Erro',
          'Desatualizado',
          'Inativo',
        ]),
        J('versions'),
      ],
      stdRules,
      [],
    )

    mk(
      'ai_interactions',
      [
        T('user_id'),
        T('user_name'),
        T('agent_id'),
        T('agent_name'),
        T('channel'),
        T('subject'),
        T('question'),
        T('response'),
        T('action_executed'),
        T('result'),
        S('evaluation', [
          'Correta',
          'Parcialmente Correta',
          'Incorreta',
          'Inadequada',
          'Precisa de Revisão',
          'Não Avaliada',
        ]),
        T('evaluation_comment'),
        S('status', [
          'Em Andamento',
          'Concluída',
          'Transferida para Humano',
          'Aguardando Aprovação',
          'Cancelada',
        ]),
        T('module'),
        T('empresa'),
        T('filial'),
        T('departamento'),
        T('ip_address'),
        J('data_consulted'),
        T('error'),
      ],
      publicCreateRules,
      [],
    )

    mk(
      'ai_approvals',
      [
        T('agent_id'),
        T('agent_name'),
        T('action_type'),
        T('proposed_action'),
        T('reason'),
        J('source_data'),
        J('current_values'),
        J('proposed_values'),
        T('impacts'),
        S('status', ['Aguardando', 'Aprovada', 'Reprovada', 'Ajuste Solicitado', 'Executada']),
        T('approver'),
        T('justification'),
        T('module'),
        T('empresa'),
        T('filial'),
      ],
      publicCreateRules,
      [],
    )

    mk(
      'ai_training_v2',
      [
        T('question'),
        T('expected_answer'),
        T('correct_example'),
        T('incorrect_example'),
        T('communication_tone'),
        J('allowed_terms'),
        J('forbidden_terms'),
        T('applicable_rule'),
        T('departamento'),
        T('agent_id'),
        S('status', [
          'Em Preparação',
          'Aguardando Aprovação',
          'Aprovado',
          'Aplicado',
          'Rejeitado',
          'Inativo',
        ]),
        T('responsible'),
        T('empresa'),
        T('filial'),
        J('tags'),
        T('category'),
      ],
      stdRules,
      [],
    )

    try {
      app.findFirstRecordByData('ai_module_settings', 'assistant_name', 'Assistente Virtual')
    } catch (_) {
      var settingsCol = app.findCollectionByNameOrId('ai_module_settings')
      var settingsRecord = new Record(settingsCol)
      settingsRecord.set('assistant_name', 'Assistente Virtual')
      settingsRecord.set('language', 'pt-BR')
      settingsRecord.set('communication_tone', 'Profissional e Amigável')
      settingsRecord.set('working_hours', 'Seg-Sex 08:00-18:00')
      settingsRecord.set('interaction_limit', 100)
      settingsRecord.set('response_time', 30)
      settingsRecord.set('transfer_time', 300)
      settingsRecord.set('autonomy_level', 'Consultar e Sugerir')
      settingsRecord.set('history_retention', 90)
      app.save(settingsRecord)
    }
  },
  (app) => {
    var collections = [
      'ai_training_v2',
      'ai_approvals',
      'ai_interactions',
      'ai_knowledge_base',
      'ai_smart_flows',
      'ai_automations',
      'ai_agents',
      'ai_module_settings',
    ]
    collections.forEach(function (name) {
      try {
        var col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    })
  },
)

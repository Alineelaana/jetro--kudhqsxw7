migrate(
  (app) => {
    const collections = [
      {
        name: 'ai_agents',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'objective', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'departamento', type: 'text' },
          { name: 'module', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'behavior_model', type: 'text' },
          { name: 'knowledge_base', type: 'json' },
          { name: 'allowed_tools', type: 'json' },
          { name: 'permissions', type: 'json' },
          { name: 'working_hours', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['Em Configuração', 'Em Teste', 'Ativo', 'Pausado', 'Com Erro', 'Inativo'],
            maxSelect: 1,
          },
          { name: 'agent_type', type: 'text' },
          { name: 'identity', type: 'json' },
          { name: 'objectives', type: 'json' },
          { name: 'integrations', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.role = 'SUP'",
        },
      },
      {
        name: 'ai_automations',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'start_event', type: 'text' },
          { name: 'conditions', type: 'json' },
          { name: 'actions', type: 'json' },
          { name: 'responsible', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'frequency', type: 'text' },
          { name: 'schedule', type: 'text' },
          { name: 'priority', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['Rascunho', 'Em Teste', 'Ativa', 'Pausada', 'Com Erro', 'Inativa'],
            maxSelect: 1,
          },
          { name: 'last_run', type: 'text' },
          { name: 'run_count', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.role = 'SUP'",
        },
      },
      {
        name: 'ai_smart_flows',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'flow_type', type: 'text' },
          { name: 'stages', type: 'json' },
          {
            name: 'status',
            type: 'select',
            values: ['Rascunho', 'Em Teste', 'Ativo', 'Pausado', 'Arquivado'],
            maxSelect: 1,
          },
          { name: 'version', type: 'number' },
          { name: 'responsible', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'execution_history', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.role = 'SUP'",
        },
      },
      {
        name: 'ai_knowledge_base',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'category', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'departamento', type: 'text' },
          { name: 'linked_agents', type: 'json' },
          { name: 'content_type', type: 'text' },
          { name: 'format', type: 'text' },
          { name: 'content', type: 'text' },
          { name: 'file_url', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'version', type: 'number' },
          { name: 'expiry_date', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: [
              'Aguardando Processamento',
              'Em Processamento',
              'Ativo',
              'Com Erro',
              'Desatualizado',
              'Inativo',
            ],
            maxSelect: 1,
          },
          { name: 'versions', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.role = 'SUP'",
        },
      },
      {
        name: 'ai_interactions',
        fields: [
          { name: 'user_id', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'agent_id', type: 'text' },
          { name: 'agent_name', type: 'text' },
          { name: 'channel', type: 'text' },
          { name: 'subject', type: 'text' },
          { name: 'question', type: 'text' },
          { name: 'response', type: 'text' },
          { name: 'action_executed', type: 'text' },
          { name: 'result', type: 'text' },
          {
            name: 'evaluation',
            type: 'select',
            values: [
              'Correta',
              'Parcialmente Correta',
              'Incorreta',
              'Inadequada',
              'Precisa de Revisão',
              'Não Avaliada',
            ],
            maxSelect: 1,
          },
          { name: 'evaluation_comment', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: [
              'Em Andamento',
              'Concluída',
              'Transferida para Humano',
              'Aguardando Aprovação',
              'Cancelada',
            ],
            maxSelect: 1,
          },
          { name: 'module', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'departamento', type: 'text' },
          { name: 'ip_address', type: 'text' },
          { name: 'data_consulted', type: 'json' },
          { name: 'error', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: '',
          updateRule: "@request.auth.id != ''",
          deleteRule: null,
        },
      },
      {
        name: 'ai_approvals',
        fields: [
          { name: 'agent_id', type: 'text' },
          { name: 'agent_name', type: 'text' },
          { name: 'action_type', type: 'text' },
          { name: 'proposed_action', type: 'text' },
          { name: 'reason', type: 'text' },
          { name: 'source_data', type: 'json' },
          { name: 'current_values', type: 'json' },
          { name: 'proposed_values', type: 'json' },
          { name: 'impacts', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['Aguardando', 'Aprovada', 'Reprovada', 'Ajuste Solicitado', 'Executada'],
            maxSelect: 1,
          },
          { name: 'approver', type: 'text' },
          { name: 'justification', type: 'text' },
          { name: 'module', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: '',
          updateRule: "@request.auth.id != ''",
          deleteRule: null,
        },
      },
      {
        name: 'ai_module_settings',
        fields: [
          { name: 'assistant_name', type: 'text' },
          { name: 'language', type: 'text' },
          { name: 'communication_tone', type: 'text' },
          { name: 'working_hours', type: 'text' },
          { name: 'interaction_limit', type: 'number' },
          { name: 'response_time', type: 'number' },
          { name: 'transfer_time', type: 'number' },
          {
            name: 'autonomy_level',
            type: 'select',
            values: [
              'Somente Consultar',
              'Consultar e Sugerir',
              'Preparar Ações',
              'Executar com Confirmação',
              'Executar Ações Autorizadas',
            ],
            maxSelect: 1,
          },
          { name: 'actions_requiring_confirmation', type: 'json' },
          { name: 'actions_requiring_approval', type: 'json' },
          { name: 'history_retention', type: 'number' },
          { name: 'allowed_channels', type: 'json' },
          { name: 'empresas', type: 'json' },
          { name: 'perfis_acesso', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.role = 'SUP'",
          updateRule: "@request.auth.role = 'SUP'",
          deleteRule: "@request.auth.role = 'SUP'",
        },
      },
      {
        name: 'ai_training_v2',
        fields: [
          { name: 'question', type: 'text', required: true },
          { name: 'expected_answer', type: 'text' },
          { name: 'correct_example', type: 'text' },
          { name: 'incorrect_example', type: 'text' },
          { name: 'communication_tone', type: 'text' },
          { name: 'allowed_terms', type: 'json' },
          { name: 'forbidden_terms', type: 'json' },
          { name: 'applicable_rule', type: 'text' },
          { name: 'departamento', type: 'text' },
          { name: 'agent_id', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: [
              'Em Preparação',
              'Aguardando Aprovação',
              'Aprovado',
              'Aplicado',
              'Rejeitado',
              'Inativo',
            ],
            maxSelect: 1,
          },
          { name: 'source', type: 'text' },
          { name: 'approver', type: 'text' },
          { name: 'rejection_reason', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.role = 'SUP'",
        },
      },
      {
        name: 'ai_error_monitor',
        fields: [
          { name: 'error_type', type: 'text' },
          { name: 'agent_id', type: 'text' },
          { name: 'agent_name', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'module', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['Aberto', 'Em Análise', 'Resolvido', 'Ignorado'],
            maxSelect: 1,
          },
          { name: 'solution', type: 'text' },
          { name: 'resolved_by', type: 'text' },
          { name: 'resolved_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        rules: {
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: '',
          updateRule: "@request.auth.id != ''",
          deleteRule: null,
        },
      },
    ]

    for (const colDef of collections) {
      try {
        const col = new Collection({
          name: colDef.name,
          type: 'base',
          listRule: colDef.rules.listRule,
          viewRule: colDef.rules.viewRule,
          createRule: colDef.rules.createRule,
          updateRule: colDef.rules.updateRule,
          deleteRule: colDef.rules.deleteRule,
          fields: colDef.fields,
        })
        app.save(col)
      } catch (err) {
        console.log('Failed to create collection ' + colDef.name + ': ' + String(err))
      }
    }

    try {
      const settingsCol = app.findCollectionByNameOrId('ai_module_settings')
      if (settingsCol) {
        const existing = app.findRecordsByFilter('ai_module_settings', "id != ''", '', 1, 0)
        if (!existing || existing.length === 0) {
          const rec = new Record(settingsCol)
          rec.set('assistant_name', 'Srta. Velora')
          rec.set('language', 'Português')
          rec.set('communication_tone', 'Profissional e amigável')
          rec.set('working_hours', '24/7')
          rec.set('interaction_limit', 1000)
          rec.set('response_time', 5)
          rec.set('transfer_time', 30)
          rec.set('autonomy_level', 'Consultar e Sugerir')
          rec.set('actions_requiring_confirmation', [])
          rec.set('actions_requiring_approval', [])
          rec.set('history_retention', 365)
          rec.set('allowed_channels', ['chat', 'whatsapp'])
          rec.set('empresas', [])
          rec.set('perfis_acesso', ['SUP'])
          app.save(rec)
        }
      }
    } catch (_) {}

    try {
      const agentsCol = app.findCollectionByNameOrId('ai_agents')
      if (agentsCol) {
        const seedAgents = [
          {
            name: 'Assistente Geral',
            description: 'Assistente principal para consultas gerais',
            objective: 'Atender consultas e direcionar para módulos',
            agent_type: 'Atendimento ao Cliente',
            status: 'Ativo',
            module: 'Geral',
          },
          {
            name: 'Agente Financeiro',
            description: 'Consultas sobre contas e fluxo de caixa',
            objective: 'Auxiliar no módulo financeiro',
            agent_type: 'Financeiro',
            status: 'Em Configuração',
            module: 'financeiro',
          },
          {
            name: 'Agente de Vendas',
            description: 'Suporte a pedidos e clientes',
            objective: 'Apoiar a equipe comercial',
            agent_type: 'Vendas',
            status: 'Pausado',
            module: 'vendas',
          },
        ]
        for (const s of seedAgents) {
          try {
            app.findFirstRecordByData('ai_agents', 'name', s.name)
          } catch (_) {
            const rec = new Record(agentsCol)
            rec.set('name', s.name)
            rec.set('description', s.description)
            rec.set('objective', s.objective)
            rec.set('agent_type', s.agent_type)
            rec.set('status', s.status)
            rec.set('module', s.module)
            rec.set('knowledge_base', [])
            rec.set('allowed_tools', [])
            rec.set('permissions', {})
            rec.set('identity', {})
            rec.set('objectives', {})
            rec.set('integrations', {})
            app.save(rec)
          }
        }
      }
    } catch (_) {}
  },
  (app) => {
    const names = [
      'ai_agents',
      'ai_automations',
      'ai_smart_flows',
      'ai_knowledge_base',
      'ai_interactions',
      'ai_approvals',
      'ai_module_settings',
      'ai_training_v2',
      'ai_error_monitor',
    ]
    for (const n of names) {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (_) {}
    }
  },
)

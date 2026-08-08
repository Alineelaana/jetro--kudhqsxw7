migrate(
  (app) => {
    function J(o) {
      return JSON.stringify(o)
    }

    var defaultRecipients = {
      primary: 'responsible',
      secondary: 'gestor',
      escalation: {
        Informativo: ['responsible'],
        Atenção: ['responsible', 'gestor'],
        Urgente: ['responsible', 'gestor'],
        Crítico: ['responsible', 'gestor', 'diretoria'],
        Vencido: ['responsible', 'gestor', 'diretoria'],
      },
    }

    var defaultEscalation = {
      enabled: true,
      levels: ['responsible', 'gestor', 'diretoria'],
      trigger_at_criticidade: 'Urgente',
    }

    var rules = [
      {
        name: 'Vencimento de Contas a Receber',
        module: 'financeiro',
        entity_type: 'financial_receivables',
        entity_label: 'Contas a Receber',
        validity_field: 'data_vencimento',
        antecedent_days: [30, 15, 7, 3, 0],
        criticidade_mapping: {
          30: 'Informativo',
          15: 'Atenção',
          7: 'Urgente',
          3: 'Urgente',
          0: 'Crítico',
        },
      },
      {
        name: 'Vencimento de Contas a Pagar',
        module: 'financeiro',
        entity_type: 'financial_payables',
        entity_label: 'Contas a Pagar',
        validity_field: 'data_vencimento',
        antecedent_days: [30, 15, 7, 3, 0],
        criticidade_mapping: {
          30: 'Informativo',
          15: 'Atenção',
          7: 'Urgente',
          3: 'Urgente',
          0: 'Crítico',
        },
      },
      {
        name: 'Vencimento de Boletos',
        module: 'financeiro',
        entity_type: 'financial_boletos',
        entity_label: 'Boletos Bancários',
        validity_field: 'data_vencimento',
        antecedent_days: [15, 7, 3, 0],
        criticidade_mapping: { 15: 'Atenção', 7: 'Urgente', 3: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Vencimento de PIX',
        module: 'financeiro',
        entity_type: 'financial_pix',
        entity_label: 'PIX',
        validity_field: 'data_vencimento',
        antecedent_days: [7, 3, 0],
        criticidade_mapping: { 7: 'Atenção', 3: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Vencimento de Cheques',
        module: 'financeiro',
        entity_type: 'financial_checks',
        entity_label: 'Cheques',
        validity_field: 'data_vencimento',
        antecedent_days: [15, 7, 3, 0],
        criticidade_mapping: { 15: 'Atenção', 7: 'Urgente', 3: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Previsão de Repasse de Cartão',
        module: 'financeiro',
        entity_type: 'financial_card_transactions',
        entity_label: 'Transações de Cartão — Repasse',
        validity_field: 'data_prevista_repasse',
        antecedent_days: [7, 3, 0],
        criticidade_mapping: { 7: 'Atenção', 3: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de Endereçamento WMS',
        module: 'estoque',
        entity_type: 'wms_putaway_tasks',
        entity_label: 'Tarefas de Endereçamento — Validade',
        validity_field: 'validade',
        antecedent_days: [30, 15, 7, 0],
        criticidade_mapping: { 30: 'Atenção', 15: 'Urgente', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Vencimento do Período Concessivo de Férias',
        module: 'rh',
        entity_type: 'rh_vacations',
        entity_label: 'Período Concessivo de Férias',
        validity_field: 'periodo_concessivo_fim',
        antecedent_days: [60, 30, 15, 7, 0],
        criticidade_mapping: {
          60: 'Informativo',
          30: 'Atenção',
          15: 'Urgente',
          7: 'Urgente',
          0: 'Crítico',
        },
      },
      {
        name: 'Validade de Contratos de Experiência (DP)',
        module: 'rh',
        entity_type: 'dp_work_contracts',
        entity_label: 'Contratos de Trabalho — Fim de Experiência',
        validity_field: 'data_fim',
        antecedent_days: [30, 15, 7, 0],
        criticidade_mapping: { 30: 'Atenção', 15: 'Urgente', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de Exames Ocupacionais (DP)',
        module: 'sst',
        entity_type: 'dp_occupational_exams',
        entity_label: 'Exames Ocupacionais — ASO',
        validity_field: 'data_validade',
        antecedent_days: [60, 30, 7, 0],
        criticidade_mapping: { 60: 'Informativo', 30: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de Documentos Obrigatórios (DP)',
        module: 'rh',
        entity_type: 'dp_mandatory_docs',
        entity_label: 'Documentos Obrigatórios DP',
        validity_field: 'data_validade',
        antecedent_days: [30, 15, 7, 0],
        criticidade_mapping: { 30: 'Atenção', 15: 'Urgente', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Término de Afastamentos (DP)',
        module: 'rh',
        entity_type: 'dp_leaves',
        entity_label: 'Afastamentos — Data de Fim',
        validity_field: 'data_fim',
        antecedent_days: [15, 7, 3, 0],
        criticidade_mapping: { 15: 'Atenção', 7: 'Urgente', 3: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de PCMSO (SST)',
        module: 'sst',
        entity_type: 'sst_pcmso',
        entity_label: 'PCMSO — Programa de Saúde Ocupacional',
        validity_field: 'data_validade',
        antecedent_days: [90, 60, 30, 7, 0],
        criticidade_mapping: {
          90: 'Informativo',
          60: 'Atenção',
          30: 'Atenção',
          7: 'Urgente',
          0: 'Crítico',
        },
      },
      {
        name: 'Validade de Vacinação (SST)',
        module: 'sst',
        entity_type: 'sst_vaccination',
        entity_label: 'Cartões de Vacinação',
        validity_field: 'data_validade',
        antecedent_days: [60, 30, 7, 0],
        criticidade_mapping: { 60: 'Informativo', 30: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Revisão de Documentos SST',
        module: 'sst',
        entity_type: 'sst_documents',
        entity_label: 'Documentos SST — Revisão',
        validity_field: 'data_revisao',
        antecedent_days: [90, 60, 30, 7, 0],
        criticidade_mapping: {
          90: 'Informativo',
          60: 'Atenção',
          30: 'Atenção',
          7: 'Urgente',
          0: 'Crítico',
        },
      },
      {
        name: 'Validade de Permissões de Trabalho (SST)',
        module: 'sst',
        entity_type: 'sst_work_permits',
        entity_label: 'Permissões de Trabalho',
        validity_field: 'data_fim',
        antecedent_days: [15, 7, 3, 0],
        criticidade_mapping: { 15: 'Atenção', 7: 'Urgente', 3: 'Urgente', 0: 'Crítico' },
      },
    ]

    var col = app.findCollectionByNameOrId('validity_rules')
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i]
      try {
        app.findFirstRecordByData('validity_rules', 'name', r.name)
      } catch (_) {
        var rec = new Record(col)
        rec.set('name', r.name)
        rec.set('module', r.module)
        rec.set('entity_type', r.entity_type)
        rec.set('entity_label', r.entity_label)
        rec.set('validity_field', r.validity_field)
        rec.set('antecedent_days', J(r.antecedent_days))
        rec.set('criticidade_mapping', J(r.criticidade_mapping))
        rec.set('recipients', J(defaultRecipients))
        rec.set('escalation_config', J(defaultEscalation))
        rec.set('recurrence_days', 7)
        rec.set('channels', J(['in_app', 'email']))
        rec.set('active', true)
        app.save(rec)
      }
    }
  },
  (app) => {
    var ruleNames = [
      'Vencimento de Contas a Receber',
      'Vencimento de Contas a Pagar',
      'Vencimento de Boletos',
      'Vencimento de PIX',
      'Vencimento de Cheques',
      'Previsão de Repasse de Cartão',
      'Validade de Endereçamento WMS',
      'Vencimento do Período Concessivo de Férias',
      'Validade de Contratos de Experiência (DP)',
      'Validade de Exames Ocupacionais (DP)',
      'Validade de Documentos Obrigatórios (DP)',
      'Término de Afastamentos (DP)',
      'Validade de PCMSO (SST)',
      'Validade de Vacinação (SST)',
      'Revisão de Documentos SST',
      'Validade de Permissões de Trabalho (SST)',
    ]
    for (var i = 0; i < ruleNames.length; i++) {
      try {
        var rec = app.findFirstRecordByData('validity_rules', 'name', ruleNames[i])
        app.delete(rec)
      } catch (_) {}
    }
  },
)

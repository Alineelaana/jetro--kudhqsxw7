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
        name: 'Validade de Produtos',
        module: 'estoque',
        entity_type: 'products',
        entity_label: 'Produtos',
        validity_field: 'validity',
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
        name: 'Validade de Lotes (Estoque)',
        module: 'estoque',
        entity_type: 'stock_batches',
        entity_label: 'Lotes de Estoque',
        validity_field: 'data_validade',
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
        name: 'Validade CNH (RH)',
        module: 'rh',
        entity_type: 'rh_documents',
        entity_label: 'Documentos RH — CNH',
        validity_field: 'validade',
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
        name: 'Validade ASO (RH/SST)',
        module: 'sst',
        entity_type: 'sst_aso',
        entity_label: 'ASO — Atendimento de Saúde Ocupacional',
        validity_field: 'validade',
        antecedent_days: [60, 30, 7, 0],
        criticidade_mapping: { 60: 'Informativo', 30: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de Treinamentos (RH)',
        module: 'rh',
        entity_type: 'rh_trainings',
        entity_label: 'Treinamentos RH',
        validity_field: 'validade',
        antecedent_days: [30, 7, 0],
        criticidade_mapping: { 30: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de Certificados SST',
        module: 'sst',
        entity_type: 'sst_certificates',
        entity_label: 'Certificados SST',
        validity_field: 'validade',
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
        name: 'Validade CNH Motoristas (Logística)',
        module: 'logistica',
        entity_type: 'logistics_drivers',
        entity_label: 'CNH de Motoristas',
        validity_field: 'validade_cnh',
        antecedent_days: [60, 30, 7, 0],
        criticidade_mapping: { 60: 'Informativo', 30: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Vencimento Licenciamento de Veículos',
        module: 'logistica',
        entity_type: 'logistics_vehicles',
        entity_label: 'Licenciamento de Veículos',
        validity_field: 'vencimento_licenciamento',
        antecedent_days: [60, 30, 7, 0],
        criticidade_mapping: { 60: 'Informativo', 30: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Vencimento de Seguro de Veículos',
        module: 'logistica',
        entity_type: 'logistics_vehicles',
        entity_label: 'Seguro de Veículos',
        validity_field: 'vencimento_seguro',
        antecedent_days: [60, 30, 7, 0],
        criticidade_mapping: { 60: 'Informativo', 30: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade CORE (Parceiros)',
        module: 'comercial',
        entity_type: 'partners',
        entity_label: 'Documentos de Parceiros — CORE',
        validity_field: 'document_validity',
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
        name: 'Validade de Documentos Corporativos',
        module: 'administrativo',
        entity_type: 'corporate_documents',
        entity_label: 'Documentos Corporativos (Alvarás, Licenças)',
        validity_field: 'validade',
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
        name: 'Vencimento de Tabelas de Preços',
        module: 'comercial',
        entity_type: 'price_tables',
        entity_label: 'Tabelas de Preços',
        validity_field: 'data_final',
        antecedent_days: [30, 15, 7, 0],
        criticidade_mapping: { 30: 'Informativo', 15: 'Atenção', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de Pallets WMS',
        module: 'estoque',
        entity_type: 'wms_pallets',
        entity_label: 'Pallets WMS',
        validity_field: 'validade',
        antecedent_days: [30, 15, 7, 0],
        criticidade_mapping: { 30: 'Atenção', 15: 'Urgente', 7: 'Urgente', 0: 'Crítico' },
      },
      {
        name: 'Validade de Volumes WMS',
        module: 'estoque',
        entity_type: 'wms_volumes',
        entity_label: 'Volumes WMS',
        validity_field: 'validade',
        antecedent_days: [30, 15, 7, 0],
        criticidade_mapping: { 30: 'Atenção', 15: 'Urgente', 7: 'Urgente', 0: 'Crítico' },
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

    var corpDocs = [
      {
        tipo: 'Alvará de Funcionamento',
        titular: 'VeloraLog',
        orgao_emissor: 'Prefeitura de Vitória',
        status: 'Ativo',
        empresa: 'VeloraLog',
      },
      {
        tipo: 'Licença Sanitária',
        titular: 'VeloraLog',
        orgao_emissor: 'Vigilância Sanitária',
        status: 'Ativo',
        empresa: 'VeloraLog',
      },
      {
        tipo: 'AVCB — Bombeiros',
        titular: 'VeloraLog',
        orgao_emissor: 'Corpo de Bombeiros',
        status: 'Ativo',
        empresa: 'VeloraLog',
      },
    ]
    var corpCol = app.findCollectionByNameOrId('corporate_documents')
    for (var c = 0; c < corpDocs.length; c++) {
      try {
        app.findFirstRecordByData('corporate_documents', 'tipo', corpDocs[c].tipo)
      } catch (_) {
        var cd = new Record(corpCol)
        cd.set('tipo', corpDocs[c].tipo)
        cd.set('titular', corpDocs[c].titular)
        cd.set('orgao_emissor', corpDocs[c].orgao_emissor)
        cd.set('status', corpDocs[c].status)
        cd.set('empresa', corpDocs[c].empresa)
        app.save(cd)
      }
    }
  },
  (app) => {
    var cols = ['corporate_documents', 'validity_rules']
    for (var i = 0; i < cols.length; i++) {
      try {
        var records = app.findRecordsByFilter(cols[i], '1=1', '', 500, 0)
        for (var j = 0; j < records.length; j++) {
          app.delete(records[j])
        }
      } catch (e) {}
    }
  },
)

migrate(
  (app) => {
    // 0302_create_cte_mdfe_module.js - Módulo Fiscal CT-e (mod 57) e MDF-e (mod 58) aditivo HURAM
    var ruleMultitenant =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa_id = @request.auth.empresa_id || (empresa_id = '' && @request.auth.empresa_id = ''))"
    var ruleMultitenantWrite =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa_id = @request.auth.empresa_id || empresa_id = '')"
    var SA = "@request.auth.role = 'SUP'"

    // Coleções existentes opcionais para relação
    var partnersCol = app.findCollectionByNameOrId('partners')
    var partnersId = partnersCol ? partnersCol.id : ''

    // 1. CONFIGURAÇÃO CT-E (cte_configs)
    app.save(
      new Collection({
        name: 'cte_configs',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'filial_id', type: 'text' },
          { name: 'serie', type: 'text', required: true },
          { name: 'ultimo_sequencial', type: 'number', required: true },
          {
            name: 'ambiente',
            type: 'select',
            values: ['homologacao', 'producao'],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'regime_tributario',
            type: 'select',
            values: ['simples_nacional', 'lucro_presumido', 'lucro_real'],
            maxSelect: 1,
          },
          { name: 'rntrc', type: 'text' },
          { name: 'tipo_servico_padrao', type: 'text' }, // 0-Normal, 1-Subcontratacao, 2-Redespacho, 3-Redespacho Intermediario
          { name: 'cfop_padrao_estadual', type: 'text' },
          { name: 'cfop_padrao_interestadual', type: 'text' },
          { name: 'cst_padrao', type: 'text' },
          { name: 'aliquota_icms_padrao', type: 'number' },
          { name: 'observacoes_fisco_padrao', type: 'text' },
          { name: 'observacoes_contribuinte_padrao', type: 'text' },
          { name: 'ativo', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_cte_cfg_empresa ON cte_configs (empresa_id)',
          'CREATE INDEX idx_cte_cfg_serie ON cte_configs (serie)',
        ],
      }),
    )

    // 2. DOCUMENTOS CT-E (cte_documents)
    app.save(
      new Collection({
        name: 'cte_documents',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'filial_id', type: 'text' },
          { name: 'numero', type: 'text', required: true },
          { name: 'serie', type: 'text', required: true },
          { name: 'chave_acesso', type: 'text' },
          {
            name: 'tipo_cte',
            type: 'select',
            values: ['normal', 'complementar', 'anulacao', 'substituto'],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'tipo_servico',
            type: 'select',
            values: ['normal', 'subcontratacao', 'redespacho', 'redespacho_intermediario'],
            maxSelect: 1,
          },
          { name: 'modal', type: 'text' }, // rodoviario
          {
            name: 'tomador_tipo',
            type: 'select',
            values: ['remetente', 'expedidor', 'recebedor', 'destinatario', 'outro'],
            maxSelect: 1,
            required: true,
          },
          { name: 'tomador_id', type: 'text' },
          { name: 'tomador_nome', type: 'text' },
          { name: 'tomador_documento', type: 'text' },
          // Partes do transporte (partners)
          { name: 'remetente_id', type: 'text' },
          { name: 'remetente_nome', type: 'text' },
          { name: 'remetente_cnpj_cpf', type: 'text' },
          { name: 'remetente_ie', type: 'text' },
          { name: 'remetente_uf', type: 'text' },
          { name: 'remetente_municipio', type: 'text' },
          { name: 'destinatario_id', type: 'text' },
          { name: 'destinatario_nome', type: 'text' },
          { name: 'destinatario_cnpj_cpf', type: 'text' },
          { name: 'destinatario_ie', type: 'text' },
          { name: 'destinatario_uf', type: 'text' },
          { name: 'destinatario_municipio', type: 'text' },
          { name: 'expedidor_id', type: 'text' },
          { name: 'expedidor_nome', type: 'text' },
          { name: 'recebedor_id', type: 'text' },
          { name: 'recebedor_nome', type: 'text' },
          // Municípios de início e término da prestação
          { name: 'uf_inicio', type: 'text', required: true },
          { name: 'municipio_inicio', type: 'text', required: true },
          { name: 'uf_fim', type: 'text', required: true },
          { name: 'municipio_fim', type: 'text', required: true },
          // Valores da prestação
          { name: 'valor_total_prestacao', type: 'number', required: true },
          { name: 'valor_receber', type: 'number', required: true },
          // Componentes da prestação (guardados em json de forma autônoma para garantir leitura rápida)
          { name: 'componentes_prestacao', type: 'json' },
          // Carga e documentos vinculados
          { name: 'valor_total_carga', type: 'number' },
          { name: 'produto_predominante', type: 'text' },
          { name: 'peso_bruto_kg', type: 'number' },
          { name: 'quantidade_volumes', type: 'number' },
          { name: 'documentos_vinculados', type: 'json' }, // lista de chaves de nfe, números, valores e pesos
          // Impostos
          { name: 'cfop', type: 'text', required: true },
          { name: 'cst_csosn', type: 'text', required: true },
          { name: 'base_calculo_icms', type: 'number' },
          { name: 'aliquota_icms', type: 'number' },
          { name: 'valor_icms', type: 'number' },
          { name: 'percentual_reducao_bc', type: 'number' },
          { name: 'icms_outra_uf', type: 'number' },
          // Dados de homologação e emissão
          {
            name: 'ambiente',
            type: 'select',
            values: ['homologacao', 'producao'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: [
              'rascunho',
              'validado',
              'autorizado_homologacao',
              'autorizado_producao',
              'cancelado',
              'inutilizado',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'protocolo_autorizacao', type: 'text' },
          { name: 'data_autorizacao', type: 'text' },
          { name: 'motivo_cancelamento', type: 'text' },
          { name: 'data_cancelamento', type: 'text' },
          { name: 'justificativa_homologacao', type: 'text' },
          { name: 'xml_gerado', type: 'text' },
          { name: 'observacoes_fisco', type: 'text' },
          { name: 'observacoes_contribuinte', type: 'text' },
          { name: 'created_by_user_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_cte_doc_emp_serie_num ON cte_documents (empresa_id, serie, numero)',
          'CREATE INDEX idx_cte_doc_chave ON cte_documents (chave_acesso)',
          'CREATE INDEX idx_cte_doc_status ON cte_documents (status)',
          'CREATE INDEX idx_cte_doc_tomador ON cte_documents (tomador_id)',
          'CREATE INDEX idx_cte_doc_created ON cte_documents (created)',
        ],
      }),
    )

    // 3. CONFIGURAÇÃO MDF-E (mdfe_configs)
    app.save(
      new Collection({
        name: 'mdfe_configs',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'filial_id', type: 'text' },
          { name: 'serie', type: 'text', required: true },
          { name: 'ultimo_sequencial', type: 'number', required: true },
          {
            name: 'ambiente',
            type: 'select',
            values: ['homologacao', 'producao'],
            maxSelect: 1,
            required: true,
          },
          { name: 'rntrc_padrao', type: 'text' },
          { name: 'tipo_emitente', type: 'text' }, // 1-Prestador de servico de transporte, 2-Transportador de carga propria
          { name: 'tipo_transportador', type: 'text' }, // 1-ETC, 2-TAC, 3-CTC
          { name: 'ativo', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_mdfe_cfg_empresa ON mdfe_configs (empresa_id)',
          'CREATE INDEX idx_mdfe_cfg_serie ON mdfe_configs (serie)',
        ],
      }),
    )

    // 4. DOCUMENTOS MDF-E (mdfe_documents)
    app.save(
      new Collection({
        name: 'mdfe_documents',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'filial_id', type: 'text' },
          { name: 'numero', type: 'text', required: true },
          { name: 'serie', type: 'text', required: true },
          { name: 'chave_acesso', type: 'text' },
          { name: 'modal', type: 'text' }, // rodoviario
          { name: 'tipo_emitente', type: 'text' }, // 1-Prestador, 2-Carga Propria
          { name: 'tipo_transportador', type: 'text' }, // 1-ETC, 2-TAC, 3-CTC
          // Carregamento e Descarregamento
          { name: 'uf_carregamento', type: 'text', required: true },
          { name: 'municipio_carregamento', type: 'text', required: true },
          { name: 'uf_descarregamento', type: 'text', required: true },
          { name: 'municipio_descarregamento', type: 'text', required: true },
          // Veículo de tração e condutores
          { name: 'placa_veiculo', type: 'text', required: true },
          { name: 'uf_veiculo', type: 'text' },
          { name: 'rntrc', type: 'text', required: true },
          { name: 'condutores', type: 'json' }, // [{ nome, cpf }]
          { name: 'reboques', type: 'json' }, // [{ placa, uf, tipo_carroceria, capacidade_kg }]
          { name: 'vale_pedagio', type: 'json' }, // [{ empresa_fornecedora, cnpj_fornecedora, numero_comprovante, valor }]
          // Totais da Carga
          { name: 'valor_total_carga', type: 'number', required: true },
          { name: 'peso_bruto_total_kg', type: 'number', required: true },
          { name: 'quantidade_cte', type: 'number', required: true },
          { name: 'quantidade_nfe', type: 'number' },
          { name: 'unidade_medida_peso', type: 'text' }, // 01-KG, 02-TON
          // Vínculo MDF-e -> CT-e
          { name: 'cte_vinculados', type: 'json' }, // [{ cte_id, chave_acesso, numero, uf_descarregamento, municipio_descarregamento, valor_carga, peso_bruto }]
          // Status e ciclo de vida
          {
            name: 'ambiente',
            type: 'select',
            values: ['homologacao', 'producao'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: [
              'rascunho',
              'validado',
              'autorizado_homologacao',
              'autorizado_producao',
              'em_transito',
              'encerrado',
              'cancelado',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'protocolo_autorizacao', type: 'text' },
          { name: 'data_autorizacao', type: 'text' },
          // Encerramento
          { name: 'data_encerramento', type: 'text' },
          { name: 'uf_encerramento', type: 'text' },
          { name: 'municipio_encerramento', type: 'text' },
          { name: 'protocolo_encerramento', type: 'text' },
          // Cancelamento
          { name: 'motivo_cancelamento', type: 'text' },
          { name: 'data_cancelamento', type: 'text' },
          { name: 'justificativa_homologacao', type: 'text' },
          { name: 'xml_gerado', type: 'text' },
          { name: 'observacoes', type: 'text' },
          { name: 'created_by_user_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_mdfe_doc_emp_serie_num ON mdfe_documents (empresa_id, serie, numero)',
          'CREATE INDEX idx_mdfe_doc_chave ON mdfe_documents (chave_acesso)',
          'CREATE INDEX idx_mdfe_doc_status ON mdfe_documents (status)',
          'CREATE INDEX idx_mdfe_doc_created ON mdfe_documents (created)',
        ],
      }),
    )
  },
  (app) => {
    try {
      var m = app.findCollectionByNameOrId('mdfe_documents')
      if (m) app.delete(m)
    } catch (_) {}
    try {
      var mc = app.findCollectionByNameOrId('mdfe_configs')
      if (mc) app.delete(mc)
    } catch (_) {}
    try {
      var c = app.findCollectionByNameOrId('cte_documents')
      if (c) app.delete(c)
    } catch (_) {}
    try {
      var cc = app.findCollectionByNameOrId('cte_configs')
      if (cc) app.delete(cc)
    } catch (_) {}
  },
)

migrate(
  (app) => {
    // 1. Criar collection solicitacoes_clientes (Pré-cadastro do vendedor / RCA)
    let solicitacoes
    try {
      solicitacoes = app.findCollectionByNameOrId('solicitacoes_clientes')
    } catch (_) {
      solicitacoes = new Collection({
        name: 'solicitacoes_clientes',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'numero', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: [
              'rascunho',
              'aguardando_validacao',
              'em_correcao',
              'em_analise',
              'concluido',
              'rejeitado',
              'cancelado',
            ],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'tipo_pessoa',
            type: 'select',
            values: ['PF', 'PJ'],
            maxSelect: 1,
            required: true,
          },
          { name: 'cpf_cnpj', type: 'text' },
          { name: 'razao_social', type: 'text' },
          { name: 'nome_fantasia', type: 'text' },
          { name: 'inscricao_estadual', type: 'text' },
          {
            name: 'situacao_ie',
            type: 'select',
            values: ['contribuinte', 'isento', 'nao_contribuinte'],
            maxSelect: 1,
          },
          { name: 'cnae', type: 'text' },
          { name: 'data_fundacao', type: 'text' },
          { name: 'situacao_cadastral', type: 'text' },
          { name: 'origem_consulta', type: 'text' },
          { name: 'data_consulta', type: 'text' },
          { name: 'cep', type: 'text' },
          { name: 'uf', type: 'text' },
          { name: 'municipio', type: 'text' },
          { name: 'bairro', type: 'text' },
          { name: 'logradouro', type: 'text' },
          { name: 'numero_end', type: 'text' },
          { name: 'complemento', type: 'text' },
          { name: 'ponto_referencia', type: 'text' },
          { name: 'endereco_entrega_diferente', type: 'bool' },
          { name: 'endereco_entrega', type: 'json' },
          { name: 'telefone', type: 'text' },
          { name: 'telefone_adicional', type: 'text' },
          { name: 'whatsapp', type: 'text' },
          { name: 'responsavel_estabelecimento', type: 'text' },
          { name: 'email', type: 'text' },
          { name: 'email_xml', type: 'text' },
          { name: 'contato_comercial', type: 'text' },
          { name: 'socios', type: 'json' },
          { name: 'referencias_comerciais', type: 'json' },
          { name: 'observacoes_vendedor', type: 'text' },
          { name: 'motivo_solicitacao', type: 'text' },
          { name: 'pendencias_correcao', type: 'text' },
          { name: 'rca_id', type: 'text' },
          { name: 'rca_nome', type: 'text' },
          { name: 'rca_codigo', type: 'text' },
          { name: 'gerente_id', type: 'text' },
          { name: 'gerente_nome', type: 'text' },
          { name: 'gerente_codigo', type: 'text' },
          { name: 'solicitante_id', type: 'text' },
          { name: 'solicitante_nome', type: 'text' },
          { name: 'cliente_gerado_id', type: 'text' },
          { name: 'cliente_gerado_codigo', type: 'text' },
          { name: 'data_solicitacao', type: 'text' },
          { name: 'data_conclusao', type: 'text' },
          { name: 'historico', type: 'json' },
          { name: 'limite_pretendido', type: 'text' },
          { name: 'condicao_pagamento_solicitada', type: 'text' },
          { name: 'anexos', type: 'file', maxSelect: 10, maxSize: 10485760 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_solic_status ON solicitacoes_clientes (status)',
          'CREATE INDEX idx_solic_cpf_cnpj ON solicitacoes_clientes (cpf_cnpj)',
          'CREATE INDEX idx_solic_rca ON solicitacoes_clientes (rca_id)',
          'CREATE INDEX idx_solic_numero ON solicitacoes_clientes (numero)',
        ],
      })
      app.save(solicitacoes)
    }

    // 2. Extensão na collection partners (cadastro oficial de clientes e parceiros)
    const partners = app.findCollectionByNameOrId('partners')

    const partnerFields = [
      { name: 'codigo_oficial', type: 'text' },
      { name: 'situacao_credito', type: 'text' },
      { name: 'limite_credito', type: 'text' },
      { name: 'limite_credito_disponivel', type: 'text' },
      { name: 'bloqueio_vendas_prazo', type: 'bool' },
      { name: 'motivo_bloqueio', type: 'text' },
      { name: 'data_bloqueio', type: 'text' },
      { name: 'gerente_comercial_id', type: 'text' },
      { name: 'gerente_comercial_nome', type: 'text' },
      { name: 'rca_nome', type: 'text' },
      { name: 'rca_codigo', type: 'text' },
      { name: 'perfil_cliente', type: 'text' },
      { name: 'canal_comercial', type: 'text' },
      { name: 'segmento', type: 'text' },
      { name: 'tipo_loja', type: 'text' },
      { name: 'potencial_compra', type: 'text' },
      { name: 'frequencia_prevista', type: 'text' },
      { name: 'rota_id', type: 'text' },
      { name: 'rota_nome', type: 'text' },
      { name: 'rota_codigo', type: 'text' },
      { name: 'tabela_preco_id', type: 'text' },
      { name: 'tabela_preco_nome', type: 'text' },
      { name: 'tabelas_adicionais', type: 'json' },
      { name: 'desconto_maximo', type: 'text' },
      { name: 'pedido_minimo', type: 'text' },
      { name: 'forma_atendimento', type: 'text' },
      { name: 'regime_tributario', type: 'text' },
      { name: 'simples_nacional', type: 'bool' },
      { name: 'classificacao_icms', type: 'text' },
      { name: 'consumidor_final', type: 'bool' },
      { name: 'contribuinte_icms', type: 'bool' },
      { name: 'produtor_rural', type: 'bool' },
      { name: 'email_xml', type: 'text' },
      { name: 'contatos_adicionais', type: 'json' },
      { name: 'locais_entrega', type: 'json' },
      { name: 'observacoes_comerciais', type: 'text' },
      { name: 'observacoes_logisticas', type: 'text' },
      { name: 'observacoes_fiscais', type: 'text' },
      { name: 'historico_eventos', type: 'json' },
      { name: 'solicitacao_origem_id', type: 'text' },
    ]

    for (let i = 0; i < partnerFields.length; i++) {
      const f = partnerFields[i]
      if (!partners.fields.getByName(f.name)) {
        if (f.type === 'bool') {
          partners.fields.add(new BoolField({ name: f.name }))
        } else if (f.type === 'json') {
          partners.fields.add(new JSONField({ name: f.name }))
        } else {
          partners.fields.add(new TextField({ name: f.name }))
        }
      }
    }

    try {
      partners.addIndex('idx_partners_codigo_oficial', false, 'codigo_oficial', '')
      partners.addIndex('idx_partners_situacao_credito', false, 'situacao_credito', '')
    } catch (_) {}

    app.save(partners)

    // 3. Extensão na collection financial_approvals (Aprovações Financeiras)
    const finApprovals = app.findCollectionByNameOrId('financial_approvals')

    const approvalFields = [
      { name: 'categoria', type: 'text' },
      { name: 'client_id', type: 'text' },
      { name: 'client_codigo', type: 'text' },
      { name: 'client_nome', type: 'text' },
      { name: 'cnpj_cpf', type: 'text' },
      { name: 'rca_nome', type: 'text' },
      { name: 'gerente_nome', type: 'text' },
      { name: 'limite_solicitado', type: 'text' },
      { name: 'limite_aprovado', type: 'text' },
      { name: 'condicoes_autorizadas', type: 'text' },
      { name: 'motivo_decisao', type: 'text' },
      { name: 'validade_revisao', type: 'text' },
      { name: 'bloquear_prazo', type: 'bool' },
      { name: 'motivo_bloqueio', type: 'text' },
      { name: 'historico_analise', type: 'json' },
    ]

    for (let j = 0; j < approvalFields.length; j++) {
      const af = approvalFields[j]
      if (!finApprovals.fields.getByName(af.name)) {
        if (af.type === 'bool') {
          finApprovals.fields.add(new BoolField({ name: af.name }))
        } else if (af.type === 'json') {
          finApprovals.fields.add(new JSONField({ name: af.name }))
        } else {
          finApprovals.fields.add(new TextField({ name: af.name }))
        }
      }
    }

    try {
      finApprovals.addIndex('idx_fin_appr_categoria', false, 'categoria', '')
      finApprovals.addIndex('idx_fin_appr_client', false, 'client_id', '')
    } catch (_) {}

    app.save(finApprovals)
  },
  (app) => {
    try {
      const solicitacoes = app.findCollectionByNameOrId('solicitacoes_clientes')
      if (solicitacoes) app.delete(solicitacoes)
    } catch (_) {}
  },
)

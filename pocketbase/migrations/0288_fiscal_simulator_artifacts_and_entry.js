migrate(
  (app) => {
    var ruleAdminOrAuth = "@request.auth.id != ''"

    // 1. Assegurar coleção stock_movements se não existir
    if (!app.hasTable('stock_movements')) {
      var smCol = new Collection({
        name: 'stock_movements',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          { name: 'produto_id', type: 'text' },
          { name: 'produto_nome', type: 'text' },
          { name: 'produto_codigo', type: 'text' },
          { name: 'tipo_movimentacao', type: 'text' },
          { name: 'documento_origem', type: 'text' },
          { name: 'documento_tipo', type: 'text' },
          { name: 'lote', type: 'text' },
          { name: 'validade', type: 'text' },
          { name: 'quantidade', type: 'number' },
          { name: 'unidade', type: 'text' },
          { name: 'saldo_anterior', type: 'number' },
          { name: 'saldo_atual', type: 'number' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'motivo', type: 'text' },
          { name: 'responsavel', type: 'text' },
          { name: 'custo_unitario', type: 'text' },
          { name: 'custo_total', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_sm_created ON stock_movements (created DESC)',
          'CREATE INDEX idx_sm_prod ON stock_movements (produto_id)',
          'CREATE INDEX idx_sm_doc ON stock_movements (documento_origem)',
        ],
      })
      app.save(smCol)
    }

    // 2. Coleção de Auditoria de Simulações Fiscais (fiscal_simulations)
    // Permite registrar e revisar cada cálculo: produto, empresa, operação, parâmetros de entrada, regras aplicadas, memória de cálculo e valores resultantes
    if (!app.hasTable('fiscal_simulations')) {
      var simCol = new Collection({
        name: 'fiscal_simulations',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'empresa_nome', type: 'text' },
          { name: 'product_id', type: 'text', required: true },
          { name: 'product_code', type: 'text' },
          { name: 'product_name', type: 'text' },
          { name: 'operacao', type: 'text', required: true }, // 'venda_interna', 'venda_interestadual', 'entrada_compra', 'devolucao', 'transferencia', 'bonificacao'
          { name: 'uf_origem', type: 'text' },
          { name: 'uf_destino', type: 'text' },
          { name: 'consumidor_final', type: 'bool' },
          { name: 'contribuinte_icms', type: 'bool' },
          { name: 'quantidade', type: 'text' }, // string decimal
          { name: 'unidade', type: 'text' },
          { name: 'valor_unitario', type: 'text' }, // string decimal
          { name: 'valor_total', type: 'text' }, // string decimal
          { name: 'desconto', type: 'text' },
          { name: 'despesas_frete', type: 'text' },
          // Resultados calculados
          { name: 'cfop_resultado', type: 'text' },
          { name: 'cst_csosn_resultado', type: 'text' },
          { name: 'ncm_resultado', type: 'text' },
          { name: 'cest_resultado', type: 'text' },
          { name: 'origem_resultado', type: 'text' },
          { name: 'cClassTrib_resultado', type: 'text' },
          // Bases e Alíquotas
          { name: 'icms_base', type: 'text' },
          { name: 'icms_aliquota', type: 'text' },
          { name: 'icms_valor', type: 'text' },
          { name: 'icms_st_base', type: 'text' },
          { name: 'icms_st_mva', type: 'text' },
          { name: 'icms_st_aliquota', type: 'text' },
          { name: 'icms_st_valor', type: 'text' },
          { name: 'fcp_base', type: 'text' },
          { name: 'fcp_aliquota', type: 'text' },
          { name: 'fcp_valor', type: 'text' },
          { name: 'difal_valor', type: 'text' },
          { name: 'pis_cst', type: 'text' },
          { name: 'pis_base', type: 'text' },
          { name: 'pis_aliquota', type: 'text' },
          { name: 'pis_valor', type: 'text' },
          { name: 'cofins_cst', type: 'text' },
          { name: 'cofins_base', type: 'text' },
          { name: 'cofins_aliquota', type: 'text' },
          { name: 'cofins_valor', type: 'text' },
          { name: 'ibs_base', type: 'text' },
          { name: 'ibs_aliquota', type: 'text' },
          { name: 'ibs_valor', type: 'text' },
          { name: 'cbs_base', type: 'text' },
          { name: 'cbs_aliquota', type: 'text' },
          { name: 'cbs_valor', type: 'text' },
          { name: 'total_tributos', type: 'text' },
          // Memória de cálculo e auditoria
          { name: 'calculation_memory', type: 'json' },
          { name: 'rules_applied', type: 'json' },
          { name: 'warnings', type: 'json' },
          { name: 'user_id', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_fsim_created ON fiscal_simulations (created DESC)',
          'CREATE INDEX idx_fsim_emp ON fiscal_simulations (empresa_id)',
          'CREATE INDEX idx_fsim_prod ON fiscal_simulations (product_id)',
          'CREATE INDEX idx_fsim_op ON fiscal_simulations (operacao)',
        ],
      })
      app.save(simCol)
    }

    // 3. Coleção de Artefatos de Documentos Fiscais (fiscal_document_artifacts)
    // Armazena XML original de entrada, XML gerado/assinado/autorizado de NF-e, chave de 44 dígitos (idempotência), protocolo SEFAZ e ambiente
    if (!app.hasTable('fiscal_document_artifacts')) {
      var artCol = new Collection({
        name: 'fiscal_document_artifacts',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          {
            name: 'tipo_documento',
            type: 'select',
            values: ['nfe_saida', 'nfe_entrada', 'cte', 'mdfe', 'nfce'],
          },
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'document_id', type: 'text' }, // id em purchase_invoices ou nfe_records ou sales_orders
          { name: 'document_number', type: 'text' },
          { name: 'serie', type: 'text' },
          { name: 'chave_acesso', type: 'text', required: true }, // Chave de 44 dígitos da NF-e
          { name: 'ambiente', type: 'select', values: ['homologacao', 'producao'] },
          { name: 'status_sefaz', type: 'text' }, // '100 - Autorizado o uso da NF-e', 'Em Digitação', 'Validado Homologação', 'Pendente Certificado'
          { name: 'codigo_status', type: 'text' },
          { name: 'motivo_status', type: 'text' },
          { name: 'protocolo_autorizacao', type: 'text' },
          { name: 'data_autorizacao', type: 'text' },
          { name: 'xml_conteudo', type: 'text' }, // Conteúdo XML completo textual (UTF-8)
          { name: 'digest_value', type: 'text' }, // Hash SHA-1 do XML
          { name: 'external_idempotency_key', type: 'text' }, // Chave de idempotência
          { name: 'divergencias_importacao', type: 'json' },
          { name: 'pendencias_de_para', type: 'json' },
          { name: 'created_by_user', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_fda_chave_amb ON fiscal_document_artifacts (chave_acesso, ambiente)',
          'CREATE INDEX idx_fda_empresa ON fiscal_document_artifacts (empresa_id)',
          'CREATE INDEX idx_fda_status ON fiscal_document_artifacts (status_sefaz)',
          'CREATE INDEX idx_fda_created ON fiscal_document_artifacts (created DESC)',
        ],
      })
      app.save(artCol)
    }

    // 4. Estender purchase_invoices com campos fiscais estritos caso não existam
    var piCol = app.findCollectionByNameOrId('purchase_invoices')
    if (piCol) {
      var piFields = [
        { name: 'empresa_id', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'chave_acesso', type: 'text' },
        { name: 'protocolo_sefaz', type: 'text' },
        { name: 'data_emissao', type: 'text' },
        { name: 'valor_produtos', type: 'text' },
        { name: 'valor_frete', type: 'text' },
        { name: 'valor_seguro', type: 'text' },
        { name: 'valor_desconto', type: 'text' },
        { name: 'valor_outras_despesas', type: 'text' },
        { name: 'valor_icms', type: 'text' },
        { name: 'valor_icms_st', type: 'text' },
        { name: 'valor_ipi', type: 'text' },
        { name: 'valor_pis', type: 'text' },
        { name: 'valor_cofins', type: 'text' },
        { name: 'import_source', type: 'text' }, // 'xml_nfe_upload', 'manual', 'integracao'
        { name: 'import_pending_refs', type: 'json' }, // itens sem de-para pendentes de vinculação
      ]

      for (var p = 0; p < piFields.length; p++) {
        var pf = piFields[p]
        try {
          if (pf.type === 'text') {
            piCol.fields.add(new TextField({ name: pf.name }))
          } else if (pf.type === 'json') {
            piCol.fields.add(new JSONField({ name: pf.name }))
          }
        } catch (_) {}
      }
      app.save(piCol)
    }

    // 5. Estender nfe_records com chave de acesso de 44 dígitos e ambiente caso não existam
    var nfeCol = app.findCollectionByNameOrId('nfe_records')
    if (nfeCol) {
      try {
        nfeCol.fields.add(new TextField({ name: 'chave_acesso' }))
      } catch (_) {}
      try {
        nfeCol.fields.add(new TextField({ name: 'empresa_id' }))
      } catch (_) {}
      try {
        nfeCol.fields.add(new TextField({ name: 'ambiente' }))
      } catch (_) {}
      try {
        nfeCol.fields.add(new TextField({ name: 'serie' }))
      } catch (_) {}
      try {
        nfeCol.fields.add(new TextField({ name: 'xml_conteudo' }))
      } catch (_) {}
      try {
        nfeCol.fields.add(new TextField({ name: 'homologacao_pendencia' }))
      } catch (_) {}
      app.save(nfeCol)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('fiscal_document_artifacts'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('fiscal_simulations'))
    } catch (_) {}
  },
)

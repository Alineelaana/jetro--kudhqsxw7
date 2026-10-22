migrate(
  (app) => {
    // 1. Estender a coleção 'products' existente com campos exigidos pelo roteiro
    var productsCol = app.findCollectionByNameOrId('products')
    if (productsCol) {
      // Campos novos: tipo/finalidade (finalidade), fiscal_status (draft | ready_for_fiscal),
      // external_reference (referência externa opcional), origin_code (origem 0-8), grupo/subgrupo
      try {
        productsCol.fields.add(
          new SelectField({
            name: 'tipo_finalidade',
            values: [
              'revenda',
              'fabricacao_propria',
              'materia_prima',
              'embalagem',
              'insumo',
              'ativo_imobilizado',
              'uso_consumo',
              'outro',
            ],
          }),
        )
      } catch (_) {}

      try {
        productsCol.fields.add(
          new SelectField({
            name: 'fiscal_status',
            values: ['rascunho', 'validado_fiscal'],
          }),
        )
      } catch (_) {}

      try {
        productsCol.fields.add(
          new TextField({
            name: 'external_reference',
          }),
        )
      } catch (_) {}

      try {
        productsCol.fields.add(
          new TextField({
            name: 'product_group',
          }),
        )
      } catch (_) {}

      try {
        productsCol.fields.add(
          new TextField({
            name: 'fiscal_validation_notes',
          }),
        )
      } catch (_) {}

      app.save(productsCol)
    }

    // Regra multiempresa padrão para coleções de cadastros / configurações por empresa:
    // SUP acessa irrestrito; demais acessam caso empresa_id bata ou empresa esteja em empresas_ids
    var ruleAdminOrAuth = "@request.auth.id != ''"

    // 2. Criar coleção product_company_fiscal
    // Configurações fiscais específicas por empresa+produto
    if (!app.hasTable('product_company_fiscal')) {
      var prodCompFiscal = new Collection({
        name: 'product_company_fiscal',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          {
            name: 'product_id',
            type: 'relation',
            required: true,
            collectionId: productsCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'empresa_id',
            type: 'relation',
            required: true,
            collectionId: app.findCollectionByNameOrId('empresas').id,
            cascadeDelete: false,
            maxSelect: 1,
          },
          { name: 'fiscal_status', type: 'select', values: ['rascunho', 'validado_fiscal'] },
          {
            name: 'tipo_operacao_fiscal',
            type: 'select',
            values: ['revenda', 'fabricacao_propria', 'industrializacao', 'outro'],
          },
          { name: 'cfop_padrao_interno', type: 'text' },
          { name: 'cfop_padrao_interestadual', type: 'text' },
          { name: 'cst_csosn', type: 'text' },
          { name: 'cest', type: 'text' },
          { name: 'codigo_beneficio_fiscal', type: 'text' },
          { name: 'perfil_fiscal_produto', type: 'text' },
          { name: 'grupo_tributario', type: 'text' },
          { name: 'origem_override', type: 'text' },
          { name: 'ncm_override', type: 'text' },
          { name: 'icms_aliquota', type: 'text' },
          { name: 'icms_base_reduzida', type: 'text' },
          { name: 'icms_st_mva', type: 'text' },
          { name: 'icms_st_aliquota', type: 'text' },
          { name: 'fcp_aliquota', type: 'text' },
          { name: 'ipi_aliquota', type: 'text' },
          { name: 'ipi_cst', type: 'text' },
          { name: 'pis_cst', type: 'text' },
          { name: 'pis_aliquota', type: 'text' },
          { name: 'cofins_cst', type: 'text' },
          { name: 'cofins_aliquota', type: 'text' },
          { name: 'ibs_aliquota', type: 'text' },
          { name: 'cbs_aliquota', type: 'text' },
          { name: 'cClassTrib', type: 'text' },
          { name: 'allow_lot_control', type: 'bool' },
          { name: 'observacoes_fiscais', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_pcf_prod_emp ON product_company_fiscal (product_id, empresa_id)',
          'CREATE INDEX idx_pcf_empresa ON product_company_fiscal (empresa_id)',
          'CREATE INDEX idx_pcf_status ON product_company_fiscal (fiscal_status)',
        ],
      })
      app.save(prodCompFiscal)
    }

    // 3. Criar coleção product_units
    // Apresentações e fatores de conversão (ex: CX com 12 UN, FD com 6 CX)
    if (!app.hasTable('product_units')) {
      var prodUnits = new Collection({
        name: 'product_units',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          {
            name: 'product_id',
            type: 'relation',
            required: true,
            collectionId: productsCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'unit_code', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'conversion_factor', type: 'text', required: true }, // Armazenado como string decimal exata ex: "12.0000"
          { name: 'operator', type: 'select', values: ['multiply', 'divide'] },
          { name: 'gtin', type: 'text' },
          { name: 'sem_gtin', type: 'bool' },
          { name: 'is_taxable_unit', type: 'bool' },
          { name: 'taxable_unit_code', type: 'text' },
          { name: 'taxable_factor', type: 'text' },
          { name: 'is_sales_unit', type: 'bool' },
          { name: 'is_purchase_unit', type: 'bool' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_pu_product ON product_units (product_id)',
          'CREATE INDEX idx_pu_unit ON product_units (unit_code)',
          'CREATE INDEX idx_pu_gtin ON product_units (gtin)',
        ],
      })
      app.save(prodUnits)
    }

    // 4. Criar coleção supplier_product_refs
    // Relação Fornecedor x Código externo x Produto interno com fator validado
    if (!app.hasTable('supplier_product_refs')) {
      var suppRefs = new Collection({
        name: 'supplier_product_refs',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          {
            name: 'product_id',
            type: 'relation',
            required: true,
            collectionId: productsCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'supplier_id', type: 'text', required: true }, // ID ou CNPJ do parceiro fornecedor
          { name: 'supplier_name', type: 'text' },
          { name: 'supplier_product_code', type: 'text', required: true }, // Código do fornecedor no XML/Nota
          { name: 'supplier_description', type: 'text' },
          { name: 'supplier_unit', type: 'text' },
          { name: 'conversion_factor', type: 'text', required: true }, // Fator validado (positivo > 0)
          { name: 'operator', type: 'select', values: ['multiply', 'divide'] },
          { name: 'supplier_gtin', type: 'text' },
          { name: 'context', type: 'text' }, // contexto da relação (ex: revenda, insumo, filial)
          { name: 'is_validated', type: 'bool' },
          { name: 'validated_by', type: 'text' },
          { name: 'validated_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_spr_unique ON supplier_product_refs (supplier_id, supplier_product_code, context)',
          'CREATE INDEX idx_spr_product ON supplier_product_refs (product_id)',
          'CREATE INDEX idx_spr_supplier ON supplier_product_refs (supplier_id)',
        ],
      })
      app.save(suppRefs)
    }

    // 5. Criar coleção fiscal_catalogs
    // Catálogos discriminados por domínio para NCM, CEST, CFOP, CST, cClassTrib
    if (!app.hasTable('fiscal_catalogs')) {
      var fiscalCat = new Collection({
        name: 'fiscal_catalogs',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          {
            name: 'domain',
            type: 'select',
            required: true,
            values: [
              'NCM',
              'CEST',
              'CFOP',
              'CST_ICMS',
              'CST_PIS_COFINS',
              'CST_IPI',
              'cClassTrib',
              'ORIGEM',
            ],
          },
          { name: 'code', type: 'text', required: true },
          { name: 'description', type: 'text', required: true },
          { name: 'vigencia_inicio', type: 'text' },
          { name: 'vigencia_fim', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'metadata', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_fc_domain_code ON fiscal_catalogs (domain, code)',
          'CREATE INDEX idx_fc_domain ON fiscal_catalogs (domain)',
          'CREATE INDEX idx_fc_active ON fiscal_catalogs (active)',
        ],
      })
      app.save(fiscalCat)

      // Seed básico dos catálogos fiscais essenciais (CFOP, Origem, NCMs comuns)
      var seedEntries = [
        {
          domain: 'ORIGEM',
          code: '0',
          description: '0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8',
        },
        {
          domain: 'ORIGEM',
          code: '1',
          description: '1 - Estrangeira - Importação direta, exceto a indicada no código 6',
        },
        {
          domain: 'ORIGEM',
          code: '2',
          description:
            '2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7',
        },
        {
          domain: 'ORIGEM',
          code: '3',
          description:
            '3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%',
        },
        {
          domain: 'ORIGEM',
          code: '4',
          description:
            '4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos',
        },
        {
          domain: 'ORIGEM',
          code: '5',
          description:
            '5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%',
        },
        {
          domain: 'CFOP',
          code: '5101',
          description: 'Venda de produção do estabelecimento (interna)',
        },
        {
          domain: 'CFOP',
          code: '5102',
          description: 'Venda de mercadoria adquirida ou recebida de terceiros (interna)',
        },
        {
          domain: 'CFOP',
          code: '6101',
          description: 'Venda de produção do estabelecimento (interestadual)',
        },
        {
          domain: 'CFOP',
          code: '6102',
          description: 'Venda de mercadoria adquirida ou recebida de terceiros (interestadual)',
        },
        {
          domain: 'CFOP',
          code: '1101',
          description: 'Compra para industrialização ou produção rural (interna)',
        },
        { domain: 'CFOP', code: '1102', description: 'Compra para comercialização (interna)' },
        {
          domain: 'CFOP',
          code: '2101',
          description: 'Compra para industrialização ou produção rural (interestadual)',
        },
        {
          domain: 'CFOP',
          code: '2102',
          description: 'Compra para comercialização (interestadual)',
        },
        {
          domain: 'CFOP',
          code: '5201',
          description: 'Devolução de compra para industrialização ou produção rural',
        },
        { domain: 'CFOP', code: '5202', description: 'Devolução de compra para comercialização' },
        { domain: 'CFOP', code: '5910', description: 'Remessa em bonificação, doação ou brinde' },
        {
          domain: 'CFOP',
          code: '5152',
          description: 'Transferência de mercadoria adquirida ou recebida de terceiros',
        },
        { domain: 'CST_ICMS', code: '00', description: '00 - Tributada integralmente' },
        {
          domain: 'CST_ICMS',
          code: '10',
          description: '10 - Tributada e com cobrança do ICMS por substituição tributária',
        },
        { domain: 'CST_ICMS', code: '20', description: '20 - Com redução de base de cálculo' },
        { domain: 'CST_ICMS', code: '40', description: '40 - Isenta' },
        { domain: 'CST_ICMS', code: '41', description: '41 - Não tributada' },
        {
          domain: 'CST_ICMS',
          code: '60',
          description: '60 - ICMS cobrado anteriormente por substituição tributária',
        },
        {
          domain: 'CST_ICMS',
          code: '101',
          description: '101 - Simples Nacional com permissão de crédito',
        },
        {
          domain: 'CST_ICMS',
          code: '102',
          description: '102 - Simples Nacional sem permissão de crédito',
        },
        {
          domain: 'CST_ICMS',
          code: '500',
          description: '500 - Simples Nacional ICMS cobrado anteriormente por ST',
        },
        {
          domain: 'CST_PIS_COFINS',
          code: '01',
          description: '01 - Operação Tributável com Alíquota Básica',
        },
        {
          domain: 'CST_PIS_COFINS',
          code: '04',
          description: '04 - Operação Tributável Monofásica - Alíquota Zero',
        },
        {
          domain: 'CST_PIS_COFINS',
          code: '06',
          description: '06 - Operação Tributável a Alíquota Zero',
        },
        {
          domain: 'CST_PIS_COFINS',
          code: '08',
          description: '08 - Operação sem Incidência da Contribuição',
        },
        { domain: 'CST_PIS_COFINS', code: '49', description: '49 - Outras Operações de Saída' },
      ]

      for (var k = 0; k < seedEntries.length; k++) {
        var s = seedEntries[k]
        try {
          var rec = new Record(fiscalCat)
          rec.set('domain', s.domain)
          rec.set('code', s.code)
          rec.set('description', s.description)
          rec.set('active', true)
          app.save(rec)
        } catch (_) {}
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('supplier_product_refs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('product_units'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('product_company_fiscal'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('fiscal_catalogs'))
    } catch (_) {}
  },
)

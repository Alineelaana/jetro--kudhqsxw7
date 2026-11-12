migrate(
  (app) => {
    var ruleAdminOrAuth = "@request.auth.id != ''"
    var productsCol = app.findCollectionByNameOrId('products')
    var empresasCol = app.findCollectionByNameOrId('empresas')

    // 1. Garantir coleção product_company_fiscal se não existir
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
            collectionId: empresasCol.id,
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
          { name: 'ncm', type: 'text' },
          { name: 'cest', type: 'text' },
          { name: 'cst_icms', type: 'text' },
          { name: 'aliquota_icms', type: 'text' },
          { name: 'reducao_base_icms', type: 'text' },
          { name: 'cst_pis', type: 'text' },
          { name: 'aliquota_pis', type: 'text' },
          { name: 'cst_cofins', type: 'text' },
          { name: 'aliquota_cofins', type: 'text' },
          { name: 'cst_ipi', type: 'text' },
          { name: 'aliquota_ipi', type: 'text' },
          { name: 'orig_mercadoria', type: 'text' },
          { name: 'override_ncm', type: 'bool' },
          { name: 'override_cest', type: 'bool' },
          { name: 'rastreabilidade_lote', type: 'bool' },
          { name: 'controlar_validade', type: 'bool' },
          { name: 'validade_dias', type: 'text' },
          { name: 'observacoes_fiscais', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_pcf_prod_emp ON product_company_fiscal (product_id, empresa_id)',
          'CREATE INDEX idx_pcf_empresa ON product_company_fiscal (empresa_id)',
        ],
      })
      app.save(prodCompFiscal)
    }

    // 2. Garantir product_company_commercial se não existir
    if (!app.hasTable('product_company_commercial')) {
      var pComm = new Collection({
        name: 'product_company_commercial',
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
            collectionId: empresasCol.id,
            cascadeDelete: false,
            maxSelect: 1,
          },
          { name: 'price', type: 'text' },
          { name: 'profit_margin', type: 'text' },
          { name: 'min_margin', type: 'text' },
          { name: 'commission', type: 'text' },
          { name: 'max_discount', type: 'text' },
          { name: 'min_order_qty', type: 'text' },
          { name: 'payment_condition', type: 'text' },
          { name: 'price_policy', type: 'text' },
          { name: 'commercial_rules', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_pcc_prod_emp ON product_company_commercial (product_id, empresa_id)',
          'CREATE INDEX idx_pcc_empresa ON product_company_commercial (empresa_id)',
        ],
      })
      app.save(pComm)
    }

    // 3. Garantir product_company_stock se não existir
    if (!app.hasTable('product_company_stock')) {
      var pStock = new Collection({
        name: 'product_company_stock',
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
            collectionId: empresasCol.id,
            cascadeDelete: false,
            maxSelect: 1,
          },
          { name: 'min_stock', type: 'text' },
          { name: 'max_stock', type: 'text' },
          { name: 'safety_stock', type: 'text' },
          { name: 'reorder_point', type: 'text' },
          { name: 'storage_location', type: 'text' },
          { name: 'blocked', type: 'bool' },
          { name: 'blocked_reason', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_pcs_prod_emp ON product_company_stock (product_id, empresa_id)',
          'CREATE INDEX idx_pcs_empresa ON product_company_stock (empresa_id)',
        ],
      })
      app.save(pStock)
    }

    // 4. Garantir índice único do código em products (bloqueia duplicidade)
    try {
      var idx = productsCol.indexes || []
      var hasUniqueCode = false
      for (var i = 0; i < idx.length; i++) {
        var s = String(idx[i]).toUpperCase().replace(/\s+/g, ' ')
        if (s.indexOf('ON PRODUCTS') >= 0 && s.indexOf('UNIQUE') >= 0 && s.indexOf('(CODE') >= 0) {
          hasUniqueCode = true
        }
      }
      if (!hasUniqueCode) {
        // Preenche códigos vazios/duplicados em legados para não falhar a criação do índice
        var legacy = app.findRecordsByFilter('products', '', '-created', 1000, 0)
        var seen = {}
        for (var k = 0; k < legacy.length; k++) {
          var rec = legacy[k]
          var c = rec.getString('code')
          if (!c || c === '') {
            rec.set('code', 'PROD-' + rec.id.slice(0, 8).toUpperCase())
            app.save(rec)
          } else if (seen[c]) {
            rec.set('code', c + '-DUP' + rec.id.slice(0, 4).toUpperCase())
            app.save(rec)
          }
          seen[rec.getString('code')] = true
        }
        idx.push('CREATE UNIQUE INDEX idx_products_code_unique ON products (code)')
        productsCol.set('indexes', idx)
        app.save(productsCol)
      }
    } catch (errIdx) {
      app.logger().error('0320 unique code index: ' + String(errIdx))
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('product_company_stock'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('product_company_commercial'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('product_company_fiscal'))
    } catch (_) {}
  },
)

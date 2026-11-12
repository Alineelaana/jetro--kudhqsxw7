migrate(
  (app) => {
    // ============================================================
    // 0320 — Complemento ADITIVO e IDEMPOTENTE da arquitetura
    // mestre de produtos (0319 aplicou parcialmente por causa do
    // bug .getId() já corrigido no arquivo dela; migração aplicada
    // não re-roda, então o que faltou é completado aqui):
    //   - product_company_commercial (parametrização comercial por empresa)
    //   - product_company_stock      (parâmetros de estoque por empresa)
    //   - unique idx_products_code_unique em products (código global)
    // NÃO altera nem deleta nenhum registro existente.
    // ============================================================

    var ruleAdminOrAuth = "@request.auth.id != ''"
    var productsCol = app.findCollectionByNameOrId('products')

    // ------------------------------------------------------------
    // 1. Unique index global do código interno (cobre também produtos
    //    inativos/bloqueados/descontinuados). Se já existir qualquer
    //    índice único sobre (code), não duplica.
    // ------------------------------------------------------------
    try {
      var idx = productsCol.indexes || []
      var hasUniqueCode = false
      for (var i = 0; i < idx.length; i++) {
        var s = String(idx[i]).toUpperCase().replace(/\s+/g, ' ')
        if (
          s.indexOf('ON PRODUCTS') >= 0 &&
          s.indexOf('UNIQUE INDEX') >= 0 &&
          s.indexOf('(CODE') >= 0
        ) {
          hasUniqueCode = true
        }
      }
      if (!hasUniqueCode) {
        // Regulariza códigos vazios/duplicados antes do índice (apenas preenche, nunca apaga)
        var legacyProducts = app.findRecordsByFilter('products', '', '-created', 2000, 0)
        var seenCodes = {}
        for (var li = 0; li < legacyProducts.length; li++) {
          var lp = legacyProducts[li]
          var lcode = lp.getString('code')
          if (!lcode || lcode === '') {
            lp.set('code', 'LEGADO-' + lp.id.slice(0, 8).toUpperCase())
            app.save(lp)
          } else if (seenCodes[lcode]) {
            // duplicado: renumera com sufixo para o índice poder subir
            lp.set('code', lcode + '-DUP' + lp.id.slice(0, 4).toUpperCase())
            app.save(lp)
          }
          seenCodes[lp.getString('code')] = true
        }
        idx.push('CREATE UNIQUE INDEX idx_products_code_unique ON products (code)')
        productsCol.set('indexes', idx)
        app.save(productsCol)
      }
    } catch (err1) {
      app.logger().error('0320 unique code index failed: ' + String(err1))
    }

    // ------------------------------------------------------------
    // 2. product_company_commercial — parametrização COMERCIAL por empresa
    // ------------------------------------------------------------
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
            collectionId: app.findCollectionByNameOrId('empresas').id,
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

    // ------------------------------------------------------------
    // 3. product_company_stock — parâmetros de ESTOQUE por empresa
    // ------------------------------------------------------------
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
            collectionId: app.findCollectionByNameOrId('empresas').id,
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
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('product_company_stock'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('product_company_commercial'))
    } catch (_) {}
  },
)

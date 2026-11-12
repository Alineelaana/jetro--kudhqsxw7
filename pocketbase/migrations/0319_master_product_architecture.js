migrate(
  (app) => {
    var ruleAdminOrAuth = "@request.auth.id != ''"

    // ============================================
    // 0. Corrigir produtos sem código antes do índice único
    // ============================================
    try {
      var legacyProducts = app.findRecordsByFilter('products', '', '-created', 500, 0)
      for (var li = 0; li < legacyProducts.length; li++) {
        var lp = legacyProducts[li]
        var lcode = lp.getString('code')
        if (!lcode || lcode === '') {
          lp.set('code', 'LEGADO-' + lp.getId().slice(0, 8).toUpperCase())
          app.save(lp)
        }
      }
    } catch (err0) {
      $app.logger().error('0319 legacy code fix failed: ' + String(err0))
    }

    // ============================================
    // 1. Unique index NO BANCO para o código interno global
    //    (bloqueia duplicidade mesmo de produto inativo/bloqueado/descontinuado)
    // ============================================
    var productsCol = app.findCollectionByNameOrId('products')
    try {
      var idx = productsCol.indexes || []
      var hasUniqueCode = false
      for (var i = 0; i < idx.length; i++) {
        var s = String(idx[i])
        if (
          s.indexOf('ON products') >= 0 &&
          s.indexOf('UNIQUE INDEX') >= 0 &&
          s.indexOf('(code') >= 0
        ) {
          hasUniqueCode = true
        }
      }
      if (!hasUniqueCode) {
        idx.push('CREATE UNIQUE INDEX idx_products_code_unique ON products (code)')
        productsCol.set('indexes', idx)
        app.save(productsCol)
      }
    } catch (err1) {
      $app.logger().error('0319 unique code index failed: ' + String(err1))
    }

    // ============================================
    // 2. Campos GLOBAIS de identidade, dimensões, embalagens,
    //    paletização e logística no cadastro mestre
    // ============================================
    var productsCol2 = app.findCollectionByNameOrId('products')
    function addText(col, name) {
      try {
        col.fields.add(new TextField({ name: name }))
      } catch (_) {}
    }
    function addBool(col, name) {
      try {
        col.fields.add(new BoolField({ name: name }))
      } catch (_) {}
    }
    function addSelect(col, name, values) {
      try {
        col.fields.add(new SelectField({ name: name, values: values }))
      } catch (_) {}
    }

    addText(productsCol2, 'description_complementar')
    addText(productsCol2, 'fabricante')
    addText(productsCol2, 'modelo')
    addText(productsCol2, 'dun14')
    addSelect(productsCol2, 'cadastro_status', ['ativo', 'inativo', 'descontinuado'])

    // Características dimensionais
    addText(productsCol2, 'dim_length')
    addText(productsCol2, 'dim_width')
    addText(productsCol2, 'dim_height')
    addText(productsCol2, 'dim_depth')
    addText(productsCol2, 'dim_unit')
    addText(productsCol2, 'weight_net')
    addText(productsCol2, 'weight_gross')
    addText(productsCol2, 'weight_unit')

    // Caixa master
    addText(productsCol2, 'master_units_per_box')
    addText(productsCol2, 'master_dim_length')
    addText(productsCol2, 'master_dim_width')
    addText(productsCol2, 'master_dim_height')
    addText(productsCol2, 'master_weight_net')
    addText(productsCol2, 'master_weight_gross')
    addText(productsCol2, 'master_dun14')

    // Lastro e paletização
    addText(productsCol2, 'pallet_boxes_per_layer')
    addText(productsCol2, 'pallet_layers_per_pallet')
    addText(productsCol2, 'pallet_type')
    addText(productsCol2, 'pallet_empty_weight')
    addText(productsCol2, 'pallet_max_height')

    // Logística complementar
    addText(productsCol2, 'packaging_type')
    addText(productsCol2, 'packaging_qty')
    addText(productsCol2, 'max_stacking')
    addBool(productsCol2, 'fragile')
    addBool(productsCol2, 'special_storage')
    addText(productsCol2, 'storage_temperature')
    addText(productsCol2, 'shelf_life_days')
    addText(productsCol2, 'transport_restrictions')

    app.save(productsCol2)

    // ============================================
    // 3. product_company_links — vínculo produto ↔ empresa
    //    (status, permissões comprar/vender/movimentar, responsável, motivo)
    // ============================================
    if (!app.hasTable('product_company_links')) {
      var pLinks = new Collection({
        name: 'product_company_links',
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
            collectionId: productsCol2.id,
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
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['ativo', 'inativo', 'bloqueado', 'indisponivel'],
          },
          { name: 'activated_at', type: 'text' },
          { name: 'inactivated_at', type: 'text' },
          { name: 'responsavel', type: 'text' },
          { name: 'motivo', type: 'text' },
          { name: 'can_purchase', type: 'bool' },
          { name: 'can_sell', type: 'bool' },
          { name: 'can_move_stock', type: 'bool' },
          { name: 'observacoes', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_pcl_prod_emp ON product_company_links (product_id, empresa_id)',
          'CREATE INDEX idx_pcl_empresa ON product_company_links (empresa_id)',
          'CREATE INDEX idx_pcl_status ON product_company_links (status)',
        ],
      })
      app.save(pLinks)
    }

    // ============================================
    // 4. product_company_commercial — parametrização COMERCIAL por empresa
    // ============================================
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
            collectionId: productsCol2.id,
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

    // ============================================
    // 5. product_company_stock — parâmetros de ESTOQUE por empresa
    //    (saldos físicos permanecem nas coleções existentes por empresa/operação)
    // ============================================
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
            collectionId: productsCol2.id,
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

    // ============================================
    // 6. Backfill ADITIVO: vínculo produto ↔ empresa para TODOS os produtos
    //    existentes × TODAS as empresas ativas (preserva operações atuais —
    //    nenhum produto deixa de ser usado pela empresa que já o usa)
    // ============================================
    try {
      var backfillProducts = app.findRecordsByFilter('products', '', '-created', 2000, 0)
      var backfillEmpresas = app.findRecordsByFilter('empresas', '', 'created', 200, 0)
      var linksCol = app.findCollectionByNameOrId('product_company_links')
      var createdCount = 0
      for (var pi = 0; pi < backfillProducts.length; pi++) {
        var prod = backfillProducts[pi]
        for (var ei = 0; ei < backfillEmpresas.length; ei++) {
          var emp = backfillEmpresas[ei]
          var existing = null
          try {
            existing = app.findFirstRecordByFilter(
              'product_company_links',
              'product_id = "' + prod.getId() + '" && empresa_id = "' + emp.getId() + '"',
            )
          } catch (_) {}
          if (!existing) {
            var linkRec = new Record(linksCol)
            linkRec.set('product_id', prod.getId())
            linkRec.set('empresa_id', emp.getId())
            linkRec.set('status', 'ativo')
            linkRec.set('can_purchase', true)
            linkRec.set('can_sell', true)
            linkRec.set('can_move_stock', true)
            linkRec.set('responsavel', 'migracao_0319')
            linkRec.set(
              'motivo',
              'Vínculo criado na migração 0319 (arquitetura mestre): produto já operava nesta empresa.',
            )
            linkRec.set('activated_at', new Date().toISOString())
            app.save(linkRec)
            createdCount++
          }
        }
      }
      $app.logger().info('0319 backfill product_company_links criados: ' + String(createdCount))
    } catch (err6) {
      $app.logger().error('0319 backfill links failed: ' + String(err6))
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
      app.delete(app.findCollectionByNameOrId('product_company_links'))
    } catch (_) {}
  },
)

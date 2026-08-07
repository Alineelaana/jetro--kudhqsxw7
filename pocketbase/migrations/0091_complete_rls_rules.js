migrate(
  (app) => {
    var publicRead = [
      'settings',
      'budget_form_fields',
      'services_offered',
      'service_areas',
      'cms_content',
      'cms_publication',
      'vitrine_items',
    ]
    var publicCreate = [
      'budget_requests',
      'chat_conversations',
      'chat_messages',
      'chat_ratings',
      'clients',
    ]

    var fallbackNames = [
      'settings',
      'budget_form_fields',
      'budget_requests',
      'chat_conversations',
      'chat_messages',
      'chat_ratings',
      'ai_training',
      'partner_types',
      'partners',
      'cms_content',
      'cms_versions',
      'cms_history',
      'cms_media',
      'cms_publication',
      'vitrine_items',
      'audit_logs',
      'backups',
      'services_offered',
      'service_areas',
      'contracts_operations',
      'notifications',
      'products',
      'purchase_requests',
      'quotations',
      'purchase_orders',
      'purchase_invoices',
      'purchase_returns',
      'pricing_config',
      'price_tables',
      'pricing_simulations',
      'pricing_history',
      'pricing_approvals',
      'pricing_alerts',
      'empresas',
      'filiais',
      'perfis_permissoes',
      'transportadoras',
      'categorias',
      'subcategorias',
      'marcas',
      'unidades_medida',
      'centros_custo',
      'plano_contas',
      'bancos',
      'contas_bancarias',
      'formas_pagamento',
      'condicoes_pagamento',
      'vendedores',
      'representantes',
      'stock_alerts',
      'sales_orders',
      'sales_invoices',
      'nfe_records',
      'nfce_records',
      'sales_returns',
      'stock_expeditions',
      'price_vault',
      'pricing_risk_monitor',
      'audit_sessions',
      'audit_alerts',
      'system_parameters',
      'integrations',
      'integration_logs',
      'api_credentials',
      'api_request_logs',
      'email_templates',
    ]

    var names = []
    try {
      var rows = app.db().newQuery('SELECT name FROM _collections').all()
      for (var i = 0; i < rows.length; i++) {
        var n = '' + rows[i]['name']
        if (n && n.charAt(0) !== '_') names.push(n)
      }
    } catch (sqlErr) {
      console.log('BEP-001 RLS: SQL query failed, using fallback list: ' + String(sqlErr))
      names = fallbackNames
    }

    var fixed = 0
    var checked = 0

    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      try {
        var col = app.findCollectionByNameOrId(name)

        if (col.type === 'view') {
          checked++
          continue
        }

        var modified = false
        var isPubRead = publicRead.indexOf(name) !== -1
        var isPubCreate = publicCreate.indexOf(name) !== -1
        var authRule = "@request.auth.id != ''"

        if (col.listRule === null) {
          col.listRule = isPubRead ? '' : authRule
          modified = true
        }
        if (col.viewRule === null) {
          col.viewRule = isPubRead ? '' : authRule
          modified = true
        }
        if (col.createRule === null) {
          col.createRule = isPubCreate ? '' : authRule
          modified = true
        }
        if (col.updateRule === null) {
          col.updateRule = authRule
          modified = true
        }
        if (col.deleteRule === null) {
          col.deleteRule = authRule
          modified = true
        }

        if (modified) {
          app.save(col)
          fixed++
        }
        checked++
      } catch (e) {
        console.log('BEP-001 RLS: skipping ' + name + ': ' + String(e))
      }
    }

    console.log('BEP-001 RLS: checked ' + checked + ' collections, fixed ' + fixed)
  },
  (app) => {
    // Down: Cannot practically revert — rules were null (superuser-only)
    // before and we don't track which were null vs already set per collection.
  },
)

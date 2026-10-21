migrate(
  (app) => {
    // Regra RLS para coleções com campo "company"
    // Permite leitura/escrita se o usuário for SUP/admin OU se o campo company coincidir com empresa_id do usuário logado
    // (ou for vazio durante transição/criação)
    var ruleCompany =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || company = @request.auth.empresa_id || (company = '' && @request.auth.empresa_id = ''))"
    var ruleCompanyWrite =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || company = @request.auth.empresa_id || company = '')"

    // Regra RLS para coleções com campo "empresa"
    var ruleEmpresa =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa = @request.auth.empresa_id || (empresa = '' && @request.auth.empresa_id = ''))"
    var ruleEmpresaWrite =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa = @request.auth.empresa_id || empresa = '')"

    // 1. Coleções operacionais com campo 'company'
    var collectionsCompany = [
      'sales_orders',
      'sales_invoices',
      'nfe_records',
      'purchase_requests',
      'purchase_orders',
      'stock_expeditions',
      'sales_returns',
    ]

    for (var i = 0; i < collectionsCompany.length; i++) {
      var nameC = collectionsCompany[i]
      try {
        var colC = app.findCollectionByNameOrId(nameC)
        if (colC) {
          colC.listRule = ruleCompany
          colC.viewRule = ruleCompany
          colC.createRule = ruleCompanyWrite
          colC.updateRule = ruleCompanyWrite
          app.save(colC)
        }
      } catch (errC) {
        console.log('RLS update for ' + nameC + ' notice:', errC)
      }
    }

    // 2. Coleções operacionais com campo 'empresa'
    var collectionsEmpresa = [
      // Financeiro
      'financial_receivables',
      'financial_payables',
      'financial_movements',
      'financial_collections',
      'financial_cash_registers',
      'financial_approvals',
      'financial_closings',
      'financial_boletos',
      'financial_pix',
      'financial_cards',
      // RH & DP
      'rh_employees',
      'rh_departments',
      'rh_payroll',
      'dp_admissions',
      'dp_work_contracts',
      'dp_labor_charges',
      // WMS
      'wms_receipts',
      'wms_putaway_tasks',
      'wms_waves',
      'wms_replenishments',
      // Logística
      'logistics_routes',
      'logistics_deliveries',
      'logistics_freights',
      'logistics_costs',
    ]

    for (var j = 0; j < collectionsEmpresa.length; j++) {
      var nameE = collectionsEmpresa[j]
      try {
        var colE = app.findCollectionByNameOrId(nameE)
        if (colE) {
          colE.listRule = ruleEmpresa
          colE.viewRule = ruleEmpresa
          colE.createRule = ruleEmpresaWrite
          colE.updateRule = ruleEmpresaWrite
          app.save(colE)
        }
      } catch (errE) {
        console.log('RLS update for ' + nameE + ' notice:', errE)
      }
    }
  },
  (app) => {
    // Reversão permissiva caso seja necessário reverter
    var fallbackRule = "@request.auth.id != ''"
    var allCols = [
      'sales_orders',
      'sales_invoices',
      'nfe_records',
      'purchase_requests',
      'purchase_orders',
      'stock_expeditions',
      'sales_returns',
      'financial_receivables',
      'financial_payables',
      'financial_movements',
      'financial_collections',
      'financial_cash_registers',
      'financial_approvals',
      'financial_closings',
      'financial_boletos',
      'financial_pix',
      'financial_cards',
      'rh_employees',
      'rh_departments',
      'rh_payroll',
      'dp_admissions',
      'dp_work_contracts',
      'dp_labor_charges',
      'wms_receipts',
      'wms_putaway_tasks',
      'wms_waves',
      'wms_replenishments',
      'logistics_routes',
      'logistics_deliveries',
      'logistics_freights',
      'logistics_costs',
    ]
    for (var i = 0; i < allCols.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(allCols[i])
        if (col) {
          col.listRule = fallbackRule
          col.viewRule = fallbackRule
          app.save(col)
        }
      } catch (_) {}
    }
  },
)

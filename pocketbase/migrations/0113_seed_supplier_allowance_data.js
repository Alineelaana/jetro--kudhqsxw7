migrate(
  (app) => {
    var supplier = null
    try {
      supplier = app.findFirstRecordByData(
        'partners',
        'full_name',
        'Gran Romano Indústria de Alimentos',
      )
    } catch (_) {}
    if (!supplier) {
      var partnersCol = app.findCollectionByNameOrId('partners')
      supplier = new Record(partnersCol)
      supplier.set('full_name', 'Gran Romano Indústria de Alimentos')
      supplier.set('company_name', 'Gran Romano Indústria de Alimentos LTDA')
      supplier.set('partner_type', 'Fornecedor')
      supplier.set('person_type', 'PJ')
      supplier.set('cnpj', '12.345.678/0001-90')
      supplier.set('email', 'compras@granromano.com.br')
      supplier.set('phone', '(27) 3333-4444')
      supplier.set('active', true)
      app.save(supplier)
    }

    var agCol = app.findCollectionByNameOrId('supplier_allowance_agreements')
    var ag1 = null
    try {
      ag1 = app.findFirstRecordByFilter(
        'supplier_allowance_agreements',
        'supplier = "' + supplier.id + '" && agreement_type = "rebate"',
      )
    } catch (_) {}
    if (!ag1) {
      ag1 = new Record(agCol)
      ag1.set('supplier', supplier.id)
      ag1.set('agreement_type', 'rebate')
      ag1.set('value', '50000')
      ag1.set('percent', '2')
      ag1.set('currency', 'BRL')
      ag1.set('start_date', '2026-01-01')
      ag1.set('end_date', '2026-12-31')
      ag1.set('status', 'ativo')
      ag1.set('workflow_state', 'active')
      ag1.set('company', 'Velora Log')
      ag1.set('branch', 'Matriz')
      ag1.set('responsible_user', 'Admin')
      ag1.set('approval_data', JSON.stringify({}))
      ag1.set('history', JSON.stringify([]))
      ag1.set('observations', 'Acordo de rebate sobre volume de compras')
      app.save(ag1)
    }

    var ag2 = null
    try {
      ag2 = app.findFirstRecordByFilter(
        'supplier_allowance_agreements',
        'supplier = "' + supplier.id + '" && agreement_type = "coop"',
      )
    } catch (_) {}
    if (!ag2) {
      ag2 = new Record(agCol)
      ag2.set('supplier', supplier.id)
      ag2.set('agreement_type', 'coop')
      ag2.set('value', '15000')
      ag2.set('percent', '0.5')
      ag2.set('currency', 'BRL')
      ag2.set('start_date', '2026-03-01')
      ag2.set('end_date', '2026-09-30')
      ag2.set('status', 'ativo')
      ag2.set('workflow_state', 'active')
      ag2.set('company', 'Velora Log')
      ag2.set('branch', 'Matriz')
      ag2.set('responsible_user', 'Admin')
      ag2.set('approval_data', JSON.stringify({}))
      ag2.set('history', JSON.stringify([]))
      ag2.set('observations', 'Verba de cooperação marketing')
      app.save(ag2)
    }

    var accCol = app.findCollectionByNameOrId('supplier_allowance_accounts')
    var acc1 = null
    try {
      acc1 = app.findFirstRecordByFilter(
        'supplier_allowance_accounts',
        'agreement = "' + ag1.id + '"',
      )
    } catch (_) {}
    if (!acc1) {
      acc1 = new Record(accCol)
      acc1.set('supplier', supplier.id)
      acc1.set('agreement', ag1.id)
      acc1.set('opening_balance', '0')
      acc1.set('current_balance', '850')
      acc1.set('accrued_total', '1000')
      acc1.set('settled_total', '150')
      acc1.set('consumed_total', '0')
      acc1.set('company', 'Velora Log')
      acc1.set('branch', 'Matriz')
      app.save(acc1)
    }

    var movCol = app.findCollectionByNameOrId('supplier_allowance_movements')
    try {
      app.findFirstRecordByFilter(
        'supplier_allowance_movements',
        'account = "' + acc1.id + '" && movement_type = "apuracao"',
      )
    } catch (_) {
      var mov = new Record(movCol)
      mov.set('account', acc1.id)
      mov.set('agreement', ag1.id)
      mov.set('movement_type', 'apuracao')
      mov.set('direction', 'credito')
      mov.set('value', '1000')
      mov.set('currency', 'BRL')
      mov.set('document_type', 'apuracao')
      mov.set('document_number', 'AP-2026-001')
      mov.set('user', 'Sistema')
      mov.set('timestamp', new Date().toISOString())
      mov.set('workflow_state', 'completed')
      mov.set('source', 'sistema')
      mov.set('observations', 'Apuração de rebate Jan/2026')
      app.save(mov)
    }

    try {
      app.findFirstRecordByFilter(
        'supplier_allowance_movements',
        'account = "' + acc1.id + '" && movement_type = "consumo"',
      )
    } catch (_) {
      var mov2 = new Record(movCol)
      mov2.set('account', acc1.id)
      mov2.set('agreement', ag1.id)
      mov2.set('movement_type', 'consumo')
      mov2.set('direction', 'debito')
      mov2.set('value', '150')
      mov2.set('currency', 'BRL')
      mov2.set('document_type', 'consumo')
      mov2.set('document_number', 'CS-2026-001')
      mov2.set('user', 'Sistema')
      mov2.set('timestamp', new Date().toISOString())
      mov2.set('workflow_state', 'completed')
      mov2.set('source', 'sistema')
      mov2.set('observations', 'Consumo de verba - pedido PC-001')
      app.save(mov2)
    }

    var acrCol = app.findCollectionByNameOrId('supplier_allowance_accruals')
    try {
      app.findFirstRecordByFilter('supplier_allowance_accruals', 'account = "' + acc1.id + '"')
    } catch (_) {
      var acr = new Record(acrCol)
      acr.set('account', acc1.id)
      acr.set('agreement', ag1.id)
      acr.set('supplier', supplier.id)
      acr.set('competence_period', '2026-01')
      acr.set('volume', '50000')
      acr.set('mix', '5')
      acr.set('margin', '22')
      acr.set('earned_value', '1000')
      acr.set(
        'calculation_breakdown',
        JSON.stringify({ base: '50000', rate: '2%', result: '1000' }),
      )
      acr.set('status', 'aprovado')
      acr.set('approved_by', 'Admin')
      acr.set('approved_at', new Date().toISOString())
      acr.set('history', JSON.stringify([]))
      app.save(acr)
    }

    var agentTools = [
      { collection: 'partners', perms: { list: true, read: true }, actAs: 'admin' },
      {
        collection: 'supplier_allowance_agreements',
        perms: { list: true, read: true },
        actAs: 'admin',
      },
      {
        collection: 'supplier_allowance_accounts',
        perms: { list: true, read: true },
        actAs: 'admin',
      },
      {
        collection: 'supplier_allowance_movements',
        perms: { list: true, read: true },
        actAs: 'admin',
      },
      {
        collection: 'supplier_allowance_accruals',
        perms: { list: true, read: true },
        actAs: 'admin',
      },
      {
        collection: 'supplier_allowance_appropriations',
        perms: { list: true, read: true },
        actAs: 'admin',
      },
      {
        collection: 'supplier_allowance_consumptions',
        perms: { list: true, read: true },
        actAs: 'admin',
      },
      {
        collection: 'supplier_allowance_settlements',
        perms: { list: true, read: true },
        actAs: 'admin',
      },
      { collection: 'purchase_orders', perms: { list: true, read: true }, actAs: 'admin' },
    ]

    try {
      app.findCollectionByNameOrId('financial_payables')
      agentTools.push({
        collection: 'financial_payables',
        perms: { list: true, read: true },
        actAs: 'admin',
      })
    } catch (_) {}
    try {
      app.findCollectionByNameOrId('promotion_rules')
      agentTools.push({
        collection: 'promotion_rules',
        perms: { list: true, read: true },
        actAs: 'admin',
      })
    } catch (_) {}

    $ai.agents.define(app, {
      slug: 'adapta-verbas-fornecedores',
      name: 'ADAPTA — Verbas de Fornecedores',
      description: 'Assistente especializado em verbas de fornecedores.',
      systemPrompt:
        'Voce e a ADAPTA Verbas de Fornecedores, assistente especializada em gestao de verbas de fornecedores do ERP VeloraLog. Responda APENAS com base em dados reais das colecoes de verbas. Sempre cite a fonte dos dados (nome da colecao e registros consultados). Se nao houver dados suficientes, declare explicitamente. Estruture respostas em topicos claros. Use formatacao markdown.',
      tier: 'fast',
      tools: agentTools,
      memory: [
        {
          type: 'text',
          payload: {
            text: 'A ADAPTA Verbas de Fornecedores e especializada em analise de acordos de verba, contas correntes, apuracoes, apropriacoes, liquidacoes e consumo de verbas. Responde sobre saldos, historicos, projecoes, status de aprovacoes e integracoes com compras, financeiro e promocoes.',
          },
        },
      ],
    })

    console.log('0113: Supplier Allowance seed data + ADAPTA agent created')
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'adapta-verbas-fornecedores')
    } catch (_) {}
    var cols = [
      'supplier_allowance_accruals',
      'supplier_allowance_movements',
      'supplier_allowance_accounts',
      'supplier_allowance_agreements',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        var recs = app.findRecordsByFilter(cols[i], "id != ''", '-created', 100, 0)
        for (var j = 0; j < recs.length; j++) {
          try {
            app.delete(recs[j])
          } catch (_) {}
        }
      } catch (_) {}
    }
  },
)

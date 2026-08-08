migrate(
  (app) => {
    var accountsId = app.findCollectionByNameOrId('supplier_allowance_accounts').id
    var agreementsId = app.findCollectionByNameOrId('supplier_allowance_agreements').id
    var partnersId = app.findCollectionByNameOrId('partners').id

    var agreementId = ''
    var accountId = ''
    var supplierId = ''
    try {
      var ag = app.findFirstRecordByFilter(
        'supplier_allowance_agreements',
        'agreement_type = "rebate"',
      )
      agreementId = ag.id
    } catch (_) {}
    try {
      var acc = app.findFirstRecordByFilter('supplier_allowance_accounts', 'agreement != ""')
      accountId = acc.id
    } catch (_) {}
    try {
      var sup = app.findFirstRecordByData(
        'partners',
        'full_name',
        'Gran Romano Indústria de Alimentos',
      )
      supplierId = sup.id
    } catch (_) {}

    var teCol = app.findCollectionByNameOrId('supplier_allowance_trade_expenses')
    try {
      app.findFirstRecordByData(
        'supplier_allowance_trade_expenses',
        'description',
        'Material de PDV - Campanha Verão',
      )
    } catch (_) {
      var te = new Record(teCol)
      te.set('account', accountId)
      te.set('agreement', agreementId)
      te.set('supplier', supplierId)
      te.set('description', 'Material de PDV - Campanha Verão')
      te.set('amount', '3500')
      te.set('expense_date', '2026-08-05')
      te.set('category', 'pdv')
      te.set('status', 'aprovado')
      te.set('document_number', 'NF-2026-001')
      te.set('cost_center_code', 'CC-TRD-001')
      te.set('observations', 'Displays e banners para campanha de verão')
      te.set('responsible_user', 'Ana Costa')
      app.save(te)
    }

    try {
      app.findFirstRecordByData(
        'supplier_allowance_trade_expenses',
        'description',
        'Evento Lançamento Linha Premium',
      )
    } catch (_) {
      var te2 = new Record(teCol)
      te2.set('account', accountId)
      te2.set('agreement', agreementId)
      te2.set('supplier', supplierId)
      te2.set('description', 'Evento Lançamento Linha Premium')
      te2.set('amount', '12000')
      te2.set('expense_date', '2026-07-20')
      te2.set('category', 'evento')
      te2.set('status', 'pendente')
      te2.set('document_number', 'NF-2026-002')
      te2.set('cost_center_code', 'CC-MKT-001')
      te2.set('observations', 'Custos de evento de lançamento')
      te2.set('responsible_user', 'Marcos Silva')
      app.save(te2)
    }

    var acCol = app.findCollectionByNameOrId('supplier_allowance_adhoc_credits')
    try {
      app.findFirstRecordByData(
        'supplier_allowance_adhoc_credits',
        'description',
        'Crédito bonificação extra',
      )
    } catch (_) {
      var ac = new Record(acCol)
      ac.set('account', accountId)
      ac.set('agreement', agreementId)
      ac.set('supplier', supplierId)
      ac.set('description', 'Crédito bonificação extra')
      ac.set('amount', '500')
      ac.set('credit_date', '2026-07-15')
      ac.set('reason', 'Bonificação por meta de volume excedida')
      ac.set('status', 'creditado')
      ac.set('approved_by', 'Admin')
      ac.set('approved_at', '2026-07-15T10:00:00Z')
      ac.set('observations', 'Crédito concedido por exceder meta trimestral')
      ac.set('responsible_user', 'Admin')
      app.save(ac)
    }

    try {
      app.findFirstRecordByData(
        'supplier_allowance_adhoc_credits',
        'description',
        'Ajuste de saldo inicial',
      )
    } catch (_) {
      var ac2 = new Record(acCol)
      ac2.set('account', accountId)
      ac2.set('agreement', agreementId)
      ac2.set('supplier', supplierId)
      ac2.set('description', 'Ajuste de saldo inicial')
      ac2.set('amount', '200')
      ac2.set('credit_date', '2026-01-05')
      ac2.set('reason', 'Ajuste manual de abertura')
      ac2.set('status', 'pendente')
      ac2.set('observations', 'Ajuste de saldo inicial de conta')
      ac2.set('responsible_user', 'Admin')
      app.save(ac2)
    }

    var rvCol = app.findCollectionByNameOrId('supplier_allowance_report_versions')
    try {
      app.findFirstRecordByData(
        'supplier_allowance_report_versions',
        'report_type',
        'conta_corrente',
      )
    } catch (_) {
      var rv = new Record(rvCol)
      rv.set('report_type', 'conta_corrente')
      rv.set('version_number', 1)
      rv.set('version_data', { period: '2026-01', accounts: 1, total_balance: '850' })
      rv.set('label', 'Relatório de Conta Corrente - Jan/2026')
      rv.set('published_at', '2026-02-01T10:00:00Z')
      rv.set('status', 'publicado')
      rv.set('description', 'Versão inicial do relatório de conta corrente')
      app.save(rv)
    }

    try {
      app.findFirstRecordByData(
        'supplier_allowance_report_versions',
        'report_type',
        'prestacao_contas',
      )
    } catch (_) {
      var rv2 = new Record(rvCol)
      rv2.set('report_type', 'prestacao_contas')
      rv2.set('version_number', 1)
      rv2.set('version_data', { period: '2026-Q1', agreements: 2, total_settled: '150' })
      rv2.set('label', 'Prestação de Contas Q1/2026')
      rv2.set('published_at', '2026-04-05T14:00:00Z')
      rv2.set('status', 'publicado')
      rv2.set('description', 'Relatório trimestral de prestação de contas')
      app.save(rv2)
    }

    console.log('0134: Verbas new collections seeded')
  },
  (app) => {
    var cols = [
      'supplier_allowance_trade_expenses',
      'supplier_allowance_adhoc_credits',
      'supplier_allowance_report_versions',
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

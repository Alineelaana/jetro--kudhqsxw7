routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/alerts-check',
  (e) => {
    var alertsCreated = 0
    var now = new Date()
    var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    var sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    var accounts = []
    try {
      accounts = $app.findRecordsByFilter(
        'supplier_allowance_accounts',
        "id != ''",
        '-created',
        500,
        0,
      )
    } catch (_) {}

    var agreements = []
    try {
      agreements = $app.findRecordsByFilter(
        'supplier_allowance_agreements',
        "id != ''",
        '-created',
        500,
        0,
      )
    } catch (_) {}

    var notifCol = $app.findCollectionByNameOrId('notifications')

    function createAlert(title, message, notifType) {
      try {
        var n = new Record(notifCol)
        n.set('title', title)
        n.set('message', message)
        n.set('type', notifType || 'other')
        n.set('read', false)
        n.set('link', '/admin/verbas/auditoria-corporativa')
        $app.saveNoValidate(n)
        alertsCreated++
      } catch (_) {}
    }

    for (var i = 0; i < accounts.length; i++) {
      var acc = accounts[i]
      var balance = parseFloat(acc.getString('current_balance') || '0')
      var minAlert = parseFloat(acc.getString('min_balance_alert') || '0')
      var blockedAmt = parseFloat(acc.getString('blocked_amount') || '0')

      if (minAlert > 0 && balance < minAlert) {
        createAlert(
          'Saldo Inferior ao Limite',
          'Conta ' +
            acc.id.substring(0, 8) +
            ' com saldo R$ ' +
            balance +
            ' abaixo do limite R$ ' +
            minAlert,
          'other',
        )
      }
      if (blockedAmt > 0) {
        createAlert(
          'Saldo Bloqueado',
          'Conta ' + acc.id.substring(0, 8) + ' possui R$ ' + blockedAmt + ' bloqueado',
          'other',
        )
      }

      var lastMov = acc.getString('updated') || ''
      if (lastMov) {
        var lastDate = new Date(lastMov)
        if (lastDate < sixtyDaysAgo) {
          createAlert(
            'Fornecedor com Verba Parada',
            'Conta ' + acc.id.substring(0, 8) + ' sem movimentacao ha mais de 60 dias',
            'other',
          )
        }
      }
    }

    for (var j = 0; j < agreements.length; j++) {
      var ag = agreements[j]
      var endDate = ag.getString('end_date')
      var status = ag.getString('status')

      if (endDate && status === 'ativo') {
        var end = new Date(endDate)
        var diffDays = Math.floor((end - now) / (1000 * 60 * 60 * 24))
        if (diffDays <= 30 && diffDays >= 0) {
          createAlert(
            'Programa Vencendo',
            'Acordo ' + ag.id.substring(0, 8) + ' vence em ' + diffDays + ' dias',
            'other',
          )
        }
        if (diffDays < 0) {
          createAlert(
            'Programa Vencido',
            'Acordo ' + ag.id.substring(0, 8) + ' esta vencido',
            'other',
          )
        }
      }

      var agValue = parseFloat(ag.getString('value') || '0')
      if (agValue > 0 && status === 'ativo') {
        var agAccrued = 0
        try {
          var accs = $app.findRecordsByFilter(
            'supplier_allowance_accounts',
            'agreement = "' + ag.id + '"',
            '-created',
            1,
            0,
          )
          if (accs.length > 0) {
            agAccrued = parseFloat(accs[0].getString('consumed_total') || '0')
          }
        } catch (_) {}
        if (agAccrued > agValue) {
          createAlert(
            'Programa Acima do Orcamento',
            'Acordo ' +
              ag.id.substring(0, 8) +
              ' consumiu R$ ' +
              agAccrued +
              ' acima do valor R$ ' +
              agValue,
            'other',
          )
        }
      }
    }

    return e.json(200, { status: 'ok', alerts_created: alertsCreated })
  },
  $apis.requireAuth(),
)

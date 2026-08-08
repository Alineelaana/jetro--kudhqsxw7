routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/appropriate',
  (e) => {
    var body = e.requestInfo().body || {}
    var accrualId = body.accrual_id || ''
    var allocatedValue = body.allocated_value || '0'
    var productId = body.product_id || ''
    var costCenterId = body.cost_center_id || ''
    var reason = body.reason || ''

    if (!accrualId) return e.badRequestError('accrual_id is required')

    try {
      var accrual = $app.findRecordById('supplier_allowance_accruals', accrualId)
      var accountId = accrual.getString('account')
      var allocatedNum = parseFloat(allocatedValue || '0')

      if (isNaN(allocatedNum) || allocatedNum <= 0) {
        return e.badRequestError('Valor alocado deve ser maior que zero.')
      }

      var account = $app.findRecordById('supplier_allowance_accounts', accountId)
      var availableBalance = parseFloat(account.getString('current_balance') || '0')

      if (allocatedNum > availableBalance) {
        return e.badRequestError(
          'Saldo insuficiente para aplicacao em precos. Disponivel: R$ ' +
            availableBalance +
            '. Solicitado: R$ ' +
            allocatedNum +
            '. Operacao BLOQUEADA pelo Corporate Ledger.',
        )
      }

      var accStatus = accrual.getString('status')
      if (accStatus !== 'aprovado') {
        return e.badRequestError(
          'Apuracao nao aprovada. Verba nao pode ser aplicada antes da aprovacao. Operacao BLOQUEADA.',
        )
      }

      var appCol = $app.findCollectionByNameOrId('supplier_allowance_appropriations')
      var appropriation = new Record(appCol)
      appropriation.set('account', accountId)
      appropriation.set('accrual', accrualId)
      if (productId) appropriation.set('product', productId)
      if (costCenterId) appropriation.set('cost_center', costCenterId)
      appropriation.set('allocated_value', allocatedValue)
      appropriation.set('reason', reason)
      appropriation.set('status', 'pendente')
      $app.save(appropriation)

      return e.json(200, { status: 'ok', appropriation_id: appropriation.id })
    } catch (err) {
      return e.json(500, { error: 'Appropriation failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)

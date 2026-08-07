routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/consume',
  (e) => {
    var body = e.requestInfo().body || {}
    var accountId = body.account_id || ''
    var agreementId = body.agreement_id || ''
    var consumedValue = body.consumed_value || '0'
    var reason = body.reason || ''
    var purchaseId = body.purchase_id || ''
    var promotionId = body.promotion_id || ''

    if (!accountId) return e.badRequestError('account_id is required')
    if (!agreementId) return e.badRequestError('agreement_id is required')

    try {
      var account = $app.findRecordById('supplier_allowance_accounts', accountId)
      var currentBalance = parseFloat(account.getString('current_balance') || '0')
      var consumed = parseFloat(consumedValue)

      if (consumed > currentBalance) {
        return e.badRequestError('Saldo insuficiente. Disponível: ' + currentBalance)
      }

      var conCol = $app.findCollectionByNameOrId('supplier_allowance_consumptions')
      var consumption = new Record(conCol)
      consumption.set('account', accountId)
      consumption.set('agreement', agreementId)
      if (purchaseId) consumption.set('purchase', purchaseId)
      if (promotionId) consumption.set('promotion', promotionId)
      consumption.set('consumed_value', consumedValue)
      consumption.set('reason', reason)
      consumption.set('status', 'aprovado')
      $app.save(consumption)

      var movCol = $app.findCollectionByNameOrId('supplier_allowance_movements')
      var mov = new Record(movCol)
      mov.set('account', accountId)
      mov.set('agreement', agreementId)
      mov.set('movement_type', 'consumo')
      mov.set('direction', 'debito')
      mov.set('value', consumedValue)
      mov.set('currency', 'BRL')
      mov.set('document_type', 'consumo')
      mov.set('document_number', 'CS-' + consumption.id.substring(0, 8))
      if (purchaseId) mov.set('related_purchase', purchaseId)
      if (promotionId) mov.set('related_promotion', promotionId)
      mov.set('user', e.auth ? e.auth.email : 'sistema')
      mov.set('timestamp', new Date().toISOString())
      mov.set('workflow_state', 'completed')
      mov.set('source', 'usuario')
      mov.set('observations', reason)
      $app.save(mov)

      return e.json(200, {
        status: 'ok',
        consumption_id: consumption.id,
        remaining_balance: currentBalance - consumed,
      })
    } catch (err) {
      return e.json(500, { error: 'Consumption failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)

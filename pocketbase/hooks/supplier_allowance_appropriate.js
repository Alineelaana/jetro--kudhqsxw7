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

routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/settle',
  (e) => {
    var body = e.requestInfo().body || {}
    var accrualId = body.accrual_id || ''
    var settlementType = body.settlement_type || 'credito'
    var payableId = body.payable_id || ''

    if (!accrualId) return e.badRequestError('accrual_id is required')

    try {
      var accrual = $app.findRecordById('supplier_allowance_accruals', accrualId)
      var accountId = accrual.getString('account')
      var supplierId = accrual.getString('supplier')
      var settledValue = parseFloat(accrual.getString('earned_value') || '0')

      var account = $app.findRecordById('supplier_allowance_accounts', accountId)

      var setCol = $app.findCollectionByNameOrId('supplier_allowance_settlements')
      var settlement = new Record(setCol)
      settlement.set('account', accountId)
      settlement.set('accrual', accrualId)
      settlement.set('supplier', supplierId)
      settlement.set('settled_value', String(settledValue))
      settlement.set('settlement_type', settlementType)
      if (payableId) settlement.set('payable', payableId)
      settlement.set('workflow_state', 'pending_approval')
      settlement.set('status', 'pendente')
      settlement.set('history', [
        {
          action: 'created',
          user: e.auth ? e.auth.email : 'sistema',
          date: new Date().toISOString(),
          notes: 'Liquidação criada',
        },
      ])
      $app.save(settlement)

      var notifCol = $app.findCollectionByNameOrId('notifications')
      var notif = new Record(notifCol)
      notif.set('title', 'Liquidação de Verba Pendente')
      notif.set('message', 'Liquidação de R$ ' + settledValue + ' aguardando aprovação')
      notif.set('type', 'approval_pending')
      notif.set('read', false)
      notif.set('link', '/admin/verbas/liquidacoes')
      $app.save(notif)

      return e.json(200, {
        status: 'ok',
        settlement_id: settlement.id,
        settled_value: settledValue,
      })
    } catch (err) {
      return e.json(500, { error: 'Settlement failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)

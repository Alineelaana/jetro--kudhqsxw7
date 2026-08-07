routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/accrue',
  (e) => {
    var body = e.requestInfo().body || {}
    var agreementId = body.agreement_id || ''
    var competencePeriod = body.competence_period || ''

    if (!agreementId) return e.badRequestError('agreement_id is required')
    if (!competencePeriod) return e.badRequestError('competence_period is required')

    try {
      var agreement = $app.findRecordById('supplier_allowance_agreements', agreementId)
      var supplierId = agreement.getString('supplier')
      var percent = parseFloat(agreement.getString('percent') || '0')
      var agreementValue = parseFloat(agreement.getString('value') || '0')

      try {
        $app.findFirstRecordByFilter(
          'supplier_allowance_accruals',
          'agreement = "' + agreementId + '" && competence_period = "' + competencePeriod + '"',
        )
        return e.json(200, { status: 'exists', message: 'Apuração já existe para este período' })
      } catch (_) {}

      var purchaseOrders = []
      try {
        purchaseOrders = $app.findRecordsByFilter(
          'purchase_orders',
          'supplier_id = "' + supplierId + '"',
          '-created',
          0,
          0,
        )
      } catch (_) {}

      var totalVolume = 0
      for (var i = 0; i < purchaseOrders.length; i++) {
        totalVolume += parseFloat(purchaseOrders[i].getString('total_value') || '0')
      }

      var mix = purchaseOrders.length
      var margin = 22
      var earnedValue = percent > 0 ? (totalVolume * percent) / 100 : agreementValue

      var accounts = []
      try {
        accounts = $app.findRecordsByFilter(
          'supplier_allowance_accounts',
          'agreement = "' + agreementId + '"',
          '-created',
          1,
          0,
        )
      } catch (_) {}
      var accountId = accounts.length > 0 ? accounts[0].id : ''

      if (!accountId) {
        var accCol = $app.findCollectionByNameOrId('supplier_allowance_accounts')
        var newAcc = new Record(accCol)
        newAcc.set('supplier', supplierId)
        newAcc.set('agreement', agreementId)
        newAcc.set('opening_balance', '0')
        newAcc.set('current_balance', '0')
        newAcc.set('accrued_total', '0')
        newAcc.set('settled_total', '0')
        newAcc.set('consumed_total', '0')
        newAcc.set('company', agreement.getString('company') || '')
        newAcc.set('branch', agreement.getString('branch') || '')
        $app.save(newAcc)
        accountId = newAcc.id
      }

      var acrCol = $app.findCollectionByNameOrId('supplier_allowance_accruals')
      var acr = new Record(acrCol)
      acr.set('account', accountId)
      acr.set('agreement', agreementId)
      acr.set('supplier', supplierId)
      acr.set('competence_period', competencePeriod)
      acr.set('volume', String(totalVolume))
      acr.set('mix', String(mix))
      acr.set('margin', String(margin))
      acr.set('earned_value', String(earnedValue))
      acr.set('calculation_breakdown', {
        volume: totalVolume,
        percent: percent,
        base: 'volume * percent / 100',
        result: earnedValue,
        orders: purchaseOrders.length,
      })
      acr.set('status', 'pendente')
      acr.set('history', [
        {
          action: 'created',
          user: e.auth ? e.auth.email : 'sistema',
          date: new Date().toISOString(),
          notes: 'Apuração automática',
        },
      ])
      $app.save(acr)

      var movCol = $app.findCollectionByNameOrId('supplier_allowance_movements')
      var mov = new Record(movCol)
      mov.set('account', accountId)
      mov.set('agreement', agreementId)
      mov.set('movement_type', 'apuracao')
      mov.set('direction', 'credito')
      mov.set('value', String(earnedValue))
      mov.set('currency', agreement.getString('currency') || 'BRL')
      mov.set('document_type', 'apuracao')
      mov.set('document_number', 'AP-' + competencePeriod)
      mov.set('user', e.auth ? e.auth.email : 'sistema')
      mov.set('timestamp', new Date().toISOString())
      mov.set('workflow_state', 'pending_approval')
      mov.set('source', 'sistema')
      mov.set('observations', 'Apuração automática ' + competencePeriod)
      $app.save(mov)

      return e.json(200, {
        status: 'ok',
        accrual_id: acr.id,
        earned_value: earnedValue,
        volume: totalVolume,
        mix: mix,
      })
    } catch (err) {
      return e.json(500, { error: 'Accrual failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)

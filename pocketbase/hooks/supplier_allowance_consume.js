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
    var program = body.program || ''
    var competencePeriod = body.competence_period || ''

    if (!accountId) return e.badRequestError('account_id is required')
    if (!agreementId) return e.badRequestError('agreement_id is required')

    try {
      var account = $app.findRecordById('supplier_allowance_accounts', accountId)
      var currentBalance = parseFloat(account.getString('current_balance') || '0')
      var consumed = parseFloat(consumedValue)

      if (isNaN(consumed) || consumed <= 0) {
        return e.badRequestError('Valor de consumo deve ser maior que zero.')
      }

      if (consumed > currentBalance) {
        return e.badRequestError(
          'Saldo insuficiente. Disponivel: R$ ' +
            currentBalance +
            '. Operacao BLOQUEADA pelo Corporate Ledger.',
        )
      }

      if (program) {
        var accountProgram = account.getString('program') || ''
        if (accountProgram && accountProgram !== program) {
          return e.badRequestError(
            'Programa nao corresponde a conta. Nao e possivel consumir saldo de outro programa. Operacao BLOQUEADA.',
          )
        }
      }

      try {
        var agreement = $app.findRecordById('supplier_allowance_agreements', agreementId)
        var agSupplier = agreement.getString('supplier')
        var accSupplier = account.getString('supplier')
        if (agSupplier && accSupplier && agSupplier !== accSupplier) {
          return e.badRequestError(
            'Fornecedor do acordo nao corresponde ao fornecedor da conta. ' +
              'Nao e possivel consumir saldo de outro fornecedor. Operacao BLOQUEADA.',
          )
        }
      } catch (_) {}

      if (competencePeriod) {
        var now = new Date()
        var currentPeriod = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
        if (competencePeriod > currentPeriod) {
          return e.badRequestError(
            'Nao e possivel utilizar verba de competencia futura. Operacao BLOQUEADA.',
          )
        }
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
      if (program) mov.set('program', program)
      if (competencePeriod) mov.set('competence_period', competencePeriod)
      if (body.category) mov.set('category', body.category)
      if (body.buyer_name) mov.set('buyer_name', body.buyer_name)
      if (body.brand) mov.set('brand', body.brand)
      if (body.product_name) mov.set('product_name', body.product_name)
      if (body.supplier_name) mov.set('supplier_name', body.supplier_name)
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

onRecordAfterCreateSuccess((e) => {
  var accountId = e.record.getString('account')
  var direction = e.record.getString('direction')
  var value = parseFloat(e.record.getString('value') || '0')

  try {
    var account = $app.findRecordById('supplier_allowance_accounts', accountId)
    var currentBalance = parseFloat(account.getString('current_balance') || '0')
    var newBalance = direction === 'credito' ? currentBalance + value : currentBalance - value
    account.set('current_balance', String(newBalance))

    if (direction === 'credito') {
      var accrued = parseFloat(account.getString('accrued_total') || '0')
      account.set('accrued_total', String(accrued + value))
    } else {
      var consumed = parseFloat(account.getString('consumed_total') || '0')
      account.set('consumed_total', String(consumed + value))
    }

    $app.save(account)
  } catch (err) {
    $app.logger().error('SA: Failed to update account balance', 'error', String(err))
  }

  return e.next()
}, 'supplier_allowance_movements')

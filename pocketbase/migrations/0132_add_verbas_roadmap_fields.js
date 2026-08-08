migrate(
  (app) => {
    var accountsCol = app.findCollectionByNameOrId('supplier_allowance_accounts')
    var accountsFields = [
      { name: 'blocked', type: 'bool' },
      { name: 'block_reason', type: 'text' },
      { name: 'block_date', type: 'text' },
      { name: 'blocked_by', type: 'text' },
      { name: 'reconciliation_status', type: 'text' },
      { name: 'last_reconciled_at', type: 'text' },
    ]
    for (var i = 0; i < accountsFields.length; i++) {
      if (!accountsCol.fields.getByName(accountsFields[i].name)) {
        if (accountsFields[i].type === 'bool') {
          accountsCol.fields.add(new BoolField({ name: accountsFields[i].name }))
        } else {
          accountsCol.fields.add(new TextField({ name: accountsFields[i].name }))
        }
      }
    }
    app.save(accountsCol)

    var movementsCol = app.findCollectionByNameOrId('supplier_allowance_movements')
    var movementFields = [
      { name: 'cost_center_code', type: 'text' },
      { name: 'department', type: 'text' },
      { name: 'project_code', type: 'text' },
      { name: 'reconciliation_status', type: 'text' },
      { name: 'reconciled_at', type: 'text' },
      { name: 'reconciled_by', type: 'text' },
    ]
    for (var j = 0; j < movementFields.length; j++) {
      if (!movementsCol.fields.getByName(movementFields[j].name)) {
        movementsCol.fields.add(new TextField({ name: movementFields[j].name }))
      }
    }
    app.save(movementsCol)

    var agreementsCol = app.findCollectionByNameOrId('supplier_allowance_agreements')
    var agreementFields = [
      { name: 'contract_number', type: 'text' },
      { name: 'payment_terms', type: 'text' },
      { name: 'settlement_frequency', type: 'text' },
      { name: 'minimum_volume', type: 'text' },
      { name: 'maximum_volume', type: 'text' },
      { name: 'tax_retention', type: 'text' },
    ]
    for (var k = 0; k < agreementFields.length; k++) {
      if (!agreementsCol.fields.getByName(agreementFields[k].name)) {
        agreementsCol.fields.add(new TextField({ name: agreementFields[k].name }))
      }
    }
    app.save(agreementsCol)

    console.log('0132: Verbas roadmap fields added to existing collections')
  },
  (app) => {
    var accountsCol = app.findCollectionByNameOrId('supplier_allowance_accounts')
    var accRemove = [
      'blocked',
      'block_reason',
      'block_date',
      'blocked_by',
      'reconciliation_status',
      'last_reconciled_at',
    ]
    for (var i = 0; i < accRemove.length; i++) {
      var f = accountsCol.fields.getByName(accRemove[i])
      if (f) accountsCol.fields.remove(f)
    }
    app.save(accountsCol)

    var movementsCol = app.findCollectionByNameOrId('supplier_allowance_movements')
    var movRemove = [
      'cost_center_code',
      'department',
      'project_code',
      'reconciliation_status',
      'reconciled_at',
      'reconciled_by',
    ]
    for (var j = 0; j < movRemove.length; j++) {
      var f2 = movementsCol.fields.getByName(movRemove[j])
      if (f2) movementsCol.fields.remove(f2)
    }
    app.save(movementsCol)

    var agreementsCol = app.findCollectionByNameOrId('supplier_allowance_agreements')
    var agRemove = [
      'contract_number',
      'payment_terms',
      'settlement_frequency',
      'minimum_volume',
      'maximum_volume',
      'tax_retention',
    ]
    for (var k = 0; k < agRemove.length; k++) {
      var f3 = agreementsCol.fields.getByName(agRemove[k])
      if (f3) agreementsCol.fields.remove(f3)
    }
    app.save(agreementsCol)
  },
)

migrate(
  (app) => {
    var movCol = app.findCollectionByNameOrId('supplier_allowance_movements')
    var movFields = [
      'program',
      'campaign',
      'action_ref',
      'buyer_name',
      'sales_manager',
      'supervisor',
      'seller',
      'negotiation_responsible',
      'usage_responsible',
      'brand',
      'product_name',
      'result_center_code',
      'running_balance',
      'competence_period',
      'workflow_ref',
      'justification',
      'supplier_name',
      'claim_status',
      'receipt_status',
      'category',
    ]
    for (var i = 0; i < movFields.length; i++) {
      if (!movCol.fields.getByName(movFields[i])) {
        movCol.fields.add(new TextField({ name: movFields[i] }))
      }
    }
    app.save(movCol)

    var agCol = app.findCollectionByNameOrId('supplier_allowance_agreements')
    var agFields = ['program', 'buyer_name', 'sales_manager', 'supervisor', 'seller']
    for (var j = 0; j < agFields.length; j++) {
      if (!agCol.fields.getByName(agFields[j])) {
        agCol.fields.add(new TextField({ name: agFields[j] }))
      }
    }
    app.save(agCol)

    var accCol = app.findCollectionByNameOrId('supplier_allowance_accounts')
    var accFields = ['program', 'min_balance_alert', 'blocked_amount']
    for (var k = 0; k < accFields.length; k++) {
      if (!accCol.fields.getByName(accFields[k])) {
        accCol.fields.add(new TextField({ name: accFields[k] }))
      }
    }
    app.save(accCol)

    console.log('0135: Corporate Ledger extension fields added')
  },
  (app) => {
    var movCol = app.findCollectionByNameOrId('supplier_allowance_movements')
    var movRemove = [
      'program',
      'campaign',
      'action_ref',
      'buyer_name',
      'sales_manager',
      'supervisor',
      'seller',
      'negotiation_responsible',
      'usage_responsible',
      'brand',
      'product_name',
      'result_center_code',
      'running_balance',
      'competence_period',
      'workflow_ref',
      'justification',
      'supplier_name',
      'claim_status',
      'receipt_status',
      'category',
    ]
    for (var i = 0; i < movRemove.length; i++) {
      var f = movCol.fields.getByName(movRemove[i])
      if (f) movCol.fields.remove(f)
    }
    app.save(movCol)

    var agCol = app.findCollectionByNameOrId('supplier_allowance_agreements')
    var agRemove = ['program', 'buyer_name', 'sales_manager', 'supervisor', 'seller']
    for (var j = 0; j < agRemove.length; j++) {
      var f2 = agCol.fields.getByName(agRemove[j])
      if (f2) agCol.fields.remove(f2)
    }
    app.save(agCol)

    var accCol = app.findCollectionByNameOrId('supplier_allowance_accounts')
    var accRemove = ['program', 'min_balance_alert', 'blocked_amount']
    for (var k = 0; k < accRemove.length; k++) {
      var f3 = accCol.fields.getByName(accRemove[k])
      if (f3) accCol.fields.remove(f3)
    }
    app.save(accCol)
  },
)

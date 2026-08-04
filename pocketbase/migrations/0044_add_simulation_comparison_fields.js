migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pricing_simulations')

    if (!col.fields.getByName('current_price')) {
      col.fields.add(new TextField({ name: 'current_price' }))
    }
    if (!col.fields.getByName('difference_value')) {
      col.fields.add(new TextField({ name: 'difference_value' }))
    }
    if (!col.fields.getByName('difference_percent')) {
      col.fields.add(new TextField({ name: 'difference_percent' }))
    }
    if (!col.fields.getByName('cbs')) {
      col.fields.add(new TextField({ name: 'cbs' }))
    }
    if (!col.fields.getByName('ibs')) {
      col.fields.add(new TextField({ name: 'ibs' }))
    }
    if (!col.fields.getByName('selective_tax')) {
      col.fields.add(new TextField({ name: 'selective_tax' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('pricing_simulations')
    const names = [
      'current_price',
      'difference_value',
      'difference_percent',
      'cbs',
      'ibs',
      'selective_tax',
    ]
    for (var i = 0; i < names.length; i++) {
      try {
        var f = col.fields.getByName(names[i])
        if (f) col.fields.remove(f)
      } catch (_) {}
    }
    app.save(col)
  },
)

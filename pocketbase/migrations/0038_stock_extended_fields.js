migrate(
  (app) => {
    var expCol = app.findCollectionByNameOrId('stock_expeditions')
    var fieldsToAdd = [
      { name: 'motorista', ctor: TextField },
      { name: 'veiculo', ctor: TextField },
      { name: 'romaneio', ctor: TextField },
      { name: 'pedido', ctor: TextField },
      { name: 'cliente', ctor: TextField },
      { name: 'data_saida', ctor: TextField },
      { name: 'data_entrega_real', ctor: TextField },
      { name: 'codigo_rastreamento', ctor: TextField },
    ]
    for (var i = 0; i < fieldsToAdd.length; i++) {
      if (!expCol.fields.getByName(fieldsToAdd[i].name)) {
        expCol.fields.add(new fieldsToAdd[i].ctor({ name: fieldsToAdd[i].name }))
      }
    }
    if (!expCol.fields.getByName('quantidade_volumes')) {
      expCol.fields.add(new NumberField({ name: 'quantidade_volumes', min: 0, onlyInt: true }))
    }
    if (!expCol.fields.getByName('historico')) {
      expCol.fields.add(new JSONField({ name: 'historico' }))
    }
    if (!expCol.fields.getByName('comprovante')) {
      expCol.fields.add(
        new FileField({
          name: 'comprovante',
          maxSelect: 5,
          maxSize: 10485760,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(expCol)

    var settingsCol = app.findCollectionByNameOrId('settings')
    var seeds = [
      { key: 'lot_rule', value: 'FEFO' },
      { key: 'cost_rule', value: 'ultimo_custo' },
      { key: 'allow_negative_stock_roles', value: '["SUP"]' },
    ]
    for (var s = 0; s < seeds.length; s++) {
      try {
        app.findFirstRecordByData('settings', 'key', seeds[s].key)
      } catch (_) {
        var rec = new Record(settingsCol)
        rec.set('key', seeds[s].key)
        rec.set('value', seeds[s].value)
        app.save(rec)
      }
    }
  },
  (app) => {
    var expCol = app.findCollectionByNameOrId('stock_expeditions')
    var names = [
      'motorista',
      'veiculo',
      'romaneio',
      'pedido',
      'cliente',
      'data_saida',
      'data_entrega_real',
      'codigo_rastreamento',
      'quantidade_volumes',
      'historico',
      'comprovante',
    ]
    for (var i = 0; i < names.length; i++) {
      var f = expCol.fields.getByName(names[i])
      if (f) expCol.fields.remove(f)
    }
    app.save(expCol)
  },
)

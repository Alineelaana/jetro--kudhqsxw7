migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('services_offered')

    if (!col.fields.getByName('tax_value')) {
      col.fields.add(new TextField({ name: 'tax_value' }))
    }
    if (!col.fields.getByName('professional_name')) {
      col.fields.add(new TextField({ name: 'professional_name' }))
    }
    if (!col.fields.getByName('service_area')) {
      col.fields.add(new TextField({ name: 'service_area' }))
    }
    if (!col.fields.getByName('service_code')) {
      col.fields.add(new TextField({ name: 'service_code' }))
    }

    app.save(col)

    var existing = app.findRecordsByFilter('services_offered', 'service_code = ""', 'created', 0, 0)
    var codeCounter = 0
    for (var i = 0; i < existing.length; i++) {
      codeCounter++
      var seqStr = String(codeCounter)
      while (seqStr.length < 4) {
        seqStr = '0' + seqStr
      }
      existing[i].set('service_code', 'SRV-' + seqStr)
      app.save(existing[i])
    }

    col.addIndex('idx_services_offered_code', true, 'service_code', "service_code != ''")
    app.save(col)

    var settingsCol = app.findCollectionByNameOrId('settings')
    try {
      var counter = app.findFirstRecordByData('settings', 'key', 'service_code_sequence')
      var currentVal = parseInt(counter.getString('value') || '0', 10)
      if (currentVal < codeCounter) {
        counter.set('value', String(codeCounter))
        app.save(counter)
      }
    } catch (_) {
      var record = new Record(settingsCol)
      record.set('key', 'service_code_sequence')
      record.set('value', String(codeCounter))
      app.save(record)
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('services_offered')
    try {
      col.removeIndex('idx_services_offered_code')
    } catch (_) {}
    app.save(col)
  },
)

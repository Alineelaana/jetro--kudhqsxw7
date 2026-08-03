migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('budget_requests')

    if (!col.fields.getByName('request_number')) {
      col.fields.add(new NumberField({ name: 'request_number', onlyInt: true }))
    }
    col.addIndex('idx_budget_requests_request_number', false, 'request_number', '')
    app.save(col)

    var records = app.findRecordsByFilter('budget_requests', '', 'created', 100000, 0)
    var maxNum = 0
    for (var i = 0; i < records.length; i++) {
      maxNum++
      records[i].set('request_number', maxNum)
      app.save(records[i])
    }

    var settingsCounter = null
    try {
      settingsCounter = app.findFirstRecordByData('settings', 'key', 'request_sequence')
    } catch (_) {}

    if (settingsCounter) {
      settingsCounter.set('value', String(maxNum))
      app.save(settingsCounter)
    } else if (maxNum > 0) {
      var settingsCol = app.findCollectionByNameOrId('settings')
      var newCounter = new Record(settingsCol)
      newCounter.set('key', 'request_sequence')
      newCounter.set('value', String(maxNum))
      app.save(newCounter)
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('budget_requests')
      col.removeIndex('idx_budget_requests_request_number')
      app.save(col)
    } catch (_) {}
  },
)

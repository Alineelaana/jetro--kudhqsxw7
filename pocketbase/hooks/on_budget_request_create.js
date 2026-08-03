onRecordCreate((e) => {
  if (!e.record.getString('status')) {
    e.record.set('status', 'PENDENTE')
  }
  var history = e.record.get('status_history')
  if (!history) {
    e.record.set('status_history', [])
  }

  var existing = e.record.get('request_number')
  if (!existing) {
    var counter = null
    try {
      counter = $app.findFirstRecordByData('settings', 'key', 'request_sequence')
    } catch (_) {}

    var nextNum = 1
    if (counter) {
      nextNum = parseInt(counter.getString('value') || '0', 10) + 1
      counter.set('value', String(nextNum))
      $app.save(counter)
    } else {
      var settingsCol = $app.findCollectionByNameOrId('settings')
      var newCounter = new Record(settingsCol)
      newCounter.set('key', 'request_sequence')
      newCounter.set('value', '1')
      $app.save(newCounter)
    }

    e.record.set('request_number', nextNum)
  }

  e.next()
}, 'budget_requests')

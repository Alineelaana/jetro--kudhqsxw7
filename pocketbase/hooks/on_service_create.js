onRecordCreateRequest((e) => {
  if (!e.record.getString('service_code')) {
    var settingsCol = $app.findCollectionByNameOrId('settings')
    var counter = null
    try {
      counter = $app.findFirstRecordByData('settings', 'key', 'service_code_sequence')
    } catch (_) {}

    var nextNum = 1
    if (counter) {
      nextNum = parseInt(counter.getString('value') || '0', 10) + 1
      counter.set('value', String(nextNum))
      $app.save(counter)
    } else {
      var record = new Record(settingsCol)
      record.set('key', 'service_code_sequence')
      record.set('value', '1')
      $app.save(record)
    }

    var seqStr = String(nextNum)
    while (seqStr.length < 4) {
      seqStr = '0' + seqStr
    }
    e.record.set('service_code', 'SRV-' + seqStr)
  }
  e.next()
}, 'services_offered')

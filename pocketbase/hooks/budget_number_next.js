routerAdd(
  'GET',
  '/backend/v1/budget-number/next',
  (e) => {
    try {
      var settingsCol = $app.findCollectionByNameOrId('settings')
      var counter = null
      try {
        counter = $app.findFirstRecordByData('settings', 'key', 'budget_sequence')
      } catch (_) {}

      var nextNum = 1
      if (counter) {
        nextNum = parseInt(counter.getString('value') || '0', 10) + 1
        counter.set('value', String(nextNum))
        $app.save(counter)
      } else {
        var record = new Record(settingsCol)
        record.set('key', 'budget_sequence')
        record.set('value', '1')
        $app.save(record)
      }

      var year = new Date().getFullYear()
      var seqStr = String(nextNum)
      while (seqStr.length < 4) {
        seqStr = '0' + seqStr
      }
      var budgetNumber = 'ORC-' + year + '-' + seqStr

      return e.json(200, { number: budgetNumber, sequence: nextNum })
    } catch (err) {
      $app.logger().error('budget number generation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar número de orçamento' })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/product-code/next',
  (e) => {
    try {
      var settingsCol = $app.findCollectionByNameOrId('settings')
      var counter = null
      try {
        counter = $app.findFirstRecordByData('settings', 'key', 'product_sequence')
      } catch (_) {}

      var nextNum = 100
      if (counter) {
        var currentVal = parseInt(counter.getString('value') || '0', 10)
        if (currentVal < 100) {
          nextNum = 100
        } else {
          nextNum = currentVal + 1
        }
        counter.set('value', String(nextNum))
        $app.save(counter)
      } else {
        var record = new Record(settingsCol)
        record.set('key', 'product_sequence')
        record.set('value', '100')
        $app.save(record)
      }

      return e.json(200, { number: String(nextNum), sequence: nextNum })
    } catch (err) {
      $app.logger().error('product code generation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar codigo de produto' })
    }
  },
  $apis.requireAuth(),
)

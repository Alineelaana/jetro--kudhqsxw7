routerAdd(
  'GET',
  '/backend/v1/purchase-numbers/next',
  (e) => {
    try {
      var type = e.request.url.query().get('type') || 'request'
      var keyMap = {
        request: 'purchase_request_sequence',
        quotation: 'purchase_quotation_sequence',
        order: 'purchase_order_sequence',
        invoice: 'purchase_invoice_sequence',
        return: 'purchase_return_sequence',
      }
      var key = keyMap[type] || keyMap.request
      var settingsCol = $app.findCollectionByNameOrId('settings')
      var counter = null
      try {
        counter = $app.findFirstRecordByData('settings', 'key', key)
      } catch (_) {}

      var nextNum = 1
      if (counter) {
        nextNum = parseInt(counter.getString('value') || '0', 10) + 1
        counter.set('value', String(nextNum))
        $app.save(counter)
      } else {
        var record = new Record(settingsCol)
        record.set('key', key)
        record.set('value', '1')
        $app.save(record)
      }

      var prefix =
        type === 'request'
          ? 'SC'
          : type === 'quotation'
            ? 'COT'
            : type === 'order'
              ? 'PC'
              : type === 'invoice'
                ? 'NF'
                : 'DEV'
      var year = new Date().getFullYear()
      var seqStr = String(nextNum)
      while (seqStr.length < 4) {
        seqStr = '0' + seqStr
      }
      var number = prefix + '-' + year + '-' + seqStr

      return e.json(200, { number: number, sequence: nextNum })
    } catch (err) {
      $app.logger().error('purchase number generation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar numero' })
    }
  },
  $apis.requireAuth(),
)

onRecordAfterUpdateSuccess((e) => {
  var oldStatus = e.record.original().getString('status')
  var newStatus = e.record.getString('status')
  if (oldStatus === newStatus) return e.next()

  var cliente = e.record.getString('cliente')
  if (!cliente) return e.next()

  try {
    var records = $app.findRecordsByFilter(
      'financial_collections',
      'cliente = "' + cliente.replace(/"/g, '\\"') + '"',
      '-created',
      20,
      0,
    )

    var today = new Date().toISOString().split('T')[0]

    for (var i = 0; i < records.length; i++) {
      var colRecord = records[i]
      var promiseStatus = colRecord.getString('promise_status')
      var promiseValue = parseFloat(colRecord.getString('promise_value') || '0')
      var promiseDate = colRecord.getString('promise_date') || ''

      if (promiseStatus === 'Pendente' || promiseStatus === 'Parcialmente cumprida') {
        if (newStatus === 'Recebido' || newStatus === 'Renegociado') {
          colRecord.set('promise_status', 'Cumprida')
        } else if (newStatus === 'Parcialmente Recebido') {
          var received = parseFloat(e.record.getString('valor_recebido') || '0')
          if (received >= promiseValue && promiseValue > 0) {
            colRecord.set('promise_status', 'Cumprida')
          } else if (received > 0) {
            colRecord.set('promise_status', 'Parcialmente cumprida')
          }
        }

        if (
          colRecord.getString('promise_status') === 'Pendente' &&
          promiseDate &&
          promiseDate < today
        ) {
          colRecord.set('promise_status', 'Quebrada')
        }

        $app.save(colRecord)
      }
    }
  } catch (err) {
    $app.logger().error('Promise reconciliation failed', 'error', String(err))
  }

  return e.next()
}, 'financial_receivables')

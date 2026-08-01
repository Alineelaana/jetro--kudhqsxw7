onRecordCreate((e) => {
  if (!e.record.getString('status')) {
    e.record.set('status', 'PENDENTE')
  }
  var history = e.record.get('status_history')
  if (!history) {
    e.record.set('status_history', [])
  }
  e.next()
}, 'budget_requests')

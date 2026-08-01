onRecordCreateRequest((e) => {
  const authRole = e.auth ? e.auth.getString('role') : ''
  if (!authRole) {
    e.record.set('active', false)
    e.record.set('blocked', false)
    e.record.set('financial_restriction', false)
    e.record.set('financial_history', [])
    e.record.set('restriction_history', [])
    e.record.set('restriction_reason', '')
    e.record.set('client_id', '')
  }
  e.next()
}, 'partners')

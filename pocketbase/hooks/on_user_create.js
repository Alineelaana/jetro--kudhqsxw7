onRecordCreateRequest((e) => {
  var isSupCreator = e.auth && e.auth.getString('role') === 'SUP'
  if (!isSupCreator) {
    e.record.set('role', 'PADRAO')
  } else if (!e.record.getString('role')) {
    e.record.set('role', 'PADRAO')
  }
  e.next()
}, 'users')

onRecordUpdateRequest((e) => {
  var originalCode = e.record.original().getString('service_code')
  if (originalCode) {
    e.record.set('service_code', originalCode)
  }
  e.next()
}, 'services_offered')

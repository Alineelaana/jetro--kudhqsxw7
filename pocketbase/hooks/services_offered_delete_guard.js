onRecordDelete((e) => {
  var serviceName = e.record.getString('name')
  if (serviceName) {
    var escaped = serviceName.replace(/"/g, '\\"')
    var budgets = $app.findRecordsByFilter(
      'budget_requests',
      'service = "' + escaped + '"',
      '',
      1,
      0,
    )
    if (budgets.length > 0) {
      throw new BadRequestError(
        'Este servico ja foi utilizado em orcamentos e nao pode ser excluido. Inative o servico.',
      )
    }
  }
  e.next()
}, 'services_offered')

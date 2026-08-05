onRecordAfterUpdateSuccess((e) => {
  var record = e.record
  var oldStatus = record.original().getString('status')
  var newStatus = record.getString('status')
  var now = new Date().toISOString()

  if (oldStatus !== newStatus) {
    try {
      var histCol = $app.findCollectionByNameOrId('atendimento_historico')
      var hist = new Record(histCol)
      hist.set('atendimento_id', record.id)
      hist.set('tipo', 'status_change')
      hist.set('data_hora', now)
      hist.set('old_value', oldStatus)
      hist.set('new_value', newStatus)
      hist.set('conteudo', 'Status alterado de ' + oldStatus + ' para ' + newStatus)
      $app.save(hist)
    } catch (_) {}

    if (newStatus === 'Finalizado' || newStatus === 'Resolvido') {
      record.set('sla_cumprido', true)
      if (newStatus === 'Finalizado') {
        record.set('data_encerramento', now)
      }
      $app.saveNoValidate(record)
    }

    if (newStatus === 'Resolvido' || newStatus === 'Finalizado') {
      try {
        var setorId = record.getString('setor_id')
        if (setorId) {
          var setor = $app.findRecordById('atendimento_setores', setorId)
          var gerenteId = setor.getString('gerente_id')
          if (gerenteId) {
            var notifCol = $app.findCollectionByNameOrId('notifications')
            var notif = new Record(notifCol)
            notif.set('title', 'Atendimento ' + newStatus + ': ' + record.getString('protocol'))
            notif.set('message', 'Cliente: ' + record.getString('client_name'))
            notif.set('type', 'other')
            notif.set('recipient', gerenteId)
            notif.set('read', false)
            notif.set('link', '/admin/atendimento/detalhe/' + record.id)
            $app.save(notif)
          }
        }
      } catch (_) {}
    }
  }

  return e.next()
}, 'service_centers')

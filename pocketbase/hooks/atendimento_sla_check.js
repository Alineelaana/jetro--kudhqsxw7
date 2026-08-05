cronAdd('atendimento_sla_check', '0 * * * *', () => {
  var now = new Date()
  var nowIso = now.toISOString()

  try {
    var openAtendimentos = $app.findRecordsByFilter(
      'service_centers',
      'status != "Finalizado" && status != "Cancelado" && status != "Resolvido"',
      '-created',
      500,
      0,
    )

    for (var i = 0; i < openAtendimentos.length; i++) {
      var rec = openAtendimentos[i]
      var limiteStr = rec.getString('data_hora_limite')
      if (!limiteStr) continue

      var limite = new Date(limiteStr)
      var totalMs = limite.getTime() - new Date(rec.getString('created') || nowIso).getTime()
      var remainingMs = limite.getTime() - now.getTime()
      var setorId = rec.getString('setor_id')

      if (remainingMs <= 0 && !rec.getBool('sla_cumprido')) {
        try {
          var notifCol = $app.findCollectionByNameOrId('notifications')
          var n = new Record(notifCol)
          n.set('title', 'SLA Vencido: ' + rec.getString('protocol'))
          n.set('message', 'Atendimento ultrapassou o prazo de SLA')
          n.set('type', 'other')
          if (setorId) {
            var setor = $app.findRecordById('atendimento_setores', setorId)
            var gerenteId = setor.getString('gerente_id')
            if (gerenteId) n.set('recipient', gerenteId)
          }
          n.set('read', false)
          n.set('link', '/admin/atendimento/detalhe/' + rec.id)
          $app.save(n)
        } catch (_) {}
      } else if (totalMs > 0 && remainingMs > 0 && remainingMs <= totalMs * 0.2) {
        try {
          var notifCol2 = $app.findCollectionByNameOrId('notifications')
          var n2 = new Record(notifCol2)
          n2.set('title', 'SLA Próximo do Vencimento: ' + rec.getString('protocol'))
          n2.set('message', 'Atendimento próximo do vencimento do SLA')
          n2.set('type', 'other')
          if (setorId) {
            var setor2 = $app.findRecordById('atendimento_setores', setorId)
            var gerenteId2 = setor2.getString('gerente_id')
            if (gerenteId2) n2.set('recipient', gerenteId2)
          }
          n2.set('read', false)
          n2.set('link', '/admin/atendimento/detalhe/' + rec.id)
          $app.save(n2)
        } catch (_) {}
      }
    }

    var stageStatuses = $app.findRecordsByFilter(
      'fluxo_etapa_status',
      'status = "Em Andamento"',
      '-data_inicio',
      500,
      0,
    )
    for (var j = 0; j < stageStatuses.length; j++) {
      var ss = stageStatuses[j]
      var stageLimite = ss.getString('data_hora_limite')
      if (!stageLimite) continue
      var stageLimiteDate = new Date(stageLimite)
      if (stageLimiteDate.getTime() < now.getTime()) {
        try {
          var notifCol3 = $app.findCollectionByNameOrId('notifications')
          var n3 = new Record(notifCol3)
          n3.set('title', 'Etapa de Fluxo em Atraso')
          n3.set('message', 'Etapa ultrapassou o tempo máximo')
          n3.set('type', 'other')
          var respUser = ss.getString('usuario_responsavel')
          if (respUser) n3.set('recipient', respUser)
          n3.set('read', false)
          $app.save(n3)
        } catch (_) {}
      }
    }
  } catch (err) {
    $app.logger().error('SLA check failed', 'error', String(err))
  }
})

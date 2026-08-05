onRecordAfterCreateSuccess((e) => {
  var record = e.record
  var now = new Date().toISOString()
  var userName = ''
  try {
    var userId = record.getString('usuario_abertura')
    if (userId) {
      var user = $app.findRecordById('users', userId)
      userName = user.getString('name') || user.getString('email')
    }
  } catch (_) {}

  try {
    var histCol = $app.findCollectionByNameOrId('atendimento_historico')
    var hist = new Record(histCol)
    hist.set('atendimento_id', record.id)
    hist.set('tipo', 'created')
    hist.set('usuario_id', record.getString('usuario_abertura'))
    hist.set('data_hora', now)
    hist.set('conteudo', 'Atendimento criado por ' + userName)
    $app.save(hist)
  } catch (_) {}

  var motivoId = record.getString('motivo_id')
  if (motivoId) {
    try {
      var flows = $app.findRecordsByFilter(
        'fluxos_inteligentes',
        'motivo_id = "' + motivoId + '" && status = "Ativo"',
        '-prioridade',
        1,
        0,
      )
      if (flows.length > 0) {
        var flow = flows[0]
        var stages = $app.findRecordsByFilter(
          'fluxo_etapas',
          'fluxo_id = "' + flow.id + '"',
          'ordem',
          100,
          0,
        )
        var stageStatusCol = $app.findCollectionByNameOrId('fluxo_etapa_status')

        for (var i = 0; i < stages.length; i++) {
          var stage = stages[i]
          var ss = new Record(stageStatusCol)
          ss.set('atendimento_id', record.id)
          ss.set('etapa_id', stage.id)
          ss.set('status', i === 0 ? 'Em Andamento' : 'Pendente')
          if (i === 0) {
            ss.set('data_inicio', now)
            var tempoMax = stage.getInt('tempo_maximo_minutos')
            if (tempoMax > 0) {
              ss.set('data_hora_limite', new Date(Date.now() + tempoMax * 60000).toISOString())
            }
          }
          $app.save(ss)
          if (i === 0) {
            record.set('current_stage_id', stage.id)
          }
        }
        record.set('flow_id', flow.id)
        $app.saveNoValidate(record)
      }
    } catch (_) {}
  }

  try {
    var setorId = record.getString('setor_id')
    if (setorId) {
      var setor = $app.findRecordById('atendimento_setores', setorId)
      var gerenteId = setor.getString('gerente_id')
      if (gerenteId) {
        var notifCol = $app.findCollectionByNameOrId('notifications')
        var notif = new Record(notifCol)
        notif.set('title', 'Novo Atendimento: ' + record.getString('protocol'))
        notif.set('message', 'Cliente: ' + record.getString('client_name'))
        notif.set('type', 'other')
        notif.set('recipient', gerenteId)
        notif.set('read', false)
        notif.set('link', '/admin/atendimento/detalhe/' + record.id)
        $app.save(notif)
      }
    }
  } catch (_) {}

  return e.next()
}, 'service_centers')

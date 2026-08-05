routerAdd(
  'POST',
  '/backend/v1/atendimento/stage-action',
  (e) => {
    var body = e.requestInfo().body || {}
    var stageStatusId = body.stage_status_id
    var action = body.action
    var observacoes = body.observacoes || ''
    var userId = e.auth ? e.auth.id : ''
    var userName = e.auth ? e.auth.getString('name') || e.auth.getString('email') : ''

    if (!stageStatusId || !action)
      return e.badRequestError('stage_status_id and action are required')

    var ss = null
    try {
      ss = $app.findRecordById('fluxo_etapa_status', stageStatusId)
    } catch (_) {
      return e.notFoundError('stage status not found')
    }

    var now = new Date().toISOString()

    if (action === 'complete') {
      var etapaId = ss.getString('etapa_id')
      try {
        var etapa = $app.findRecordById('fluxo_etapas', etapaId)
        if (etapa.getBool('exigir_observacao') && !observacoes.trim()) {
          return e.badRequestError('Observação obrigatória para esta etapa')
        }
      } catch (_) {}

      ss.set('status', 'Concluída')
      ss.set('data_fim', now)
      ss.set('observacoes', observacoes)
      if (ss.getString('data_inicio')) {
        var elapsed =
          (new Date(now).getTime() - new Date(ss.getString('data_inicio')).getTime()) / 60000
        ss.set('tempo_gasto_minutos', Math.round(elapsed))
      }
      $app.save(ss)

      var atendimentoId = ss.getString('atendimento_id')
      try {
        var allStages = $app.findRecordsByFilter(
          'fluxo_etapa_status',
          'atendimento_id = "' + atendimentoId + '"',
          '',
          100,
          0,
        )
        var etapaMap = {}
        allStages.forEach(function (s) {
          etapaMap[s.getString('etapa_id')] = s
        })
        var etapas = $app.findRecordsByFilter(
          'fluxo_etapas',
          'fluxo_id = "' + ss.getString('etapa_id') + '"',
          'ordem',
          100,
          0,
        )

        var flowId = null
        try {
          var atend = $app.findRecordById('service_centers', atendimentoId)
          flowId = atend.getString('flow_id')
        } catch (_) {}

        if (flowId) {
          var flowStages = $app.findRecordsByFilter(
            'fluxo_etapas',
            'fluxo_id = "' + flowId + '"',
            'ordem',
            100,
            0,
          )
          for (var i = 0; i < flowStages.length; i++) {
            var fs = flowStages[i]
            var matchingStatus = null
            for (var j = 0; j < allStages.length; j++) {
              if (allStages[j].getString('etapa_id') === fs.id) {
                matchingStatus = allStages[j]
                break
              }
            }
            if (matchingStatus && matchingStatus.getString('status') === 'Pendente') {
              matchingStatus.set('status', 'Em Andamento')
              matchingStatus.set('data_inicio', now)
              var tempoMax = fs.getInt('tempo_maximo_minutos')
              if (tempoMax > 0) {
                matchingStatus.set(
                  'data_hora_limite',
                  new Date(Date.now() + tempoMax * 60000).toISOString(),
                )
              }
              $app.save(matchingStatus)
              try {
                var at = $app.findRecordById('service_centers', atendimentoId)
                at.set('current_stage_id', fs.id)
                $app.saveNoValidate(at)
              } catch (_) {}
              break
            }
          }
        }
      } catch (_) {}
    } else if (action === 'approve') {
      ss.set('approval_status', 'approved')
      ss.set('approval_user', userId)
      ss.set('approval_comment', observacoes)
      ss.set('status', 'Concluída')
      ss.set('data_fim', now)
      $app.save(ss)
    } else if (action === 'reject') {
      ss.set('approval_status', 'rejected')
      ss.set('approval_user', userId)
      ss.set('approval_comment', observacoes)
      ss.set('status', 'Pendente')
      $app.save(ss)
    } else if (action === 'start_approval') {
      ss.set('status', 'Aguardando Aprovação')
      $app.save(ss)
    } else if (action === 'cancel') {
      ss.set('status', 'Cancelada')
      ss.set('observacoes', observacoes)
      $app.save(ss)
    } else {
      return e.badRequestError('invalid action')
    }

    try {
      var histCol = $app.findCollectionByNameOrId('atendimento_historico')
      var hist = new Record(histCol)
      hist.set('atendimento_id', ss.getString('atendimento_id'))
      hist.set('tipo', 'stage_' + action)
      hist.set('usuario_id', userId)
      hist.set('data_hora', now)
      hist.set(
        'conteudo',
        'Etapa: ' + action + ' por ' + userName + (observacoes ? ' — ' + observacoes : ''),
      )
      $app.save(hist)
    } catch (_) {}

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/validity-alerts/chat',
  (e) => {
    var body = e.requestInfo().body || {}
    var message = (body.message || '').trim()
    if (!message) {
      return e.badRequestError('message is required')
    }

    var alerts = []
    try {
      alerts = $app.findRecordsByFilter(
        'validity_alerts',
        'status != "Resolvido" && status != "Ignorado"',
        '-created',
        100,
        0,
      )
    } catch (_) {}

    var context = 'Alertas de Validade Ativos:\n'
    for (var i = 0; i < alerts.length; i++) {
      var a = alerts[i]
      context +=
        '- ' +
        (a.getString('entity_name') || 'Sem nome') +
        ' | Tipo: ' +
        a.getString('entity_type') +
        ' | Módulo: ' +
        a.getString('module') +
        ' | Dias restantes: ' +
        a.getInt('days_remaining') +
        ' | Criticidade: ' +
        a.getString('criticidade') +
        ' | Status: ' +
        a.getString('status') +
        ' | Validade: ' +
        a.getString('validity_date') +
        '\n'
    }

    if (alerts.length === 0) {
      context = 'Nenhum alerta de validade ativo no momento.'
    }

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em alertas de validade e vencimento corporativo. ' +
              'Responda em português brasileiro. Use os dados de alertas fornecidos para responder ' +
              'perguntas sobre o que vence, quais documentos estão expirados, quais lotes expiram em X dias, etc. ' +
              'Se não houver dados suficientes, informe claramente.',
          },
          {
            role: 'user',
            content: 'Contexto dos alertas:\n' + context + '\n\nPergunta: ' + message,
          },
        ],
      })
      return e.json(200, { content: reply.choices[0].message.content })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'AI temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'Falha ao processar resposta' })
      }
      return e.json(500, { error: 'Erro interno' })
    }
  },
  $apis.requireAuth(),
)

routerAdd('POST', '/backend/v1/performance/predict', (e) => {
  var internalSecret = $secrets.get('PB_SUPERUSER_TOKEN') || ''
  var providedSecret = e.request.header.get('X-Internal-Secret') || ''
  if (!e.auth && !(internalSecret && providedSecret && providedSecret === internalSecret)) {
    return e.unauthorizedError('Authentication required')
  }

  try {
    var scores = $app.findRecordsByFilter('performance_scores', '', '-created', 30, 0)
    var dataSummary = 'Dados atuais de performance:\n'
    for (var i = 0; i < scores.length; i++) {
      dataSummary +=
        '- ' +
        (scores[i].getString('entity_name') || 'empresa') +
        ' | score: ' +
        (scores[i].getFloat('score') || 0) +
        '\n'
    }

    var scenarios = [
      'Se contratar mais funcionários, qual será o impacto na performance?',
      'Se reduzir desperdícios em 20%, quanto economiza?',
      'Se melhorar a conversão comercial em 10%, qual será o impacto financeiro?',
      'Qual departamento possui maior potencial de ganho?',
      'Qual processo gera mais perdas?',
    ]

    var created = 0
    for (var s = 0; s < scenarios.length; s++) {
      try {
        var reply = $ai.chat({
          model: 'reasoning',
          messages: [
            {
              role: 'system',
              content:
                'Você é um analista preditivo corporativo. Responda em JSON: { "predicted_value": "...", "current_value": "...", "impact": {"description":"...","magnitude":"alto|medio|baixo"}, "assumptions": ["premissa1"] }',
            },
            { role: 'user', content: scenarios[s] + '\n\n' + dataSummary },
          ],
        })

        var text = reply.choices[0].message.content
        var parsed = null
        try {
          parsed = JSON.parse(text)
        } catch (_) {
          var m = text.match(/\{[\s\S]*\}/)
          if (m)
            try {
              parsed = JSON.parse(m[0])
            } catch (_) {}
        }
        if (!parsed)
          parsed = {
            predicted_value: text.substring(0, 200),
            current_value: '',
            impact: {},
            assumptions: [],
          }

        var col = $app.findCollectionByNameOrId('performance_predictions')
        var rec = new Record(col)
        rec.set('scenario', scenarios[s])
        rec.set('entity_type', 'empresa')
        rec.set('entity_name', 'Empresa')
        rec.set('period', new Date().toISOString().substring(0, 10))
        rec.set('metric', 'performance')
        rec.set('predicted_value', parsed.predicted_value || '')
        rec.set('current_value', parsed.current_value || '')
        rec.set('impact', JSON.stringify(parsed.impact || {}))
        rec.set('assumptions', JSON.stringify(parsed.assumptions || []))
        $app.save(rec)
        created++
      } catch (_) {}
    }

    return e.json(200, { predictions: created })
  } catch (err) {
    if (err instanceof SkipAiConfigError)
      return e.json(503, { error: 'AI temporarily unavailable' })
    return e.json(500, { error: 'prediction failed' })
  }
})

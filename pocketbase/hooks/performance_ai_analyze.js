routerAdd('POST', '/backend/v1/performance/ai-analyze', (e) => {
  var internalSecret = $secrets.get('PB_SUPERUSER_TOKEN') || ''
  var providedSecret = e.request.header.get('X-Internal-Secret') || ''
  if (!e.auth && !(internalSecret && providedSecret && providedSecret === internalSecret)) {
    return e.unauthorizedError('Authentication required')
  }

  try {
    var scores = $app.findRecordsByFilter('performance_scores', '', '-created', 50, 0)
    var alerts = $app.findRecordsByFilter('performance_alerts', 'resolved = false', '-created', 50, 0)

    var summary = 'Scores de Performance:\n'
    var moduleMap = {}
    for (var i = 0; i < scores.length; i++) {
      var comps = scores[i].getString('components') || '{}'
      try { comps = JSON.parse(comps) } catch(_) { comps = {} }
      var mod = comps.module || 'unknown'
      if (!moduleMap[mod]) moduleMap[mod] = scores[i].getFloat('score') || 0
    }
    var modKeys = Object.keys(moduleMap)
    for (var j = 0; j < modKeys.length; j++) {
      summary += '- ' + modKeys[j] + ': ' + moduleMap[modKeys[j].toFixed ? moduleMap[modKeys[j]].toFixed(1) : moduleMap[modKeys[j]] + '\n'
    }
    summary += '\nAlertas Ativos: ' + alerts.length + '\n'
    for (var a = 0; a < Math.min(10, alerts.length); a++) {
      summary += '- [' + alerts[a].getString('severity') + '] ' + alerts[a].getString('message') + '\n'
    }

    var reply = $ai.chat({
      model: 'reasoning',
      messages: [
        { role: 'system', content: 'Você é um analista de performance corporativa. Analise os indicadores e identifique: quedas de produtividade, gargalos, desperdícios, oportunidades, riscos, necessidade de treinamento. Responda em JSON com: { "conclusion": "...", "reason": "...", "suggested_actions": ["acao1", "acao2"], "risk_level": "baixo|medio|alto|critico" }' },
        { role: 'user', content: summary },
      ],
    })

    var text = reply.choices[0].message.content
    var parsed = null
    try { parsed = JSON.parse(text) } catch(_) {
      var m1 = text.match(/\{[\s\S]*\}/)
      if (m1) try { parsed = JSON.parse(m1[0]) } catch(_) {}
    }
    if (!parsed) {
      parsed = { conclusion: text.substring(0, 500), reason: 'Análise textual gerada pela IA', suggested_actions: [], risk_level: 'medio' }
    }

    var col = $app.findCollectionByNameOrId('performance_ai_analysis')
    var rec = new Record(col)
    rec.set('entity_type', 'empresa')
    rec.set('entity_name', 'Empresa')
    rec.set('period', new Date().toISOString().substring(0, 10))
    rec.set('conclusion', parsed.conclusion || '')
    rec.set('reason', parsed.reason || '')
    rec.set('suggested_actions', JSON.stringify(parsed.suggested_actions || []))
    rec.set('risk_level', parsed.risk_level || 'medio')
    $app.save(rec)

    var embedText = ((parsed.conclusion || '') + '\n\n' + (parsed.reason || '')).trim()
    if (embedText) {
      try {
        var embedRes = $ai.embed({ input: embedText })
        var savedRec = $app.findRecordById('performance_ai_analysis', rec.id)
        savedRec.set('embedding', embedRes.data[0].embedding)
        $app.save(savedRec)
      } catch (_) {}
    }

    return e.json(200, { success: true, conclusion: parsed.conclusion })
  } catch (err) {
    if (err instanceof SkipAiConfigError) return e.json(503, { error: 'AI temporarily unavailable' })
    if (err instanceof SkipAiError) return e.json(502, { error: 'AI temporarily unavailable' })
    return e.json(500, { error: 'analysis failed' })
  }
})

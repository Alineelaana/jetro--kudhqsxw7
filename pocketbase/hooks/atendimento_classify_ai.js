routerAdd(
  'POST',
  '/backend/v1/atendimento/classify-ai',
  (e) => {
    var body = e.requestInfo().body || {}
    var atendimentoId = body.atendimento_id
    if (!atendimentoId) return e.badRequestError('atendimento_id is required')

    var record = null
    try {
      record = $app.findRecordById('service_centers', atendimentoId)
    } catch (_) {
      return e.notFoundError('atendimento not found')
    }

    var motivos = []
    try {
      motivos = $app.findRecordsByFilter('atendimento_motivos', 'active = true', 'nome', 100, 0)
    } catch (_) {}

    var motivosList = motivos
      .map(function (m) {
        return m.getString('nome')
      })
      .join(', ')

    var prompt =
      'Você é um assistente de classificação de atendimentos. Analise o seguinte atendimento e sugira:\n'
    prompt += '1. Motivo mais provável (escolha entre: ' + motivosList + ')\n'
    prompt += '2. Setor responsável\n'
    prompt += '3. Prioridade (Baixa, Normal, Alta, Urgente)\n'
    prompt += '4. Palavras-chave críticas identificadas\n\n'
    prompt += 'Descrição: ' + record.getString('descricao') + '\n'
    prompt += 'Cliente: ' + record.getString('client_name') + '\n'
    prompt += 'Origem: ' + record.getString('origem') + '\n'
    prompt += 'Tipo: ' + record.getString('tipo') + '\n'
    prompt += '\nResponda em JSON: {"motivo":"","setor":"","prioridade":"","palavras_chave":[]}'

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content: 'Você é um classificador de atendimentos. Responda apenas em JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
      })
      var content = reply.choices[0].message.content
      var jsonMatch = content.match(/\{[\s\S]*\}/)
      var suggestion = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { motivo: '', setor: '', prioridade: '', palavras_chave: [] }

      record.set('classificacao_ia_sugerida', suggestion)
      $app.save(record)

      return e.json(200, { suggestion: suggestion, confirmed: false })
    } catch (err) {
      return e.json(503, { error: 'IA temporariamente indisponível' })
    }
  },
  $apis.requireAuth(),
)

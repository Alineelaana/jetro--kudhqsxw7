routerAdd(
  'POST',
  '/backend/v1/crm/ai-assist',
  (e) => {
    const body = e.requestInfo().body || {}
    const type = body.type || ''
    const data = body.data || {}

    if (!type) return e.badRequestError('type is required')

    var prompt = ''
    if (type === 'classify') {
      prompt =
        'Analise o seguinte lead e sugira classificação (status, temperatura, origem) e prioridade.\n'
      prompt += 'Nome: ' + (data.name || '') + '\n'
      prompt += 'Segmento: ' + (data.segment || '') + '\n'
      prompt += 'Origem: ' + (data.lead_source || '') + '\n'
      prompt += 'Observações: ' + (data.observations || '') + '\n'
      prompt += '\nResponda em JSON: {"status":"","temperature":"","priority":"","reason":""}'
    } else if (type === 'suggest_motivo') {
      prompt = 'Baseado na descrição da perda, sugira o motivo mais provável.\n'
      prompt += 'Descrição: ' + (data.description || '') + '\n'
      prompt += '\nResponda em JSON: {"motivo":"","explicacao":""}'
    } else if (type === 'prioritize') {
      prompt = 'Priorize as seguintes oportunidades por valor e probabilidade de fechamento.\n'
      prompt += 'Oportunidades: ' + JSON.stringify(data.opportunities || []) + '\n'
      prompt += '\nResponda em JSON: {"priority_order":[],"reason":""}'
    } else if (type === 'summarize') {
      prompt = 'Gere um resumo executivo dos dados do relatório CRM.\n'
      prompt += 'Relatório: ' + (data.report || '') + '\n'
      prompt += 'Dados: ' + JSON.stringify(data.data || {}).substring(0, 2000) + '\n'
      prompt += '\nResponda em JSON: {"summary":"","insights":[],"recommendations":[]}'
    } else if (type === 'suggest_response') {
      prompt = 'Sugira uma resposta profissional para o cliente baseado no contexto.\n'
      prompt += 'Contexto: ' + (data.context || '') + '\n'
      prompt += '\nResponda em JSON: {"response":"","tone":""}'
    } else {
      return e.badRequestError('Invalid type: ' + type)
    }

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de CRM. Responda apenas em JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
      })
      var content = reply.choices[0].message.content
      var jsonMatch = content.match(/\{[\s\S]*\}/)
      var result = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: content }
      return e.json(200, result)
    } catch (err) {
      return e.json(503, { error: 'IA temporariamente indisponível' })
    }
  },
  $apis.requireAuth(),
)

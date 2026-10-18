/// <reference path="../pb_data/types.d.ts" />

/**
 * Endpoints e hooks da Central da Assistente Jeh (Institucional)
 * Permite:
 * 1. Testar a Jeh em ambiente isolado mesmo quando desativada para o público
 * 2. Registrar perguntas sem resposta detectadas pelo assistente
 * 3. Consultar status e alterar status com confirmação e checagem de permissão
 * 4. Processar e indexar documentos PDF/DOCX/TXT carregados na Base de Conhecimento
 */

// 1. Endpoint de Teste Interno da Jeh (Exclusivo para usuários autenticados autorizados)
routerAdd('POST', '/backend/v1/jeh/test-chat', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Usuário não autenticado' })
  }

  const body = e.requestInfo().body || {}
  const message = (body.message || '').trim()
  const history = body.history || []

  if (!message) {
    return e.json(400, { error: 'Mensagem é obrigatória' })
  }

  try {
    // Buscar respostas aprovadas e base de conhecimento oficial da Jeh
    let knowledgeSnippets = []
    try {
      const qas = $app.findRecordsByFilter(
        'jeh_qa',
        "approval_status = 'aprovado'",
        '-hit_count',
        30,
        0,
      )
      for (let i = 0; i < qas.length; i++) {
        const q = qas[i]
        const canon = q.getString('canonical_question')
        const ans = q.getString('official_answer')
        const vars = q.get('variations') || []
        knowledgeSnippets.push(
          `[P&R Oficial - ${q.getString('category')}]:\nPergunta: "${canon}"\nVariações: ${JSON.stringify(vars)}\nResposta Oficial: "${ans}"`,
        )
      }
    } catch (_) {}

    try {
      const knows = $app.findRecordsByFilter(
        'jeh_knowledge',
        "approval_status = 'aprovado'",
        '-updated',
        30,
        0,
      )
      for (let j = 0; j < knows.length; j++) {
        const k = knows[j]
        knowledgeSnippets.push(
          `[Base de Conhecimento - ${k.getString('category')} | ${k.getString('title')}]:\n${k.getString('content')}`,
        )
      }
    } catch (_) {}

    const systemPrompt =
      'Você é a Jeh, a assistente institucional e comercial do Jetro.\n' +
      'Seu papel é apresentar o ecossistema Jetro, explicar o que é o sistema, suas funcionalidades, departamentos, modelo de implantação, agendamento de demonstrações e canais oficiais de contato.\n\n' +
      'REGRAS MANDATÓRIAS DE SEGURANÇA E CONFORMIDADE:\n' +
      '1. BASE EXCLUSIVA: Responda baseando-se EXCLUSIVAMENTE nos conteúdos oficiais da Base de Conhecimento e de Perguntas e Respostas aprovados da Jetro fornecidos abaixo.\n' +
      '2. PROIBIÇÃO ABSOLUTA DE INVENÇÃO (NÃO SABE = NÃO INVENTA): Se você não tiver uma informação confirmada ou se a pergunta estiver fora da base aprovada, NUNCA invente preços, prazos, integrações, clientes ou funcionalidades. Responda com a frase padrão oficial: "Não tenho essa informação confirmada no momento, mas posso orientar você a entrar em contato com nossa equipe." e ofereça os canais oficiais (WhatsApp (31) 99129-7619 ou formulário de apresentação comercial).\n' +
      '3. SEPARAÇÃO TOTAL DE DADOS INTERNOS DO ERP: Você NUNCA tem acesso a pedidos, notas fiscais, faturamento, estoque, dados bancários, folha de pagamento ou qualquer dado interno e sigiloso de clientes e usuários do ERP. Você é puramente institucional e comercial.\n' +
      '4. TOM DE VOZ: Educada, simpática, prestativa, moderna e profissional em Português do Brasil.\n\n' +
      '--- BASE DE CONHECIMENTO OFICIAL E RESPOSTAS APROVADAS ---\n' +
      (knowledgeSnippets.length > 0
        ? knowledgeSnippets.join('\n\n')
        : 'Nenhum conteúdo adicional cadastrado.') +
      '\n--- FIM DA BASE OFICIAL ---'

    const messages = [{ role: 'system', content: systemPrompt }]

    // Incluir histórico recente se fornecido
    if (Array.isArray(history)) {
      for (let h = 0; h < history.length; h++) {
        const hm = history[h]
        if (hm.role === 'user' || hm.role === 'assistant') {
          messages.push({ role: hm.role, content: String(hm.content || '') })
        }
      }
    }

    messages.push({ role: 'user', content: message })

    // Chamar IA
    const response = $ai.chat({
      model: 'fast',
      messages: messages,
    })

    const replyContent =
      response?.choices?.[0]?.message?.content ||
      'Não tenho essa informação confirmada no momento, mas posso orientar você a entrar em contato com nossa equipe.'

    // Checar se a resposta caiu no fallback de sem informação
    const isUnanswered =
      replyContent.includes('Não tenho essa informação confirmada no momento') ||
      replyContent.includes('não tenho essa informação') ||
      replyContent.includes('posso orientar você a entrar em contato com nossa equipe')

    if (isUnanswered) {
      try {
        // Registrar ou incrementar em jeh_unanswered
        const cleanQ = message.toLowerCase().trim()
        const unCol = $app.findCollectionByNameOrId('jeh_unanswered')
        let existing = null
        try {
          const list = $app.findRecordsByFilter(
            'jeh_unanswered',
            `question ~ '${cleanQ.replace(/'/g, "\\'")}'`,
            '-created',
            1,
            0,
          )
          if (list.length > 0) existing = list[0]
        } catch (_) {}

        if (existing) {
          const count = (existing.getInt('count') || 1) + 1
          existing.set('count', count)
          existing.set('last_asked_at', new Date().toISOString())
          $app.save(existing)
        } else {
          const unRec = new Record(unCol)
          unRec.set('question', message)
          unRec.set('count', 1)
          unRec.set('identified_topic', 'Geral')
          unRec.set('status', 'pendente')
          unRec.set('source', 'teste')
          unRec.set('last_asked_at', new Date().toISOString())
          $app.save(unRec)
        }
      } catch (errUn) {
        console.log('Error logging unanswered question:', errUn)
      }
    }

    return e.json(200, {
      response: replyContent,
      isUnanswered: isUnanswered,
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao processar teste com a Jeh: ' + String(err) })
  }
})

// 2. Extração e indexação de documentos de conhecimento (PDF, DOCX, TXT)
routerAdd('POST', '/backend/v1/jeh/extract-document', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Usuário não autenticado' })
  }

  try {
    const files = e.findUploadedFiles('file')
    if (!files || files.length === 0) {
      return e.json(400, { error: 'Nenhum arquivo enviado' })
    }

    const uploaded = files[0]
    const ext = uploaded.name.split('.').pop()?.toLowerCase() || ''
    let extractedText = ''

    if (ext === 'pdf' || ext === 'docx') {
      try {
        extractedText = $documents.toMarkdown(uploaded)
      } catch (docErr) {
        console.log('Error extracting with $documents:', docErr)
        return e.json(500, { error: 'Erro ao extrair conteúdo do documento: ' + String(docErr) })
      }
    } else if (ext === 'txt' || ext === 'md' || ext === 'json' || ext === 'csv') {
      // Leitura direta de texto
      const bytes = uploaded.bytes()
      extractedText = String.fromCharCode.apply(null, bytes)
    } else {
      return e.json(400, { error: 'Formato não suportado. Envie PDF, DOCX ou TXT.' })
    }

    return e.json(200, {
      fileName: uploaded.name,
      fileSize: uploaded.size,
      text: extractedText,
    })
  } catch (err) {
    return e.json(500, { error: 'Erro ao processar arquivo: ' + String(err) })
  }
})

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
        '-updated',
        50,
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
        50,
        0,
      )
      for (let j = 0; j < knows.length; j++) {
        const k = knows[j]
        knowledgeSnippets.push(
          `[Base de Conhecimento - ${k.getString('category')} | ${k.getString('title')}]:\n${k.getString('content')}`,
        )
      }
    } catch (_) {}

    const fullBehaviorPrompt =
      'IDENTIDADE E POSICIONAMENTO:\n' +
      'Você é a Jeh, inteligência artificial do ERP Jetro — Plataforma Inteligente de Gestão Empresarial.\n' +
      'O Jetro tem a proposta de oferecer uma gestão ampla, integrada e inteligente, conectando processos, pessoas, informações e decisões.\n' +
      'Nosso posicionamento é oferecer uma plataforma completa e em evolução contínua, com IA nativa, Segundo Cérebro, auditoria e rastreabilidade.\n' +
      'REGRA: não afirmar como fato comprovado que somos "o sistema mais completo, atualizado ou seguro do mercado" sem evidências comparativas; demonstrar diferenciais pelas entregas documentadas.\n\n' +
      'REGRA PRINCIPAL DE ATENDIMENTO:\n' +
      '"Utilize primeiro as informações confirmadas da base de conhecimento para responder à pergunta. O WhatsApp deve complementar o atendimento, não substituir respostas que a Jeh já consegue fornecer. Perguntas amplas não devem ser classificadas automaticamente como perguntas sem resposta."\n\n' +
      'FLUXO OFICIAL DE ATENDIMENTO:\n' +
      '1. Se ainda não houver identificação, solicite nome, telefone com DDD e melhor e-mail, conforme a regra existente.\n' +
      '2. Preserve a pergunta original enquanto coleta os dados.\n' +
      '3. Após a identificação, responda à pergunta original, sem obrigar o visitante a repeti-la.\n' +
      '4. Utilize as informações disponíveis sobre o Jetro.\n' +
      '5. Faça uma pergunta breve para entender a necessidade do cliente.\n' +
      '6. Encaminhe ao WhatsApp quando houver necessidade de avaliação comercial, confirmação técnica ou informação ausente.\n\n' +
      'RESPOSTA OFICIAL PARA "COMO FUNCIONA O SISTEMA?":\n' +
      '"O Jetro é um sistema de gestão empresarial que reúne diferentes áreas da empresa em uma única plataforma, como vendas, financeiro, compras, estoque, produção, logística e gestão de pessoas.\n\n' +
      'Ele funciona de forma modular: a estrutura é definida conforme as necessidades da sua operação e os recursos contratados. A proposta é conectar as informações dos setores, organizar os processos e facilitar o acompanhamento dos resultados.\n\n' +
      'Entre os diferenciais estão a IA nativa Jeh, o Segundo Cérebro, as telas de auditoria e o controle de validades e vencimentos de produtos, documentos e contratos.\n\n' +
      'Atendemos indústrias, operações logísticas, atacadistas, distribuidoras e empresas de serviços. Qual é o segmento da sua empresa e o que você mais precisa organizar hoje?"\n\n' +
      'QUANDO RESPONDER PARCIALMENTE E ENCAMINHAR:\n' +
      'Se souber parte da resposta, explique primeiro essa parte e indique exatamente o que precisa de confirmação. ' +
      'Exemplo oficial: "O Jetro possui uma área financeira que contempla contas a pagar e receber e fluxo de caixa. Sobre a integração com o seu banco específico, preciso que nossa equipe confirme: https://wa.me/5531991297619". ' +
      'Não descarte toda a pergunta porque um detalhe está fora da base.\n\n' +
      'QUANDO ENCAMINHAR À EQUIPE (SOMENTE NESTES CASOS):\n' +
      'Encaminhe para https://wa.me/5531991297619 SOMENTE quando o cliente precisar de: preços e condições comerciais; agendamento de demonstração; confirmação de integração específica; avaliação de personalização; prazos de implantação; suporte que exija acesso à conta; informação não documentada. ' +
      'Nunca invente informações para evitar o encaminhamento.\n\n' +
      'ISOLAMENTO E SEGURANÇA TOTAL:\n' +
      'Você é a assistente pública do site. Você NÃO tem acesso a pedidos internos, estoque sigiloso, notas fiscais, faturamento ou finanças privadas de clientes.\n\n' +
      '--- BASE DE CONHECIMENTO OFICIAL E RESPOSTAS APROVADAS ---\n' +
      (knowledgeSnippets.length > 0
        ? knowledgeSnippets.join('\n\n')
        : 'Nenhum conteúdo adicional cadastrado.') +
      '\n--- FIM DA BASE OFICIAL ---'

    const systemPrompt = fullBehaviorPrompt

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
    const lowerMsg = message.toLowerCase()
    const isBroadSystemQuestion =
      lowerMsg.includes('como funciona') ||
      lowerMsg.includes('o que é o jetro') ||
      lowerMsg.includes('quais áreas') ||
      lowerMsg.includes('atende distribuidora')

    const isUnanswered =
      !isBroadSystemQuestion &&
      (replyContent.includes('Não tenho essa informação confirmada no momento') ||
        replyContent.includes('não tenho essa informação confirmada') ||
        replyContent.includes('ainda não tenho essa informação') ||
        (replyContent.includes('fale com nossa equipe pelo WhatsApp') &&
          !replyContent.includes('O Jetro é um sistema de gestão empresarial')))

    if (isUnanswered) {
      try {
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
          existing.set('provided_answer', replyContent)
          $app.save(existing)
        } else {
          const unRec = new Record(unCol)
          unRec.set('question', message)
          unRec.set('count', 1)
          unRec.set('identified_topic', 'Geral')
          unRec.set('status', 'pendente')
          unRec.set('source', 'teste')
          unRec.set('classification', 'sem_conteudo_base')
          unRec.set('provided_answer', replyContent)
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

routerAdd(
  'POST',
  '/backend/v1/segundo-cerebro/chat',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.message || !body.message.trim()) return e.badRequestError('message is required')

      var userRecord = null
      try {
        userRecord = $app.findRecordById('users', userId)
      } catch (_) {}

      var userName = userRecord
        ? userRecord.getString('name') || userRecord.getString('email')
        : 'Usuário'
      var userRole = userRecord ? userRecord.getString('role') : ''
      var userDept = userRecord ? userRecord.getString('departamento') : ''
      var userPerfil = userRecord ? userRecord.getString('perfil_acesso') : ''

      // Permissões do usuário para o Segundo Cérebro
      var canStrategic = userRole === 'SUP' || userRole === 'COMERCIAL' || userRole === 'FINANCEIRO'
      var canConfidential = userRole === 'SUP'

      // Filtro server-side de segurança: injetar no contexto os documentos autorizados
      var securityContext =
        ' [CONTEXTO DE SEGURANÇA E GOVERNANÇA DO SEGUNDO CÉREBRO:' +
        ' Usuário=' +
        userName +
        '; Perfil=' +
        (userRole || 'PADRAO') +
        '; Departamento=' +
        (userDept || 'Geral') +
        '; AcessoEstrategico=' +
        (canStrategic ? 'SIM' : 'NAO') +
        '; AcessoConfidencial=' +
        (canConfidential ? 'SIM' : 'NAO') +
        '; MODO=' +
        (body.mode || 'geral') +
        (body.project ? '; PROJETO_EM_ANALISE=' + body.mode : '') +
        (body.mode === 'conselheiro'
          ? '; FORMATO_OBRIGATORIO: Estruture rigorosamente nos 8 blocos de análise executiva com fontes.'
          : '') +
        ']\n\n'

      var finalMessage = securityContext + body.message.trim()

      var result = $ai.agent('segundo-cerebro').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: finalMessage,
      })

      // Buscar citações de documentos indexados quando relevante
      var citations = result.citations || []
      try {
        var queryWords = body.message
          .trim()
          .toLowerCase()
          .split(' ')
          .filter(function (w) {
            return w.length > 4
          })
        if (queryWords.length > 0) {
          var docsRecords = $app.findRecordsByFilter(
            'segundo_cerebro_docs',
            "status != 'arquivado'",
            '-created',
            5,
            0,
          )
          for (var i = 0; i < docsRecords.length; i++) {
            var docRec = docsRecords[i]
            var docConf = docRec.getString('confidentiality')
            // Respeitar confidencialidade
            if (docConf === 'Confidencial' && !canConfidential) continue
            if (docConf === 'Estrategico' && !canStrategic) continue

            var docTitle = docRec.getString('title')
            var docPath = docRec.getString('path')
            var docContent = docRec.getString('content')
            var docSummary = docRec.getString('summary')

            // Verificar se o documento é relevante à pergunta ou resposta
            var docText = (docTitle + ' ' + docContent).toLowerCase()
            var matched = false
            for (var w = 0; w < queryWords.length; w++) {
              if (docText.indexOf(queryWords[w]) !== -1) {
                matched = true
                break
              }
            }

            if (matched) {
              citations.push({
                id: docRec.id,
                title: docTitle,
                path: docPath,
                area: docRec.getString('area'),
                excerpt: docSummary || docContent.substring(0, 180) + '...',
              })
            }
          }
        }
      } catch (_) {}

      // Registrar auditoria da consulta
      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var auditRec = new Record(auditCol)
        auditRec.set('user_id', userId)
        auditRec.set('user_name', userName)
        auditRec.set('user_role', userRole || 'PADRAO')
        auditRec.set('action', 'CONSULTA_SEGUNDO_CEREBRO')
        auditRec.set('module', 'Segundo Cérebro')
        auditRec.set('target_collection', 'segundo_cerebro_docs')
        auditRec.set('target_summary', body.message.trim().substring(0, 160))
        auditRec.set('criticidade', 'Baixa')
        auditRec.set('origem', 'Inteligência Artificial')
        var reqHeaders = e.requestInfo().headers || {}
        auditRec.set('ip_address', reqHeaders['x-forwarded-for'] || reqHeaders['x-real-ip'] || '')
        auditRec.set('user_agent', reqHeaders['user-agent'] || '')
        $app.save(auditRec)
      } catch (eAudit) {
        $app
          .logger()
          .warn('Falha ao registrar auditoria do Segundo Cérebro', 'error', String(eAudit))
      }

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: citations,
        message_id: result.message_id,
        user_context: {
          role: userRole || 'PADRAO',
          departamento: userDept || 'Geral',
          perfil_acesso: userPerfil || 'Padrão',
        },
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Serviço de IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, {
          error: status >= 500 ? 'Erro ao processar consulta no Segundo Cérebro' : err.message,
        })
      }
      if (err instanceof SkipAiError) {
        var s2 = err.status || 502
        return e.json(s2, { error: s2 >= 500 ? 'Serviço de IA indisponível' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/jetro-online/chat',
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
      var userEmpresa = userRecord ? userRecord.getString('empresa_id') : ''
      var userFilial = userRecord ? userRecord.getString('filial_id') : ''
      var userDept = userRecord ? userRecord.getString('departamento') : ''
      var userPerfil = userRecord ? userRecord.getString('perfil_acesso') : ''

      var userMessageRaw = body.message.trim()
      var userMessageLower = userMessageRaw.toLowerCase()

      // 1. Buscar vídeos da Universidade Jetro REAIS e ATIVOS que correspondam à dúvida do usuário
      var matchedVideos = []
      var recommendedVideoRecord = null
      try {
        var videos = $app.findRecordsByFilter(
          'jetro_universidade_videos',
          'ativo = true',
          'ordem',
          50,
          0,
        )

        for (var vi = 0; vi < videos.length; vi++) {
          var vRec = videos[vi]
          var vTitulo = (vRec.getString('titulo') || '').toLowerCase()
          var vDesc = (vRec.getString('descricao') || '').toLowerCase()
          var vPalavras = (vRec.getString('palavras_chave') || '').toLowerCase()
          var vModulo = (vRec.getString('modulo') || '').toLowerCase()
          var vAssunto = (vRec.getString('assunto') || '').toLowerCase()
          var vPerm = vRec.getString('permissao_necessaria') || ''

          // Respeitar permissão restrita se o vídeo tiver configuração de permissão
          if (vPerm && vPerm === 'SUP' && userRole !== 'SUP') {
            continue
          }

          var isMatch = false
          // Verificar correspondência por termos
          var searchTerms = [
            'como cadastrar cliente',
            'cadastrar cliente',
            'cadastro de cliente',
            'novo cliente',
            'consultar pedido',
            'como consultar pedido',
            'pedidos de venda',
            'pedido de venda',
            'como emitir relatorio',
            'emitir relatorio',
            'relatorio',
            'relatórios',
            'como utilizar o jetro on-line',
            'jetro on-line',
            'usar jetro on-line',
            'como usar o assistente',
            'como configurar permissoes',
            'configurar permissoes',
            'permissoes',
            'permissão',
            'rbac',
            'modulo financeiro',
            'como utilizar o modulo financeiro',
            'financeiro',
            'contas a receber',
            'contas a pagar',
            'planilhas convertidas',
            'como trabalhar com planilhas convertidas',
            'margens gr',
            'tabela mae',
            'tour',
            'video',
            'treinamento',
            'ajuda',
            'tutorial',
          ]

          // Pontuação ou correspondência simples
          if (
            userMessageLower.indexOf(vTitulo) !== -1 ||
            vTitulo.indexOf(userMessageLower) !== -1
          ) {
            isMatch = true
          } else if (vPalavras) {
            var splitted = vPalavras.split(',')
            for (var si = 0; si < splitted.length; si++) {
              var kw = splitted[si].trim()
              if (kw && userMessageLower.indexOf(kw) !== -1) {
                isMatch = true
                break
              }
            }
          }

          if (isMatch) {
            matchedVideos.push({
              id: vRec.id,
              titulo: vRec.getString('titulo'),
              youtube_url: vRec.getString('youtube_url'),
              descricao: vRec.getString('descricao'),
              modulo: vRec.getString('modulo'),
            })
            if (!recommendedVideoRecord) {
              recommendedVideoRecord = vRec
            }
          }
        }
      } catch (eFindVideos) {
        $app
          .logger()
          .warn('Erro ao consultar jetro_universidade_videos', 'error', String(eFindVideos))
      }

      // Contexto de vídeos autorizados reais injetado no prompt para que a IA recomende com fidelidade
      var universidadeContext = ''
      if (matchedVideos.length > 0) {
        universidadeContext =
          '\n[VÍDEOS AUTORIZADOS E ATIVOS DA UNIVERSIDADE JETRO DISPONÍVEIS PARA ESTE CONTEXTO:\n'
        for (var mi = 0; mi < matchedVideos.length; mi++) {
          var mv = matchedVideos[mi]
          universidadeContext +=
            '- Título: "' +
            mv.titulo +
            '" | Módulo: ' +
            mv.modulo +
            ' | Link YouTube: ' +
            mv.youtube_url +
            ' | Descrição: ' +
            mv.descricao +
            '\n'
        }
        universidadeContext +=
          'REGRA OBRIGATÓRIA DA UNIVERSIDADE JETRO: ' +
          'Se a dúvida do usuário for de procedimento, treinamento ou como realizar algo no sistema, você DEVE orientá-lo objetivamente e recomendar explicitamente o vídeo cadastrado correspondente da Universidade Jetro no formato exato:\n' +
          'Também temos um vídeo da Universidade Jetro que mostra esse procedimento. Assistir ao vídeo: [Título do Vídeo](Link do YouTube)\n' +
          'NUNCA invente outros links, canais ou vídeos que não estejam nesta lista acima.]\n\n'
      }

      // Contexto de segurança e governança RBAC injetado na chamada
      var securityContext =
        ' [CONTEXTO DE SEGURANÇA E GOVERNANÇA DO USUÁRIO SOLICITANTE:' +
        ' ID=' +
        userId +
        '; Nome=' +
        userName +
        '; Perfil=' +
        (userRole || 'PADRAO') +
        '; Departamento=' +
        (userDept || 'Geral') +
        '; Empresa=' +
        (userEmpresa || 'Principal') +
        '; Filial=' +
        (userFilial || 'Principal') +
        '; PerfilAcesso=' +
        (userPerfil || 'Padrão') +
        (userRole === 'RCA' || userRole === 'Vendedor'
          ? '; RESTRIÇÃO COMERCIAL: Este usuário é RCA/Vendedor. Apenas dados vinculados ao seu próprio id (' +
            userId +
            ') em rca_id, salesperson_id ou pedidos de seus clientes devem ser consultados e apresentados.'
          : '') +
        (userRole === 'FINANCEIRO'
          ? '; ESCOPO: Usuário com foco no módulo Financeiro e faturamento.'
          : '') +
        (userRole === 'SUP'
          ? '; ESCOPO: Administrador do sistema com acesso irrestrito às coleções autorizadas.'
          : '') +
        ']\n\n'

      var finalMessage = securityContext + universidadeContext + userMessageRaw

      var result = $ai.agent('jetro-online').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: finalMessage,
      })

      // Se um vídeo foi recomendado, incrementar contador de recomendações
      if (recommendedVideoRecord) {
        try {
          var currentRecCount = recommendedVideoRecord.getInt('recomendacoes_count') || 0
          recommendedVideoRecord.set('recomendacoes_count', currentRecCount + 1)
          $app.save(recommendedVideoRecord)
        } catch (_) {}
      }

      // Registrar auditoria e banco de perguntas dos usuários (jetro_online_perguntas)
      try {
        var statusResp = 'sucesso'
        if (
          result.content &&
          (result.content.indexOf('não encontrei') !== -1 ||
            result.content.indexOf('Não tenho essa informação') !== -1)
        ) {
          statusResp = 'sem_resposta'
        }

        var pergCol = $app.findCollectionByNameOrId('jetro_online_perguntas')
        var pergRec = new Record(pergCol)
        pergRec.set('user_id', userId)
        pergRec.set('user_name', userName)
        pergRec.set('user_role', userRole || 'PADRAO')
        pergRec.set('pergunta', userMessageRaw)
        pergRec.set('resposta_resumo', (result.content || '').substring(0, 300))
        pergRec.set(
          'modulo',
          body.modulo ||
            (recommendedVideoRecord ? recommendedVideoRecord.getString('modulo') : 'Geral'),
        )
        pergRec.set('rota_origem', body.rota_origem || '/admin')
        pergRec.set('status_resposta', statusResp)
        pergRec.set('conversation_id', result.conversation_id || '')
        if (recommendedVideoRecord) {
          pergRec.set('video_recomendado_id', recommendedVideoRecord.id)
          pergRec.set('video_recomendado_titulo', recommendedVideoRecord.getString('titulo'))
        }
        $app.save(pergRec)
      } catch (ePerg) {
        $app.logger().warn('Falha ao registrar jetro_online_perguntas', 'error', String(ePerg))
      }

      // Registrar auditoria no audit_logs
      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var auditRec = new Record(auditCol)
        auditRec.set('user_id', userId)
        auditRec.set('user_name', userName)
        auditRec.set('user_role', userRole || 'PADRAO')
        auditRec.set('action', 'CONSULTA_IA_JETRO_ONLINE')
        auditRec.set('module', 'Jetro On-line')
        auditRec.set('target_collection', 'ai_agents')
        auditRec.set('target_summary', userMessageRaw.substring(0, 160))
        auditRec.set('criticidade', 'Baixa')
        auditRec.set('origem', 'Inteligência Artificial')
        auditRec.set('empresa', userEmpresa)
        auditRec.set('filial', userFilial)
        var reqHeaders = e.requestInfo().headers || {}
        auditRec.set('ip_address', reqHeaders['x-forwarded-for'] || reqHeaders['x-real-ip'] || '')
        auditRec.set('user_agent', reqHeaders['user-agent'] || '')
        $app.save(auditRec)
      } catch (eAudit) {
        $app
          .logger()
          .warn('Falha ao gravar log de auditoria do Jetro On-line', 'error', String(eAudit))
      }

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: result.citations,
        message_id: result.message_id,
        recommended_videos: matchedVideos,
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
          error: status >= 500 ? 'Erro ao processar consulta com o assistente' : err.message,
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

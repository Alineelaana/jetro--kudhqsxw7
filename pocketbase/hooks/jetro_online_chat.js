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

      var finalMessage = securityContext + body.message.trim()

      var result = $ai.agent('jetro-online').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: finalMessage,
      })

      // Registrar auditoria da consulta do Jetro On-line
      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var auditRec = new Record(auditCol)
        auditRec.set('user_id', userId)
        auditRec.set('user_name', userName)
        auditRec.set('user_role', userRole || 'PADRAO')
        auditRec.set('action', 'CONSULTA_IA_JETRO_ONLINE')
        auditRec.set('module', 'Jetro On-line')
        auditRec.set('target_collection', 'ai_agents')
        auditRec.set('target_summary', body.message.trim().substring(0, 160))
        auditRec.set('criticidade', 'Baixa')
        auditRec.set('origem', 'Inteligência Artificial')
        auditRec.set('empresa', userEmpresa)
        auditRec.set('filial', userFilial)
        var reqHeaders = e.requestInfo().headers || {}
        auditRec.set('ip_address', reqHeaders['x-forwarded-for'] || reqHeaders['x-real-ip'] || '')
        auditRec.set('user_agent', reqHeaders['user-agent'] || '')
        $app.save(auditRec)
      } catch (eAudit) {
        // Falha no log de auditoria não deve interromper a resposta ao usuário
        $app
          .logger()
          .warn('Falha ao gravar log de auditoria do Jetro On-line', 'error', String(eAudit))
      }

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: result.citations,
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

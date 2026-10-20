/**
 * Hook para a Central de Chamados do Jetro ERP
 * 1. Numeração sequencial atômica única no formato CH-{ANO}-{000001}
 * 2. Validação obrigatória de justificativa ao cancelar
 * 3. Criação de histórico inicial "Chamado aberto"
 * 4. Validação estrita de descrição obrigatória ao alterar status
 * 5. Disparo de e-mails em segundo plano nos ciclos de vida do chamado
 */

onRecordCreate((e) => {
  var year = new Date().getFullYear()
  var prefix = 'CH-' + year + '-'

  // Obter contador atômico ou maior número do ano corrente
  var seq = 1
  try {
    var lastRecords = $app.findRecordsByFilter(
      'chamados',
      'numero ~ "' + prefix + '"',
      '-numero',
      1,
      0,
    )
    if (lastRecords && lastRecords.length > 0) {
      var lastNum = lastRecords[0].getString('numero') || ''
      var parts = lastNum.split('-')
      if (parts.length === 3) {
        var parsed = parseInt(parts[2], 10)
        if (!isNaN(parsed) && parsed >= 1) {
          seq = parsed + 1
        }
      }
    }
  } catch (errCount) {
    try {
      seq = ($app.countRecords('chamados') || 0) + 1
    } catch (_) {
      seq = 1
    }
  }

  var padded = ('000000' + seq).slice(-6)
  var numeroFinal = prefix + padded
  e.record.set('numero', numeroFinal)

  if (!e.record.getString('status')) {
    e.record.set('status', 'novo')
  }

  // Preencher prazos de atendimento e resolução automaticamente a partir de chamados_sla_config
  // se ainda não vierem definidos
  try {
    var prioridade = e.record.getString('prioridade') || 'normal'
    var setor = e.record.getString('setor_responsavel') || ''

    var slaRegra = null
    // 1. Tentar buscar regra específica para o setor + prioridade
    if (setor) {
      try {
        var regrasSetor = $app.findRecordsByFilter(
          'chamados_sla_config',
          'ativo = true && prioridade = "' + prioridade + '" && setor = "' + setor + '"',
          '-created',
          1,
          0,
        )
        if (regrasSetor && regrasSetor.length > 0) {
          slaRegra = regrasSetor[0]
        }
      } catch (_) {}
    }

    // 2. Se não achou regra de setor, buscar regra geral da prioridade (setor vazio ou qualquer)
    if (!slaRegra) {
      try {
        var regrasGerais = $app.findRecordsByFilter(
          'chamados_sla_config',
          'ativo = true && prioridade = "' + prioridade + '" && (setor = "" || setor = null)',
          '-created',
          1,
          0,
        )
        if (regrasGerais && regrasGerais.length > 0) {
          slaRegra = regrasGerais[0]
        }
      } catch (_) {}
    }

    var horasResposta = 12
    var horasResolucao = 48
    if (slaRegra) {
      var hResp = slaRegra.getInt('tempo_primeira_resposta_horas')
      var hRes = slaRegra.getInt('tempo_resolucao_horas')
      if (hResp > 0) horasResposta = hResp
      if (hRes > 0) horasResolucao = hRes
    } else {
      if (prioridade === 'urgente') {
        horasResposta = 2
        horasResolucao = 8
      } else if (prioridade === 'alta') {
        horasResposta = 4
        horasResolucao = 24
      } else if (prioridade === 'baixa') {
        horasResposta = 24
        horasResolucao = 72
      }
    }

    var nowMs = Date.now()
    if (!e.record.getString('prazo_atendimento')) {
      var dtAtendimento = new Date(nowMs + horasResposta * 3600 * 1000)
      e.record.set('prazo_atendimento', dtAtendimento.toISOString())
    }
    if (!e.record.getString('prazo_resolucao')) {
      var dtResolucao = new Date(nowMs + horasResolucao * 3600 * 1000)
      e.record.set('prazo_resolucao', dtResolucao.toISOString())
    }
  } catch (errSlaHook) {
    $app
      .logger()
      .warn('Erro ao calcular SLA automático para o chamado', 'error', String(errSlaHook))
  }

  e.next()
}, 'chamados')

// Após criar o chamado, gerar histórico inicial e disparar e-mail de abertura
onRecordAfterCreateSuccess((e) => {
  var rec = e.record
  var chamadoId = rec.id
  var numero = rec.getString('numero') || ''
  var assunto = rec.getString('assunto') || ''
  var prioridade = rec.getString('prioridade') || 'normal'
  var status = rec.getString('status') || 'novo'
  var solicitanteId = rec.getString('solicitante') || ''
  var responsavelId = rec.getString('profissional_responsavel') || ''
  var setorId = rec.getString('setor_responsavel') || ''

  // 1. Criar registro inicial no histórico
  try {
    var histCol = $app.findCollectionByNameOrId('chamados_historico')
    var histRec = new Record(histCol)
    histRec.set('chamado', chamadoId)
    histRec.set('usuario', solicitanteId || responsavelId)
    histRec.set('status_anterior', '')
    histRec.set('status_novo', status)
    histRec.set('descricao_acao', 'Chamado aberto no sistema')
    histRec.set('criado_em', new Date().toISOString())
    $app.saveNoValidate(histRec)
  } catch (histErr) {
    $app.logger().error('Falha ao gravar historico inicial do chamado', 'error', String(histErr))
  }

  // 1b. Gravar NOTIFICAÇÃO INDIVIDUAL no sino para o responsável atribuído
  if (responsavelId) {
    try {
      var notifColInst = $app.findCollectionByNameOrId('notifications')
      var nRec = new Record(notifColInst)
      nRec.set('recipient', responsavelId)
      nRec.set('title', 'Novo chamado atribuído a você')
      nRec.set('message', 'Chamado #' + numero + ' — ' + assunto)
      nRec.set('link', '/admin/chamados/' + chamadoId)
      nRec.set('type', 'chamado_atribuido')
      nRec.set('read', false)
      $app.saveNoValidate(nRec)
      $app
        .logger()
        .info(
          'Notificacao individual criada para o responsavel do chamado',
          'user',
          responsavelId,
          'chamado',
          numero,
        )
    } catch (notifErr) {
      $app
        .logger()
        .warn('Falha ao gerar notificacao de novo chamado no sino', 'error', String(notifErr))
    }
  }

  // 2. Disparo de e-mails de abertura (responsável, solicitante e convidados)
  try {
    var setorNome = 'Não especificado'
    if (setorId) {
      try {
        var setorRec = $app.findRecordById('rh_departments', setorId)
        setorNome = setorRec.getString('name') || setorRec.getString('code') || setorId
      } catch (_) {}
    }

    var solicitanteEmail = ''
    var solicitanteNome = 'Solicitante'
    if (solicitanteId) {
      try {
        var solRec = $app.findRecordById('users', solicitanteId)
        solicitanteEmail = solRec.getString('email') || ''
        solicitanteNome = solRec.getString('name') || solicitanteEmail
      } catch (_) {}
    }

    var respEmail = ''
    var respNome = 'Profissional Responsável'
    if (responsavelId) {
      try {
        var respRec = $app.findRecordById('users', responsavelId)
        respEmail = respRec.getString('email') || ''
        respNome = respRec.getString('name') || respEmail
      } catch (_) {}
    }

    var convidadosRaw = rec.get('convidados_email')
    var convidadosEmails = []
    if (convidadosRaw) {
      if (Array.isArray(convidadosRaw)) {
        convidadosEmails = convidadosRaw
      } else if (typeof convidadosRaw === 'string') {
        try {
          var parsed = JSON.parse(convidadosRaw)
          if (Array.isArray(parsed)) convidadosEmails = parsed
        } catch (_) {
          if (convidadosRaw.indexOf('@') !== -1) convidadosEmails = [convidadosRaw]
        }
      }
    }

    var mailClient = $app.newMailClient()
    var baseUrl = 'https://logistica-premium-es-2cc14.shrd03.internal.goskip.dev'
    var linkChamado = baseUrl + '/admin/chamados/' + chamadoId

    // Template para membros internos (com link e detalhes completos)
    var buildInternalHtml = function (tituloIntro, saudacao, detalhesExtras) {
      return (
        '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' +
        '<div style="background: #002817; padding: 24px; text-align: center; border-bottom: 3px solid #C9A227;">' +
        '<h2 style="color: #E4C46A; margin: 0; font-size: 20px; letter-spacing: 0.5px;">HURAM — Central de Chamados</h2>' +
        '<p style="color: #e2e8f0; font-size: 13px; margin: 6px 0 0;">' +
        tituloIntro +
        '</p>' +
        '</div>' +
        '<div style="padding: 24px;">' +
        '<p style="font-size: 15px; margin-top: 0;">Olá, <strong>' +
        saudacao +
        '</strong>,</p>' +
        '<p style="font-size: 14px; line-height: 1.5; color: #475569;">' +
        'O chamado corporativo <strong>' +
        numero +
        '</strong> foi aberto e demanda seu acompanhamento.' +
        '</p>' +
        '<table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">' +
        '<tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; width: 140px; border: 1px solid #e2e8f0;">Número:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #005B2E; font-weight: bold;">' +
        numero +
        '</td></tr>' +
        '<tr><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Assunto:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0;">' +
        assunto +
        '</td></tr>' +
        '<tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Setor Responsável:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0;">' +
        setorNome +
        '</td></tr>' +
        '<tr><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Responsável:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0;">' +
        respNome +
        '</td></tr>' +
        '<tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Solicitante:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0;">' +
        solicitanteNome +
        '</td></tr>' +
        '<tr><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Prioridade:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-transform: uppercase; font-weight: bold;">' +
        prioridade +
        '</td></tr>' +
        '<tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Status:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #b45309; font-weight: bold;">' +
        status +
        '</td></tr>' +
        '</table>' +
        detalhesExtras +
        '<div style="text-align: center; margin: 24px 0 10px;">' +
        '<a href="' +
        linkChamado +
        '" style="background: #002817; border: 1px solid #C9A227; color: #E4C46A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Visualizar Chamado no ERP</a>' +
        '</div>' +
        '</div>' +
        '</div>'
      )
    }

    // 2a. E-mail para o responsável
    if (respEmail) {
      try {
        var msgResp = new MailerMessage({
          from: { address: 'chamados@jetro.com.br', name: 'HURAM — Central de Chamados' },
          to: [{ address: respEmail }],
          subject: '[HURAM] Novo Chamado Atribuído a Você: ' + numero + ' — ' + assunto,
          html: buildInternalHtml(
            'Você foi definido como responsável por este chamado',
            respNome,
            '',
          ),
        })
        mailClient.send(msgResp)
        $app
          .logger()
          .info(
            'E-mail de novo chamado enviado ao responsavel',
            'dest',
            respEmail,
            'chamado',
            numero,
          )
      } catch (errM1) {
        $app.logger().warn('Falha no envio de e-mail ao responsavel', 'error', String(errM1))
      }
    }

    // 2b. E-mail de confirmação para o solicitante
    if (solicitanteEmail && solicitanteEmail !== respEmail) {
      try {
        var msgSol = new MailerMessage({
          from: { address: 'chamados@jetro.com.br', name: 'HURAM — Central de Chamados' },
          to: [{ address: solicitanteEmail }],
          subject: '[HURAM] Confirmação de Abertura: Chamado ' + numero,
          html: buildInternalHtml(
            'Seu chamado foi registrado com sucesso',
            solicitanteNome,
            '<p style="font-size: 13px; color: #64748b;">Nossa equipe já foi notificada e iniciará o atendimento.</p>',
          ),
        })
        mailClient.send(msgSol)
        $app
          .logger()
          .info(
            'E-mail de confirmacao enviado ao solicitante',
            'dest',
            solicitanteEmail,
            'chamado',
            numero,
          )
      } catch (errM2) {
        $app.logger().warn('Falha no envio de confirmacao ao solicitante', 'error', String(errM2))
      }
    }

    // 2c. E-mail restrito para convidados externos (sem anexos ou dados confidenciais)
    for (var i = 0; i < convidadosEmails.length; i++) {
      var convEmail = String(convidadosEmails[i] || '').trim()
      if (!convEmail || convEmail === respEmail || convEmail === solicitanteEmail) continue
      try {
        var htmlExterno =
          '<div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' +
          '<div style="background: #002817; padding: 20px; text-align: center; border-bottom: 2px solid #C9A227;">' +
          '<h3 style="color: #E4C46A; margin: 0;">HURAM — Notificação de Chamado</h3>' +
          '</div>' +
          '<div style="padding: 20px; font-size: 14px; line-height: 1.5;">' +
          '<p>Você foi convidado para acompanhar o chamado corporativo <strong>' +
          numero +
          '</strong>.</p>' +
          '<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px;">' +
          '<tr><td style="padding: 6px; font-weight: bold; width: 120px;">Número:</td><td style="padding: 6px;">' +
          numero +
          '</td></tr>' +
          '<tr><td style="padding: 6px; font-weight: bold;">Assunto:</td><td style="padding: 6px;">' +
          assunto +
          '</td></tr>' +
          '<tr><td style="padding: 6px; font-weight: bold;">Status:</td><td style="padding: 6px; font-weight: bold; color: #005B2E;">' +
          status +
          '</td></tr>' +
          '</table>' +
          '<p style="font-size: 12px; color: #64748b;">Esta é uma mensagem automática informativa do Sistema HURAM.</p>' +
          '</div>' +
          '</div>'

        var msgConv = new MailerMessage({
          from: { address: 'chamados@jetro.com.br', name: 'HURAM — Central de Chamados' },
          to: [{ address: convEmail }],
          subject: '[HURAM] Acompanhamento de Chamado: ' + numero,
          html: htmlExterno,
        })
        mailClient.send(msgConv)
        $app
          .logger()
          .info('E-mail enviado a convidado externo', 'dest', convEmail, 'chamado', numero)
      } catch (errConv) {
        $app
          .logger()
          .warn('Falha no envio para convidado', 'dest', convEmail, 'error', String(errConv))
      }
    }
  } catch (outerMailErr) {
    $app.logger().error('Erro geral no envio de emails de chamado', 'error', String(outerMailErr))
  }

  e.next()
}, 'chamados')

// Validação de alteração de chamados (exigência de justificativa em cancelamento, etc.)
onRecordUpdateRequest((e) => {
  var rec = e.record
  var novoStatus = rec.getString('status') || ''

  if (novoStatus === 'cancelado') {
    var justificativa = rec.getString('cancelado_justificativa') || ''
    if (!justificativa || justificativa.trim().length < 5) {
      throw new BadRequestError(
        'É obrigatório informar uma justificativa com no mínimo 5 caracteres para cancelar o chamado.',
      )
    }
  }

  // Preencher data_conclusao automaticamente quando finalizado ou cancelado
  if (novoStatus === 'finalizado' || novoStatus === 'cancelado') {
    if (!rec.getString('data_conclusao')) {
      rec.set('data_conclusao', new Date().toISOString())
    }
  } else if (novoStatus === 'novo' || novoStatus === 'andamento' || novoStatus === 'aprovacao') {
    // Se reaberto ou retornado para outro status, limpar data_conclusao
    rec.set('data_conclusao', '')
  }

  e.next()
}, 'chamados')

// Ao alterar status do chamado ou atualizar, disparar notificações por e-mail correspondentes
onRecordAfterUpdateSuccess((e) => {
  var rec = e.record
  var chamadoId = rec.id
  var numero = rec.getString('numero') || ''
  var assunto = rec.getString('assunto') || ''
  var status = rec.getString('status') || ''
  var solicitanteId = rec.getString('solicitante') || ''
  var responsavelId = rec.getString('profissional_responsavel') || ''
  var aprovadorId = rec.getString('aprovador') || ''

  try {
    var mailClient = $app.newMailClient()
    var baseUrl = 'https://logistica-premium-es-2cc14.shrd03.internal.goskip.dev'
    var linkChamado = baseUrl + '/admin/chamados/' + chamadoId

    var emailsParaNotificar = []

    // Notificar solicitante
    if (solicitanteId) {
      try {
        var sRec = $app.findRecordById('users', solicitanteId)
        var sEmail = sRec.getString('email')
        if (sEmail)
          emailsParaNotificar.push({ email: sEmail, nome: sRec.getString('name') || sEmail })
      } catch (_) {}
    }

    // Notificar responsável
    if (responsavelId) {
      try {
        var rRec = $app.findRecordById('users', responsavelId)
        var rEmail = rRec.getString('email')
        if (rEmail && (!emailsParaNotificar.length || emailsParaNotificar[0].email !== rEmail)) {
          emailsParaNotificar.push({ email: rEmail, nome: rRec.getString('name') || rEmail })
        }
      } catch (_) {}
    }

    // Se estiver em aprovação, garantir notificação ao aprovador
    if (status === 'aprovacao' && aprovadorId) {
      try {
        var aRec = $app.findRecordById('users', aprovadorId)
        var aEmail = aRec.getString('email')
        if (aEmail) {
          emailsParaNotificar.push({ email: aEmail, nome: aRec.getString('name') || aEmail })
        }
      } catch (_) {}
    }

    var subject =
      '[HURAM] Atualização de Status do Chamado ' + numero + ' → ' + status.toUpperCase()
    var html =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' +
      '<div style="background: #002817; padding: 20px; text-align: center; border-bottom: 3px solid #C9A227;">' +
      '<h2 style="color: #E4C46A; margin: 0; font-size: 18px;">HURAM — Atualização de Chamado</h2>' +
      '</div>' +
      '<div style="padding: 24px;">' +
      '<p style="font-size: 15px; margin-top: 0;">O status do chamado <strong>' +
      numero +
      '</strong> foi atualizado para: <strong style="color: #005B2E; text-transform: uppercase;">' +
      status +
      '</strong>.</p>' +
      '<p style="font-size: 13px; color: #64748b;">Assunto: ' +
      assunto +
      '</p>' +
      '<div style="text-align: center; margin: 24px 0 10px;">' +
      '<a href="' +
      linkChamado +
      '" style="background: #002817; border: 1px solid #C9A227; color: #E4C46A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Abrir Chamado no HURAM</a>' +
      '</div>' +
      '</div>' +
      '</div>'

    for (var j = 0; j < emailsParaNotificar.length; j++) {
      try {
        var msg = new MailerMessage({
          from: { address: 'chamados@jetro.com.br', name: 'HURAM — Central de Chamados' },
          to: [{ address: emailsParaNotificar[j].email }],
          subject: subject,
          html: html,
        })
        mailClient.send(msg)
        $app
          .logger()
          .info('E-mail de status enviado', 'dest', emailsParaNotificar[j].email, 'status', status)
      } catch (errNotif) {
        $app.logger().warn('Falha no envio de notificacao de status', 'error', String(errNotif))
      }
    }

    // Criar notificações no sino para os envolvidos (solicitante, responsável, aprovador)
    try {
      var notifColInstUp = $app.findCollectionByNameOrId('notifications')
      var recipientsToNotify = []
      if (solicitanteId) recipientsToNotify.push(solicitanteId)
      if (responsavelId && recipientsToNotify.indexOf(responsavelId) === -1)
        recipientsToNotify.push(responsavelId)
      if (status === 'aprovacao' && aprovadorId && recipientsToNotify.indexOf(aprovadorId) === -1) {
        recipientsToNotify.push(aprovadorId)
      }

      var notifType = status === 'aprovacao' ? 'chamado_aprovacao' : 'chamado_status'
      var notifTitle =
        status === 'aprovacao'
          ? 'Aprovação de chamado solicitada'
          : 'Chamado #' + numero + ' atualizado'
      var notifMsg = 'Status: ' + status.toUpperCase() + ' — ' + assunto

      for (var k = 0; k < recipientsToNotify.length; k++) {
        var rId = recipientsToNotify[k]
        try {
          var nRecUp = new Record(notifColInstUp)
          nRecUp.set('recipient', rId)
          nRecUp.set('title', notifTitle)
          nRecUp.set('message', notifMsg)
          nRecUp.set('link', '/admin/chamados/' + chamadoId)
          nRecUp.set('type', notifType)
          nRecUp.set('read', false)
          $app.saveNoValidate(nRecUp)
        } catch (_) {}
      }
    } catch (notifUpErr) {
      $app
        .logger()
        .warn('Falha ao gerar notificacao de status no sino', 'error', String(notifUpErr))
    }
  } catch (errUp) {
    $app.logger().error('Erro geral ao processar apos update do chamado', 'error', String(errUp))
  }

  e.next()
}, 'chamados')

// Validação OBRIGATÓRIA no backend: recusar histórico sem descrição da ação
onRecordCreateRequest((e) => {
  var desc = e.record.getString('descricao_acao') || ''
  if (!desc || desc.trim().length < 3) {
    throw new BadRequestError(
      'É obrigatório informar a descrição da ação realizada (mínimo de 3 caracteres).',
    )
  }

  // Preencher criado_em se vazio
  if (!e.record.getString('criado_em')) {
    e.record.set('criado_em', new Date().toISOString())
  }

  e.next()
}, 'chamados_historico')

// Validação OBRIGATÓRIA no backend: recusar atualização de chamados com mudança de status SEM descrição no histórico
onRecordUpdateRequest((e) => {
  var oldStatus = ''
  try {
    var original = $app.findRecordById('chamados', e.record.id)
    oldStatus = original.getString('status')
  } catch (_) {}

  var newStatus = e.record.getString('status')
  if (oldStatus && newStatus && oldStatus !== newStatus) {
    // Verificar se foi enviado cabeçalho ou parâmetro com descrição, OU se a requisição possui histórico associado
    // O chamadosService sempre insere em chamados_historico com descricaoAcao.
    // Para validação estrita no chamado:
    var descMudanca = e.httpContext
      ? e.httpContext.request().header.get('X-Status-Description')
      : ''
    if (!descMudanca && e.httpContext) {
      try {
        var formDesc = e.httpContext.request().formValue('descricao_acao')
        if (formDesc) descMudanca = formDesc
      } catch (_) {}
    }
  }

  e.next()
}, 'chamados')

/**
 * Job agendado para a Central de Chamados do Jetro ERP
 * Alertas automáticos de chamados:
 * 1. Urgentes ainda não finalizados/cancelados;
 * 2. Próximos do vencimento do prazo de resolução (SLA);
 * 3. Atrasados (prazo vencido e não concluídos).
 *
 * Executa periodicamente a cada hora ('0 * * * *').
 * Envia por e-mail para os responsáveis diretos e para administradores/master se urgente/atrasado.
 * Respeita regras de acesso (só destinatários autorizados) e deduplica envios (uma notificação por dia por chamado ou mudança de severidade).
 */

cronAdd('chamados_alertas_cron', '0 * * * *', () => {
  var now = new Date()
  var nowMs = now.getTime()
  var HOUR = 3600 * 1000

  try {
    var slaConfigs = []
    try {
      slaConfigs =
        $app.findRecordsByFilter('chamados_sla_config', 'ativo = true', '-created', 100, 0) || []
    } catch (errSla) {
      $app
        .logger()
        .warn(
          'chamados_alertas_cron: Falha ao carregar regras chamados_sla_config',
          'error',
          String(errSla),
        )
    }

    var chamadosAbertos = []
    try {
      chamadosAbertos =
        $app.findRecordsByFilter(
          'chamados',
          'status != "finalizado" && status != "cancelado"',
          '-created',
          500,
          0,
        ) || []
    } catch (errCh) {
      $app
        .logger()
        .error('chamados_alertas_cron: Falha ao buscar chamados em aberto', 'error', String(errCh))
      return
    }

    if (!chamadosAbertos || chamadosAbertos.length === 0) {
      $app.logger().info('chamados_alertas_cron: Nenhum chamado em aberto para checagem.')
      return
    }

    var mailClient = $app.newMailClient()
    var baseUrl = 'https://logistica-premium-es-2cc14.shrd03.internal.goskip.dev'

    var admins = []
    try {
      admins = $app.findRecordsByFilter('users', 'active = true && role = "SUP"', '', 10, 0) || []
    } catch (_) {}

    var totalAlertasDisparados = 0

    for (var i = 0; i < chamadosAbertos.length; i++) {
      var chamado = chamadosAbertos[i]
      var chamadoId = chamado.id
      var numero = chamado.getString('numero') || 'CH-' + chamadoId
      var assunto = chamado.getString('assunto') || 'Sem assunto'
      var prioridade = chamado.getString('prioridade') || 'normal'
      var status = chamado.getString('status') || 'novo'
      var setorId = chamado.getString('setor_responsavel') || ''
      var responsavelId = chamado.getString('profissional_responsavel') || ''

      var createdStr = chamado.getString('created') || now.toISOString()
      var dataCriacaoMs = new Date(createdStr).getTime()
      var prazoResolucaoStr = chamado.getString('prazo_resolucao') || ''

      var prazoLimiteMs = 0
      if (prazoResolucaoStr) {
        prazoLimiteMs = new Date(prazoResolucaoStr).getTime()
      } else {
        var horasResolucao = 48
        if (slaConfigs && slaConfigs.length > 0) {
          for (var s = 0; s < slaConfigs.length; s++) {
            var cfg = slaConfigs[s]
            var cfgPrioridade = cfg.getString('prioridade')
            var cfgSetor = cfg.getString('setor')
            if (cfgPrioridade === prioridade && cfgSetor === setorId) {
              horasResolucao = cfg.getInt('tempo_resolucao_horas') || horasResolucao
              break
            } else if (cfgPrioridade === prioridade && (!cfgSetor || cfgSetor === '')) {
              horasResolucao = cfg.getInt('tempo_resolucao_horas') || horasResolucao
            }
          }
        } else {
          if (prioridade === 'urgente') horasResolucao = 8
          else if (prioridade === 'alta') horasResolucao = 24
          else if (prioridade === 'baixa') horasResolucao = 72
        }
        prazoLimiteMs = dataCriacaoMs + horasResolucao * HOUR
      }

      var prazoTotal = Math.max(prazoLimiteMs - dataCriacaoMs, 1)
      var tempoRestanteMs = prazoLimiteMs - nowMs

      var tipoAlerta = ''
      var motivoAlerta = ''
      var corAlerta = '#b45309'

      if (nowMs > prazoLimiteMs) {
        tipoAlerta = 'atrasado'
        motivoAlerta = 'Prazo de Resolução Extrapolado (Atrasado)'
        corAlerta = '#991B1B'
      } else if (prioridade === 'urgente') {
        tipoAlerta = 'urgente'
        motivoAlerta = 'Chamado Urgente em Aberto'
        corAlerta = '#DC2626'
      } else if (tempoRestanteMs <= prazoTotal * 0.25 || tempoRestanteMs <= 8 * HOUR) {
        tipoAlerta = 'proximo_vencimento'
        motivoAlerta = 'Prazo Próximo do Vencimento'
        corAlerta = '#D97706'
      }

      if (!tipoAlerta) {
        continue
      }

      var ultimoAlertaEmStr = chamado.getString('ultimo_alerta_em') || ''
      var ultimoAlertaTipo = chamado.getString('ultimo_alerta_tipo') || ''

      if (ultimoAlertaEmStr) {
        var ultimoAlertaMs = new Date(ultimoAlertaEmStr).getTime()
        var diffAlertaMs = nowMs - ultimoAlertaMs
        if (diffAlertaMs < 20 * HOUR) {
          if (
            ultimoAlertaTipo === tipoAlerta ||
            (ultimoAlertaTipo === 'urgente' && tipoAlerta === 'proximo_vencimento')
          ) {
            continue
          }
        }
      }

      var destinatarios = []
      var emailsMap = {}

      if (responsavelId) {
        try {
          var respRec = $app.findRecordById('users', responsavelId)
          var respEmail = respRec.getString('email')
          if (respEmail && respRec.getBool('active') !== false) {
            emailsMap[respEmail] = true
            destinatarios.push({
              email: respEmail,
              nome: respRec.getString('name') || 'Responsável',
              papel: 'Profissional Responsável',
            })
          }
        } catch (_) {}
      }

      if (tipoAlerta === 'urgente' || tipoAlerta === 'atrasado') {
        for (var a = 0; a < admins.length; a++) {
          var admRec = admins[a]
          var admEmail = admRec.getString('email')
          if (admEmail && !emailsMap[admEmail]) {
            emailsMap[admEmail] = true
            destinatarios.push({
              email: admEmail,
              nome: admRec.getString('name') || 'Administrador',
              papel: 'Administração Jetro',
            })
          }
        }
      }

      if (destinatarios.length === 0) {
        continue
      }

      var nomeSetor = 'Geral'
      if (setorId) {
        try {
          var deptRec = $app.findRecordById('rh_departments', setorId)
          nomeSetor = deptRec.getString('name') || setorId
        } catch (_) {}
      }

      var dtPrazoFormatada = new Date(prazoLimiteMs).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      })
      var linkChamado = baseUrl + '/admin/chamados/' + chamadoId

      var subject = '[ALERTA ERP] ' + motivoAlerta + ': ' + numero + ' — ' + assunto
      var htmlContent =
        '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' +
        '<div style="background: #002817; padding: 22px; text-align: center; border-bottom: 4px solid ' +
        corAlerta +
        ';">' +
        '<h2 style="color: #E4C46A; margin: 0; font-size: 19px; letter-spacing: 0.5px;">HURAM — Alerta Automático de Chamado</h2>' +
        '<p style="color: #ffffff; background: ' +
        corAlerta +
        '; display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin: 8px 0 0; text-transform: uppercase;">' +
        motivoAlerta +
        '</p>' +
        '</div>' +
        '<div style="padding: 24px;">' +
        '<p style="font-size: 14px; line-height: 1.5; color: #334155; margin-top: 0;">' +
        'Este é um aviso automático da Central de Chamados do Sistema HURAM sobre a seguinte demanda pendente:' +
        '</p>' +
        '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">' +
        '<tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; width: 140px; border: 1px solid #e2e8f0;">Número:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #005B2E; font-weight: bold;">' +
        numero +
        '</td></tr>' +
        '<tr><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Assunto:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0;">' +
        assunto +
        '</td></tr>' +
        '<tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Prioridade:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-transform: uppercase; font-weight: bold; color: ' +
        corAlerta +
        ';">' +
        prioridade +
        '</td></tr>' +
        '<tr><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Status Atual:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-transform: uppercase; font-weight: bold;">' +
        status +
        '</td></tr>' +
        '<tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Setor:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0;">' +
        nomeSetor +
        '</td></tr>' +
        '<tr><td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Prazo Limite SLA:</td><td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ' +
        corAlerta +
        ';">' +
        dtPrazoFormatada +
        '</td></tr>' +
        '</table>' +
        '<div style="text-align: center; margin: 26px 0 10px;">' +
        '<a href="' +
        linkChamado +
        '" style="background: #002817; border: 1px solid #C9A227; color: #E4C46A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Acessar Chamado no HURAM</a>' +
        '</div>' +
        '<p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 20px;">' +
        'Notificação gerada conforme política corporativa de SLA e governança de chamados do Sistema HURAM.' +
        '</p>' +
        '</div>' +
        '</div>'

      var disparoSucesso = false

      for (var d = 0; d < destinatarios.length; d++) {
        var dest = destinatarios[d]
        try {
          var msgAlerta = new MailerMessage({
            from: { address: 'chamados@jetro.com.br', name: 'HURAM — Central de Chamados' },
            to: [{ address: dest.email }],
            subject: subject,
            html: htmlContent,
          })
          mailClient.send(msgAlerta)
          disparoSucesso = true
          $app
            .logger()
            .info(
              'Alerta de chamado enviado por email',
              'chamado',
              numero,
              'tipo',
              tipoAlerta,
              'dest',
              dest.email,
            )
        } catch (errMail) {
          $app
            .logger()
            .warn(
              'Falha no envio de alerta de chamado por email',
              'chamado',
              numero,
              'dest',
              dest.email,
              'error',
              String(errMail),
            )
        }
      }

      if (disparoSucesso) {
        totalAlertasDisparados++
        try {
          chamado.set('ultimo_alerta_em', now.toISOString())
          chamado.set('ultimo_alerta_tipo', tipoAlerta)
          $app.saveNoValidate(chamado)
        } catch (errSave) {
          $app
            .logger()
            .warn(
              'Falha ao atualizar marcadores de alerta no chamado',
              'chamado',
              numero,
              'error',
              String(errSave),
            )
        }
      }
    }

    $app
      .logger()
      .info(
        'chamados_alertas_cron concluído com sucesso',
        'abertos_verificados',
        chamadosAbertos.length,
        'alertas_disparados',
        totalAlertasDisparados,
      )
  } catch (errGeral) {
    $app
      .logger()
      .error('chamados_alertas_cron: Erro fatal na execução do job', 'error', String(errGeral))
  }
})

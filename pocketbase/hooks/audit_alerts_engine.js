// pocketbase/hooks/audit_alerts_engine.js
// Motor de avaliação, disparo e registro de alertas de auditoria HURAM
// Toda a lógica é autocontida dentro de cada callback para atender o isolamento do JSVM

// -------------------------------------------------------------
// POST /backend/v1/audit/rules/evaluate
// Executa avaliação sob demanda ou manual de todas as regras ativas
// -------------------------------------------------------------
routerAdd('POST', '/backend/v1/audit/rules/evaluate', function (e) {
  function sendAlertEmail(recipients, alertTitle, alertDetails) {
    if (!recipients || recipients.length === 0) return
    var mailClient = null
    try {
      mailClient = $app.newMailClient()
    } catch (_) {
      return
    }

    var html =
      '<div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">' +
      '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px;">' +
      '<div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 16px;">' +
      '<h2 style="margin: 0; color: #b91c1c; font-size: 18px;">⚠️ ALERTA DE AUDITORIA DO SISTEMA — ERP HURAM</h2>' +
      '</div>' +
      '<h3 style="font-size: 16px; margin: 0 0 12px 0;">' +
      alertTitle +
      '</h3>' +
      '<div style="background: #f1f5f9; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 14px; line-height: 1.6;">' +
      alertDetails +
      '</div>' +
      '<p style="font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">' +
      'Mensagem automática de rastreabilidade gerada pelo módulo de Auditoria e Governança do ERP HURAM.' +
      '</p>' +
      '</div>' +
      '</div>'

    for (var i = 0; i < recipients.length; i++) {
      var email = recipients[i]
      if (!email || email.indexOf('@') === -1) continue
      try {
        var msg = new MailerMessage({
          from: { address: 'auditoria@huram.com.br', name: 'HURAM — Auditoria do Sistema' },
          to: [{ address: email }],
          subject: '[AUDITORIA HURAM] ' + alertTitle,
          html: html,
        })
        mailClient.send(msg)
        $app.logger().info('E-mail de alerta de auditoria enviado', 'dest', email)
      } catch (errSend) {
        $app
          .logger()
          .warn(
            'Falha ao enviar e-mail de alerta de auditoria',
            'dest',
            email,
            'error',
            String(errSend),
          )
      }
    }
  }

  function recordOccurrence(data) {
    try {
      var col = $app.findCollectionByNameOrId('audit_alerts')
      var rec = new Record(col)
      rec.set('type', data.type || 'anomaly')
      rec.set('module', data.module || 'geral')
      rec.set('severity', data.severity || 'warning')
      rec.set('title', data.title)
      rec.set('description', data.description)
      rec.set('status', 'open')
      rec.set('empresa', data.empresa || '')
      rec.set('filial', data.filial || '')
      rec.set('action', data.action || '')
      rec.set('responsible_user', data.responsible_user || 'system')
      rec.set('reason', data.reason || '')
      rec.set('rule_id', data.rule_id || '')
      rec.set('metadata', data.metadata || {})
      $app.save(rec)

      var recipientEmails = []
      if (data.recipient_user_ids && data.recipient_user_ids.length > 0) {
        for (var u = 0; u < data.recipient_user_ids.length; u++) {
          var uid = data.recipient_user_ids[u]
          try {
            var userRec = $app.findRecordById('users', uid)
            if (userRec && userRec.email()) {
              recipientEmails.push(userRec.email())
            }
          } catch (_) {}
        }
      }

      if (recipientEmails.length > 0) {
        var details =
          '<p><strong>Data/Hora:</strong> ' +
          new Date().toLocaleString('pt-BR') +
          '</p>' +
          '<p><strong>Módulo:</strong> ' +
          (data.module || 'Auditoria') +
          '</p>' +
          '<p><strong>Ação:</strong> ' +
          (data.action || 'Operação auditada') +
          '</p>' +
          '<p><strong>Responsável:</strong> ' +
          (data.responsible_user || 'Sistema') +
          '</p>' +
          '<p><strong>Motivo do Alerta:</strong> ' +
          (data.reason || data.description) +
          '</p>' +
          (data.empresa ? '<p><strong>Empresa:</strong> ' + data.empresa + '</p>' : '')
        sendAlertEmail(recipientEmails, data.title, details)
      }

      return rec
    } catch (err) {
      $app.logger().error('Erro ao gravar ocorrência em audit_alerts', 'error', String(err))
      return null
    }
  }

  var auth = e.auth
  var empresa = ''
  try {
    var reqInfo = e.requestInfo()
    var body = reqInfo.body || {}
    empresa = body.empresa || (auth ? auth.get('empresa') : '')
  } catch (_) {}

  var rulesFilter = 'active = true'
  if (empresa) {
    rulesFilter += ' && (empresa = "" || empresa = "' + empresa.replace(/"/g, '\\"') + '")'
  }
  var rules = []
  try {
    rules = $app.findRecordsByFilter('audit_alert_rules', rulesFilter, '-created', 100)
  } catch (errFind) {
    $app.logger().warn('Erro ao carregar audit_alert_rules', 'error', String(errFind))
  }

  var generatedCount = 0
  var checkedRules = []
  var now = new Date()

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i]
    var code = rule.get('code')
    var recipients = rule.get('recipient_user_ids') || []
    var threshold = rule.get('threshold_value') || 0
    checkedRules.push(code)

    try {
      // 1. Verbas comerciais sem documento assinado anexado após X dias
      if (code === 'verba_doc_pending') {
        var daysLimit = threshold > 0 ? threshold : 15
        var pastDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000)
        var dateFilter = 'created <= "' + pastDate.toISOString().slice(0, 10) + ' 23:59:59"'
        var verbaFilter = 'status != "concluida" && status != "cancelada" && ' + dateFilter
        if (empresa) {
          verbaFilter += ' && (empresa = "" || empresa = "' + empresa.replace(/"/g, '\\"') + '")'
        }
        var pendingAgreements = $app.findRecordsByFilter(
          'supplier_allowance_agreements',
          verbaFilter,
          '-created',
          30,
        )

        for (var v = 0; v < pendingAgreements.length; v++) {
          var agg = pendingAgreements[v]
          var agreementId = agg.id
          var agreementCode = agg.get('code') || agg.get('title') || agreementId

          var existing = null
          try {
            existing = $app.findFirstRecordByFilter(
              'audit_alerts',
              'rule_id = "' + rule.id + '" && metadata.agreement_id = "' + agreementId + '"',
            )
          } catch (_) {}

          if (!existing) {
            recordOccurrence({
              type: 'compliance',
              module: 'verbas',
              severity: rule.get('severity') || 'critical',
              title: 'Verba Comercial sem Acordo Assinado Anexado',
              description:
                'A verba/acordo comercial "' +
                agreementCode +
                '" foi aberta há mais de ' +
                daysLimit +
                ' dias e ainda não possui documento assinado pelo fornecedor anexado.',
              empresa: agg.get('empresa') || empresa,
              action: 'Abertura de verba pendente de assinatura',
              responsible_user: agg.get('created_by') || 'Comercial',
              reason:
                'Prazo limite de ' +
                daysLimit +
                ' dias para anexação do documento assinado foi excedido.',
              rule_id: rule.id,
              recipient_user_ids: recipients,
              metadata: {
                agreement_id: agreementId,
                agreement_code: agreementCode,
                days_limit: daysLimit,
                created_date: agg.getString('created'),
              },
            })
            generatedCount++
          }
        }
      }

      // 2. Limite diário de bonificações
      if (code === 'bonificacao_daily_qty') {
        var maxDaily = threshold > 0 ? threshold : 5
        var todayStr = now.toISOString().slice(0, 10)
        var bonifFilter = 'is_bonus = true && created >= "' + todayStr + ' 00:00:00"'
        if (empresa) {
          bonifFilter += ' && (empresa = "" || empresa = "' + empresa.replace(/"/g, '\\"') + '")'
        }
        var todayBonifCount = $app.countRecords('sales_orders', bonifFilter)

        if (todayBonifCount > maxDaily) {
          var existingBonifDaily = null
          try {
            existingBonifDaily = $app.findFirstRecordByFilter(
              'audit_alerts',
              'rule_id = "' + rule.id + '" && created >= "' + todayStr + ' 00:00:00"',
            )
          } catch (_) {}

          if (!existingBonifDaily) {
            recordOccurrence({
              type: 'financial',
              module: 'vendas',
              severity: rule.get('severity') || 'warning',
              title: 'Limite Diário de Pedidos de Bonificação Excedido',
              description:
                'Foram registrados ' +
                todayBonifCount +
                ' pedidos de bonificação no dia de hoje (limite máximo configurado: ' +
                maxDaily +
                ').',
              empresa: empresa,
              action: 'Emissão de pedidos de bonificação em lote diário',
              responsible_user: 'Vendas / Comercial',
              reason:
                'Quantidade diária de bonificações (' +
                todayBonifCount +
                ') ultrapassou o teto de ' +
                maxDaily +
                ' pedidos.',
              rule_id: rule.id,
              recipient_user_ids: recipients,
              metadata: {
                date: todayStr,
                total_bonificacoes: todayBonifCount,
                limite: maxDaily,
              },
            })
            generatedCount++
          }
        }
      }
    } catch (errRule) {
      $app.logger().warn('Erro ao avaliar regra de alerta ' + code, 'error', String(errRule))
    }
  }

  return e.json(200, {
    success: true,
    evaluated_rules: checkedRules.length,
    occurrences_generated: generatedCount,
    timestamp: new Date().toISOString(),
  })
})

// -------------------------------------------------------------
// POST /backend/v1/audit/rules/dispatch-event
// Permite que qualquer módulo do ERP dispare uma verificação pontual
// -------------------------------------------------------------
routerAdd('POST', '/backend/v1/audit/rules/dispatch-event', function (e) {
  function sendAlertEmail(recipients, alertTitle, alertDetails) {
    if (!recipients || recipients.length === 0) return
    var mailClient = null
    try {
      mailClient = $app.newMailClient()
    } catch (_) {
      return
    }

    var html =
      '<div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">' +
      '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px;">' +
      '<div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 16px;">' +
      '<h2 style="margin: 0; color: #b91c1c; font-size: 18px;">⚠️ ALERTA DE AUDITORIA DO SISTEMA — ERP HURAM</h2>' +
      '</div>' +
      '<h3 style="font-size: 16px; margin: 0 0 12px 0;">' +
      alertTitle +
      '</h3>' +
      '<div style="background: #f1f5f9; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 14px; line-height: 1.6;">' +
      alertDetails +
      '</div>' +
      '<p style="font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">' +
      'Mensagem automática de rastreabilidade gerada pelo módulo de Auditoria e Governança do ERP HURAM.' +
      '</p>' +
      '</div>' +
      '</div>'

    for (var i = 0; i < recipients.length; i++) {
      var email = recipients[i]
      if (!email || email.indexOf('@') === -1) continue
      try {
        var msg = new MailerMessage({
          from: { address: 'auditoria@huram.com.br', name: 'HURAM — Auditoria do Sistema' },
          to: [{ address: email }],
          subject: '[AUDITORIA HURAM] ' + alertTitle,
          html: html,
        })
        mailClient.send(msg)
        $app.logger().info('E-mail de alerta de auditoria enviado', 'dest', email)
      } catch (errSend) {
        $app
          .logger()
          .warn(
            'Falha ao enviar e-mail de alerta de auditoria',
            'dest',
            email,
            'error',
            String(errSend),
          )
      }
    }
  }

  function recordOccurrence(data) {
    try {
      var col = $app.findCollectionByNameOrId('audit_alerts')
      var rec = new Record(col)
      rec.set('type', data.type || 'anomaly')
      rec.set('module', data.module || 'geral')
      rec.set('severity', data.severity || 'warning')
      rec.set('title', data.title)
      rec.set('description', data.description)
      rec.set('status', 'open')
      rec.set('empresa', data.empresa || '')
      rec.set('filial', data.filial || '')
      rec.set('action', data.action || '')
      rec.set('responsible_user', data.responsible_user || 'system')
      rec.set('reason', data.reason || '')
      rec.set('rule_id', data.rule_id || '')
      rec.set('metadata', data.metadata || {})
      $app.save(rec)

      var recipientEmails = []
      if (data.recipient_user_ids && data.recipient_user_ids.length > 0) {
        for (var u = 0; u < data.recipient_user_ids.length; u++) {
          var uid = data.recipient_user_ids[u]
          try {
            var userRec = $app.findRecordById('users', uid)
            if (userRec && userRec.email()) {
              recipientEmails.push(userRec.email())
            }
          } catch (_) {}
        }
      }

      if (recipientEmails.length > 0) {
        var details =
          '<p><strong>Data/Hora:</strong> ' +
          new Date().toLocaleString('pt-BR') +
          '</p>' +
          '<p><strong>Módulo:</strong> ' +
          (data.module || 'Auditoria') +
          '</p>' +
          '<p><strong>Ação:</strong> ' +
          (data.action || 'Operação auditada') +
          '</p>' +
          '<p><strong>Responsável:</strong> ' +
          (data.responsible_user || 'Sistema') +
          '</p>' +
          '<p><strong>Motivo do Alerta:</strong> ' +
          (data.reason || data.description) +
          '</p>' +
          (data.empresa ? '<p><strong>Empresa:</strong> ' + data.empresa + '</p>' : '')
        sendAlertEmail(recipientEmails, data.title, details)
      }

      return rec
    } catch (err) {
      $app.logger().error('Erro ao gravar ocorrência em audit_alerts', 'error', String(err))
      return null
    }
  }

  var data = {}
  try {
    var reqInfo = e.requestInfo()
    data = reqInfo.body || {}
  } catch (_) {
    return e.json(400, { error: 'Payload JSON inválido' })
  }

  var eventType = data.event_type
  var empresa = data.empresa || ''
  var filial = data.filial || ''
  var responsibleUser =
    data.responsible_user || (e.auth ? e.auth.get('login') || e.auth.get('name') : 'Sistema')

  var rulesFilter = 'active = true'
  if (empresa) {
    rulesFilter += ' && (empresa = "" || empresa = "' + empresa.replace(/"/g, '\\"') + '")'
  }
  var rules = []
  try {
    rules = $app.findRecordsByFilter('audit_alert_rules', rulesFilter, '-created', 100)
  } catch (errFindRules) {
    $app.logger().warn('Erro ao carregar audit_alert_rules', 'error', String(errFindRules))
  }

  var matchedRules = []

  for (var i = 0; i < rules.length; i++) {
    var r = rules[i]
    var code = r.get('code')
    var recipients = r.get('recipient_user_ids') || []
    var threshold = r.get('threshold_value') || 0

    // Movimentações suspeitas no estoque
    if (code === 'stock_suspicious' && (eventType === 'stock_suspicious' || data.is_suspicious)) {
      recordOccurrence({
        type: 'anomaly',
        module: 'estoque',
        severity: r.get('severity') || 'critical',
        title: 'Movimentação Suspeita Identificada no Estoque',
        description:
          data.description ||
          'Movimentação anômala de estoque detectada sem padrão operacional reconhecido.',
        empresa: empresa,
        filial: filial,
        action: data.action || 'Ajuste / Transferência atípica de estoque',
        responsible_user: responsibleUser,
        reason: data.reason || 'Parâmetro de movimentação suspeita ativado na auditoria.',
        rule_id: r.id,
        recipient_user_ids: recipients,
        metadata: data.metadata || {},
      })
      matchedRules.push(code)
    }

    // Divergências em inventários
    if (code === 'inventory_divergence' && eventType === 'inventory_divergence') {
      var divergenceQty = Math.abs(Number(data.divergence_qty) || 0)
      if (divergenceQty >= threshold) {
        recordOccurrence({
          type: 'compliance',
          module: 'estoque',
          severity: r.get('severity') || 'critical',
          title: 'Divergência Crítica em Contagem de Inventário',
          description:
            data.description || 'Divergência de ' + divergenceQty + ' itens apurada no inventário.',
          empresa: empresa,
          filial: filial,
          action: data.action || 'Fechamento ou contagem de inventário',
          responsible_user: responsibleUser,
          reason:
            'Divergência de ' +
            divergenceQty +
            ' unidades atingiu ou ultrapassou o teto tolerado de ' +
            threshold +
            ' unidades.',
          rule_id: r.id,
          recipient_user_ids: recipients,
          metadata: data.metadata || {},
        })
        matchedRules.push(code)
      }
    }

    // Alteração de quantidade de produto
    if (code === 'product_qty_change' && eventType === 'product_qty_change') {
      var diffQty = Math.abs(Number(data.diff_qty) || 0)
      if (diffQty >= threshold) {
        recordOccurrence({
          type: 'data_change',
          module: 'estoque',
          severity: r.get('severity') || 'warning',
          title: 'Alteração Significativa de Saldo de Produto',
          description: data.description || 'Saldo alterado em ' + diffQty + ' unidades.',
          empresa: empresa,
          filial: filial,
          action: data.action || 'Alteração manual de quantidade em estoque',
          responsible_user: responsibleUser,
          reason:
            'Variação de ' +
            diffQty +
            ' unidades acima do limite configurado de ' +
            threshold +
            ' unidades.',
          rule_id: r.id,
          recipient_user_ids: recipients,
          metadata: data.metadata || {},
        })
        matchedRules.push(code)
      }
    }

    // Ajustes manuais de estoque
    if (
      code === 'manual_stock_adjust' &&
      (eventType === 'manual_stock_adjust' || eventType === 'stock_adjustment')
    ) {
      recordOccurrence({
        type: 'anomaly',
        module: 'estoque',
        severity: r.get('severity') || 'warning',
        title: 'Ajuste Manual de Estoque Lançado',
        description: data.description || 'Lançamento de ajuste manual de estoque no sistema.',
        empresa: empresa,
        filial: filial,
        action: data.action || 'Lançamento de ajuste manual de saldo/almoxarifado',
        responsible_user: responsibleUser,
        reason: data.reason || 'Regra de conformidade para ajustes manuais de estoque.',
        rule_id: r.id,
        recipient_user_ids: recipients,
        metadata: data.metadata || {},
      })
      matchedRules.push(code)
    }

    // Movimentações suspeitas WMS
    if (
      code === 'wms_suspicious' &&
      (eventType === 'wms_suspicious' || eventType === 'wms_anomaly')
    ) {
      recordOccurrence({
        type: 'anomaly',
        module: 'wms',
        severity: r.get('severity') || 'critical',
        title: 'Operação Suspeita Identificada no WMS',
        description:
          data.description ||
          'Ocorrência operacional atípica identificada no fluxo de conferência/separação WMS.',
        empresa: empresa,
        filial: filial,
        action: data.action || 'Operação de WMS',
        responsible_user: responsibleUser,
        reason: data.reason || 'Critério de suspeição operacional WMS atendido.',
        rule_id: r.id,
        recipient_user_ids: recipients,
        metadata: data.metadata || {},
      })
      matchedRules.push(code)
    }

    // Emissão de nota fiscal de perda com valor superior a R$ X
    if (code === 'nf_loss_limit' && (eventType === 'nf_loss' || eventType === 'fiscal_loss')) {
      var lossValue = Number(data.loss_value) || 0
      if (lossValue >= threshold) {
        recordOccurrence({
          type: 'financial',
          module: 'fiscal',
          severity: r.get('severity') || 'critical',
          title: 'NF de Perda Acima do Limite Autorizado',
          description:
            data.description ||
            'Nota fiscal de perda emitida com valor de R$ ' +
              lossValue.toFixed(2) +
              ' (limite: R$ ' +
              threshold.toFixed(2) +
              ').',
          empresa: empresa,
          filial: filial,
          action: data.action || 'Emissão de NF de perda / baixa de estoque por avaria',
          responsible_user: responsibleUser,
          reason:
            'Valor de perda de R$ ' +
            lossValue.toFixed(2) +
            ' excede o limite estipulado de R$ ' +
            threshold.toFixed(2) +
            '.',
          rule_id: r.id,
          recipient_user_ids: recipients,
          metadata: data.metadata || {},
        })
        matchedRules.push(code)
      }
    }

    // Bonificação ultrapassando X% do valor do pedido de venda
    if (code === 'bonificacao_pct_limit' && eventType === 'bonificacao_order') {
      var pct = Number(data.bonification_pct) || 0
      if (pct >= threshold) {
        recordOccurrence({
          type: 'financial',
          module: 'vendas',
          severity: r.get('severity') || 'warning',
          title: 'Bonificação Excedendo % do Pedido de Origem',
          description:
            data.description ||
            'Pedido de bonificação representa ' +
              pct.toFixed(1) +
              '% do pedido de venda de origem (limite configurado: ' +
              threshold +
              '%).',
          empresa: empresa,
          filial: filial,
          action: data.action || 'Criação/aprovação de pedido de bonificação',
          responsible_user: responsibleUser,
          reason:
            'Percentual bonificado de ' +
            pct.toFixed(1) +
            '% ultrapassa o teto permitido de ' +
            threshold +
            '%.',
          rule_id: r.id,
          recipient_user_ids: recipients,
          metadata: data.metadata || {},
        })
        matchedRules.push(code)
      }
    }

    // Pedido de venda com margem de lucro inferior a X%
    if (
      code === 'sales_min_margin' &&
      (eventType === 'sales_order' || eventType === 'sales_order_margin')
    ) {
      var marginPct = Number(data.margin_pct) || 0
      if (marginPct < threshold) {
        recordOccurrence({
          type: 'financial',
          module: 'vendas',
          severity: r.get('severity') || 'critical',
          title: 'Pedido de Venda com Margem Inferior ao Mínimo',
          description:
            data.description ||
            'Pedido de venda lançado com margem de ' +
              marginPct.toFixed(1) +
              '% (mínimo exigido: ' +
              threshold +
              '%).',
          empresa: empresa,
          filial: filial,
          action: data.action || 'Fechamento ou aprovação de pedido de venda comercial',
          responsible_user: responsibleUser,
          reason:
            'Margem de lucro praticada (' +
            marginPct.toFixed(1) +
            '%) inferior ao piso obrigatório de ' +
            threshold +
            '%.',
          rule_id: r.id,
          recipient_user_ids: recipients,
          metadata: data.metadata || {},
        })
        matchedRules.push(code)
      }
    }

    // Regras personalizadas criadas pelo administrador
    if (r.get('is_custom') && (eventType === 'custom' || eventType === code)) {
      var val = Number(data.value) || 0
      var trigger = false
      if (r.get('threshold_type') === 'evento') trigger = true
      else if (val >= threshold) trigger = true

      if (trigger) {
        recordOccurrence({
          type: 'compliance',
          module: 'personalizado',
          severity: r.get('severity') || 'warning',
          title: r.get('name'),
          description: data.description || r.get('description'),
          empresa: empresa,
          filial: filial,
          action: data.action || 'Evento de regra personalizada',
          responsible_user: responsibleUser,
          reason:
            data.reason ||
            'Condição personalizada acionada: ' + (r.get('custom_condition') || code),
          rule_id: r.id,
          recipient_user_ids: recipients,
          metadata: data.metadata || {},
        })
        matchedRules.push(code)
      }
    }
  }

  return e.json(200, {
    success: true,
    matched_rules: matchedRules,
    total_triggered: matchedRules.length,
  })
})

// Cron job diário às 06:00 para auditoria preventiva de verbas sem documento e integridade
cronAdd('audit_alerts_daily_verifier', '0 6 * * *', function () {
  try {
    $app
      .logger()
      .info('audit_alerts_daily_verifier: Iniciando varredura preventiva de conformidade')
    var rules = []
    try {
      rules = $app.findRecordsByFilter('audit_alert_rules', 'active = true', '-created', 100)
    } catch (_) {
      return
    }

    var now = new Date()
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i]
      if (rule.get('code') === 'verba_doc_pending') {
        var daysLimit = rule.get('threshold_value') || 15
        var pastDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000)
        var dateFilter = 'created <= "' + pastDate.toISOString().slice(0, 10) + ' 23:59:59"'
        var verbaFilter = 'status != "concluida" && status != "cancelada" && ' + dateFilter
        var pendings = $app.findRecordsByFilter(
          'supplier_allowance_agreements',
          verbaFilter,
          '-created',
          50,
        )
        for (var p = 0; p < pendings.length; p++) {
          var agg = pendings[p]
          var agreementId = agg.id
          var existing = null
          try {
            existing = $app.findFirstRecordByFilter(
              'audit_alerts',
              'rule_id = "' + rule.id + '" && metadata.agreement_id = "' + agreementId + '"',
            )
          } catch (_) {}
          if (!existing) {
            try {
              var col = $app.findCollectionByNameOrId('audit_alerts')
              var rec = new Record(col)
              rec.set('type', 'compliance')
              rec.set('module', 'verbas')
              rec.set('severity', rule.get('severity') || 'critical')
              rec.set('title', 'Verba Comercial sem Acordo Assinado Anexado')
              rec.set(
                'description',
                'A verba/acordo "' +
                  (agg.get('code') || agg.get('title') || agreementId) +
                  '" está aberta há mais de ' +
                  daysLimit +
                  ' dias sem documento assinado.',
              )
              rec.set('status', 'open')
              rec.set('empresa', agg.get('empresa') || '')
              rec.set('action', 'Auditoria preventiva diária de acordos de verba')
              rec.set('responsible_user', agg.get('created_by') || 'Comercial')
              rec.set('reason', 'Prazo limite de ' + daysLimit + ' dias excedido.')
              rec.set('rule_id', rule.id)
              rec.set('metadata', { agreement_id: agreementId, days_limit: daysLimit })
              $app.save(rec)
            } catch (_) {}
          }
        }
      }
    }
    $app.logger().info('audit_alerts_daily_verifier: Varredura concluída com sucesso')
  } catch (errCron) {
    $app.logger().error('audit_alerts_daily_verifier: Falha na execução', 'error', String(errCron))
  }
})

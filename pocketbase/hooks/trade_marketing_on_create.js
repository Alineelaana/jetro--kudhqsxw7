onRecordAfterCreateSuccess((e) => {
  var PRIORITY_MAP = {
    baixa: 'low',
    normal: 'medium',
    alta: 'high',
    urgente: 'high',
    critica: 'critical',
  }
  var STATUS_MAP = {
    ideia: 'scheduled',
    planejamento: 'scheduled',
    orcamento: 'scheduled',
    solicitacao_verba: 'scheduled',
    aprovacao: 'scheduled',
    programacao: 'scheduled',
    execucao: 'in_progress',
    evidencias: 'in_progress',
    medicao_resultado: 'in_progress',
    prestacao_contas: 'in_progress',
    encerramento: 'completed',
    cancelado: 'cancelled',
  }

  var title = e.record.getString('title')
  var status = e.record.getString('status') || 'ideia'
  var priority = e.record.getString('priority') || 'normal'

  try {
    var agendaCol = $app.findCollectionByNameOrId('platform_agenda_events')
    var agenda = new Record(agendaCol)
    agenda.set('title', title)
    agenda.set('event_type', 'other')
    agenda.set('module_origin', 'trade_marketing')
    agenda.set('start_date', e.record.getString('start_date') || '')
    agenda.set('end_date', e.record.getString('end_date') || '')
    agenda.set('assigned_to', e.record.getString('responsible_id') || '')
    agenda.set('assigned_name', e.record.getString('responsible_name') || '')
    agenda.set('related_entity_type', 'trade_marketing_action')
    agenda.set('related_entity_id', e.record.id)
    agenda.set('status', STATUS_MAP[status] || 'scheduled')
    agenda.set('priority', PRIORITY_MAP[priority] || 'medium')
    agenda.set('company', e.record.getString('company') || '')
    agenda.set('branch', e.record.getString('branch') || '')
    agenda.set('created_by', e.record.getString('created_by') || '')
    $app.save(agenda)

    var STEPS = [
      { key: 'ideia', label: 'Ideia', role: 'PADRAO', action: 'execute' },
      { key: 'planejamento', label: 'Planejamento', role: 'COMERCIAL', action: 'approve' },
      { key: 'orcamento', label: 'Orcamento', role: 'FINANCEIRO', action: 'approve' },
      {
        key: 'solicitacao_verba',
        label: 'Solicitacao de Verba',
        role: 'FINANCEIRO',
        action: 'approve',
      },
      { key: 'aprovacao', label: 'Aprovacao', role: 'SUP', action: 'approve' },
      { key: 'programacao', label: 'Programacao', role: 'PADRAO', action: 'execute' },
      { key: 'execucao', label: 'Execucao', role: 'PADRAO', action: 'execute' },
      { key: 'evidencias', label: 'Evidencias', role: 'PADRAO', action: 'execute' },
      {
        key: 'medicao_resultado',
        label: 'Medicao de Resultado',
        role: 'COMERCIAL',
        action: 'execute',
      },
      {
        key: 'prestacao_contas',
        label: 'Prestacao de Contas',
        role: 'FINANCEIRO',
        action: 'approve',
      },
      { key: 'encerramento', label: 'Encerramento', role: 'SUP', action: 'close' },
    ]
    var wfCol = $app.findCollectionByNameOrId('platform_workflows')
    var wf = new Record(wfCol)
    wf.set('workflow_key', 'trade_marketing_action')
    wf.set('entity_type', 'trade_marketing_actions')
    wf.set('entity_id', e.record.id)
    wf.set('entity_summary', title)
    wf.set('current_step', STEPS[0].key)
    wf.set('steps', STEPS)
    wf.set('history', [
      {
        step: STEPS[0].key,
        action: 'created',
        user: e.record.getString('created_by_name') || 'Sistema',
        date: new Date().toISOString(),
        notes: 'Workflow iniciado',
      },
    ])
    wf.set('status', 'in_progress')
    wf.set('assigned_role', STEPS[0].role)
    wf.set('module_origin', 'trade_marketing')
    wf.set('company', e.record.getString('company') || '')
    wf.set('branch', e.record.getString('branch') || '')
    wf.set('created_by', e.record.getString('created_by') || '')
    wf.set('created_by_name', e.record.getString('created_by_name') || '')
    $app.save(wf)

    $app
      .db()
      .newQuery(
        'UPDATE trade_marketing_actions SET agenda_event_id = {:aid}, workflow_id = {:wid} WHERE id = {:tmid}',
      )
      .bind({ aid: agenda.id, wid: wf.id, tmid: e.record.id })
      .execute()
  } catch (err) {
    $app.logger().error('trade_marketing create hook failed', 'error', String(err))
  }

  try {
    var respId = e.record.getString('responsible_id')
    if (respId) {
      var notifCol = $app.findCollectionByNameOrId('notifications')
      var notif = new Record(notifCol)
      notif.set('title', 'Nova Ação Trade & Marketing: ' + title)
      notif.set(
        'message',
        'Tipo: ' +
          e.record.getString('action_type') +
          ' | Início: ' +
          e.record.getString('start_date'),
      )
      notif.set('type', 'agenda_reminder')
      notif.set('recipient', respId)
      notif.set('read', false)
      notif.set('link', '/admin/trade-marketing')
      $app.saveNoValidate(notif)
    }
  } catch (err2) {
    $app.logger().error('trade_marketing notification failed', 'error', String(err2))
  }

  return e.next()
}, 'trade_marketing_actions')

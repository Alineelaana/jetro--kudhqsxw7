onRecordAfterUpdateSuccess((e) => {
  var statusChanged = e.record.getString('status') !== e.record.original().getString('status')
  var titleChanged = e.record.getString('title') !== e.record.original().getString('title')
  var dateChanged = e.record.getString('start_date') !== e.record.original().getString('start_date')

  if (titleChanged || dateChanged || statusChanged) {
    try {
      var agendaEvent = $app.findFirstRecordByFilter(
        'platform_agenda_events',
        'related_entity_type = "trade_marketing_action" && related_entity_id = {:rid}',
        e.record.id,
      )
      if (agendaEvent) {
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
        var status = e.record.getString('status') || 'ideia'
        var priority = e.record.getString('priority') || 'normal'
        agendaEvent.set('title', e.record.getString('title'))
        agendaEvent.set('start_date', e.record.getString('start_date') || '')
        agendaEvent.set('end_date', e.record.getString('end_date') || '')
        agendaEvent.set('assigned_to', e.record.getString('responsible_id') || '')
        agendaEvent.set('assigned_name', e.record.getString('responsible_name') || '')
        agendaEvent.set('status', STATUS_MAP[status] || 'scheduled')
        agendaEvent.set('priority', PRIORITY_MAP[priority] || 'medium')
        $app.save(agendaEvent)
      }
    } catch (_) {}
  }

  if (statusChanged) {
    try {
      var respId = e.record.getString('responsible_id')
      if (respId) {
        var notifCol = $app.findCollectionByNameOrId('notifications')
        var notif = new Record(notifCol)
        notif.set('title', 'Ação atualizada: ' + e.record.getString('title'))
        notif.set('message', 'Novo status: ' + e.record.getString('status'))
        notif.set('type', 'workflow_step')
        notif.set('recipient', respId)
        notif.set('read', false)
        notif.set('link', '/admin/trade-marketing')
        $app.saveNoValidate(notif)
      }
    } catch (_) {}
  }

  return e.next()
}, 'trade_marketing_actions')

// ============================================================================
// Hooks e Automação de Lembretes da Agenda Jetro
//
// 1. Sincronização automática de lembretes ao criar/editar/excluir compromisso:
//    - onRecordAfterCreateSuccess
//    - onRecordAfterUpdateSuccess
//    - onRecordAfterDeleteSuccess
//
// 2. Cron de disparo automático no servidor a cada 2 minutos (jetro_agenda_reminders_worker)
//    - Processa lembretes pendentes cujo scheduled_for <= agora (UTC)
//    - Evita duplicidade (status = 'sent', sent_at)
//    - Não envia lembretes cujo horário de início já passou no momento da criação
//    - E-mail corporativo no padrão Jetro (verde #005B2E, dourado #C9A227)
// ============================================================================

function parseJSON(str, fallback) {
  if (!str) return fallback
  if (typeof str === 'object') return str
  try {
    return JSON.parse(str)
  } catch (_) {
    return fallback
  }
}

function xmlEscape(s) {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Converte offset string para minutos antes do evento
// Suporta: 15m, 30m, 1h, 2h, 6h, 12h, 1d, 2d, 1w e personalizadas "custom:Xm", "custom:Xh", "custom:Xd"
function parseOffsetToMinutes(offsetKey) {
  if (!offsetKey) return null
  var key = String(offsetKey).trim().toLowerCase()

  if (key.indexOf('custom:') === 0) {
    var raw = key.substring(7)
    if (raw.endsWith('m')) return parseInt(raw.replace('m', ''), 10) || null
    if (raw.endsWith('h')) return (parseInt(raw.replace('h', ''), 10) || 0) * 60 || null
    if (raw.endsWith('d')) return (parseInt(raw.replace('d', ''), 10) || 0) * 1440 || null
    return parseInt(raw, 10) || null
  }

  if (key === '15m' || key === '15 min') return 15
  if (key === '30m' || key === '30 min') return 30
  if (key === '1h' || key === '1 hora') return 60
  if (key === '2h' || key === '2 horas') return 120
  if (key === '6h' || key === '6 horas') return 360
  if (key === '12h' || key === '12 horas') return 720
  if (key === '1d' || key === '1 dia') return 1440
  if (key === '2d' || key === '2 dias') return 2880
  if (key === '1w' || key === '1 semana') return 10080

  return null
}

function formatOffsetLabel(offsetKey) {
  var mins = parseOffsetToMinutes(offsetKey)
  if (!mins) return offsetKey
  if (mins === 15) return '15 minutos antes'
  if (mins === 30) return '30 minutos antes'
  if (mins === 60) return '1 hora antes'
  if (mins === 120) return '2 horas antes'
  if (mins === 360) return '6 horas antes'
  if (mins === 720) return '12 horas antes'
  if (mins === 1440) return '1 dia antes'
  if (mins === 2880) return '2 dias antes'
  if (mins === 10080) return '1 semana antes'
  if (mins < 60) return mins + ' minutos antes'
  if (mins < 1440) return Math.round(mins / 60) + ' horas antes'
  return Math.round(mins / 1440) + ' dias antes'
}

// Converte YYYY-MM-DD e HH:mm no fuso de Brasília (-03:00) em timestamp UTC em milissegundos
function computeTargetUtcMs(dateStr, timeStr) {
  var t = timeStr && timeStr.indexOf(':') !== -1 ? timeStr.trim() : '09:00'
  var isoWithTz = dateStr + 'T' + t + ':00-03:00'
  var targetDate = new Date(isoWithTz)
  return targetDate.getTime()
}

// Função para sincronizar os registros de lembretes no banco
function syncRemindersForAppointment(apptRecord) {
  var apptId = apptRecord.id
  var userId = apptRecord.getString('user_id')
  var status = apptRecord.getString('status')
  var hasReminder = apptRecord.getBool('has_reminder')
  var reminderConfigs = parseJSON(apptRecord.getString('reminder_configs'), [])
  var dateStr = apptRecord.getString('date')
  var timeStr =
    apptRecord.getString('start_time') ||
    apptRecord.getString('reference_time_for_reminder') ||
    '09:00'

  var reminderCol = $app.findCollectionByNameOrId('jetro_agenda_reminders')

  // Se o compromisso foi cancelado ou concluído, ou se has_reminder = false, cancela todos os lembretes pendentes
  if (!hasReminder || status === 'Cancelado' || status === 'Concluido') {
    try {
      var existing = $app.findRecordsByFilter(
        'jetro_agenda_reminders',
        'appointment_id = "' + apptId + '" && status = "pending"',
        '',
        100,
        0,
      )
      for (var i = 0; i < existing.length; i++) {
        existing[i].set('status', 'cancelled')
        $app.saveNoValidate(existing[i])
      }
    } catch (_) {}
    return
  }

  // Busca e-mail do destinatário: prioridade reminder_target_email, senão e-mail do usuário
  var recipientEmail = apptRecord.getString('reminder_target_email')
  var recipientName = apptRecord.getString('user_name') || ''

  if (!recipientEmail && userId) {
    try {
      var uRec = $app.findRecordById('users', userId)
      if (uRec) {
        recipientEmail = uRec.getString('email')
        if (!recipientName) recipientName = uRec.getString('name')
      }
    } catch (_) {}
  }

  if (!recipientEmail || recipientEmail.indexOf('@') === -1) {
    return
  }

  var targetUtcMs = computeTargetUtcMs(dateStr, timeStr)
  var nowUtcMs = Date.now()

  // Busca lembretes já existentes deste compromisso
  var currentReminders = []
  try {
    currentReminders = $app.findRecordsByFilter(
      'jetro_agenda_reminders',
      'appointment_id = "' + apptId + '"',
      '',
      100,
      0,
    )
  } catch (_) {}

  var currentByOffset = {}
  for (var cIdx = 0; cIdx < currentReminders.length; cIdx++) {
    var r = currentReminders[cIdx]
    currentByOffset[r.getString('reminder_offset_key')] = r
  }

  var validOffsetsConfigured = {}

  if (Array.isArray(reminderConfigs)) {
    for (var k = 0; k < reminderConfigs.length; k++) {
      var offsetKey = String(reminderConfigs[k]).trim()
      var mins = parseOffsetToMinutes(offsetKey)
      if (mins === null) continue
      validOffsetsConfigured[offsetKey] = mins

      var scheduledTimeMs = targetUtcMs - mins * 60 * 1000
      var scheduledIso = new Date(scheduledTimeMs).toISOString()

      var existingRec = currentByOffset[offsetKey]
      if (existingRec) {
        // Se já existe e ainda está pendente ou cancelled, atualiza dados do compromisso
        if (
          existingRec.getString('status') === 'pending' ||
          existingRec.getString('status') === 'cancelled'
        ) {
          // Se o momento programado já passou, marca skipped_past
          var newStatus = scheduledTimeMs <= nowUtcMs ? 'skipped_past' : 'pending'
          existingRec.set('recipient_email', recipientEmail)
          existingRec.set('recipient_name', recipientName)
          existingRec.set('appointment_title', apptRecord.getString('title'))
          existingRec.set('appointment_description', apptRecord.getString('description'))
          existingRec.set('appointment_date', dateStr)
          existingRec.set('appointment_time', timeStr)
          existingRec.set('appointment_priority', apptRecord.getString('priority'))
          existingRec.set('appointment_type', apptRecord.getString('type'))
          existingRec.set('scheduled_for', scheduledIso)
          existingRec.set('status', newStatus)
          $app.saveNoValidate(existingRec)
        }
      } else {
        // Criar novo lembrete se o horário alvo ainda não passou totalmente
        var initialStatus = scheduledTimeMs <= nowUtcMs ? 'skipped_past' : 'pending'
        var newRem = new Record(reminderCol, {
          appointment_id: apptId,
          user_id: userId,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          appointment_title: apptRecord.getString('title'),
          appointment_description: apptRecord.getString('description'),
          appointment_date: dateStr,
          appointment_time: timeStr,
          appointment_priority: apptRecord.getString('priority'),
          appointment_type: apptRecord.getString('type'),
          reminder_offset_key: offsetKey,
          scheduled_for: scheduledIso,
          status: initialStatus,
          attempts: 0,
        })
        $app.saveNoValidate(newRem)
      }
    }
  }

  // Cancela lembretes antigos que foram removidos da configuração do compromisso
  for (var offsetInDb in currentByOffset) {
    if (!validOffsetsConfigured[offsetInDb]) {
      var toCancel = currentByOffset[offsetInDb]
      if (toCancel.getString('status') === 'pending') {
        toCancel.set('status', 'cancelled')
        $app.saveNoValidate(toCancel)
      }
    }
  }
}

// Hook pós-criação
onRecordAfterCreateSuccess((e) => {
  if (e.record.collectionName !== 'jetro_agenda_appointments') return e.next()
  try {
    syncRemindersForAppointment(e.record)
  } catch (err) {
    $app.logger().error('Falha ao sincronizar lembretes pós-create', 'error', String(err))
  }
  return e.next()
}, 'jetro_agenda_appointments')

// Hook pós-atualização
onRecordAfterUpdateSuccess((e) => {
  if (e.record.collectionName !== 'jetro_agenda_appointments') return e.next()
  try {
    syncRemindersForAppointment(e.record)
  } catch (err) {
    $app.logger().error('Falha ao sincronizar lembretes pós-update', 'error', String(err))
  }
  return e.next()
}, 'jetro_agenda_appointments')

// Hook pós-deleção
onRecordAfterDeleteSuccess((e) => {
  if (e.record.collectionName !== 'jetro_agenda_appointments') return e.next()
  try {
    var apptId = e.record.id
    var list = $app.findRecordsByFilter(
      'jetro_agenda_reminders',
      'appointment_id = "' + apptId + '" && status = "pending"',
      '',
      100,
      0,
    )
    for (var i = 0; i < list.length; i++) {
      list[i].set('status', 'cancelled')
      $app.saveNoValidate(list[i])
    }
  } catch (err) {
    $app.logger().error('Falha ao cancelar lembretes pós-delete', 'error', String(err))
  }
  return e.next()
}, 'jetro_agenda_appointments')

// ============================================================================
// Layout corporativo de e-mail Jetro para Lembretes da Agenda
// ============================================================================
function buildReminderEmailHtml(reminderRecord) {
  var title = reminderRecord.getString('appointment_title')
  var desc = reminderRecord.getString('appointment_description')
  var dateStr = reminderRecord.getString('appointment_date')
  var timeStr = reminderRecord.getString('appointment_time') || 'Dia inteiro / Horário flexível'
  var priority = reminderRecord.getString('appointment_priority') || 'Média'
  var type = reminderRecord.getString('appointment_type') || 'Compromisso'
  var offsetKey = reminderRecord.getString('reminder_offset_key')
  var recipientName = reminderRecord.getString('recipient_name') || 'Colaborador'
  var offsetLabel = formatOffsetLabel(offsetKey)

  // Formata data brasileira DD/MM/AAAA
  var formattedDate = dateStr
  if (dateStr && dateStr.indexOf('-') !== -1) {
    var parts = dateStr.split('-')
    if (parts.length === 3) {
      formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0]
    }
  }

  // Cor do badge de prioridade
  var priorityColor = '#005B2E'
  var priorityBg = '#e6f4ea'
  if (priority === 'Alta') {
    priorityColor = '#b45309'
    priorityBg = '#fef3c7'
  } else if (priority === 'Urgente') {
    priorityColor = '#b91c1c'
    priorityBg = '#fee2e2'
  }

  var descHtml = desc
    ? '<div style="margin-top: 14px; padding: 12px 14px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #C9A227; font-size: 13px; color: #374151; line-height: 1.5;">' +
      xmlEscape(desc).replace(/\n/g, '<br/>') +
      '</div>'
    : ''

  return (
    '<!DOCTYPE html>' +
    '<html lang="pt-BR"><head><meta charset="utf-8" /></head>' +
    '<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #1f2937;">' +
    '<div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">' +
    '  <div style="background: #005B2E; padding: 22px 26px; border-bottom: 4px solid #C9A227;">' +
    '    <div style="display: table; width: 100%;">' +
    '      <div style="display: table-cell; vertical-align: middle;">' +
    '        <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">JETRO<span style="color: #C9A227;">.</span></div>' +
    '        <div style="font-size: 12px; color: #d1fae5; margin-top: 2px;">Sistema Integrado ERP — Agenda Corporativa</div>' +
    '      </div>' +
    '      <div style="display: table-cell; vertical-align: middle; text-align: right;">' +
    '        <span style="display: inline-block; background: #C9A227; color: #00381C; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">Lembrete</span>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <div style="padding: 26px;">' +
    '    <p style="font-size: 14px; color: #4b5563; margin: 0 0 16px 0;">Olá, <strong>' +
    xmlEscape(recipientName) +
    '</strong>. Este é um lembrete da <strong>Agenda Jetro</strong> programado para ' +
    xmlEscape(offsetLabel) +
    ':</p>' +
    '    <div style="background: #f4faf6; border: 1px solid #d1fae5; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">' +
    '      <div style="display: inline-block; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #005B2E; background: #d1fae5; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;">' +
    xmlEscape(type) +
    '      </div>' +
    '      <h2 style="font-size: 20px; font-weight: bold; color: #005B2E; margin: 0 0 12px 0; line-height: 1.3;">' +
    xmlEscape(title) +
    '      </h2>' +
    '      <table style="width: 100%; font-size: 13px; color: #374151; border-collapse: collapse;">' +
    '        <tr>' +
    '          <td style="padding: 6px 0; width: 90px; color: #6b7280; font-weight: 600;">Data:</td>' +
    '          <td style="padding: 6px 0; font-weight: bold; color: #111827;">' +
    xmlEscape(formattedDate) +
    '</td>' +
    '        </tr>' +
    '        <tr>' +
    '          <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Horário:</td>' +
    '          <td style="padding: 6px 0; font-weight: bold; color: #111827;">' +
    xmlEscape(timeStr) +
    '</td>' +
    '        </tr>' +
    '        <tr>' +
    '          <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Prioridade:</td>' +
    '          <td style="padding: 6px 0;">' +
    '            <span style="display: inline-block; font-size: 11px; font-weight: bold; color: ' +
    priorityColor +
    '; background: ' +
    priorityBg +
    '; padding: 2px 8px; border-radius: 4px;">' +
    xmlEscape(priority) +
    '</span>' +
    '          </td>' +
    '        </tr>' +
    '      </table>' +
    descHtml +
    '    </div>' +
    '    <p style="font-size: 12px; color: #6b7280; margin: 0 0 20px 0; line-height: 1.4;">' +
    '      Para gerenciar, concluir ou remarcar esta atividade, acesse o painel principal do Jetro no menu da sua <strong>Agenda Inteligente</strong>.' +
    '    </p>' +
    '    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">' +
    '      Lembrete automático enviado pela Agenda Jetro ERP.<br/>Você recebeu esta notificação porque configurou um aviso prévio para este compromisso.' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    '</body></html>'
  )
}

// ============================================================================
// Cron Job de Processamento e Envio de Lembretes no Servidor
// Executa a cada 2 minutos para checar lembretes vencidos
// ============================================================================
cronAdd('jetro_agenda_reminders_worker', '*/2 * * * *', () => {
  var nowUtcIso = new Date().toISOString()
  var pendingReminders = []

  try {
    pendingReminders = $app.findRecordsByFilter(
      'jetro_agenda_reminders',
      'status = "pending" && scheduled_for <= "' + nowUtcIso + '"',
      'scheduled_for',
      50,
      0,
    )
  } catch (eFind) {
    $app.logger().error('Falha ao buscar lembretes pendentes da agenda', 'error', String(eFind))
    return
  }

  if (!pendingReminders || pendingReminders.length === 0) return

  var senderAddress = $app.settings().meta.senderAddress || 'no-reply@jetro.com.br'
  var senderName = $app.settings().meta.senderName || 'Jetro ERP — Agenda'

  for (var i = 0; i < pendingReminders.length; i++) {
    var rem = pendingReminders[i]
    var apptId = rem.getString('appointment_id')

    // Verifica se o compromisso ainda existe e está ativo (não cancelado nem concluído)
    var apptRecord = null
    try {
      apptRecord = $app.findRecordById('jetro_agenda_appointments', apptId)
    } catch (_) {}

    if (
      !apptRecord ||
      apptRecord.getString('status') === 'Cancelado' ||
      apptRecord.getString('status') === 'Concluido'
    ) {
      rem.set('status', 'cancelled')
      rem.set('error_message', 'Compromisso inexistente, concluído ou cancelado')
      $app.saveNoValidate(rem)
      continue
    }

    var recipientEmail = rem.getString('recipient_email')
    if (!recipientEmail || recipientEmail.indexOf('@') === -1) {
      rem.set('status', 'failed')
      rem.set('error_message', 'E-mail destinatário inválido')
      $app.saveNoValidate(rem)
      continue
    }

    var title = rem.getString('appointment_title')
    var subject = 'Lembrete da Agenda Jetro: ' + title

    try {
      var htmlBody = buildReminderEmailHtml(rem)
      var mailOptions = {
        from: {
          address: senderAddress,
          name: senderName,
        },
        to: [{ address: recipientEmail }],
        subject: subject,
        html: htmlBody,
      }

      var message = new MailerMessage(mailOptions)
      $app.newMailClient().send(message)

      rem.set('status', 'sent')
      rem.set('sent_at', new Date().toISOString())
      rem.set('error_message', '')
      rem.set('attempts', (rem.getInt('attempts') || 0) + 1)
      $app.saveNoValidate(rem)

      // Também emite notificação interna no Jetro ERP (coleção notifications)
      try {
        var notifCol = $app.findCollectionByNameOrId('notifications')
        var userId = rem.getString('user_id')
        if (userId) {
          var nRec = new Record(notifCol, {
            title: 'Lembrete: ' + title,
            message:
              'Data: ' +
              rem.getString('appointment_date') +
              ' às ' +
              (rem.getString('appointment_time') || 'horário comercial'),
            type: 'agenda_reminder',
            recipient: userId,
            read: false,
            link: '/admin',
          })
          $app.saveNoValidate(nRec)
        }
      } catch (_) {}
    } catch (sendErr) {
      var nextAttempts = (rem.getInt('attempts') || 0) + 1
      rem.set('attempts', nextAttempts)
      rem.set('error_message', String(sendErr))
      if (nextAttempts >= 3) {
        rem.set('status', 'failed')
      }
      $app.saveNoValidate(rem)
      $app
        .logger()
        .error(
          'Erro ao enviar e-mail de lembrete da agenda',
          'reminder_id',
          rem.id,
          'error',
          String(sendErr),
        )
    }
  }
})

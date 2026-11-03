// ============================================================================
// Hooks e Automação de Lembretes da Agenda HURAM
//
// 1. Sincronização automática de lembretes ao criar/editar/excluir compromisso:
//    - onRecordAfterCreateSuccess
//    - onRecordAfterUpdateSuccess
//    - onRecordAfterDeleteSuccess
//
// 2. Cron de disparo automático no servidor a cada 2 minutos (jetro_agenda_reminders_worker)
//    - Processa lembretes pendentes cujo scheduled_for <= agora (UTC)
//    - Evita duplicidade (status = 'sent', sent_at)
//    - Ignora destinatários de teste ou inválidos
// ============================================================================

// Hook pós-criação
onRecordAfterCreateSuccess((e) => {
  if (e.record.collectionName !== 'jetro_agenda_appointments') return e.next()
  try {
    var apptRecord = e.record
    var apptId = apptRecord.id
    var userId = apptRecord.getString('user_id')
    var status = apptRecord.getString('status')
    var hasReminder = apptRecord.getBool('has_reminder')
    var rawConfigs = apptRecord.getString('reminder_configs')
    var reminderConfigs = []
    try {
      if (rawConfigs) reminderConfigs = JSON.parse(rawConfigs)
    } catch (_) {}
    if (!Array.isArray(reminderConfigs)) reminderConfigs = []

    var dateStr = apptRecord.getString('date')
    var timeStr =
      apptRecord.getString('start_time') ||
      apptRecord.getString('reference_time_for_reminder') ||
      '09:00'

    var reminderCol = $app.findCollectionByNameOrId('jetro_agenda_reminders')

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
      return e.next()
    }

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
      return e.next()
    }

    var tTime = timeStr && timeStr.indexOf(':') !== -1 ? timeStr.trim() : '09:00'
    var targetDate = new Date(dateStr + 'T' + tTime + ':00-03:00')
    var targetUtcMs = targetDate.getTime()
    var nowUtcMs = Date.now()

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
      var cr = currentReminders[cIdx]
      currentByOffset[cr.getString('reminder_offset_key')] = cr
    }

    var parseOffsetMins = function (offsetKey) {
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

    var validOffsets = {}
    for (var k = 0; k < reminderConfigs.length; k++) {
      var offKey = String(reminderConfigs[k]).trim()
      var mins = parseOffsetMins(offKey)
      if (mins === null) continue
      validOffsets[offKey] = mins

      var schedMs = targetUtcMs - mins * 60 * 1000
      var schedIso = new Date(schedMs).toISOString()
      var exRec = currentByOffset[offKey]

      if (exRec) {
        if (exRec.getString('status') === 'pending' || exRec.getString('status') === 'cancelled') {
          exRec.set('recipient_email', recipientEmail)
          exRec.set('recipient_name', recipientName)
          exRec.set('appointment_title', apptRecord.getString('title'))
          exRec.set('appointment_description', apptRecord.getString('description'))
          exRec.set('appointment_date', dateStr)
          exRec.set('appointment_time', timeStr)
          exRec.set('appointment_priority', apptRecord.getString('priority'))
          exRec.set('appointment_type', apptRecord.getString('type'))
          exRec.set('scheduled_for', schedIso)
          exRec.set('status', schedMs <= nowUtcMs ? 'skipped_past' : 'pending')
          $app.saveNoValidate(exRec)
        }
      } else {
        var nRem = new Record(reminderCol, {
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
          reminder_offset_key: offKey,
          scheduled_for: schedIso,
          status: schedMs <= nowUtcMs ? 'skipped_past' : 'pending',
          attempts: 0,
        })
        $app.saveNoValidate(nRem)
      }
    }
  } catch (err) {
    $app.logger().error('Falha ao sincronizar lembretes pós-create', 'error', String(err))
  }
  return e.next()
}, 'jetro_agenda_appointments')

// Hook pós-atualização
onRecordAfterUpdateSuccess((e) => {
  if (e.record.collectionName !== 'jetro_agenda_appointments') return e.next()
  try {
    var apptRecord = e.record
    var apptId = apptRecord.id
    var userId = apptRecord.getString('user_id')
    var status = apptRecord.getString('status')
    var hasReminder = apptRecord.getBool('has_reminder')
    var rawConfigs = apptRecord.getString('reminder_configs')
    var reminderConfigs = []
    try {
      if (rawConfigs) reminderConfigs = JSON.parse(rawConfigs)
    } catch (_) {}
    if (!Array.isArray(reminderConfigs)) reminderConfigs = []

    var dateStr = apptRecord.getString('date')
    var timeStr =
      apptRecord.getString('start_time') ||
      apptRecord.getString('reference_time_for_reminder') ||
      '09:00'

    var reminderCol = $app.findCollectionByNameOrId('jetro_agenda_reminders')

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
      return e.next()
    }

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
      return e.next()
    }

    var tTime = timeStr && timeStr.indexOf(':') !== -1 ? timeStr.trim() : '09:00'
    var targetDate = new Date(dateStr + 'T' + tTime + ':00-03:00')
    var targetUtcMs = targetDate.getTime()
    var nowUtcMs = Date.now()

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
      var cr = currentReminders[cIdx]
      currentByOffset[cr.getString('reminder_offset_key')] = cr
    }

    var parseOffsetMins = function (offsetKey) {
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

    var validOffsets = {}
    for (var k = 0; k < reminderConfigs.length; k++) {
      var offKey = String(reminderConfigs[k]).trim()
      var mins = parseOffsetMins(offKey)
      if (mins === null) continue
      validOffsets[offKey] = mins

      var schedMs = targetUtcMs - mins * 60 * 1000
      var schedIso = new Date(schedMs).toISOString()
      var exRec = currentByOffset[offKey]

      if (exRec) {
        if (exRec.getString('status') === 'pending' || exRec.getString('status') === 'cancelled') {
          exRec.set('recipient_email', recipientEmail)
          exRec.set('recipient_name', recipientName)
          exRec.set('appointment_title', apptRecord.getString('title'))
          exRec.set('appointment_description', apptRecord.getString('description'))
          exRec.set('appointment_date', dateStr)
          exRec.set('appointment_time', timeStr)
          exRec.set('appointment_priority', apptRecord.getString('priority'))
          exRec.set('appointment_type', apptRecord.getString('type'))
          exRec.set('scheduled_for', schedIso)
          exRec.set('status', schedMs <= nowUtcMs ? 'skipped_past' : 'pending')
          $app.saveNoValidate(exRec)
        }
      } else {
        var nRem = new Record(reminderCol, {
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
          reminder_offset_key: offKey,
          scheduled_for: schedIso,
          status: schedMs <= nowUtcMs ? 'skipped_past' : 'pending',
          attempts: 0,
        })
        $app.saveNoValidate(nRem)
      }
    }

    for (var offKeyDb in currentByOffset) {
      if (!validOffsets[offKeyDb]) {
        var toCancel = currentByOffset[offKeyDb]
        if (toCancel.getString('status') === 'pending') {
          toCancel.set('status', 'cancelled')
          $app.saveNoValidate(toCancel)
        }
      }
    }
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

// Cron Job de Processamento e Envio de Lembretes no Servidor
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

  var senderAddress = $app.settings().meta.senderAddress || 'no-reply@huram.com.br'
  var senderName = $app.settings().meta.senderName || 'HURAM — Agenda'

  for (var i = 0; i < pendingReminders.length; i++) {
    var rem = pendingReminders[i]
    var apptId = rem.getString('appointment_id')

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
    var rEmailLower = (recipientEmail || '').toLowerCase().trim()
    if (
      !rEmailLower ||
      rEmailLower.indexOf('@') === -1 ||
      rEmailLower.indexOf('teste') !== -1 ||
      rEmailLower.indexOf('exemplo') !== -1 ||
      rEmailLower.indexOf('@example.') !== -1
    ) {
      rem.set('status', 'failed')
      rem.set('error_message', 'E-mail destinatário de teste ou inválido ignorado')
      $app.saveNoValidate(rem)
      continue
    }

    var title = rem.getString('appointment_title')
    var desc = rem.getString('appointment_description')
    var dateStr = rem.getString('appointment_date')
    var timeStr = rem.getString('appointment_time') || 'Dia inteiro / Horário flexível'
    var priority = rem.getString('appointment_priority') || 'Média'
    var type = rem.getString('appointment_type') || 'Compromisso'
    var offsetKey = rem.getString('reminder_offset_key')
    var recipientName = rem.getString('recipient_name') || 'Colaborador'
    var subject = 'Lembrete da Agenda HURAM: ' + title

    var formatOffsetLabel = function (k) {
      if (k === '15m') return '15 minutos antes'
      if (k === '30m') return '30 minutos antes'
      if (k === '1h') return '1 hora antes'
      if (k === '2h') return '2 horas antes'
      if (k === '1d') return '1 dia antes'
      return k || 'horário programado'
    }

    var htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">' +
      '<div style="background: #003D30; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #D6A755;">' +
      '<h2 style="color: #E4C46A; margin: 0;">HURAM — Agenda Corporativa</h2>' +
      '<p style="color: #ffffff; font-size: 13px; margin: 6px 0 0;">Lembrete de Compromisso</p>' +
      '</div>' +
      '<div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">' +
      '<p style="font-size: 15px;">Olá, <strong>' +
      recipientName +
      '</strong>. Você tem um compromisso agendado para ' +
      formatOffsetLabel(offsetKey) +
      ':</p>' +
      '<h3 style="color: #003D30; margin: 12px 0;">' +
      title +
      '</h3>' +
      '<p style="font-size: 14px; margin: 4px 0;"><strong>Data:</strong> ' +
      dateStr +
      ' às ' +
      timeStr +
      '</p>' +
      '<p style="font-size: 14px; margin: 4px 0;"><strong>Tipo:</strong> ' +
      type +
      ' | <strong>Prioridade:</strong> ' +
      priority +
      '</p>' +
      (desc
        ? '<p style="font-size: 13px; color: #64748b; margin-top: 10px;">' + desc + '</p>'
        : '') +
      '</div>' +
      '</div>'

    try {
      var msg = new MailerMessage({
        from: { address: senderAddress, name: senderName },
        to: [{ address: recipientEmail }],
        subject: subject,
        html: htmlBody,
      })
      $app.newMailClient().send(msg)

      rem.set('status', 'sent')
      rem.set('sent_at', new Date().toISOString())
      rem.set('error_message', '')
      rem.set('attempts', (rem.getInt('attempts') || 0) + 1)
      $app.saveNoValidate(rem)

      try {
        var notifCol = $app.findCollectionByNameOrId('notifications')
        var uId = rem.getString('user_id')
        if (uId) {
          var nRec = new Record(notifCol, {
            title: 'Lembrete: ' + title,
            message: 'Data: ' + dateStr + ' às ' + timeStr,
            type: 'agenda_reminder',
            recipient: uId,
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

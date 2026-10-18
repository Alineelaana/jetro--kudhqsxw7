/// <reference path="../pb_data/types.d.ts" />

/**
 * Rota POST /backend/v1/sessions/terminate
 * Encerra uma sessão específica ou todas as sessões de um usuário.
 * Invalidação REAL no backend (banco de dados audit_sessions e geração de auth_events).
 * Registra auditoria de quem executou o encerramento.
 */
routerAdd('POST', '/backend/v1/sessions/terminate', (e) => {
  var authUser = e.auth
  if (!authUser) {
    return e.forbiddenError('Não autenticado')
  }

  var body = e.requestInfo().body || {}
  var sessionId = body.session_id || ''
  var targetUserId = body.user_id || ''
  var terminateAll = body.terminate_all === true
  var reason = body.reason || 'Encerramento remoto administrativo'

  var isSup = authUser.getString('role') === 'SUP'

  // Apenas SUP pode encerrar sessões de outros usuários
  if (!isSup && targetUserId && targetUserId !== authUser.id) {
    return e.forbiddenError(
      'Apenas administradores (SUP) podem encerrar sessões de outros colaboradores',
    )
  }

  var nowIso = new Date().toISOString()
  var nowFormatted = nowIso.replace('T', ' ').substring(0, 19)
  var terminatedCount = 0

  try {
    var sessCol = $app.findCollectionByNameOrId('audit_sessions')
    var authEventsCol = $app.findCollectionByNameOrId('auth_events')
    var accessLogsCol = $app.findCollectionByNameOrId('audit_access_consultations')

    var sessionsToClose = []

    if (terminateAll && targetUserId) {
      sessionsToClose = $app.findRecordsByFilter(
        'audit_sessions',
        'user_id = "' + targetUserId + '" && status = "active"',
        '-created',
        100,
        0,
      )
    } else if (sessionId) {
      try {
        var s = $app.findFirstRecordByData('audit_sessions', 'session_id', sessionId)
        if (s) sessionsToClose.push(s)
      } catch (_) {}
    }

    for (var i = 0; i < sessionsToClose.length; i++) {
      var sess = sessionsToClose[i]
      sess.set('status', 'closed')
      sess.set('logout_time', nowFormatted)
      sess.set('is_invalidated', true)
      sess.set('ended_by', authUser.id)
      sess.set('terminated_reason', reason)
      $app.save(sess)
      terminatedCount++

      // Registrar evento imutável na auth_events
      try {
        var ev = new Record(authEventsCol)
        ev.set('user_id', sess.getString('user_id'))
        ev.set('user_name', sess.getString('user_name'))
        ev.set('event_type', 'session_terminated')
        ev.set('result', 'sucesso')
        ev.set('failure_reason', reason + ' por ' + (authUser.getString('name') || authUser.email))
        ev.set('session_id', sess.getString('session_id'))
        ev.set('ip_address', sess.getString('ip_address'))
        ev.set('device_type', sess.getString('device'))
        ev.set('os_name', sess.getString('os'))
        ev.set('browser_name', sess.getString('browser'))
        ev.set('session_ended_at', nowFormatted)
        $app.save(ev)
      } catch (_) {}
    }

    // Registrar na auditoria de consultas restritas (audit_access_consultations)
    try {
      var acc = new Record(accessLogsCol)
      acc.set('operator_id', authUser.id)
      acc.set('operator_name', authUser.getString('name') || authUser.email || 'Admin')
      acc.set('operator_role', authUser.getString('role') || 'SUP')
      acc.set(
        'target_user_id',
        targetUserId || (sessionsToClose[0] ? sessionsToClose[0].getString('user_id') : ''),
      )
      acc.set('action_consulted', 'encerrar_sessao_remota')
      acc.set('justification', reason + ' (' + terminatedCount + ' sessão/sessões encerradas)')
      $app.save(acc)
    } catch (_) {}
  } catch (err) {
    $app.logger().error('sessions terminate error', 'error', String(err))
    return e.json(500, { error: 'Falha ao encerrar sessões: ' + String(err) })
  }

  return e.json(200, {
    ok: true,
    terminated_count: terminatedCount,
    timestamp: nowFormatted,
  })
})

/**
 * Rota POST /backend/v1/audit/log-consultation
 * Registra quem consultou coordenadas precisas, histórico restrito ou relatórios (LGPD).
 */
routerAdd('POST', '/backend/v1/audit/log-consultation', (e) => {
  var authUser = e.auth
  if (!authUser) {
    return e.forbiddenError('Não autenticado')
  }

  var body = e.requestInfo().body || {}
  var targetUserId = body.target_user_id || ''
  var actionConsulted = body.action_consulted || ''
  var justification = body.justification || ''

  if (!targetUserId || !actionConsulted) {
    return e.badRequestError('target_user_id and action_consulted are required')
  }

  try {
    var accessLogsCol = $app.findCollectionByNameOrId('audit_access_consultations')
    var acc = new Record(accessLogsCol)
    acc.set('operator_id', authUser.id)
    acc.set('operator_name', authUser.getString('name') || authUser.email || 'Admin')
    acc.set('operator_role', authUser.getString('role') || 'SUP')
    acc.set('target_user_id', targetUserId)
    acc.set('target_user_name', body.target_user_name || '')
    acc.set('action_consulted', actionConsulted)
    acc.set('justification', justification)
    $app.save(acc)
  } catch (err) {
    $app.logger().error('log consultation error', 'error', String(err))
  }

  return e.json(200, { ok: true })
})

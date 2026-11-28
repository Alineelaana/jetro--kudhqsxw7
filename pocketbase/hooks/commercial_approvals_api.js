// Hooks de Liberações Comerciais (Rotinas) — /backend/v1/commercial-approvals
//
// Regras de plataforma respeitadas:
// - routerAdd com caminho no padrão /backend/v1/...
// - NENHUMA referência a funções/constantes de nível superior dentro dos
//   callbacks (Hook scoping error do JSVM): toda a lógica é embutida inline.
// - onRecordCreate SEMPRE chama e.next().
//
// Endpoints:
//   POST /backend/v1/commercial-approvals/decide
//        { divergence_id, decision: 'aplicada'|'recusada', reason? }
//        Idempotente: apenas a PRIMEIRA decisão válida é aceita; tentativas
//        seguintes sobre a mesma divergência retornam 409 e não duplicam.
//   GET  /backend/v1/commercial-approvals/history/{requestId}
//        Histórico completo de decisões de uma solicitação.
//   POST /backend/v1/commercial-approvals/notify
//        Notifica (sem duplicar) o responsável pela análise no sino do sistema.
//        { request_id } — lê a solicitação e envia 1 notificação por solicitação.

routerAdd(
  'POST',
  '/backend/v1/commercial-approvals/decide',
  (e) => {
    const info = e.requestInfo()
    const auth = info.auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }

    const body = info.body || {}
    const divergenceId = String(body.divergence_id || '')
    const decision = String(body.decision || '')
    const reason = String(body.reason || '')

    if (divergenceId === '' || (decision !== 'aplicada' && decision !== 'recusada')) {
      return e.json(400, {
        error: 'Parâmetros inválidos: divergence_id e decision são obrigatórios',
      })
    }
    if (decision === 'recusada' && reason === '') {
      return e.json(400, { error: 'Motivo da recusa é obrigatório' })
    }

    let divergence = null
    try {
      divergence = e.app.findRecordById('commercial_release_divergences', divergenceId)
    } catch (err) {
      return e.json(404, { error: 'Divergência não encontrada' })
    }

    if (divergence.getString('status') !== 'pendente') {
      return e.json(409, {
        error: 'Divergência já decidida por outro usuário',
        status: divergence.getString('status'),
      })
    }

    const requestId = divergence.getString('request_id')
    let request = null
    try {
      request = e.app.findRecordById('commercial_release_requests', requestId)
    } catch (err) {
      return e.json(404, { error: 'Solicitação não encontrada' })
    }

    const now = new Date().toISOString()
    const userName =
      auth.getString('name') !== '' ? auth.getString('name') : auth.getString('email')

    // 1. Grava a decisão (histórico append-only)
    const decisionRecord = new Record(
      e.app.findCollectionByNameOrId('commercial_release_decisions'),
    )
    decisionRecord.set('request_id', requestId)
    decisionRecord.set('divergence_id', divergenceId)
    decisionRecord.set('order_number', request.getString('order_number'))
    decisionRecord.set('client_name', request.getString('client_name'))
    decisionRecord.set('rca_name', request.getString('rca_name'))
    decisionRecord.set('rule_description', divergence.getString('rule_description'))
    decisionRecord.set('limit_value', divergence.getFloat('limit_value'))
    decisionRecord.set('requested_value', divergence.getFloat('requested_value'))
    decisionRecord.set('decision', decision)
    decisionRecord.set('reason', reason)
    decisionRecord.set('decided_by', userName)
    decisionRecord.set('decided_by_id', auth.id)
    decisionRecord.set('empresa_id', request.getString('empresa_id'))
    decisionRecord.set('filial_id', request.getString('filial_id'))
    e.app.save(decisionRecord)

    // 2. Atualiza a divergência (status + auditoria)
    divergence.set('status', decision)
    divergence.set('decided_by', userName)
    divergence.set('decided_at', now)
    if (reason !== '') {
      divergence.set('decision_note', reason)
    }
    e.app.save(divergence)

    // 3. Recalcula a solicitação: pendente até TODAS as divergências decidirem
    const total = divergence.getFloat('limit_value') // placeholder p/ lint; recalcula abaixo
    let pendentes = 0
    let aplicadas = 0
    let recusadas = 0
    try {
      const todas = e.app.findRecordsByFilter(
        'commercial_release_divergences',
        "request_id = '" + requestId + "'",
        '-created',
        500,
        0,
      )
      for (let i = 0; i < todas.length; i++) {
        const st = todas[i].getString('status')
        if (st === 'pendente') pendentes++
        else if (st === 'aplicada') aplicadas++
        else if (st === 'recusada') recusadas++
      }
    } catch (err) {
      // usa contagens parciais
    }

    request.set('resolved_count', aplicadas + recusadas)
    let newStatus = request.getString('status')
    if (newStatus !== 'cancelada') {
      if (pendentes === 0) {
        newStatus = recusadas > 0 ? 'recusada' : 'aprovada'
      }
      request.set('status', newStatus)
    }
    request.set('notes', 'decisoes: ' + aplicadas + ' aplicadas / ' + recusadas + ' recusadas')
    e.app.save(request)

    return e.json(200, {
      ok: true,
      request_id: requestId,
      request_status: request.getString('status'),
      divergences: { total: aplicadas + recusadas + pendentes, aplicadas, recusadas, pendentes },
      decisions_recorded: 1,
    })
  },
  (e) => {
    // validador de auth opcional — deixado vazio para permitir o guard inline acima
    e.next()
  },
)

routerAdd(
  'GET',
  '/backend/v1/commercial-approvals/history/{requestId}',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const requestId = e.request.pathValue('requestId')
    const records = e.app.findRecordsByFilter(
      'commercial_release_decisions',
      "request_id = '" + requestId + "'",
      'created',
      500,
      0,
    )
    const out = []
    for (let i = 0; i < records.length; i++) {
      const r = records[i]
      out.push({
        id: r.id,
        divergence_id: r.getString('divergence_id'),
        order_number: r.getString('order_number'),
        client_name: r.getString('client_name'),
        rca_name: r.getString('rca_name'),
        rule_description: r.getString('rule_description'),
        limit_value: r.getFloat('limit_value'),
        requested_value: r.getFloat('requested_value'),
        decision: r.getString('decision'),
        reason: r.getString('reason'),
        decided_by: r.getString('decided_by'),
        decided_by_id: r.getString('decided_by_id'),
        created: r.getString('created'),
      })
    }
    return e.json(200, { request_id: requestId, total: out.length, decisions: out })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/commercial-approvals/notify',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const body = e.requestInfo().body || {}
    const requestId = String(body.request_id || '')
    if (requestId === '') {
      return e.json(400, { error: 'request_id é obrigatório' })
    }

    let request = null
    try {
      request = e.app.findRecordById('commercial_release_requests', requestId)
    } catch (err) {
      return e.json(404, { error: 'Solicitação não encontrada' })
    }

    const responsavelId = request.getString('responsavel_id')
    if (responsavelId === '') {
      return e.json(200, {
        ok: false,
        pending_assignment: true,
        message:
          'Sem responsável configurado — sinalize a pendência para a gestão atribuir um responsável',
      })
    }

    // Idempotente: 1 notificação por solicitação + tipo
    let existing = null
    try {
      existing = e.app.findFirstRecordByFilter(
        'notifications',
        "recipient = '" +
          responsavelId +
          "' && type = 'commercial_release' && link ~ '" +
          requestId +
          "'",
      )
    } catch (err) {
      existing = null
    }
    if (existing) {
      return e.json(200, { ok: true, deduplicated: true })
    }

    const notification = new Record(e.app.findCollectionByNameOrId('notifications'))
    notification.set('title', 'Liberação comercial pendente')
    notification.set(
      'message',
      'Pedido ' +
        request.getString('order_number') +
        ' — ' +
        request.getString('client_name') +
        ' (RCA ' +
        request.getString('rca_name') +
        ') aguarda análise de divergência comercial',
    )
    notification.set('recipient', responsavelId)
    notification.set('read', false)
    notification.set('link', '/admin/rotinas/liberacoes-comerciais?request=' + requestId)
    notification.set('type', 'commercial_release')
    e.app.save(notification)

    return e.json(200, { ok: true, deduplicated: false })
  },
  (e) => {
    e.next()
  },
)

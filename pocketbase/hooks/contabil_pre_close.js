routerAdd(
  'POST',
  '/backend/v1/contabil/pre-close',
  (e) => {
    const body = e.requestInfo().body || {}
    const periodo = body.periodo || ''
    const empresa = body.empresa || ''
    if (!periodo) return e.badRequestError('periodo is required')

    var checklist = {}
    try {
      var naoContab = $app.findRecordsByFilter(
        'contabil_lancamentos',
        'status = "Rascunho" || status = "Aguardando Conferência" || status = "Aguardando Aprovação"',
        'created',
        1,
        0,
      )
      checklist.lancamentos_nao_contabilizados = naoContab.length
    } catch (_) {
      checklist.lancamentos_nao_contabilizados = 0
    }

    try {
      var lotesPend = $app.findRecordsByFilter(
        'contabil_lotes',
        'status = "Em Digitação" || status = "Aguardando Conferência" || status = "Aguardando Aprovação"',
        'created',
        1,
        0,
      )
      checklist.lotes_pendentes = lotesPend.length
    } catch (_) {
      checklist.lotes_pendentes = 0
    }

    try {
      var concPend = $app.findRecordsByFilter(
        'contabil_reconciliations',
        'status = "Pendente" || status = "Com Divergência"',
        'created',
        1,
        0,
      )
      checklist.conciliacoes_pendentes = concPend.length
    } catch (_) {
      checklist.conciliacoes_pendentes = 0
    }

    try {
      var integPend = $app.findRecordsByFilter(
        'contabil_pending_integrations',
        'status = "Pendente"',
        'created',
        1,
        0,
      )
      checklist.integracoes_pendentes = integPend.length
    } catch (_) {
      checklist.integracoes_pendentes = 0
    }

    try {
      var provAtivas = $app.findRecordsByFilter(
        'contabil_provisions',
        'status = "Ativo"',
        'created',
        1,
        0,
      )
      checklist.provisoes_nao_realizadas = provAtivas.length
    } catch (_) {
      checklist.provisoes_nao_realizadas = 0
    }

    var totalPendencias = 0
    var keys = Object.keys(checklist)
    for (var i = 0; i < keys.length; i++) totalPendencias += checklist[keys[i]]
    checklist.total_pendencias = totalPendencias
    checklist.pode_fechar = totalPendencias === 0

    return e.json(200, checklist)
  },
  $apis.requireAuth(),
)

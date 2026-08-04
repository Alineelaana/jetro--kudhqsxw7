routerAdd(
  'POST',
  '/backend/v1/contabil/process-lote',
  (e) => {
    const body = e.requestInfo().body || {}
    const loteId = body.lote_id || ''
    if (!loteId) return e.badRequestError('lote_id is required')

    try {
      var lote = $app.findRecordById('contabil_lotes', loteId)
      var entries = $app.findRecordsByFilter(
        'contabil_lancamentos',
        'lote_id = "' + loteId + '"',
        'created',
        0,
        0,
      )
      var totalD = 0,
        totalC = 0,
        hasDivergence = false
      for (var i = 0; i < entries.length; i++) {
        var td = parseFloat(entries[i].getString('total_debitos') || '0')
        var tc = parseFloat(entries[i].getString('total_creditos') || '0')
        totalD += td
        totalC += tc
        if (Math.abs(td - tc) > 0.01) hasDivergence = true
      }
      if (hasDivergence) {
        lote.set('status', 'Com Divergência')
        lote.set('quantidade_lancamentos', entries.length)
        lote.set('total_debitos', String(totalD.toFixed(2)))
        lote.set('total_creditos', String(totalC.toFixed(2)))
        $app.save(lote)
        return e.json(200, { success: false, reason: 'debit credit mismatch' })
      }
      for (var j = 0; j < entries.length; j++) {
        entries[j].set('status', 'Contabilizado')
        $app.save(entries[j])
      }
      lote.set('status', 'Processado')
      lote.set('quantidade_lancamentos', entries.length)
      lote.set('total_debitos', String(totalD.toFixed(2)))
      lote.set('total_creditos', String(totalC.toFixed(2)))
      lote.set('responsavel', e.auth ? e.auth.getString('name') || e.auth.email : 'Sistema')
      $app.save(lote)
      return e.json(200, { success: true, processed: entries.length })
    } catch (err) {
      $app.logger().error('contabil process lote failed', 'error', String(err))
      return e.json(500, { error: 'failed to process lote' })
    }
  },
  $apis.requireAuth(),
)

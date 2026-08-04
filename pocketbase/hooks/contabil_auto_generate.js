routerAdd(
  'POST',
  '/backend/v1/contabil/auto-generate',
  (e) => {
    const body = e.requestInfo().body || {}
    const opType = body.tipo_operacao || ''
    const valor = body.valor || '0'
    const documento = body.documento || ''
    const empresa = body.empresa || ''
    const filial = body.filial || ''
    const origemId = body.origem_id || ''
    const moduloOrigem = body.modulo_origem || ''
    if (!opType) return e.badRequestError('tipo_operacao is required')

    try {
      var rules = $app.findRecordsByFilter(
        'contabil_integration_rules',
        'tipo_operacao = "' + opType + '" && ativo = true',
        '-created',
        1,
        0,
      )
      if (
        rules.length > 0 &&
        rules[0].getString('conta_debito') &&
        rules[0].getString('conta_credito')
      ) {
        var rule = rules[0]
        var lancCol = $app.findCollectionByNameOrId('contabil_lancamentos')
        var lanc = new Record(lancCol)
        var today = new Date().toISOString().split('T')[0]
        lanc.set('numero_lancamento', 'LC-' + Date.now().toString(36).toUpperCase())
        lanc.set('data_lancamento', today)
        lanc.set('data_competencia', rule.getString('data_competencia') || today)
        lanc.set('empresa', empresa)
        lanc.set('filial', filial)
        lanc.set('historico', rule.getString('historico_padrao') || opType)
        lanc.set('documento_origem', moduloOrigem)
        lanc.set('numero_documento', documento)
        lanc.set('conta_debito', rule.getString('conta_debito'))
        lanc.set('conta_credito', rule.getString('conta_credito'))
        lanc.set('valor', valor)
        lanc.set('centro_custo', rule.getString('centro_custo'))
        lanc.set('projeto', rule.getString('projeto'))
        lanc.set('status', 'Contabilizado')
        lanc.set('origem', moduloOrigem)
        lanc.set('total_debitos', valor)
        lanc.set('total_creditos', valor)
        lanc.set(
          'usuario_responsavel',
          e.auth ? e.auth.getString('name') || e.auth.email : 'Sistema',
        )
        $app.save(lanc)
        return e.json(201, { success: true, lancamento_id: lanc.id })
      }
      var pendCol = $app.findCollectionByNameOrId('contabil_pending_integrations')
      var pend = new Record(pendCol)
      pend.set('data', new Date().toISOString().split('T')[0])
      pend.set('modulo_origem', moduloOrigem)
      pend.set('documento', documento)
      pend.set('tipo_operacao', opType)
      pend.set('valor', valor)
      pend.set(
        'motivo_pendencia',
        rules.length === 0
          ? 'Regra de integração não configurada'
          : 'Regra de integração incompleta',
      )
      pend.set('status', 'Pendente')
      pend.set('origem_id', origemId)
      $app.save(pend)
      return e.json(201, {
        success: false,
        pending_id: pend.id,
        reason: 'integration rule missing or incomplete',
      })
    } catch (err) {
      $app.logger().error('contabil auto generate failed', 'error', String(err))
      return e.json(500, { error: 'failed to generate accounting entry' })
    }
  },
  $apis.requireAuth(),
)

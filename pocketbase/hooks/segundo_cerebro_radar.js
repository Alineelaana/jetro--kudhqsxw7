// Endpoint de análise do Radar de Oportunidades e Processos
routerAdd(
  'POST',
  '/backend/v1/segundo-cerebro/scan-radar',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')

      var userRecord = null
      try {
        userRecord = $app.findRecordById('users', userId)
      } catch (_) {}

      var userRole = userRecord ? userRecord.getString('role') : ''
      if (userRole !== 'SUP' && userRole !== 'COMERCIAL' && userRole !== 'FINANCEIRO') {
        return e.forbiddenError('Acesso restrito para verificação do Radar de Oportunidades')
      }

      // Varrer documentos ativos do Segundo Cérebro
      var docs = $app.findRecordsByFilter(
        'segundo_cerebro_docs',
        "status = 'ativo'",
        '-created',
        50,
        0,
      )
      var decisions = $app.findRecordsByFilter('segundo_cerebro_decisions', '', '-date', 50, 0)
      var oppCol = $app.findCollectionByNameOrId('segundo_cerebro_opportunities')

      var createdCount = 0

      // 1. Detectar decisões com conflitos não mapeadas em oportunidades
      for (var d = 0; d < decisions.length; d++) {
        var dec = decisions[d]
        if (dec.getBool('has_conflict')) {
          var decSubject = dec.getString('subject')
          // Verificar se já existe oportunidade para este conflito
          var existingOpp = []
          try {
            existingOpp = $app.findRecordsByFilter(
              'segundo_cerebro_opportunities',
              "title ~ '" + decSubject.substring(0, 30).replace(/'/g, "''") + "'",
              '-created',
              1,
              0,
            )
          } catch (_) {}

          if (existingOpp.length === 0) {
            var newOpp = new Record(oppCol)
            newOpp.set('title', 'Divergência Documental Identificada: ' + decSubject)
            newOpp.set('area', dec.getString('area') || 'Administração')
            newOpp.set('type', 'Inconsistência documental')
            newOpp.set(
              'description',
              dec.getString('conflict_notes') ||
                'Decisão registrada possui apontamento de conflito com outras diretrizes corporativas vigentes.',
            )
            newOpp.set(
              'evidence',
              'Origem: ' +
                (dec.getString('document_source_title') || 'Ata/Decisão ' + dec.getString('date')),
            )
            newOpp.set(
              'potential_impact',
              'Risco de insegurança jurídica ou desalinhamento operacional entre departamentos.',
            )
            newOpp.set('priority', 'Alta')
            newOpp.set(
              'recommendation',
              'Submeter as fontes conflitantes à diretoria executiva para deliberação e unificação documental.',
            )
            newOpp.set('sources', [
              {
                doc_id: dec.getString('document_source_id'),
                title: dec.getString('document_source_title'),
                excerpt: dec.getString('decision'),
              },
            ])
            newOpp.set('status', 'Em análise')
            $app.save(newOpp)
            createdCount++
          }
        }
      }

      return e.json(200, {
        success: true,
        scanned_docs: docs.length,
        scanned_decisions: decisions.length,
        new_opportunities_identified: createdCount,
        message:
          createdCount > 0
            ? createdCount +
              ' novas oportunidades/inconsistências identificadas e registradas no Radar.'
            : 'Varredura concluída. Nenhuma nova divergência encontrada com base nos documentos ativos.',
      })
    } catch (err) {
      return e.json(500, { error: 'Falha ao processar varredura do Radar: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

// Scheduled job para o Radar de Oportunidades (análise periódica a cada 6 horas)
cronAdd('segundo_cerebro_radar_scan', '0 */6 * * *', () => {
  try {
    var decisions = $app.findRecordsByFilter(
      'segundo_cerebro_decisions',
      'has_conflict = true',
      '-date',
      20,
      0,
    )
    var oppCol = $app.findCollectionByNameOrId('segundo_cerebro_opportunities')

    for (var d = 0; d < decisions.length; d++) {
      var dec = decisions[d]
      var decSubject = dec.getString('subject')
      var existing = []
      try {
        existing = $app.findRecordsByFilter(
          'segundo_cerebro_opportunities',
          "title ~ '" + decSubject.substring(0, 30).replace(/'/g, "''") + "'",
          '-created',
          1,
          0,
        )
      } catch (_) {}

      if (existing.length === 0) {
        var opp = new Record(oppCol)
        opp.set('title', 'Divergência Documental: ' + decSubject)
        opp.set('area', dec.getString('area') || 'Administração')
        opp.set('type', 'Inconsistência documental')
        opp.set(
          'description',
          dec.getString('conflict_notes') || 'Conflito detectado na memória de decisões.',
        )
        opp.set(
          'evidence',
          'Origem: ' + (dec.getString('document_source_title') || dec.getString('date')),
        )
        opp.set('potential_impact', 'Insegurança em processos operacionais e auditoria.')
        opp.set('priority', 'Média')
        opp.set('recommendation', 'Revisar ata e atualizar norma vigente.')
        opp.set('sources', [{ title: dec.getString('document_source_title') }])
        opp.set('status', 'Em análise')
        $app.save(opp)
      }
    }
  } catch (err) {
    $app.logger().warn('Cron segundo_cerebro_radar_scan falhou', 'error', String(err))
  }
})

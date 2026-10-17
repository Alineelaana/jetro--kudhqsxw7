routerAdd(
  'POST',
  '/backend/v1/segundo-cerebro/sync-obsidian',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')

      var userRecord = null
      try {
        userRecord = $app.findRecordById('users', userId)
      } catch (_) {}

      var userRole = userRecord ? userRecord.getString('role') : ''
      var userName = userRecord
        ? userRecord.getString('name') || userRecord.getString('email')
        : 'Usuário'

      // Permissão para sincronizar Obsidian: SUP, FINANCEIRO ou COMERCIAL
      if (userRole !== 'SUP' && userRole !== 'COMERCIAL' && userRole !== 'FINANCEIRO') {
        return e.forbiddenError(
          'Permissão insuficiente para administrar integrações do Segundo Cérebro',
        )
      }

      var notes = body.notes || [] // Array de { path, title, content, tags, wikilinks, area, category, project }
      var sourceType = body.source_type || 'obsidian_file' // 'obsidian_file' ou 'obsidian_zip'
      var fileName = body.file_name || 'importacao_obsidian'

      if (!notes || notes.length === 0) {
        return e.badRequestError('Nenhuma nota fornecida para sincronização')
      }

      var docsCol = $app.findCollectionByNameOrId('segundo_cerebro_docs')
      var syncLogsCol = $app.findCollectionByNameOrId('segundo_cerebro_sync_logs')

      var addedCount = 0
      var updatedCount = 0
      var unchangedCount = 0
      var errors = []

      var nowIso = new Date().toISOString()

      for (var i = 0; i < notes.length; i++) {
        var note = notes[i]
        try {
          var notePath = note.path || note.title + '.md'
          var noteTitle = note.title || notePath.replace(/\.md$/, '').split('/').pop()
          var noteContent = note.content || ''
          var contentHash = $security.md5(noteContent)

          // Extrair wikilinks [[link]] se não informados
          var wikilinks = note.wikilinks || []
          if (!wikilinks || wikilinks.length === 0) {
            var linkMatches = noteContent.match(/\[\[(.*?)\]\]/g) || []
            for (var l = 0; l < linkMatches.length; l++) {
              var cleanLink = linkMatches[l].replace(/^\[\[/, '').replace(/\]\]$/, '').split('|')[0]
              if (cleanLink && wikilinks.indexOf(cleanLink) === -1) {
                wikilinks.push(cleanLink)
              }
            }
          }

          // Extrair tags #tag se não informadas
          var tags = note.tags || []
          if (!tags || tags.length === 0) {
            var tagMatches = noteContent.match(/#[a-zA-Z0-9_\-\/]+/g) || []
            for (var t = 0; t < tagMatches.length; t++) {
              var cleanTag = tagMatches[t].replace(/^#/, '')
              if (cleanTag && tags.indexOf(cleanTag) === -1) {
                tags.push(cleanTag)
              }
            }
          }

          // Determinar área por convenção de pasta ou default
          var area = note.area || 'Processos e Procedimentos'
          var validAreas = [
            'Administração',
            'Comercial',
            'DP & RH',
            'Financeiro',
            'Fiscal',
            'Inteligência',
            'Logística e Operações',
            'Marketing e Trade Marketing',
            'Projetos Estratégicos',
            'Processos e Procedimentos',
            'Tecnologia e Sistemas',
            'Reuniões e Decisões',
            'Políticas e Normas Internas',
          ]
          if (validAreas.indexOf(area) === -1) {
            // Tentar inferir da pasta do caminho
            for (var a = 0; a < validAreas.length; a++) {
              if (notePath.toLowerCase().indexOf(validAreas[a].toLowerCase()) !== -1) {
                area = validAreas[a]
                break
              }
            }
          }

          // Verificar se já existe nota com mesmo path
          var existing = null
          try {
            var results = $app.findRecordsByFilter(
              'segundo_cerebro_docs',
              "path = '" + notePath.replace(/'/g, "''") + "'",
              '-created',
              1,
              0,
            )
            if (results && results.length > 0) {
              existing = results[0]
            }
          } catch (_) {}

          if (existing) {
            var oldHash = existing.getString('content_hash')
            if (oldHash === contentHash) {
              unchangedCount++
            } else {
              existing.set('title', noteTitle)
              existing.set('content', noteContent)
              existing.set('content_hash', contentHash)
              existing.set('area', area)
              if (note.category) existing.set('category', note.category)
              if (note.project) existing.set('project', note.project)
              existing.set('tags', tags)
              existing.set('wikilinks', wikilinks)
              existing.set('sync_date', nowIso)
              existing.set('sync_source', sourceType)
              existing.set('author_name', userName)
              if (note.summary) existing.set('summary', note.summary)
              $app.save(existing)
              updatedCount++
            }
          } else {
            var newDoc = new Record(docsCol)
            newDoc.set('title', noteTitle)
            newDoc.set('path', notePath)
            newDoc.set('content', noteContent)
            newDoc.set('content_hash', contentHash)
            newDoc.set('area', area)
            newDoc.set('category', note.category || 'Geral')
            newDoc.set('project', note.project || '')
            newDoc.set('tags', tags)
            newDoc.set('wikilinks', wikilinks)
            newDoc.set('sync_date', nowIso)
            newDoc.set('sync_source', sourceType)
            newDoc.set('confidentiality', note.confidentiality || 'Interno')
            newDoc.set('status', 'ativo')
            newDoc.set('author_id', userId)
            newDoc.set('author_name', userName)
            newDoc.set('summary', note.summary || noteContent.substring(0, 150))
            $app.save(newDoc)
            addedCount++
          }
        } catch (errNote) {
          errors.push('Erro na nota ' + (note.title || note.path) + ': ' + String(errNote))
        }
      }

      // Gravar log de sincronização
      var syncStatus =
        errors.length === 0 ? 'sucesso' : addedCount + updatedCount > 0 ? 'parcial' : 'erro'
      var syncSummary =
        'Total: ' +
        notes.length +
        ' | Novos: ' +
        addedCount +
        ' | Atualizados: ' +
        updatedCount +
        ' | Inalterados: ' +
        unchangedCount

      try {
        var logRec = new Record(syncLogsCol)
        logRec.set('user_id', userId)
        logRec.set('user_name', userName)
        logRec.set('source_type', sourceType === 'obsidian_zip' ? 'zip' : 'file')
        logRec.set('file_name', fileName)
        logRec.set('total_files', notes.length)
        logRec.set('added_files', addedCount)
        logRec.set('updated_files', updatedCount)
        logRec.set('unchanged_files', unchangedCount)
        logRec.set('deleted_files', 0)
        logRec.set('errors', errors)
        logRec.set('status', syncStatus)
        logRec.set('summary', syncSummary)
        $app.save(logRec)
      } catch (_) {}

      // Registrar auditoria
      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var auditRec = new Record(auditCol)
        auditRec.set('user_id', userId)
        auditRec.set('user_name', userName)
        auditRec.set('user_role', userRole || 'PADRAO')
        auditRec.set('action', 'SINCRONIZACAO_OBSIDIAN')
        auditRec.set('module', 'Segundo Cérebro')
        auditRec.set('target_collection', 'segundo_cerebro_docs')
        auditRec.set('target_summary', syncSummary)
        auditRec.set('criticidade', 'Média')
        auditRec.set('origem', 'Importação')
        $app.save(auditRec)
      } catch (_) {}

      return e.json(200, {
        success: syncStatus !== 'erro',
        status: syncStatus,
        total: notes.length,
        added: addedCount,
        updated: updatedCount,
        unchanged: unchangedCount,
        errors: errors,
        summary: syncSummary,
      })
    } catch (err) {
      return e.json(500, { error: 'Falha na sincronização do Obsidian: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

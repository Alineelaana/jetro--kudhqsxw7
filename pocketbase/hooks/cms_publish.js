routerAdd(
  'POST',
  '/backend/v1/cms/publish',
  (e) => {
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')
    if (e.auth.getString('role') !== 'SUP') return e.forbiddenError('Apenas SUP pode publicar')

    var pending = $app.findRecordsByFilter('cms_content', "status = 'pending'", 'section_key', 0, 0)
    var publishedCount = 0

    for (var i = 0; i < pending.length; i++) {
      var content = pending[i]
      var draft = content.get('draft_data')
      if (!draft) continue

      content.set('published_data', draft)
      content.set('status', 'published')
      $app.save(content)

      var versionsCol = $app.findCollectionByNameOrId('cms_versions')
      var version = new Record(versionsCol)
      version.set('section_key', content.getString('section_key'))
      version.set('version_data', draft)
      version.set('version_number', Math.floor(Date.now() / 1000))
      version.set('published_by', userId)
      version.set('published_at', new Date().toISOString())
      version.set('label', 'Publicacao ' + new Date().toLocaleString('pt-BR'))
      $app.save(version)

      publishedCount++
    }

    var pubCol = $app.findCollectionByNameOrId('cms_publication')
    var pubRecords = $app.findRecordsByFilter('cms_publication', "id != ''", '', 1, 0)
    var pubRecord
    if (pubRecords.length > 0) {
      pubRecord = pubRecords[0]
    } else {
      pubRecord = new Record(pubCol)
    }
    pubRecord.set('status', 'published')
    pubRecord.set('last_published_at', new Date().toISOString())
    pubRecord.set('last_published_by', userId)
    pubRecord.set('pending_changes', 0)
    $app.save(pubRecord)

    return e.json(200, { published: publishedCount })
  },
  $apis.requireAuth(),
)

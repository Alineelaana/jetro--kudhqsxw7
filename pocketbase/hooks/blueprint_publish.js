onRecordAfterUpdateSuccess((e) => {
  var record = e.record
  var prevStatus = record.original().getString('editorial_status')
  var currStatus = record.getString('editorial_status')

  if (currStatus !== 'Publicado' || prevStatus === 'Publicado') {
    return e.next()
  }

  try {
    var verCol = $app.findCollectionByNameOrId('blueprint_versions')
    var version = new Record(verCol)
    version.set('chapter_id', record.id)
    version.set('version_number', record.getString('version_number') || '1.0')
    version.set('version_label', 'Publicação')
    version.set('content_snapshot', record.getString('content') || '')
    version.set('content', record.getString('content') || '')
    version.set('author', record.getString('author') || '')
    version.set('approver', record.getString('aprovador') || '')
    version.set('motivo', 'Publicação automática via workflow')
    version.set('change_type', 'MINOR')
    version.set('affected_relations', JSON.stringify([]))
    version.set('published_at', new Date().toISOString())
    $app.save(version)

    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('action', 'publish')
    log.set('module', 'blueprint')
    log.set('target_collection', 'blueprint_chapters')
    log.set('target_id', record.id)
    log.set('target_summary', record.getString('title') || '')
    log.set('origem', 'Área da Empresa')
    log.set('criticidade', 'Média')
    $app.save(log)

    var notifCol = $app.findCollectionByNameOrId('notifications')
    var owner = record.getString('owner_funcional') || record.getString('author') || ''
    if (owner) {
      var notif = new Record(notifCol)
      notif.set('title', 'Capítulo publicado no Blueprint')
      notif.set('message', 'O capítulo "' + record.getString('title') + '" foi publicado.')
      notif.set('type', 'other')
      notif.set('read', false)
      $app.save(notif)
    }

    $app
      .logger()
      .info(
        'blueprint chapter published',
        'chapter',
        record.id,
        'version',
        record.getString('version_number'),
      )
  } catch (err) {
    $app.logger().error('blueprint publish failed', 'error', String(err))
  }

  return e.next()
}, 'blueprint_chapters')

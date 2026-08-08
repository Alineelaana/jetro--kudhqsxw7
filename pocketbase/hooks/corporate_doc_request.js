routerAdd(
  'POST',
  '/backend/v1/corporate-doc/request',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')

    var userName = ''
    var userRole = ''
    var userEmpresa = ''
    var userFilial = ''
    try {
      userName = e.auth.getString('name') || e.auth.email || ''
      userRole = e.auth.getString('role') || ''
      userEmpresa = e.auth.getString('empresa_id') || ''
      userFilial = e.auth.getString('filial_id') || ''
    } catch (_) {}

    var col = $app.findCollectionByNameOrId('document_generations')
    var record = new Record(col)
    record.set('document_type', body.documentType || 'report')
    record.set('module', body.module || 'unknown')
    record.set('title', body.title || 'Untitled')
    record.set('format', body.format || 'pdf')
    record.set('data_source', body.dataSource || '')
    record.set('applied_filters', body.filters || {})
    record.set('record_count', body.recordCount || 0)
    record.set('status', 'processing')
    record.set('empresa', body.empresa || userEmpresa)
    record.set('filial', body.filial || userFilial)
    record.set('requesting_user', userId)
    record.set('requesting_user_name', userName)
    record.set('requested_at', new Date().toISOString())
    record.set('request_origin', body.requestOrigin || 'frontend')
    record.set('document_version', '1.0')
    $app.save(record)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', userId)
      log.set('user_name', userName)
      log.set('user_role', userRole)
      log.set('action', 'document_export')
      log.set('module', body.module || 'unknown')
      log.set('target_collection', 'document_generations')
      log.set('target_id', record.id)
      log.set('target_summary', body.title || 'Untitled')
      log.set('new_value', {
        format: body.format,
        documentType: body.documentType,
        recordCount: body.recordCount,
      })
      log.set('ip_address', e.request.remoteAddr || '')
      log.set('origem', 'Área da Empresa')
      log.set('criticidade', 'Baixa')
      log.set('empresa', body.empresa || userEmpresa)
      log.set('filial', body.filial || userFilial)
      $app.save(log)
    } catch (err) {
      $app.logger().error('corporate doc audit failed', 'error', String(err))
    }

    return e.json(201, { jobId: record.id, status: 'processing' })
  },
  $apis.requireAuth(),
)

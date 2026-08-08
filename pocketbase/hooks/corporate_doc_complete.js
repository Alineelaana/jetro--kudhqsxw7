routerAdd(
  'POST',
  '/backend/v1/corporate-doc/complete',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')
    var jobId = body.jobId || ''
    if (!jobId) return e.badRequestError('jobId is required')

    var record = null
    try {
      record = $app.findRecordById('document_generations', jobId)
    } catch (_) {
      return e.notFoundError('generation job not found')
    }

    if (
      record.getString('requesting_user') !== userId &&
      (!e.auth || e.auth.getString('role') !== 'SUP')
    ) {
      return e.forbiddenError('not authorized to complete this job')
    }

    var status = body.status || 'completed'
    record.set('status', status)
    record.set('completed_at', new Date().toISOString())
    if (body.fileName) record.set('file_name', body.fileName)
    if (body.totalPages) record.set('total_pages', body.totalPages)
    if (body.checksum) record.set('checksum', body.checksum)
    if (body.generationTimeMs) record.set('generation_time_ms', body.generationTimeMs)
    $app.saveNoValidate(record)

    return e.json(200, { jobId: jobId, status: status })
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/corporate-doc/status',
  (e) => {
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')
    var query = e.requestInfo().query || {}
    var jobId = query.jobId || ''
    if (!jobId) return e.badRequestError('jobId is required')

    var record = null
    try {
      record = $app.findRecordById('document_generations', jobId)
    } catch (_) {
      return e.notFoundError('generation job not found')
    }

    var isSup = e.auth && e.auth.getString('role') === 'SUP'
    if (record.getString('requesting_user') !== userId && !isSup) {
      return e.forbiddenError('not authorized to view this job')
    }

    return e.json(200, {
      id: record.id,
      status: record.getString('status'),
      title: record.getString('title'),
      module: record.getString('module'),
      format: record.getString('format'),
      record_count: record.get('record_count') || 0,
      file_name: record.getString('file_name'),
      total_pages: record.get('total_pages') || 0,
      checksum: record.getString('checksum'),
      validation_link: record.getString('validation_link'),
      created: record.getString('created'),
      completed_at: record.getString('completed_at'),
      generation_time_ms: record.get('generation_time_ms') || 0,
    })
  },
  $apis.requireAuth(),
)

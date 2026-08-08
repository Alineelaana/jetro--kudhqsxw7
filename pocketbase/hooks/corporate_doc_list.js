routerAdd(
  'GET',
  '/backend/v1/corporate-doc',
  (e) => {
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')
    var isSup = e.auth && e.auth.getString('role') === 'SUP'

    var query = e.requestInfo().query || {}
    var page = parseInt(query.page || '1', 10) || 1
    var perPage = parseInt(query.perPage || '25', 10) || 25
    if (perPage > 100) perPage = 100

    var parts = []
    if (!isSup) parts.push('requesting_user = "' + userId + '"')
    if (query.module) parts.push('module = "' + query.module + '"')
    if (query.format) parts.push('format = "' + query.format + '"')
    if (query.status) parts.push('status = "' + query.status + '"')
    if (query.empresa) parts.push('empresa = "' + query.empresa + '"')
    if (query.filial) parts.push('filial = "' + query.filial + '"')
    var filterStr = parts.length > 0 ? parts.join(' && ') : ''

    var result = $app.findRecordsByFilter(
      'document_generations',
      filterStr || '',
      '-created',
      perPage,
      (page - 1) * perPage,
    )

    var items = []
    for (var i = 0; i < result.length; i++) {
      var r = result[i]
      items.push({
        id: r.id,
        document_type: r.getString('document_type'),
        module: r.getString('module'),
        title: r.getString('title'),
        format: r.getString('format'),
        status: r.getString('status'),
        record_count: r.get('record_count') || 0,
        empresa: r.getString('empresa'),
        filial: r.getString('filial'),
        requesting_user_name: r.getString('requesting_user_name'),
        created: r.getString('created'),
        completed_at: r.getString('completed_at'),
        generation_time_ms: r.get('generation_time_ms') || 0,
        file_name: r.getString('file_name'),
      })
    }

    return e.json(200, { items: items, page: page, perPage: perPage })
  },
  $apis.requireAuth(),
)

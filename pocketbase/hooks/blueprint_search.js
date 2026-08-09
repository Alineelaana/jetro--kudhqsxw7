routerAdd(
  'POST',
  '/backend/v1/blueprint/search',
  (e) => {
    var body = e.requestInfo().body || {}
    var query = (body.query || '').trim()
    if (!query) return e.badRequestError('query is required')

    var k = 10
    if (body.k) {
      var kRaw = parseInt(body.k, 10)
      if (kRaw > 0 && kRaw <= 50) k = kRaw
    }

    try {
      var embedRes = $ai.embed({ input: query })
      var results = $vectors.search(e, 'blueprint_chunks', {
        field: 'embedding',
        query: embedRes.data[0].embedding,
        k: k,
        expand: ['chapter_id'],
      })
      return e.json(200, results)
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'AI temporarily unavailable' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'AI temporarily unavailable' })
      }
      $app.logger().error('blueprint search failed', 'error', String(err))
      return e.json(500, { error: 'search failed' })
    }
  },
  $apis.requireAuth(),
)

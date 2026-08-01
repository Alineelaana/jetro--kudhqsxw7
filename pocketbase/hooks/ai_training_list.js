routerAdd(
  'GET',
  '/backend/v1/ai-training',
  (e) => {
    try {
      var records = $app.findRecordsByFilter('ai_training', "id != ''", '-created', 200, 0)
      var result = records.map(function (r) {
        return {
          id: r.id,
          title: r.getString('title'),
          content: r.getString('content'),
          type: r.getString('type'),
          created: r.getString('created'),
          updated: r.getString('updated'),
        }
      })
      return e.json(200, result)
    } catch (err) {
      return e.json(200, [])
    }
  },
  $apis.requireAuth(),
)

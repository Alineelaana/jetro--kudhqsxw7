migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('partners')
    col.createRule = ''
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('partners')
    col.createRule = '@request.auth.role != ""'
    app.save(col)
  },
)

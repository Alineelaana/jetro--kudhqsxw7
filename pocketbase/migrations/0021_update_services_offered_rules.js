migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('services_offered')
    col.listRule = ''
    col.viewRule = ''
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('services_offered')
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    app.save(col)
  },
)

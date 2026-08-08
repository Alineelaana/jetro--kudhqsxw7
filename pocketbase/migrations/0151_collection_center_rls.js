migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('financial_collections')
    col.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || empresa = @request.auth.empresa_id || filial = @request.auth.filial_id || empresa = '')"
    col.viewRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || empresa = @request.auth.empresa_id || filial = @request.auth.filial_id || empresa = '')"
    col.createRule = "@request.auth.id != ''"
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != '' && @request.auth.role = 'SUP'"
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('financial_collections')
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    app.save(col)
  },
)

migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('performance_alerts')
    var authorizedRule =
      "@request.auth.role = 'SUP' || @request.auth.role = 'FINANCEIRO' || @request.auth.role = 'COMERCIAL'"
    col.createRule = authorizedRule
    col.updateRule = authorizedRule
    col.deleteRule = "@request.auth.role = 'SUP'"
    app.save(col)
    console.log(
      '0148: performance_alerts RBAC tightened — update/create restricted to SUP, FINANCEIRO, COMERCIAL',
    )
  },
  (app) => {
    var col = app.findCollectionByNameOrId('performance_alerts')
    col.createRule = "@request.auth.role = 'SUP'"
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.role = 'SUP'"
    app.save(col)
  },
)

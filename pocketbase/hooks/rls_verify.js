routerAdd(
  'GET',
  '/backend/v1/rls/verify',
  (e) => {
    var rows = $app.db().newQuery('SELECT name FROM _collections').all()
    var results = []
    var totalCollections = 0
    var completeCollections = 0

    for (var i = 0; i < rows.length; i++) {
      var name = rows[i].name
      try {
        var col = $app.findCollectionByNameOrId(name)
        var nullRules = []

        if (col.listRule === null) nullRules.push('list')
        if (col.viewRule === null) nullRules.push('view')
        if (col.createRule === null) nullRules.push('create')
        if (col.updateRule === null) nullRules.push('update')
        if (col.deleteRule === null) nullRules.push('delete')

        totalCollections++
        if (nullRules.length === 0) completeCollections++

        results.push({
          name: name,
          type: col.type,
          listRule: col.listRule,
          viewRule: col.viewRule,
          createRule: col.createRule,
          updateRule: col.updateRule,
          deleteRule: col.deleteRule,
          nullRules: nullRules,
          complete: nullRules.length === 0,
        })
      } catch (err) {}
    }

    return e.json(200, {
      totalCollections: totalCollections,
      completeCollections: completeCollections,
      incompleteCollections: totalCollections - completeCollections,
      results: results,
    })
  },
  $apis.requireSuperuserAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/schema/verify-autodate',
  (e) => {
    var result = {
      checked: 0,
      withBoth: 0,
      missingCreated: [],
      missingUpdated: [],
      missingBoth: [],
      details: [],
    }

    var names = []
    try {
      var rows = $app.db().newQuery('SELECT name, type FROM _collections').all()
      for (var i = 0; i < rows.length; i++) {
        var n = '' + rows[i]['name']
        var t = '' + rows[i]['type']
        if (n && n.charAt(0) !== '_' && t === 'base') {
          names.push(n)
        }
      }
    } catch (sqlErr) {
      return e.json(500, { error: 'SQL query failed: ' + String(sqlErr) })
    }

    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      try {
        var col = $app.findCollectionByNameOrId(name)
        if (col.type !== 'base') continue

        result.checked++

        var createdField = col.fields.getByName('created')
        var updatedField = col.fields.getByName('updated')

        var createdOk = false
        var updatedOk = false

        if (createdField) {
          var cType = '' + createdField.getType()
          if (cType === 'autodate') {
            createdOk = true
          }
        }
        if (updatedField) {
          var uType = '' + updatedField.getType()
          if (uType === 'autodate') {
            updatedOk = true
          }
        }

        var status = 'ok'
        if (!createdOk && !updatedOk) {
          status = 'missing_both'
          result.missingBoth.push(name)
        } else if (!createdOk) {
          status = 'missing_created'
          result.missingCreated.push(name)
        } else if (!updatedOk) {
          status = 'missing_updated'
          result.missingUpdated.push(name)
        } else {
          result.withBoth++
        }

        result.details.push({
          collection: name,
          created: createdOk,
          updated: updatedOk,
          status: status,
        })
      } catch (err) {
        result.details.push({
          collection: name,
          created: false,
          updated: false,
          status: 'error: ' + String(err),
        })
      }
    }

    result.allValid =
      result.missingCreated.length === 0 &&
      result.missingUpdated.length === 0 &&
      result.missingBoth.length === 0

    return e.json(200, result)
  },
  $apis.requireAuth(),
)

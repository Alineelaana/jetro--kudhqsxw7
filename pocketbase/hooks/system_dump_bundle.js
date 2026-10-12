routerAdd('GET', '/backend/v1/system/export-dump-bundle', (e) => {
  try {
    var reqInfo = e.requestInfo() || {}
    var query = reqInfo.query || {}
    var colsParam = query.cols || '' // lista de coleções separadas por vírgula

    var SENSITIVE_FIELDS = {
      password: true,
      passwordHash: true,
      tokenKey: true,
      mfa_secret: true,
      api_key: true,
      api_secret: true,
    }

    if (colsParam) {
      var names = colsParam.split(',')
      var result = {}
      for (var i = 0; i < names.length; i++) {
        var targetCol = names[i].trim()
        if (!targetCol) continue

        try {
          var colObj = $app.findCollectionByNameOrId(targetCol)
          var fields = colObj.fields || []
          var fieldNames = []
          for (var f = 0; f < fields.length; f++) {
            var fn = fields[f].name
            if (fn && !SENSITIVE_FIELDS[fn]) {
              fieldNames.push(fn)
            }
          }

          var records = $app.findRecordsByFilter(targetCol, "id != ''", '', 100000, 0)
          var colRecords = []
          for (var r = 0; r < records.length; r++) {
            var rec = records[r]
            var recData = { id: rec.id }
            for (var fnIdx = 0; fnIdx < fieldNames.length; fnIdx++) {
              var fieldName = fieldNames[fnIdx]
              try {
                var val = rec.get(fieldName)
                if (val !== null && val !== undefined) {
                  recData[fieldName] = val
                }
              } catch (_) {}
            }
            try {
              if (rec.created) recData.created = rec.created
            } catch (_) {}
            try {
              if (rec.updated) recData.updated = rec.updated
            } catch (_) {}
            colRecords.push(recData)
          }

          result[targetCol] = colRecords
        } catch (colErr) {
          result[targetCol] = []
        }
      }

      return e.json(200, {
        count: Object.keys(result).length,
        collections: result,
      })
    }

    // Sem colsParam: retorna lista de coleções ativas e vazias
    var allCols = $app.findAllCollections()
    var activeCols = []
    var emptyCols = []

    for (var j = 0; j < allCols.length; j++) {
      var c = allCols[j]
      var name = c.name
      if (!name || name.charAt(0) === '_') continue
      var count = 0
      try {
        var recs = $app.findRecordsByFilter(name, "id != ''", '', 100000, 0)
        count = recs.length
      } catch (_) {}

      if (count > 0) {
        activeCols.push({ name: name, count: count, type: c.type })
      } else {
        emptyCols.push({ name: name, count: 0, type: c.type })
      }
    }

    return e.json(200, {
      total_collections: activeCols.length + emptyCols.length,
      active_count: activeCols.length,
      empty_count: emptyCols.length,
      active_collections: activeCols,
      empty_collections: emptyCols,
    })
  } catch (err) {
    return e.json(500, { error: String(err) })
  }
})

routerAdd('GET', '/backend/v1/system/export-snapshot-jetro', (e) => {
  try {
    var reqInfo = e.requestInfo() || {}
    var query = reqInfo.query || {}
    var colNameParam = query.collection || ''

    var SENSITIVE_FIELDS = {
      password: true,
      passwordHash: true,
      tokenKey: true,
      mfa_secret: true,
      api_key: true,
      api_secret: true,
    }

    if (colNameParam) {
      var col = $app.findCollectionByNameOrId(colNameParam)
      var fields = col.fields || []
      var fieldNames = []
      for (var f = 0; f < fields.length; f++) {
        var fn = fields[f].name
        if (fn && !SENSITIVE_FIELDS[fn]) {
          fieldNames.push(fn)
        }
      }

      var records = $app.findRecordsByFilter(colNameParam, "id != ''", '', 100000, 0)
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

      return e.json(200, {
        collection: colNameParam,
        count: colRecords.length,
        records: colRecords,
      })
    }

    var allCols = $app.findAllCollections()
    var catalog = []
    for (var i = 0; i < allCols.length; i++) {
      var c = allCols[i]
      var name = c.name
      if (!name || name.charAt(0) === '_') continue
      var count = 0
      try {
        var recs = $app.findRecordsByFilter(name, "id != ''", '', 100000, 0)
        count = recs.length
      } catch (_) {}
      catalog.push({ name: name, count: count, type: c.type })
    }

    return e.json(200, {
      exported_at: new Date().toISOString(),
      total_collections: catalog.length,
      catalog: catalog,
    })
  } catch (err) {
    return e.json(500, { error: String(err) })
  }
})

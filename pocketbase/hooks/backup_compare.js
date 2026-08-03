routerAdd(
  'POST',
  '/backend/v1/backup/compare',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    var body = e.requestInfo().body || {}
    var idA = body.backup_a
    var idB = body.backup_b
    if (!idA || !idB) return e.badRequestError('Two backup IDs are required')
    if (idA === idB) return e.badRequestError('Cannot compare a backup with itself')

    var recA = $app.findRecordById('backups', idA)
    var recB = $app.findRecordById('backups', idB)

    function parseCollections(rec) {
      var dataStr = rec.getString('backup_data')
      if (!dataStr) return {}
      try {
        var parsed = JSON.parse(dataStr)
        return parsed.collections || {}
      } catch (_) {
        return {}
      }
    }

    var colsA = parseCollections(recA)
    var colsB = parseCollections(recB)

    var allColNames = {}
    for (var k in colsA) allColNames[k] = true
    for (var k in colsB) allColNames[k] = true

    var result = {
      backup_a: {
        id: idA,
        name: recA.getString('version_name'),
        created: recA.getString('created'),
      },
      backup_b: {
        id: idB,
        name: recB.getString('version_name'),
        created: recB.getString('created'),
      },
      collections: [],
    }

    for (var colName in allColNames) {
      var recordsA = (colsA[colName] || []).slice()
      var recordsB = (colsB[colName] || []).slice()

      var mapA = {}
      var mapB = {}
      for (var i = 0; i < recordsA.length; i++) {
        if (recordsA[i].id) mapA[recordsA[i].id] = recordsA[i]
      }
      for (var j = 0; j < recordsB.length; j++) {
        if (recordsB[j].id) mapB[recordsB[j].id] = recordsB[j]
      }

      var added = []
      var removed = []
      var changed = []

      for (var rid in mapB) {
        if (!mapA[rid]) {
          added.push({ id: rid, data: mapB[rid] })
        } else if (JSON.stringify(mapA[rid]) !== JSON.stringify(mapB[rid])) {
          changed.push({ id: rid, before: mapA[rid], after: mapB[rid] })
        }
      }
      for (var rid2 in mapA) {
        if (!mapB[rid2]) {
          removed.push({ id: rid2, data: mapA[rid2] })
        }
      }

      if (added.length > 0 || removed.length > 0 || changed.length > 0) {
        result.collections.push({
          name: colName,
          added: added,
          removed: removed,
          changed: changed,
          summary: {
            added: added.length,
            removed: removed.length,
            changed: changed.length,
            total_a: recordsA.length,
            total_b: recordsB.length,
          },
        })
      }
    }

    return e.json(200, result)
  },
  $apis.requireAuth(),
)

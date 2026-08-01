routerAdd(
  'GET',
  '/backend/v1/backup/list',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    var records = $app.findRecordsByFilter('backups', "id != ''", '-created', 1000, 0)
    var result = []
    for (var i = 0; i < records.length; i++) {
      var rec = records[i]
      result.push({
        id: rec.id,
        version_name: rec.getString('version_name'),
        backup_type: rec.getString('backup_type'),
        file: rec.getString('file'),
        file_size: rec.get('file_size') || 0,
        observations: rec.getString('observations'),
        status: rec.getString('status'),
        created_by_name: rec.getString('created_by_name'),
        created_by_role: rec.getString('created_by_role'),
        auto_generated: rec.get('auto_generated') || false,
        created: rec.getString('created'),
      })
    }
    return e.json(200, { items: result })
  },
  $apis.requireAuth(),
)

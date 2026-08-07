migrate(
  (app) => {
    var publicRead = [
      'settings',
      'budget_form_fields',
      'services_offered',
      'service_areas',
      'cms_content',
      'cms_publication',
      'vitrine_items',
    ]
    var publicCreate = [
      'budget_requests',
      'chat_conversations',
      'chat_messages',
      'chat_ratings',
      'clients',
    ]

    var rows = app.db().newQuery('SELECT name FROM _collections').all()
    var fixed = 0
    var checked = 0

    for (var i = 0; i < rows.length; i++) {
      var name = rows[i].name
      try {
        var col = app.findCollectionByNameOrId(name)
        var modified = false

        var isPubRead = publicRead.indexOf(name) !== -1
        var isPubCreate = publicCreate.indexOf(name) !== -1

        if (col.listRule === null) {
          col.listRule = isPubRead ? '' : "@request.auth.id != ''"
          modified = true
        }
        if (col.viewRule === null) {
          col.viewRule = isPubRead ? '' : "@request.auth.id != ''"
          modified = true
        }
        if (col.createRule === null) {
          col.createRule = isPubCreate ? '' : "@request.auth.id != ''"
          modified = true
        }
        if (col.updateRule === null) {
          col.updateRule = "@request.auth.id != ''"
          modified = true
        }
        if (col.deleteRule === null) {
          col.deleteRule = "@request.auth.role = 'SUP'"
          modified = true
        }

        if (modified) {
          app.save(col)
          fixed++
        }
        checked++
      } catch (e) {}
    }

    console.log('BEP-001 RLS: checked ' + checked + ' collections, fixed ' + fixed)
  },
  (app) => {
    // Down: Cannot practically revert — rules were null (superuser-only)
    // before and we don't track which were null vs already set per collection.
    // Reverting would require restoring the exact pre-migration null state.
  },
)

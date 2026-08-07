migrate(
  (app) => {
    var names = []
    try {
      var rows = app.db().newQuery('SELECT name FROM _collections').all()
      for (var i = 0; i < rows.length; i++) {
        var n = '' + rows[i]['name']
        if (n && n.charAt(0) !== '_') names.push(n)
      }
    } catch (sqlErr) {
      console.log('BEP-002: SQL query failed: ' + String(sqlErr))
      return
    }

    var checked = 0
    var fixed = 0
    var alreadyHas = 0
    var skippedAuth = 0
    var skippedView = 0
    var details = []

    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      try {
        var col = app.findCollectionByNameOrId(name)

        if (col.type === 'auth') {
          skippedAuth++
          continue
        }
        if (col.type === 'view') {
          skippedView++
          continue
        }

        checked++

        var hasCreated = !!col.fields.getByName('created')
        var hasUpdated = !!col.fields.getByName('updated')
        var modified = false

        if (!hasCreated) {
          col.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }))
          modified = true
        }
        if (!hasUpdated) {
          col.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }))
          modified = true
        }

        if (modified) {
          app.save(col)
          fixed++
          var added = []
          if (!hasCreated) added.push('created')
          if (!hasUpdated) added.push('updated')
          details.push(name + ': added ' + added.join(', '))
        } else {
          alreadyHas++
        }
      } catch (e) {
        console.log('BEP-002: skipping ' + name + ': ' + String(e))
      }
    }

    console.log(
      'BEP-002: checked=' +
        checked +
        ' fixed=' +
        fixed +
        ' alreadyHas=' +
        alreadyHas +
        ' skippedAuth=' +
        skippedAuth +
        ' skippedView=' +
        skippedView,
    )
    for (var d = 0; d < details.length; d++) {
      console.log('BEP-002: ' + details[d])
    }
  },
  (app) => {
    var names = []
    try {
      var rows = app.db().newQuery('SELECT name FROM _collections').all()
      for (var i = 0; i < rows.length; i++) {
        var n = '' + rows[i]['name']
        if (n && n.charAt(0) !== '_') names.push(n)
      }
    } catch (_) {
      return
    }

    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      try {
        var col = app.findCollectionByNameOrId(name)
        if (col.type !== 'base') continue

        var createdField = col.fields.getByName('created')
        if (createdField) {
          col.fields.remove(createdField)
        }
        var updatedField = col.fields.getByName('updated')
        if (updatedField) {
          col.fields.remove(updatedField)
        }
        app.save(col)
      } catch (_) {}
    }
  },
)

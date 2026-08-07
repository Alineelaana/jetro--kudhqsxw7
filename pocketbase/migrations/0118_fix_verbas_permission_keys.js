migrate(
  (app) => {
    try {
      var params = app.findRecordsByFilter(
        'system_parameters',
        "key ~ 'module.supplier_allowance.'",
        '',
        100,
        0,
      )
      for (var i = 0; i < params.length; i++) {
        var p = params[i]
        var oldKey = p.getString('key')
        var newKey = oldKey.replace('module.supplier_allowance.', 'module.supplier_allowances.')
        p.set('key', newKey)
        app.save(p)
      }
    } catch (_) {}

    try {
      var profiles = app.findRecordsByFilter('perfis_permissoes', 'active = true', '', 100, 0)
      for (var i = 0; i < profiles.length; i++) {
        var profile = profiles[i]
        var perms = profile.get('permissions')
        if (!perms) continue
        if (typeof perms === 'string') {
          try {
            perms = JSON.parse(perms)
          } catch (_) {
            continue
          }
        }
        if (typeof perms !== 'object') continue

        var updated = {}
        var changed = false
        for (var k in perms) {
          if (k.indexOf('supplier_allowance.') === 0) {
            var newK = 'supplier_allowances.' + k.substring('supplier_allowance.'.length)
            updated[newK] = perms[k]
            changed = true
          } else {
            updated[k] = perms[k]
          }
        }
        if (changed) {
          profile.set('permissions', updated)
          app.save(profile)
        }
      }
    } catch (_) {}

    console.log('0118: Fixed permission keys from supplier_allowance to supplier_allowances')
  },
  (app) => {
    try {
      var params = app.findRecordsByFilter(
        'system_parameters',
        "key ~ 'module.supplier_allowances.'",
        '',
        100,
        0,
      )
      for (var i = 0; i < params.length; i++) {
        var p = params[i]
        var oldKey = p.getString('key')
        var newKey = oldKey.replace('module.supplier_allowances.', 'module.supplier_allowance.')
        p.set('key', newKey)
        app.save(p)
      }
    } catch (_) {}

    try {
      var profiles = app.findRecordsByFilter('perfis_permissoes', 'active = true', '', 100, 0)
      for (var i = 0; i < profiles.length; i++) {
        var profile = profiles[i]
        var perms = profile.get('permissions')
        if (!perms || typeof perms !== 'object') continue
        if (typeof perms === 'string') {
          try {
            perms = JSON.parse(perms)
          } catch (_) {
            continue
          }
        }
        var updated = {}
        var changed = false
        for (var k in perms) {
          if (k.indexOf('supplier_allowances.') === 0) {
            var newK = 'supplier_allowance.' + k.substring('supplier_allowances.'.length)
            updated[newK] = perms[k]
            changed = true
          } else {
            updated[k] = perms[k]
          }
        }
        if (changed) {
          profile.set('permissions', updated)
          app.save(profile)
        }
      }
    } catch (_) {}
  },
)

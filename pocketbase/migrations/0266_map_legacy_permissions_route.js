migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter('perfis_permissoes', 'id != ""', '', 0, 0)
      for (var i = 0; i < records.length; i++) {
        var record = records[i]
        var perms = record.get('permissions') || {}
        if (typeof perms === 'string') {
          try {
            perms = JSON.parse(perms)
          } catch (e) {
            perms = {}
          }
        }
        var changed = false

        // Se tiver allowedMenus, mapeia a rota legada para a rota consolidada
        if (Array.isArray(perms.allowedMenus)) {
          var hasLegacy = perms.allowedMenus.indexOf('/admin/configuracoes/permissoes') !== -1
          var hasConsolidated =
            perms.allowedMenus.indexOf('/admin/cadastros/perfis-permissoes') !== -1
          if (hasLegacy && !hasConsolidated) {
            perms.allowedMenus.push('/admin/cadastros/perfis-permissoes')
            changed = true
          }
        }

        // Se tiver screens pontuais configuradas
        if (perms.screens && typeof perms.screens === 'object') {
          var legScreen = perms.screens['/admin/configuracoes/permissoes']
          if (legScreen && !perms.screens['/admin/cadastros/perfis-permissoes']) {
            perms.screens['/admin/cadastros/perfis-permissoes'] = {
              v: !!legScreen.v,
              c: !!legScreen.c,
              e: !!legScreen.e,
              d: !!legScreen.d,
            }
            changed = true
          }
        }

        if (changed) {
          record.set('permissions', perms)
          app.save(record)
        }
      }
    } catch (err) {
      console.log('Migration 0266 notice:', err)
    }
  },
  (app) => {
    // Reversão no-op para preservar permissões concedidas
  },
)

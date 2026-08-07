migrate(
  (app) => {
    var VERBAS_KEY = 'supplier_allowance'

    var SUP_PERMS = {
      'supplier_allowance.view': true,
      'supplier_allowance.create': true,
      'supplier_allowance.edit': true,
      'supplier_allowance.delete': true,
      'supplier_allowance.approve': true,
      'supplier_allowance.settle': true,
      'supplier_allowance.export': true,
      'supplier_allowance.admin': true,
      'supplier_allowance.config': true,
    }

    var FIN_PERMS = {
      'supplier_allowance.view': true,
      'supplier_allowance.approve': true,
      'supplier_allowance.settle': true,
      'supplier_allowance.export': true,
    }

    var COM_PERMS = {
      'supplier_allowance.view': true,
      'supplier_allowance.create': true,
      'supplier_allowance.edit': true,
      'supplier_allowance.export': true,
    }

    var VIEW_ONLY = {
      'supplier_allowance.view': true,
    }

    var VERBAS_SCREENS = [
      { key: 'cockpit', label: 'Cockpit', actions: ['view'] },
      { key: 'acordos', label: 'Acordos', actions: ['view', 'create', 'edit', 'delete', 'admin'] },
      { key: 'conta-corrente', label: 'Conta Corrente', actions: ['view', 'export'] },
      { key: 'movimentacoes', label: 'Movimentacoes', actions: ['view', 'create', 'export'] },
      { key: 'apuracoes', label: 'Apuracoes', actions: ['view', 'approve', 'export'] },
      { key: 'apropriacoes', label: 'Apropriacoes', actions: ['view', 'create', 'export'] },
      { key: 'consumos', label: 'Consumos', actions: ['view', 'create', 'export'] },
      {
        key: 'liquidacoes',
        label: 'Liquidacoes',
        actions: ['view', 'settle', 'approve', 'export'],
      },
      { key: 'relatorios', label: 'Relatorios', actions: ['view', 'export'] },
      { key: 'configuracoes', label: 'Configuracoes', actions: ['view', 'config'] },
    ]

    try {
      var spCol = app.findCollectionByNameOrId('system_parameters')

      var spExists = false
      try {
        app.findFirstRecordByData('system_parameters', 'key', 'module.' + VERBAS_KEY + '.enabled')
        spExists = true
      } catch (_) {}

      if (!spExists) {
        var sp = new Record(spCol)
        sp.set('module', VERBAS_KEY)
        sp.set('key', 'module.' + VERBAS_KEY + '.enabled')
        sp.set('label', 'Modulo Verbas de Fornecedores')
        sp.set('value', 'true')
        sp.set('value_type', 'boolean')
        sp.set('active', true)
        app.save(sp)
      }

      var screensExists = false
      try {
        app.findFirstRecordByData('system_parameters', 'key', 'module.' + VERBAS_KEY + '.screens')
        screensExists = true
      } catch (_) {}

      if (!screensExists) {
        var spScreens = new Record(spCol)
        spScreens.set('module', VERBAS_KEY)
        spScreens.set('key', 'module.' + VERBAS_KEY + '.screens')
        spScreens.set('label', 'Telas do Modulo Verbas de Fornecedores')
        spScreens.set('value', JSON.stringify(VERBAS_SCREENS))
        spScreens.set('value_type', 'json')
        spScreens.set('active', true)
        app.save(spScreens)
      }
    } catch (_) {}

    var profilesUpdated = 0
    try {
      var profiles = app.findRecordsByFilter('perfis_permissoes', 'active = true', '', 0, 0)
      for (var i = 0; i < profiles.length; i++) {
        var profile = profiles[i]
        var perms = profile.get('permissions')
        if (!perms) {
          perms = {}
        }
        if (typeof perms === 'string') {
          try {
            perms = JSON.parse(perms)
          } catch (_) {
            perms = {}
          }
        }
        if (typeof perms !== 'object') {
          perms = {}
        }

        var name = (profile.getString('name') || '').toLowerCase()
        var code = (profile.getString('code') || '').toLowerCase()

        var toMerge = VIEW_ONLY
        if (
          name.indexOf('sup') >= 0 ||
          code.indexOf('sup') >= 0 ||
          name.indexOf('admin') >= 0 ||
          code.indexOf('admin') >= 0
        ) {
          toMerge = SUP_PERMS
        } else if (name.indexOf('financ') >= 0 || code.indexOf('fin') >= 0) {
          toMerge = FIN_PERMS
        } else if (name.indexOf('comerc') >= 0 || code.indexOf('com') >= 0) {
          toMerge = COM_PERMS
        }

        var merged = {}
        var k
        for (k in perms) {
          merged[k] = perms[k]
        }
        for (k in toMerge) {
          merged[k] = toMerge[k]
        }

        profile.set('permissions', merged)
        app.save(profile)
        profilesUpdated++
      }
    } catch (_) {}

    if (profilesUpdated === 0) {
      try {
        var ppCol = app.findCollectionByNameOrId('perfis_permissoes')

        var supExists = false
        try {
          app.findFirstRecordByData('perfis_permissoes', 'code', 'SUP')
          supExists = true
        } catch (_) {}

        if (!supExists) {
          var supProfile = new Record(ppCol)
          supProfile.set('code', 'SUP')
          supProfile.set('name', 'Superusuario')
          supProfile.set('description', 'Perfil de superusuario com acesso total')
          supProfile.set('permissions', SUP_PERMS)
          supProfile.set('active', true)
          app.save(supProfile)
        }

        var finExists = false
        try {
          app.findFirstRecordByData('perfis_permissoes', 'code', 'FINANCEIRO')
          finExists = true
        } catch (_) {}

        if (!finExists) {
          var finProfile = new Record(ppCol)
          finProfile.set('code', 'FINANCEIRO')
          finProfile.set('name', 'Financeiro')
          finProfile.set('description', 'Perfil do setor financeiro')
          finProfile.set('permissions', FIN_PERMS)
          finProfile.set('active', true)
          app.save(finProfile)
        }

        var comExists = false
        try {
          app.findFirstRecordByData('perfis_permissoes', 'code', 'COMERCIAL')
          comExists = true
        } catch (_) {}

        if (!comExists) {
          var comProfile = new Record(ppCol)
          comProfile.set('code', 'COMERCIAL')
          comProfile.set('name', 'Comercial')
          comProfile.set('description', 'Perfil do setor comercial')
          comProfile.set('permissions', COM_PERMS)
          comProfile.set('active', true)
          app.save(comProfile)
        }

        var padraoExists = false
        try {
          app.findFirstRecordByData('perfis_permissoes', 'code', 'PADRAO')
          padraoExists = true
        } catch (_) {}

        if (!padraoExists) {
          var padraoProfile = new Record(ppCol)
          padraoProfile.set('code', 'PADRAO')
          padraoProfile.set('name', 'Padrao')
          padraoProfile.set('description', 'Perfil padrao com acesso basico')
          padraoProfile.set('permissions', VIEW_ONLY)
          padraoProfile.set('active', true)
          app.save(padraoProfile)
        }
      } catch (_) {}
    }
  },
  (app) => {
    try {
      var profiles = app.findRecordsByFilter('perfis_permissoes', 'active = true', '', 0, 0)
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
        var cleaned = {}
        var k
        for (k in perms) {
          if (k.indexOf('supplier_allowance.') !== 0) {
            cleaned[k] = perms[k]
          }
        }
        profile.set('permissions', cleaned)
        app.save(profile)
      }
    } catch (_) {}

    try {
      var sp = app.findFirstRecordByData(
        'system_parameters',
        'key',
        'module.supplier_allowance.enabled',
      )
      app.delete(sp)
    } catch (_) {}

    try {
      var sp2 = app.findFirstRecordByData(
        'system_parameters',
        'key',
        'module.supplier_allowance.screens',
      )
      app.delete(sp2)
    } catch (_) {}
  },
)

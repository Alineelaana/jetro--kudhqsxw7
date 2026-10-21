migrate(
  (app) => {
    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var perfisCol = app.findCollectionByNameOrId('perfis_permissoes')

      // 1. Garantir campo 'login' em users
      if (!usersCol.fields.getByName('login')) {
        usersCol.fields.add(
          new TextField({
            name: 'login',
            required: false,
          }),
        )
        app.save(usersCol)
      }

      // 2. Garantir que o perfil 'RH / DP' em perfis_permissoes tem os menus e permissões corretos
      var rhDpRecords = app.findRecordsByFilter(
        'perfis_permissoes',
        'code = "RH / DP" || name = "RH / DP"',
        '',
        1,
        0,
      )

      var rhMenus = [
        '/admin',
        '/admin/rh',
        '/admin/rh/dashboard',
        '/admin/rh/colaboradores',
        '/admin/rh/cargos',
        '/admin/rh/departamentos',
        '/admin/rh/organograma',
        '/admin/rh/folha',
        '/admin/rh/beneficios',
        '/admin/rh/ferias',
        '/admin/rh/ponto',
        '/admin/rh/banco-horas',
        '/admin/rh/esocial',
        '/admin/rh/avaliacoes',
        '/admin/rh/treinamentos',
        '/admin/rh/recrutamento',
        '/admin/rh/clima',
        '/admin/rh/seguranca-trabalho',
        '/admin/rh/relatorios',
        '/admin/rh/politicas',
        '/admin/dp',
        '/admin/dp/dashboard',
        '/admin/dp/folha',
        '/admin/dp/banco-horas',
        '/admin/dp/horas-extras',
        '/admin/dp/esocial',
        '/admin/dp/fgts',
        '/admin/dp/rescisao',
        '/admin/dp/reintegracao',
        '/admin/dp/encargos',
        '/admin/dp/relatorios',
        '/admin/dp/convenios',
        '/admin/chamados',
        '/admin/chamados/meus',
        '/admin/chamados/novo',
        '/admin/agenda',
      ]

      var rhScreens = {}
      for (var m = 0; m < rhMenus.length; m++) {
        rhScreens[rhMenus[m]] = { v: true, c: true, e: true, d: true }
      }

      var rhDpPerfil = null
      if (rhDpRecords.length > 0) {
        rhDpPerfil = rhDpRecords[0]
        var existingPerms = rhDpPerfil.get('permissions') || {}
        if (typeof existingPerms === 'string') {
          try {
            existingPerms = JSON.parse(existingPerms)
          } catch (_) {
            existingPerms = {}
          }
        }
        var existingAllowed = existingPerms.allowedMenus || []
        var mergedMap = {}
        for (var i = 0; i < existingAllowed.length; i++) {
          mergedMap[existingAllowed[i]] = true
        }
        for (var j = 0; j < rhMenus.length; j++) {
          mergedMap[rhMenus[j]] = true
        }
        var mergedAllowed = Object.keys(mergedMap)

        var existingScreens = existingPerms.screens || {}
        for (var k in rhScreens) {
          existingScreens[k] = rhScreens[k]
        }
        existingPerms.allowedMenus = mergedAllowed
        existingPerms.screens = existingScreens
        rhDpPerfil.set('permissions', existingPerms)
        app.save(rhDpPerfil)
      } else {
        var newPerfil = new Record(perfisCol)
        newPerfil.set('name', 'RH / DP')
        newPerfil.set('code', 'RH / DP')
        newPerfil.set('description', 'Área de trabalho do DP e RH')
        newPerfil.set('active', true)
        newPerfil.set('permissions', {
          allowedMenus: rhMenus,
          screens: rhScreens,
        })
        app.save(newPerfil)
        rhDpPerfil = newPerfil
      }

      // 3. Atualizar a usuária Patricia
      var patriciaRecords = app.findRecordsByFilter(
        'users',
        'email = "patricia.brum@deceldorado.com.br" || email ~ "patricia"',
        '',
        1,
        0,
      )
      if (patriciaRecords.length > 0) {
        var pat = patriciaRecords[0]
        pat.set('login', 'patricia')
        pat.set('username', 'patricia')
        if (rhDpPerfil) {
          pat.set('perfil_id', rhDpPerfil.id)
          pat.set('perfil_acesso', 'RH / DP')
        }
        app.save(pat)
      }

      // 4. Preencher login de usuários existentes que estão sem login
      var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
      for (var u = 0; u < allUsers.length; u++) {
        var userRec = allUsers[u]
        var currentLogin = userRec.get('login') || ''
        if (!currentLogin) {
          var email = (userRec.get('email') || '').toLowerCase()
          var username = (userRec.get('username') || '').toLowerCase()
          var generatedLogin = ''
          if (email === 'alineelaana@gmail.com') {
            generatedLogin = 'aline'
          } else if (username && username !== email) {
            generatedLogin = username
          } else if (email) {
            generatedLogin = email.split('@')[0].replace(/[^a-z0-9._-]/g, '')
          }
          if (generatedLogin) {
            userRec.set('login', generatedLogin)
            if (!userRec.get('username')) {
              userRec.set('username', generatedLogin)
            }
            app.save(userRec)
          }
        }
      }
    } catch (err) {
      console.log('Migration 0270 error/notice:', err)
    }
  },
  (app) => {},
)

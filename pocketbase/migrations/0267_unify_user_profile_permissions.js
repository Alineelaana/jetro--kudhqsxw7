migrate(
  (app) => {
    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var perfisCol = app.findCollectionByNameOrId('perfis_permissoes')

      // 1. Garantir que o campo perfil_id existe em users apontando para perfis_permissoes
      if (!usersCol.fields.getByName('perfil_id')) {
        usersCol.fields.add(
          new RelationField({
            name: 'perfil_id',
            collectionId: perfisCol.id,
            cascadeDelete: false,
            maxSelect: 1,
            required: false,
          }),
        )
        app.save(usersCol)
      }

      // 2. Mapear/backfill usuários existentes que não possuem perfil_acesso ou perfil_id
      var users = app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
      var perfis = app.findRecordsByFilter('perfis_permissoes', 'id != ""', '', 0, 0)

      for (var i = 0; i < users.length; i++) {
        var u = users[i]
        var currentPerfilAcesso = u.get('perfil_acesso') || ''
        var currentPerfilId = u.get('perfil_id') || ''
        var role = (u.get('role') || '').toUpperCase()
        var email = (u.get('email') || '').toLowerCase()
        var changed = false

        // Se email for o admin principal (alineelaana@gmail.com), perfil é sempre SUP
        if (email === 'alineelaana@gmail.com') {
          if (currentPerfilAcesso !== 'SUP') {
            u.set('perfil_acesso', 'SUP')
            changed = true
          }
          if (u.get('role') !== 'SUP') {
            u.set('role', 'SUP')
            changed = true
          }
        }

        var effectiveCode = (u.get('perfil_acesso') || role || 'PADRAO').toUpperCase()

        // Buscar perfil correspondente em perfis_permissoes
        var matchedPerfil = null
        for (var p = 0; p < perfis.length; p++) {
          var pRec = perfis[p]
          var pCode = (pRec.get('code') || '').toUpperCase()
          var pName = (pRec.get('name') || '').toUpperCase()
          if (pCode === effectiveCode || pName === effectiveCode || pRec.id === currentPerfilId) {
            matchedPerfil = pRec
            break
          }
        }

        // Se não achou e perfil é vazio ou PADRAO, tentar Gestão/PADRAO
        if (!matchedPerfil) {
          for (var p2 = 0; p2 < perfis.length; p2++) {
            if ((perfis[p2].get('code') || '').toUpperCase() === 'PADRAO') {
              matchedPerfil = perfis[p2]
              break
            }
          }
        }

        if (matchedPerfil) {
          if (!currentPerfilId || currentPerfilId !== matchedPerfil.id) {
            u.set('perfil_id', matchedPerfil.id)
            changed = true
          }
          var targetCode = matchedPerfil.get('code') || 'PADRAO'
          if (!currentPerfilAcesso || currentPerfilAcesso !== targetCode) {
            u.set('perfil_acesso', targetCode)
            changed = true
          }
        }

        if (changed) {
          app.save(u)
        }
      }
    } catch (err) {
      console.log('Migration 0267 error/notice:', err)
    }
  },
  (app) => {
    // Reversão no-op para preservar dados dos usuários
  },
)

migrate(
  (app) => {
    try {
      // 1. Localizar Empresa e Filial Matriz de Dec Eldorado
      var decEldorado = null
      try {
        var decRecords = app.findRecordsByFilter(
          'empresas',
          'id = "0jcxfj3r9a7gogd" || code = "DEC-ELDORADO" || name ~ "Dec Eldorado"',
          '',
          1,
          0,
        )
        if (decRecords && decRecords.length > 0) {
          decEldorado = decRecords[0]
        }
      } catch (errDec) {
        console.log('Erro ao localizar empresa Dec Eldorado:', errDec)
      }

      var filDecMatriz = null
      try {
        var filDecRecords = app.findRecordsByFilter(
          'filiais',
          'id = "51ma2zu30b85j2l" || code = "DEC-MATRIZ" || empresa_name = "Dec Eldorado"',
          '',
          1,
          0,
        )
        if (filDecRecords && filDecRecords.length > 0) {
          filDecMatriz = filDecRecords[0]
        }
      } catch (errFilDec) {
        console.log('Erro ao localizar filial Dec Eldorado:', errFilDec)
      }

      // 2. Localizar Empresa e Filial Matriz de Gran Romano
      var granRomano = null
      try {
        var grRecords = app.findRecordsByFilter(
          'empresas',
          'id = "t4wx2m5n5jucy9z" || code = "GRAN-ROMANO" || name ~ "Gran Romano"',
          '',
          1,
          0,
        )
        if (grRecords && grRecords.length > 0) {
          granRomano = grRecords[0]
        }
      } catch (errGr) {
        console.log('Erro ao localizar empresa Gran Romano:', errGr)
      }

      var filGrMatriz = null
      try {
        var filGrRecords = app.findRecordsByFilter(
          'filiais',
          'id = "fhy6eznfyr8krxq" || code = "GR-MATRIZ" || empresa_name = "Gran Romano"',
          '',
          1,
          0,
        )
        if (filGrRecords && filGrRecords.length > 0) {
          filGrMatriz = filGrRecords[0]
        }
      } catch (errFilGr) {
        console.log('Erro ao localizar filial Gran Romano:', errFilGr)
      }

      // Se não encontrar coleções ou empresas (cenário de banco limpo ou replicação inicial), encerra suavemente
      if (!decEldorado && !granRomano) {
        console.log(
          'Migração 0271: Empresas Dec Eldorado e Gran Romano não encontradas nesta instância.',
        )
        return
      }

      var decId = decEldorado ? decEldorado.id : '0jcxfj3r9a7gogd'
      var decFilialId = filDecMatriz ? filDecMatriz.id : '51ma2zu30b85j2l'

      var grId = granRomano ? granRomano.id : 't4wx2m5n5jucy9z'
      var grFilialId = filGrMatriz ? filGrMatriz.id : 'fhy6eznfyr8krxq'

      // 3. Processar todos os usuários existentes
      var users = app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
      for (var i = 0; i < users.length; i++) {
        var u = users[i]
        var email = (u.get('email') || '').toLowerCase().trim()
        var role = (u.get('role') || '').toUpperCase().trim()
        var perfilAcesso = (u.get('perfil_acesso') || '').toUpperCase().trim()

        // Regra de segurança estrita:
        // NUNCA alterar usuários SUP/administração global nem usuários sem um desses domínios específicos
        if (email === 'alineelaana@gmail.com' || role === 'SUP' || perfilAcesso === 'SUP') {
          continue
        }

        var isDecEldorado = email.indexOf('@deceldorado.com.br') !== -1
        var isGranRomano =
          email.indexOf('@granfoods.ind.br') !== -1 || email.indexOf('@granromano.com.br') !== -1

        var changed = false

        if (isDecEldorado) {
          // Usuários @deceldorado.com.br devem ter empresa_id e filial_id apontando para Dec Eldorado
          if (u.get('empresa_id') !== decId) {
            u.set('empresa_id', decId)
            changed = true
          }
          if (u.get('filial_id') !== decFilialId) {
            u.set('filial_id', decFilialId)
            changed = true
          }
        } else if (isGranRomano) {
          // Usuários @granfoods.ind.br ou @granromano.com.br devem ter empresa_id e filial_id apontando para Gran Romano
          if (u.get('empresa_id') !== grId) {
            u.set('empresa_id', grId)
            changed = true
          }
          if (u.get('filial_id') !== grFilialId) {
            u.set('filial_id', grFilialId)
            changed = true
          }
        }

        if (changed) {
          app.save(u)
          console.log(
            'Migração 0271: Usuário ' +
              email +
              ' atualizado com sucesso (empresa_id=' +
              u.get('empresa_id') +
              ', filial_id=' +
              u.get('filial_id') +
              ')',
          )
        }
      }
    } catch (err) {
      console.log('Erro na migração 0271_fix_user_company_branch_binding:', err)
      throw err
    }
  },
  (app) => {
    // Reversão no-op para segurança de dados
  },
)

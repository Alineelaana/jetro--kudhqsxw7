migrate(
  (app) => {
    try {
      var empCol = app.findCollectionByNameOrId('empresas')
      var filCol = app.findCollectionByNameOrId('filiais')
      var usersCol = app.findCollectionByNameOrId('users')

      // 1. Cadastrar Dec Eldorado se não existir
      var decEldorado = null
      try {
        var existingDec = app.findRecordsByFilter(
          'empresas',
          'code = "DEC-ELDORADO" || name ~ "Dec Eldorado" || cnpj = "00000000000191"',
          '',
          1,
          0,
        )
        if (existingDec && existingDec.length > 0) {
          decEldorado = existingDec[0]
        }
      } catch (_) {}

      if (!decEldorado) {
        decEldorado = new Record(empCol)
        decEldorado.set('code', 'DEC-ELDORADO')
        decEldorado.set('name', 'Dec Eldorado')
        decEldorado.set('razao_social', 'Dec Eldorado Distribuidora Atacadista Ltda')
        decEldorado.set('nome_fantasia', 'Dec Eldorado')
        decEldorado.set('cnpj', '14.285.963/0001-80')
        decEldorado.set('inscricao_estadual', '082.999.11-0')
        decEldorado.set('active', true)
        decEldorado.set('responsible_user', 'Admin')
        app.save(decEldorado)
      }

      // 2. Cadastrar Gran Romano se não existir
      var granRomano = null
      try {
        var existingGR = app.findRecordsByFilter(
          'empresas',
          'code = "GRAN-ROMANO" || name ~ "Gran Romano" || cnpj = "00000000000272"',
          '',
          1,
          0,
        )
        if (existingGR && existingGR.length > 0) {
          granRomano = existingGR[0]
        }
      } catch (_) {}

      if (!granRomano) {
        granRomano = new Record(empCol)
        granRomano.set('code', 'GRAN-ROMANO')
        granRomano.set('name', 'Gran Romano')
        granRomano.set('razao_social', 'Gran Romano Industria e Comercio de Alimentos Ltda')
        granRomano.set('nome_fantasia', 'Gran Romano')
        granRomano.set('cnpj', '23.890.124/0001-45')
        granRomano.set('inscricao_estadual', '083.111.22-3')
        granRomano.set('active', true)
        granRomano.set('responsible_user', 'Admin')
        app.save(granRomano)
      }

      // 3. Cadastrar filiais Matriz para ambas se não existirem
      try {
        var existingFilDec = app.findRecordsByFilter(
          'filiais',
          'code = "DEC-MATRIZ" || (name = "Matriz" && empresa_name = "Dec Eldorado")',
          '',
          1,
          0,
        )
        if (!existingFilDec || existingFilDec.length === 0) {
          var filDec = new Record(filCol)
          filDec.set('code', 'DEC-MATRIZ')
          filDec.set('name', 'Matriz Dec Eldorado')
          filDec.set('empresa_name', decEldorado.get('name') || 'Dec Eldorado')
          filDec.set('active', true)
          filDec.set('responsible_user', 'Admin')
          app.save(filDec)
        }
      } catch (errFil1) {
        console.log('Seed filial Dec Eldorado error:', errFil1)
      }

      try {
        var existingFilGR = app.findRecordsByFilter(
          'filiais',
          'code = "GR-MATRIZ" || (name = "Matriz" && empresa_name = "Gran Romano")',
          '',
          1,
          0,
        )
        if (!existingFilGR || existingFilGR.length === 0) {
          var filGR = new Record(filCol)
          filGR.set('code', 'GR-MATRIZ')
          filGR.set('name', 'Matriz Gran Romano')
          filGR.set('empresa_name', granRomano.get('name') || 'Gran Romano')
          filGR.set('active', true)
          filGR.set('responsible_user', 'Admin')
          app.save(filGR)
        }
      } catch (errFil2) {
        console.log('Seed filial Gran Romano error:', errFil2)
      }

      // 4. Vincular usuários existentes conforme domínio de email e perfil
      var users = app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
      for (var i = 0; i < users.length; i++) {
        var u = users[i]
        var email = (u.get('email') || '').toLowerCase().trim()
        var changed = false

        if (email.indexOf('@deceldorado.com.br') !== -1) {
          if (u.get('empresa_id') !== decEldorado.id) {
            u.set('empresa_id', decEldorado.id)
            changed = true
          }
        } else if (
          email.indexOf('@granfoods.ind.br') !== -1 ||
          email.indexOf('@granromano.com.br') !== -1
        ) {
          if (u.get('empresa_id') !== granRomano.id) {
            u.set('empresa_id', granRomano.id)
            changed = true
          }
        }

        if (changed) {
          app.save(u)
        }
      }

      // 5. Backfill dos dados pilotos pré-existentes (que continham "Velora Log" nos registros de exemplo)
      // para apontarem para Dec Eldorado, permitindo visualização consistente no teste piloto
      var fixCollections = [
        'financial_receivables',
        'financial_payables',
        'financial_movements',
        'sales_orders',
        'rh_employees',
        'wms_receipts',
        'logistics_routes',
      ]

      for (var c = 0; c < fixCollections.length; c++) {
        var cName = fixCollections[c]
        try {
          var colObj = app.findCollectionByNameOrId(cName)
          if (!colObj) continue
          var hasCompany = !!colObj.fields.getByName('company')
          var hasEmpresa = !!colObj.fields.getByName('empresa')
          var filterExpr = hasCompany
            ? 'company = "Velora Log" || company = ""'
            : hasEmpresa
              ? 'empresa = "Velora Log" || empresa = ""'
              : ''
          if (filterExpr) {
            var recs = app.findRecordsByFilter(cName, filterExpr, '', 50, 0)
            for (var r = 0; r < recs.length; r++) {
              var rec = recs[r]
              if (hasCompany) {
                rec.set('company', decEldorado.id)
              }
              if (hasEmpresa) {
                rec.set('empresa', decEldorado.id)
              }
              app.save(rec)
            }
          }
        } catch (errFix) {
          console.log('Backfill pilot for ' + cName + ' notice:', errFix)
        }
      }
    } catch (err) {
      console.log('Migration 0268 error:', err)
    }
  },
  (app) => {
    // Reversão no-op para segurança de dados
  },
)

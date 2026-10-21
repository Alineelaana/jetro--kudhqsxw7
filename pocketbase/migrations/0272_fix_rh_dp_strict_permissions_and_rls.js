migrate(
  (app) => {
    try {
      var perfisCol = app.findCollectionByNameOrId('perfis_permissoes')

      // 1. Garantir que a leitura (list e view) de perfis_permissoes seja permitida para qualquer usuário autenticado
      // A escrita (create, update, delete) fica restrita ao SUP
      perfisCol.listRule = "@request.auth.id != ''"
      perfisCol.viewRule = "@request.auth.id != ''"
      perfisCol.createRule = "@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP'"
      perfisCol.updateRule = "@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP'"
      perfisCol.deleteRule = "@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP'"
      app.save(perfisCol)

      // 2. Definir menus estritos para o perfil "RH / DP":
      // Apenas telas de RH, DP, Chamados e Agenda (+ Home)
      var rhDpAllowedMenus = [
        '/admin',
        // RH
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
        '/admin/rh/aprovacoes',
        '/admin/rh/avaliacao-competencias',
        '/admin/rh/calibracao',
        '/admin/rh/carreira',
        '/admin/rh/cockpit',
        '/admin/rh/competencias',
        '/admin/rh/comunicados',
        '/admin/rh/desligamentos',
        '/admin/rh/documentos',
        '/admin/rh/escalas',
        '/admin/rh/historico',
        '/admin/rh/pesquisa-clima',
        '/admin/rh/planos-carreira',
        '/admin/rh/rubricas',
        // DP
        '/admin/dp',
        '/admin/dp/dashboard',
        '/admin/dp/folha',
        '/admin/dp/banco-horas',
        '/admin/dp/horas-extras',
        '/admin/dp/esocial',
        '/admin/dp/fgts',
        '/admin/dp/rescisao',
        '/admin/dp/rescisoes',
        '/admin/dp/reintegracao',
        '/admin/dp/encargos',
        '/admin/dp/relatorios',
        '/admin/dp/convenios',
        '/admin/dp/convencoes',
        '/admin/dp/13-salario',
        '/admin/dp/admissions',
        '/admin/dp/afastamentos',
        '/admin/dp/contract-changes',
        '/admin/dp/contracts',
        '/admin/dp/dissidio',
        '/admin/dp/documentos-obrigatorios',
        '/admin/dp/escalas',
        '/admin/dp/esocial-layouts',
        '/admin/dp/esocial-monitor',
        '/admin/dp/exames',
        '/admin/dp/ferias',
        '/admin/dp/jornadas',
        '/admin/dp/licencas',
        '/admin/dp/ponto',
        '/admin/dp/provisoes',
        '/admin/dp/sindicatos',
        '/admin/dp/tabelas-tributarias',
        '/admin/dp/epis',
        // Chamados
        '/admin/chamados',
        '/admin/chamados/meus',
        '/admin/chamados/novo',
        '/admin/chamados/painel',
        '/admin/chamados/sla',
        // Agenda
        '/admin/crm/agenda',
      ]

      var rhDpScreens = {}
      for (var i = 0; i < rhDpAllowedMenus.length; i++) {
        var m = rhDpAllowedMenus[i]
        rhDpScreens[m] = { v: true, c: true, e: true, d: true }
      }

      var rhDpRecords = app.findRecordsByFilter(
        'perfis_permissoes',
        'code = "RH / DP" || name = "RH / DP"',
        '',
        1,
        0,
      )

      var rhDpPerfil = null
      if (rhDpRecords.length > 0) {
        rhDpPerfil = rhDpRecords[0]
        rhDpPerfil.set('permissions', {
          allowedMenus: rhDpAllowedMenus,
          screens: rhDpScreens,
        })
        rhDpPerfil.set('active', true)
        app.save(rhDpPerfil)
      } else {
        var newPerfil = new Record(perfisCol)
        newPerfil.set('name', 'RH / DP')
        newPerfil.set('code', 'RH / DP')
        newPerfil.set('description', 'Área de trabalho do DP e RH')
        newPerfil.set('active', true)
        newPerfil.set('permissions', {
          allowedMenus: rhDpAllowedMenus,
          screens: rhDpScreens,
        })
        app.save(newPerfil)
        rhDpPerfil = newPerfil
      }

      // 3. Garantir vínculo da usuária Patricia
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
    } catch (err) {
      console.log('Migration 0272 error/notice:', err)
    }
  },
  (app) => {},
)

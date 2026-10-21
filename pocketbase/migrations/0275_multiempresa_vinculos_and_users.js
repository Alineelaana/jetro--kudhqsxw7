migrate(
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return

      const empresasCol = app.findCollectionByNameOrId('empresas')
      const empresasColId = empresasCol ? empresasCol.id : 'pbc_814944700'

      // 1. Garantir campo 'empresas_ids' na collection 'users' (RelationField com maxSelect > 1)
      if (!usersCol.fields.getByName('empresas_ids')) {
        usersCol.fields.add(
          new RelationField({
            name: 'empresas_ids',
            collectionId: empresasColId,
            cascadeDelete: false,
            maxSelect: 10,
          }),
        )
      }

      // 2. Garantir campo 'codigo' em users caso falte
      if (!usersCol.fields.getByName('codigo')) {
        usersCol.fields.add(
          new NumberField({
            name: 'codigo',
            min: 1,
            onlyInt: true,
          }),
        )
      }

      app.save(usersCol)

      // 3. Criar ou atualizar collection 'usuarios_empresas' para registro de vínculos detalhados
      let vinculosCol = null
      try {
        vinculosCol = app.findCollectionByNameOrId('usuarios_empresas')
      } catch (_) {}

      if (!vinculosCol) {
        vinculosCol = new Collection({
          name: 'usuarios_empresas',
          type: 'base',
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.id != ''",
          fields: [
            {
              name: 'usuario',
              type: 'relation',
              collectionId: '_pb_users_auth_',
              cascadeDelete: true,
              maxSelect: 1,
              required: true,
            },
            {
              name: 'empresa',
              type: 'relation',
              collectionId: empresasColId,
              cascadeDelete: true,
              maxSelect: 1,
              required: true,
            },
            {
              name: 'filial_padrao',
              type: 'text',
              required: false,
            },
            {
              name: 'ativo',
              type: 'bool',
              required: false,
            },
            {
              name: 'created',
              type: 'autodate',
              onCreate: true,
              onUpdate: false,
            },
            {
              name: 'updated',
              type: 'autodate',
              onCreate: true,
              onUpdate: true,
            },
          ],
          indexes: [],
        })
        app.save(vinculosCol)
      }

      // IDs das empresas Dec Eldorado e Gran Romano
      const decId = '0jcxfj3r9a7gogd'
      const decFilialId = '51ma2zu30b85j2l'
      const grId = 't4wx2m5n5jucy9z'
      const grFilialId = 'fhy6eznfyr8krxq'
      const bothEmpresas = [decId, grId]

      // IDs dos perfis
      let rhDpPerfilId = 'kkijxsp801zif1l'
      let padraoPerfilId = 'g56p9yl4qhrqyz3'

      try {
        const rhRec = app.findFirstRecordByData('perfis_permissoes', 'code', 'RH / DP')
        if (rhRec) rhDpPerfilId = rhRec.id
      } catch (_) {}

      try {
        const padraoRec = app.findFirstRecordByData('perfis_permissoes', 'code', 'PADRAO')
        if (padraoRec) padraoPerfilId = padraoRec.id
      } catch (_) {}

      // Função auxiliar para vincular em usuarios_empresas
      const bindUsuarioEmpresa = (userId, empId, filialId) => {
        try {
          const list = app.findRecordsByFilter(
            'usuarios_empresas',
            'usuario = {:u} && empresa = {:e}',
            '',
            1,
            0,
            { u: userId, e: empId },
          )
          if (!list || list.length === 0) {
            const r = new Record(vinculosCol)
            r.set('usuario', userId)
            r.set('empresa', empId)
            r.set('filial_padrao', filialId || '')
            r.set('ativo', true)
            app.save(r)
          }
        } catch (err) {
          console.log('bindUsuarioEmpresa error:', err)
        }
      }

      // Função auxiliar para garantir ou unificar usuário
      const ensureUnifiedUser = (cfg) => {
        let user = null

        // 1. Tentar encontrar por email primário ou emails alternativos
        const emailsToTry = [cfg.email].concat(cfg.altEmails || [])
        for (let i = 0; i < emailsToTry.length; i++) {
          if (!emailsToTry[i]) continue
          try {
            user = app.findAuthRecordByEmail('users', emailsToTry[i])
            if (user) break
          } catch (_) {}
        }

        // 2. Se não achou, tentar por login ou filter
        if (!user && cfg.filter) {
          try {
            const list = app.findRecordsByFilter('users', cfg.filter, 'created', 1, 0)
            if (list && list.length > 0) user = list[0]
          } catch (_) {}
        }

        if (!user) {
          user = new Record(usersCol)
          user.setPassword(cfg.password || 'huram123')
          user.setEmail(cfg.email)
          user.set('emailVisibility', false)
          user.set('verified', false)
        }

        user.set('name', cfg.name)
        user.set('login', cfg.login)
        user.set('username', cfg.login)
        user.set('codigo', cfg.codigo)
        user.set('empresa_id', cfg.primaryEmpresaId || decId)
        user.set('filial_id', cfg.primaryFilialId || decFilialId)
        user.set('empresas_ids', bothEmpresas)
        user.set('role', cfg.role || 'PADRAO')
        user.set('perfil_id', cfg.perfil_id)
        user.set('perfil_acesso', cfg.perfil_acesso)
        if (cfg.cargo !== undefined) user.set('cargo', cfg.cargo)
        if (cfg.departamento !== undefined) user.set('departamento', cfg.departamento)
        user.set('active', true)
        user.set('inactivity_timeout_minutes', cfg.inactivity_timeout_minutes || 480)

        app.save(user)

        // Registrar na collection usuarios_empresas para Dec Eldorado e Gran Romano
        bindUsuarioEmpresa(user.id, decId, decFilialId)
        bindUsuarioEmpresa(user.id, grId, grFilialId)

        // Limpar possíveis réplicas duplicadas que tinham sido criadas com email .gr/.dec
        if (cfg.altEmails && cfg.altEmails.length > 0) {
          for (let k = 0; k < cfg.altEmails.length; k++) {
            const alt = cfg.altEmails[k]
            if (!alt || alt === cfg.email) continue
            try {
              const dup = app.findAuthRecordByEmail('users', alt)
              if (dup && dup.id !== user.id) {
                app.delete(dup)
              }
            } catch (_) {}
          }
        }

        return user
      }

      // Os 7 Usuários Fixos pedidos pelo usuário:
      // 1. Aline (Código 1) - RH / DP
      ensureUnifiedUser({
        name: 'Aline',
        login: 'aline',
        email: 'aline@deceldorado.com.br',
        altEmails: ['aline@granromano.com.br'],
        codigo: 1,
        primaryEmpresaId: decId,
        primaryFilialId: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Recursos Humanos / DP',
        departamento: 'Recursos Humanos',
      })

      // Usuária global Aline Lana (SUP) também mantém código 1 e empresas_ids completas
      try {
        const alineSup = app.findAuthRecordByEmail('users', 'alineelaana@gmail.com')
        if (alineSup) {
          alineSup.set('codigo', 1)
          alineSup.set('empresas_ids', bothEmpresas)
          app.save(alineSup)
          bindUsuarioEmpresa(alineSup.id, decId, decFilialId)
          bindUsuarioEmpresa(alineSup.id, grId, grFilialId)
        }
      } catch (_) {}

      // 2. Junão (Código 2) - RH / DP
      ensureUnifiedUser({
        name: 'Junão',
        login: 'junao',
        email: 'junior@deceldorado.com.br',
        altEmails: ['junao@granromano.com.br'],
        codigo: 2,
        primaryEmpresaId: decId,
        primaryFilialId: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Diretor / CEO',
      })

      // 3. Renata (Código 3) - RH / DP
      ensureUnifiedUser({
        name: 'Renata',
        login: 'renata',
        email: 'renata@deceldorado.com.br',
        altEmails: ['renata@granromano.com.br'],
        codigo: 3,
        primaryEmpresaId: decId,
        primaryFilialId: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Diretora ADM',
      })

      // 4. Alef (Código 4) - PADRAO / Gestão
      ensureUnifiedUser({
        name: 'Alef',
        login: 'alef',
        email: 'alef@deceldorado.com.br',
        altEmails: ['alef@granromano.com.br'],
        codigo: 4,
        primaryEmpresaId: decId,
        primaryFilialId: decFilialId,
        role: 'PADRAO',
        perfil_id: padraoPerfilId,
        perfil_acesso: 'PADRAO',
      })

      // 5. Rogério (Código 5) - PADRAO / Gestão
      ensureUnifiedUser({
        name: 'Rogerio',
        login: 'rogerio.roque',
        email: 'rogerio.roque@granfoods.ind.br',
        altEmails: ['rogerio@deceldorado.com.br', 'rogerio@granromano.com.br'],
        codigo: 5,
        primaryEmpresaId: grId,
        primaryFilialId: grFilialId,
        role: 'PADRAO',
        perfil_id: padraoPerfilId,
        perfil_acesso: 'PADRAO',
      })

      // 6. Patricia (Código 6) - RH / DP
      ensureUnifiedUser({
        name: 'Patricia',
        login: 'patricia.brum',
        email: 'patricia.brum@deceldorado.com.br',
        altEmails: ['patricia@granromano.com.br'],
        codigo: 6,
        primaryEmpresaId: decId,
        primaryFilialId: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Departamento Pessoal',
        departamento: 'Departamento Pessoal',
      })

      // 7. Janaína (Código 7) - RH / DP
      ensureUnifiedUser({
        name: 'Janaína',
        login: 'janaina.nogueira',
        email: 'janaina.nogueira@deceldorado.com.br',
        altEmails: ['janaina@granromano.com.br'],
        codigo: 7,
        primaryEmpresaId: decId,
        primaryFilialId: decFilialId,
        role: 'PADRAO',
        perfil_id: rhDpPerfilId,
        perfil_acesso: 'RH / DP',
        cargo: 'Recursos Humanos',
        departamento: 'Recursos Humanos',
      })

      // 4. Backfill em qualquer outro usuário existente:
      // se tiver empresa_id e empresas_ids estiver vazio, adiciona a empresa_id em empresas_ids
      const remainingUsers = app.findRecordsByFilter('users', 'id != ""', 'created', 0, 0)
      for (let uIdx = 0; uIdx < remainingUsers.length; uIdx++) {
        const u = remainingUsers[uIdx]
        const currentEmpresa = u.get('empresa_id')
        const currentList = u.get('empresas_ids') || []
        if (currentEmpresa && (!currentList || currentList.length === 0)) {
          u.set('empresas_ids', [currentEmpresa])
          app.save(u)
          bindUsuarioEmpresa(u.id, currentEmpresa, u.get('filial_id'))
        }
      }

      // 5. Atualizar as regras RLS das coleções operacionais:
      // Agora permite acesso se record.empresa / record.company coincidir com @request.auth.empresa_id
      // OU estiver dentro de @request.auth.empresas_ids:each (ou usuário for SUP)
      const ruleCompany =
        "@request.auth.id != '' && (" +
        "@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || " +
        'company = @request.auth.empresa_id || ' +
        '@request.auth.empresas_ids:each = company || ' +
        "(company = '' && @request.auth.empresa_id = '')" +
        ')'

      const ruleCompanyWrite =
        "@request.auth.id != '' && (" +
        "@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || " +
        'company = @request.auth.empresa_id || ' +
        '@request.auth.empresas_ids:each = company || ' +
        "company = ''" +
        ')'

      const ruleEmpresa =
        "@request.auth.id != '' && (" +
        "@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || " +
        'empresa = @request.auth.empresa_id || ' +
        '@request.auth.empresas_ids:each = empresa || ' +
        "(empresa = '' && @request.auth.empresa_id = '')" +
        ')'

      const ruleEmpresaWrite =
        "@request.auth.id != '' && (" +
        "@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || " +
        'empresa = @request.auth.empresa_id || ' +
        '@request.auth.empresas_ids:each = empresa || ' +
        "empresa = ''" +
        ')'

      const collectionsCompany = [
        'sales_orders',
        'sales_invoices',
        'nfe_records',
        'purchase_requests',
        'purchase_orders',
        'stock_expeditions',
        'sales_returns',
      ]

      for (let i = 0; i < collectionsCompany.length; i++) {
        const cName = collectionsCompany[i]
        try {
          const colC = app.findCollectionByNameOrId(cName)
          if (colC) {
            colC.listRule = ruleCompany
            colC.viewRule = ruleCompany
            colC.createRule = ruleCompanyWrite
            colC.updateRule = ruleCompanyWrite
            app.save(colC)
          }
        } catch (eC) {
          console.log('Update RLS for ' + cName + ':', eC)
        }
      }

      const collectionsEmpresa = [
        'financial_receivables',
        'financial_payables',
        'financial_movements',
        'financial_collections',
        'financial_cash_registers',
        'financial_approvals',
        'financial_closings',
        'financial_boletos',
        'financial_pix',
        'financial_cards',
        'rh_employees',
        'rh_departments',
        'rh_payroll',
        'dp_admissions',
        'dp_work_contracts',
        'dp_labor_charges',
        'wms_receipts',
        'wms_putaway_tasks',
        'wms_waves',
        'wms_replenishments',
        'logistics_routes',
        'logistics_deliveries',
        'logistics_freights',
        'logistics_costs',
      ]

      for (let j = 0; j < collectionsEmpresa.length; j++) {
        const eName = collectionsEmpresa[j]
        try {
          const colE = app.findCollectionByNameOrId(eName)
          if (colE) {
            colE.listRule = ruleEmpresa
            colE.viewRule = ruleEmpresa
            colE.createRule = ruleEmpresaWrite
            colE.updateRule = ruleEmpresaWrite
            app.save(colE)
          }
        } catch (eE) {
          console.log('Update RLS for ' + eName + ':', eE)
        }
      }
    } catch (err) {
      console.log('Migration 0275 error:', err)
      throw err
    }
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (usersCol && usersCol.fields.getByName('empresas_ids')) {
        usersCol.fields.removeByName('empresas_ids')
        app.save(usersCol)
      }
    } catch (_) {}
  },
)

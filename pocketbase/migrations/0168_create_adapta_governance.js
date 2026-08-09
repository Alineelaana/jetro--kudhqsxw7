migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var RS = "@request.auth.role = 'SUP'"

    var MODULES = [
      'comercial',
      'crm',
      'financeiro',
      'fiscal',
      'industrial',
      'compras',
      'estoque',
      'wms',
      'logistica',
      'rh',
      'qualidade',
      'trade',
      'remuneracao_variavel',
      'bi',
      'agenda',
      'documentos',
      'auditoria',
    ]
    var DATA_TYPES = [
      'faturamento',
      'vendas',
      'estoque',
      'pedidos',
      'indicadores',
      'salarios',
      'custos_industriais',
      'margem',
      'lucro',
      'dados_bancarios',
      'documentos_pessoais',
      'certificados',
      'tokens',
      'chaves',
      'senhas',
      'segredos',
      'credenciais',
      'dados_lgpd',
    ]
    var ACTIONS = [
      'CONSULTAR',
      'ANALISAR',
      'SUGERIR',
      'SIMULAR',
      'EXPORTAR',
      'CRIAR',
      'ALTERAR',
      'EXCLUIR',
      'APROVAR',
      'LIBERAR',
      'ENCERRAR',
      'CANCELAR',
    ]
    var POLICIES = [
      'can_see_margem',
      'can_see_lucro',
      'can_see_salarios',
      'can_see_comissao',
      'can_see_custos',
      'can_see_fornecedores_estrategicos',
      'can_see_fluxo_caixa',
      'can_see_certificados',
      'can_see_dados_lgpd',
    ]

    function makePerms(keys, enabled) {
      var r = {}
      for (var i = 0; i < keys.length; i++) r[keys[i]] = false
      for (var j = 0; j < enabled.length; j++) r[enabled[j]] = true
      return r
    }

    function notIn(arr, exclude) {
      return arr.filter(function (x) {
        return exclude.indexOf(x) === -1
      })
    }

    try {
      app.findCollectionByNameOrId('adapta_governance')
    } catch (_) {
      app.save(
        new Collection({
          name: 'adapta_governance',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: RS,
          updateRule: RS,
          deleteRule: RS,
          fields: [
            { name: 'module_perms', type: 'json' },
            { name: 'data_type_perms', type: 'json' },
            { name: 'action_perms', type: 'json' },
            { name: 'corporate_policies', type: 'json' },
            { name: 'default_mode', type: 'text' },
            { name: 'enforce_org_scope', type: 'bool' },
            { name: 'enforce_audit', type: 'bool' },
            { name: 'traceability_enabled', type: 'bool' },
            { name: 'active', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: ['CREATE INDEX idx_adapta_gov_active ON adapta_governance (active)'],
        }),
      )
    }

    try {
      app.findCollectionByNameOrId('adapta_ai_profiles')
    } catch (_) {
      app.save(
        new Collection({
          name: 'adapta_ai_profiles',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: RS,
          updateRule: RS,
          deleteRule: RS,
          fields: [
            { name: 'profile_name', type: 'text' },
            { name: 'profile_key', type: 'text' },
            { name: 'description', type: 'text' },
            { name: 'module_perms', type: 'json' },
            { name: 'data_type_perms', type: 'json' },
            { name: 'action_perms', type: 'json' },
            { name: 'corporate_policies', type: 'json' },
            { name: 'allowed_agents', type: 'json' },
            { name: 'active', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_adapta_profiles_key ON adapta_ai_profiles (profile_key)',
          ],
        }),
      )
    }

    var govCol = null
    try {
      govCol = app.findCollectionByNameOrId('adapta_governance')
    } catch (_) {}
    if (govCol) {
      var hasGov = false
      try {
        var existing = app.findRecordsByFilter(
          'adapta_governance',
          'active = true',
          '-created',
          1,
          0,
        )
        if (existing.length > 0) hasGov = true
      } catch (_) {}
      if (!hasGov) {
        var gov = new Record(govCol)
        gov.set('module_perms', JSON.stringify(makePerms(MODULES, notIn(MODULES, ['auditoria']))))
        gov.set(
          'data_type_perms',
          JSON.stringify(
            makePerms(DATA_TYPES, ['faturamento', 'vendas', 'estoque', 'pedidos', 'indicadores']),
          ),
        )
        gov.set(
          'action_perms',
          JSON.stringify(makePerms(ACTIONS, ['CONSULTAR', 'ANALISAR', 'SUGERIR', 'SIMULAR'])),
        )
        gov.set('corporate_policies', JSON.stringify(makePerms(POLICIES, [])))
        gov.set('default_mode', 'ADAPTA Assistente')
        gov.set('enforce_org_scope', true)
        gov.set('enforce_audit', true)
        gov.set('traceability_enabled', true)
        gov.set('active', true)
        app.save(gov)
      }
    }

    var profCol = null
    try {
      profCol = app.findCollectionByNameOrId('adapta_ai_profiles')
    } catch (_) {}
    if (profCol) {
      var PROFILES = [
        {
          key: 'publico',
          name: 'ADAPTA Público',
          desc: 'Acesso restrito a informações públicas e indicadores gerais',
          mods: ['comercial', 'estoque', 'logistica', 'bi'],
          dtypes: ['faturamento', 'vendas', 'estoque', 'indicadores'],
          acts: ['CONSULTAR', 'ANALISAR'],
          pols: [],
        },
        {
          key: 'operacional',
          name: 'ADAPTA Operacional',
          desc: 'Acesso operacional a todos os módulos exceto auditoria',
          mods: notIn(MODULES, ['auditoria']),
          dtypes: ['faturamento', 'vendas', 'estoque', 'pedidos', 'indicadores'],
          acts: ['CONSULTAR', 'ANALISAR', 'SUGERIR', 'SIMULAR'],
          pols: [],
        },
        {
          key: 'gestor',
          name: 'ADAPTA Gestor',
          desc: 'Acesso a indicadores financeiros, margem e fluxo de caixa',
          mods: notIn(MODULES, ['auditoria']),
          dtypes: ['faturamento', 'vendas', 'estoque', 'pedidos', 'indicadores', 'margem'],
          acts: ['CONSULTAR', 'ANALISAR', 'SUGERIR', 'SIMULAR', 'EXPORTAR'],
          pols: ['can_see_margem', 'can_see_comissao', 'can_see_fluxo_caixa'],
        },
        {
          key: 'executivo',
          name: 'ADAPTA Executivo',
          desc: 'Acesso a dados estratégicos, custos e lucro',
          mods: MODULES,
          dtypes: [
            'faturamento',
            'vendas',
            'estoque',
            'pedidos',
            'indicadores',
            'margem',
            'lucro',
            'custos_industriais',
          ],
          acts: ['CONSULTAR', 'ANALISAR', 'SUGERIR', 'SIMULAR', 'EXPORTAR'],
          pols: [
            'can_see_margem',
            'can_see_lucro',
            'can_see_custos',
            'can_see_comissao',
            'can_see_fluxo_caixa',
            'can_see_fornecedores_estrategicos',
          ],
        },
        {
          key: 'presidencia',
          name: 'ADAPTA Presidência',
          desc: 'Acesso total dentro do RBAC, exceto dados protegidos',
          mods: MODULES,
          dtypes: notIn(DATA_TYPES, [
            'tokens',
            'chaves',
            'senhas',
            'segredos',
            'credenciais',
            'dados_lgpd',
          ]),
          acts: ['CONSULTAR', 'ANALISAR', 'SUGERIR', 'SIMULAR', 'EXPORTAR'],
          pols: notIn(POLICIES, ['can_see_dados_lgpd']),
        },
      ]
      for (var i = 0; i < PROFILES.length; i++) {
        var p = PROFILES[i]
        var exists = false
        try {
          app.findFirstRecordByData('adapta_ai_profiles', 'profile_key', p.key)
          exists = true
        } catch (_) {}
        if (!exists) {
          var rec = new Record(profCol)
          rec.set('profile_name', p.name)
          rec.set('profile_key', p.key)
          rec.set('description', p.desc)
          rec.set('module_perms', JSON.stringify(makePerms(MODULES, p.mods)))
          rec.set('data_type_perms', JSON.stringify(makePerms(DATA_TYPES, p.dtypes)))
          rec.set('action_perms', JSON.stringify(makePerms(ACTIONS, p.acts)))
          rec.set('corporate_policies', JSON.stringify(makePerms(POLICIES, p.pols)))
          rec.set('allowed_agents', JSON.stringify([]))
          rec.set('active', true)
          app.save(rec)
        }
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('adapta_ai_profiles'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('adapta_governance'))
    } catch (_) {}
  },
)

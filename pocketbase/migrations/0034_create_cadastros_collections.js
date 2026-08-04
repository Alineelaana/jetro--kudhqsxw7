migrate(
  (app) => {
    function stdCol(name, extraFields, extraIndexes) {
      var fields = [
        { name: 'code', type: 'text' },
        { name: 'name', type: 'text', required: true },
      ]
      for (var i = 0; i < extraFields.length; i++) fields.push(extraFields[i])
      fields.push({ name: 'active', type: 'bool' })
      fields.push({ name: 'responsible_user', type: 'text' })
      fields.push({ name: 'created', type: 'autodate', onCreate: true, onUpdate: false })
      fields.push({ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true })
      var indexes = [
        'CREATE UNIQUE INDEX idx_' + name + '_code ON ' + name + " (code) WHERE code != ''",
        'CREATE INDEX idx_' + name + '_name ON ' + name + ' (name)',
        'CREATE INDEX idx_' + name + '_active ON ' + name + ' (active)',
      ]
      if (extraIndexes) for (var j = 0; j < extraIndexes.length; j++) indexes.push(extraIndexes[j])
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: fields,
          indexes: indexes,
        }),
      )
    }

    stdCol(
      'empresas',
      [
        { name: 'razao_social', type: 'text' },
        { name: 'nome_fantasia', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'inscricao_estadual', type: 'text' },
        { name: 'inscricao_municipal', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'cep', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        {
          name: 'logo',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
      ],
      ["CREATE UNIQUE INDEX idx_empresas_cnpj ON empresas (cnpj) WHERE cnpj != ''"],
    )

    stdCol(
      'filiais',
      [
        { name: 'empresa_name', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'inscricao_estadual', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'responsible', type: 'text' },
      ],
      ['CREATE INDEX idx_filiais_empresa ON filiais (empresa_name)'],
    )

    stdCol('perfis_permissoes', [
      { name: 'description', type: 'text' },
      { name: 'permissions', type: 'json' },
    ])

    stdCol(
      'transportadoras',
      [
        { name: 'razao_social', type: 'text' },
        { name: 'nome_fantasia', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'tipo_transporte', type: 'text' },
        { name: 'regioes', type: 'text' },
        { name: 'prazo_medio', type: 'text' },
      ],
      ["CREATE UNIQUE INDEX idx_transportadoras_cnpj ON transportadoras (cnpj) WHERE cnpj != ''"],
    )

    stdCol('categorias', [{ name: 'description', type: 'text' }])

    stdCol(
      'subcategorias',
      [
        { name: 'description', type: 'text' },
        { name: 'category_name', type: 'text' },
      ],
      ['CREATE INDEX idx_subcategorias_category ON subcategorias (category_name)'],
    )

    stdCol('marcas', [{ name: 'description', type: 'text' }])

    stdCol('unidades_medida', [
      { name: 'description', type: 'text' },
      { name: 'abbreviation', type: 'text' },
    ])

    stdCol('centros_custo', [
      { name: 'empresa_name', type: 'text' },
      { name: 'filial_name', type: 'text' },
      { name: 'responsible', type: 'text' },
    ])

    stdCol(
      'plano_contas',
      [
        { name: 'type', type: 'text' },
        { name: 'parent_code', type: 'text' },
        { name: 'natureza', type: 'text' },
        { name: 'aceita_lancamentos', type: 'bool' },
      ],
      ['CREATE INDEX idx_plano_contas_parent ON plano_contas (parent_code)'],
    )

    stdCol('bancos', [])

    stdCol('contas_bancarias', [
      { name: 'banco_name', type: 'text' },
      { name: 'agencia', type: 'text' },
      { name: 'conta', type: 'text' },
      { name: 'tipo', type: 'text' },
      { name: 'empresa_name', type: 'text' },
      { name: 'filial_name', type: 'text' },
      { name: 'saldo_inicial', type: 'text' },
    ])

    stdCol('formas_pagamento', [
      { name: 'tipo', type: 'text' },
      { name: 'gera_financeiro', type: 'bool' },
    ])

    stdCol('condicoes_pagamento', [
      { name: 'parcelas', type: 'number' },
      { name: 'intervalo', type: 'number' },
      { name: 'entrada', type: 'text' },
    ])

    stdCol('vendedores', [
      { name: 'cpf_cnpj', type: 'text' },
      { name: 'tipo', type: 'text' },
      { name: 'regiao', type: 'text' },
      { name: 'supervisor', type: 'text' },
      { name: 'comissao', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'email', type: 'text' },
    ])

    stdCol('representantes', [
      { name: 'cpf_cnpj', type: 'text' },
      { name: 'tipo', type: 'text' },
      { name: 'regiao', type: 'text' },
      { name: 'supervisor', type: 'text' },
      { name: 'comissao', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'email', type: 'text' },
    ])

    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    var newFields = ['empresa_id', 'filial_id', 'cargo', 'departamento', 'perfil_acesso']
    for (var k = 0; k < newFields.length; k++) {
      if (!usersCol.fields.getByName(newFields[k])) {
        usersCol.fields.add(new TextField({ name: newFields[k] }))
      }
    }
    app.save(usersCol)
  },
  (app) => {
    var cols = [
      'empresas',
      'filiais',
      'perfis_permissoes',
      'transportadoras',
      'categorias',
      'subcategorias',
      'marcas',
      'unidades_medida',
      'centros_custo',
      'plano_contas',
      'bancos',
      'contas_bancarias',
      'formas_pagamento',
      'condicoes_pagamento',
      'vendedores',
      'representantes',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

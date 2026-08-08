migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var RS = "@request.auth.role = 'SUP'"
    var A = [
      new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
      new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
    ]
    function T(n) {
      return new TextField({ name: n })
    }
    function B(n) {
      return new BoolField({ name: n })
    }
    function J(n) {
      return new JSONField({ name: n })
    }
    function S(n, v) {
      return new SelectField({ name: n, values: v, maxSelect: 1 })
    }
    function mk(name, fields, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: RS,
          fields: fields.concat(A),
          indexes: indexes || [],
        }),
      )
    }
    function seed(colName, records, idField) {
      var col = app.findCollectionByNameOrId(colName)
      for (var i = 0; i < records.length; i++) {
        var r = records[i]
        if (idField) {
          try {
            app.findFirstRecordByData(colName, idField, r[idField])
            continue
          } catch (_) {}
        }
        var rec = new Record(col)
        var keys = Object.keys(r)
        for (var j = 0; j < keys.length; j++) rec.set(keys[j], r[keys[j]])
        app.save(rec)
      }
    }
    function addFields(colName, fields) {
      var col = app.findCollectionByNameOrId(colName)
      for (var i = 0; i < fields.length; i++) {
        if (!col.fields.getByName(fields[i].name)) col.fields.add(fields[i])
      }
      app.save(col)
    }

    mk(
      'controladoria_result_centers',
      [
        T('code'),
        T('name'),
        S('type', [
          'Distribuição',
          'Indústria',
          'E-commerce',
          'Loja',
          'Filial',
          'CD',
          'Unidade de Negócio',
        ]),
        T('parent_code'),
        T('responsible'),
        B('is_active'),
        T('company'),
        T('branch'),
      ],
      ['CREATE INDEX idx_ctrl_rc_code ON controladoria_result_centers (code)'],
    )

    mk(
      'controladoria_ebitda_config',
      [
        T('name'),
        T('formula_expression'),
        J('components'),
        T('margin_target'),
        T('description'),
        B('is_active'),
        T('company'),
        T('period'),
      ],
      ['CREATE INDEX idx_ctrl_ebitda_period ON controladoria_ebitda_config (period)'],
    )

    mk(
      'controladoria_margins',
      [
        S('dimension', ['produto', 'cliente', 'fornecedor', 'marca', 'vendedor', 'gerente']),
        T('entity_id'),
        T('entity_name'),
        T('period'),
        T('revenue'),
        T('cost'),
        T('margin_value'),
        T('margin_percent'),
        T('methodology'),
        J('cost_breakdown'),
        T('company'),
      ],
      ['CREATE INDEX idx_ctrl_margins_dim ON controladoria_margins (dimension, period)'],
    )

    addFields('controladoria_budgets', [
      T('result_center'),
      T('department'),
      T('project'),
      S('entry_type', ['receita', 'custo', 'despesa', 'investimento']),
    ])
    addFields('controladoria_forecasts', [
      T('result_center'),
      T('realized_value'),
      S('projection_method', [
        'historical_avg',
        'seasonal',
        'linear_trend',
        'budget_based',
        'orders_based',
      ]),
    ])
    addFields('controladoria_comments', [T('result_center')])
    addFields('controladoria_closing', [T('result_center')])
    addFields('contabil_dre_config', [B('deprecated'), T('migrated_to')])

    try {
      var existing = app.findRecordsByFilter('contabil_dre_config', '', 'created', 0, 0)
      for (var i = 0; i < existing.length; i++) {
        existing[i].set('deprecated', true)
        existing[i].set('migrated_to', 'controladoria_dre_structure')
        app.save(existing[i])
      }
    } catch (_) {}

    seed(
      'controladoria_result_centers',
      [
        { code: 'RC001', name: 'Distribuição ES', type: 'Distribuição', is_active: true },
        { code: 'RC002', name: 'Indústria Principal', type: 'Indústria', is_active: true },
        { code: 'RC003', name: 'E-commerce', type: 'E-commerce', is_active: true },
        { code: 'RC004', name: 'Loja Física - Vitória', type: 'Loja', is_active: true },
        { code: 'RC005', name: 'Filial - Cariacica', type: 'Filial', is_active: true },
        { code: 'RC006', name: 'CD - Serra', type: 'CD', is_active: true },
        {
          code: 'RC007',
          name: 'Unidade de Negócio Sul',
          type: 'Unidade de Negócio',
          is_active: true,
        },
      ],
      'code',
    )

    seed(
      'controladoria_ebitda_config',
      [
        {
          name: 'EBITDA Padrão',
          formula_expression: 'resultado_operacional + depreciacao',
          components: JSON.stringify([
            { key: 'resultado_operacional', label: 'Resultado Operacional', source: 'DRE' },
            { key: 'depreciacao', label: 'Depreciação', source: 'DRE' },
          ]),
          margin_target: '20',
          description: 'EBITDA = Resultado Operacional + Depreciação',
          is_active: true,
          period: new Date().toISOString().substring(0, 7),
        },
      ],
      'name',
    )

    try {
      var amCol = app.findCollectionByNameOrId('controladoria_account_mapping')
      var groupMap = { Receitas: 'receita_bruta', Custos: 'cmv', Despesas: 'desp_administrativas' }
      var groups = Object.keys(groupMap)
      for (var g = 0; g < groups.length; g++) {
        var accounts = app.findRecordsByFilter(
          'plano_contas',
          'grupo = "' + groups[g] + '"',
          'code',
          0,
          0,
        )
        for (var a = 0; a < accounts.length; a++) {
          var code = accounts[a].getString('code')
          try {
            app.findFirstRecordByData('controladoria_account_mapping', 'account_code', code)
            continue
          } catch (_) {}
          var rec = new Record(amCol)
          rec.set('account_code', code)
          rec.set('account_name', accounts[a].getString('name'))
          rec.set('dre_line_key', groupMap[groups[g]])
          rec.set('mapping_type', 'automatic')
          rec.set('is_active', true)
          app.save(rec)
        }
      }
    } catch (_) {}

    console.log('0119: Controladoria Phase 2 evolution complete')
  },
  (app) => {
    var cols = [
      'controladoria_margins',
      'controladoria_ebitda_config',
      'controladoria_result_centers',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

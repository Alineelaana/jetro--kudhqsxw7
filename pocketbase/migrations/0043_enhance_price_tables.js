migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('price_tables')

    var oldType = col.fields.getByName('table_type')
    if (oldType) col.fields.remove(oldType)
    col.fields.add(
      new SelectField({
        name: 'table_type',
        values: [
          'varejo',
          'atacado',
          'distribuidor',
          'promocional',
          'especial',
          'cliente_especifico',
          'regiao',
          'canal_venda',
          'representante',
          'outra',
        ],
        maxSelect: 1,
        required: true,
      }),
    )

    var textFields = [
      'code',
      'description',
      'empresa',
      'filial',
      'moeda',
      'tabela_base',
      'percentual_ajuste',
      'observacoes',
      'data_inicial',
      'data_final',
      'responsible_user',
      'parent_table_id',
    ]
    for (var i = 0; i < textFields.length; i++) {
      if (!col.fields.getByName(textFields[i])) {
        col.fields.add(new TextField({ name: textFields[i] }))
      }
    }

    if (!col.fields.getByName('prioridade')) {
      col.fields.add(new NumberField({ name: 'prioridade' }))
    }

    var jsonFields = ['items', 'rules']
    for (var j = 0; j < jsonFields.length; j++) {
      if (!col.fields.getByName(jsonFields[j])) {
        col.fields.add(new JSONField({ name: jsonFields[j] }))
      }
    }

    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({
          name: 'status',
          values: ['rascunho', 'aguardando_aprovacao', 'ativa', 'inativa', 'expirada', 'cancelada'],
          maxSelect: 1,
        }),
      )
    }

    col.addIndex('idx_price_tables_code', false, 'code', '')
    col.addIndex('idx_price_tables_status_v2', false, 'status', '')
    col.addIndex('idx_price_tables_empresa', false, 'empresa', '')
    col.addIndex('idx_price_tables_filial', false, 'filial', '')
    col.addIndex('idx_price_tables_prioridade', false, 'prioridade', '')

    app.save(col)

    var histCol = app.findCollectionByNameOrId('pricing_history')
    histCol.deleteRule = null
    histCol.updateRule = null
    app.save(histCol)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('price_tables')
    var fields = [
      'code',
      'description',
      'empresa',
      'filial',
      'moeda',
      'prioridade',
      'tabela_base',
      'percentual_ajuste',
      'observacoes',
      'data_inicial',
      'data_final',
      'items',
      'rules',
      'responsible_user',
      'parent_table_id',
      'status',
    ]
    for (var k = 0; k < fields.length; k++) {
      var f = col.fields.getByName(fields[k])
      if (f) col.fields.remove(f)
    }
    app.save(col)
  },
)

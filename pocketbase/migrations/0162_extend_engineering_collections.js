/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    var bomCol = app.findCollectionByNameOrId('bom_versions')

    var newFields = [
      {
        name: 'engineering_dimension',
        type: 'select',
        values: ['padrao', 'variante', 'cliente', 'fornecedor', 'embalagem', 'unidade_producao'],
        maxSelect: 1,
      },
      { name: 'dimension_ref', type: 'text' },
      { name: 'is_alternative', type: 'bool' },
      { name: 'is_contingency', type: 'bool' },
      { name: 'parent_version_id', type: 'text' },
      { name: 'revision_number', type: 'number' },
      { name: 'revision_status', type: 'text' },
      { name: 'approved_by', type: 'text' },
      { name: 'approval_date', type: 'text' },
      { name: 'obsolete_date', type: 'text' },
    ]

    newFields.forEach(function (f) {
      if (!bomCol.fields.getByName(f.name)) {
        if (f.type === 'select') {
          bomCol.fields.add(
            new SelectField({ name: f.name, values: f.values, maxSelect: f.maxSelect }),
          )
        } else if (f.type === 'bool') {
          bomCol.fields.add(new BoolField({ name: f.name }))
        } else if (f.type === 'number') {
          bomCol.fields.add(new NumberField({ name: f.name }))
        } else {
          bomCol.fields.add(new TextField({ name: f.name }))
        }
      }
    })

    app.save(bomCol)

    var compCol = app.findCollectionByNameOrId('bom_components')
    if (!compCol.fields.getByName('is_obsolete')) {
      compCol.fields.add(new BoolField({ name: 'is_obsolete' }))
    }
    if (!compCol.fields.getByName('equivalent_item_id')) {
      compCol.fields.add(new TextField({ name: 'equivalent_item_id' }))
    }
    if (!compCol.fields.getByName('substitute_item_id')) {
      compCol.fields.add(new TextField({ name: 'substitute_item_id' }))
    }
    app.save(compCol)
  },
  (app) => {
    var bomCol = app.findCollectionByNameOrId('bom_versions')
    var removeFields = [
      'engineering_dimension',
      'dimension_ref',
      'is_alternative',
      'is_contingency',
      'parent_version_id',
      'revision_number',
      'revision_status',
      'approved_by',
      'approval_date',
      'obsolete_date',
    ]
    removeFields.forEach(function (n) {
      var f = bomCol.fields.getByName(n)
      if (f) bomCol.fields.remove(f)
    })
    app.save(bomCol)

    var compCol = app.findCollectionByNameOrId('bom_components')
    var removeComp = ['is_obsolete', 'equivalent_item_id', 'substitute_item_id']
    removeComp.forEach(function (n) {
      var f = compCol.fields.getByName(n)
      if (f) compCol.fields.remove(f)
    })
    app.save(compCol)
  },
)

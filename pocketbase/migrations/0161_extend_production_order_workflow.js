/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('production_orders')

    if (!col.fields.getByName('order_type')) {
      col.fields.add(
        new SelectField({
          name: 'order_type',
          values: [
            'producao_interna',
            'producao_terceirizada',
            'piloto',
            'rework',
            'desmontagem',
            'manutencao',
            'reprocesso',
          ],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('justification')) {
      col.fields.add(new TextField({ name: 'justification' }))
    }

    if (!col.fields.getByName('transition_history')) {
      col.fields.add(new JSONField({ name: 'transition_history' }))
    }

    if (!col.fields.getByName('demand_id')) {
      col.fields.add(new TextField({ name: 'demand_id' }))
    }

    if (!col.fields.getByName('production_scenario')) {
      col.fields.add(new TextField({ name: 'production_scenario' }))
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('production_orders')
    var fieldsToRemove = [
      'order_type',
      'justification',
      'transition_history',
      'demand_id',
      'production_scenario',
    ]
    fieldsToRemove.forEach(function (fieldName) {
      var field = col.fields.getByName(fieldName)
      if (field) col.fields.remove(field)
    })
    app.save(col)
  },
)

/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('supplier_allowance_appropriations')

    // Campo booleano para indicar se o abatimento no custo médio já foi aplicado
    if (!collection.fields.getByName('cost_applied')) {
      collection.fields.addAt(
        collection.fields.length,
        new BoolField({
          name: 'cost_applied',
          required: false,
        }),
      )
    }

    // Campo texto para guardar a referência do histórico gerado em product_cost_history
    if (!collection.fields.getByName('cost_history_ref')) {
      collection.fields.addAt(
        collection.fields.length,
        new TextField({
          name: 'cost_history_ref',
          required: false,
        }),
      )
    }

    // Campo numérico/texto para o valor unitário abatido do custo
    if (!collection.fields.getByName('unit_cost_deduction')) {
      collection.fields.addAt(
        collection.fields.length,
        new TextField({
          name: 'unit_cost_deduction',
          required: false,
        }),
      )
    }

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('supplier_allowance_appropriations')
    if (collection.fields.getByName('cost_applied')) {
      collection.fields.removeByName('cost_applied')
    }
    if (collection.fields.getByName('cost_history_ref')) {
      collection.fields.removeByName('cost_history_ref')
    }
    if (collection.fields.getByName('unit_cost_deduction')) {
      collection.fields.removeByName('unit_cost_deduction')
    }
    app.save(collection)
  },
)

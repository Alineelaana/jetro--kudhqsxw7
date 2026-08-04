migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'stock_alerts',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'product_id', type: 'text', required: true },
          { name: 'product_code', type: 'text' },
          { name: 'product_name', type: 'text' },
          {
            name: 'alert_type',
            type: 'select',
            required: true,
            values: ['below_min_stock'],
            maxSelect: 1,
          },
          {
            name: 'severity',
            type: 'select',
            values: ['info', 'warning', 'critical'],
            maxSelect: 1,
          },
          { name: 'current_stock', type: 'number' },
          { name: 'min_stock', type: 'number' },
          { name: 'message', type: 'text' },
          { name: 'resolved', type: 'bool' },
          { name: 'resolved_by', type: 'text' },
          { name: 'resolved_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_stock_alerts_product_id ON stock_alerts (product_id)',
          'CREATE INDEX idx_stock_alerts_resolved ON stock_alerts (resolved)',
        ],
      }),
    )

    var notifCol = app.findCollectionByNameOrId('notifications')
    var oldTypeField = notifCol.fields.getByName('type')
    if (oldTypeField) {
      notifCol.fields.remove(oldTypeField.id)
    }
    notifCol.fields.add(
      new SelectField({
        name: 'type',
        required: true,
        values: ['budget_created', 'budget_saved', 'stock_low', 'price_below_cost'],
        maxSelect: 1,
      }),
    )
    app.save(notifCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('stock_alerts'))
    } catch (_) {}

    try {
      var notifCol = app.findCollectionByNameOrId('notifications')
      var oldTypeField = notifCol.fields.getByName('type')
      if (oldTypeField) {
        notifCol.fields.remove(oldTypeField.id)
      }
      notifCol.fields.add(
        new SelectField({
          name: 'type',
          required: true,
          values: ['budget_created', 'budget_saved'],
          maxSelect: 1,
        }),
      )
      app.save(notifCol)
    } catch (_) {}
  },
)

migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('budget_requests')

    if (!col.fields.getByName('responsible_email')) {
      col.fields.add(new TextField({ name: 'responsible_email' }))
    }
    if (!col.fields.getByName('responsible_phone')) {
      col.fields.add(new TextField({ name: 'responsible_phone' }))
    }
    if (!col.fields.getByName('quote_created_at')) {
      col.fields.add(new TextField({ name: 'quote_created_at' }))
    }
    if (!col.fields.getByName('budget_number')) {
      col.fields.add(new TextField({ name: 'budget_number' }))
    }

    app.save(col)
  },
  (app) => {
    // Down migration - fields remain as schema is additive
  },
)

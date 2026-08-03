migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    app.save(
      new Collection({
        name: 'notifications',
        type: 'base',
        listRule: "@request.auth.id != '' && recipient = @request.auth.id",
        viewRule: "@request.auth.id != '' && recipient = @request.auth.id",
        createRule: "@request.auth.role = 'SUP'",
        updateRule: "@request.auth.id != '' && recipient = @request.auth.id",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'message', type: 'text' },
          {
            name: 'type',
            type: 'select',
            required: true,
            values: ['budget_created', 'budget_saved'],
            maxSelect: 1,
          },
          {
            name: 'recipient',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'read', type: 'bool' },
          { name: 'link', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_notifications_recipient ON notifications (recipient)',
          'CREATE INDEX idx_notifications_read ON notifications (read)',
          'CREATE INDEX idx_notifications_created ON notifications (created)',
        ],
      }),
    )

    var brCol = app.findCollectionByNameOrId('budget_requests')
    if (!brCol.fields.getByName('sending_history')) {
      brCol.fields.add(new JSONField({ name: 'sending_history' }))
    }
    if (!brCol.fields.getByName('services')) {
      brCol.fields.add(new JSONField({ name: 'services' }))
    }
    brCol.addIndex('idx_budget_requests_budget_number', false, 'budget_number', '')
    brCol.addIndex('idx_budget_requests_client_name', false, 'client_name', '')
    app.save(brCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
    try {
      var brCol = app.findCollectionByNameOrId('budget_requests')
      brCol.removeIndex('idx_budget_requests_budget_number')
      brCol.removeIndex('idx_budget_requests_client_name')
      app.save(brCol)
    } catch (_) {}
  },
)

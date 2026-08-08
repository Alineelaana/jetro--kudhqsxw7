migrate(
  (app) => {
    const usersCollectionId = '_pb_users_auth_'

    const partners = app.findCollectionByNameOrId('partners')

    if (!partners.fields.getByName('rca_id')) {
      partners.fields.add(
        new RelationField({
          name: 'rca_id',
          collectionId: usersCollectionId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    if (!partners.fields.getByName('televendas_id')) {
      partners.fields.add(
        new RelationField({
          name: 'televendas_id',
          collectionId: usersCollectionId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    if (!partners.fields.getByName('responsavel_comercial_digital_id')) {
      partners.fields.add(
        new RelationField({
          name: 'responsavel_comercial_digital_id',
          collectionId: usersCollectionId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }

    partners.addIndex('idx_partners_rca', false, 'rca_id', '')
    partners.addIndex('idx_partners_televendas', false, 'televendas_id', '')
    partners.addIndex('idx_partners_resp_digital', false, 'responsavel_comercial_digital_id', '')

    app.save(partners)

    const salesOrders = app.findCollectionByNameOrId('sales_orders')
    if (!salesOrders.fields.getByName('sales_channel')) {
      salesOrders.fields.add(new TextField({ name: 'sales_channel' }))
    }
    app.save(salesOrders)

    const budgetRequests = app.findCollectionByNameOrId('budget_requests')
    if (!budgetRequests.fields.getByName('sales_channel')) {
      budgetRequests.fields.add(new TextField({ name: 'sales_channel' }))
    }
    app.save(budgetRequests)

    const commissionRules = new Collection({
      name: 'commission_rules',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'role',
          type: 'select',
          values: ['RCA', 'Televendas', 'Responsavel Comercial Digital'],
          maxSelect: 1,
          required: true,
        },
        { name: 'percentage', type: 'text' },
        { name: 'split_percentage', type: 'text' },
        { name: 'priority', type: 'number' },
        { name: 'applicability', type: 'text' },
        { name: 'active', type: 'bool' },
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_commission_rules_role ON commission_rules (role)',
        'CREATE INDEX idx_commission_rules_active ON commission_rules (active)',
      ],
    })
    app.save(commissionRules)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('commission_rules')
      app.delete(col)
    } catch (_) {}

    try {
      const partners = app.findCollectionByNameOrId('partners')
      partners.removeIndex('idx_partners_rca')
      partners.removeIndex('idx_partners_televendas')
      partners.removeIndex('idx_partners_resp_digital')
      const rcaField = partners.fields.getByName('rca_id')
      if (rcaField) partners.fields.remove(rcaField)
      const televendasField = partners.fields.getByName('televendas_id')
      if (televendasField) partners.fields.remove(televendasField)
      const digitalField = partners.fields.getByName('responsavel_comercial_digital_id')
      if (digitalField) partners.fields.remove(digitalField)
      app.save(partners)
    } catch (_) {}

    try {
      const salesOrders = app.findCollectionByNameOrId('sales_orders')
      const channelField = salesOrders.fields.getByName('sales_channel')
      if (channelField) salesOrders.fields.remove(channelField)
      app.save(salesOrders)
    } catch (_) {}

    try {
      const budgetRequests = app.findCollectionByNameOrId('budget_requests')
      const channelField = budgetRequests.fields.getByName('sales_channel')
      if (channelField) budgetRequests.fields.remove(channelField)
      app.save(budgetRequests)
    } catch (_) {}
  },
)

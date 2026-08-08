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

    let commissionRules
    try {
      commissionRules = app.findCollectionByNameOrId('commission_rules')
    } catch (_) {
      commissionRules = new Collection({
        name: 'commission_rules',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [],
        indexes: [],
      })
    }

    if (!commissionRules.fields.getByName('role')) {
      commissionRules.fields.add(
        new SelectField({
          name: 'role',
          values: ['RCA', 'Televendas', 'Responsavel Comercial Digital'],
          maxSelect: 1,
          required: true,
        }),
      )
    }
    if (!commissionRules.fields.getByName('percentage')) {
      commissionRules.fields.add(new TextField({ name: 'percentage' }))
    }
    if (!commissionRules.fields.getByName('split_percentage')) {
      commissionRules.fields.add(new TextField({ name: 'split_percentage' }))
    }
    if (!commissionRules.fields.getByName('priority')) {
      commissionRules.fields.add(new NumberField({ name: 'priority' }))
    }
    if (!commissionRules.fields.getByName('applicability')) {
      commissionRules.fields.add(new TextField({ name: 'applicability' }))
    }
    if (!commissionRules.fields.getByName('active')) {
      commissionRules.fields.add(new BoolField({ name: 'active' }))
    }
    if (!commissionRules.fields.getByName('empresa')) {
      commissionRules.fields.add(new TextField({ name: 'empresa' }))
    }
    if (!commissionRules.fields.getByName('filial')) {
      commissionRules.fields.add(new TextField({ name: 'filial' }))
    }

    commissionRules.addIndex('idx_commission_rules_role', false, 'role', '')
    commissionRules.addIndex('idx_commission_rules_active', false, 'active', '')

    app.save(commissionRules)
  },
  (app) => {
    try {
      const commissionRules = app.findCollectionByNameOrId('commission_rules')
      commissionRules.removeIndex('idx_commission_rules_role')
      commissionRules.removeIndex('idx_commission_rules_active')
      const roleField = commissionRules.fields.getByName('role')
      if (roleField) commissionRules.fields.remove(roleField)
      const percentageField = commissionRules.fields.getByName('percentage')
      if (percentageField) commissionRules.fields.remove(percentageField)
      const splitPercentageField = commissionRules.fields.getByName('split_percentage')
      if (splitPercentageField) commissionRules.fields.remove(splitPercentageField)
      const priorityField = commissionRules.fields.getByName('priority')
      if (priorityField) commissionRules.fields.remove(priorityField)
      const applicabilityField = commissionRules.fields.getByName('applicability')
      if (applicabilityField) commissionRules.fields.remove(applicabilityField)
      const activeField = commissionRules.fields.getByName('active')
      if (activeField) commissionRules.fields.remove(activeField)
      app.save(commissionRules)
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

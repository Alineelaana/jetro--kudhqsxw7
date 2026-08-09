migrate(
  (app) => {
    const networks = new Collection({
      name: 'client_networks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'corporate_name', type: 'text' },
        { name: 'responsible', type: 'text' },
        { name: 'contact_phone', type: 'text' },
        { name: 'contact_email', type: 'text' },
        { name: 'main_buyer', type: 'text' },
        { name: 'manager_rca', type: 'text' },
        { name: 'observations', type: 'text' },
        { name: 'status', type: 'select', values: ['Ativa', 'Inativa'], maxSelect: 1 },
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        { name: 'credit_limit', type: 'text' },
        {
          name: 'restriction_policy',
          type: 'select',
          values: ['alert', 'block', 'require_approval'],
          maxSelect: 1,
        },
        { name: 'member_ids', type: 'json' },
        { name: 'member_history', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_client_networks_status ON client_networks (status)'],
    })
    app.save(networks)

    var partners = app.findCollectionByNameOrId('partners')
    var networksColId = app.findCollectionByNameOrId('client_networks').id

    if (!partners.fields.getByName('network_id')) {
      partners.fields.add(
        new RelationField({
          name: 'network_id',
          collectionId: networksColId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    var textFields = [
      'network_restriction_source',
      'network_restriction_origin_partner_id',
      'network_restriction_origin_name',
      'network_restriction_origin_cnpj',
      'network_restriction_origin_amount',
      'network_restriction_origin_days',
    ]
    for (var i = 0; i < textFields.length; i++) {
      if (!partners.fields.getByName(textFields[i])) {
        partners.fields.add(new TextField({ name: textFields[i] }))
      }
    }
    partners.addIndex('idx_partners_network', false, 'network_id', '')
    app.save(partners)

    try {
      app.findFirstRecordByData('client_networks', 'name', 'Rede Supermercados Alfa')
    } catch (_) {
      var networkCol = app.findCollectionByNameOrId('client_networks')
      var network = new Record(networkCol)
      network.set('name', 'Rede Supermercados Alfa')
      network.set('corporate_name', 'Supermercados Alfa Ltda')
      network.set('responsible', 'João Alfa')
      network.set('contact_phone', '(27) 3333-4444')
      network.set('status', 'Ativa')
      network.set('restriction_policy', 'block')
      network.set('credit_limit', '100000')
      network.set('member_ids', [])
      network.set('member_history', [])
      app.save(network)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('client_networks'))
    } catch (_) {}
    try {
      var partners = app.findCollectionByNameOrId('partners')
      partners.removeIndex('idx_partners_network')
      var fields = [
        'network_id',
        'network_restriction_source',
        'network_restriction_origin_partner_id',
        'network_restriction_origin_name',
        'network_restriction_origin_cnpj',
        'network_restriction_origin_amount',
        'network_restriction_origin_days',
      ]
      for (var i = 0; i < fields.length; i++) {
        var f = partners.fields.getByName(fields[i])
        if (f) partners.fields.remove(f)
      }
      app.save(partners)
    } catch (_) {}
  },
)

migrate(
  (app) => {
    const partnerTypes = new Collection({
      name: 'partner_types',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.role != ""',
      updateRule: '@request.auth.role != ""',
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_partner_types_name ON partner_types (name)'],
    })
    app.save(partnerTypes)

    const partners = new Collection({
      name: 'partners',
      type: 'base',
      listRule: 'client_id = @request.auth.id || @request.auth.role != ""',
      viewRule: 'client_id = @request.auth.id || @request.auth.role != ""',
      createRule: '@request.auth.role != ""',
      updateRule: '@request.auth.role != ""',
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        { name: 'partner_type', type: 'text', required: true },
        { name: 'person_type', type: 'select', required: true, values: ['PF', 'PJ'], maxSelect: 1 },
        { name: 'active', type: 'bool' },
        { name: 'blocked', type: 'bool' },
        { name: 'observations', type: 'text' },
        { name: 'financial_history', type: 'json' },
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'reference_point', type: 'text' },
        { name: 'cep', type: 'text' },
        { name: 'full_name', type: 'text' },
        { name: 'cpf', type: 'text' },
        { name: 'birth_date', type: 'text' },
        { name: 'marital_status', type: 'text' },
        { name: 'profession', type: 'text' },
        { name: 'monthly_income', type: 'text' },
        { name: 'rg_cnh', type: 'text' },
        { name: 'company_name', type: 'text' },
        { name: 'trade_name', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'state_registration', type: 'text' },
        {
          name: 'income_proof',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        {
          name: 'address_proof',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        {
          name: 'rg_cnh_doc',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        {
          name: 'attachments',
          type: 'file',
          maxSelect: 10,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        { name: 'client_id', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_partners_type ON partners (partner_type)',
        'CREATE INDEX idx_partners_cpf ON partners (cpf)',
        'CREATE INDEX idx_partners_cnpj ON partners (cnpj)',
        'CREATE INDEX idx_partners_email ON partners (email)',
        'CREATE INDEX idx_partners_active ON partners (active)',
      ],
    })
    app.save(partners)

    const clients = new Collection({
      name: 'clients',
      type: 'auth',
      listRule: 'id = @request.auth.id || @request.auth.role != ""',
      viewRule: 'id = @request.auth.id || @request.auth.role != ""',
      createRule: '@request.auth.role != ""',
      updateRule: '@request.auth.role != ""',
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        { name: 'partner_id', type: 'text' },
        { name: 'name', type: 'text' },
      ],
    })
    app.save(clients)

    var ptCol = app.findCollectionByNameOrId('partner_types')
    var defaults = ['Cliente', 'Fornecedor', 'Usuário']
    for (var i = 0; i < defaults.length; i++) {
      try {
        app.findFirstRecordByData('partner_types', 'name', defaults[i])
      } catch (_) {
        var rec = new Record(ptCol)
        rec.set('name', defaults[i])
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('partner_types'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('partners'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('clients'))
    } catch (_) {}
  },
)

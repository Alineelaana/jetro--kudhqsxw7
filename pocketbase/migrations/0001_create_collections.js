migrate(
  (app) => {
    const settings = new Collection({
      name: 'settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_settings_key ON settings (key)'],
    })
    app.save(settings)

    const formFields = new Collection({
      name: 'budget_form_fields',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['text', 'email', 'tel', 'textarea', 'select'],
          maxSelect: 1,
        },
        { name: 'options', type: 'json' },
        { name: 'required', type: 'bool' },
        { name: 'order', type: 'number', onlyInt: true },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_budget_form_fields_order ON budget_form_fields (order)'],
    })
    app.save(formFields)

    const budgetRequests = new Collection({
      name: 'budget_requests',
      type: 'base',
      listRule: null,
      viewRule: null,
      createRule: '',
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'data', type: 'json' },
        { name: 'client_name', type: 'text' },
        { name: 'client_email', type: 'text' },
        { name: 'client_phone', type: 'text' },
        { name: 'service', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_budget_requests_client_email ON budget_requests (client_email)',
        'CREATE INDEX idx_budget_requests_service ON budget_requests (service)',
        'CREATE INDEX idx_budget_requests_created ON budget_requests (created)',
      ],
    })
    app.save(budgetRequests)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('settings'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('budget_form_fields'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('budget_requests'))
    } catch (_) {}
  },
)

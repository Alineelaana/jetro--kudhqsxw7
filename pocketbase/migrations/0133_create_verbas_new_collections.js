migrate(
  (app) => {
    var accountsId = app.findCollectionByNameOrId('supplier_allowance_accounts').id
    var agreementsId = app.findCollectionByNameOrId('supplier_allowance_agreements').id
    var movementsId = app.findCollectionByNameOrId('supplier_allowance_movements').id
    var partnersId = app.findCollectionByNameOrId('partners').id
    var usersId = '_pb_users_auth_'

    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    var rules = {
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'SUP'",
    }

    app.save(
      new Collection({
        name: 'supplier_allowance_trade_expenses',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: [
          { name: 'account', type: 'relation', collectionId: accountsId, maxSelect: 1 },
          { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
          { name: 'movement', type: 'relation', collectionId: movementsId, maxSelect: 1 },
          { name: 'supplier', type: 'relation', collectionId: partnersId, maxSelect: 1 },
          { name: 'description', type: 'text', required: true },
          { name: 'amount', type: 'text', required: true },
          { name: 'expense_date', type: 'text' },
          {
            name: 'category',
            type: 'select',
            values: ['marketing', 'pdv', 'evento', 'midia', 'logistica', 'producao', 'outros'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['pendente', 'aprovado', 'rejeitado', 'pago'],
            maxSelect: 1,
          },
          { name: 'document_number', type: 'text' },
          { name: 'cost_center_code', type: 'text' },
          { name: 'observations', type: 'text' },
          { name: 'responsible_user', type: 'text' },
        ].concat(ad),
        indexes: [
          'CREATE INDEX idx_sate_account ON supplier_allowance_trade_expenses (account)',
          'CREATE INDEX idx_sate_agreement ON supplier_allowance_trade_expenses (agreement)',
          'CREATE INDEX idx_sate_status ON supplier_allowance_trade_expenses (status)',
          'CREATE INDEX idx_sate_category ON supplier_allowance_trade_expenses (category)',
          'CREATE INDEX idx_sate_created ON supplier_allowance_trade_expenses (created)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'supplier_allowance_adhoc_credits',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: [
          { name: 'account', type: 'relation', collectionId: accountsId, maxSelect: 1 },
          { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
          { name: 'movement', type: 'relation', collectionId: movementsId, maxSelect: 1 },
          { name: 'supplier', type: 'relation', collectionId: partnersId, maxSelect: 1 },
          { name: 'description', type: 'text', required: true },
          { name: 'amount', type: 'text', required: true },
          { name: 'credit_date', type: 'text' },
          { name: 'reason', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['pendente', 'aprovado', 'rejeitado', 'creditado'],
            maxSelect: 1,
          },
          { name: 'approved_by', type: 'text' },
          { name: 'approved_at', type: 'text' },
          { name: 'observations', type: 'text' },
          { name: 'responsible_user', type: 'text' },
        ].concat(ad),
        indexes: [
          'CREATE INDEX idx_sac2_account ON supplier_allowance_adhoc_credits (account)',
          'CREATE INDEX idx_sac2_agreement ON supplier_allowance_adhoc_credits (agreement)',
          'CREATE INDEX idx_sac2_status ON supplier_allowance_adhoc_credits (status)',
          'CREATE INDEX idx_sac2_created ON supplier_allowance_adhoc_credits (created)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'supplier_allowance_documents',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: [
          { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
          { name: 'account', type: 'relation', collectionId: accountsId, maxSelect: 1 },
          { name: 'movement', type: 'relation', collectionId: movementsId, maxSelect: 1 },
          { name: 'name', type: 'text', required: true },
          {
            name: 'file',
            type: 'file',
            maxSelect: 5,
            maxSize: 10485760,
            mimeTypes: [
              'image/jpeg',
              'image/png',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
          },
          { name: 'type', type: 'text' },
          { name: 'size', type: 'number' },
          { name: 'alt_text', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'uploaded_by', type: 'text' },
        ].concat(ad),
        indexes: [
          'CREATE INDEX idx_sad_agreement ON supplier_allowance_documents (agreement)',
          'CREATE INDEX idx_sad_account ON supplier_allowance_documents (account)',
          'CREATE INDEX idx_sad_movement ON supplier_allowance_documents (movement)',
          'CREATE INDEX idx_sad_created ON supplier_allowance_documents (created)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'supplier_allowance_report_versions',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: [
          { name: 'report_type', type: 'text', required: true },
          { name: 'version_number', type: 'number', required: true },
          { name: 'version_data', type: 'json' },
          { name: 'label', type: 'text' },
          { name: 'published_by', type: 'relation', collectionId: usersId, maxSelect: 1 },
          { name: 'published_at', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'publicado', 'arquivado'],
            maxSelect: 1,
          },
          { name: 'description', type: 'text' },
        ].concat(ad),
        indexes: [
          'CREATE INDEX idx_sarv_type ON supplier_allowance_report_versions (report_type)',
          'CREATE INDEX idx_sarv_version ON supplier_allowance_report_versions (version_number)',
          'CREATE INDEX idx_sarv_status ON supplier_allowance_report_versions (status)',
          'CREATE INDEX idx_sarv_created ON supplier_allowance_report_versions (created)',
        ],
      }),
    )

    console.log('0133: Verbas new collections created')
  },
  (app) => {
    var cols = [
      'supplier_allowance_report_versions',
      'supplier_allowance_documents',
      'supplier_allowance_adhoc_credits',
      'supplier_allowance_trade_expenses',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

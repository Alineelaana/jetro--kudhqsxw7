migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'purchase_requests',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'request_number', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'requester', type: 'text' },
          { name: 'requester_id', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'cost_center', type: 'text' },
          { name: 'department', type: 'text' },
          { name: 'priority', type: 'text' },
          { name: 'justification', type: 'text' },
          { name: 'items', type: 'json' },
          { name: 'history', type: 'json' },
          { name: 'responsible_user', type: 'text' },
          {
            name: 'attachments',
            type: 'file',
            maxSelect: 10,
            maxSize: 10485760,
            mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_purchase_requests_status ON purchase_requests (status)',
          'CREATE INDEX idx_purchase_requests_created ON purchase_requests (created)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'quotations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'quotation_number', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'request_id', type: 'text' },
          { name: 'request_number', type: 'text' },
          { name: 'supplier_quotes', type: 'json' },
          { name: 'winning_supplier_id', type: 'text' },
          { name: 'winning_supplier_name', type: 'text' },
          { name: 'highlights', type: 'json' },
          { name: 'history', type: 'json' },
          { name: 'responsible_user', type: 'text' },
          {
            name: 'attachments',
            type: 'file',
            maxSelect: 10,
            maxSize: 10485760,
            mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_quotations_status ON quotations (status)',
          'CREATE INDEX idx_quotations_created ON quotations (created)',
          'CREATE INDEX idx_quotations_request_id ON quotations (request_id)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'purchase_orders',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'order_number', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'supplier_id', type: 'text' },
          { name: 'supplier_name', type: 'text' },
          { name: 'quotation_id', type: 'text' },
          { name: 'request_id', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'buyer', type: 'text' },
          { name: 'buyer_id', type: 'text' },
          { name: 'payment_condition', type: 'text' },
          { name: 'payment_method', type: 'text' },
          { name: 'delivery_forecast', type: 'text' },
          { name: 'items', type: 'json' },
          { name: 'freight', type: 'text' },
          { name: 'discounts', type: 'text' },
          { name: 'other_expenses', type: 'text' },
          { name: 'products_value', type: 'text' },
          { name: 'total_value', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'responsible_user', type: 'text' },
          {
            name: 'attachments',
            type: 'file',
            maxSelect: 10,
            maxSize: 10485760,
            mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_purchase_orders_status ON purchase_orders (status)',
          'CREATE INDEX idx_purchase_orders_created ON purchase_orders (created)',
          'CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders (supplier_id)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'purchase_invoices',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'invoice_number', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'order_id', type: 'text' },
          { name: 'order_number', type: 'text' },
          { name: 'supplier_id', type: 'text' },
          { name: 'supplier_name', type: 'text' },
          { name: 'invoice_key', type: 'text' },
          { name: 'invoice_doc_number', type: 'text' },
          { name: 'invoice_series', type: 'text' },
          { name: 'items', type: 'json' },
          { name: 'total_value', type: 'text' },
          { name: 'divergences', type: 'json' },
          { name: 'stock_updated', type: 'bool' },
          { name: 'cost_updated', type: 'bool' },
          { name: 'payable_generated', type: 'bool' },
          { name: 'history', type: 'json' },
          { name: 'responsible_user', type: 'text' },
          {
            name: 'attachments',
            type: 'file',
            maxSelect: 10,
            maxSize: 10485760,
            mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_purchase_invoices_status ON purchase_invoices (status)',
          'CREATE INDEX idx_purchase_invoices_created ON purchase_invoices (created)',
          'CREATE INDEX idx_purchase_invoices_order_id ON purchase_invoices (order_id)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'purchase_returns',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'return_number', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'supplier_id', type: 'text' },
          { name: 'supplier_name', type: 'text' },
          { name: 'order_id', type: 'text' },
          { name: 'order_number', type: 'text' },
          { name: 'invoice_id', type: 'text' },
          { name: 'invoice_doc_number', type: 'text' },
          { name: 'reason', type: 'text' },
          { name: 'items', type: 'json' },
          { name: 'total_value', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'responsible_user', type: 'text' },
          {
            name: 'attachments',
            type: 'file',
            maxSelect: 10,
            maxSize: 10485760,
            mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_purchase_returns_status ON purchase_returns (status)',
          'CREATE INDEX idx_purchase_returns_created ON purchase_returns (created)',
          'CREATE INDEX idx_purchase_returns_supplier_id ON purchase_returns (supplier_id)',
        ],
      }),
    )

    var settingsCol = app.findCollectionByNameOrId('settings')
    var seeds = [
      { key: 'purchase_approval_threshold', value: '5000' },
      { key: 'purchase_request_sequence', value: '0' },
      { key: 'purchase_quotation_sequence', value: '0' },
      { key: 'purchase_order_sequence', value: '0' },
      { key: 'purchase_invoice_sequence', value: '0' },
      { key: 'purchase_return_sequence', value: '0' },
    ]
    for (var i = 0; i < seeds.length; i++) {
      try {
        app.findFirstRecordByData('settings', 'key', seeds[i].key)
      } catch (_) {
        var rec = new Record(settingsCol)
        rec.set('key', seeds[i].key)
        rec.set('value', seeds[i].value)
        app.save(rec)
      }
    }
  },
  (app) => {
    var cols = [
      'purchase_requests',
      'quotations',
      'purchase_orders',
      'purchase_invoices',
      'purchase_returns',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

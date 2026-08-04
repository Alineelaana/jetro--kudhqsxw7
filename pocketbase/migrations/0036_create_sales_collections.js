migrate(
  (app) => {
    const R = "@request.auth.id != ''"
    const A = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]
    const T = (n) => ({ name: n, type: 'text' })
    const J = (n) => ({ name: n, type: 'json' })
    const B = (n) => ({ name: n, type: 'bool' })

    const getOrCreate = (name, fields, indexes) => {
      try {
        return app.findCollectionByNameOrId(name)
      } catch (_) {}
      const col = new Collection({
        name,
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [...fields, ...A],
        indexes,
      })
      app.save(col)
      return col
    }

    const soCol = getOrCreate(
      'sales_orders',
      [
        T('order_number'),
        T('status'),
        T('client_id'),
        T('client_name'),
        T('salesperson_id'),
        T('salesperson_name'),
        T('price_table_id'),
        T('payment_condition'),
        T('payment_method'),
        T('delivery_date'),
        T('carrier_name'),
        T('freight_type'),
        T('delivery_address'),
        T('cost_center'),
        T('internal_notes'),
        T('fiscal_notes'),
        J('items'),
        T('gross_value'),
        T('discount_value'),
        T('addition_value'),
        T('freight_value'),
        T('insurance_value'),
        T('other_expenses'),
        T('tax_value'),
        T('total_value'),
        T('company'),
        T('branch'),
        J('history'),
        T('responsible_user'),
        J('approval_data'),
        B('stock_reserved'),
      ],
      [
        'CREATE INDEX idx_sales_orders_status ON sales_orders (status)',
        'CREATE INDEX idx_sales_orders_created ON sales_orders (created DESC)',
        'CREATE INDEX idx_sales_orders_client ON sales_orders (client_name)',
      ],
    )

    getOrCreate(
      'sales_invoices',
      [
        T('invoice_number'),
        T('status'),
        T('order_id'),
        T('order_number'),
        T('client_id'),
        T('client_name'),
        T('invoice_date'),
        J('items'),
        T('total_value'),
        T('carrier_name'),
        T('volumes'),
        T('gross_weight'),
        T('net_weight'),
        T('freight_value'),
        T('other_expenses'),
        T('company'),
        T('branch'),
        J('history'),
        T('responsible_user'),
      ],
      [
        'CREATE INDEX idx_sales_invoices_status ON sales_invoices (status)',
        'CREATE INDEX idx_sales_invoices_created ON sales_invoices (created DESC)',
      ],
    )

    getOrCreate(
      'nfe_records',
      [
        T('nfe_number'),
        T('status'),
        T('invoice_id'),
        T('order_id'),
        T('client_name'),
        T('company'),
        T('nature_of_operation'),
        T('cfop'),
        J('items'),
        T('total_value'),
        T('tax_value'),
        T('carrier_name'),
        T('volumes'),
        J('billing_data'),
        T('additional_info'),
        T('xml_url'),
        T('danfe_url'),
        T('authorization_protocol'),
        T('rejection_reason'),
        J('history'),
        T('responsible_user'),
      ],
      [
        'CREATE INDEX idx_nfe_records_status ON nfe_records (status)',
        'CREATE INDEX idx_nfe_records_created ON nfe_records (created DESC)',
      ],
    )

    getOrCreate(
      'nfce_records',
      [
        T('nfce_number'),
        T('status'),
        T('consumer_name'),
        T('consumer_doc'),
        J('items'),
        T('total_value'),
        T('discount_value'),
        T('payment_method'),
        T('change_amount'),
        T('xml_url'),
        T('receipt_url'),
        T('authorization_protocol'),
        T('company'),
        T('branch'),
        T('responsible_user'),
      ],
      [
        'CREATE INDEX idx_nfce_records_status ON nfce_records (status)',
        'CREATE INDEX idx_nfce_records_created ON nfce_records (created DESC)',
      ],
    )

    getOrCreate(
      'sales_returns',
      [
        T('return_number'),
        T('status'),
        T('order_id'),
        T('order_number'),
        T('invoice_id'),
        T('invoice_number'),
        T('client_name'),
        J('items'),
        T('reason'),
        T('product_condition'),
        T('destination'),
        T('responsible_analyst'),
        T('observations'),
        T('financial_treatment'),
        T('total_value'),
        J('history'),
        T('responsible_user'),
      ],
      [
        'CREATE INDEX idx_sales_returns_status ON sales_returns (status)',
        'CREATE INDEX idx_sales_returns_created ON sales_returns (created DESC)',
      ],
    )

    const samples = [
      {
        order_number: 'PED-0001',
        status: 'Aprovado',
        client_name: 'Transportadora Capixaba Ltda',
        salesperson_name: 'João Silva',
        payment_condition: '30/60 Dias',
        payment_method: 'Boleto',
        delivery_date: '2026-08-15',
        items: [
          {
            code: 'P001',
            product: 'Caixa Papelão 40x30x30',
            quantity: '100',
            unit_price: '3.50',
            total: '350.00',
          },
        ],
        gross_value: '350.00',
        discount_value: '0',
        addition_value: '0',
        freight_value: '50.00',
        insurance_value: '0',
        other_expenses: '0',
        tax_value: '59.50',
        total_value: '459.50',
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: 'Admin',
        stock_reserved: true,
        history: [],
      },
      {
        order_number: 'PED-0002',
        status: 'Aguardando Faturamento',
        client_name: 'Distribuidora ES S.A.',
        salesperson_name: 'Maria Santos',
        payment_condition: 'À Vista',
        payment_method: 'PIX',
        delivery_date: '2026-08-10',
        items: [
          {
            code: 'P002',
            product: 'Papel Sulfite A4 Resma',
            quantity: '50',
            unit_price: '25.00',
            total: '1250.00',
          },
        ],
        gross_value: '1250.00',
        discount_value: '125.00',
        addition_value: '0',
        freight_value: '30.00',
        insurance_value: '10.00',
        other_expenses: '0',
        tax_value: '195.50',
        total_value: '1360.50',
        company: 'Velora Log',
        branch: 'Filial Vitória',
        responsible_user: 'Admin',
        stock_reserved: false,
        history: [],
      },
      {
        order_number: 'PED-0003',
        status: 'Faturado Totalmente',
        client_name: 'Logística Rápida ME',
        salesperson_name: 'João Silva',
        payment_condition: '30 Dias',
        payment_method: 'Transferência',
        delivery_date: '2026-08-05',
        items: [
          {
            code: 'P003',
            product: 'Etiqueta Adesiva 100x50mm',
            quantity: '1000',
            unit_price: '0.15',
            total: '150.00',
          },
        ],
        gross_value: '150.00',
        discount_value: '0',
        addition_value: '0',
        freight_value: '15.00',
        insurance_value: '0',
        other_expenses: '0',
        tax_value: '25.50',
        total_value: '190.50',
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: 'Admin',
        stock_reserved: false,
        history: [],
      },
    ]
    for (const s of samples) {
      try {
        app.findFirstRecordByData('sales_orders', 'order_number', s.order_number)
      } catch (_) {
        const r = new Record(soCol)
        for (const [k, v] of Object.entries(s)) r.set(k, v)
        app.save(r)
      }
    }
  },
  (app) => {
    for (const n of [
      'sales_returns',
      'nfce_records',
      'nfe_records',
      'sales_invoices',
      'sales_orders',
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (_) {}
    }
  },
)

migrate(
  (app) => {
    const partnersId = app.findCollectionByNameOrId('partners').id
    const productsId = app.findCollectionByNameOrId('products').id
    const centrosCustoId = app.findCollectionByNameOrId('centros_custo').id
    const purchaseOrdersId = app.findCollectionByNameOrId('purchase_orders').id

    let financialPayablesId = ''
    try {
      financialPayablesId = app.findCollectionByNameOrId('financial_payables').id
    } catch (_) {}

    let promotionRulesId = ''
    try {
      promotionRulesId = app.findCollectionByNameOrId('promotion_rules').id
    } catch (_) {}

    const ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    const rules = {
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'SUP'",
    }

    const agreementsCol = new Collection({
      name: 'supplier_allowance_agreements',
      type: 'base',
      listRule: rules.listRule,
      viewRule: rules.viewRule,
      createRule: rules.createRule,
      updateRule: rules.updateRule,
      deleteRule: rules.deleteRule,
      fields: [
        {
          name: 'supplier',
          type: 'relation',
          collectionId: partnersId,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'agreement_type',
          type: 'select',
          values: ['rebate', 'verba_mercado', 'coop', 'bonificacao', 'outros'],
          maxSelect: 1,
          required: true,
        },
        { name: 'value', type: 'text' },
        { name: 'percent', type: 'text' },
        { name: 'currency', type: 'text' },
        { name: 'start_date', type: 'text' },
        { name: 'end_date', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['rascunho', 'ativo', 'pausado', 'encerrado', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'workflow_state', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'responsible_user', type: 'text' },
        { name: 'approval_data', type: 'json' },
        { name: 'history', type: 'json' },
        { name: 'observations', type: 'text' },
      ].concat(ad),
      indexes: [
        'CREATE INDEX idx_saa_supplier ON supplier_allowance_agreements (supplier)',
        'CREATE INDEX idx_saa_status ON supplier_allowance_agreements (status)',
        'CREATE INDEX idx_saa_type ON supplier_allowance_agreements (agreement_type)',
      ],
    })
    app.save(agreementsCol)
    const agreementsId = agreementsCol.id

    const accountsCol = new Collection({
      name: 'supplier_allowance_accounts',
      type: 'base',
      listRule: rules.listRule,
      viewRule: rules.viewRule,
      createRule: rules.createRule,
      updateRule: rules.updateRule,
      deleteRule: rules.deleteRule,
      fields: [
        {
          name: 'supplier',
          type: 'relation',
          collectionId: partnersId,
          maxSelect: 1,
          required: true,
        },
        { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
        { name: 'opening_balance', type: 'text' },
        { name: 'current_balance', type: 'text' },
        { name: 'accrued_total', type: 'text' },
        { name: 'settled_total', type: 'text' },
        { name: 'consumed_total', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
      ].concat(ad),
      indexes: [
        'CREATE INDEX idx_sac_supplier ON supplier_allowance_accounts (supplier)',
        'CREATE INDEX idx_sac_agreement ON supplier_allowance_accounts (agreement)',
      ],
    })
    app.save(accountsCol)
    const accountsId = accountsCol.id

    app.save(
      new Collection({
        name: 'supplier_allowance_movements',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: [
          {
            name: 'account',
            type: 'relation',
            collectionId: accountsId,
            maxSelect: 1,
            required: true,
          },
          { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
          {
            name: 'movement_type',
            type: 'select',
            values: ['apuracao', 'apropriacao', 'consumo', 'lancamento', 'estorno', 'ajuste'],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'direction',
            type: 'select',
            values: ['credito', 'debito'],
            maxSelect: 1,
            required: true,
          },
          { name: 'value', type: 'text', required: true },
          { name: 'currency', type: 'text' },
          { name: 'document_type', type: 'text' },
          { name: 'document_number', type: 'text' },
          { name: 'related_purchase', type: 'text' },
          { name: 'related_invoice', type: 'text' },
          { name: 'related_payable', type: 'text' },
          { name: 'related_promotion', type: 'text' },
          { name: 'user', type: 'text' },
          { name: 'timestamp', type: 'text' },
          { name: 'workflow_state', type: 'text' },
          { name: 'source', type: 'text' },
          { name: 'observations', type: 'text' },
        ].concat(ad),
        indexes: [
          'CREATE INDEX idx_sam_account ON supplier_allowance_movements (account)',
          'CREATE INDEX idx_sam_agreement ON supplier_allowance_movements (agreement)',
          'CREATE INDEX idx_sam_type ON supplier_allowance_movements (movement_type)',
          'CREATE INDEX idx_sam_created ON supplier_allowance_movements (created)',
        ],
      }),
    )

    const accrualsCol = new Collection({
      name: 'supplier_allowance_accruals',
      type: 'base',
      listRule: rules.listRule,
      viewRule: rules.viewRule,
      createRule: rules.createRule,
      updateRule: rules.updateRule,
      deleteRule: rules.deleteRule,
      fields: [
        {
          name: 'account',
          type: 'relation',
          collectionId: accountsId,
          maxSelect: 1,
          required: true,
        },
        { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
        { name: 'supplier', type: 'relation', collectionId: partnersId, maxSelect: 1 },
        { name: 'competence_period', type: 'text', required: true },
        { name: 'volume', type: 'text' },
        { name: 'mix', type: 'text' },
        { name: 'margin', type: 'text' },
        { name: 'earned_value', type: 'text' },
        { name: 'calculation_breakdown', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['rascunho', 'pendente', 'aprovado', 'rejeitado', 'liquidado'],
          maxSelect: 1,
        },
        { name: 'approved_by', type: 'text' },
        { name: 'approved_at', type: 'text' },
        { name: 'history', type: 'json' },
      ].concat(ad),
      indexes: [
        'CREATE INDEX idx_saar_account ON supplier_allowance_accruals (account)',
        'CREATE INDEX idx_saar_agreement ON supplier_allowance_accruals (agreement)',
        'CREATE INDEX idx_saar_period ON supplier_allowance_accruals (competence_period)',
        'CREATE INDEX idx_saar_status ON supplier_allowance_accruals (status)',
      ],
    })
    app.save(accrualsCol)
    const accrualsId = accrualsCol.id

    const appropriationsFields = [
      { name: 'account', type: 'relation', collectionId: accountsId, maxSelect: 1, required: true },
      { name: 'accrual', type: 'relation', collectionId: accrualsId, maxSelect: 1 },
      { name: 'product', type: 'relation', collectionId: productsId, maxSelect: 1 },
    ]
    if (centrosCustoId) {
      appropriationsFields.push({
        name: 'cost_center',
        type: 'relation',
        collectionId: centrosCustoId,
        maxSelect: 1,
      })
    } else {
      appropriationsFields.push({ name: 'cost_center', type: 'text' })
    }
    appropriationsFields.push({ name: 'allocated_value', type: 'text', required: true })
    appropriationsFields.push({ name: 'reason', type: 'text' })
    appropriationsFields.push({
      name: 'status',
      type: 'select',
      values: ['pendente', 'aprovado', 'rejeitado'],
      maxSelect: 1,
    })

    app.save(
      new Collection({
        name: 'supplier_allowance_appropriations',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: appropriationsFields.concat(ad),
        indexes: [],
      }),
    )

    const settlementFields = [
      { name: 'account', type: 'relation', collectionId: accountsId, maxSelect: 1, required: true },
      { name: 'accrual', type: 'relation', collectionId: accrualsId, maxSelect: 1 },
      { name: 'supplier', type: 'relation', collectionId: partnersId, maxSelect: 1 },
      { name: 'settled_value', type: 'text', required: true },
      {
        name: 'settlement_type',
        type: 'select',
        values: ['credito', 'abatimento', 'nota_credito', 'pagamento'],
        maxSelect: 1,
      },
    ]
    if (financialPayablesId) {
      settlementFields.push({
        name: 'payable',
        type: 'relation',
        collectionId: financialPayablesId,
        maxSelect: 1,
      })
    } else {
      settlementFields.push({ name: 'payable', type: 'text' })
    }
    settlementFields.push({
      name: 'purchase_credit',
      type: 'relation',
      collectionId: purchaseOrdersId,
      maxSelect: 1,
    })
    settlementFields.push({ name: 'workflow_state', type: 'text' })
    settlementFields.push({
      name: 'status',
      type: 'select',
      values: ['rascunho', 'pendente', 'aprovado', 'rejeitado', 'liquidado', 'cancelado'],
      maxSelect: 1,
    })
    settlementFields.push({ name: 'history', type: 'json' })

    app.save(
      new Collection({
        name: 'supplier_allowance_settlements',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: settlementFields.concat(ad),
        indexes: [],
      }),
    )

    const consumptionFields = [
      { name: 'account', type: 'relation', collectionId: accountsId, maxSelect: 1, required: true },
      { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
      { name: 'product', type: 'relation', collectionId: productsId, maxSelect: 1 },
      { name: 'purchase', type: 'relation', collectionId: purchaseOrdersId, maxSelect: 1 },
    ]
    if (promotionRulesId) {
      consumptionFields.push({
        name: 'promotion',
        type: 'relation',
        collectionId: promotionRulesId,
        maxSelect: 1,
      })
    } else {
      consumptionFields.push({ name: 'promotion', type: 'text' })
    }
    consumptionFields.push({ name: 'consumed_value', type: 'text', required: true })
    consumptionFields.push({ name: 'reason', type: 'text' })
    consumptionFields.push({
      name: 'status',
      type: 'select',
      values: ['pendente', 'aprovado', 'rejeitado'],
      maxSelect: 1,
    })

    app.save(
      new Collection({
        name: 'supplier_allowance_consumptions',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: consumptionFields.concat(ad),
        indexes: [],
      }),
    )

    console.log('0112: Supplier Allowance collections created')
  },
  (app) => {
    const cols = [
      'supplier_allowance_consumptions',
      'supplier_allowance_settlements',
      'supplier_allowance_appropriations',
      'supplier_allowance_accruals',
      'supplier_allowance_movements',
      'supplier_allowance_accounts',
      'supplier_allowance_agreements',
    ]
    for (let i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

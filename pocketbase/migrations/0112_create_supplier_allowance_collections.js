migrate(
  (app) => {
    var partnersId = app.findCollectionByNameOrId('partners').id
    var productsId = app.findCollectionByNameOrId('products').id
    var centrosCustoId = app.findCollectionByNameOrId('centros_custo').id
    var financialPayablesId = app.findCollectionByNameOrId('financial_payables').id
    var purchaseOrdersId = app.findCollectionByNameOrId('purchase_orders').id
    var promotionRulesId = app.findCollectionByNameOrId('promotion_rules').id

    function authRules() {
      return {
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
      }
    }
    function ad() {
      return [
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ]
    }

    var agreementsCol = new Collection(
      Object.assign(
        {
          name: 'supplier_allowance_agreements',
          type: 'base',
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
          ].concat(ad()),
          indexes: [
            'CREATE INDEX idx_saa_supplier ON supplier_allowance_agreements (supplier)',
            'CREATE INDEX idx_saa_status ON supplier_allowance_agreements (status)',
            'CREATE INDEX idx_saa_type ON supplier_allowance_agreements (agreement_type)',
          ],
        },
        authRules(),
      ),
    )
    app.save(agreementsCol)
    var agreementsId = agreementsCol.id

    var accountsCol = new Collection(
      Object.assign(
        {
          name: 'supplier_allowance_accounts',
          type: 'base',
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
          ].concat(ad()),
          indexes: [
            'CREATE INDEX idx_sac_supplier ON supplier_allowance_accounts (supplier)',
            'CREATE INDEX idx_sac_agreement ON supplier_allowance_accounts (agreement)',
          ],
        },
        authRules(),
      ),
    )
    app.save(accountsCol)
    var accountsId = accountsCol.id

    app.save(
      new Collection(
        Object.assign(
          {
            name: 'supplier_allowance_movements',
            type: 'base',
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
            ].concat(ad()),
            indexes: [
              'CREATE INDEX idx_sam_account ON supplier_allowance_movements (account)',
              'CREATE INDEX idx_sam_agreement ON supplier_allowance_movements (agreement)',
              'CREATE INDEX idx_sam_type ON supplier_allowance_movements (movement_type)',
              'CREATE INDEX idx_sam_created ON supplier_allowance_movements (created)',
            ],
          },
          authRules(),
        ),
      ),
    )

    var accrualsCol = new Collection(
      Object.assign(
        {
          name: 'supplier_allowance_accruals',
          type: 'base',
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
          ].concat(ad()),
          indexes: [
            'CREATE INDEX idx_saar_account ON supplier_allowance_accruals (account)',
            'CREATE INDEX idx_saar_agreement ON supplier_allowance_accruals (agreement)',
            'CREATE INDEX idx_saar_period ON supplier_allowance_accruals (competence_period)',
            'CREATE INDEX idx_saar_status ON supplier_allowance_accruals (status)',
          ],
        },
        authRules(),
      ),
    )
    app.save(accrualsCol)
    var accrualsId = accrualsCol.id

    app.save(
      new Collection(
        Object.assign(
          {
            name: 'supplier_allowance_appropriations',
            type: 'base',
            fields: [
              {
                name: 'account',
                type: 'relation',
                collectionId: accountsId,
                maxSelect: 1,
                required: true,
              },
              { name: 'accrual', type: 'relation', collectionId: accrualsId, maxSelect: 1 },
              { name: 'product', type: 'relation', collectionId: productsId, maxSelect: 1 },
              { name: 'cost_center', type: 'relation', collectionId: centrosCustoId, maxSelect: 1 },
              { name: 'allocated_value', type: 'text', required: true },
              { name: 'reason', type: 'text' },
              {
                name: 'status',
                type: 'select',
                values: ['pendente', 'aprovado', 'rejeitado'],
                maxSelect: 1,
              },
            ].concat(ad()),
            indexes: [
              'CREATE INDEX idx_sap_account ON supplier_allowance_appropriations (account)',
              'CREATE INDEX idx_sap_accrual ON supplier_allowance_appropriations (accrual)',
            ],
          },
          authRules(),
        ),
      ),
    )

    app.save(
      new Collection(
        Object.assign(
          {
            name: 'supplier_allowance_settlements',
            type: 'base',
            fields: [
              {
                name: 'account',
                type: 'relation',
                collectionId: accountsId,
                maxSelect: 1,
                required: true,
              },
              { name: 'accrual', type: 'relation', collectionId: accrualsId, maxSelect: 1 },
              { name: 'supplier', type: 'relation', collectionId: partnersId, maxSelect: 1 },
              { name: 'settled_value', type: 'text', required: true },
              {
                name: 'settlement_type',
                type: 'select',
                values: ['credito', 'abatimento', 'nota_credito', 'pagamento'],
                maxSelect: 1,
              },
              {
                name: 'payable',
                type: 'relation',
                collectionId: financialPayablesId,
                maxSelect: 1,
              },
              {
                name: 'purchase_credit',
                type: 'relation',
                collectionId: purchaseOrdersId,
                maxSelect: 1,
              },
              { name: 'workflow_state', type: 'text' },
              {
                name: 'status',
                type: 'select',
                values: ['rascunho', 'pendente', 'aprovado', 'rejeitado', 'liquidado', 'cancelado'],
                maxSelect: 1,
              },
              { name: 'history', type: 'json' },
            ].concat(ad()),
            indexes: [
              'CREATE INDEX idx_sas_account ON supplier_allowance_settlements (account)',
              'CREATE INDEX idx_sas_accrual ON supplier_allowance_settlements (accrual)',
              'CREATE INDEX idx_sas_supplier ON supplier_allowance_settlements (supplier)',
              'CREATE INDEX idx_sas_status ON supplier_allowance_settlements (status)',
            ],
          },
          authRules(),
        ),
      ),
    )

    app.save(
      new Collection(
        Object.assign(
          {
            name: 'supplier_allowance_consumptions',
            type: 'base',
            fields: [
              {
                name: 'account',
                type: 'relation',
                collectionId: accountsId,
                maxSelect: 1,
                required: true,
              },
              { name: 'agreement', type: 'relation', collectionId: agreementsId, maxSelect: 1 },
              { name: 'product', type: 'relation', collectionId: productsId, maxSelect: 1 },
              { name: 'purchase', type: 'relation', collectionId: purchaseOrdersId, maxSelect: 1 },
              { name: 'promotion', type: 'relation', collectionId: promotionRulesId, maxSelect: 1 },
              { name: 'consumed_value', type: 'text', required: true },
              { name: 'reason', type: 'text' },
              {
                name: 'status',
                type: 'select',
                values: ['pendente', 'aprovado', 'rejeitado'],
                maxSelect: 1,
              },
            ].concat(ad()),
            indexes: [
              'CREATE INDEX idx_sac2_account ON supplier_allowance_consumptions (account)',
              'CREATE INDEX idx_sac2_agreement ON supplier_allowance_consumptions (agreement)',
              'CREATE INDEX idx_sac2_status ON supplier_allowance_consumptions (status)',
            ],
          },
          authRules(),
        ),
      ),
    )

    console.log('0112: Supplier Allowance collections created')
  },
  (app) => {
    var cols = [
      'supplier_allowance_consumptions',
      'supplier_allowance_settlements',
      'supplier_allowance_appropriations',
      'supplier_allowance_accruals',
      'supplier_allowance_movements',
      'supplier_allowance_accounts',
      'supplier_allowance_agreements',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

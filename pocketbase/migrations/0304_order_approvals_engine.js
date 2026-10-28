migrate(
  (app) => {
    // 0304_order_approvals_engine.js
    // 1. Coleção order_approval_tiers (Alçadas por Perfil/Cargo)
    try {
      const existingTiers = app.findCollectionByNameOrId('order_approval_tiers')
      if (!existingTiers) {
        const tiersCol = new Collection({
          name: 'order_approval_tiers',
          type: 'base',
          listRule: '@request.auth.id != ""',
          viewRule: '@request.auth.id != ""',
          createRule: '@request.auth.role = "SUP"',
          updateRule: '@request.auth.role = "SUP"',
          deleteRule: '@request.auth.role = "SUP"',
          fields: [
            { name: 'role_or_profile', type: 'text', required: true },
            { name: 'name', type: 'text', required: true },
            {
              name: 'order_type',
              type: 'select',
              options: { values: ['ambos', 'venda', 'compra'], maxSelect: 1 },
            },
            { name: 'max_value_direct', type: 'number' },
            { name: 'max_value_approval', type: 'number' },
            { name: 'max_discount_percent', type: 'number' },
            { name: 'can_approve_credit_override', type: 'bool' },
            { name: 'active', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
        })
        app.save(tiersCol)

        // Seed das alçadas padrão de mercado do HURAM
        const seedTiers = [
          {
            role_or_profile: 'Vendedor',
            name: 'Vendedor / Operador',
            order_type: 'venda',
            max_value_direct: 5000,
            max_value_approval: 0,
            max_discount_percent: 5,
            can_approve_credit_override: false,
            active: true,
          },
          {
            role_or_profile: 'SDR',
            name: 'Pré-vendas / SDR',
            order_type: 'venda',
            max_value_direct: 2000,
            max_value_approval: 0,
            max_discount_percent: 3,
            can_approve_credit_override: false,
            active: true,
          },
          {
            role_or_profile: 'PADRAO',
            name: 'Comprador / Gestão Operacional',
            order_type: 'ambos',
            max_value_direct: 5000,
            max_value_approval: 15000,
            max_discount_percent: 8,
            can_approve_credit_override: false,
            active: true,
          },
          {
            role_or_profile: 'COMERCIAL',
            name: 'Gerência Comercial',
            order_type: 'venda',
            max_value_direct: 25000,
            max_value_approval: 50000,
            max_discount_percent: 15,
            can_approve_credit_override: false,
            active: true,
          },
          {
            role_or_profile: 'FINANCEIRO',
            name: 'Controladoria & Financeiro',
            order_type: 'ambos',
            max_value_direct: 50000,
            max_value_approval: 100000,
            max_discount_percent: 20,
            can_approve_credit_override: true,
            active: true,
          },
          {
            role_or_profile: 'SUP',
            name: 'Diretoria Executiva / Superusuário',
            order_type: 'ambos',
            max_value_direct: 999999999,
            max_value_approval: 999999999,
            max_discount_percent: 100,
            can_approve_credit_override: true,
            active: true,
          },
        ]

        seedTiers.forEach((tier) => {
          const rec = new Record(tiersCol)
          rec.set('role_or_profile', tier.role_or_profile)
          rec.set('name', tier.name)
          rec.set('order_type', tier.order_type)
          rec.set('max_value_direct', tier.max_value_direct)
          rec.set('max_value_approval', tier.max_value_approval)
          rec.set('max_discount_percent', tier.max_discount_percent)
          rec.set('can_approve_credit_override', tier.can_approve_credit_override)
          rec.set('active', tier.active)
          app.save(rec)
        })
      }
    } catch (e) {
      console.log('Tier collection error or already exists:', e)
    }

    // 2. Coleção order_approval_records (Trilha Auditável de Aprovação/Rejeição)
    try {
      const existingRecords = app.findCollectionByNameOrId('order_approval_records')
      if (!existingRecords) {
        const recordsCol = new Collection({
          name: 'order_approval_records',
          type: 'base',
          listRule: '@request.auth.id != ""',
          viewRule: '@request.auth.id != ""',
          createRule: '@request.auth.id != ""',
          updateRule: '@request.auth.role = "SUP"',
          deleteRule: '@request.auth.role = "SUP"',
          fields: [
            { name: 'order_id', type: 'text', required: true },
            { name: 'order_number', type: 'text' },
            {
              name: 'order_type',
              type: 'select',
              options: { values: ['venda', 'compra'], maxSelect: 1 },
              required: true,
            },
            { name: 'company', type: 'text' },
            { name: 'branch', type: 'text' },
            { name: 'total_value', type: 'number' },
            { name: 'requester_id', type: 'text' },
            { name: 'requester_name', type: 'text' },
            { name: 'approver_id', type: 'text' },
            { name: 'approver_name', type: 'text' },
            {
              name: 'action',
              type: 'select',
              options: { values: ['solicitado', 'aprovado', 'rejeitado'], maxSelect: 1 },
              required: true,
            },
            { name: 'tier_level', type: 'text' },
            { name: 'reason', type: 'text' },
            { name: 'notes', type: 'text' },
            { name: 'approval_reasons', type: 'json' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
        })
        app.save(recordsCol)
      }
    } catch (e) {
      console.log('Record collection error or already exists:', e)
    }

    // 3. Garantir campos aditivos nas coleções sales_orders e purchase_orders caso ainda faltem
    const salesCol = app.findCollectionByNameOrId('sales_orders')
    if (salesCol) {
      try {
        salesCol.fields.add(new JSONField({ name: 'approval_trail' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'approved_by' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'approved_at' }))
      } catch (_) {}
      app.save(salesCol)
    }

    const purchaseCol = app.findCollectionByNameOrId('purchase_orders')
    if (purchaseCol) {
      try {
        purchaseCol.fields.add(new JSONField({ name: 'approval_trail' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'approved_by' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'approved_at' }))
      } catch (_) {}
      app.save(purchaseCol)
    }
  },
  (app) => {
    // Reversão segura
  },
)

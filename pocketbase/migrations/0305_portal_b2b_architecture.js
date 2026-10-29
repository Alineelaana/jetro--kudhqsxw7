migrate(
  (app) => {
    // 0305_portal_b2b_architecture.js
    // 1. Atualizar coleção partners com campos B2B e governança de crédito
    const partnersCol = app.findCollectionByNameOrId('partners')
    if (partnersCol) {
      try {
        partnersCol.fields.add(new BoolField({ name: 'exibir_limite_credito' }))
      } catch (_) {}
      try {
        partnersCol.fields.add(new BoolField({ name: 'b2b_ativo' }))
      } catch (_) {}
      try {
        partnersCol.fields.add(new TextField({ name: 'b2b_status' })) // pendente, ativo, bloqueado
      } catch (_) {}
      try {
        partnersCol.fields.add(new TextField({ name: 'empresa_id' }))
      } catch (_) {}
      try {
        partnersCol.fields.add(new TextField({ name: 'filial_id' }))
      } catch (_) {}
      app.save(partnersCol)
    }

    // 2. Atualizar coleção clients (auth) com campos de identificação e status B2B
    const clientsCol = app.findCollectionByNameOrId('clients')
    if (clientsCol) {
      try {
        clientsCol.fields.add(new BoolField({ name: 'active' }))
      } catch (_) {}
      try {
        clientsCol.fields.add(new TextField({ name: 'empresa_id' }))
      } catch (_) {}
      try {
        clientsCol.fields.add(new TextField({ name: 'filial_id' }))
      } catch (_) {}
      try {
        clientsCol.fields.add(new TextField({ name: 'cnpj' }))
      } catch (_) {}
      try {
        clientsCol.fields.add(new TextField({ name: 'phone' }))
      } catch (_) {}
      try {
        clientsCol.fields.add(new TextField({ name: 'company_name' }))
      } catch (_) {}
      try {
        clientsCol.fields.add(new TextField({ name: 'status' })) // pendente, ativo, bloqueado
      } catch (_) {}
      app.save(clientsCol)
    }

    // 3. Atualizar coleção products com flag B2B e quantidade mínima
    const productsCol = app.findCollectionByNameOrId('products')
    if (productsCol) {
      try {
        productsCol.fields.add(new BoolField({ name: 'liberado_b2b' }))
      } catch (_) {}
      try {
        productsCol.fields.add(new NumberField({ name: 'b2b_min_order_qty' }))
      } catch (_) {}
      app.save(productsCol)
    }

    // 4. Atualizar sales_orders com identificador de canal B2B e dados do cliente
    const salesCol = app.findCollectionByNameOrId('sales_orders')
    if (salesCol) {
      try {
        salesCol.fields.add(new TextField({ name: 'b2b_client_id' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'empresa_id' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'filial_id' }))
      } catch (_) {}
      app.save(salesCol)
    }

    // 5. Coleção b2b_audit_trail (Trilha de auditoria das ações do portal B2B)
    try {
      const existingB2bAudit = app.findCollectionByNameOrId('b2b_audit_trail')
      if (!existingB2bAudit) {
        const auditB2b = new Collection({
          name: 'b2b_audit_trail',
          type: 'base',
          listRule: '@request.auth.id != ""',
          viewRule: '@request.auth.id != ""',
          createRule: '@request.auth.id != ""',
          updateRule: '@request.auth.role = "SUP"',
          deleteRule: '@request.auth.role = "SUP"',
          fields: [
            { name: 'client_id', type: 'text' },
            { name: 'partner_id', type: 'text' },
            { name: 'user_name', type: 'text' },
            { name: 'cnpj', type: 'text' },
            { name: 'action', type: 'text', required: true }, // signup, login, order_placed, profile_view, status_change
            { name: 'details', type: 'text' },
            { name: 'metadata', type: 'json' },
            { name: 'ip_address', type: 'text' },
            { name: 'user_agent', type: 'text' },
            { name: 'empresa_id', type: 'text' },
            { name: 'filial_id', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
        })
        app.save(auditB2b)
      }
    } catch (e) {
      console.log('b2b_audit_trail notice:', e)
    }
  },
  (app) => {
    // Reversão segura
  },
)

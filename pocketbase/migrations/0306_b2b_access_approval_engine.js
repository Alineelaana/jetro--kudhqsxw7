migrate(
  (app) => {
    // 0306_b2b_access_approval_engine.js
    // 1. Coleção b2b_access_requests para controle de self-service e aprovação de vínculos B2B
    try {
      const existing = app.findCollectionByNameOrId('b2b_access_requests')
      if (!existing) {
        const col = new Collection({
          name: 'b2b_access_requests',
          type: 'base',
          listRule: '@request.auth.id != ""',
          viewRule: '@request.auth.id != ""',
          createRule: '', // Público para permitir self-service signup
          updateRule: '@request.auth.id != ""',
          deleteRule: '@request.auth.role = "SUP"',
          fields: [
            { name: 'client_id', type: 'text' },
            { name: 'partner_id', type: 'text' },
            { name: 'company_name', type: 'text', required: true },
            { name: 'trade_name', type: 'text' },
            { name: 'cnpj', type: 'text', required: true },
            { name: 'email', type: 'text', required: true },
            { name: 'phone', type: 'text' },
            { name: 'contact_name', type: 'text' },
            { name: 'status', type: 'text', required: true }, // 'pendente', 'aprovado', 'rejeitado'
            { name: 'rejection_reason', type: 'text' },
            { name: 'approved_by', type: 'text' },
            { name: 'approved_at', type: 'text' },
            { name: 'notes', type: 'text' },
            { name: 'empresa_id', type: 'text' },
            { name: 'filial_id', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
        })
        app.save(col)
      }
    } catch (e) {
      console.log('0306 b2b_access_requests notice:', e)
    }

    // 2. Garantir fields b2b na collection partners
    const partnersCol = app.findCollectionByNameOrId('partners')
    if (partnersCol) {
      try {
        partnersCol.fields.add(new BoolField({ name: 'exibir_limite_credito' }))
      } catch (_) {}
      try {
        partnersCol.fields.add(new BoolField({ name: 'b2b_ativo' }))
      } catch (_) {}
      try {
        partnersCol.fields.add(new TextField({ name: 'b2b_status' }))
      } catch (_) {}
      app.save(partnersCol)
    }

    // 3. Garantir fields em clients
    const clientsCol = app.findCollectionByNameOrId('clients')
    if (clientsCol) {
      try {
        clientsCol.fields.add(new TextField({ name: 'status' })) // 'pendente', 'ativo', 'bloqueado', 'rejeitado'
      } catch (_) {}
      try {
        clientsCol.fields.add(new BoolField({ name: 'active' }))
      } catch (_) {}
      app.save(clientsCol)
    }
  },
  (app) => {
    // Reversão segura
  },
)

migrate(
  (app) => {
    // 1. Atualizar campos da coleção sales_orders
    const salesOrders = app.findCollectionByNameOrId('sales_orders')

    const fieldsToAdd = [
      { name: 'integration_order_number', type: 'text' },
      { name: 'operation_type', type: 'text' }, // Bonificação, Devolução, Pedido de Venda, etc.
      { name: 'cfop', type: 'text' },
      { name: 'top_code', type: 'text' },
      { name: 'is_balance', type: 'bool' }, // É saldo
      { name: 'generated_balance', type: 'bool' }, // Pedido gerou saldo
      { name: 'original_order_id', type: 'text' }, // Vínculo com pedido original
      { name: 'original_order_number', type: 'text' },
      { name: 'balance_order_id', type: 'text' }, // Vínculo com pedido de saldo gerado
      { name: 'balance_order_number', type: 'text' },
      { name: 'cut_items', type: 'json' }, // Itens cortados com qtd pedida, atendida, cortada, motivo
      { name: 'team', type: 'text' }, // Equipe comercial
      { name: 'rca_id', type: 'text' },
      { name: 'rca_name', type: 'text' },
      { name: 'customer_group', type: 'text' }, // Grupo/Segmento do cliente (ex: Farmácias, Supermercados)
      { name: 'customer_cnpj', type: 'text' },
      { name: 'customer_city', type: 'text' },
      { name: 'customer_district', type: 'text' },
      { name: 'customer_address', type: 'text' },
      { name: 'is_invoiced', type: 'bool' }, // Somente faturados
      { name: 'invoiced_at', type: 'text' },
    ]

    for (let i = 0; i < fieldsToAdd.length; i++) {
      const f = fieldsToAdd[i]
      if (!salesOrders.fields.getByName(f.name)) {
        if (f.type === 'text') salesOrders.fields.add(new TextField({ name: f.name }))
        else if (f.type === 'bool') salesOrders.fields.add(new BoolField({ name: f.name }))
        else if (f.type === 'json') salesOrders.fields.add(new JSONField({ name: f.name }))
      }
    }

    salesOrders.addIndex('idx_sales_orders_is_balance', false, 'is_balance', '')
    salesOrders.addIndex('idx_sales_orders_gen_balance', false, 'generated_balance', '')
    salesOrders.addIndex('idx_sales_orders_integ', false, 'integration_order_number', '')
    salesOrders.addIndex('idx_sales_orders_op_type', false, 'operation_type', '')

    app.save(salesOrders)

    // 2. Coleção de parâmetros para Tipos de Operação (TOP / CFOP)
    let opTypes
    try {
      opTypes = app.findCollectionByNameOrId('order_operation_types')
    } catch (_) {
      opTypes = new Collection({
        name: 'order_operation_types',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'code', type: 'text', required: true },
          { name: 'name', type: 'text', required: true },
          { name: 'cfop', type: 'text' },
          { name: 'cgo', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_order_op_code ON order_operation_types (code)'],
      })
      app.save(opTypes)

      // Seeds de tipos de operação
      const defaultOps = [
        { code: 'TOP-01', name: 'Pedido de Venda', cfop: '5102', cgo: '100', active: true },
        { code: 'TOP-02', name: 'Bonificação', cfop: '5910', cgo: '102', active: true },
        { code: 'TOP-03', name: 'Devolução', cfop: '1202', cgo: '105', active: true },
        { code: 'TOP-04', name: 'Remessa de Troca', cfop: '5949', cgo: '108', active: true },
        { code: 'TOP-05', name: 'Remessa para Brindes', cfop: '5910', cgo: '109', active: true },
        { code: 'TOP-06', name: 'Consumo Próprio', cfop: '5556', cgo: '110', active: true },
        { code: 'TOP-07', name: 'Remessa em Demonstração', cfop: '5912', cgo: '112', active: true },
      ]
      for (let k = 0; k < defaultOps.length; k++) {
        const rec = new Record(opTypes)
        rec.set('code', defaultOps[k].code)
        rec.set('name', defaultOps[k].name)
        rec.set('cfop', defaultOps[k].cfop)
        rec.set('cgo', defaultOps[k].cgo)
        rec.set('active', defaultOps[k].active)
        app.save(rec)
      }
    }

    // 3. Coleção de Canais de Origem do Pedido
    let orderChannels
    try {
      orderChannels = app.findCollectionByNameOrId('order_sales_channels')
    } catch (_) {
      orderChannels = new Collection({
        name: 'order_sales_channels',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'code', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_order_channel_name ON order_sales_channels (name)'],
      })
      app.save(orderChannels)

      const defaultChannels = [
        { name: 'B2B', code: 'B2B', active: true },
        { name: 'Aplicativo Força de Vendas', code: 'AFV', active: true },
        { name: 'ERP', code: 'ERP', active: true },
        { name: 'Compra Agora', code: 'CA', active: true },
        { name: 'Clone de Pedido', code: 'CLONE', active: true },
        { name: 'Pedido de Saldo', code: 'SALDO', active: true },
      ]
      for (let m = 0; m < defaultChannels.length; m++) {
        const rChan = new Record(orderChannels)
        rChan.set('name', defaultChannels[m].name)
        rChan.set('code', defaultChannels[m].code)
        rChan.set('active', defaultChannels[m].active)
        app.save(rChan)
      }
    }

    // 4. Coleção de Mapeamento CNAE -> Segmento/Grupo de Clientes
    let customerGroups
    try {
      customerGroups = app.findCollectionByNameOrId('customer_cnae_groups')
    } catch (_) {
      customerGroups = new Collection({
        name: 'customer_cnae_groups',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true }, // ex: Farmácias / Drogarias
          { name: 'cnae_patterns', type: 'json' }, // ["4771-7", "47.71-7/01", ...]
          { name: 'description', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_customer_cnae_group_name ON customer_cnae_groups (name)',
        ],
      })
      app.save(customerGroups)

      const defaultGroups = [
        {
          name: 'Farmácias / Drogarias',
          cnae_patterns: ['4771', '47.71-7/01', '47.71-7/02', '4771-7'],
          active: true,
        },
        {
          name: 'Academias / Fitness',
          cnae_patterns: ['9313', '93.13-1/00', '9313-1'],
          active: true,
        },
        {
          name: 'Supermercados / Hipermercados',
          cnae_patterns: ['4711', '4712', '47.11-3/01', '47.11-3/02', '47.12-1/00'],
          active: true,
        },
        { name: 'Lojas de Conveniência', cnae_patterns: ['4729', '47.29-6/99'], active: true },
        {
          name: 'Distribuidores / Atacadistas',
          cnae_patterns: ['4639', '4637', '46.39-7/01'],
          active: true,
        },
        {
          name: 'Hospitalar / Clínicas',
          cnae_patterns: ['8610', '86.10-1/01', '8630'],
          active: true,
        },
      ]
      for (let g = 0; g < defaultGroups.length; g++) {
        const rGroup = new Record(customerGroups)
        rGroup.set('name', defaultGroups[g].name)
        rGroup.set('cnae_patterns', defaultGroups[g].cnae_patterns)
        rGroup.set('active', defaultGroups[g].active)
        app.save(rGroup)
      }
    }

    // 5. Coleção de Status de Pedidos (Parametrizáveis)
    let orderStatusCol
    try {
      orderStatusCol = app.findCollectionByNameOrId('order_statuses')
    } catch (_) {
      orderStatusCol = new Collection({
        name: 'order_statuses',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'color', type: 'text' },
          { name: 'order', type: 'number' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_order_status_name ON order_statuses (name)'],
      })
      app.save(orderStatusCol)

      const requiredStatuses = [
        { name: 'Liberado', color: 'emerald', order: 1 },
        { name: 'Pendente', color: 'amber', order: 2 },
        { name: 'Separação', color: 'blue', order: 3 },
        { name: 'Roteirização', color: 'indigo', order: 4 },
        { name: 'Montado', color: 'purple', order: 5 },
        { name: 'Faturado', color: 'emerald', order: 6 },
        { name: 'Bloqueado', color: 'red', order: 7 },
        { name: 'Suspenso', color: 'orange', order: 8 },
        { name: 'Cancelado', color: 'gray', order: 9 },
        { name: 'Saiu para entrega', color: 'cyan', order: 10 },
        { name: 'Entregue', color: 'green', order: 11 },
        { name: 'Bloqueado aguardando pagamento PIX', color: 'yellow', order: 12 },
        { name: 'Restrito', color: 'rose', order: 13 },
      ]
      for (let s = 0; s < requiredStatuses.length; s++) {
        const rSt = new Record(orderStatusCol)
        rSt.set('name', requiredStatuses[s].name)
        rSt.set('color', requiredStatuses[s].color)
        rSt.set('order', requiredStatuses[s].order)
        rSt.set('active', true)
        app.save(rSt)
      }
    }

    // 6. Coleção de Equipes Comerciais
    let commercialTeams
    try {
      commercialTeams = app.findCollectionByNameOrId('commercial_teams')
    } catch (_) {
      commercialTeams = new Collection({
        name: 'commercial_teams',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'code', type: 'text' },
          { name: 'region', type: 'text' },
          { name: 'supervisor', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_comm_teams_name ON commercial_teams (name)'],
      })
      app.save(commercialTeams)

      const defaultTeams = [
        { name: 'ES ESPIRITO SANTO', code: 'EQ-ES', region: 'Espírito Santo', active: true },
        { name: 'GRANDE VITORIA', code: 'EQ-GV', region: 'Grande Vitória', active: true },
        { name: 'NORTE CAPIXABA', code: 'EQ-NC', region: 'Norte ES', active: true },
        { name: 'SUL CAPIXABA', code: 'EQ-SC', region: 'Sul ES', active: true },
      ]
      for (let t = 0; t < defaultTeams.length; t++) {
        const rTeam = new Record(commercialTeams)
        rTeam.set('name', defaultTeams[t].name)
        rTeam.set('code', defaultTeams[t].code)
        rTeam.set('region', defaultTeams[t].region)
        rTeam.set('active', defaultTeams[t].active)
        app.save(rTeam)
      }
    }

    // 7. Campo cnae no parceiro/cliente se não existir
    const partners = app.findCollectionByNameOrId('partners')
    if (!partners.fields.getByName('cnae')) {
      partners.fields.add(new TextField({ name: 'cnae' }))
      app.save(partners)
    }
    if (!partners.fields.getByName('team')) {
      partners.fields.add(new TextField({ name: 'team' }))
      app.save(partners)
    }
  },
  (app) => {
    // rollback opcional seguro
  },
)

migrate(
  (app) => {
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    var rules = {
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
    }

    // 1. Criar coleção audit_alert_rules caso não exista
    try {
      app.findCollectionByNameOrId('audit_alert_rules')
    } catch (_) {
      var col = new Collection({
        name: 'audit_alert_rules',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: [
          { name: 'name', type: 'text', required: true },
          {
            name: 'category',
            type: 'select',
            values: ['estoque_wms', 'bonificacao', 'vendas', 'verbas', 'personalizado'],
            maxSelect: 1,
            required: true,
          },
          { name: 'code', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'is_custom', type: 'bool' },
          { name: 'active', type: 'bool' },
          {
            name: 'severity',
            type: 'select',
            values: ['info', 'warning', 'critical'],
            maxSelect: 1,
          },
          {
            name: 'threshold_type',
            type: 'select',
            values: ['valor_moeda', 'percentual', 'quantidade', 'dias', 'evento'],
            maxSelect: 1,
          },
          { name: 'threshold_value', type: 'number' },
          { name: 'recipient_user_ids', type: 'json' },
          { name: 'custom_condition', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'created_by', type: 'text' },
        ].concat(ad),
        indexes: [
          'CREATE INDEX idx_aar_code ON audit_alert_rules (code)',
          'CREATE INDEX idx_aar_category ON audit_alert_rules (category)',
          'CREATE INDEX idx_aar_active ON audit_alert_rules (active)',
        ],
      })
      app.save(col)
    }

    // 2. Adicionar campos complementares em audit_alerts se não existirem
    try {
      var alertsCol = app.findCollectionByNameOrId('audit_alerts')
      var extraFields = [
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        { name: 'action', type: 'text' },
        { name: 'responsible_user', type: 'text' },
        { name: 'reason', type: 'text' },
        { name: 'rule_id', type: 'text' },
        { name: 'metadata', type: 'json' },
      ]
      for (var i = 0; i < extraFields.length; i++) {
        var f = extraFields[i]
        if (!alertsCol.fields.getByName(f.name)) {
          if (f.type === 'text') alertsCol.fields.add(new TextField({ name: f.name }))
          else if (f.type === 'json') alertsCol.fields.add(new JSONField({ name: f.name }))
        }
      }
      app.save(alertsCol)
    } catch (e) {
      console.log('Aviso ao atualizar audit_alerts:', e)
    }

    // 3. Seed das regras padrão solicitadas pelo dono do sistema
    try {
      var rulesCol = app.findCollectionByNameOrId('audit_alert_rules')
      var defaultRules = [
        {
          name: 'Movimentações Suspeitas no Estoque',
          category: 'estoque_wms',
          code: 'stock_suspicious',
          description:
            'Notifica movimentações de estoque anômalas, sem documento de origem ou fora de rotina operacional.',
          is_custom: false,
          active: true,
          severity: 'critical',
          threshold_type: 'evento',
          threshold_value: 1,
        },
        {
          name: 'Divergências ou Movimentações Suspeitas em Inventários',
          category: 'estoque_wms',
          code: 'inventory_divergence',
          description:
            'Notifica quando contagens ou fechamentos de inventário apresentam divergências críticas.',
          is_custom: false,
          active: true,
          severity: 'critical',
          threshold_type: 'quantidade',
          threshold_value: 5,
        },
        {
          name: 'Alterações de Quantidades de Produtos',
          category: 'estoque_wms',
          code: 'product_qty_change',
          description:
            'Alerta quando o saldo ou cadastro de quantidades do produto sofre alteração direta.',
          is_custom: false,
          active: true,
          severity: 'warning',
          threshold_type: 'quantidade',
          threshold_value: 10,
        },
        {
          name: 'Ajustes Manuais de Estoque',
          category: 'estoque_wms',
          code: 'manual_stock_adjust',
          description:
            'Alerta toda vez que um ajuste de estoque manual ou sem aprovação for lançado.',
          is_custom: false,
          active: true,
          severity: 'warning',
          threshold_type: 'evento',
          threshold_value: 1,
        },
        {
          name: 'Movimentações e Operações Suspeitas no WMS',
          category: 'estoque_wms',
          code: 'wms_suspicious',
          description:
            'Alerta ocorrências, separações ou conferências anômalas identificadas no fluxo WMS.',
          is_custom: false,
          active: true,
          severity: 'critical',
          threshold_type: 'evento',
          threshold_value: 1,
        },
        {
          name: 'NF de Perda Superior ao Limite em R$',
          category: 'estoque_wms',
          code: 'nf_loss_limit',
          description:
            'Emissão de notas fiscais de perda com valor superior ao teto financeiro estipulado.',
          is_custom: false,
          active: true,
          severity: 'critical',
          threshold_type: 'valor_moeda',
          threshold_value: 5000,
        },
        {
          name: 'Bonificação Excedendo % do Pedido de Venda',
          category: 'bonificacao',
          code: 'bonificacao_pct_limit',
          description:
            'Gera alerta quando o valor da bonificação ultrapassar X% do valor do pedido de venda correspondente.',
          is_custom: false,
          active: true,
          severity: 'warning',
          threshold_type: 'percentual',
          threshold_value: 20,
        },
        {
          name: 'Limite Diário de Pedidos de Bonificação',
          category: 'bonificacao',
          code: 'bonificacao_daily_qty',
          description:
            'Gera alerta quando a quantidade de pedidos de bonificação no mesmo dia ultrapassar X pedidos.',
          is_custom: false,
          active: true,
          severity: 'warning',
          threshold_type: 'quantidade',
          threshold_value: 5,
        },
        {
          name: 'Pedido de Venda com Margem Inferior ao Mínimo',
          category: 'vendas',
          code: 'sales_min_margin',
          description:
            'Alerta quando um pedido de venda apresentar margem de lucro estimada inferior ao percentual mínimo estipulado.',
          is_custom: false,
          active: true,
          severity: 'critical',
          threshold_type: 'percentual',
          threshold_value: 15,
        },
        {
          name: 'Verba Comercial sem Acordo Assinado Anexado',
          category: 'verbas',
          code: 'verba_doc_pending',
          description:
            'Alerta quando uma verba comercial for aberta e após X dias o documento assinado pelo fornecedor ainda não constar.',
          is_custom: false,
          active: true,
          severity: 'critical',
          threshold_type: 'dias',
          threshold_value: 15,
        },
      ]

      for (var d = 0; d < defaultRules.length; d++) {
        var def = defaultRules[d]
        var existing = null
        try {
          existing = app.findFirstRecordByFilter('audit_alert_rules', 'code = "' + def.code + '"')
        } catch (_) {}
        if (!existing) {
          var rec = new Record(rulesCol)
          rec.set('name', def.name)
          rec.set('category', def.category)
          rec.set('code', def.code)
          rec.set('description', def.description)
          rec.set('is_custom', def.is_custom)
          rec.set('active', def.active)
          rec.set('severity', def.severity)
          rec.set('threshold_type', def.threshold_type)
          rec.set('threshold_value', def.threshold_value)
          rec.set('recipient_user_ids', [])
          rec.set('custom_condition', '')
          rec.set('empresa', '')
          rec.set('filial', '')
          rec.set('created_by', 'system')
          app.save(rec)
        }
      }
    } catch (e2) {
      console.log('Aviso ao criar seeds de audit_alert_rules:', e2)
    }

    console.log('0283: audit_alert_rules criada com sucesso')
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('audit_alert_rules')
      app.delete(col)
    } catch (_) {}
  },
)

onRecordAfterCreateSuccess(
  (e) => {
    var collection = e.record.collectionName
    var WORKFLOW_MAP = {
      sales_orders: {
        key: 'sales_order',
        entityNumberField: 'order_number',
        summaryField: 'client_name',
      },
      purchase_orders: {
        key: 'purchase_order',
        entityNumberField: 'order_number',
        summaryField: 'supplier_name',
      },
      pricing_approvals: {
        key: 'price_change',
        entityNumberField: '',
        summaryField: 'product_name',
      },
    }
    var cfg = WORKFLOW_MAP[collection]
    if (!cfg) return e.next()

    try {
      var authUser = e.request ? null : null
      var userId = ''
      var userName = ''
      try {
        var rec = $app.findRecordById('_pb_users_auth_', e.record.getString('created_by') || '')
        if (rec) {
          userId = rec.id
          userName = rec.getString('name') || ''
        }
      } catch (_) {}

      var entityNumber = cfg.entityNumberField ? e.record.getString(cfg.entityNumberField) : ''
      var summary = e.record.getString(cfg.summaryField) || e.record.id

      var STEPS = {
        sales_order: [
          { key: 'create', label: 'Criacao do Pedido', role: 'PADRAO', action: 'execute' },
          { key: 'approve', label: 'Aprovacao Comercial', role: 'COMERCIAL', action: 'approve' },
          {
            key: 'financial',
            label: 'Liberacao Financeira',
            role: 'FINANCEIRO',
            action: 'approve',
          },
          { key: 'production', label: 'Producao', role: 'PADRAO', action: 'execute' },
          { key: 'expedition', label: 'Expedicao', role: 'PADRAO', action: 'execute' },
          { key: 'fiscal', label: 'Fiscal', role: 'FINANCEIRO', action: 'execute' },
          { key: 'close', label: 'Fechamento', role: 'SUP', action: 'close' },
        ],
        purchase_order: [
          { key: 'create', label: 'Criacao do Pedido', role: 'PADRAO', action: 'execute' },
          { key: 'approve', label: 'Aprovacao', role: 'COMERCIAL', action: 'approve' },
          {
            key: 'financial',
            label: 'Liberacao Financeira',
            role: 'FINANCEIRO',
            action: 'approve',
          },
          { key: 'receive', label: 'Recebimento', role: 'PADRAO', action: 'execute' },
          { key: 'close', label: 'Fechamento', role: 'SUP', action: 'close' },
        ],
        price_change: [
          { key: 'request', label: 'Solicitacao', role: 'PADRAO', action: 'execute' },
          { key: 'approve', label: 'Aprovacao', role: 'COMERCIAL', action: 'approve' },
          { key: 'close', label: 'Aplicacao', role: 'SUP', action: 'close' },
        ],
      }

      var steps = STEPS[cfg.key] || []
      if (steps.length === 0) return e.next()

      var wfCol = $app.findCollectionByNameOrId('platform_workflows')
      var wf = new Record(wfCol)
      wf.set('workflow_key', cfg.key)
      wf.set('entity_type', collection)
      wf.set('entity_id', e.record.id)
      wf.set('entity_number', entityNumber)
      wf.set('entity_summary', summary)
      wf.set('current_step', steps[0].key)
      wf.set('steps', steps)
      wf.set('history', [
        {
          step: steps[0].key,
          action: 'created',
          user: userName,
          date: new Date().toISOString(),
          notes: 'Workflow iniciado',
        },
      ])
      wf.set('status', 'in_progress')
      wf.set('assigned_role', steps[0].role)
      wf.set('module_origin', collection)
      wf.set('company', e.record.getString('company') || '')
      wf.set('branch', e.record.getString('branch') || '')
      wf.set('created_by', userId)
      wf.set('created_by_name', userName)
      $app.save(wf)

      $app
        .logger()
        .info(
          'platform workflow created',
          'collection',
          collection,
          'entity',
          e.record.id,
          'workflow_key',
          cfg.key,
        )
    } catch (err) {
      $app.logger().error('platform workflow creation failed', 'error', String(err))
    }

    return e.next()
  },
  'sales_orders',
  'purchase_orders',
  'pricing_approvals',
)

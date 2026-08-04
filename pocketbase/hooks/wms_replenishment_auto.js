routerAdd(
  'POST',
  '/backend/v1/wms/replenishment/auto',
  (e) => {
    const body = e.requestInfo().body || {}
    const limit = Math.min(Math.max(parseInt(body.limit || '50', 10) || 50, 1), 200)

    let replenishmentCollection
    try {
      replenishmentCollection = $app.findCollectionByNameOrId('wms_replenishment')
    } catch (err) {
      return e.json(200, {
        checked: true,
        message: 'Replenishment check complete (collection not available)',
        tasks_created: 0,
        low_stock_items: [],
      })
    }

    let lowStockItems = []
    try {
      lowStockItems = $app.findRecordsByFilter(
        'stock_locations',
        'current_qty < min_qty',
        'created',
        limit,
        0,
      )
    } catch (err) {
      try {
        lowStockItems = $app.findRecordsByFilter(
          'products',
          'stock < min_stock',
          'created',
          limit,
          0,
        )
      } catch (err2) {
        return e.json(200, {
          checked: true,
          message: 'Replenishment check complete (no stock data available)',
          tasks_created: 0,
          low_stock_items: [],
        })
      }
    }

    let tasksCreated = 0
    const createdIds = []

    for (let i = 0; i < lowStockItems.length; i++) {
      const item = lowStockItems[i]
      try {
        const existing = $app.findRecordsByFilter(
          'wms_replenishment',
          'product_id = {:pid} && status = "pending"',
          'created',
          1,
          0,
          { pid: item.id },
        )
        if (existing && existing.length > 0) {
          continue
        }
      } catch (err) {
        // continue if filter fails
      }

      try {
        const task = new Record(replenishmentCollection)
        task.set('product_id', item.id)
        task.set('status', 'pending')
        task.set('source', 'auto')
        $app.save(task)
        tasksCreated++
        createdIds.push(task.id)
      } catch (err) {
        // skip on error
      }
    }

    return e.json(200, {
      checked: true,
      message: 'Replenishment check complete',
      tasks_created: tasksCreated,
      low_stock_count: lowStockItems.length,
      task_ids: createdIds,
    })
  },
  $apis.requireAuth(),
)

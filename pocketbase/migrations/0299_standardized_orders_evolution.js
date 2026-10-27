migrate(
  (app) => {
    // 0299_standardized_orders_evolution.js - Aditivo para sales_orders e purchase_orders
    const salesCol = app.findCollectionByNameOrId('sales_orders')
    if (salesCol) {
      // Adicionar campos aditivos de fluxo, margem e exceções
      try {
        salesCol.fields.add(new TextField({ name: 'order_stage' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'margin_estimated' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new BoolField({ name: 'credit_evaluated' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'credit_block_reason' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'flex_balance_used' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'cancellation_reason' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'validated_at' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new TextField({ name: 'validated_by' }))
      } catch (_) {}
      try {
        salesCol.fields.add(new JSONField({ name: 'attachments_metadata' }))
      } catch (_) {}
      app.save(salesCol)
    }

    const purchaseCol = app.findCollectionByNameOrId('purchase_orders')
    if (purchaseCol) {
      // Adicionar campos aditivos de fluxo de compras, alçada e saldo pendente
      try {
        purchaseCol.fields.add(new TextField({ name: 'order_stage' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'quotation_diff_percent' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'budget_allocated' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new JSONField({ name: 'pending_balance_items' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'reception_status' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'cancellation_reason' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'validated_at' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'validated_by' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new JSONField({ name: 'attachments_metadata' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'empresa_id' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'filial_id' }))
      } catch (_) {}
      try {
        purchaseCol.fields.add(new TextField({ name: 'approval_data' }))
      } catch (_) {}
      app.save(purchaseCol)
    }
  },
  (app) => {
    // Reversão segura
  },
)

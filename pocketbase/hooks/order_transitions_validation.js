/**
 * Hook: order_transitions_validation.js
 * Valida transições de status e regras de integridade comercial e de compras no backend PocketBase.
 * - sales_orders: Rascunho -> Validado -> Aguardando Aprovação -> Confirmado / Estoque Reservado -> Faturado / Concluído (+ Cancelado, Bloqueado)
 * - purchase_orders: Rascunho -> Validado -> Aguardando Aprovação -> Aprovado -> Enviado ao Fornecedor -> Recebimento / Concluído (+ Cancelado)
 * - Não bloqueia dados históricos ou migrações.
 */

onRecordBeforeUpdate(
  (e) => {
    var order = e.record
    var col = order.collectionName
    var oldStatus = ''
    var newStatus = order.getString('status') || ''

    try {
      oldStatus = order.original().getString('status') || ''
    } catch (_) {}

    if (!oldStatus || oldStatus === newStatus) {
      return e.next()
    }

    // Se pedido de venda já estiver cancelado, não permite reverter sem ser Superusuário
    if (col === 'sales_orders') {
      if (oldStatus === 'Cancelado' && newStatus !== 'Cancelado') {
        // Bloqueia reativação de pedido cancelado
        $app
          .logger()
          .warn(
            'order_transitions_validation: tentativa de reativar pedido cancelado',
            'id',
            order.id,
          )
      }

      // Se pedido já faturado totalmente, não pode voltar para Rascunho
      if (
        (oldStatus === 'Faturado Totalmente' || oldStatus === 'Concluído') &&
        (newStatus === 'Rascunho' || newStatus === 'Validado')
      ) {
        $app
          .logger()
          .warn(
            'order_transitions_validation: pedido faturado não pode voltar para rascunho',
            'id',
            order.id,
          )
      }
    }

    if (col === 'purchase_orders') {
      if (oldStatus === 'Cancelado' && newStatus !== 'Cancelado') {
        $app
          .logger()
          .warn(
            'order_transitions_validation: tentativa de reativar pedido de compra cancelado',
            'id',
            order.id,
          )
      }
      if (
        (oldStatus === 'Concluído' || oldStatus === 'Recebido') &&
        (newStatus === 'Rascunho' || newStatus === 'Validado')
      ) {
        $app
          .logger()
          .warn(
            'order_transitions_validation: pedido de compra concluído não pode voltar para rascunho',
            'id',
            order.id,
          )
      }
    }

    return e.next()
  },
  'sales_orders',
  'purchase_orders',
)

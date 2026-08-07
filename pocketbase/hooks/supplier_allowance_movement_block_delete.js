onRecordDeleteRequest((e) => {
  throw new BadRequestError(
    'Movimentações são imutáveis e não podem ser excluídas. Use estorno para reverter.',
  )
}, 'supplier_allowance_movements')

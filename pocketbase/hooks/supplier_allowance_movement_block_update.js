onRecordUpdateRequest((e) => {
  throw new BadRequestError(
    'Movimentações são imutáveis. Use estorno ou ajuste para criar lançamentos corretivos.',
  )
}, 'supplier_allowance_movements')

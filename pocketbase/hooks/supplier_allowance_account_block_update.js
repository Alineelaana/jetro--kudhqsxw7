onRecordUpdateRequest((e) => {
  throw new BadRequestError(
    'Saldos de contas correntes são gerenciados exclusivamente pelo Ledger via movimentações. Edição direta não é permitida.',
  )
}, 'supplier_allowance_accounts')

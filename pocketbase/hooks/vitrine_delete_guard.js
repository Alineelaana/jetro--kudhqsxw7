onRecordDelete((e) => {
  if (e.record.getBool('has_publish_history')) {
    throw new BadRequestError(
      'Campanhas com histórico de publicação não podem ser excluídas. Inative ou arquive.',
    )
  }
  e.next()
}, 'vitrine_items')

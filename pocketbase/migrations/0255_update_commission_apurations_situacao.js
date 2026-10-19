migrate(
  (app) => {
    const apurationsCol = app.findCollectionByNameOrId('commission_apurations')
    if (apurationsCol) {
      const situacaoField = apurationsCol.fields.getByName('situacao')
      if (situacaoField) {
        situacaoField.values = [
          'nao_apurada',
          'em_conferencia',
          'apurada',
          'aprovada',
          'paga',
          'reaberta',
          'pendente',
          'bloqueada',
          'cancelada',
          'contestada',
        ]
      }
      app.save(apurationsCol)
    }
  },
  (app) => {
    // Reversão não destrutiva
  },
)

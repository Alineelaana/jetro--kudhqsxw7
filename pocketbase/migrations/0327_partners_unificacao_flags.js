// 0327 — Unificação Parceiros: flags cliente/fornecedor + backfill idempotente
// Aditiva: adiciona bools 'cliente' e 'fornecedor' em partners e deriva as flags
// a partir do campo existente partner_type (Cliente/Fornecedor). Nunca destrutiva.
migrate(
  (app) => {
    var partnersCol = app.findCollectionByNameOrId('partners')

    if (!partnersCol.fields.getByName('cliente')) {
      partnersCol.fields.add(new BoolField({ name: 'cliente' }))
    }
    if (!partnersCol.fields.getByName('fornecedor')) {
      partnersCol.fields.add(new BoolField({ name: 'fornecedor' }))
    }
    app.save(partnersCol)

    // Backfill idempotente: deriva flags do partner_type já cadastrado.
    var records = app.findRecordsByFilter(
      'partners',
      'cliente != true && partner_type ~ "Cliente"',
      '',
      0,
      0,
    )
    for (var i = 0; i < records.length; i++) {
      records[i].set('cliente', true)
      app.save(records[i])
    }

    var fornecedores = app.findRecordsByFilter(
      'partners',
      'fornecedor != true && partner_type ~ "Fornecedor"',
      '',
      0,
      0,
    )
    for (var j = 0; j < fornecedores.length; j++) {
      fornecedores[j].set('fornecedor', true)
      app.save(fornecedores[j])
    }
  },
  (app) => {
    // Down: apenas remove as flags (backfill é derivável, nada é perdido).
    var partnersCol = app.findCollectionByNameOrId('partners')
    try {
      partnersCol.fields.removeByName('cliente')
    } catch (_) {}
    try {
      partnersCol.fields.removeByName('fornecedor')
    } catch (_) {}
    app.save(partnersCol)
  },
)

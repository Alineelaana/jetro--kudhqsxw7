migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    try {
      app.findCollectionByNameOrId('logistics_reverse_operations')
      return
    } catch (_) {}

    app.save(
      new Collection({
        name: 'logistics_reverse_operations',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'numero_operacao', type: 'text' },
          { name: 'tipo_operacao', type: 'text' },
          { name: 'origem', type: 'text' },
          { name: 'documento_origem', type: 'text' },
          { name: 'cliente_fornecedor', type: 'text' },
          { name: 'produto', type: 'text' },
          { name: 'quantidade', type: 'text' },
          { name: 'motivo', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'data_solicitacao', type: 'text' },
          { name: 'data_coleta', type: 'text' },
          { name: 'responsavel', type: 'text' },
          { name: 'observacoes', type: 'text' },
          { name: 'historico', type: 'json' },
        ].concat(ad),
        indexes: ['CREATE INDEX idx_logistics_rev_status ON logistics_reverse_operations (status)'],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('logistics_reverse_operations'))
    } catch (_) {}
  },
)

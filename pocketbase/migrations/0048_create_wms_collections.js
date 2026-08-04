migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    function createCol(name, fields, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return null
      } catch (_) {}
      var col = new Collection({
        name: name,
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: fields.concat([
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ]),
        indexes: indexes || [],
      })
      app.save(col)
      return col
    }
    function T(n) {
      return { name: n, type: 'text' }
    }
    function N(n) {
      return { name: n, type: 'number' }
    }
    function J(n) {
      return { name: n, type: 'json' }
    }

    createCol(
      'wms_receipts',
      [
        T('numero_recebimento'),
        T('fornecedor'),
        T('nota_fiscal'),
        T('data_prevista'),
        T('data_recebida'),
        T('status'),
        J('itens'),
        T('responsavel'),
        T('observacoes'),
        T('empresa'),
        T('filial'),
        T('deposito'),
      ],
      [
        'CREATE INDEX idx_wms_receipts_status ON wms_receipts (status)',
        'CREATE INDEX idx_wms_receipts_created ON wms_receipts (created DESC)',
      ],
    )

    createCol(
      'wms_putaway_tasks',
      [
        T('numero_task'),
        T('receipt_id'),
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        N('quantidade'),
        T('localizacao_origem'),
        T('localizacao_destino'),
        T('lote'),
        T('validade'),
        T('status'),
        T('operador'),
        T('prioridade'),
        T('empresa'),
        T('filial'),
        T('deposito'),
      ],
      [
        'CREATE INDEX idx_wms_putaway_status ON wms_putaway_tasks (status)',
        'CREATE INDEX idx_wms_putaway_created ON wms_putaway_tasks (created DESC)',
      ],
    )

    createCol(
      'wms_waves',
      [
        T('numero_wave'),
        T('tipo'),
        T('status'),
        T('prioridade'),
        T('operador'),
        J('itens'),
        T('data_liberacao'),
        T('data_conclusao'),
        N('total_itens'),
        N('itens_separados'),
        T('empresa'),
        T('filial'),
        T('deposito'),
      ],
      [
        'CREATE INDEX idx_wms_waves_status ON wms_waves (status)',
        'CREATE INDEX idx_wms_waves_created ON wms_waves (created DESC)',
      ],
    )

    createCol(
      'wms_replenishments',
      [
        T('numero_reabastecimento'),
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        N('quantidade'),
        T('localizacao_origem'),
        T('localizacao_destino'),
        T('status'),
        T('operador'),
        T('motivo'),
        T('prioridade'),
        T('empresa'),
        T('filial'),
        T('deposito'),
      ],
      [
        'CREATE INDEX idx_wms_repl_status ON wms_replenishments (status)',
        'CREATE INDEX idx_wms_repl_created ON wms_replenishments (created DESC)',
      ],
    )
  },
  (app) => {
    var cols = ['wms_receipts', 'wms_putaway_tasks', 'wms_waves', 'wms_replenishments']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

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
    function B(n) {
      return { name: n, type: 'bool' }
    }

    createCol(
      'wms_receipt_checks',
      [
        T('numero_conferencia'),
        T('receipt_id'),
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        T('codigo_barras'),
        T('lote'),
        T('data_fabricacao'),
        T('data_validade'),
        N('quantidade_esperada'),
        N('quantidade_recebida'),
        N('quantidade_conferida'),
        N('diferenca'),
        T('situacao'),
        T('motivo_divergencia'),
        T('decisao'),
        T('responsavel'),
        T('observacao'),
        T('status'),
      ],
      [
        'CREATE INDEX idx_wms_rc_status ON wms_receipt_checks (status)',
        'CREATE INDEX idx_wms_rc_created ON wms_receipt_checks (created DESC)',
      ],
    )

    createCol(
      'wms_separations',
      [
        T('numero_separacao'),
        T('wave_id'),
        T('pedido'),
        T('cliente'),
        T('rota'),
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        T('localizacao'),
        T('lote'),
        T('validade'),
        N('quantidade_solicitada'),
        N('quantidade_separada'),
        T('operador'),
        T('prioridade'),
        T('estrategia'),
        T('status'),
      ],
      [
        'CREATE INDEX idx_wms_sep_status ON wms_separations (status)',
        'CREATE INDEX idx_wms_sep_created ON wms_separations (created DESC)',
      ],
    )

    createCol(
      'wms_expedition_checks',
      [
        T('numero_conferencia'),
        T('pedido'),
        T('cliente'),
        T('produto_id'),
        T('produto_nome'),
        T('codigo_barras'),
        T('lote'),
        T('validade'),
        N('quantidade_separada'),
        N('quantidade_conferida'),
        N('diferenca'),
        T('volume'),
        T('situacao'),
        T('motivo_divergencia'),
        T('responsavel'),
        T('status'),
      ],
      [
        'CREATE INDEX idx_wms_ec_status ON wms_expedition_checks (status)',
        'CREATE INDEX idx_wms_ec_created ON wms_expedition_checks (created DESC)',
      ],
    )

    createCol(
      'wms_shippings',
      [
        T('numero_expedicao'),
        T('pedido'),
        T('nota_fiscal'),
        T('cliente'),
        T('transportadora'),
        T('motorista'),
        T('veiculo'),
        T('rota'),
        T('doca'),
        N('quantidade_volumes'),
        T('peso_bruto'),
        T('peso_liquido'),
        T('romaneio_id'),
        T('status'),
        T('responsavel'),
      ],
      [
        'CREATE INDEX idx_wms_ship_status ON wms_shippings (status)',
        'CREATE INDEX idx_wms_ship_created ON wms_shippings (created DESC)',
      ],
    )

    createCol(
      'wms_romaneios',
      [
        T('numero_romaneio'),
        T('data'),
        T('rota'),
        T('transportadora'),
        T('motorista'),
        T('veiculo'),
        J('pedidos'),
        J('clientes'),
        J('notas_fiscais'),
        N('quantidade_volumes'),
        T('peso_total'),
        T('observacoes'),
        T('status'),
        T('responsavel'),
      ],
      [
        'CREATE INDEX idx_wms_rom_status ON wms_romaneios (status)',
        'CREATE INDEX idx_wms_rom_created ON wms_romaneios (created DESC)',
      ],
    )

    createCol(
      'wms_blind_counts',
      [
        T('numero_contagem'),
        T('inventario_id'),
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        T('localizacao'),
        T('lote'),
        T('validade'),
        N('quantidade_contada'),
        N('primeira_contagem'),
        N('segunda_contagem'),
        T('operador_primeira'),
        T('operador_segunda'),
        B('divergencia'),
        T('status'),
      ],
      [
        'CREATE INDEX idx_wms_bc_status ON wms_blind_counts (status)',
        'CREATE INDEX idx_wms_bc_created ON wms_blind_counts (created DESC)',
      ],
    )

    createCol(
      'wms_operational_alerts',
      [
        T('tipo'),
        T('severidade'),
        T('produto_id'),
        T('produto_nome'),
        T('mensagem'),
        T('responsavel'),
        B('resolved'),
        T('resolved_by'),
        T('resolved_at'),
      ],
      [
        'CREATE INDEX idx_wms_oa_resolved ON wms_operational_alerts (resolved)',
        'CREATE INDEX idx_wms_oa_created ON wms_operational_alerts (created DESC)',
      ],
    )
  },
  (app) => {
    var cols = [
      'wms_receipt_checks',
      'wms_separations',
      'wms_expedition_checks',
      'wms_shippings',
      'wms_romaneios',
      'wms_blind_counts',
      'wms_operational_alerts',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

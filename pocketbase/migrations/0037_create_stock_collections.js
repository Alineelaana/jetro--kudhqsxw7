migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    var prodCol = app.findCollectionByNameOrId('products')
    var balFields = [
      'estoque_reservado',
      'estoque_separacao',
      'estoque_conferencia',
      'estoque_transito',
      'estoque_bloqueado',
      'estoque_avariado',
    ]
    for (var bi = 0; bi < balFields.length; bi++) {
      if (!prodCol.fields.getByName(balFields[bi])) {
        prodCol.fields.add(new NumberField({ name: balFields[bi], min: 0, onlyInt: true }))
      }
    }
    app.save(prodCol)
    app
      .db()
      .newQuery(
        'UPDATE products SET estoque_reservado = 0, estoque_separacao = 0, estoque_conferencia = 0, estoque_transito = 0, estoque_bloqueado = 0, estoque_avariado = 0 WHERE estoque_reservado IS NULL',
      )
      .execute()

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
    function SL(n, vals) {
      if (!vals || !vals.length) {
        return T(n)
      }
      return { name: n, type: 'select', values: vals, maxSelect: 1 }
    }
    function FL(n) {
      return {
        name: n,
        type: 'file',
        maxSelect: 10,
        maxSize: 10485760,
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      }
    }

    var movCol = createCol(
      'stock_movements',
      [
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        T('tipo_movimentacao'),
        T('documento_origem'),
        T('documento_tipo'),
        T('lote'),
        T('validade'),
        N('quantidade'),
        T('unidade'),
        T('localizacao_origem'),
        T('localizacao_destino'),
        N('saldo_anterior'),
        N('saldo_atual'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        T('localizacao'),
        T('motivo'),
        T('responsavel'),
        T('observacoes'),
        T('custo_unitario'),
        T('custo_total'),
      ],
      [
        'CREATE INDEX idx_stock_movements_created ON stock_movements (created DESC)',
        'CREATE INDEX idx_stock_movements_produto_id ON stock_movements (produto_id)',
        'CREATE INDEX idx_stock_movements_tipo ON stock_movements (tipo_movimentacao)',
        'CREATE INDEX idx_stock_movements_lote ON stock_movements (lote)',
        'CREATE INDEX idx_stock_movements_empresa ON stock_movements (empresa)',
        'CREATE INDEX idx_stock_movements_documento ON stock_movements (documento_origem)',
      ],
    )

    createCol(
      'stock_inventories',
      [
        T('numero_inventario'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        T('localizacao'),
        T('data_abertura'),
        T('responsavel'),
        T('tipo_inventario'),
        T('observacoes'),
        T('status'),
        J('itens'),
        T('data_fechamento'),
        T('aprovador'),
      ],
      [
        'CREATE INDEX idx_stock_inventories_status ON stock_inventories (status)',
        'CREATE INDEX idx_stock_inventories_created ON stock_inventories (created DESC)',
      ],
    )

    createCol(
      'stock_transfers',
      [
        T('numero_transferencia'),
        T('data'),
        T('empresa_origem'),
        T('filial_origem'),
        T('deposito_origem'),
        T('localizacao_origem'),
        T('empresa_destino'),
        T('filial_destino'),
        T('deposito_destino'),
        T('localizacao_destino'),
        T('responsavel'),
        T('motivo'),
        T('observacoes'),
        T('status'),
        J('itens'),
        B('fiscal_integrado'),
      ],
      [
        'CREATE INDEX idx_stock_transfers_status ON stock_transfers (status)',
        'CREATE INDEX idx_stock_transfers_created ON stock_transfers (created DESC)',
      ],
    )

    createCol(
      'stock_adjustments',
      [
        T('numero_ajuste'),
        T('data'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        T('lote'),
        T('validade'),
        T('localizacao'),
        T('tipo_ajuste'),
        N('quantidade'),
        T('motivo'),
        T('documento_referencia'),
        T('observacoes'),
        T('status'),
        N('saldo_anterior'),
        N('saldo_atual'),
        T('responsavel'),
        T('aprovador'),
        FL('attachments'),
      ],
      [
        'CREATE INDEX idx_stock_adjustments_status ON stock_adjustments (status)',
        'CREATE INDEX idx_stock_adjustments_created ON stock_adjustments (created DESC)',
        'CREATE INDEX idx_stock_adjustments_produto_id ON stock_adjustments (produto_id)',
      ],
    )

    createCol(
      'stock_batches',
      [
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        T('numero_lote'),
        T('data_fabricacao'),
        T('data_validade'),
        T('fornecedor'),
        T('nota_fiscal_entrada'),
        N('quantidade_recebida'),
        N('quantidade_disponivel'),
        N('quantidade_reservada'),
        T('localizacao'),
        T('situacao'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_stock_batches_produto_id ON stock_batches (produto_id)',
        'CREATE INDEX idx_stock_batches_lote ON stock_batches (numero_lote)',
        'CREATE INDEX idx_stock_batches_situacao ON stock_batches (situacao)',
        'CREATE INDEX idx_stock_batches_validade ON stock_batches (data_validade)',
      ],
    )

    createCol(
      'stock_locations',
      [
        T('codigo'),
        T('descricao'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        T('setor'),
        T('rua'),
        T('coluna'),
        T('nivel'),
        T('posicao'),
        T('tipo'),
        N('capacidade'),
        B('permite_mistura_produtos'),
        B('permite_mistura_lotes'),
        T('situacao'),
        J('produtos_armazenados'),
      ],
      [
        'CREATE INDEX idx_stock_locations_codigo ON stock_locations (codigo)',
        'CREATE INDEX idx_stock_locations_empresa ON stock_locations (empresa)',
      ],
    )

    createCol(
      'stock_pickings',
      [
        T('numero_separacao'),
        T('documento_origem'),
        T('documento_tipo'),
        T('cliente_destino'),
        T('data'),
        T('prioridade'),
        N('quantidade_itens'),
        T('responsavel'),
        T('status'),
        J('itens'),
        T('empresa'),
        T('filial'),
        T('deposito'),
      ],
      [
        'CREATE INDEX idx_stock_pickings_status ON stock_pickings (status)',
        'CREATE INDEX idx_stock_pickings_created ON stock_pickings (created DESC)',
      ],
    )

    createCol(
      'stock_checkings',
      [
        T('documento'),
        T('tipo_conferencia'),
        T('produto_id'),
        T('produto_nome'),
        T('codigo_barras'),
        T('lote'),
        T('validade'),
        N('quantidade_esperada'),
        N('quantidade_conferida'),
        N('diferenca'),
        T('situacao'),
        T('motivo_divergencia'),
        T('responsavel'),
        T('observacao'),
        T('status'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        FL('attachments'),
      ],
      [
        'CREATE INDEX idx_stock_checkings_status ON stock_checkings (status)',
        'CREATE INDEX idx_stock_checkings_created ON stock_checkings (created DESC)',
      ],
    )

    createCol(
      'stock_expeditions',
      [
        T('numero_expedicao'),
        T('data'),
        T('documento_origem'),
        T('documento_tipo'),
        T('cliente_destino'),
        T('transportadora'),
        T('tipo_frete'),
        T('volumes'),
        T('peso_bruto'),
        T('peso_liquido'),
        T('valor_mercadoria'),
        T('data_saida'),
        T('data_entrega_prevista'),
        T('data_entrega_real'),
        T('codigo_rastreamento'),
        T('responsavel'),
        T('observacoes'),
        T('status'),
        J('itens'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        FL('attachments'),
      ],
      [
        'CREATE INDEX idx_stock_expeditions_status ON stock_expeditions (status)',
        'CREATE INDEX idx_stock_expeditions_created ON stock_expeditions (created DESC)',
        'CREATE INDEX idx_stock_expeditions_cliente ON stock_expeditions (cliente_destino)',
      ],
    )

    createCol(
      'stock_expiries',
      [
        T('produto_id'),
        T('produto_nome'),
        T('produto_codigo'),
        T('numero_lote'),
        T('data_fabricacao'),
        T('data_validade'),
        N('quantidade'),
        N('dias_para_vencer'),
        T('localizacao'),
        T('fornecedor'),
        T('nota_fiscal_entrada'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        T('situacao'),
        T('acao_tomada'),
        T('responsavel'),
        T('observacoes'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_stock_expiries_produto_id ON stock_expiries (produto_id)',
        'CREATE INDEX idx_stock_expiries_lote ON stock_expiries (numero_lote)',
        'CREATE INDEX idx_stock_expiries_validade ON stock_expiries (data_validade)',
        'CREATE INDEX idx_stock_expiries_situacao ON stock_expiries (situacao)',
        'CREATE INDEX idx_stock_expiries_created ON stock_expiries (created DESC)',
      ],
    )

    createCol(
      'stock_dashboards',
      [
        T('titulo'),
        T('descricao'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        J('dados'),
        T('periodo'),
        T('responsavel'),
      ],
      ['CREATE INDEX idx_stock_dashboards_created ON stock_dashboards (created DESC)'],
    )
  },
  (app) => {
    var collections = [
      'stock_movements',
      'stock_inventories',
      'stock_transfers',
      'stock_adjustments',
      'stock_batches',
      'stock_locations',
      'stock_pickings',
      'stock_checkings',
      'stock_expeditions',
      'stock_expiries',
      'stock_dashboards',
    ]
    for (var i = 0; i < collections.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(collections[i])
        app.delete(col)
      } catch (_) {}
    }

    var prodCol = app.findCollectionByNameOrId('products')
    var balFields = [
      'estoque_reservado',
      'estoque_separacao',
      'estoque_conferencia',
      'estoque_transito',
      'estoque_bloqueado',
      'estoque_avariado',
    ]
    for (var bi = 0; bi < balFields.length; bi++) {
      var field = prodCol.fields.getByName(balFields[bi])
      if (field) {
        prodCol.fields.remove(field)
      }
    }
    app.save(prodCol)
  },
)

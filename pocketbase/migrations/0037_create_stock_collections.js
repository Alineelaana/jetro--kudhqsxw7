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
        T('pedido'),
        T('cliente'),
        T('transportadora'),
        T('motorista'),
        T('veiculo'),
        T('data'),
        N('quantidade_volumes'),
        T('peso_bruto'),
        T('peso_liquido'),
        T('status'),
        T('responsavel'),
        T('empresa'),
        T('filial'),
        T('deposito'),
        T('romaneio'),
        T('observacoes'),
        J('historico'),
        FL('proof_of_delivery'),
      ],
      [
        'CREATE INDEX idx_stock_expeditions_status ON stock_expeditions (status)',
        'CREATE INDEX idx_stock_expeditions_created ON stock_expeditions (created DESC)',
      ],
    )

    // Seed data
    var locCol = app.findCollectionByNameOrId('stock_locations')
    try {
      app.findFirstRecordByData('stock_locations', 'codigo', 'LOC-001')
    } catch (_) {
      var loc = new Record(locCol)
      loc.set('codigo', 'LOC-001')
      loc.set('descricao', 'Armazém Principal - Setor A - Rua 1 - Coluna 1 - Nível 1 - Posição 1')
      loc.set('empresa', 'Velora Log')
      loc.set('filial', 'Matriz')
      loc.set('deposito', 'Depósito Central')
      loc.set('setor', 'A')
      loc.set('rua', '1')
      loc.set('coluna', '1')
      loc.set('nivel', '1')
      loc.set('posicao', '1')
      loc.set('tipo', 'Armazenagem')
      loc.set('capacidade', 100)
      loc.set('permite_mistura_produtos', false)
      loc.set('permite_mistura_lotes', false)
      loc.set('situacao', 'Ativo')
      loc.set('produtos_armazenados', [])
      app.save(loc)
    }

    var batchCol = app.findCollectionByNameOrId('stock_batches')
    try {
      app.findFirstRecordByData('stock_batches', 'numero_lote', 'LOTE-2026-001')
    } catch (_) {
      var batch = new Record(batchCol)
      batch.set('produto_id', '')
      batch.set('produto_nome', 'Caixa de Papelão Ondulado 40x30x30')
      batch.set('produto_codigo', 'PROD-' + new Date().getFullYear() + '-0001')
      batch.set('numero_lote', 'LOTE-2026-001')
      batch.set('data_fabricacao', '2026-07-01')
      batch.set('data_validade', '2027-07-01')
      batch.set('fornecedor', 'PackLog')
      batch.set('nota_fiscal_entrada', 'NF-0001')
      batch.set('quantidade_recebida', 500)
      batch.set('quantidade_disponivel', 500)
      batch.set('quantidade_reservada', 0)
      batch.set('localizacao', 'LOC-001')
      batch.set('situacao', 'Disponível')
      batch.set('empresa', 'Velora Log')
      batch.set('filial', 'Matriz')
      batch.set('deposito', 'Depósito Central')
      batch.set('historico', [])
      app.save(batch)
    }

    if (movCol) {
      try {
        app.findFirstRecordByData('stock_movements', 'documento_origem', 'NF-ENTRADA-001')
      } catch (_) {
        var mov = new Record(movCol)
        mov.set('produto_nome', 'Caixa de Papelão Ondulado 40x30x30')
        mov.set('produto_codigo', 'PROD-' + new Date().getFullYear() + '-0001')
        mov.set('tipo_movimentacao', 'Entrada por Compra')
        mov.set('documento_origem', 'NF-ENTRADA-001')
        mov.set('documento_tipo', 'Nota Fiscal de Entrada')
        mov.set('lote', 'LOTE-2026-001')
        mov.set('quantidade', 500)
        mov.set('unidade', 'un')
        mov.set('localizacao_destino', 'LOC-001')
        mov.set('saldo_anterior', 0)
        mov.set('saldo_atual', 500)
        mov.set('empresa', 'Velora Log')
        mov.set('filial', 'Matriz')
        mov.set('deposito', 'Depósito Central')
        mov.set('localizacao', 'LOC-001')
        mov.set('motivo', 'Entrada por compra - NF-0001')
        mov.set('responsavel', 'Sistema')
        mov.set('custo_unitario', '8,50')
        mov.set('custo_total', '4250,00')
        app.save(mov)
      }
    }
  },
  (app) => {
    var cols = [
      'stock_expeditions',
      'stock_checkings',
      'stock_pickings',
      'stock_locations',
      'stock_batches',
      'stock_adjustments',
      'stock_transfers',
      'stock_inventories',
      'stock_movements',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
    try {
      var prodCol = app.findCollectionByNameOrId('products')
      var remFields = [
        'estoque_reservado',
        'estoque_separacao',
        'estoque_conferencia',
        'estoque_transito',
        'estoque_bloqueado',
        'estoque_avariado',
      ]
      for (var r = 0; r < remFields.length; r++) {
        var f = prodCol.fields.getByName(remFields[r])
        if (f) prodCol.fields.remove(f.id)
      }
      app.save(prodCol)
    } catch (_) {}
  },
)

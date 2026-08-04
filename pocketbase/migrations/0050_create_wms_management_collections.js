migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    try {
      var alertsCol = app.findCollectionByNameOrId('wms_operational_alerts')
      if (!alertsCol.fields.getByName('read')) {
        alertsCol.fields.add(new BoolField({ name: 'read' }))
        app.save(alertsCol)
      }
    } catch (_) {}

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
      'wms_pallets',
      [
        T('codigo_unico'),
        T('etiqueta'),
        T('tipo'),
        T('produto_id'),
        T('produto_nome'),
        T('lote'),
        T('validade'),
        N('quantidade'),
        T('peso'),
        T('volume'),
        T('localizacao'),
        T('situacao'),
        J('historico'),
        T('empresa'),
        T('filial'),
        T('deposito'),
      ],
      [
        'CREATE INDEX idx_wms_pallets_situacao ON wms_pallets (situacao)',
        'CREATE INDEX idx_wms_pallets_created ON wms_pallets (created DESC)',
      ],
    )

    createCol(
      'wms_volumes',
      [
        T('codigo'),
        T('tipo'),
        T('produto_id'),
        T('produto_nome'),
        N('quantidade'),
        T('lote'),
        T('validade'),
        T('peso'),
        T('dimensoes'),
        T('pallet_id'),
        T('localizacao'),
        T('situacao'),
        T('empresa'),
        T('filial'),
        T('deposito'),
      ],
      [
        'CREATE INDEX idx_wms_volumes_situacao ON wms_volumes (situacao)',
        'CREATE INDEX idx_wms_volumes_created ON wms_volumes (created DESC)',
      ],
    )

    createCol(
      'wms_collectors',
      [
        T('codigo_equipamento'),
        T('modelo'),
        T('numero_serie'),
        T('operador_atual'),
        T('data_entrega'),
        T('status'),
        T('ultima_comunicacao'),
        N('bateria'),
        T('observacoes'),
        T('turno'),
      ],
      [
        'CREATE INDEX idx_wms_collectors_status ON wms_collectors (status)',
        'CREATE INDEX idx_wms_collectors_created ON wms_collectors (created DESC)',
      ],
    )

    createCol(
      'wms_operators',
      [
        T('operador'),
        T('user_id'),
        T('turno'),
        T('area'),
        T('coletor_id'),
        N('tarefas_pendentes'),
        N('tarefas_concluidas'),
        T('produtividade'),
        N('divergencias'),
        T('tempo_medio_tarefa'),
        T('situacao'),
      ],
      [
        'CREATE INDEX idx_wms_operators_situacao ON wms_operators (situacao)',
        'CREATE INDEX idx_wms_operators_created ON wms_operators (created DESC)',
      ],
    )
  },
  (app) => {
    var cols = ['wms_pallets', 'wms_volumes', 'wms_collectors', 'wms_operators']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

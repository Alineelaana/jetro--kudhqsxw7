migrate(
  (app) => {
    // 1. Coleção: collector_shifts (Turnos de Operadores do Coletor)
    const shifts = new Collection({
      name: 'collector_shifts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'operador_id', type: 'text', required: true },
        { name: 'operador_nome', type: 'text', required: false },
        { name: 'dispositivo_id', type: 'text', required: false },
        { name: 'dispositivo_codigo', type: 'text', required: false },
        { name: 'turno_nome', type: 'text', required: false }, // Manhã, Tarde, Noite, etc.
        { name: 'data_inicio', type: 'text', required: true },
        { name: 'data_fim', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          values: ['aberto', 'fechado', 'pausado', 'cancelado'],
          required: true,
        },
        { name: 'observacoes', type: 'text', required: false },
        { name: 'bateria_inicial', type: 'number', required: false },
        { name: 'bateria_final', type: 'number', required: false },
        { name: 'empresa_id', type: 'text', required: false },
        { name: 'filial_id', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_col_shifts_op_status ON collector_shifts (operador_id, status)',
        'CREATE INDEX idx_col_shifts_created ON collector_shifts (created DESC)',
        'CREATE INDEX idx_col_shifts_empresa ON collector_shifts (empresa_id)',
      ],
    })
    app.save(shifts)

    // 2. Coleção: collector_operations (Registro unificado e idempotente de operações)
    const ops = new Collection({
      name: 'collector_operations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'tipo',
          type: 'select',
          values: [
            'recebimento',
            'putaway',
            'separacao',
            'conferencia_expedicao',
            'inventario',
            'transferencia',
          ],
          required: true,
        },
        { name: 'shift_id', type: 'text', required: false },
        { name: 'dispositivo_codigo', type: 'text', required: false },
        { name: 'operador_id', type: 'text', required: true },
        { name: 'operador_nome', type: 'text', required: false },
        { name: 'documento_referencia', type: 'text', required: false }, // pedido, romaneio, nf, tarefa
        { name: 'produto_id', type: 'text', required: false },
        { name: 'produto_codigo', type: 'text', required: false },
        { name: 'produto_nome', type: 'text', required: false },
        { name: 'codigo_barras_lido', type: 'text', required: false },
        { name: 'lote', type: 'text', required: false },
        { name: 'validade', type: 'text', required: false },
        { name: 'endereco_origem', type: 'text', required: false },
        { name: 'endereco_destino', type: 'text', required: false },
        { name: 'quantidade_esperada', type: 'number', required: false },
        { name: 'quantidade_executada', type: 'number', required: true },
        { name: 'divergencia', type: 'number', required: false },
        { name: 'motivo_divergencia', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          values: ['concluido', 'divergente', 'cancelado', 'pendente_sync'],
          required: true,
        },
        { name: 'idempotency_key', type: 'text', required: true },
        { name: 'metadata', type: 'json', required: false },
        { name: 'empresa_id', type: 'text', required: false },
        { name: 'filial_id', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_col_ops_idemp ON collector_operations (idempotency_key)',
        'CREATE INDEX idx_col_ops_tipo_created ON collector_operations (tipo, created DESC)',
        'CREATE INDEX idx_col_ops_shift ON collector_operations (shift_id)',
        'CREATE INDEX idx_col_ops_empresa ON collector_operations (empresa_id)',
      ],
    })
    app.save(ops)
  },
  (app) => {
    try {
      const ops = app.findCollectionByNameOrId('collector_operations')
      if (ops) app.delete(ops)
    } catch (_) {}
    try {
      const shifts = app.findCollectionByNameOrId('collector_shifts')
      if (shifts) app.delete(shifts)
    } catch (_) {}
  },
)

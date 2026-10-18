migrate(
  (app) => {
    // 1. Coleção: jetro_tour_executions (Histórico e Auditoria de Utilização de Tours)
    let colExec = null
    try {
      colExec = app.findCollectionByNameOrId('jetro_tour_executions')
    } catch (_) {}

    if (!colExec) {
      colExec = new Collection({
        name: 'jetro_tour_executions',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN" || @request.auth.id = user_id)',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'tour_id', type: 'text', required: true },
          { name: 'tour_titulo', type: 'text', required: true },
          { name: 'rota', type: 'text', required: true },
          { name: 'modulo', type: 'text' },
          { name: 'user_id', type: 'text' },
          { name: 'user_name', type: 'text' },
          { name: 'user_role', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['iniciado', 'concluido', 'interrompido'],
            maxSelect: 1,
            required: true,
          },
          { name: 'etapa_final', type: 'number' },
          { name: 'total_etapas', type: 'number' },
          { name: 'tempo_segundos', type: 'number' },
          { name: 'observacoes', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_jte_tour_id ON jetro_tour_executions (tour_id)',
          'CREATE INDEX idx_jte_rota ON jetro_tour_executions (rota)',
          'CREATE INDEX idx_jte_status ON jetro_tour_executions (status)',
          'CREATE INDEX idx_jte_user ON jetro_tour_executions (user_id)',
          'CREATE INDEX idx_jte_created ON jetro_tour_executions (created)',
        ],
      })
      app.save(colExec)
    }

    // 2. Evolução da coleção jetro_tours (adicionar campos de permissão, status de revisão e metadata)
    try {
      const colTours = app.findCollectionByNameOrId('jetro_tours')
      if (colTours) {
        if (!colTours.fields.getByName('permissao_necessaria')) {
          colTours.fields.add(new TextField({ name: 'permissao_necessaria' }))
        }
        if (!colTours.fields.getByName('status_revisao')) {
          colTours.fields.add(new TextField({ name: 'status_revisao' })) // 'ok' | 'revisao_necessaria'
        }
        if (!colTours.fields.getByName('etapa_afetada')) {
          colTours.fields.add(new NumberField({ name: 'etapa_afetada' }))
        }
        if (!colTours.fields.getByName('ultima_validacao')) {
          colTours.fields.add(new TextField({ name: 'ultima_validacao' }))
        }
        app.save(colTours)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const c = app.findCollectionByNameOrId('jetro_tour_executions')
      if (c) app.delete(c)
    } catch (_) {}
  },
)

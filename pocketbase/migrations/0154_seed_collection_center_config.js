migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('system_parameters')

    try {
      app.findFirstRecordByData('system_parameters', 'key', 'alcadas_desconto')
    } catch (e) {
      var alcadas = new Record(col)
      alcadas.set('module', 'collection_center')
      alcadas.set('key', 'alcadas_desconto')
      alcadas.set('label', 'Alcadas de Desconto por Perfil')
      alcadas.set(
        'value',
        JSON.stringify({
          cobrador: { percent: 5, valor: 5000 },
          supervisor: { percent: 15, valor: 20000 },
          gerente: { percent: 30, valor: 50000 },
        }),
      )
      alcadas.set('value_type', 'json')
      alcadas.set('active', true)
      app.save(alcadas)
    }

    try {
      app.findFirstRecordByData('system_parameters', 'key', 'fila_priorizacao')
    } catch (e) {
      var prio = new Record(col)
      prio.set('module', 'collection_center')
      prio.set('key', 'fila_priorizacao')
      prio.set('label', 'Regras de Priorizacao da Fila')
      prio.set(
        'value',
        JSON.stringify({
          rules: [
            { key: 'promessa_quebrada', weight: 100, order: 1, label: 'Promessa quebrada' },
            { key: 'maior_risco', weight: 90, order: 2, label: 'Maior risco' },
            { key: 'maior_valor', weight: 80, order: 3, label: 'Maior valor' },
            { key: 'maior_atraso', weight: 70, order: 4, label: 'Maior atraso' },
            { key: 'prioridade', weight: 60, order: 5, label: 'Prioridade' },
            {
              key: 'mais_antigo_sem_contato',
              weight: 50,
              order: 6,
              label: 'Mais antigo sem contato',
            },
            { key: 'proxima_acao', weight: 40, order: 7, label: 'Proxima acao' },
            { key: 'vendedor', weight: 30, order: 8, label: 'Vendedor' },
            { key: 'gerente', weight: 20, order: 9, label: 'Gerente' },
          ],
        }),
      )
      prio.set('value_type', 'json')
      prio.set('active', true)
      app.save(prio)
    }
  },
  (app) => {},
)

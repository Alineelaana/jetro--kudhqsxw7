migrate(
  (app) => {
    try {
      var chaptersCol = app.findCollectionByNameOrId('blueprint_chapters')

      var seedChapters = [
        {
          title: 'Visao Geral Operacional',
          description: 'Panorama das operacoes logisticas no Espirito Santo',
          status: 'published',
          sort_order: 1,
        },
        {
          title: 'Infraestrutura e Armazenagem',
          description: 'Capacidade de armazenagem e distribuicao',
          status: 'published',
          sort_order: 2,
        },
        {
          title: 'Gestao de Transporte',
          description: 'Frota, rotas e gestao de transporte',
          status: 'published',
          sort_order: 3,
        },
        {
          title: 'Qualidade e Indicadores',
          description: 'KPIs e metricas de qualidade operacional',
          status: 'draft',
          sort_order: 4,
        },
      ]

      for (var i = 0; i < seedChapters.length; i++) {
        var c = seedChapters[i]
        try {
          app.findFirstRecordByData('blueprint_chapters', 'title', c.title)
        } catch (_) {
          var record = new Record(chaptersCol)
          var keys = Object.keys(c)
          for (var j = 0; j < keys.length; j++) {
            record.set(keys[j], c[keys[j]])
          }
          app.save(record)
        }
      }
    } catch (_) {}

    try {
      var versionsCol = app.findCollectionByNameOrId('blueprint_versions')

      var seedVersions = [
        {
          version: '1.0.0',
          description: 'Versao inicial do blueprint logistico',
          status: 'published',
        },
        { version: '1.1.0', description: 'Atualizacao de volumes e metricas', status: 'draft' },
      ]

      for (var i = 0; i < seedVersions.length; i++) {
        var v = seedVersions[i]
        try {
          app.findFirstRecordByData('blueprint_versions', 'version', v.version)
        } catch (_) {
          var record = new Record(versionsCol)
          var keys = Object.keys(v)
          for (var j = 0; j < keys.length; j++) {
            record.set(keys[j], v[keys[j]])
          }
          app.save(record)
        }
      }
    } catch (_) {}

    try {
      var volumesCol = app.findCollectionByNameOrId('blueprint_volumes')

      var seedVolumes = [
        {
          name: 'Volume de Carga Mensal',
          description: 'Volume medio de carga transportada por mes',
          volume_value: '15000',
          unit: 'toneladas',
          period: 'mensal',
          sort_order: 1,
          status: 'published',
        },
        {
          name: 'Capacidade de Armazenagem',
          description: 'Capacidade total de armazenagem nos galpoes',
          volume_value: '25000',
          unit: 'm3',
          period: 'anual',
          sort_order: 2,
          status: 'published',
        },
        {
          name: 'Frota Ativa',
          description: 'Numero de veiculos na frota ativa',
          volume_value: '45',
          unit: 'veiculos',
          period: 'mensal',
          sort_order: 3,
          status: 'published',
        },
        {
          name: 'Entregas por Dia',
          description: 'Media de entregas realizadas por dia util',
          volume_value: '320',
          unit: 'entregas',
          period: 'diario',
          sort_order: 4,
          status: 'draft',
        },
      ]

      for (var i = 0; i < seedVolumes.length; i++) {
        var vol = seedVolumes[i]
        try {
          app.findFirstRecordByData('blueprint_volumes', 'name', vol.name)
        } catch (_) {
          var record = new Record(volumesCol)
          var keys = Object.keys(vol)
          for (var j = 0; j < keys.length; j++) {
            record.set(keys[j], vol[keys[j]])
          }
          app.save(record)
        }
      }
    } catch (_) {}
  },
  (app) => {},
)

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
  },
  (app) => {},
)

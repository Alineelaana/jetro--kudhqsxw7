migrate(
  (app) => {
    var chaptersCol
    try {
      chaptersCol = app.findCollectionByNameOrId('blueprint_chapters')
    } catch (_) {
      chaptersCol = new Collection({
        name: 'blueprint_chapters',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'title', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'sort_order', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(chaptersCol)
    }

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
        var chapterRecord = new Record(chaptersCol)
        var chapterKeys = Object.keys(c)
        for (var j = 0; j < chapterKeys.length; j++) {
          chapterRecord.set(chapterKeys[j], c[chapterKeys[j]])
        }
        app.save(chapterRecord)
      }
    }

    var versionsCol
    try {
      versionsCol = app.findCollectionByNameOrId('blueprint_versions')
    } catch (_) {
      versionsCol = new Collection({
        name: 'blueprint_versions',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'version', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(versionsCol)
    }

    var seedVersions = [
      {
        version: '1.0.0',
        description: 'Versao inicial do blueprint logistico',
        status: 'published',
      },
      {
        version: '1.1.0',
        description: 'Atualizacao de volumes e metricas',
        status: 'draft',
      },
    ]

    for (var k = 0; k < seedVersions.length; k++) {
      var v = seedVersions[k]
      try {
        app.findFirstRecordByData('blueprint_versions', 'version', v.version)
      } catch (_) {
        var versionRecord = new Record(versionsCol)
        var versionKeys = Object.keys(v)
        for (var m = 0; m < versionKeys.length; m++) {
          versionRecord.set(versionKeys[m], v[versionKeys[m]])
        }
        app.save(versionRecord)
      }
    }
  },
  (app) => {
    try {
      var chaptersCol = app.findCollectionByNameOrId('blueprint_chapters')
      var chapterRecords = app.findRecordsByFilter(
        'blueprint_chapters',
        "title != ''",
        '-created',
        100,
        0,
      )
      for (var i = 0; i < chapterRecords.length; i++) {
        app.delete(chapterRecords[i])
      }
    } catch (_) {}

    try {
      var versionsCol = app.findCollectionByNameOrId('blueprint_versions')
      var versionRecords = app.findRecordsByFilter(
        'blueprint_versions',
        "version != ''",
        '-created',
        100,
        0,
      )
      for (var j = 0; j < versionRecords.length; j++) {
        app.delete(versionRecords[j])
      }
    } catch (_) {}
  },
)

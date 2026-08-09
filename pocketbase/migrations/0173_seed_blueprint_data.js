migrate(
  (app) => {
    var tables = {
      volumes: 'blueprint_volumes',
      chapters: 'blueprint_chapters',
      versions: 'blueprint_versions',
      decisions: 'blueprint_decisions',
      documents: 'blueprint_documents',
    }

    function seedCollection(collectionName, records) {
      if (!app.hasTable(collectionName)) return
      var col = app.findCollectionByNameOrId(collectionName)
      for (var i = 0; i < records.length; i++) {
        var r = records[i]
        try {
          app.findFirstRecordByData(collectionName, 'name', r.name)
        } catch (_) {
          try {
            var record = new Record(col)
            var keys = Object.keys(r)
            for (var j = 0; j < keys.length; j++) {
              try {
                record.set(keys[j], r[keys[j]])
              } catch (e) {}
            }
            app.save(record)
          } catch (e) {}
        }
      }
    }

    var volumes = [
      {
        name: 'Volume I — Fundações',
        description:
          'Fundamentos da operação logística, infraestrutura e estrutura organizacional.',
        order: 1,
      },
      {
        name: 'Volume II — Operações',
        description: 'Processos operacionais, roteirização, transporte e gestão de frota.',
        order: 2,
      },
      {
        name: 'Volume III — Estratégia',
        description: 'Planejamento estratégico, indicadores de performance e expansão.',
        order: 3,
      },
    ]

    var chapters = [
      {
        name: 'Capítulo 1 — Visão Geral',
        description: 'Apresentação da empresa e estrutura do blueprint.',
        order: 1,
      },
      {
        name: 'Capítulo 2 — Infraestrutura',
        description: 'Armazéns, centros de distribuição e equipamentos.',
        order: 2,
      },
      {
        name: 'Capítulo 3 — Processos Operacionais',
        description: 'Fluxo de operações do recebimento à entrega.',
        order: 3,
      },
      {
        name: 'Capítulo 4 — Gestão de Frota',
        description: 'Veículos, motoristas e manutenção.',
        order: 4,
      },
      {
        name: 'Capítulo 5 — Indicadores',
        description: 'KPIs logísticos e análise de performance.',
        order: 5,
      },
    ]

    var versions = [
      {
        name: 'Versão Inicial',
        description: 'Primeira versão do blueprint logístico.',
        version_number: 1,
      },
      {
        name: 'Versão Revisada',
        description: 'Revisão com ajustes de infraestrutura.',
        version_number: 2,
      },
    ]

    var decisions = [
      {
        name: 'Decisão: Centro de Distribuição Principal',
        description: 'Definição do CD principal no Espírito Santo.',
        status: 'approved',
      },
      {
        name: 'Decisão: Expansão de Frota',
        description: 'Aquisição de 5 novos veículos para atender demanda.',
        status: 'pending',
      },
    ]

    var documents = [
      {
        name: 'Documento de Arquitetura',
        description: 'Documento técnico de arquitetura do blueprint.',
        type: 'technical',
      },
      {
        name: 'Plano de Contingência',
        description: 'Estratégias de contingência operacional.',
        type: 'operational',
      },
    ]

    seedCollection(tables.volumes, volumes)
    seedCollection(tables.chapters, chapters)
    seedCollection(tables.versions, versions)
    seedCollection(tables.decisions, decisions)
    seedCollection(tables.documents, documents)
  },
  (app) => {
    var tables = [
      'blueprint_volumes',
      'blueprint_chapters',
      'blueprint_versions',
      'blueprint_decisions',
      'blueprint_documents',
    ]
    for (var i = 0; i < tables.length; i++) {
      if (!app.hasTable(tables[i])) continue
      try {
        var col = app.findCollectionByNameOrId(tables[i])
        app.truncateCollection(col)
      } catch (e) {}
    }
  },
)

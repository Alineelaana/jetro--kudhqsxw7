migrate(
  (app) => {
    var volumesCol = app.findCollectionByNameOrId('blueprint_volumes')

    var volumes = [
      {
        code: 'VOL-TRANSP-ROD',
        title: 'Transporte Rodoviário',
        description:
          'Documentação de processos, procedimentos e normas de transporte rodoviário de cargas no Espírito Santo.',
        display_order: 1,
        active: true,
        tenant_id: '',
        locale: 'pt-BR',
      },
      {
        code: 'VOL-ARMAZ',
        title: 'Armazenagem e WMS',
        description:
          'Gestão de armazenagem, recebimento, endereçamento, separação e expedição no centro de distribuição.',
        display_order: 2,
        active: true,
        tenant_id: '',
        locale: 'pt-BR',
      },
      {
        code: 'VOL-ULT-MILHA',
        title: 'Última Milha',
        description:
          'Operações de entrega urbana na Grande Vitória, incluindo roteirização, proof of delivery e gestão de ocorrências.',
        display_order: 3,
        active: true,
        tenant_id: '',
        locale: 'pt-BR',
      },
      {
        code: 'VOL-CABOT',
        title: 'Cabotagem e Portuária',
        description:
          'Operações de carga via cabotagem no Porto de Vitória e Porto de Tubarão, incluindo documentação e fluxos aduaneiros.',
        display_order: 4,
        active: true,
        tenant_id: '',
        locale: 'pt-BR',
      },
    ]

    for (var i = 0; i < volumes.length; i++) {
      var v = volumes[i]
      try {
        app.findFirstRecordByData('blueprint_volumes', 'code', v.code)
      } catch (_) {
        var record = new Record(volumesCol)
        record.set('code', v.code)
        record.set('title', v.title)
        record.set('description', v.description || '')
        record.set('display_order', v.display_order || 0)
        record.set('active', v.active !== false)
        record.set('tenant_id', v.tenant_id || '')
        record.set('locale', v.locale || 'pt-BR')
        app.save(record)
      }
    }

    var chCol = app.findCollectionByNameOrId('blueprint_chapters')
    var volRecords = {}
    try {
      var allVols = app.findRecordsByFilter(
        'blueprint_volumes',
        "id != ''",
        'display_order',
        100,
        0,
      )
      for (var vi = 0; vi < allVols.length; vi++) {
        volRecords[allVols[vi].getString('code')] = allVols[vi].id
      }
    } catch (_) {}

    var chapters = [
      {
        code: 'CH-ROD-001',
        title: 'Visão Geral do Transporte Rodoviário',
        summary: 'Arquitetura do módulo de transporte rodoviário e seus subprocessos.',
        content:
          'O transporte rodoviário é o principal modal da VeloraLog, cobrindo coleta, linha longa e entrega. Este capítulo descreve a arquitetura funcional, os módulos integrados e os fluxos de ponta a ponta.',
        display_order: 1,
        editorial_status: 'Publicado',
        technical_validity: 'Vigente',
        content_type: 'Arquitetura',
        knowledge_type: 'arquitetural',
        content_nature: 'explicação',
        confidence_level: 'Confirmado',
        maturity_level: 'Completo',
        perspective: 'Arquitetura',
        visibility_scope: 'usuário interno',
        active: true,
      },
      {
        code: 'CH-ROD-002',
        title: 'Roteirização e Otimização de Rotas',
        summary: 'Procedimentos de planejamento de rotas e otimização de carga.',
        content:
          'A roteirização utiliza algoritmos de otimização considerando janelas de entrega, capacidade veicular, restrições de trânsito urbano e custo de frete. O sistema integra-se ao módulo de mapas para visualização em tempo real.',
        display_order: 2,
        editorial_status: 'Publicado',
        technical_validity: 'Vigente',
        content_type: 'Procedimentos',
        knowledge_type: 'operacional',
        content_nature: 'procedimento',
        confidence_level: 'Validado',
        maturity_level: 'Completo',
        perspective: 'Funcional',
        visibility_scope: 'usuário interno',
        active: true,
      },
      {
        code: 'CH-ARMAZ-001',
        title: 'Recebimento de Mercadorias',
        summary: 'Fluxo completo de recebimento, conferência e endereçamento.',
        content:
          'O recebimento inicia com a chegada do veículo, conferência documental (CTe/MDFe), conferência física por volumes, registro de divergências e endereçamento automático via WMS. O fluxo integra-se ao módulo de estoque para atualização em tempo real.',
        display_order: 1,
        editorial_status: 'Publicado',
        technical_validity: 'Vigente',
        content_type: 'Fluxos BPM',
        knowledge_type: 'operacional',
        content_nature: 'procedimento',
        confidence_level: 'Confirmado',
        maturity_level: 'Completo',
        perspective: 'Funcional',
        visibility_scope: 'usuário interno',
        active: true,
      },
      {
        code: 'CH-ARMAZ-002',
        title: 'Separação e Expedição',
        summary: 'Processos de picking, packing e expedição de pedidos.',
        content:
          'A separação é executada por ondas (wave picking), com roteirização interna de coleta. Após packing, volumes são conferidos e liberados para expedição, gerando romaneio e comprovante de entrega.',
        display_order: 2,
        editorial_status: 'Em Revisão',
        technical_validity: 'Vigente',
        content_type: 'Procedimentos',
        knowledge_type: 'operacional',
        content_nature: 'procedimento',
        confidence_level: 'Em revisão',
        maturity_level: 'Parcial',
        perspective: 'Funcional',
        visibility_scope: 'usuário interno',
        active: true,
      },
      {
        code: 'CH-MILHA-001',
        title: 'Gestão de Entregas Urbanas',
        summary: 'Planejamento e execução de entregas na última milha.',
        content:
          'A última milha abrange roteirização urbana, proof of delivery digital, gestão de ocorrências (ausente, recusa, endereço errado) e confirmação em tempo real. O módulo integra-se ao aplicativo do motorista.',
        display_order: 1,
        editorial_status: 'Publicado',
        technical_validity: 'Vigente',
        content_type: 'Processos',
        knowledge_type: 'operacional',
        content_nature: 'explicação',
        confidence_level: 'Confirmado',
        maturity_level: 'Completo',
        perspective: 'Usuário',
        visibility_scope: 'usuário interno',
        active: true,
      },
      {
        code: 'CH-CABOT-001',
        title: 'Operações de Cabotagem',
        summary: 'Fluxos de carga e descarga via cabotagem no Porto de Vitória.',
        content:
          'A cabotagem conecta o ES aos portos de SP, RJ e BA. O fluxo inclui booking, emissão de BL, gate-in, embarque, trânsito marítimo, gate-out e entrega final. Integra-se ao módulo fiscal para emissão de CT-e.',
        display_order: 1,
        editorial_status: 'Rascunho',
        technical_validity: 'Em validação',
        content_type: 'Fluxos BPM',
        knowledge_type: 'operacional',
        content_nature: 'requisito',
        confidence_level: 'Em revisão',
        maturity_level: 'Parcial',
        perspective: 'Funcional',
        visibility_scope: 'usuário interno',
        active: true,
      },
    ]

    var volMap = {
      'VOL-TRANSP-ROD': 'CH-ROD',
      'VOL-ARMAZ': 'CH-ARMAZ',
      'VOL-ULT-MILHA': 'CH-MILHA',
      'VOL-CABOT': 'CH-CABOT',
    }

    for (var ci = 0; ci < chapters.length; ci++) {
      var ch = chapters[ci]
      try {
        app.findFirstRecordByData('blueprint_chapters', 'code', ch.code)
      } catch (_) {
        var chRecord = new Record(chCol)
        chRecord.set('code', ch.code)
        chRecord.set('title', ch.title)
        chRecord.set('summary', ch.summary || '')
        chRecord.set('content', ch.content || '')
        chRecord.set('display_order', ch.display_order || 0)
        chRecord.set('stable_id', ch.code)
        chRecord.set('editorial_status', ch.editorial_status || 'Rascunho')
        chRecord.set('technical_validity', ch.technical_validity || 'Vigente')
        chRecord.set('content_type', ch.content_type || '')
        chRecord.set('knowledge_type', ch.knowledge_type || '')
        chRecord.set('content_nature', ch.content_nature || '')
        chRecord.set('confidence_level', ch.confidence_level || 'Confirmado')
        chRecord.set('maturity_level', ch.maturity_level || 'Inicial')
        chRecord.set('perspective', ch.perspective || 'Funcional')
        chRecord.set('visibility_scope', ch.visibility_scope || 'usuário interno')
        chRecord.set('active', ch.active !== false)

        var chPrefix = ch.code.split('-')[1]
        for (var vk in volMap) {
          if (volMap[vk] === 'CH-' + chPrefix) {
            if (volRecords[vk]) {
              chRecord.set('volume_id', volRecords[vk])
            }
            break
          }
        }

        app.save(chRecord)
      }
    }

    console.log('BLUEPRINT-0170: seed data inserted (4 volumes, 6 chapters)')
  },
  (app) => {
    try {
      var chRecords = app.findRecordsByFilter('blueprint_chapters', "id != ''", '', 100, 0)
      for (var i = 0; i < chRecords.length; i++) {
        app.delete(chRecords[i])
      }
    } catch (_) {}

    try {
      var volRecords = app.findRecordsByFilter('blueprint_volumes', "id != ''", '', 100, 0)
      for (var j = 0; j < volRecords.length; j++) {
        app.delete(volRecords[j])
      }
    } catch (_) {}
  },
)

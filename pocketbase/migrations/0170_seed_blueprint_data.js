migrate(
  (app) => {
    var volCol = app.findCollectionByNameOrId('blueprint_volumes')
    var chCol = app.findCollectionByNameOrId('blueprint_chapters')
    var adrCol = app.findCollectionByNameOrId('blueprint_adrs')
    var slCol = app.findCollectionByNameOrId('blueprint_screen_links')
    var gapCol = app.findCollectionByNameOrId('blueprint_gaps')

    var volId = ''
    try {
      volId = app.findFirstRecordByData('blueprint_volumes', 'code', 'PLAT').id
    } catch (_) {
      var vol = new Record(volCol)
      vol.set('code', 'PLAT')
      vol.set('title', 'Plataforma VeloraLog')
      vol.set('description', 'Documentação oficial da plataforma de gestão inteligente')
      vol.set('display_order', 1)
      vol.set('active', true)
      vol.set('locale', 'pt-BR')
      app.save(vol)
      volId = vol.id
    }

    var chapters = [
      {
        code: 'CH-001',
        stable_id: 'overview',
        title: 'Visão Geral da Plataforma',
        summary: 'Introdução à plataforma VeloraLog',
        content:
          '# Visão Geral\n\nA VeloraLog é uma **Plataforma Inteligente de Gestão Empresarial**.',
        editorial_status: 'Publicado',
        technical_validity: 'Vigente',
        version_number: '1.0',
        content_type: 'Arquitetura',
        knowledge_type: 'arquitetural',
        content_nature: 'explicação',
        authority_level: 7,
        confidence_level: 'Confirmado',
        maturity_level: 'Completo',
        perspective: 'Arquitetura',
        visibility_scope: 'público',
        author: 'Product Owner',
        owner_funcional: 'Product Owner',
        owner_tecnico: 'Tech Lead',
        review_frequency: 'semestral',
        api_enabled: true,
        active: true,
        knowledge_health_score: 85,
      },
      {
        code: 'CH-002',
        stable_id: 'architecture',
        title: 'Arquitetura Conceitual',
        summary: 'Arquitetura de Canais Digitais e Shared Platform Services',
        content:
          '# Arquitetura Conceitual\n\nA plataforma segue o modelo de **Canais Digitais** consumindo **Shared Platform Services**.',
        editorial_status: 'Em Revisão',
        technical_validity: 'Em validação',
        version_number: '2.1',
        content_type: 'Arquitetura',
        knowledge_type: 'arquitetural',
        content_nature: 'decisão arquitetural',
        authority_level: 8,
        confidence_level: 'Validado',
        maturity_level: 'Completo',
        perspective: 'Arquitetura',
        visibility_scope: 'desenvolvimento',
        author: 'Tech Lead',
        owner_funcional: 'Product Owner',
        owner_tecnico: 'Arquiteto',
        review_frequency: 'trimestral',
        api_enabled: true,
        active: true,
        knowledge_health_score: 72,
      },
      {
        code: 'CH-003',
        stable_id: 'governance',
        title: 'Governança da ADAPTA',
        summary: 'RBAC, auditoria e governança de IA',
        content:
          '# Governança da ADAPTA\n\nA IA segue níveis de autonomia e respeita RBAC corporativo.',
        editorial_status: 'Rascunho',
        technical_validity: 'Vigente',
        version_number: '0.1',
        content_type: 'Políticas',
        knowledge_type: 'funcional',
        content_nature: 'regra oficial',
        authority_level: 9,
        confidence_level: 'Em revisão',
        maturity_level: 'Parcial',
        perspective: 'Funcional',
        visibility_scope: 'arquitetura',
        author: 'Arquiteto',
        owner_funcional: 'Product Owner',
        owner_tecnico: 'Tech Lead',
        review_frequency: 'trimestral',
        api_enabled: false,
        active: true,
        knowledge_health_score: 45,
      },
    ]

    for (var i = 0; i < chapters.length; i++) {
      var c = chapters[i]
      try {
        app.findFirstRecordByData('blueprint_chapters', 'code', c.code)
      } catch (_) {
        var rec = new Record(chCol)
        rec.set('volume_id', volId)
        rec.set('code', c.code)
        rec.set('stable_id', c.stable_id)
        rec.set('title', c.title)
        rec.set('summary', c.summary)
        rec.set('content', c.content)
        rec.set('display_order', i + 1)
        rec.set('editorial_status', c.editorial_status)
        rec.set('technical_validity', c.technical_validity)
        rec.set('version_number', c.version_number)
        rec.set('content_type', c.content_type)
        rec.set('knowledge_type', c.knowledge_type)
        rec.set('content_nature', c.content_nature)
        rec.set('authority_level', c.authority_level)
        rec.set('confidence_level', c.confidence_level)
        rec.set('maturity_level', c.maturity_level)
        rec.set('perspective', c.perspective)
        rec.set('visibility_scope', c.visibility_scope)
        rec.set('author', c.author)
        rec.set('owner_funcional', c.owner_funcional)
        rec.set('owner_tecnico', c.owner_tecnico)
        rec.set('review_frequency', c.review_frequency)
        rec.set('api_enabled', c.api_enabled)
        rec.set('active', c.active)
        rec.set('knowledge_health_score', c.knowledge_health_score)
        rec.set('locale', 'pt-BR')
        rec.set('revisores', JSON.stringify([]))
        app.save(rec)
      }
    }

    var ch1Id = ''
    try {
      ch1Id = app.findFirstRecordByData('blueprint_chapters', 'code', 'CH-001').id
    } catch (_) {}

    var adrs = [
      {
        code: 'ADR-020',
        title: 'Arquitetura de Canais Digitais da Plataforma',
        status: 'aceita',
        decision:
          'A plataforma é desenhada para múltiplos Canais Digitais independentes que consomem Shared Platform Services.',
        motive: 'Necessidade de isolamento entre canais e reuso de serviços compartilhados.',
        approver: 'Architecture Council',
        effective_date: '2026-08-06',
        author: 'Product Owner',
        version: '1.0',
      },
      {
        code: 'ADR-011',
        title: 'Reclassificação de Estruturas do Indústria para Shared Platform Services',
        status: 'substituída',
        decision:
          'Reclassificar ind_currencies para currencies, ind_quality_inspections para quality_inspections, etc.',
        motive:
          'Aplicar Princípio da Neutralidade dos Módulos — estruturas com reuso não devem pertencer a um módulo.',
        approver: 'Architecture Council',
        effective_date: '2026-07-15',
        author: 'Arquiteto',
        version: '1.0',
      },
    ]

    for (var j = 0; j < adrs.length; j++) {
      var a = adrs[j]
      try {
        app.findFirstRecordByData('blueprint_adrs', 'code', a.code)
      } catch (_) {
        var arec = new Record(adrCol)
        arec.set('code', a.code)
        arec.set('title', a.title)
        arec.set('status', a.status)
        arec.set('decision', a.decision)
        arec.set('motive', a.motive)
        arec.set('approver', a.approver)
        arec.set('effective_date', a.effective_date)
        arec.set('author', a.author)
        arec.set('version', a.version)
        arec.set('alternatives', JSON.stringify([]))
        arec.set('impacted_modules', JSON.stringify(['industrial', 'financeiro', 'compras']))
        if (ch1Id) arec.set('chapter_id', ch1Id)
        arec.set('relation_ids', JSON.stringify([]))
        app.save(arec)
      }
    }

    var screenLinks = [
      { route: '/admin', label: 'Dashboard', has_doc: true, module: 'Principal' },
      { route: '/admin/blueprint', label: 'Blueprint', has_doc: true, module: 'Administração' },
      {
        route: '/admin/platform-layer',
        label: 'Platform Layer',
        has_doc: true,
        module: 'Administração',
      },
      { route: '/admin/auditoria', label: 'Auditoria', has_doc: false, module: 'Administração' },
      {
        route: '/admin/configuracoes',
        label: 'Configurações',
        has_doc: true,
        module: 'Administração',
      },
    ]

    for (var k = 0; k < screenLinks.length; k++) {
      var s = screenLinks[k]
      try {
        app.findFirstRecordByData('blueprint_screen_links', 'screen_route', s.route)
      } catch (_) {
        var srec = new Record(slCol)
        srec.set('screen_route', s.route)
        srec.set('screen_label', s.label)
        srec.set('has_documentation', s.has_doc)
        srec.set('module_origin', s.module)
        app.save(srec)
      }
    }

    try {
      app.findFirstRecordByData('blueprint_gaps', 'gap_key', '/admin/auditoria')
    } catch (_) {
      var gap = new Record(gapCol)
      gap.set('gap_type', 'screen')
      gap.set('gap_key', '/admin/auditoria')
      gap.set('gap_label', 'Auditoria')
      gap.set('description', 'Tela de Auditoria sem capítulo vinculado no Blueprint')
      gap.set('status', 'pendente')
      gap.set('detected_at', new Date().toISOString())
      app.save(gap)
    }

    console.log('BLUEPRINT-0170: seed data created')
  },
  (app) => {
    var cols = [
      'blueprint_gaps',
      'blueprint_screen_links',
      'blueprint_adrs',
      'blueprint_chapters',
      'blueprint_volumes',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)

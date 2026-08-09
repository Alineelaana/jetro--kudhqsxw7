migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('mk_briefing_templates')
    if (!col.fields.getByName('campaign')) {
      col.fields.add(new TextField({ name: 'campaign' }))
    }
    app.save(col)

    var templates = [
      {
        name: 'Campanha Promocional',
        data: {
          type: 'campanha',
          objective: 'Aumentar vendas e visibilidade da marca',
          audience: 'Consumidor final B2C',
          message: 'Promocao especial com condicoes unicas por tempo limitado',
          product: 'Linha principal de produtos',
          brand: 'VeloraLog',
          campaign: 'Promocao Sazonal',
          channel: 'Digital, PDV e WhatsApp',
          region: 'Espirito Santo',
          period: '30 dias',
          budget: 'R$ 15.000,00',
          deliverables: ['Arte digital', 'Material PDV', 'Posts redes sociais', 'E-mail marketing'],
          references: [],
          restrictions: 'Respeitar guidelines da marca e politicas comerciais',
          approvers: ['Gestor de Marketing', 'Diretoria'],
          active: true,
        },
      },
      {
        name: 'Conteudo Social',
        data: {
          type: 'conteudo',
          objective: 'Educar, informar e engajar seguidores',
          audience: 'Seguidores e comunidade digital',
          message: 'Conteudo educativo sobre logistica e dicas operacionais',
          product: 'Servicos logisticos',
          brand: 'VeloraLog',
          campaign: 'Conteudo Organico',
          channel: 'Instagram, LinkedIn, Facebook',
          region: 'Nacional',
          period: 'Continuo',
          budget: 'R$ 5.000,00',
          deliverables: ['Post carrossel', 'Stories', 'Reels', 'Legenda'],
          references: [],
          restrictions: 'Manter tom institucional e profissional',
          approvers: ['Gestor de Marketing'],
          active: true,
        },
      },
      {
        name: 'Landing Page',
        data: {
          type: 'landing_page',
          objective: 'Geracao de leads qualificados',
          audience: 'Empresas B2B',
          message: 'Solicite seu orcamento personalizado',
          product: 'Solucoes logisticas integradas',
          brand: 'VeloraLog',
          campaign: 'Geracao de Leads',
          channel: 'Google Ads e trafego direto',
          region: 'Espirito Santo',
          period: '60 dias',
          budget: 'R$ 8.000,00',
          deliverables: [
            'Landing page',
            'Formulario',
            'Pagina de obrigado',
            'Pixel de rastreamento',
          ],
          references: [],
          restrictions: 'Seguir LGPD e politicas de dados',
          approvers: ['Gestor de Marketing', 'TI'],
          active: true,
        },
      },
      {
        name: 'Acao Promocional de PDV',
        data: {
          type: 'acao_promocional',
          objective: 'Impulsionar vendas no ponto de venda',
          audience: 'Clientes em lojas fisicas',
          message: 'Condicao especial em fretes para regioes selecionadas',
          product: 'Servicos de transporte e logistica',
          brand: 'VeloraLog',
          campaign: 'Blitz PDV',
          channel: 'PDV e materiais fisicos',
          region: 'Espirito Santo',
          period: '15 dias',
          budget: 'R$ 6.000,00',
          deliverables: ['Banner PDV', 'Flyer', 'Cracha de vendedor', 'Material de balcao'],
          references: [],
          restrictions: 'Validar com equipe comercial antes da producao',
          approvers: ['Gestor de Marketing', 'Gestor Comercial'],
          active: true,
        },
      },
    ]

    for (var i = 0; i < templates.length; i++) {
      var tpl = templates[i]
      var existing = null
      try {
        existing = app.findFirstRecordByData('mk_briefing_templates', 'name', tpl.name)
      } catch (_) {}

      if (existing) {
        var keys = Object.keys(tpl.data)
        for (var j = 0; j < keys.length; j++) existing.set(keys[j], tpl.data[keys[j]])
        app.save(existing)
      } else {
        var c = app.findCollectionByNameOrId('mk_briefing_templates')
        var r = new Record(c)
        r.set('name', tpl.name)
        var keys2 = Object.keys(tpl.data)
        for (var k = 0; k < keys2.length; k++) r.set(keys2[k], tpl.data[keys2[k]])
        app.save(r)
      }
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('mk_briefing_templates')
      var field = col.fields.getByName('campaign')
      if (field) col.fields.remove(field)
      app.save(col)
    } catch (_) {}
  },
)

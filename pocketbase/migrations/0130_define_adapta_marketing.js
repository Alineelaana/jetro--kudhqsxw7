/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'adapta-marketing',
      name: 'ADAPTA Marketing',
      description: 'Assistente de inteligência de marketing e trade marketing.',
      systemPrompt:
        'Você é o ADAPTA Marketing, assistente especializado em marketing e trade marketing da VeloraLog. Responda perguntas sobre: ROI de campanhas, investimento por fornecedor, performance de ações, verbas disponíveis/used/expiring, prestações de contas pendentes, marcas com maior crescimento, melhores/piores campanhas, recomendações de investimento. Base suas respostas exclusivamente nos dados estruturados disponíveis nas coleções. Cite sempre a fonte da informação (nome da coleção e registros consultados). Nunca tome decisões autônomas — apresente dados e análises para apoiar a decisão humana. Diferencie claramente correlação de causalidade ao discutir ROI, respeitando o campo attribution_method (venda_vinculada = causalidade forte, cliente_participante = correlação controlada, produto_periodo_regiao = correlação fraca). Responda em português brasileiro.',
      tier: 'fast',
      tools: [
        { collection: 'trade_marketing_actions', perms: { list: true, read: true } },
        { collection: 'mk_roi_calculations', perms: { list: true, read: true } },
        { collection: 'mk_accountability', perms: { list: true, read: true } },
        { collection: 'mk_materials', perms: { list: true, read: true } },
        { collection: 'mk_events', perms: { list: true, read: true } },
        { collection: 'mk_digital_metrics', perms: { list: true, read: true } },
        { collection: 'mk_budget_lines', perms: { list: true, read: true } },
        { collection: 'mk_annual_plans', perms: { list: true, read: true } },
        { collection: 'mk_competitor_intel', perms: { list: true, read: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'O módulo de Trade & Marketing da VeloraLog gerencia ações de marketing, campanhas, materiais, eventos, PDV, brindes, verbas, ROI e prestação de contas. O sistema reutiliza a infraestrutura existente: agenda corporativa (platform_agenda_events), campanhas de incentivo (incentive_campaigns), verbas de fornecedores (supplier_allowance_*), CRM leads (crm_leads), workflows e auditoria. Não há calendário paralelo nem duplicação de cadastros. O ROI usa metodologia de 3 níveis de atribuição: venda vinculada (causalidade forte), cliente participante (correlação controlada), produto-período-região (correlação fraca). O sistema nunca declara causalidade sem evidência.',
          },
        },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'adapta-marketing')
  },
)

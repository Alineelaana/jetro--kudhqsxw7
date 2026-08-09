/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'industrial-adapta',
      name: 'ADAPTA Industrial',
      description:
        'Assistente de IA especializado na operacao industrial completa — engenharia, PCP, producao, execucao, custos, qualidade, manutencao e inteligencia.',
      systemPrompt:
        'Voce e o ADAPTA Industrial, um assistente de IA especializado na operacao industrial da plataforma. Responda perguntas sobre: por que uma OP atrasou, onde a fabrica perde mais dinheiro, qual maquina gera mais perdas, qual operador tem maior produtividade, qual centro de trabalho e gargalo, como reduzir lead time, qual produto tem maior custo oculto. Use EXCLUSIVAMENTE dados reais das colecoes industriais (production_orders, industrial_phases, industrial_apontamentos, industrial_costs, maintenance_schedules, aps_schedules, quality_non_conformities, industrial_intelligence_alerts, industrial_intelligence_recommendations). Seja conciso, direto e cite os dados utilizados. Se nao houver dados suficientes, diga isso claramente. Nunca altere dados — apenas analise e recomende.',
      tier: 'fast',
      tools: [
        { collection: 'production_orders', perms: { list: true, read: true } },
        { collection: 'industrial_phases', perms: { list: true, read: true } },
        { collection: 'industrial_apontamentos', perms: { list: true, read: true } },
        { collection: 'industrial_costs', perms: { list: true, read: true } },
        { collection: 'maintenance_schedules', perms: { list: true, read: true } },
        { collection: 'aps_schedules', perms: { list: true, read: true } },
        { collection: 'quality_non_conformities', perms: { list: true, read: true } },
        { collection: 'industrial_intelligence_alerts', perms: { list: true, read: true } },
        {
          collection: 'industrial_intelligence_recommendations',
          perms: { list: true, read: true },
        },
        { collection: 'industrial_intelligence_predictions', perms: { list: true, read: true } },
        { collection: 'industrial_intelligence_insights', perms: { list: true, read: true } },
        { collection: 'production_resources', perms: { list: true, read: true } },
        { collection: 'bom_versions', perms: { list: true, read: true } },
        { collection: 'bom_components', perms: { list: true, read: true } },
        { collection: 'production_routes', perms: { list: true, read: true } },
        { collection: 'products', perms: { list: true, read: true } },
        { collection: 'industrial_demand', perms: { list: true, read: true } },
        { collection: 'industrial_kpis', perms: { list: true, read: true } },
        { collection: 'industrial_traceability', perms: { list: true, read: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'Contexto do MES/MOM Industrial: O modulo Industrial gerencia engenharia de produto (BOM, roteiros, ECR/ECO), PCP (MRP, APS, plano mestre, capacidade), producao (ordens, fases, execucao), custos (padrao, real, absorvido), qualidade (NCs, inspecoes), manutencao (preventiva, corretiva, preditiva) e inteligencia (alertas, recomendacoes, previsoes). Todas as analises devem se basear nestes dados reais.',
          },
        },
        {
          type: 'faq',
          payload: {
            qa: [
              {
                question: 'Como analisar atrasos de OPs?',
                answer:
                  'Consulte production_orders com status != concluida/cancelada, compare end_date com a data atual, cruze com industrial_phases para identificar fases paradas ou em retrabalho, e verifique industrial_apontamentos para paradas e refugos.',
              },
              {
                question: 'Como identificar onde a fabrica perde mais dinheiro?',
                answer:
                  'Analise industrial_costs por produto, cruze com industrial_phases onde status = rework, verifique industrial_apontamentos do tipo refugo/perda, e consulte industrial_intelligence_alerts para alertas de custo.',
              },
              {
                question: 'Como identificar gargalos?',
                answer:
                  'Consulte aps_schedules agrupado por resource_id, verifique production_resources com alta carga, e cruze com industrial_intelligence_insights do tipo bottleneck.',
              },
            ],
          },
        },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'industrial-adapta')
  },
)

migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'performance',
      name: 'ADAPTA Performance',
      description:
        'Assistente de análise de performance e indicadores empresariais com base em dados reais de KPIs, scores, benchmarks e alertas.',
      systemPrompt:
        'Você é o ADAPTA Performance, um assistente especializado em análise de performance empresarial. Sua função é analisar indicadores (KPIs), scores de performance, benchmarks e alertas para fornecer insights acionáveis. Sempre baseie suas respostas nos dados disponíveis nas coleções de performance. Quando não houver dados suficientes, informe claramente. Para análises preditivas, considere tendências históricas e fatores sazonais. Estruture suas respostas com clareza: identifique o problema, analise as causas e sugira ações concretas. Responda sempre em português brasileiro.',
      tier: 'reasoning',
      tools: [
        { collection: 'performance_kpis', perms: { list: true, read: true } },
        { collection: 'performance_scores', perms: { list: true, read: true } },
        { collection: 'performance_alerts', perms: { list: true, read: true, update: true } },
        { collection: 'performance_predictions', perms: { list: true, read: true, create: true } },
        { collection: 'performance_gamification', perms: { list: true, read: true } },
        { collection: 'performance_config', perms: { list: true, read: true } },
        { collection: 'performance_benchmarks', perms: { list: true, read: true } },
        {
          collection: 'performance_ai_analysis',
          perms: { list: true, read: true, create: true },
          actAs: 'admin',
        },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'A empresa VeloraLog atua no setor de operações logísticas no Espírito Santo. Os principais KPIs monitorados são: Faturamento Mensal, Entregas no Prazo, Custo Operacional, Satisfação do Cliente e Giro de Estoque. A periodicidade de avaliação é mensal, com revisões semanais para logística.',
          },
        },
        {
          type: 'text',
          payload: {
            text: 'Metas principais: Crescimento de 15% no faturamento, 98% de entregas no prazo, redução de 5% no custo operacional, satisfação do cliente acima de 4.5/5, e giro de estoque de 6x ao ano. O sistema de gamificação está ativo com medalhas, conquistas e rankings.',
          },
        },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'performance')
  },
)

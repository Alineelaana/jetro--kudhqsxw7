migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'performance-intelligence',
      name: 'Centro de Inteligência',
      description:
        'Assistente de inteligência corporativa que analisa performance da empresa, identifica gargalos, oportunidades e sugere ações práticas.',
      systemPrompt:
        'Você é o Centro de Inteligência de Performance Corporativa (CIPC) do ERP VeloraLog. Sua função é responder perguntas sobre a performance da empresa com base exclusivamente nos dados das coleções performance_scores, performance_predictions, performance_alerts, performance_benchmarks e performance_ai_analysis. Sempre explique o RAZÃO de cada conclusão, cite os dados utilizados e sugira ações práticas. Estruture respostas em: Resumo, Análise, Evidências e Recomendações. Use markdown.',
      tier: 'reasoning',
      tools: [
        { collection: 'performance_scores', perms: { list: true, read: true }, actAs: 'admin' },
        {
          collection: 'performance_predictions',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
        { collection: 'performance_alerts', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'performance_benchmarks', perms: { list: true, read: true }, actAs: 'admin' },
        {
          collection: 'performance_ai_analysis',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
        { collection: 'performance_kpis', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'sales_orders', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'financial_receivables', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'products', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'production_orders', perms: { list: true, read: true }, actAs: 'admin' },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'O CIPC analisa a performance corporativa integrando dados de todos os módulos do ERP: comercial, financeiro, fiscal, compras, estoque, logística, produção, marketing, RH, TI e administrativo. Cada indicador é computado automaticamente a partir das coleções existentes, sem entrada manual de dados. O foco é melhorar processos, não controlar pessoas.',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'performance-intelligence')
    } catch (_) {}
  },
)

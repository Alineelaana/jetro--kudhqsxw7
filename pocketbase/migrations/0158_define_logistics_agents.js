migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'wms-agent',
      name: 'Agente WMS',
      description:
        'Especialista em operações de armazém — recebimento, armazenagem, separação, expedição e inventário.',
      systemPrompt:
        'Você é o Agente WMS, especialista em operações de armazém. Responda perguntas sobre recebimento, conferência, endereçamento, armazenagem, pallets, volumes, reabastecimento, ondas de separação, picking, FIFO/FEFO, conferência de expedição, inventário, ocupação, operadores e coletores. Use os dados das collections do WMS para responder com precisão. Se a pergunta for sobre transporte ou logística fora do armazém, oriente o usuário a consultar o agente correspondente.',
      tier: 'fast',
      tools: [
        { collection: 'wms_receipts', perms: { read: true, list: true } },
        { collection: 'wms_receipt_checks', perms: { read: true, list: true } },
        { collection: 'wms_putaway_tasks', perms: { read: true, list: true } },
        { collection: 'wms_waves', perms: { read: true, list: true } },
        { collection: 'wms_separations', perms: { read: true, list: true } },
        { collection: 'wms_replenishments', perms: { read: true, list: true } },
        { collection: 'wms_expedition_checks', perms: { read: true, list: true } },
        { collection: 'wms_shippings', perms: { read: true, list: true } },
        { collection: 'wms_romaneios', perms: { read: true, list: true } },
        { collection: 'wms_pallets', perms: { read: true, list: true } },
        { collection: 'wms_volumes', perms: { read: true, list: true } },
        { collection: 'wms_operators', perms: { read: true, list: true } },
        { collection: 'wms_operational_alerts', perms: { read: true, list: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'WMS é responsável por tudo que acontece dentro do armazém: recebimento físico, conferência, endereçamento, armazenagem, pallets, volumes, reabastecimento, ondas de separação, picking, FIFO/FEFO, conferência de expedição, inventário, movimentações internas, mapa do armazém, ocupação, operadores e coletores. A responsabilidade do WMS termina quando a mercadoria está inspecionada, documentada e fisicamente pronta para carregar/expedir.',
          },
        },
      ],
    })

    $ai.agents.define(app, {
      slug: 'transporte-agent',
      name: 'Agente Transporte',
      description:
        'Especialista em transporte — planejamento de carga, roteirização, viagens, veículos, motoristas, fretes, rastreamento e entregas.',
      systemPrompt:
        'Você é o Agente Transporte, especialista em operações de transporte. Responda sobre formação de cargas, roteirização, viagens, veículos, motoristas, transportadoras, fretes, tabelas de frete, rastreamento, entregas, comprovantes, ocorrências de transporte, custos de transporte e desempenho. Use os dados das collections de logística e transporte. Se a pergunta for sobre operações dentro do armazém, oriente ao Agente WMS. Se for sobre orquestração end-to-end, oriente ao Agente Logístico.',
      tier: 'fast',
      tools: [
        { collection: 'logistics_routes', perms: { read: true, list: true } },
        { collection: 'logistics_deliveries', perms: { read: true, list: true } },
        { collection: 'logistics_vehicles', perms: { read: true, list: true } },
        { collection: 'logistics_drivers', perms: { read: true, list: true } },
        { collection: 'logistics_freights', perms: { read: true, list: true } },
        { collection: 'logistics_freight_tables', perms: { read: true, list: true } },
        { collection: 'logistics_tracking', perms: { read: true, list: true } },
        { collection: 'logistics_occurrences', perms: { read: true, list: true } },
        { collection: 'logistics_proof_delivery', perms: { read: true, list: true } },
        { collection: 'logistics_costs', perms: { read: true, list: true } },
        { collection: 'transport_journeys', perms: { read: true, list: true } },
        { collection: 'wms_romaneios', perms: { read: true, list: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'Transporte é responsável por tudo que acontece da origem ao destino: planejamento de transporte, formação/consolidação de carga, rotas e planejamento de rotas, veículos, motoristas, transportadoras, jornadas, fretes, tabelas de frete, cotação, contratação, rastreamento, entregas, comprovantes, ocorrências de transporte, custos de transporte, desempenho, frota própria, transporte terceirizado e logística reversa relacionada ao deslocamento.',
          },
        },
      ],
    })

    $ai.agents.define(app, {
      slug: 'logistics-agent',
      name: 'Agente Logístico',
      description:
        'Visão transversal de orquestração logística — fluxo end-to-end, gargalos, lead time, custo total e exceções.',
      systemPrompt:
        'Você é o Agente Logístico, com visão transversal de orquestração da cadeia logística. Você responde perguntas como: por que este pedido ainda não chegou? Em qual etapa estão os gargalos? Qual parte da cadeia está aumentando o lead time? Onde estamos perdendo dinheiro? Você consulta dados tanto do WMS quanto do Transporte para dar uma visão consolidada. Não repita operações — você orquestra e acompanha. Identifique onde o fluxo está travado mesmo quando a execução pertence a outro módulo.',
      tier: 'fast',
      tools: [
        { collection: 'wms_receipts', perms: { read: true, list: true } },
        { collection: 'wms_waves', perms: { read: true, list: true } },
        { collection: 'wms_separations', perms: { read: true, list: true } },
        { collection: 'wms_shippings', perms: { read: true, list: true } },
        { collection: 'wms_romaneios', perms: { read: true, list: true } },
        { collection: 'wms_operational_alerts', perms: { read: true, list: true } },
        { collection: 'logistics_deliveries', perms: { read: true, list: true } },
        { collection: 'logistics_routes', perms: { read: true, list: true } },
        { collection: 'logistics_occurrences', perms: { read: true, list: true } },
        { collection: 'logistics_costs', perms: { read: true, list: true } },
        { collection: 'logistics_tracking', perms: { read: true, list: true } },
        { collection: 'transport_journeys', perms: { read: true, list: true } },
        { collection: 'logistics_reverse_operations', perms: { read: true, list: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'Logística é a torre de orquestração que coordena a cadeia end-to-end. Responde: o que precisa ser movido, de onde, para onde, quando, prioridade, prontidão, onde está travado, qual área é responsável agora e o impacto de um atraso. Fluxo formal: PEDIDO/NECESSIDADE → LOGÍSTICA (prioridade, necessidade de movimentação, prazo) → WMS (separa, inspeciona, prepara fisicamente) → TRANSPORTE (planeja carga, rota, veículo, motorista, viagem) → WMS (carregamento físico e confirmação de saída) → TRANSPORTE (viagem, rastreamento, entrega) → TRANSPORTE (registra comprovante/ocorrência) → LOGÍSTICA (acompanha resultado end-to-end).',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'wms-agent')
    } catch (_) {}
    try {
      $ai.agents.delete(app, 'transporte-agent')
    } catch (_) {}
    try {
      $ai.agents.delete(app, 'logistics-agent')
    } catch (_) {}
  },
)

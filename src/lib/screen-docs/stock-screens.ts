import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 6 TELAS OFICIAIS DO MÓDULO ESTOQUE E WMS
 * Consolidando as ~22 telas de Estoque + WMS e o módulo avulso "Validade"
 * Lida diretamente do código real implementado em src/components/stock/screens/:
 * 1. Central de Estoque (screen-central-estoque.tsx) - /admin/estoque
 * 2. Movimentações (screen-movimentacoes.tsx) - /admin/estoque/movimentacoes
 * 3. Inventário e Conferência (screen-inventario-conferencia.tsx) - /admin/estoque/inventario
 * 4. Lotes e Validade (screen-lotes-validade.tsx) - /admin/estoque/lotes
 * 5. WMS Operacional (screen-wms-operacional.tsx) - /admin/estoque/wms-operacional
 * 6. WMS Gerencial (screen-wms-gerencial.tsx) - /admin/estoque/wms-gerencial
 */
export const STOCK_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // 1. CENTRAL DE ESTOQUE
  // -------------------------------------------------------------
  '/admin/estoque': {
    route: '/admin/estoque',
    title: 'Central de Estoque',
    moduleGroup: 'Estoque e WMS',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como a torre de controle operacional e cockpit executivo do estoque físico e WMS, consolidando indicadores em tempo real, monitoramento de criticidade, alertas preventivos de ruptura e atalhos interativos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 Indicadores clicáveis interativos no topo (redirecionam diretamente para as telas correspondentes no módulo):\n  1. "Valor em Estoque" -> WMS Gerencial (/admin/estoque/wms-gerencial);\n  2. "Ponto de Pedido" -> Movimentações (/admin/estoque/movimentacoes);\n  3. "Itens Zerados" -> Inventário e Conferência (/admin/estoque/inventario);\n  4. "Lotes a Vencer" -> Lotes e Validade (/admin/estoque/lotes);\n  5. "Bloqueados Qualidade" -> Lotes e Validade (/admin/estoque/lotes);\n  6. "Movimentações" -> Movimentações (/admin/estoque/movimentacoes).\n- 2 Abas Internas estruturadas:\n  1. "Painel Operacional": métricas operacionais consolidadas, catálogo de saldo físico, alertas de reposição e status geral;\n  2. "Alertas de Estoque": centro de alertas operacionais WMS e desvios de saldo.\n- Suporte a multitenancy por empresa ativa via hook `useBrand` e atualização em tempo real via `useRealtime`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Indicadores são apurados considerando estritamente a empresa/filial ativa no contexto do `useBrand`.\n- Ponto de pedido sinalizado sempre que o saldo disponível for menor ou igual ao estoque mínimo cadastrado.\n- Lotes bloqueados pela qualidade ou em quarentena são segregados dos saldos disponíveis para separação comercial.\n- Navegação respeita a regra inviolável do Jetro (navegação externa exclusivamente pelo menu lateral e interna por abas da tela).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor de estoque acessa `/admin/estoque`.\n2. A tela carrega simultaneamente itens de estoque, movimentações recentes e saldos de lotes.\n3. O usuário audita os indicadores clicáveis de valor, ruptura ou lotes a vencer e clica no card desejado para aprofundamento na tela especializada.\n4. Na aba "Painel Operacional", monitora em tempo real a evolução física do armazém.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `stock_items`, `stock_movements`, `stock_batches`, `wms_alerts`.\n- Hooks: `useBrand` para tenant ativo e `useRealtime` para atualizações automáticas de movimentações e saldos.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Compras (suprimentos de ponto de pedido).\n- Módulo de Vendas (reservas automáticas e checagem de saldo).\n- Módulo Industrial (consumo de insumos de produção).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: controlada por `canViewStock(role)` (perfis SUP, ADMIN, ESTOQUE, OPERADOR e DIRETORIA).\n- Atualização sob demanda via botão "Atualizar".',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCentralEstoque`, `StockDashboard`, `WmsAlertsCenter`.\n- Serviços: `@/services/stock` e `@/services/wms`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Consultas assíncronas com tratamento seguro via Promise.all e fallback de valores.\n- Mensagens de feedback ao usuário via toast.',
    },
  },

  // -------------------------------------------------------------
  // 2. MOVIMENTAÇÕES
  // -------------------------------------------------------------
  '/admin/estoque/movimentacoes': {
    route: '/admin/estoque/movimentacoes',
    title: 'Movimentações de Estoque',
    moduleGroup: 'Estoque e WMS',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Controlar integralmente o fluxo físico de entradas, saídas, transferências entre filiais/depósitos, ajustes e auditoria detalhada de movimentações de estoque.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 5 Abas Internas estruturadas:\n  1. "Entradas": fluxo especializado de entradas por compra (NF-e fornecedor), devolução de clientes e remessas bonificadas;\n  2. "Saídas": saídas vinculadas a faturamento de pedidos, requisições de fábrica e perdas identificadas;\n  3. "Transferências": ordens de transferência entre depósitos internos, plantas industriais e filiais com conferência de trânsito;\n  4. "Ajustes & Precisão": registro de acertos positivos/negativos com justificativa formal;\n  5. "Histórico Completo": visão analítica de todas as movimentações com filtros por produto, documento, lote, tipo e período.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Toda movimentação gera registro imutável com data/hora, tipo, documento de origem, lote, saldo anterior e novo saldo.\n- Saídas não podem movimentar saldo negativo para itens sem autorização de estoque em descoberto.\n- Transferências entre filiais exigem baixa na origem e aceite formal de recebimento no destino.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador acessa `/admin/estoque/movimentacoes`.\n2. Na aba correspondente ao evento físico (Entradas, Saídas, Transferências ou Ajustes), pesquisa pelo produto ou documento.\n3. O sistema calcula e reflete imediatamente a atualização do saldo físico e contábil do item.\n4. Na aba "Histórico Completo", consulta o extrato completo para auditoria e conciliação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `stock_movements`, `stock_transfers`, `stock_adjustments`, `stock_items`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Fiscal (vinculação com notas fiscais de entrada e saída).\n- Módulo Industrial (requisição de matéria-prima e devolução de sobras).\n- Módulo de Vendas (baixas de expedição).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewStock(role)`.\n- Registro de movimentações e ajustes: perfis autorizados de almoxarifado e estoque.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenMovimentacoes`, `StockMovements`, `StockTransfers`, `StockAdjustments`.\n- Serviços: `@/services/stock`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de quantidade superior a zero e preenchimento obrigatório de justificativa em ajustes manuais.',
    },
  },

  // -------------------------------------------------------------
  // 3. INVENTÁRIO E CONFERÊNCIA
  // -------------------------------------------------------------
  '/admin/estoque/inventario': {
    route: '/admin/estoque/inventario',
    title: 'Inventário e Conferência',
    moduleGroup: 'Estoque e WMS',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Garantir a acuracidade físico-contábil do estoque por meio de inventários gerais, contagens cíclicas/rotativas, conferência cega de mercadorias e aprovação de divergências com ajustes.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 3 Abas Internas estruturadas:\n  1. "Inventários Gerais": abertura de campanhas de inventário (geral, por setor ou categoria), congelamento de estoque, contagens e fechamento com conciliação;\n  2. "Contagem Cíclica & Cega": gestão de inventário rotativo programado por curva ABC e interface de contagem cega para conferentes de campo;\n  3. "Divergências & Ajustes": conferência de recebimento/expedição, relatório de divergências (físico × sistêmico) e workflow de aprovação de ajustes de estoque.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O fechamento de inventário exige dupla contagem quando identificada divergência percentual acima da tolerância permitida.\n- Ajustes decorrentes de inventário alimentam automaticamente o histórico de movimentações com tipo "Ajuste Positivo" ou "Ajuste Negativo".\n- Respeito irrestrito ao multitenancy da empresa proprietária do depósito.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O coordenador de inventário cria a campanha na aba "Inventários Gerais".\n2. Os operadores de campo realizam a contagem cega na aba "Contagem Cíclica & Cega".\n3. Na aba "Divergências & Ajustes", o sistema confronta o saldo apurado com o saldo do ERP.\n4. O supervisor valida as justificativas e homologa os ajustes de reconciliação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `stock_inventories`, `stock_checking`, `stock_adjustments`, `wms_rotational_inventory`, `wms_blind_count`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Controladoria (conciliação de perdas e sobras de inventário no fechamento mensal).\n- Coletores RF e leitores de código de barras.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewStock(role)`.\n- Abertura e fechamento de inventário: gestores de logística, auditoria e estoque.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenInventarioConferencia`, `StockInventory`, `StockChecking`, `StockAdjustments`, `WmsRotationalInventory`, `WmsBlindCount`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Bloqueio de movimentação física em setores bloqueados para contagem simultânea.',
    },
  },

  // -------------------------------------------------------------
  // 4. LOTES E VALIDADE
  // -------------------------------------------------------------
  '/admin/estoque/lotes': {
    route: '/admin/estoque/lotes',
    title: 'Lotes e Validade',
    moduleGroup: 'Estoque e WMS',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Absorve e consolida o controle de lotes e a gestão de validade/vencimentos (módulo avulso unificado): monitoramento de saldos por lote, política FEFO (First-Expired, First-Out), bloqueios sanitários da qualidade, janelas preventivas de alerta e rastreabilidade genealógica.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 4 Abas Internas estruturadas:\n  1. "Saldos por Lote": saldos físicos disponíveis, reservados e em trânsito por lote fabril com data de fabricação e validade;\n  2. "Validade & FEFO": curva de vencimento de lotes, priorização automática de expedição por FEFO e Central de Alertas consolidada com janelas de 30/60/90 dias;\n  3. "Bloqueios & Qualidade": gestão ativa de bloqueios/liberações com trava de expedição para produtos em quarentena ou laudo inconclusivo;\n  4. "Rastreabilidade de Lote": árvore genealógica completa do lote, histórico de ocorrências, regras de validade e assistente interativo de vencimentos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Lotes com data de validade expirada são bloqueados compulsoriamente para expedição e consumo industrial.\n- Sugestão de separação de picking segue estritamente a ordem cronológica do FEFO (lote a vencer primeiro é separado primeiro).\n- Liberações de lotes bloqueados pela qualidade exigem registro de usuário responsável e laudo de inspeção.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Ao dar entrada de mercadoria, o lote e sua data de validade são registrados.\n2. Na aba "Validade & FEFO", o painel monitora os lotes em janela de atenção preventiva.\n3. Se identificado desvio de qualidade, o lote é bloqueado na aba "Bloqueios & Qualidade".\n4. Em caso de auditoria ou recall, a aba "Rastreabilidade de Lote" reconstrói toda a movimentação do lote no ERP.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `stock_batches`, `stock_items`, `validity_alerts`, `validity_rules`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Industrial (rastreabilidade de insumos em OPs e inspeção de controle de qualidade).\n- Módulo Comercial (alertas preventivos para desova de produtos próximos ao shelf life crítico).\n- Módulo Fiscal (informação do lote nas tags específicas da NF-e).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewStock(role)` e `canViewValidityAlerts(role)`.\n- Bloqueio e liberação sanitária: inspetores de qualidade e coordenação técnica.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenLotesValidade`, `StockBatches`, `StockExpiry`, `ValidityAlertsCenter`, `ValidityRulesConfig`, `ValidityChat`.\n- Serviços: `@/services/stock`, `@/services/validity-alerts`, `@/services/validity-rules`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio automático de tentativas de liberação de lotes vencidos sem revalidação laboratorial.',
    },
  },

  // -------------------------------------------------------------
  // 5. WMS OPERACIONAL
  // -------------------------------------------------------------
  '/admin/estoque/wms-operacional': {
    route: '/admin/estoque/wms-operacional',
    title: 'WMS Operacional',
    moduleGroup: 'Estoque e WMS',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar em tempo real todas as atividades de chão de armazém: recebimento em docas, endereçamento (putaway), separação de pedidos (picking), consolidação de ondas, reabastecimento ativo, pallets, volumes, coletores de código de barras e escala de operadores.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 8 Abas Internas estruturadas:\n  1. "Recebimento": agendamento de descargas, docas e conferência física de entrada;\n  2. "Endereçamento": indicação inteligente de rua, bloco, nível e vão (putaway) e estrutura de localizações;\n  3. "Picking": ordens de separação por pedido ou lote com leitura de código de barras;\n  4. "Ondas": consolidação e liberação de ondas de separação (wave picking) por rota ou transportadora;\n  5. "Reabastecimento": ordens de abastecimento da área de picking a partir do aéreo/pulmão;\n  6. "Pallets/Volumes": controle de lastro, amarração de pallets, volumes e etiquetas de embalagem;\n  7. "Coletores": gerenciamento e homologação de coletores RF e leitores de código de barras;\n  8. "Operadores": produtividade individual, escala de turnos e atribuição de tarefas no armazém.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Nenhuma mercadoria pode ser liberada para picking antes da conclusão do endereçamento (putaway) na localização ativa.\n- O reabastecimento preventivo é disparado assim que o endereço de picking atinge o nível mínimo de reposição.\n- Separação com divergência física gera alerta imediato para supervisão do armazém.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O caminhão chega e a equipe faz o recebimento na doca (Aba Recebimento).\n2. O sistema sugere o melhor endereço no porta-palete (Aba Endereçamento).\n3. Ordens de venda faturadas são agrupadas em ondas (Aba Ondas).\n4. Os separadores executam o picking via coletor de código de barras (Abas Picking e Coletores).\n5. Os volumes são montados e conferidos para transferência à expedição.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `wms_receipts`, `wms_putaways`, `wms_separations`, `wms_waves`, `wms_replenishments`, `wms_pallets`, `wms_volumes`, `wms_collectors`, `wms_operators`, `stock_locations`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Logística e TMS (conexão direta de ondas de expedição com romaneios de entrega).\n- Módulo Comercial (reserva física de pedidos).\n- Leitores de código de barras e coletores de dados Android/Zebra.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewStock(role)`.\n- Execução de tarefas: conferentes, operadores de empilhadeira, separadores e líderes de logística.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenWmsOperacional`, `WmsReceiving`, `WmsPutaway`, `WmsSeparation`, `StockPicking`, `WmsWaves`, `WmsReplenishment`, `WmsPallets`, `WmsVolumes`, `WmsCollectors`, `WmsOperators`, `StockLocations`.\n- Serviços: `@/services/wms` e `@/services/stock`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de capacidade volumétrica de rua e peso máximo por vão para evitar sobrecarga estrutural nas estantes.',
    },
  },

  // -------------------------------------------------------------
  // 6. WMS GERENCIAL
  // -------------------------------------------------------------
  '/admin/estoque/wms-gerencial': {
    route: '/admin/estoque/wms-gerencial',
    title: 'WMS Gerencial',
    moduleGroup: 'Estoque e WMS',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover a inteligência analítica e gestão executiva do estoque e armazenagem: indicadores de desempenho operacional (KPIs), ocupação volumétrica, rotatividade (giro) e curva ABC, e relatórios gerenciais consolidados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 3 Abas Internas estruturadas:\n  1. "Indicadores de Desempenho": métricas de produtividade por operador, índice de divergências de separação, throughput de docas e tempos médios de ciclo;\n  2. "Ocupação & Rotatividade": taxa de ocupação física de posições-palete, giro de estoque, acuracidade de inventário e distribuição por Curva ABC (classes A, B e C);\n  3. "Relatórios Gerenciais": relatórios executivos para exportação nos formatos PDF, Excel e CSV com filtros por empresa, filial, depósito, turno e período.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Métricas de ocupação consideram as dimensões úteis dos endereços e volumes cúbicos dos produtos armazenados.\n- Índices de produtividade de operador são apurados a partir dos carimbos de data/hora registrados nas leituras dos coletores.\n- Isolamento estrito de dados por empresa e filial selecionada via `useBrand`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gerente de logística/operações acessa `/admin/estoque/wms-gerencial`.\n2. Define o período e filtros desejados no cabeçalho analítico.\n3. Analisa os gráficos de produtividade e ocupação do armazém.\n4. Exporta relatórios consolidados em Excel ou PDF para apresentações de resultados.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `wms_separations`, `wms_receipts`, `wms_shippings`, `stock_locations`, `stock_movements`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo BI Corporativo (cubos de armazenagem e movimentação de mercadorias).\n- Módulo de Controladoria (avaliação de custos de armazenagem).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewStock(role)` e perfis de gestão (SUP, ADMIN, LOGISTICA, ESTOQUE, DIRETORIA).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenWmsGerencial`, `WmsManagerialDashboard`, `WmsReports`.\n- Serviços: `@/services/wms` e `@/services/stock`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento seguro para armazéns sem histórico prévio com exibição de gráficos vazios estilizados.',
    },
  },
}

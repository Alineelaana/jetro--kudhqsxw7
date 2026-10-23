import type { ScreenDocEntry } from './types'

export const INTELIGENCIA_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  '/admin/inteligencia': {
    route: '/admin/inteligencia',
    title: 'Central de Inteligência — Visão Executiva Integrada',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Servir como cockpit executivo e torre de controle estratégica unificada do HURAM ERP, centralizando indicadores corporativos em tempo real das áreas Comercial, Estoque, Financeiro, Industrial, Logística e Vendas, com indicadores clicáveis e navegação analítica direta.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 Indicadores Clicáveis por Área: Comercial (faturamento), Estoque (itens cadastrados e giro), Financeiro (fluxo de caixa), Industrial (ordens e volume), Logística (expedição e entregas) e Vendas (pedidos abertos e ticket), cada um navegando diretamente para a respectiva aba da tela Inteligência por Área.\n- Painel Econômico Consolidado: Receita Líquida, Lucro Bruto, EBITDA e Margem Operacional.\n- Métricas de Carteira: Clientes Ativos, Novos Clientes, Ticket Médio e Taxa de Inadimplência.\n- Metas e Projeções: Projeção mensal estimada, crescimento percentual previsto e alertas corporativos ativos.\n- Integração com useRealtime nas coleções `sales_orders`, `financial_receivables` e `stock_movements`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Indicadores são consolidados respeitando o multitenancy por empresa ativa selecionada no seletor global (`useBrand`).\n- Clicar em qualquer indicador por área direciona para `/admin/inteligencia/por-area?tab={area}` sem duplicar submenus na interface.\n- Os dados econômicos utilizam os cálculos auditados de `getExecutiveAnalytics`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A diretoria ou gestores executivos acessam a Central de Inteligência.\n2. O painel executa consultas paralelas nos serviços de inteligência analítica.\n3. O gestor analisa o cenário macro e clica em um card ou indicador para aprofundar na tela Inteligência por Área.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `financial_receivables`, `financial_payables`, `production_orders`, `stock_items`, `stock_movements`, `partners`, `bi_dashboards`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulos Comercial, Financeiro, Estoque, Indústria e Logística.\n- Painel de Dashboards e Projeções e Centro de Relatórios e Agendamentos.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização controlada por `canViewBI(role)` (perfis SUP, DIRETORIA, ADMIN, CONTROLADORIA, GERENCIA).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenCentralInteligencia`, `BiDrillDown`, serviços `getExecutiveAnalytics`, hooks `useBrand`, `useRealtime`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento defensivo em chamadas de API com estados de loading e mensagens informativas em caso de indisponibilidade de rede.',
    },
  },

  '/admin/inteligencia/dashboards-projecoes': {
    route: '/admin/inteligencia/dashboards-projecoes',
    title: 'Dashboards e Projeções',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Oferecer construtor de dashboards personalizados para os centros analíticos da empresa e motor de projeções preditivas de vendas e faturamento baseadas em histórico real e dias úteis trabalhados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Dashboards Personalizados": criação, configuração de centro de inteligência, compartilhamento com outros usuários e listagem de dashboards sob medida (`BiCustomDashboards`).\n- Aba "Projeções e Tendências": simulação de metas de faturamento, curvas diárias ideais × realizadas, projeção de fim de mês e análise preditiva (`BiProjection`).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A criação de dashboards personalizados requer permissão de gerenciamento (`canManageCustomDashboards`).\n- Projeções de vendas consideram calendário de dias úteis e faturamento faturado no mês corrente.\n- Dashboards marcados como compartilhados ficam visíveis para todos os usuários com acesso ao módulo.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário seleciona a aba Dashboards Personalizados para montar visualizações customizadas por centro.\n2. Para análise de tendências de faturamento, comuta para a aba Projeções e Tendências, informando meta e comparando o ritmo diário real versus planejado.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `bi_dashboards`, `sales_orders`, `invoices`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Comercial para leitura de pedidos faturados.\n- Calendário corporativo para cálculo de dias úteis.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Leitura: `canViewBI(role)`.\n- Criação/Edição de dashboards: `canManageCustomDashboards(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenDashboardsProjecoes`, `BiCustomDashboards`, `BiProjection`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de campos obrigatórios ao criar dashboards e cálculo defensivo para meses sem faturamento.',
    },
  },

  '/admin/inteligencia/por-area': {
    route: '/admin/inteligencia/por-area',
    title: 'Inteligência por Área',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Unificar em uma tela multi-aba a inteligência setorial profunda do HURAM ERP, cobrindo os pilares operacionais essenciais: Comercial, Estoque, Financeiro, Industrial, Logística e Vendas, preservando serviços e consultas analíticas originais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Comercial": rankings de clientes, faturamento por vendedor, evolução de pedidos e metas (`BiCommercial`).\n- Aba "Estoque": capital parado, curva ABC de itens, produtos sem giro e riscos de ruptura (`BiStock`).\n- Aba "Financeiro": conciliação gerencial, contas a pagar × receber, DRE sintético e fluxo (`BiFinancial`).\n- Aba "Industrial": OEE consolidado, apontamento de ordens fabris, capacidade instalada e gargalos (`BiIndustrial`).\n- Aba "Logística": OTIF, performance de entregas, custos de frete e avarias em transporte (`BiGenericCenter` com `logistics-intel`).\n- Aba "Vendas": análise granular de pedidos, tíquete médio por canal e conversão (`BiSales`).\n- Suporte a sincronização via URL (`?tab=comercial|estoque|financeiro|industrial|logistica|vendas`).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Acesso centralizado preservando consultas e serviços existentes (`bi-analytics-centers`, `bi-analytics-extended`).\n- Sincronização bidirecional entre parâmetro de URL `?tab=` e a aba ativa da tela.\n- Sem qualquer alteração em schemas de banco ou contratos de dados.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário pode abrir diretamente uma aba específica a partir dos cards clicáveis da Central de Inteligência.\n2. O painel carrega dinamicamente a área selecionada mantendo filtros e contexto do tenant ativo.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `stock_items`, `stock_movements`, `financial_receivables`, `financial_payables`, `production_orders`, `transport_deliveries`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulos de Operação e Finanças para consumo direto dos dados corporativos homologados.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Acesso liberado para perfis autorizados em `canViewBI(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenInteligenciaPorArea`, `BiCommercial`, `BiStock`, `BiFinancial`, `BiIndustrial`, `BiSales`, `BiGenericCenter`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento com mensagens explicativas caso uma área não possua movimentações no período selecionado.',
    },
  },

  '/admin/inteligencia/relatorios': {
    route: '/admin/inteligencia/relatorios',
    title: 'Relatórios e Agendamentos',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar o catálogo oficial de relatórios de todos os departamentos da empresa e a esteira de agendamentos automatizados de envio periódico por e-mail, absorvendo a Central de Relatórios e a automação de disparos programados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Catálogo de Relatórios": busca instantânea por palavra-chave, sistema de favoritos com persistência local, categorização por departamento e atalhos diretos (`BiReportCenter`).\n- Aba "Agendamentos Automáticos": gestão completa de agendamentos periódicos (diário, semanal, quinzenal, mensal), seleção de destinatários, filtros dinâmicos de período, disparo manual imediato e histórico de execuções (`ReportSchedulesPage`).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Usuários de gestão consultam e gerenciam seus próprios agendamentos; o perfil SUP visualiza e administra todos os agendamentos corporativos.\n- Agendamentos com status "paused" ou "error" não disparam tarefas automáticas até reativação ou revisão técnica.\n- Preservadas 100% das integrações do endpoint `/backend/v1/report-schedules/trigger` e coleção `report_schedules`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário acessa a aba Catálogo de Relatórios para localizar o relatório desejado ou favoritar relatórios recorrentes.\n2. Na aba Agendamentos Automáticos, clica em "Novo Agendamento", define módulo, frequência, filtros e lista de e-mails.\n3. O backend processa os relatórios nos horários programados ou via acionamento manual imediato.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `report_schedules`, `report_schedule_executions`, `audit_logs` e catálogo de inventário corporativo.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Motor de envio de relatórios e exportações em XLSX e PDF do HURAM ERP.\n- Serviço de mensageria e notificações do Skip Cloud.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Leitura de catálogo: `canViewBI(role)`.\n- Gestão de agendamentos: baseada no módulo do relatório e perfil (SUP irrestrito).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenRelatoriosAgendamentos`, `BiReportCenter`, `ReportSchedulesPage`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alerta visual para agendamentos com falha de disparo e relatório detalhado de erros no histórico de execuções.',
    },
  },
}

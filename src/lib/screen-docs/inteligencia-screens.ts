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

  '/admin/inteligencia/visao-estrategica-360': {
    route: '/admin/inteligencia/visao-estrategica-360',
    title: 'Visão estratégica em 360°',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2026-11-24',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Consolidar em uma única tela multi-aba o painel estratégico do grupo: um retrato de vendas, faturamento, marcas, produtos, estoque, financeiro, fluxo de caixa, clientes e fornecedores/verbas, alimentado por filtros globais aplicados de uma só vez (botão Processar), replicando a visão "360°" do sistema de referência.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Filtros globais no rodapé do cartão superior: Origem (multisseleção de empresas), Marca (texto), Dia Referência (date) e Mês/Ano Referência (mm/aaaa), com botão "Processar".\n- 10 abas: Flash de Vendas, Objetivo, Faturamento, Marcas, Produtos, Estoque, Financeiro, Fluxo de Caixa, Clientes e Fornecedores / Verbas.\n- Flash de Vendas: cartões de unidades/valor/pedidos na semana + tabela dos últimos 7 dias comparada à semana anterior (UN, evolução %, pedidos, SKUs, itens e UN por pedido, valores).\n- Objetivo: unidades e valor realizados no mês de referência.\n- Faturamento: NF-e emitidas hoje, clientes e unidades faturados hoje, valor faturado hoje/semana/mês, romaneios e devoluções.\n- Marcas: tabela Top N% de marcas do mês (NF, UN, total, média, custo, markup, participação) com slider de percentual.\n- Produtos: SKUs e marcas ativos, itens com/sem estoque, críticas de cadastro, produtos sem foto, vendidos abaixo da tabela e tabela Top N% de produtos mais vendidos.\n- Estoque: comparativo Fiscal × WMS × Avarias × Diferença com busca "Procurar" e lista de SKUs inativos com estoque.\n- Fluxo de Caixa: saldos e tabela semanal de direitos/obrigações (real e previsto) com saldo do dia e acumulado.\n- Clientes: títulos atrasados/a vencer/liberados e ranking de clientes que mais compraram no mês.\n- Fornecedores / Verbas: fornecedores cadastrados e ativos, compras e verbas do período e top fornecedores.\n- Cartões de indicador com lupa (drill-down) que navegam para as telas reais do ERP.\n- Sem botão de refresh/engrenagem: atualização embutida via queryKey.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O rascunho dos filtros só entra em vigor ao clicar em "Processar": alterar filtros não recalcula nada antes do clique.\n- Cada aba tem sua própria consulta React Query com queryKey dependente dos filtros aplicados; ao Processar, as abas recalculam sozinhas.\n- A marca informada é aplicada apenas nas consultas que a suportam; a Origem (empresa) é aplicada sempre.\n- Coleção inexistente ou sem dados exibem painel vazio/zeros — nunca erro.\n- Navegação entre telas exclusivamente pelo menu lateral; a lupa apenas abre telas de detalhe reais, não duplica submenus.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário abre a tela pelo menu lateral (Inteligência > Visão estratégica em 360°).\n2. Ajusta os filtros globais do topo (Origem, Marca, Dia Referência, Mês/Ano Referência).\n3. Clica em "Processar": os filtros aplicados mudam e as abas recalculam via queryKey.\n4. Navega entre as 10 abas para analisar cada dimensão.\n5. Nos cartões com lupa, clica para abrir a tela real de detalhe correspondente.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders` (Flash de Vendas), `nfe_records` (Objetivo, Faturamento), `products` (Marcas, Produtos, Estoque), `financial_transactions` (Financeiro, Fluxo de Caixa, Clientes), `partners` (Fornecedores) e `empresas` (opções do filtro Origem).\n- Quando uma coleção não retorna dados (ou não existe), a aba exibe painel vazio/zeros.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Drill-down por lupa para as telas reais: /admin/vendas/faturamento, /admin/comercial/pedidos-faturamento, /admin/financeiro/receber, /admin/financeiro/pagar, /admin/estoque, /admin/fiscal/documentos-fiscais, /admin/fiscal/compras-entradas, /admin/logistica/romaneios, /admin/comercial/contratos-devolucoes e cadastros de produtos/marcas/fornecedores.\n- Nenhuma integração externa: toda leitura é direto do PocketBase local.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso pelo menu controlado por `canViewBI(role)` (perfis SUP, DIRETORIA, ADMIN, CONTROLADORIA e GERENCIA, como o restante do grupo Inteligência).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes em `src/components/estrategia360/`: `estrategia360-screen.tsx` (painel principal com filtros e abas), `origem-selector.tsx` (multisseleção de Origem), `widgets.tsx` (IndicatorCard com lupa, SearchableTable, EmptyPanel), `data.ts` (consultas PocketBase com fallback vazio), `types.ts` (tipos e definição das abas) e um arquivo por grupo de abas (`flash-vendas`, `objetivo-faturamento-marcas`, `produtos-estoque-fluxo`, `financeiro-clientes-fornecedores`).\n- `@tanstack/react-query` para as consultas por queryKey.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Toda consulta tem try/catch com fallback vazio/zeros: coleção inexistente, sem permissão ou sem rede exibem o painel vazio, não um erro.\n- Validação dos filtros no cliente (dia futuro ou fora do mês de referência) desabilita "Processar".',
    },
  },
}

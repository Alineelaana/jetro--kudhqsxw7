import type { ScreenDocEntry } from './types'

/**
 * REGISTRO CENTRAL DE DOCUMENTAÇÃO TÉCNICA DAS TELAS DO ERP JETRO
 *
 * Regra crítica da Engenharia Jetro:
 * "Não deverão ser criadas descrições genéricas ou funcionalidades inexistentes.
 * Caso alguma informação não possa ser identificada, sinalize como 'Pendente de validação técnica'."
 *
 * Cada entrada contém os 9 tópicos obrigatórios:
 * 1. Objetivo
 * 2. Funcionalidades
 * 3. Regras de negócio
 * 4. Fluxo de funcionamento
 * 5. Origem dos dados
 * 6. Integrações
 * 7. Permissões
 * 8. Dependências
 * 9. Tratamento de erros
 */
export const SCREEN_DOCS_REGISTRY: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // 1. TELA INICIAL INTELIGENTE
  // -------------------------------------------------------------
  '/admin': {
    route: '/admin',
    title: 'Tela Inicial Inteligente',
    moduleGroup: 'Principal',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Servir como o hub executivo e operacional central do ERP Jetro, combinando em interface única o assistente conversacional com consultas em tempo real (Jetro On-line), a agenda e calendário corporativo integrado, atalhos rápidos e monitoramento de notificações.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Chat corporativo inteligente com suporte a consultas dinâmicas de vendas, estoque, finanças e clientes via comandos em linguagem natural e cards gráficos renderizados inline.\n- Calendário corporativo mensal completo com visualização de tarefas, lembretes, agendamento de reuniões e compromissos por usuário.\n- Barra de identificação superior com badge de versão e status do ERP Jetro.\n- Sino de notificações globais e botão de encerramento seguro de sessão (Sign Out).\n- Modal de agendamento de compromissos com suporte a participantes, horário, descrição e lembretes sonoros/visuais.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Consultas executadas pelo chat respeitam a política de visualização por filial e perfil de acesso do usuário logado.\n- Compromissos no calendário corporativo são privados ao usuário criador, salvo quando convidados outros colaboradores do ERP.\n- Respostas do assistente que retornem dados analíticos devem ser renderizadas via mini-gráficos ou tabelas sintetizadas.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Ao efetuar login no ERP Jetro, o usuário é direcionado para a rota `/admin`.\n2. O chat Jetro On-line carrega a sessão ativa e exibe sugestões de comandos rápidos.\n3. O calendário consulta a coleção de compromissos do mês corrente para o usuário ativo.\n4. O usuário interage pelo prompt de texto ou áudio, gerando análises imediatas ou criando tarefas na agenda corporativa.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `jetro_online_history`, `appointments`, `tasks`, `users`, `notifications`.\n- Consultas de apoio transversais: `sales_orders`, `products`, `partners`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Endpoint `/backend/v1/jetro-online/query` para processamento do assistente executivo.\n- PocketBase Realtime para sincronização de notificações e compromissos de agenda.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para todos os usuários autenticados no ERP Jetro (`canViewSales` ou autenticação geral).\n- Recursos de exclusão ou edição restritos ao autor do registro.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `JetroOnlineChat`, `JetroCalendar`, `NotificationBell`, `SiteHeader`.\n- Hooks: `useAuth`, `useRealtime`, `useToast`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Falhas de conexão com o chat exibem mensagem de indisponibilidade com botão de re-tentativa.\n- Erros no carregamento de compromissos geram alerta não bloqueante via toast, mantendo o restante da tela funcional.',
    },
  },

  // -------------------------------------------------------------
  // 2. CONSULTA DE PEDIDOS DE VENDA
  // -------------------------------------------------------------
  '/admin/vendas/consulta-pedidos': {
    route: '/admin/vendas/consulta-pedidos',
    title: 'Consulta de Pedidos de Venda',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar a consulta detalhada, filtragem avançada multidimensional e exportação (Excel e PDF) de todos os pedidos de venda do ERP Jetro, permitindo ainda o agendamento automatizado de relatórios com os mesmos filtros.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Filtro retrátil abrangente: Tipo de Operação, Cliente (Razão/CNPJ), Equipe Comercial, RCA (Representante), Grupo de Clientes, Cidade, Bairro, Endereço, Tabela de Preço, Número do Pedido, Pedido Integração, Período (De/Até), Múltiplos Status, É Saldo, Pedido Gerou Saldo, Canal de Venda e Somente Faturados.\n- Paginação configurável (25, 50, 100, 200, 500 linhas por página).\n- Modal lateral/central de detalhamento do pedido com itens, totais, comissões e histórico.\n- Exportação corporativa para Microsoft Excel (.xlsx) com múltiplas abas e formatação profissional.\n- Geração de documento de impressão / PDF com cabeçalho corporativo Jetro, totalizadores e rodapé.\n- Botão de atalho para "Agendar Relatório", pré-carregando os filtros ativos no formulário de agendamento periódico.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Limite de segurança de 10.000 pedidos por exportação síncrona (com notificação ao usuário se excedido).\n- Usuários com perfil "RCA" só podem visualizar pedidos onde `rca_id` seja correspondente ao seu próprio ID de usuário.\n- O filtro de equipe restringe a listagem de representantes (RCAs) relacionados àquela equipe.\n- Pedidos com status cancelado ou bloqueado têm badges visuais coloridos diferenciados.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A tela carrega opções parametrizadas das coleções de suporte (equipes, rcas, grupos, canais, status, tabelas de preço).\n2. O usuário define os critérios nos filtros retráteis e clica em "Consultar" (ou "Limpar Filtro" para resetar).\n3. O backend executa a query paginada na coleção `sales_orders` ordenada por data decrescente.\n4. O usuário clica em uma linha para ver detalhes ou nos botões de exportação/agendamento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `partners`, `commercial_teams`, `representantes`, `customer_cnae_groups`, `order_sales_channels`, `order_statuses`, `price_tables`, `order_operation_types`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Exportadores: `xlsx` (SheetJS) para geração de planilhas e `window.print` estilizado para PDF.\n- Conexão direta com a modal de criação de agendamento em `report_schedules`.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controlada pela função `canViewSales(role)`: perfis autorizados incluem SUP, PADRAO, SDR, Vendedor, FINANCEIRO, COMERCIAL.\n- Perfil RCA possui filtro automático por posse do registro.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Utilitários: `sales-orders-query-export.ts`.\n- Modais: `sales-orders-report-schedule-modal.tsx`.\n- Hooks: `useToast`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de pop-ups durante a impressão em PDF é capturado e sinalizado com toast explicativo.\n- Falhas de rede ou timeout durante busca retornam lista vazia com badge informativo sem quebrar a interface.',
    },
  },

  // -------------------------------------------------------------
  // 3. CENTRAL DE AGENDAMENTO DE RELATÓRIOS
  // -------------------------------------------------------------
  '/admin/agendamento-relatorios': {
    route: '/admin/agendamento-relatorios',
    title: 'Central de Agendamento de Relatórios',
    moduleGroup: 'Administração',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar todas as rotinas automatizadas de emissão e envio periódico de relatórios do ERP Jetro por e-mail, suportando múltiplos formatos (Excel e PDF), frequências parametrizadas (diária, semanal, quinzenal, mensal) e filtros dinâmicos de dados calculados no momento do disparo.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem geral de agendamentos com métricas executivas de totais, ativos, pausados e com erro.\n- Criação, edição, duplicação e exclusão de agendamentos de relatórios.\n- Alternância instantânea de status (Ativo/Pausado) via Switch com persistência imediata.\n- Disparo manual imediato ("Executar Agora") via endpoint dedicado com feedback de progresso e quantidade de registros.\n- Visualização de histórico detalhado de execuções com logs de envio, contagem de registros, status e eventuais mensagens de erro.\n- Suporte a filtros de período dinâmicos (ontem, últimos 7 dias, mês atual, mês anterior).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Relatórios agendados só disparam se `active = true` e `status != "paused"`.\n- Caso a opção `skip_if_empty` esteja marcada, o e-mail não é enviado caso a consulta resulte em zero linhas.\n- Os e-mails de destino devem ser endereços válidos separados por vírgula ou ponto-e-vírgula.\n- Cada execução registra uma entrada na coleção `report_schedule_logs` e atualiza `last_run_at`, `last_run_status` e `last_run_count` no agendamento pai.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador acessa a tela e visualiza a grade com todos os relatórios programados.\n2. Para criar novo agendamento, abre a modal, seleciona o módulo e relatório (do registro central `REPORT_SOURCES_REGISTRY`), define frequência, destinatários, formato e filtros.\n3. O backend (cron agendado) ou o botão "Executar Agora" envia POST para `/backend/v1/report-schedules/trigger`.\n4. O backend gera o arquivo Excel/PDF e despacha via SMTP transacional.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `report_schedules`, `report_schedule_logs`, `users`.\n- Registro declarativo: `src/lib/report-schedule-registry.ts`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Endpoint de disparo do backend: `/backend/v1/report-schedules/trigger`.\n- Serviço de SMTP/E-mail corporativo do PocketBase.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controlada por `canViewConfiguracoes(role)`: requer perfil SUP, COMERCIAL ou FINANCEIRO.\n- Exclusão e disparo manual recomendados para perfil SUP (Superusuário / TI).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ReportScheduleDialog`, `ExecutionHistoryDialog`.\n- Registro: `REPORT_SOURCES_REGISTRY`.\n- Cliente: `pb` (`src/lib/pocketbase/client.ts`).',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Agendamentos com falha repetida no cron mudam status para `error` ou `needs_review` com badge âmbar/vermelho.\n- Erros de disparo manual exibem mensagem amigável via toast destrutivo com o motivo retornado pelo servidor.',
    },
  },

  // -------------------------------------------------------------
  // 4. CENTRAL DE DOCUMENTAÇÃO TÉCNICA (ESTA PRÓPRIA FERRAMENTA)
  // -------------------------------------------------------------
  '/admin/central-documentacao': {
    route: '/admin/central-documentacao',
    title: 'Central de Documentação Técnica',
    moduleGroup: 'Administração',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Prover consulta integral, estruturada e unificada da arquitetura e lógica funcional de todas as telas do ERP Jetro para a equipe de Engenharia de Software, Suporte N3 e Auditoria de TI, garantindo transparência, integridade das regras de negócio e rastreabilidade total.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Catálogo pesquisável com filtros por palavra-chave, módulo e flag de validação técnica.\n- Exibição completa das 9 seções obrigatórias de cada tela.\n- Sinalização visual por badges de telas homologadas vs. "Pendente de validação técnica".\n- Visão consolidada de histórico de alterações documentais (coleção `screen_doc_history`).\n- Matriz de integrações e dependências entre módulos do sistema.\n- Seção explicativa sobre a arquitetura viva da documentação baseada em código e controle de versão.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A tela opera estritamente em modo de CONSULTA — nenhuma edição manual é permitida via formulário de UI.\n- Toda alteração técnica decorre de evolução do código-fonte e commit da equipe de engenharia.\n- Informações não validadas em código real recebem obrigatoriamente a classificação "Pendente de validação técnica".',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário com permissão SUP acessa o menu Administração > Central de Documentação Técnica.\n2. O registro central em código (`SCREEN_DOCS_REGISTRY`) é carregado instantaneamente em memória.\n3. O histórico consolidado de alterações é consultado na coleção PocketBase `screen_doc_history`.\n4. O usuário navega entre os módulos, lê as especificações de cada tela ou filtra pendências.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Registro declarativo estático: `src/lib/screen-docs/registry.ts`.\n- Coleção PocketBase: `screen_doc_history`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração nativa com o Drawer lateral global "Lógica da Tela" via `useLocation` e rota ativa.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Restrita exclusivamente a usuários com perfil de Superusuário / Administrador / TI (`canViewScreenDocs(role)` === SUP).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Módulos: `registry.ts`, `history-service.ts`, `types.ts`.\n- Primitives: Tabs, Card, Badge, Input, Select, Table.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Rotas desconhecidas ou não mapeadas exibem alerta de pendência com fallback amigável.\n- Falhas de conexão com o histórico não impedem a visualização da documentação declarativa das telas.',
    },
  },

  // -------------------------------------------------------------
  // 5. AUDITORIA DO SISTEMA
  // -------------------------------------------------------------
  '/admin/auditoria': {
    route: '/admin/auditoria',
    title: 'Auditoria Geral do Sistema',
    moduleGroup: 'Administração',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Prover rastreabilidade completa de acessos, alterações cadastrais, operações críticas de vendas e finanças no ERP Jetro, em conformidade com as diretrizes de governança e LGPD.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel de alertas de segurança e anomalias de sessão.\n- Tabela de logs com filtros por usuário, tipo de evento, data e severidade.\n- Detalhamento de payload antes e depois de alterações com diff visual.\n- Linha do tempo de sessões ativas e expiradas.\n- Configuração de alertas automáticos e regras de retenção de registros.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Registros de auditoria são imutáveis (sem permissão de alteração ou exclusão via UI).\n- Tentativas suspeitas de autenticação geram eventos de severidade ALTA.\n- Logs de auditoria corporativa são preservados de acordo com as políticas de conformidade do ERP.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador acessa a tela de auditoria.\n2. Os serviços consultam as coleções de logs e sessões de auditoria.\n3. O usuário filtra pelo período ou pelo ID do colaborador auditado.\n4. Ao clicar no evento, um modal exibe o payload bruto e os valores comparativos.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `audit_logs`, `audit_sessions`, `audit_alerts`, `audit_settings`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Middleware de auditoria corporativo em `/backend/v1/audit/*`.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Controlada por `canViewAuditLogs(role)`: restrita a SUP, FINANCEIRO e COMERCIAL.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes: `AuditPanel`, `AuditTable`, `AuditFilters`, `AuditDetailDialog`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Em caso de falha de carregamento, informa indisponibilidade momentânea sem travar o painel.',
    },
  },

  // -------------------------------------------------------------
  // 6. CONFIGURAÇÕES DO SISTEMA
  // -------------------------------------------------------------
  '/admin/configuracoes': {
    route: '/admin/configuracoes',
    title: 'Configurações do Sistema',
    moduleGroup: 'Administração',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar o gerenciamento de parâmetros globais do ERP Jetro, integração com APIs, backups, dados cadastrais da matriz e filiais, modelos de e-mail e matriz de permissões por perfil.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Subtelas para APIs, Backup, Dados da Empresa, Importação/Exportação, Integrações, Logs, Modelos de Documentos, Modelos de E-mail, Notificações, Numerações, Parâmetros, Permissões e Segurança.\n- Gerenciamento de credenciais de integração e chaves de API externas.\n- Disparo de backups manuais e agendamento de rotinas de cópia de segurança.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Apenas o perfil SUP pode alterar chaves de segurança, configurações de MFA e matriz de permissões.\n- Parâmetros alterados aplicam-se a novas sessões ou após recarregamento dos dados de sistema.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário navega entre as abas do layout de configurações.\n2. Modificações são validadas contra as regras do formulário e submetidas via API do PocketBase.\n3. O sistema registra log de auditoria para cada alteração de parâmetro realizada.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `system_params`, `company_data`, `api_integrations`, `backups`, `permission_rules`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Provedores externos configuráveis (gateways de pagamento, emissão fiscal, mensageria).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Consulta: `canViewConfiguracoes(role)`.\n- Edição crítica: `canManageConfiguracoes(role)` (SUP).',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Subcomponentes de `src/components/configuracoes/*`.\n- Hooks: `useSystemParams`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de campos obrigatórios antes do envio e mensagens de erro específicas por atributo.',
    },
  },

  // -------------------------------------------------------------
  // 7. DASHBOARD TRADICIONAL
  // -------------------------------------------------------------
  '/admin/dashboard': {
    route: '/admin/dashboard',
    title: 'Dashboard Tradicional',
    moduleGroup: 'Principal',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Apresentar visão analítica consolidada dos indicadores operacionais e comerciais do ERP em gráficos e cards de desempenho clássicos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cards de métricas rápidas de vendas, orçamentos e atendimentos.\n- Gráficos de evolução temporal e produtividade.\n- Acesso a filtros de período rápido (hoje, 7 dias, mês corrente).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Indicadores são computados com base nos registros visíveis para o perfil do usuário logado.\n- Dados consolidados da empresa são exibidos apenas para perfis de gestão.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário acessa Principal > Dashboard Tradicional.\n2. Carregam-se os totais das coleções de ordens, orçamentos e mensagens.\n3. Os cards atualizam os somatórios.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `sales_orders`, `budget_requests`, `atendimentos`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Internas via client PocketBase.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Disponível para usuários com acesso ao módulo Principal.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componente `AdminDashboard`, `NotificationBell`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Exibe zeros nos cards em caso de ausência de registros ou erro de requisição.',
    },
  },

  // -------------------------------------------------------------
  // 8. ATENDIMENTO AO CLIENTE (SAC / SUPORTE)
  // -------------------------------------------------------------
  '/admin/atendimento': {
    route: '/admin/atendimento',
    title: 'Central de Atendimento e Suporte',
    moduleGroup: 'Principal',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar chamados, solicitações de clientes, protocolos de atendimento, controle de SLA e fluxos de resolução em múltiplos canais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel de atendimentos com filtros por status (Aberto, Em Análise, Concluído).\n- Controle de tempo de resposta e cumprimento de SLA por setor.\n- Registro de interações, histórico de mensagens e anexos.\n- Gestão de motivos e setores de encaminhamento.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Atendimentos não respondidos dentro do prazo estipulado entram em alerta de estouro de SLA.\n- O encerramento do chamado exige preenchimento do motivo e resolução adotada.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Novo chamado é registrado pelo operador ou via portal do cliente.\n2. O ticket é distribuído para o setor responsável de acordo com o motivo.\n3. O atendente registra notas e status até o fechamento com pesquisa de satisfação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `atendimentos`, `atendimento_mensagens`, `atendimento_setores`, `atendimento_motivos`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'PocketBase Realtime para atualização instantânea da fila de chamados.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewAtendimentoModule(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/atendimento/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Tratamento de conflitos de concorrência e avisos de erro de validação em formulário.',
    },
  },

  // -------------------------------------------------------------
  // 9. CADASTRO DE PARCEIROS E PRODUTOS (COMERCIAL)
  // -------------------------------------------------------------
  '/admin/cadastros': {
    route: '/admin/cadastros',
    title: 'Central de Cadastros Gerais',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o cadastro unificado de parceiros de negócio (Clientes, Fornecedores, Transportadoras, Representantes), endereços, contatos e restrições comerciais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Tabela unificada com pesquisa por Razão Social, Nome Fantasia, CNPJ/CPF.\n- Formulário com abas: Dados Cadastrais (PF/PJ), Endereços, Contatos e Responsáveis, Dados Financeiros e Restrições de Crédito.\n- Consulta automática de CNPJ e CEP.\n- Controle de ativação/inativação de parceiros.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Validação obrigatória de CNPJ/CPF com dígito verificador.\n- Parceiros marcados com restrição de crédito exigem liberação especial para emissão de novos pedidos.\n- Exclusão de parceiros bloqueada caso existam transações vinculadas.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário clica em "Novo Parceiro" ou seleciona um registro existente para edição.\n2. Preenche os dados obrigatórios com validação em tempo real.\n3. Ao salvar, os dados são persistidos na coleção `partners`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `partners`, `partner_types`, `partner_addresses`, `partner_financial`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Serviços externos de consulta de CNPJ (ReceitaWS/BrasilAPI) e ViaCEP.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canManagePartners(role)`.\n- Cadastro e edição: `canRegisterPartners`, `canEditPartners`.\n- Exclusão: restrita a `canDeletePartners` (SUP).',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/partner-*` e `src/components/cadastros/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Erros de duplicidade de CNPJ/CPF são identificados e exibidos diretamente no campo correspondente.',
    },
  },

  // -------------------------------------------------------------
  // 10. TABELAS DE PREÇOS
  // -------------------------------------------------------------
  '/admin/tabelas-precos': {
    route: '/admin/tabelas-precos',
    title: 'Gestão de Tabelas de Preços',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Configurar políticas de precificação, tabelas de venda padrão e diferenciadas por canal/região, regras de margem mínima e vigência.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro e manutenção de tabelas com vigência inicial e final.\n- Definição de preços por item, descontos máximos permitidos e acréscimos.\n- Comparador de custos e margens de contribuição.\n- Aprovação de alterações de preços via workflow corporativo.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Pedidos de venda utilizam a tabela associada ao cliente ou canal, validando o período de vigência ativo.\n- Alterações que reduzam margem abaixo do piso exigem justificativa e aprovação gerencial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Cria-se uma tabela com status em elaboração.\n2. Adicionam-se os itens e valores com cálculo automático de markup.\n3. A tabela é submetida para aprovação e, quando aprovada, ativada para vendas.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `price_tables`, `price_table_items`, `price_table_rules`, `products`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Motor de cálculo de margem e precificação corporativo.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewPriceTables(role)`.\n- Alteração de preços: `canChangePrice(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/pricing/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Bloqueio de vigências sobrepostas para o mesmo canal/cliente com alerta explicativo.',
    },
  },

  // -------------------------------------------------------------
  // 11. CRM - GESTÃO DE RELACIONAMENTO
  // -------------------------------------------------------------
  '/admin/crm': {
    route: '/admin/crm',
    title: 'CRM Comercial e Funil de Vendas',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Acompanhar a jornada do cliente desde a prospecção de leads até o fechamento de oportunidades comerciais em pipelines visuais (Kanban).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Quadro Kanban com estágios de funil configuráveis por equipe comercial.\n- Cadastro completo de leads, contatos e oportunidades com valor estimado.\n- Registro de atividades, reuniões e tarefas com lembretes automáticos.\n- Emissão e acompanhamento de propostas comerciais.\n- Relatórios de conversão por vendedor, motivo de perda e tempo médio de ciclo.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Leads convertidos geram automaticamente parceiro de negócio e oportunidade vinculada.\n- Oportunidades marcadas como perdidas exigem seleção do motivo de perda cadastrado.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O lead é capturado e alocado para um vendedor.\n2. O vendedor executa as atividades da régua de relacionamento e move a oportunidade pelas fases do funil.\n3. Ao fechar negócio, gera-se a proposta e posterior pedido de venda.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `crm_leads`, `crm_opportunities`, `crm_activities`, `crm_funnels`, `crm_loss_reasons`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Integração com e-mail e agenda corporativa Jetro.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewCRM(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/crm/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Avisos visuais em caso de falha de conexão e proteção contra perda de rascunhos.',
    },
  },

  // -------------------------------------------------------------
  // 12. MÓDULO FINANCEIRO
  // -------------------------------------------------------------
  '/admin/financeiro': {
    route: '/admin/financeiro',
    title: 'Gestão Financeira e Tesouraria',
    moduleGroup: 'Financeiro',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Controlar contas a pagar, contas a receber, tesouraria, fluxo de caixa diário e projetado, conciliação bancária e cobrança de inadimplentes.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel de contas a pagar e receber com filtros por vencimento, fornecedor/cliente e status.\n- Baixa individual e em lote com cálculo de juros, multas e descontos.\n- Conciliação bancária via extrato OFX e integração PIX.\n- Relatórios gerenciais de fluxo de caixa e DRE financeira.\n- Central de cobrança com régua de notificação e histórico de negociação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Baixas manuais exigem vinculação de conta bancária de liquidação.\n- Títulos vencidos são classificados em faixas de aging para provisão de crédito de liquidação duvidosa.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Títulos a receber são gerados a partir do faturamento de pedidos; títulos a pagar a partir de compras e despesas.\n2. O financeiro realiza conciliações bancárias diárias e emite borderôs de pagamento.\n3. Liquidações geram lançamentos contábeis automáticos.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `financial_payables`, `financial_receivables`, `bank_accounts`, `cash_movements`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Módulos bancários e gateways de pagamento homologados.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewFinancial(role)` e `canSettle(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/financial/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Bloqueio de exclusão de títulos baixados ou vinculados a conciliação fechada.',
    },
  },

  // -------------------------------------------------------------
  // 13. MÓDULO FISCAL
  // -------------------------------------------------------------
  '/admin/fiscal': {
    route: '/admin/fiscal',
    title: 'Gestão Fiscal e Documentos Eletrônicos',
    moduleGroup: 'Fiscal',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar a emissão, validação, transmissão e escrituração de documentos fiscais eletrônicos (NF-e, NFC-e, NFS-e, CT-e, MDF-e), apuração tributária e geração de arquivos SPED.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Emissão e cancelamento de notas fiscais com envio direto à SEFAZ.\n- Carta de correção eletrônica (CC-e) e manifestação do destinatário.\n- Apuração de tributos (ICMS, IPI, PIS, COFINS, ISS) e simulador da Reforma Tributária.\n- Armazenamento e exportação de arquivos XML e DANFE em PDF.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Toda emissão exige certificado digital modelo A1 válido e ativo.\n- Cancelamento somente permitido dentro do prazo regulamentar estipulado pela SEFAZ do estado emissor.\n- Rejeições fiscais impedem a movimentação de saída no faturamento.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O pedido de venda ou remessa solicita faturamento.\n2. O motor fiscal monta o XML com cálculo de impostos, assina digitalmente e transmite à SEFAZ.\n3. Recebida a autorização de uso, o DANFE é gerado e o estoque é atualizado.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `fiscal_documents`, `tax_rules`, `fiscal_certificates`, `cfop_catalog`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Webservices SEFAZ de autorização e consulta em lote.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewFiscal(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/fiscal/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Tratamento detalhado de códigos de rejeição da SEFAZ com orientações de correção.',
    },
  },

  // -------------------------------------------------------------
  // 14. BI & ANALYTICS (BUSINESS INTELLIGENCE)
  // -------------------------------------------------------------
  '/admin/bi': {
    route: '/admin/bi',
    title: 'BI e Analytics Executivo',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar a inteligência de negócios do ERP Jetro com dashboards executivos, cruzamento interdepartamental (cross-module), projeções de vendas, análise de churn e IA preditiva.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Centrais analíticas dedicadas: Comercial, Financeiro, Estoque, Logística, Indústria, RH e Fiscal.\n- Projeções de vendas com cenários comparativos e metas.\n- Construtor de dashboards customizados com visualizações salvas.\n- Central de relatórios analíticos corporativos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Relatórios estratégicos consolidados exigem autorização explícita de perfil gestor.\n- Dashboards customizados podem ser compartilhados ou mantidos de visualização pessoal.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor seleciona a central analítica de interesse.\n2. Filtros de granularidade temporal e dimensões são aplicados.\n3. Os dados são agrupados e plotados em gráficos interativos com suporte a drill-down.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções e views analíticas do PocketBase, com cache de agregações.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Bibliotecas gráficas Recharts e exportadores de dados.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewBI(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/bi/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Informações de amostragem de dados e avisos em caso de período sem dados apurados.',
    },
  },

  // -------------------------------------------------------------
  // 15. INTELIGÊNCIA ARTIFICIAL E AGENTES ADAPTA
  // -------------------------------------------------------------
  '/admin/ia/dashboard': {
    route: '/admin/ia/dashboard',
    title: 'Central de Inteligência Artificial e Automações',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Administrar os agentes de IA, fluxos inteligentes, regras de treinamento, governança de modelos e aprovação de ações autônomas na plataforma ADAPTA do Jetro.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Monitoramento de interações e consumo de tokens por agente.\n- Gestão de base de conhecimento corporativa (documentos e manuais indexados).\n- Central de aprovação para ações autônomas críticas geradas pelos agentes.\n- Painel de treinamento supervisionado e calibração de prompts.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Ações sugeridas por agentes com nível de criticidade ALTA sempre exigem confirmação humana antes de execução.\n- Respostas com score de confiança inferior ao threshold são direcionadas para revisão.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Solicitações são enviadas aos agentes via chat ou gatilhos de fluxo de trabalho.\n2. O agente processa a instrução consultando a base de conhecimento e as regras do ERP.\n3. Se necessário, gera solicitação de aprovação na fila de homologação antes de aplicar no banco de dados.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `ai_agents`, `ai_interactions`, `ai_knowledge_base`, `ai_approvals`, `ai_settings`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'APIs LLM Skip Cloud e agentes nativos cadastrados no backend.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewAiModule(role)` e `canManageAiTraining(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/ai-module/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Fallback para modo assistido caso a API de modelo externo retorne timeout ou indisponibilidade.',
    },
  },

  // -------------------------------------------------------------
  // 16. WMS E ESTOQUE
  // -------------------------------------------------------------
  '/admin/estoque': {
    route: '/admin/estoque',
    title: 'WMS e Controle de Estoque',
    moduleGroup: 'Operação',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o recebimento, endereçamento, conferência, movimentação física, inventários periódicos, separação (picking) e expedição de produtos no centro de distribuição.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Mapa de armazém com endereçamento por rua, bloco, nível e vão.\n- Gestão de lotes, datas de fabricação e controle de validade (FEFO/FIFO).\n- Ordens de separação por onda e conferência cega via coletores de dados.\n- Inventário geral e rotativo com reconciliação de divergências.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Estoque negativo é estritamente proibido, exceto se configurada permissão especial `canAllowNegativeStock`.\n- Lotes bloqueados por quarentena da qualidade não podem ser alocados em ordens de separação.\n- Ajustes de estoque que ultrapassem o valor limite exigem aprovação gerencial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Entrada física do produto vinculada à NF-e de compra.\n2. Conferência cega e geração de etiquetas de pallet/lote.\n3. Indicação de endereço de armazenagem e liberação para estoque vendível.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `inventory_items`, `stock_locations`, `stock_movements`, `lots`, `inventories`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Coletores de dados via telas otimizadas e impressão de etiquetas ZPL/PDF.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewStock(role)`.\n- Movimentações e ajustes: `canMakeMovements`, `canMakeAdjustments`, `canApproveAdjustments`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        'Telas de WMS e controle de estoque de `src/pages/stock/*` e componentes relacionados.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Bloqueio imediato de separação caso o saldo físico seja inferior ao solicitado.',
    },
  },

  // -------------------------------------------------------------
  // 17. PCP E INDÚSTRIA
  // -------------------------------------------------------------
  '/admin/industria': {
    route: '/admin/industria',
    title: 'Gestão Industrial e PCP',
    moduleGroup: 'Operação',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Orquestrar o Planejamento e Controle da Produção (PCP), estrutura de produtos (BOM), roteiros de fabricação, alocação de maquinário, manutenção preventiva e controle de qualidade.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Engenharia de produto com lista técnica de insumos e matérias-primas (BOM multinível).\n- Emissão e apontamento em tempo real de Ordens de Produção (OP).\n- Monitoramento de capacidade produtiva, gargalos e cálculo de OEE (Overall Equipment Effectiveness).\n- Rastreabilidade de matéria-prima aplicada por lote produzido com apoio a campanhas de recall.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A abertura de OP valida a disponibilidade de estoque de matérias-primas e gera reserva física.\n- O fechamento da OP aponta automaticamente o consumo de insumos e credita o produto acabado no estoque.\n- Tolerâncias de perda parametrizadas por linha de envase ou montagem.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O Plano Mestre de Produção (MPS) gera sugestões de OPs com base na previsão de vendas e pedidos.\n2. O programador confirma e libera as ordens de fabricação para o chão de fábrica.\n3. Os operadores apontam paradas, tempos e unidades produzidas nos terminais industriais.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `production_orders`, `bom_structures`, `production_resources`, `quality_inspections`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Sensores IoT / Cockpit industrial e integração com estoque.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewIndustry(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/industry/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Bloqueio de avanço de fase de produção caso o ensaio de qualidade seja reprovado.',
    },
  },

  // -------------------------------------------------------------
  // 18. LOGÍSTICA E TRANSPORTE (TMS)
  // -------------------------------------------------------------
  '/admin/logistica': {
    route: '/admin/logistica',
    title: 'Logística de Entregas e Orquestração',
    moduleGroup: 'Operação',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o planejamento de coletas, entregas, expedição de cargas, controle de ocorrências em trânsito e logística reversa.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Formação e roteirização inteligente de cargas por região e capacidade cúbica/peso.\n- Central de exceções e ocorrências de entrega (endereço não localizado, cliente ausente).\n- Painel de logística reversa e devoluções vinculadas aos pedidos de venda.\n- Emissão de romaneios de expedição e manifesto de transporte.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A expedição só pode ser liberada após a emissão autorizada da NF-e e do MDF-e da viagem.\n- Ocorrências de extravio ou avaria exigem registro fotográfico e termo de responsabilidade.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Pedidos faturados entram na fila de montagem de romaneio.\n2. A rota é despachada e acompanhada pela torre de controle.\n3. O motorista confirma a entrega colhendo o comprovante digital no destino.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `logistics_shipments`, `logistics_occurrences`, `logistics_vehicles`, `logistics_routes`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Mapeamento geográfico e aplicativo de entrega do motorista.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewLogistics(role)` e `canViewTransporte(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/logistics/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Alertas visuais de atraso ou sobrecarga de veículo na montagem da carga.',
    },
  },

  // -------------------------------------------------------------
  // 19. CONTROLADORIA CORPORATIVA
  // -------------------------------------------------------------
  '/admin/controladoria': {
    route: '/admin/controladoria',
    title: 'Controladoria e Planejamento Financeiro',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Acompanhar os demonstrativos de resultado gerencial (DRE Gerencial e Analítica), EBITDA, balanço patrimonial, orçamento empresarial (Budget × Realizado) e simulações econômico-financeiras.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cockpit executivo com visualização consolidada por centro de resultado.\n- DRE Gerencial multinível com drill-down até o lançamento analítico.\n- Gestão de Budget e Forecast com controle de versões orçamentárias.\n- Módulo de reclassificações gerenciais e comentários por conta contábil.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Períodos gerenciais encerrados são protegidos contra inclusão ou alteração de lançamentos extemporâneos.\n- Reclassificações gerenciais não alteram a escrituração fiscal/contábil oficial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A controladoria executa a rotina de fechamento mensal agregando contas a pagar, receber e estoque.\n2. Análises de desvios (orçado × realizado) são distribuídas aos gestores de centros de custo.\n3. Projeções de fechamento anual (forecast) são recalculadas com base nas realizações parciais.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `controladoria_dre_records`, `controladoria_budget`, `controladoria_drivers`, `controladoria_comments`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Integração contábil e exportadores executivos em Excel.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewControladoria(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/controladoria/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Sinalização explícita de contas sem amarração de plano gerencial.',
    },
  },

  // -------------------------------------------------------------
  // 20. DEPARTAMENTO PESSOAL (DP)
  // -------------------------------------------------------------
  '/admin/dp': {
    route: '/admin/dp',
    title: 'Departamento Pessoal e Folha de Pagamento',
    moduleGroup: 'DP & RH',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as rotinas de admissões, rescisões, controle de jornada e ponto eletrônico, folha de pagamento, 13º salário, férias, benefícios e eventos do eSocial.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Gestão completa de folha mensal com cálculo de proventos, descontos, INSS e IRRF.\n- Espelho de ponto com banco de horas e apuração de horas extras.\n- Monitor de transmissão de eventos do eSocial com status de protocolo.\n- Gestão de férias com alertas de período concessivo e dobro legal.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Cálculos seguem rigorosamente a legislação trabalhista brasileira (CLT) e convenções sindicais vigentes.\n- Admissões exigem envio do evento S-2200 do eSocial antes do início efetivo das atividades.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O colaborador registra o ponto eletrônico ao longo do mês.\n2. Ao final do período, o DP valida as ocorrências, calcula a folha e gera as guias de recolhimento (FGTS Digital, DARF DCTFWeb).\n3. Os contracheques são disponibilizados e os eventos transmitidos ao eSocial.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `dp_collaborators`, `dp_payroll`, `dp_time_records`, `dp_esocial_events`, `dp_benefits`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Webservice eSocial e Conectividade Social / FGTS Digital.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewRH(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/dp/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Identificação e notificação de rejeições nos layouts de envio do eSocial.',
    },
  },

  // -------------------------------------------------------------
  // 21. RECURSOS HUMANOS (RH ESTRATÉGICO)
  // -------------------------------------------------------------
  '/admin/rh': {
    route: '/admin/rh',
    title: 'Recursos Humanos Estratégico',
    moduleGroup: 'DP & RH',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Conduzir os processos de gestão de pessoas: avaliação de desempenho por competências, Matriz 9 Box (Talent Review), planos de desenvolvimento individual (PDI), plano de carreira e sucessão.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Organograma dinâmico por cargos, níveis e departamentos.\n- Avaliações 360º de competências comportamentais e técnicas.\n- Matriz 9 Box visual com arrasto de colaboradores entre quadrantes de potencial × desempenho.\n- Painel de calibração de notas com comitê de pessoas.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Avaliações concluídas são congeladas para a sessão de calibração gerencial.\n- O feedback formal deve ser registrado após a homologação das notas pelo comitê.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O RH lança o ciclo de avaliação com prazos estabelecidos.\n2. Colaboradores realizam autoavaliação e líderes avaliam seus liderados.\n3. O comitê de calibração define o mapa 9-box e orienta os PDIs.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `rh_employees`, `rh_evaluations`, `rh_competencies`, `rh_nine_box`, `rh_pdi`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Integração direta com o cadastro de colaboradores do DP.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewRH(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/rh/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Controle de preenchimento incompleto de formulários avaliativos.',
    },
  },

  // -------------------------------------------------------------
  // 22. SAÚDE E SEGURANÇA DO TRABALHO (SST)
  // -------------------------------------------------------------
  '/admin/sst': {
    route: '/admin/sst',
    title: 'Saúde e Segurança do Trabalho (SST)',
    moduleGroup: 'DP & RH',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as exigências de segurança ocupacional, normas regulamentadoras (NR-1 a NR-35), emissão de CAT, controle de exames ASO (PCMSO), gestão de riscos (GRO/PGR) e envio do eSocial SST.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Inventário de riscos por ambiente de trabalho e grupos de exposição.\n- Controle de entrega, validade e CA de EPIs e EPCs.\n- Calendário de vencimento de exames médicos ocupacionais e laudos (LTCAT, PCMSO).\n- Módulo de investigação de acidentes e emissão de Comunicado de Acidente de Trabalho (CAT).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Colaboradores com ASO vencido são sinalizados e impedidos de realizar atividades de risco.\n- O evento S-2210 (CAT) deve ser emitido dentro de 24 horas após o acidente de trabalho.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O técnico de segurança cadastra os riscos ambientais e medidas preventivas.\n2. A área médica registra os ASOs e dados clínicos de aptidão.\n3. O sistema despacha os eventos SST para o eSocial.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `sst_accidents`, `sst_exams`, `sst_risks`, `sst_epis`, `sst_esocial_events`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Integração de eventos de SST com o eSocial do Governo Federal.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewRH(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/sst/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Validação rígida de campos exigidos pelos leiautes do eSocial SST.',
    },
  },

  // -------------------------------------------------------------
  // 23. VERBAS DE FORNECEDORES (TRADE MARKETING)
  // -------------------------------------------------------------
  '/admin/verbas': {
    route: '/admin/verbas',
    title: 'Gestão de Verbas de Fornecedores',
    moduleGroup: 'Financeiro',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Administrar acordos comerciais com a indústria fornecedora, contas correntes de verbas, aplicação em produtos para subsidiar preço promocional e respectiva prestação de contas com auditoria.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cockpit executivo de saldo de verbas por fornecedor e categoria.\n- Contratos de verba cooperada com apuração por percentual de compra ou valor fixo.\n- Aplicação de verba no custeio de descontos em itens do mix.\n- Prestação de contas com dossiê de comprovantes e documentos vinculados.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O consumo de verba não pode exceder o saldo homologado na conta corrente do fornecedor.\n- Descontos subsidiados só são refletidos no faturamento se o acordo estiver formalmente assinado e vigente.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Negocia-se o aporte de verba com o fornecedor e cria-se o acordo no sistema.\n2. As compras efetuadas apuram o crédito na conta corrente.\n3. O setor comercial aplica o saldo em campanhas de produtos e presta contas ao final.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `sa_agreements`, `sa_accounts`, `sa_movements`, `sa_appropriations`, `sa_documents`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Módulo de precificação, compras e financeiro (contas a receber / abatimento em duplicatas).',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewSA(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/supplier-allowance/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Alerta preventivo em caso de tentativa de apropriação com saldo insuficiente.',
    },
  },

  // -------------------------------------------------------------
  // 24. MARKETING ENTERPRISE
  // -------------------------------------------------------------
  '/admin/marketing': {
    route: '/admin/marketing',
    title: 'Marketing Enterprise e Gestão de Campanhas',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Coordenar jobs de criação, fluxo de aprovação de peças publicitárias, calendário editorial, biblioteca de mídia e atribuição de resultados de vendas às campanhas institucionais e de trade.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cockpit de solicitações e pipeline de jobs da equipe de design/criação.\n- Workflow de aprovação de peças com marcações de revisão e histórico de versões.\n- Calendário editorial integrado e biblioteca digital de artes e logomarcas.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Nenhuma peça é veiculada sem a aprovação do responsável pelo produto ou marca.\n- Versionamento automático de arquivos anexos para histórico de conformidade.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Um setor requisita criação de material pelo formulário de briefing.\n2. A equipe de marketing produz e submete a peça para validação.\n3. Quando aprovada, o material é arquivado na biblioteca e liberado para veiculação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `mk_requests`, `mk_jobs`, `mk_approvals`, `mk_media_library`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Módulo de verbas e BI de inteligência de marketing.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewTradeMarketing(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/marketing/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Pendente de validação técnica',
    },
  },

  // -------------------------------------------------------------
  // 25. REMUNERAÇÃO VARIÁVEL
  // -------------------------------------------------------------
  '/admin/remuneracao': {
    route: '/admin/remuneracao',
    title: 'Remuneração Variável e Comissionamento',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Calcular regras de comissionamento de vendas, prêmios por atingimento de metas, bonificações, campanhas de incentivo e gestão de contestações dos representantes.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Parametrização de faixas de comissão por produto, cliente ou canal.\n- Apuração periódica com simulação de cenários de pagamento.\n- Painel de ranking de vendas e acompanhamento de metas em tempo real.\n- Canal de contestações com histórico de análise.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A comissão de pedidos cancelados ou estornados é automaticamente deduzida no fechamento subsequente.\n- O pagamento só é encaminhado ao financeiro após a aprovação formal do diretor comercial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. As regras de remuneração são ativadas.\n2. O motor apura as vendas faturadas de cada representante ao término do mês.\n3. O relatório consolidado é validado e despachado para a folha do DP.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `vr_rules`, `vr_apurations`, `vr_goals`, `vr_contests`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Módulos de vendas e folha de pagamento do DP.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewVR(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/remuneracao/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Pendente de validação técnica',
    },
  },

  // -------------------------------------------------------------
  // 26. GESTÃO DE VALIDADE E VENCIMENTOS
  // -------------------------------------------------------------
  '/admin/validade': {
    route: '/admin/validade',
    title: 'Monitoramento de Validade e Alertas de Vencimento',
    moduleGroup: 'Administração',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Monitorar criticamente prazos de expiração de lotes de produtos, certificados digitais, contratos de parceiros, CNH de motoristas e licenças corporativas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Dashboard com indicadores de itens vencidos, a vencer em 30, 60 e 90 dias.\n- Configuração de regras de notificação preventiva com envio de alertas automáticos.\n- Painel de chat assistido para consulta de vencimentos críticos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Produtos próximos ao vencimento entram em rota de ação comercial prioritária ou bloqueio de expedição.\n- Certificados digitais com menos de 15 dias para expirar geram notificação de criticidade máxima.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Rotina diária varre os registros de lotes, contratos e certidões.\n2. Alertas são disparados para os gestores das áreas impactadas.\n3. O gestor toma a providência preventiva necessária e confirma no sistema.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `validity_alerts`, `validity_rules`, `lots`, `fiscal_certificates`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Sistema de notificações e e-mails do ERP.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewValidityAlerts(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/validity/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Pendente de validação técnica',
    },
  },

  // -------------------------------------------------------------
  // 27. PRECIFICAÇÃO E FORMAÇÃO DE PREÇO
  // -------------------------------------------------------------
  '/admin/precificacao': {
    route: '/admin/precificacao',
    title: 'Simulador e Formação de Preços',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Simular custos de aquisição, impostos, margens de contribuição desejadas e formar o preço de venda ideal para os canais de distribuição do ERP Jetro.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Simulador de markup e margem com quebra de tributos por UF de destino.\n- Comparador de custos de fornecedores e impacto de frete.\n- Sugestões de preço por inteligência de mercado.\n- Workflow de aprovação de alteração em tabelas de preços oficiais.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Preços abaixo da margem de segurança configurada exigem justificativa formal e autorização da diretoria.\n- O cálculo tributário deve considerar as regras vigentes de substituição tributária (ST) e DIFAL.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista de precificação insere o custo de reposição do item.\n2. O simulador decompõe impostos, frete e comissões, sugerindo o preço ótimo.\n3. Ao aprovar, o valor pode ser automaticamente enviado para a tabela de preços ativa.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `products`, `pricing_rules`, `price_tables`, `tax_rules`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Motor fiscal e tabelas de preços de venda.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canConsultCosts(role)` e `canChangePrice(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/pricing/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Pendente de validação técnica',
    },
  },

  // -------------------------------------------------------------
  // 28. CONFORMIDADE E COMPLIANCE
  // -------------------------------------------------------------
  '/admin/conformidade': {
    route: '/admin/conformidade',
    title: 'Central de Conformidade e Compliance',
    moduleGroup: 'DP & RH',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Acompanhar a aderência legal, normas de segurança da informação, políticas anticorrupção e regras corporativas internas em todos os departamentos do ERP Jetro.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel de indicadores de conformidade e auditorias internas.\n- Acompanhamento de termos de consentimento e LGPD.\n- Relatórios de incidentes e planos de ação corretiva.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Não conformidades críticas exigem plano de mitigação com responsável e prazo definido.\n- Auditorias periódicas devem ter seus relatórios salvos e assinados eletronicamente.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O comitê de compliance registra as verificações de conformidade.\n2. O sistema monitora as pendências e cobra os responsáveis.\n3. Os relatórios são disponibilizados para auditoria externa.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `compliance_audits`, `compliance_actions`, `user_consents`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Módulo de auditoria geral e termos legais do portal.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewConformidade(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Componentes de `src/components/conformidade/*`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Pendente de validação técnica',
    },
  },
}

/**
 * Retorna a documentação técnica de uma tela com base na rota informada.
 * Se a rota exata não existir, tenta encontrar correspondência por prefixo de módulo.
 * Caso não seja possível identificar, retorna uma entrada padrão devidamente sinalizada
 * como "Pendente de validação técnica", sem inventar funcionalidades inexistentes.
 */
export function getScreenDocByRoute(route: string): ScreenDocEntry {
  // 1. Match exato
  if (SCREEN_DOCS_REGISTRY[route]) {
    return SCREEN_DOCS_REGISTRY[route]
  }

  // 2. Normalização de rotas com barras no final
  const cleanRoute = route.endsWith('/') && route.length > 1 ? route.slice(0, -1) : route
  if (SCREEN_DOCS_REGISTRY[cleanRoute]) {
    return SCREEN_DOCS_REGISTRY[cleanRoute]
  }

  // 3. Fallback rigoroso sem invenções (respeita a regra do usuário)
  return {
    route: cleanRoute,
    title: `Tela: ${cleanRoute}`,
    moduleGroup: cleanRoute.split('/')[2] ? cleanRoute.split('/')[2].toUpperCase() : 'Geral',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Pendente de validação técnica — documentação funcional específica em fase de levantamento pelo time de engenharia.',
      pendingValidation: true,
    },
    features: {
      title: 'Funcionalidades',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
    businessRules: {
      title: 'Regras de Negócio',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
    integrations: {
      title: 'Integrações',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
    permissions: {
      title: 'Permissões',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
    dependencies: {
      title: 'Dependências',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'Pendente de validação técnica',
      pendingValidation: true,
    },
  }
}

/**
 * Retorna todas as telas catalogadas no registro declarativo ordenadas pelo título.
 */
export function getAllScreenDocs(): ScreenDocEntry[] {
  return Object.values(SCREEN_DOCS_REGISTRY).sort((a, b) =>
    a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }),
  )
}

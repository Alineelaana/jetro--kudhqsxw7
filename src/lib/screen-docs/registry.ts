import type { ScreenDocEntry } from './types'
import { DP_SCREEN_DOCS } from './dp-screens'
import { RH_SCREEN_DOCS } from './rh-screens'
import { SST_SCREEN_DOCS } from './sst-screens'
import { FINANCIAL_SCREEN_DOCS } from './financial-screens'
import { INDUSTRY_SCREEN_DOCS } from './industry-screens'
import { LOGISTICS_SCREEN_DOCS } from './logistics-screens'
import { STOCK_SCREEN_DOCS } from './stock-screens'

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
  // SEGUNDO CÉREBRO DA EMPRESA (CENTRAL DE INTELIGÊNCIA & MEMÓRIA)
  // -------------------------------------------------------------
  '/admin/segundo-cerebro': {
    route: '/admin/segundo-cerebro',
    title: 'Segundo Cérebro da Empresa — Central de Inteligência e Memória Corporativa',
    moduleGroup: 'Inteligência',
    docVersion: '1.0.0',
    lastUpdated: '2026-03-29',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Conectar e estruturar todo o conhecimento organizacional da empresa (reuniões, projetos, processos, diretrizes, decisões e notas Obsidian importadas) correlacionado a dados autorizados do ERP (pedidos de venda, títulos financeiros, clientes, produtos), provendo assistência executiva em linguagem natural, conselheiro estratégico, memória documental de projetos e decisões, radar de oportunidades e mapa de conexões, estritamente em modo de leitura e com auditoria completa de consultas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 7 Indicadores no Topo em tempo real (Docs indexados, Áreas, Projetos, Decisões, Oportunidades, Pendentes de revisão, Última sincronização Obsidian).\n- Assistente IA Central nativo do Skip Cloud com citações documentais obrigatórias e rotulagem tripla ([DADO OPERACIONAL DO ERP], [INFORMAÇÃO DOCUMENTADA], [INTERPRETAÇÃO DA IA]).\n- Biblioteca de Conhecimento com 13 áreas corporativas, busca de texto/tags e visualização completa de notas.\n- Conselheiro Estratégico com avaliação estruturada em 8 dimensões executivas.\n- Memória de Projetos com consolidação baseada 100% em documentos indexados.\n- Memória de Decisões com status de deliberação e identificação de divergências documentais.\n- Radar de Oportunidades com varredura no servidor (cron periódico a cada 6h e botão manual) para detecção de automações, inconsistências e reduções de custo, com avaliação e aprovação exclusivamente humana.\n- Mapa de Conhecimento interativo em SVG mapeando wikilinks [[links]] e áreas de conhecimento.\n- Central de Insights Estratégicos & Análise de Processos por departamento.\n- Histórico Privado de Consultas e Conversas por usuário com favoritar respostas.\n- Conectar Obsidian via ingestão de notas Markdown (.md) com extração de hash md5, wikilinks e controle de versão unidirecional (Obsidian -> Jetro).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A IA opera estritamente em MODO LEITURA — nunca cria, altera ou exclui dados de ERP ou documentos originais.\n- Toda resposta afirmativa deve citar a fonte documental correspondente com título e caminho.\n- Informações inexistentes na base autorizada devem ser categoricamente declaradas como não localizadas, sendo proibido inventar documentos ou decisões.\n- Respeito irrestrito à governança de acesso (RBAC): documentos Confidenciais e Estratégicos são filtrados tanto no backend quanto no frontend.\n- A sincronização automática contínua do Obsidian é sinalizada na interface como "Indisponível — aguardando caminho de integração" (nunca simulada).\n- O Radar de Oportunidades apenas sugere ações: nenhuma aprovação ou execução ocorre de forma automática sem intervenção humana.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário autorizado acessa Inteligência > Segundo Cérebro da Empresa (rota /admin/segundo-cerebro).\n2. O backend autentica o usuário e injeta as permissões (SUP, Comercial, Financeiro) no contexto de segurança.\n3. O usuário realiza perguntas no Assistente IA ou navega pelas abas da Biblioteca, Conselheiro, Decisões ou Radar.\n4. As consultas ao agente acionam o endpoint `/backend/v1/segundo-cerebro/chat`, que executa o agente nativo `segundo-cerebro`, cruza com os documentos autorizados, anexa citações e registra log na coleção `audit_logs`.\n5. O usuário com permissão de administração pode enviar notas .md via aba Configurações, disparando o endpoint `/backend/v1/segundo-cerebro/sync-obsidian` para indexação imediata.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase dedicadas: `segundo_cerebro_docs`, `segundo_cerebro_decisions`, `segundo_cerebro_opportunities`, `segundo_cerebro_insights`, `segundo_cerebro_sync_logs`, `segundo_cerebro_chats`, `segundo_cerebro_messages`.\n- Coleções operacionais do ERP correlacionadas para leitura: `sales_orders`, `financial_receivables`, `partners`, `products`, `empresas`.\n- Coleção de auditoria: `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Agente nativo de IA do Skip Cloud (`segundo-cerebro`) configurado via migration 0189.\n- Endpoints de backend em pb_hooks: `/backend/v1/segundo-cerebro/chat`, `/backend/v1/segundo-cerebro/sync-obsidian`, `/backend/v1/segundo-cerebro/scan-radar`, `/backend/v1/segundo-cerebro/conversations`.\n- Scheduled Job: `segundo_cerebro_radar_scan` (execução periódica a cada 6h).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso ao módulo: `canViewSegundoCerebro(role)` (SUP, FINANCEIRO, COMERCIAL, PADRAO).\n- Consultar base documental: `canConsultSegundoCerebroDocs(role)`.\n- Interagir com assistente de IA: `canUseSegundoCerebroAI(role)`.\n- Informações estratégicas (Conselheiro, Radar, Insights): `canViewStrategicIntelligence(role)` (SUP, FINANCEIRO, COMERCIAL).\n- Documentos confidenciais: `canViewConfidentialDocs(role)` (apenas SUP).\n- Administrar integrações e upload Obsidian: `canAdminSegundoCerebroIntegrations(role)` (SUP, COMERCIAL, FINANCEIRO).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SegundoCerebroScreen`, `SegundoCerebroHeader`, `SegundoCerebroAssistant`, `SegundoCerebroLibrary`, `SegundoCerebroAdvisor`, `SegundoCerebroProjects`, `SegundoCerebroDecisions`, `SegundoCerebroRadar`, `SegundoCerebroKnowledgeMap`, `SegundoCerebroInsights`, `SegundoCerebroHistory`, `SegundoCerebroSettings`.\n- Serviços e Tipos: `src/services/segundo-cerebro.ts`, `src/types/segundo-cerebro.ts`, `src/lib/permissions.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de rota direta com redirecionamento para `/admin` caso o usuário não possua permissão.\n- Tratamento resiliente de falhas de IA (`SkipAiConfigError`, `SkipAiAgentsError`, `SkipAiError`) com feedback explicativo via toast.\n- Relatório de erros pontuais na sincronização de notas sem interromper a ingestão dos arquivos íntegros.\n- Pendente de validação técnica: busca semântica completa por embeddings vetoriais assíncronos (atualmente operando por busca léxica, chunks e metadados com sinalização explícita na interface).',
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
        '- Apenas o perfil SUP pode alterar chaves de segurança, configurações de MFA e matriz de permissões.\n- Parâmetros alterados aplicam-se a novas sessões ou após recarregamento dos dados de sistema.\n- Política de Inatividade de Sessão: o encerramento automático por ociosidade é governado individualmente por usuário (`inactivity_timeout_minutes` com default de 5 minutos configurado na aba de usuários em Central de Cadastros), sendo monitorado em toda a aplicação autenticada pelo componente `InactivityTracker`.',
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
  '/admin/produtos': {
    route: '/admin/produtos',
    title: 'Cadastro Mestre e Fiscal de Produtos (NF-e mod 55)',
    moduleGroup: 'Comercial / Fiscal',
    docVersion: '1.2.0',
    lastUpdated: '2026-04-15',
    author: 'Engenharia de Software Jetro & HURAM ERP',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o catálogo mestre de produtos e suas parametrizações fiscais para DEC Eldorado e Gran Romano, permitindo operações de entrada de mercadorias, conversão de embalagens, simulação fiscal auditável no servidor e emissão de NF-e modelo 55 em operações internas e interestaduais, com isolamento fiscal estrito por estabelecimento e suporte a fabricação própria.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro Mestre Compartilhado: código único gerado automaticamente, descrição completa e resumida, marca, categoria, subcategoria, grupo de produtos, referência externa/legado (Sankhya), unidade base e status ativo.\n- Classificação de Tipo/Finalidade Fiscal: distinção explícita entre revenda, fabricação própria (industrialização), matéria-prima, embalagem, insumo, ativo imobilizado e uso/consumo.\n- Configuração Fiscal por Empresa (product_company_fiscal): aba dedicada com seleção de estabelecimento ativo (DEC Eldorado vs Gran Romano), definição de CFOP interno (5101/5102) e interestadual (6101/6102), CST/CSOSN, CEST, cBenef, overrides anuláveis de alíquotas (ICMS, FCP, IPI, PIS, COFINS, IBS/CBS), cClassTrib da Reforma e exigência de controle por lote.\n- Simulador Fiscal Auditável no Backend (`/backend/v1/huram/fiscal/simulate`): motor server-side ativo que calcula ICMS, ST com MVA, FCP, DIFAL, PIS, COFINS e Reforma (IBS/CBS), gerando registro imutável em `fiscal_simulations` com regras aplicadas, memória de cálculo passo a passo e operador responsável.\n- Apresentações e Unidades de Conversão (product_units): cadastro de caixas (CX), fardos (FD) e múltiplos com fator estritamente positivo (> 0), operador (multiplica/divide), identificação de unidade tributável e suporte a GTIN próprio da embalagem ou "SEM GTIN".\n- Referências de Fornecedor / De-Para de XML (supplier_product_refs): mapeamento de CNPJ do fornecedor, código externo (cProd), unidade de nota (uCom), fator de conversão validado e GTIN do fornecedor, eliminando associações ambíguas na entrada de NF-e.\n- Status Fiscal Auditável: indicador explícito entre "Pronto para NF-e" (validado) e "Rascunho Incompleto" (permitido no ERP, mas bloqueado para operações fiscais até validação completa).\n- Tratamento Estrito de GTIN/EAN: validação do algoritmo GS1 (dígito verificador de 8, 12, 13 e 14 dígitos) com chave explícita para produto sem código de barras ("SEM GTIN"). Nunca inventa código.\n- NCM Textual Preservado: validação de 8 dígitos preservando zeros à esquerda e formatação sem conversão para inteiro.\n- Filtros e KPIs Executivos: contadores de itens ativos, prontos para NF-e, produtos de fabricação própria e pendentes.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Multitenancy e Isolamento Fiscal: as regras fiscais, CFOPs e alíquotas da Gran Romano (SP/ES) e DEC Eldorado (ES) são gravadas independentemente na coleção `product_company_fiscal`. Uma alteração em uma unidade nunca herda nem sobrescreve indevidamente a outra.\n- Fabricação Própria vs Revenda: produtos categorizados como fabricação própria recebem sugestão automática de CFOP 5101 (interno) e 6101 (interestadual), enquanto revenda utiliza 5102 e 6102.\n- Fator de Conversão Estritamente Positivo: todo fator em `product_units` ou `supplier_product_refs` deve ser estritamente maior que zero (> 0), rejeitando valores nulos, zerados ou negativos.\n- CEST e IPI Não-Universal: o CEST não é exigido para toda mercadoria, assim como IPI não é universal para toda saída; campos são opcionais e anuláveis.\n- Precisão Decimal Exata: fatores de conversão e alíquotas são armazenados como strings decimais formatadas (4 casas), sem dependência de arredondamento por ponto flutuante binário de tela.\n- Rascunhos Permitidos: o ERP aceita gravação de produtos incompletos em modo "Rascunho", porém o sistema bloqueia sua utilização em notas fiscais até que passe na avaliação fiscal completa.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador acessa Cadastros → Produtos (`/admin/produtos` ou `/admin/cadastros/produtos`) pelo menu lateral.\n2. Clica em "Novo Produto" e informa a descrição, unidade base e tipo/finalidade (revenda, fabricação própria, etc.).\n3. Preenche o NCM (8 dígitos) e GTIN (ou marca "Produto Sem GTIN").\n4. Salva o produto para gerar o código interno sequencial.\n5. Com o produto gerado, acessa a aba "Fiscal por Empresa" e parametriza a regra específica para DEC Eldorado e Gran Romano.\n6. Caso o produto seja comprado em caixas ou fardos, cadastra as apresentações na aba "Apresentações (Unidades)" ou associa o de-para de fornecedor na aba "De-Para Fornecedor".\n7. Clica em "Validar e Liberar para Fiscal" quando todos os parâmetros fiscais estiverem conformes.\n8. Opcionalmente aciona "Simulação Fiscal Auditada" para testar o cálculo de ICMS, ST, FCP, DIFAL, PIS, COFINS e IBS/CBS no backend.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `products` (cadastro mestre), `product_company_fiscal` (regras por empresa), `product_units` (conversão e apresentações), `supplier_product_refs` (de-para fornecedores), `fiscal_simulations` (auditoria de cálculos), `fiscal_catalogs` (catálogos de CFOP, NCM, CST, Origem) e `empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Faturamento e NF-e mod 55 (regras consultadas por empresa+UF no momento da emissão).\n- Importador de XML de Entrada (busca automática de de-para em `supplier_product_refs` e fator de conversão).\n- Módulo de Estoque (movimentação baseada na unidade padrão do produto e conversão de apresentações).\n- Simulador Fiscal Server-Side (`/backend/v1/huram/fiscal/simulate`).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewCadastros(role)` ou operadores comerciais e fiscais autenticados.\n- Criação e Edição: operadores cadastrais e fiscais autorizados.\n- Validação Fiscal: restrita ao responsável fiscal da empresa.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `src/components/products-panel.tsx`, `src/components/product-form-dialog.tsx`, `src/components/product-tab-company-fiscal.tsx`, `src/components/product-tab-units.tsx`, `src/components/product-tab-supplier-refs.tsx`, `src/components/fiscal/fiscal-audit-simulator.tsx`.\n- Serviços: `src/services/products.ts`.\n- Validações: `src/lib/fiscal-validations.ts`.\n- Migração backend: `0287_products_fiscal_architecture.js`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros e Pendências Externas',
      content:
        '- Validação em tempo real de NCM (8 dígitos) e GTIN com algoritmo GS1.\n- Rejeição com alerta visual de fatores de conversão menores ou iguais a zero.\n- Bloqueio informativo com toast descritivo ao tentar liberar para fiscal com pendências de dados obrigatórios.\n\n[DECLARAÇÃO EXPLÍCITA DE PENDÊNCIAS EXTERNAS]:\n- O simulador fiscal e a entrada de XML com idempotência encontram-se 100% implementados e ativos no sistema.\n- Para a emissão/transmissão real de NF-e à SEFAZ, o ERP requer a pendência externa da aquisição do Certificado Digital A1 (.pfx) emitido por Autoridade Certificadora ICP-Brasil e o respectivo credenciamento da empresa na SEFAZ estadual (ES/SP). Conforme a regra do projeto, nenhuma chave ou credencial externa é simulada como operacional sem o certificado real.',
    },
  },

  '/admin/cadastros/produtos': {
    route: '/admin/cadastros/produtos',
    title: 'Cadastro Mestre e Fiscal de Produtos (NF-e mod 55)',
    moduleGroup: 'Comercial / Fiscal',
    docVersion: '2.1.0',
    lastUpdated: '2026-04-15',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o catálogo mestre de produtos e suas parametrizações fiscais para DEC Eldorado e Gran Romano, permitindo operações de entrada de mercadorias, conversão de embalagens, simulação fiscal auditável no servidor e emissão de NF-e modelo 55 em operações internas e interestaduais, com isolamento fiscal estrito por estabelecimento e suporte a fabricação própria.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro Mestre Compartilhado: código único gerado automaticamente, descrição completa e resumida, marca, categoria, subcategoria, grupo de produtos, referência externa/legado (Sankhya), unidade base e status ativo.\n- Classificação de Tipo/Finalidade Fiscal: distinção explícita entre revenda, fabricação própria (industrialização), matéria-prima, embalagem, insumo, ativo imobilizado e uso/consumo.\n- Configuração Fiscal por Empresa (product_company_fiscal): aba dedicada com seleção de estabelecimento ativo (DEC Eldorado vs Gran Romano), definição de CFOP interno (5101/5102) e interestadual (6101/6102), CST/CSOSN, CEST, cBenef, overrides anuláveis de alíquotas (ICMS, FCP, IPI, PIS, COFINS, IBS/CBS), cClassTrib da Reforma e exigência de controle por lote.\n- Simulador Fiscal Auditável no Backend (`/backend/v1/huram/fiscal/simulate`): motor server-side ativo que calcula ICMS, ST com MVA, FCP, DIFAL, PIS, COFINS e Reforma (IBS/CBS), gerando registro imutável em `fiscal_simulations` com regras aplicadas, memória de cálculo passo a passo e operador responsável.\n- Apresentações e Unidades de Conversão (product_units): cadastro de caixas (CX), fardos (FD) e múltiplos com fator estritamente positivo (> 0), operador (multiplica/divide), identificação de unidade tributável e suporte a GTIN próprio da embalagem ou "SEM GTIN".\n- Referências de Fornecedor / De-Para de XML (supplier_product_refs): mapeamento de CNPJ do fornecedor, código externo (cProd), unidade de nota (uCom), fator de conversão validado e GTIN do fornecedor, eliminando associações ambíguas na entrada de NF-e.\n- Status Fiscal Auditável: indicador explícito entre "Pronto para NF-e" (validado) e "Rascunho Incompleto" (permitido no ERP, mas bloqueado para operações fiscais até validação completa).\n- Tratamento Estrito de GTIN/EAN: validação do algoritmo GS1 (dígito verificador de 8, 12, 13 e 14 dígitos) com chave explícita para produto sem código de barras ("SEM GTIN"). Nunca inventa código.\n- NCM Textual Preservado: validação de 8 dígitos preservando zeros à esquerda e formatação sem conversão para inteiro.\n- Filtros e KPIs Executivos: contadores de itens ativos, prontos para NF-e, produtos de fabricação própria e pendentes.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Multitenancy e Isolamento Fiscal: as regras fiscais, CFOPs e alíquotas da Gran Romano (SP/ES) e DEC Eldorado (ES) são gravadas independentemente na coleção `product_company_fiscal`. Uma alteração em uma unidade nunca herda nem sobrescreve indevidamente a outra.\n- Fabricação Própria vs Revenda: produtos categorizados como fabricação própria recebem sugestão automática de CFOP 5101 (interno) e 6101 (interestadual), enquanto revenda utiliza 5102 e 6102.\n- Fator de Conversão Estritamente Positivo: todo fator em `product_units` ou `supplier_product_refs` deve ser estritamente maior que zero (> 0), rejeitando valores nulos, zerados ou negativos.\n- CEST e IPI Não-Universal: o CEST não é exigido para toda mercadoria, assim como IPI não é universal para toda saída; campos são opcionais e anuláveis.\n- Precisão Decimal Exata: fatores de conversão e alíquotas são armazenados como strings decimais formatadas (4 casas), sem dependência de arredondamento por ponto flutuante binário de tela.\n- Rascunhos Permitidos: o ERP aceita gravação de produtos incompletos em modo "Rascunho", porém o sistema bloqueia sua utilização em notas fiscais até que passe na avaliação fiscal completa.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador acessa Cadastros → Produtos (`/admin/cadastros/produtos`) pelo menu lateral.\n2. Clica em "Novo Produto" e informa a descrição, unidade base e tipo/finalidade (revenda, fabricação própria, etc.).\n3. Preenche o NCM (8 dígitos) e GTIN (ou marca "Produto Sem GTIN").\n4. Salva o produto para gerar o código interno sequencial.\n5. Com o produto gerado, acessa a aba "Fiscal por Empresa" e parametriza a regra específica para DEC Eldorado e Gran Romano.\n6. Caso o produto seja comprado em caixas ou fardos, cadastra as apresentações na aba "Apresentações (Unidades)" ou associa o de-para de fornecedor na aba "De-Para Fornecedor".\n7. Clica em "Validar e Liberar para Fiscal" quando todos os parâmetros fiscais estiverem conformes.\n8. Opcionalmente aciona "Simulação Fiscal Auditada" para testar o cálculo de ICMS, ST, FCP, DIFAL, PIS, COFINS e IBS/CBS no backend.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `products` (cadastro mestre), `product_company_fiscal` (regras por empresa), `product_units` (conversão e apresentações), `supplier_product_refs` (de-para fornecedores), `fiscal_simulations` (auditoria de cálculos), `fiscal_catalogs` (catálogos de CFOP, NCM, CST, Origem) e `empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Faturamento e NF-e mod 55 (regras consultadas por empresa+UF no momento da emissão).\n- Importador de XML de Entrada (busca automática de de-para em `supplier_product_refs` e fator de conversão).\n- Módulo de Estoque (movimentação baseada na unidade padrão do produto e conversão de apresentações).\n- Simulador Fiscal Server-Side (`/backend/v1/huram/fiscal/simulate`).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewCadastros(role)` ou operadores comerciais e fiscais autenticados.\n- Criação e Edição: operadores cadastrais e fiscais autorizados.\n- Validação Fiscal: restrita ao responsável fiscal da empresa.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `src/components/products-panel.tsx`, `src/components/product-form-dialog.tsx`, `src/components/product-tab-company-fiscal.tsx`, `src/components/product-tab-units.tsx`, `src/components/product-tab-supplier-refs.tsx`, `src/components/fiscal/fiscal-audit-simulator.tsx`.\n- Serviços: `src/services/products.ts`.\n- Validações: `src/lib/fiscal-validations.ts`.\n- Migração backend: `0287_products_fiscal_architecture.js`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros e Pendências Externas',
      content:
        '- Validação em tempo real de NCM (8 dígitos) e GTIN com algoritmo GS1.\n- Rejeição com alerta visual de fatores de conversão menores ou iguais a zero.\n- Bloqueio informativo com toast descritivo ao tentar liberar para fiscal com pendências de dados obrigatórios.\n\n[DECLARAÇÃO EXPLÍCITA DE PENDÊNCIAS EXTERNAS]:\n- O simulador fiscal e a entrada de XML com idempotência encontram-se 100% implementados e ativos no sistema.\n- Para a emissão/transmissão real de NF-e à SEFAZ, o ERP requer a pendência externa da aquisição do Certificado Digital A1 (.pfx) emitido por Autoridade Certificadora ICP-Brasil e o respectivo credenciamento da empresa na SEFAZ estadual (ES/SP). Conforme a regra do projeto, nenhuma chave ou credencial externa é simulada como operacional sem o certificado real.',
    },
  },

  '/admin/cadastros': {
    route: '/admin/cadastros',
    title: 'Central de Cadastros Gerais',
    moduleGroup: 'Comercial',
    docVersion: '1.1.0',
    lastUpdated: '2025-05-20',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar os cadastros mestres e operacionais do sistema, incluindo parceiros de negócio (Clientes, Fornecedores, Transportadoras, Representantes), endereços, contatos, restrições comerciais e a Gestão de Usuários do Sistema, com controle unificado de credenciais, permissões, empresas vinculadas e políticas de sessão.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Tabela unificada com pesquisa por Razão Social, Nome Fantasia, CNPJ/CPF.\n- Formulário com abas: Dados Cadastrais (PF/PJ), Endereços, Contatos e Responsáveis, Dados Financeiros e Restrições de Crédito.\n- Consulta automática de CNPJ e CEP.\n- Controle de ativação/inativação de parceiros.\n- Gestão de Usuários do Sistema (UserManagement / UserEditDialog) com criação e edição de usuários, vinculação multiempresa, seleção de perfil de acesso, definição de tempo individual de inatividade de sessão e validação em tempo real de unicidade de credenciais.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Validação obrigatória de CNPJ/CPF com dígito verificador.\n- Parceiros marcados com restrição de crédito exigem liberação especial para emissão de novos pedidos.\n- Exclusão de parceiros bloqueada caso existam transações vinculadas.\n- Login Único GLOBAL entre todas as empresas: o identificador de login de cada usuário é estritamente único em todo o sistema corporativo e transversal a todas as empresas do grupo econômico. A validação é case-insensitive e opera com normalização em minúsculas (lowercase) sem espaços. Em caso de colisão, tanto na criação de novo usuário quanto na edição de usuário existente (ignorando o próprio registro), o sistema emite a mensagem exata: "Este login já está em uso por outra empresa do grupo. Escolha um login diferente.".\n- Dupla Camada de Validação (Frontend e Backend): no frontend, o serviço (`isLoginTakenGlobally` em `src/services/users.ts`) realiza a checagem preventiva em tempo real antes da persistência; no backend, um hook em PocketBase (`pocketbase/hooks/users_global_login_guard.js`) intercepta as requisições `onRecordCreateRequest` e `onRecordUpdateRequest`, normalizando o login em minúsculas e bloqueando com BadRequestError HTTP 400 qualquer duplicidade global entre empresas.\n- Controle de Inatividade de Usuários: cada usuário possui configuração individual de "Tempo de inatividade para deslogar" (em minutos, campo `inactivity_timeout_minutes` na coleção `users`, mínimo 1 min, máximo 480 min). O padrão corporativo é de 480 minutos (8 horas), sendo editável por administradores a qualquer momento. O frontend monitora interações reais (mouse, teclado, cliques, toque, scroll) e exibe contagem regressiva nos últimos 30 segundos com opção "Continuar conectado" antes de deslogar por inatividade e redirecionar para o login com aviso explicativo.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador acessa a tela de Cadastros e seleciona o cadastro desejado (ex.: Usuários ou Parceiros).\n2. Na Gestão de Usuários, ao clicar em "Novo Cadastro", o formulário gera código sequencial automático e o operador informa nome, login, e-mail, senha, perfil de acesso e empresas vinculadas.\n3. O frontend normaliza o login em minúsculas e executa verificação preventiva global de unicidade entre todas as empresas do grupo.\n4. Ao submeter, o hook de backend valida a unicidade global case-insensitive; se o login já existir, a gravação é rejeitada com a mensagem de aviso.\n5. Persistido com sucesso, o registro é atualizado imediatamente na listagem com as flags de auditoria e status de acesso.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `partners`, `partner_types`, `partner_addresses`, `partner_financial`, `users`, `empresas`, `filiais`, `perfis_permissoes`, `usuarios_empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Serviços externos de consulta de CNPJ (ReceitaWS/BrasilAPI) e ViaCEP.\n- Hooks de integridade do PocketBase (`users_global_login_guard.js`) para imposição de regras de autenticação e governança multiempresa.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Parceiros: `canManagePartners(role)`, `canRegisterPartners`, `canEditPartners` e exclusão restrita a `canDeletePartners` (SUP).\n- Gestão de Usuários: restrita a administradores e supervisores via `canManageUsers(role)` / perfil SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        'Componentes de `src/components/partner-*`, `src/components/cadastros/*`, `UserManagement`, `UserEditDialog`, `src/services/users.ts`, hook `users_global_login_guard.js` e `InactivityTracker`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Erros de duplicidade de CNPJ/CPF são identificados e exibidos diretamente no campo correspondente.\n- Tentativas de cadastro ou alteração de login para um já existente em qualquer empresa do grupo retornam erro claro e destacado: "Este login já está em uso por outra empresa do grupo. Escolha um login diferente.", sem perda dos dados preenchidos no formulário.',
    },
  },

  // -------------------------------------------------------------
  // 9.0 CADASTRO DE EMPRESAS (MATRIZ E FILIAIS / CONSULTA CNPJ)
  // -------------------------------------------------------------
  '/admin/cadastros/empresas': {
    route: '/admin/cadastros/empresas',
    title: 'Cadastro de Empresas (Matriz e Filiais)',
    moduleGroup: 'Comercial',
    docVersion: '1.2.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as pessoas jurídicas do grupo empresarial Huram (empresas independentes, matrizes e filiais vinculadas), permitindo a consulta automatizada de dados públicos cadastrais via CNPJ, parametrização de identidade visual/marca por unidade e preservando o isolamento multitenancy estrito entre os CNPJs do sistema.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem completa de empresas cadastradas com visualização em tabela de código, razão social, nome fantasia, CNPJ, badge de classificação (Matriz vs. Filial com indicador da matriz vinculada), status ativo/inativo e data de cadastro.\n- Busca rápida em tempo real por razão social, nome fantasia, CNPJ ou código.\n- Formulário padronizado de cadastro e edição de empresas via modal (`CadastroFormDialog`), suportando inserção manual ou enriquecimento via consulta de CNPJ.\n- Consulta Pública de CNPJ: botão dedicado "Consultar CNPJ" integrado a provedores públicos (BrasilAPI com fallback transparente para ReceitaWS), que normaliza e preenche automaticamente Razão Social, Nome Fantasia, Endereço consolidado (logradouro, número, complemento e bairro), Município, UF, CEP, Telefone e E-mail.\n- Revisão antes de Salvar: o preenchimento automático nunca trava os campos; todos os dados permanecem 100% editáveis pelo operador antes da confirmação.\n- Classificação de Unidade: seleção do Tipo de Unidade entre "Empresa independente / Matriz" e "Filial".\n- Vínculo Obrigatório de Matriz: ao selecionar "Filial", a interface renderiza campo obrigatório com a lista de empresas matrizes cadastradas (filtrando outras filiais e a própria empresa em edição), garantindo a hierarquia corporativa.\n- Identidade de Marca por Empresa: campos para definição de nome da marca, cor primária, cor secundária, logotipo oficial e flag de empresa padrão do ERP.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Multitenancy Intacto e Isolamento por CNPJ: cada empresa/filial possui seus próprios lançamentos, pedidos, movimentações de estoque, títulos financeiros e permissões de usuários; o vínculo matriz-filial é exclusivamente estrutural e cadastral, sem mistura cruzada de dados operacionais.\n- Validação Obrigatória de Matriz para Filiais: nenhuma unidade classificada como "Filial" pode ser salva sem `matriz_id` válido apontando para uma empresa matriz previamente cadastrada.\n- Auto-vínculo Bloqueado: uma empresa não pode ser matriz de si mesma.\n- Exclusão e Hierarquia: filiais cadastradas não aparecem na listagem de seleção de matrizes para evitar encadeamentos cíclicos inválidos.\n- Resiliência da Consulta de CNPJ: falhas de conectividade, CNPJ inexistente ou instabilidade nos provedores públicos externos exibem aviso claro e não bloqueiam o preenchimento manual nem a operação do formulário.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador acessa Cadastros → Empresas (`/admin/cadastros/empresas`).\n2. Para cadastrar nova unidade, clica em "Novo Cadastro".\n3. Informa o CNPJ (14 dígitos) e clica em "Consultar CNPJ". O serviço público consulta BrasilAPI (ou ReceitaWS) e preenche os campos cadastrais disponíveis.\n4. O operador revisa e complementa os dados cadastrais (Razão Social, Nome Fantasia, Inscrição Estadual, Endereço, etc.).\n5. Define o Tipo de Unidade: se "Filial", seleciona obrigatoriamente a empresa Matriz responsável.\n6. Ao clicar em "Salvar", o sistema valida a obrigatoriedade dos campos, persiste na coleção `empresas` com `tipo_unidade` e `matriz_id` e atualiza a listagem.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleção PocketBase: `empresas` (campos: `code`, `name`, `razao_social`, `nome_fantasia`, `cnpj`, `tipo_unidade`, `matriz_id`, `inscricao_estadual`, `inscricao_municipal`, `address`, `city`, `state`, `cep`, `phone`, `email`, `active`, `padrao`, `marca_nome_exibicao`, `marca_cor_primaria`, `marca_cor_secundaria`, `logo`, `marca_logo`).\n- Serviços externos: APIs públicas da BrasilAPI e ReceitaWS para consulta de CNPJ.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Serviço `consultarCNPJPublico` em `src/services/cnpj-service.ts` (BrasilAPI v1/v2 com fallback automático para ReceitaWS v1).\n- Redirecionamento 301/replace da rota antiga `/admin/configuracoes/dados-empresa` para `/admin/cadastros/empresas`.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado conforme a governança de Cadastros/Configurações (`canViewConfiguracoes(role)`).\n- Alteração e criação restritas a administradores e supervisores corporativos autorizados.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `src/components/cadastros/cadastro-standard-screen.tsx`, `src/components/cadastros/cadastro-form-dialog.tsx`.\n- Configuração: `src/lib/cadastros-config.ts` (coleção `empresas`).\n- Serviços: `src/services/cnpj-service.ts`, `src/services/cadastros.ts`.\n- Cliente: `pb` (`src/lib/pocketbase/client.ts`).',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Erro de consulta pública de CNPJ: exibe feedback em toast e card informativo com a mensagem de falha, permitindo preenchimento manual sem perda de dados.\n- Tentativa de salvar Filial sem Matriz: bloqueio imediato com aviso descritivo.\n- Falhas de gravação no banco: notificação via toast destrutivo mantendo os dados preenchidos no formulário.',
    },
  },

  // Redirecionamento da rota antiga de dados da empresa para a documentação unificada
  '/admin/configuracoes/dados-empresa': {
    route: '/admin/configuracoes/dados-empresa',
    title: 'Dados da Empresa (Rota Legada → Unificada em Cadastros/Empresas)',
    moduleGroup: 'Administração',
    docVersion: '1.2.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Rota legada mantida com redirecionamento automático (`<Navigate to="/admin/cadastros/empresas" replace />`) para a tela unificada e oficial de Cadastro de Empresas do ERP Huram.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Redirecionamento transparente e imediato de navegação legada para `/admin/cadastros/empresas`.\n- Unificação do cadastro cadastral e fiscal de empresas na Central de Cadastros com suporte a CNPJ público e hierarquia Matriz/Filial.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O item "Dados da Empresa" foi removido do menu Configurações para unificar a gestão de pessoas jurídicas sob Cadastros → Empresas.\n- Todas as regras de negócio, permissões e integrações aplicam-se à tela oficial `/admin/cadastros/empresas`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Qualquer requisição ou link para `/admin/configuracoes/dados-empresa` é redirecionado instantaneamente pelo roteador para `/admin/cadastros/empresas`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: 'Consulte a documentação de `/admin/cadastros/empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Consulte a documentação de `/admin/cadastros/empresas`.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Consulte a documentação de `/admin/cadastros/empresas`.',
    },
    dependencies: {
      title: 'Dependências',
      content: 'Roteamento em `src/App.tsx`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: 'N/A (redirecionamento declarativo via React Router).',
    },
  },

  // -------------------------------------------------------------
  // 9.1 GESTÃO DE USUÁRIOS (ROTA DIRETA E SUBMENU DE CADASTROS)
  // -------------------------------------------------------------
  '/admin/cadastros/usuarios': {
    route: '/admin/cadastros/usuarios',
    title: 'Gestão de Usuários (Central de Cadastros)',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-20',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Administrar as contas de acesso dos usuários do ERP Jetro, gerenciando credenciais de login, senhas, papéis/perfis de permissão, empresas e filiais autorizadas, política de inatividade de sessão e status operacional (ativo/inativo).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem completa de usuários com busca em tempo real por código, login, nome, e-mail e cargo.\n- Indicador de código sequencial automático somente leitura.\n- Cadastro de novo usuário via modal com definição de nome, login institucional, e-mail, senha, CPF, perfil de permissões, setor, cargo e vínculo com múltiplas empresas (multiempresa) e filiais.\n- Edição de usuário existente permitindo alteração de dados cadastrais, redefinição forçada de senha no próximo login, alteração de empresas autorizadas e ajuste individual do tempo de inatividade.\n- Alternância instantânea de status de acesso (Ativo / Inativo) via switch com validação de permissão SUP.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Login Único GLOBAL entre todas as empresas: o identificador de login é rigorosamente único em âmbito global, transversal a todas as empresas do grupo econômico. Não é permitido que duas empresas diferentes utilizem o mesmo login para usuários distintos.\n- Normalização e Validação Case-Insensitive: o campo login é tratado com remoção de espaços e normalizado em caracteres minúsculos (lowercase). A validação não diferencia maiúsculas de minúsculas.\n- Mensagem Obrigatória de Validação: ao tentar salvar um login duplicado, tanto na criação quanto na edição de usuário (ignorando o próprio ID em alteração), o sistema apresenta obrigatoriamente a mensagem: "Este login já está em uso por outra empresa do grupo. Escolha um login diferente.".\n- Imposição em Camada Dupla (Frontend e Backend):\n  1. Frontend: o serviço `src/services/users.ts` executa a função preventiva `isLoginTakenGlobally(cleanLogin, excludeUserId)` antes do envio da requisição, capturando conflitos precocemente.\n  2. Backend: o hook PocketBase `pocketbase/hooks/users_global_login_guard.js` valida `onRecordCreateRequest` e `onRecordUpdateRequest`, garantindo que nenhuma requisição direta via API viole a unicidade global entre as empresas.\n- Código do Usuário: numérico sequencial gerado automaticamente pelo sistema, protegido como somente leitura (não editável).\n- Inatividade de Sessão: tempo configurável por usuário no campo `inactivity_timeout_minutes` (entre 1 e 480 minutos, com padrão corporativo de 480 min). Monitorado globalmente pelo componente `InactivityTracker`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador navega pelo menu lateral em Cadastros > Usuários.\n2. Para cadastrar, clica em "Novo Cadastro"; o formulário atribui o próximo código sequencial disponível.\n3. O usuário preenche os campos; ao digitar o login, a digitação é normalizada em minúsculas.\n4. Ao submeter, o frontend executa a validação preventiva e submete à API do PocketBase.\n5. O hook de backend valida a unicidade global em todas as empresas. Se o login já estiver em uso, a transação é cancelada e a mensagem de bloqueio é exibida.\n6. Com a confirmação, o usuário é cadastrado e sincronizado com os vínculos na coleção `usuarios_empresas`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `users`, `empresas`, `filiais`, `perfis_permissoes`, `usuarios_empresas`.\n- Hooks de backend: `pocketbase/hooks/users_global_login_guard.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Mecanismo de autenticação e controle de sessões do PocketBase.\n- Motor de auditoria corporativo para registro de ativação/desativação e redefinição de senhas.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso e gestão de usuários restritos a administradores e perfis com permissão `canManageUsers(role)` / perfil SUP.\n- Alteração de status ativo/inativo e exclusão restritas exclusivamente ao perfil SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `src/components/user-management.tsx`, `src/components/user-edit-dialog.tsx`, `src/components/cadastros/cadastros-panel.tsx`.\n- Serviços: `src/services/users.ts`.\n- Hooks de backend: `pocketbase/hooks/users_global_login_guard.js`.\n- Sessão: `src/components/inactivity-tracker.tsx`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Conflito de login global: interceptado com exibição da mensagem "Este login já está em uso por outra empresa do grupo. Escolha um login diferente.".\n- Conflito de CPF ou E-mail: aviso específico de campo já cadastrado.\n- Senha atual inválida em autoedição: notificação clara sem perda dos dados preenchidos.',
    },
  },

  // -------------------------------------------------------------
  // 9.2 AUDITORIA DE ACESSOS E CENTRAL DE USUÁRIOS
  // -------------------------------------------------------------
  '/admin/usuarios': {
    route: '/admin/usuarios',
    title: 'Central de Usuários e Auditoria de Acessos',
    moduleGroup: 'Administração',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-20',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Prover controle avançado de governança, auditoria de logins e sessões ativas dos usuários do ERP Jetro, permitindo o acompanhamento de histórico de acessos, anomalias e encerramento remoto de sessões.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Visão geral consolidada de usuários com dados de último acesso, status de MFA e nível de risco.\n- Detalhamento individual com histórico completo de eventos de autenticação (logins, falhas, trocas de senha).\n- Visualização de sessões ativas com possibilidade de término remoto de sessão por administradores.\n- Alertas de auditoria e configuração de políticas de retenção de histórico.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Exclusivo para administradores e perfil SUP (`canManageUsers(role)`).\n- Coordenadas geográficas precisas e exportação de relatórios de auditoria exigem flags de permissão específicas (`canViewUserPreciseCoords`, `canExportUserAudit`).\n- A unicidade e governança de credenciais obedecem à regra de login global único estabelecida no módulo de gestão de usuários.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador acessa Administração > Usuários (/admin/usuarios) pelo menu lateral.\n2. A tabela consolida métricas de auditoria via `fetchUsersAuditOverview`.\n3. Ao selecionar um usuário, abre-se a tela de detalhes com eventos, sessões e alertas carregados em tempo real.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `users`, `audit_logs`, `audit_sessions`, `audit_alerts`, `audit_settings`.\n- Serviço: `src/services/user-audit-service.ts`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Módulos de auditoria de segurança e rastreamento de IP/User-Agent corporativo.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Restrito a `canManageUsers(role)` e perfis autorizados (SUP / Administradores).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        'Componentes: `UsersAdminPage`, `UsersTable`, `UserDetailsScreen`, `RetentionPolicyDialog`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Bloqueio de acesso para perfis não autorizados com tela de alerta e opção de retorno seguro ao painel.',
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
  // 12. MÓDULO FINANCEIRO (6 TELAS OFICIAIS UNIFICADAS)
  // -------------------------------------------------------------
  ...FINANCIAL_SCREEN_DOCS,

  // -------------------------------------------------------------
  // 13. MÓDULO FISCAL
  // -------------------------------------------------------------
  '/admin/fiscal': {
    route: '/admin/fiscal',
    title: 'Gestão Fiscal e Documentos Eletrônicos (HURAM ERP)',
    moduleGroup: 'Fiscal',
    docVersion: '1.1.0',
    lastUpdated: '2025-05-19',
    author: 'Engenharia de Software Jetro & HURAM ERP',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar a emissão, validação, transmissão e escrituração de documentos fiscais eletrônicos (NF-e mod 55, NFC-e, NFS-e, CT-e, MDF-e), entrada idempotente via XML, simulador auditável de tributos e homologação SEFAZ, com isolamento multitenant entre Dec Eldorado e Gran Romano.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Simulador Fiscal Auditável no Backend (`/backend/v1/huram/fiscal/simulate`): motor server-side que cruza produto, empresa ativa (Dec Eldorado × Gran Romano) e operação (venda interna 5101/5102, interestadual 6101/6102, compras 1101/2101), apurando ICMS, ICMS-ST com MVA, FCP, DIFAL, PIS, COFINS e Reforma Tributária (IBS/CBS com cClassTrib), gravando cada cálculo em `fiscal_simulations` com memória de cálculo passo a passo.\n- Entrada de Mercadorias via XML com Idempotência Estrita (`/backend/v1/huram/fiscal/xml-entry`): upload de XML modelo 55, extração da chave de 44 dígitos (chNFe), bloqueio de reimportação duplicada, matching automático de itens com `supplier_product_refs` (cProd, uCom, fator de conversão) e GTIN/código interno; itens sem de-para permanecem pendentes sem dados inventados; integração com movimentações de estoque em `stock_movements`.\n- Emissão de NF-e em Ambiente de Homologação (`/backend/v1/huram/fiscal/nfe-generate` e `/backend/v1/huram/fiscal/nfe-transmit`): montagem e validação do XML modelo 55 layout PL_009_V400, geração de chave de 44 dígitos com dígito verificador módulo 11, cálculo dos tributos coerente com a configuração da empresa, armazenamento do artefato em `fiscal_document_artifacts` e exportação do XML.\n- Carta de correção eletrônica (CC-e) e manifestação do destinatário.\n- Apuração de tributos e visualização da Reforma Tributária.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Idempotência Estrita por Chave de Acesso: toda NF-e de entrada ou saída possui chave única de 44 dígitos. Tentativa de reimportar o mesmo XML é barrada pelo sistema, informando data e número do lançamento original sem gerar duplicidade de estoque ou financeiro.\n- De-Para de Produtos Fiel: itens de XML que não possuem correspondência exata em `supplier_product_refs`, GTIN ou código interno são classificados como "Pendente De-Para" e nunca geram produtos inventados no estoque.\n- Isolamento Multitenant: cada empresa (Dec Eldorado vs Gran Romano) calcula tributos e emite documentos exclusivamente com seus próprios dados cadastrais e fiscais.\n- PENDÊNCIA EXTERNA DECLARADA (Certificado Digital A1): A geração do XML, cálculos e validação do layout SEFAZ funcionam integralmente no sistema. Contudo, a assinatura digital (XML-DSig RSA-SHA1) e a transmissão via WebService SEFAZ em tempo real requerem a contratação e injeção do Certificado Digital A1 (.pfx) da empresa e o credenciamento de emissor junto à SEFAZ de origem (ES ou SP). Conforme a regra do projeto, nenhuma credencial é inventada.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Entrada: o usuário faz upload do XML na tela de Entrada de Notas; o backend valida a chave de 44 dígitos, aplica o de-para de fornecedor e alimenta compras e estoque.\n2. Simulação: o operador simula cenários na aba Fiscal por Empresa do produto, recebendo memória de cálculo detalhada e ID de auditoria.\n3. Emissão em Homologação: o operador gera a NF-e de teste em Homologação, valida as tags SEFAZ v4.00, baixa o XML e aciona a transmissão de teste (que valida a presença do Certificado A1).',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `fiscal_simulations` (auditoria imutável), `fiscal_document_artifacts` (XMLs e protocolos), `purchase_invoices` (entradas fiscais), `nfe_records` (saídas), `product_company_fiscal`, `supplier_product_refs`, `stock_movements` e `empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Endpoints backend customizados no Skip Cloud (`/backend/v1/huram/fiscal/*`) e WebServices SEFAZ em homologação/produção.',
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
  // 15. INTELIGÊNCIA ARTIFICIAL E AGENTES JETRO
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
        'Administrar os agentes de IA, fluxos inteligentes, regras de treinamento, governança de modelos e aprovação de ações autônomas na plataforma Jetro.',
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
  // 16. MÓDULO ESTOQUE E WMS (6 TELAS OFICIAIS UNIFICADAS + ABSORÇÃO DE VALIDADE)
  // -------------------------------------------------------------
  ...STOCK_SCREEN_DOCS,

  // -------------------------------------------------------------
  // 17. MÓDULO INDÚSTRIA E PRODUÇÃO (7 TELAS OFICIAIS UNIFICADAS)
  // -------------------------------------------------------------
  ...INDUSTRY_SCREEN_DOCS,

  // -------------------------------------------------------------
  // 18. MÓDULO LOGÍSTICA E TRANSPORTE (7 TELAS OFICIAIS UNIFICADAS)
  // -------------------------------------------------------------
  ...LOGISTICS_SCREEN_DOCS,

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
  // DEPARTAMENTO PESSOAL (DP) — 6 TELAS UNIFICADAS
  // -------------------------------------------------------------
  ...DP_SCREEN_DOCS,

  // -------------------------------------------------------------
  // RECURSOS HUMANOS (RH ESTRATÉGICO) — 7 TELAS UNIFICADAS
  // -------------------------------------------------------------
  ...RH_SCREEN_DOCS,

  // -------------------------------------------------------------
  // SAÚDE E SEGURANÇA DO TRABALHO (SST) — 8 TELAS UNIFICADAS
  // -------------------------------------------------------------
  ...SST_SCREEN_DOCS,

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

  // -------------------------------------------------------------
  // 29. PLANILHAS CONVERTIDAS — COMPARATIVO MARGENS GR
  // -------------------------------------------------------------
  '/admin/planilhas/convertidas/comparativo-margens-gr': {
    route: '/admin/planilhas/convertidas/comparativo-margens-gr',
    title: 'Comparativo de Margens GR — Planilha Interativa',
    moduleGroup: 'Planilhas Convertidas',
    docVersion: '2.0.0',
    lastUpdated: '2026-03-30',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Ambiente de planilha editável tipo Excel/Google Sheets para análise detalhada de margens de venda da linha Gran Romano ao preço Rivoli, com recálculo instantâneo de fórmulas em grade, abas múltiplas (Comparativo e Premissas & Parâmetros), histórico de versões e persistência em banco.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Grade 100% editável com duplo clique ou digitação direta, atalhos de teclado (setas, Tab, Enter, Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V, Ctrl+S).\n- Fórmulas ativas entre células e entre abas (SOMA, MÉDIA, CONT.SE, SE, ARRED e operações aritméticas puras).\n- Barra de fórmulas no topo com identificador de coordenadas da célula.\n- Barra inferior de abas dinâmicas com alternância sem perda de dados.\n- Toolbar compacta: Salvar, Desfazer/Refazer, Formatação Moeda (R$) e Percentual (%), Negrito, Alinhamento, Inserir/Excluir Linhas e Colunas, Exportar e Importar Excel (.xlsx) e Histórico de Versões com restauração.\n- Modo alternável para Visão Analítica (cards executivos de resumo e tabela gerencial).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Comissão (3%) e Frete (3%) são calculados diretamente sobre o Preço Rivoli (preço de venda).\n- Tributos diretos sobre Preço Rivoli somam 9,33% (ICMS 1,20% + PIS 1,45% + COFINS 6,68%).\n- Preço Mínimo com Tributos considera exclusivamente CMV + ICMS + PIS + COFINS.\n- Margem Final R$ = Preço Rivoli − CMV − Deduções Totais (15,33% sobre Rivoli).\n- Margem Final % = Margem R$ ÷ Preço Rivoli.\n- Não embutir dados de linhas no código (compliance de dados sob importação via runtime).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário autorizado acessa a tela de Comparativo de Margens GR.\n2. O sistema carrega os dados persistidos na coleção `margens_comparativo_gr` e o snapshot na coleção `planilhas_workbooks`.\n3. O usuário edita preços ou premissas na planilha; o motor recalcula dependentes e totalizadores em tempo real.\n4. O usuário clica em Salvar ou aciona Ctrl+S para gravar a nova versão no histórico `planilhas_versoes`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `planilhas_workbooks`, `planilhas_versoes`, `margens_comparativo_gr`, `margens_parametros_gr`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Importador nativo de arquivos .xlsx e .csv via navegador com descompressão de stream ZIP.\n- Exportador nativo de .xlsx compatível com Microsoft Excel preservando tags de fórmulas <f> e valores <v>.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewPlanilhasConvertidas(role)` (SUP, PADRAO, FINANCEIRO, COMERCIAL).\n- Edição de células e fórmulas: `canEditPlanilhasConvertidas(role)` (SUP, FINANCEIRO, COMERCIAL).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `JetroSpreadsheet`, `JetroSpreadsheetToolbar`, `JetroSpreadsheetFormulaBar`, `JetroSpreadsheetTabBar`, `JetroSpreadsheetHistoryDialog`.\n- Motor de Fórmulas: `SpreadsheetFormulaEngine`.\n- Serviços: `spreadsheet-storage.ts`, `spreadsheet-file-utils.ts`, `comparativo-workbook-adapter.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento de divisão por zero (#DIV/0!), referências quebradas (#REF!) e valores inválidos (#VALOR!).\n- Detecção de conflitos de concorrência com alerta antes de sobrescrever alterações simultâneas.',
    },
  },

  // -------------------------------------------------------------
  // 30. PLANILHAS CONVERTIDAS — TABELA MÃE GR
  // -------------------------------------------------------------
  '/admin/planilhas/convertidas/tabela-mae-gr': {
    route: '/admin/planilhas/convertidas/tabela-mae-gr',
    title: 'Tabela Mãe GR — Planilha Mestre Interativa',
    moduleGroup: 'Planilhas Convertidas',
    docVersion: '2.1.0',
    lastUpdated: '2026-03-31',
    author: 'Engenharia de Software Jetro',
    objective: {
      title: 'Objetivo',
      content:
        'Disponibilizar uma planilha genérica de edição livre no formato Excel/Google Sheets dentro do ERP Jetro, permitindo ao usuário importar a Tabela Mãe Gran Romano completa (com até dezenas de abas como Consumo salmoura, INSUMOS, MP, CMV, COMPARATIVO, TABELA MÃE, TAB VAREJO/ATACAREJO/ATACADO/DISTRIBUIDOR), editar qualquer célula ou fórmula, criar/remover abas, salvar snapshots versionados no banco e exportar com compatibilidade total.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Importador multi-aba tolerante com seletor de abas, contagem de linhas úteis, detecção de cabeçalhos de 1 a 3 linhas e remoção de colunas repetidas de título estadual.\n- Preservação fiel de blocos de seção verticais (ex: VIDRO, SACHÊ, BALDE) estilizados em destaque na grade.\n- Tratamento seguro de códigos EAN e DUN como texto sem truncamento de zeros ou dígitos.\n- Leitura e gravação de fórmulas ativas com sinalização #VALOR! para funções do Excel não suportadas pela engine web.\n- Modo de gravação flexível: Substituir workbook inteiro (padrão) ou Adicionar/mesclar abas ao snapshot existente.\n- Grade bidirecional interativa com suporte a milhares de células, colunas alfabéticas, atalhos de teclado e proteção de células.\n- Exportação Excel (.xlsx) completa com todas as abas, valores e tags de fórmula preservadas.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A coleção nasce 100% vazia (rigorosamente nenhuma linha de produto hardcoded no sistema).\n- Dados entram exclusivamente via upload do arquivo pelo usuário em runtime.\n- Edições respeitam travas de proteção e RBAC (permissão concedida a SUP, COMERCIAL e FINANCEIRO).\n- Alterações geram registros de autoria, versionamento sequencial e histórico na coleção `planilhas_versoes`.\n- Controle de concorrência otimista com alerta em caso de sobrescrita simultânea.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário acessa Planilhas Convertidas > Tabela Mãe GR.\n2. Caso a base esteja vazia, clica em "Importar Planilha Excel (.xlsx)" no cabeçalho ou na toolbar.\n3. Seleciona o arquivo "TABELA MÃE - AGO 2026.xlsx"; o sistema lista todas as 10 abas com linhas úteis e status de seções.\n4. O usuário ajusta as abas e colunas na prévia interativa e confirma a importação.\n5. O snapshot versionado é salvo em `planilhas_workbooks` e `planilhas_versoes` e renderizado na grade.\n6. O usuário pode editar valores/fórmulas, salvar alterações ou exportar o workbook completo para Excel.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `planilhas_workbooks`, `planilhas_versoes`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Extrator OpenXML/ZIP nativo do navegador via DecompressionStream.\n- Gerador de arquivo SpreadsheetML (.xlsx) puro sem dependências externas.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewPlanilhasTabelaMaeGr(role)` (SUP, PADRAO, FINANCEIRO, COMERCIAL).\n- Edição: `canEditPlanilhasConvertidas(role)` (SUP, FINANCEIRO, COMERCIAL).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `JetroSpreadsheet`, `TabelaMaeGrPage`, `ImportTabelaMaeDialog`.\n- Serviços e utilitários: `spreadsheet-storage.ts`, `spreadsheet-file-utils.ts`, `tabela-mae-structure-parser.ts`, `spreadsheet-formula-engine.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alerta amigável em caso de arquivo corrompido ou formato incompatível.\n- Marcação clara de funções de fórmula não suportadas (#VALOR!) no relatório de importação.\n- Alerta de conflito de concorrência com detecção de versão de servidor.',
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

  // 3. Mapeamento de rotas legadas para telas unificadas (redirecionamentos)
  const LEGACY_ROUTE_MAP: Record<string, string> = {
    // Indústria legadas -> telas unificadas
    '/admin/industria/dashboard': '/admin/industria',
    '/admin/industria/executivo': '/admin/industria',
    '/admin/industria/cockpit': '/admin/industria',
    '/admin/industria/intelligence': '/admin/industria',
    '/admin/industria/kpis': '/admin/industria',
    '/admin/industria/catalogo': '/admin/industria/fichas-tecnicas',
    '/admin/industria/especificacoes': '/admin/industria/fichas-tecnicas',
    '/admin/industria/conversoes': '/admin/industria/fichas-tecnicas',
    '/admin/industria/bom': '/admin/industria/fichas-tecnicas',
    '/admin/industria/engenharia-bom': '/admin/industria/fichas-tecnicas',
    '/admin/industria/formulacoes': '/admin/industria/fichas-tecnicas',
    '/admin/industria/engenharia': '/admin/industria/fichas-tecnicas',
    '/admin/industria/roteiros': '/admin/industria/fichas-tecnicas',
    '/admin/industria/plano-mestre': '/admin/industria/planejamento',
    '/admin/industria/aps': '/admin/industria/planejamento',
    '/admin/industria/capacidade': '/admin/industria/planejamento',
    '/admin/industria/ordens-producao': '/admin/industria/ordem-producao',
    '/admin/industria/execucao': '/admin/industria/ordem-producao',
    '/admin/industria/fases': '/admin/industria/ordem-producao',
    '/admin/industria/rastreabilidade': '/admin/industria/qualidade',
    '/admin/industria/recursos': '/admin/industria/manutencao',
    '/admin/industria/calibracao': '/admin/industria/manutencao',

    // Financeiro legadas -> telas unificadas
    '/admin/financeiro/contas-receber': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/boletos': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/cartoes': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/cheques': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/pix': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/cobrancas': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/cobranca-config': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/cobranca-certificacao': '/admin/financeiro/contas-a-receber-cobranca',
    '/admin/financeiro/contas-pagar': '/admin/financeiro/contas-a-pagar-tesouraria',
    '/admin/financeiro/tesouraria': '/admin/financeiro/contas-a-pagar-tesouraria',
    '/admin/financeiro/caixa': '/admin/financeiro/contas-a-pagar-tesouraria',
    '/admin/financeiro/movimentacoes': '/admin/financeiro/contas-a-pagar-tesouraria',
    '/admin/financeiro/transferencias': '/admin/financeiro/contas-a-pagar-tesouraria',
    '/admin/financeiro/aprovacoes': '/admin/financeiro/contas-a-pagar-tesouraria',
    '/admin/financeiro/conciliacao': '/admin/financeiro/bancos-conciliacao',
    '/admin/financeiro/fluxo-caixa': '/admin/financeiro/planejamento-gestao',
    '/admin/financeiro/fechamento': '/admin/financeiro/planejamento-gestao',
    '/admin/financeiro/relatorios': '/admin/financeiro/planejamento-gestao',
    '/admin/financeiro/dashboard': '/admin/financeiro',

    // DP legadas -> telas unificadas
    '/admin/dp/colaboradores': '/admin/dp/colaboradores-contratos',
    '/admin/dp/contratos': '/admin/dp/colaboradores-contratos',
    '/admin/dp/admissao': '/admin/dp/colaboradores-contratos',
    '/admin/dp/salarios': '/admin/dp/colaboradores-contratos',
    '/admin/dp/historico-salarial': '/admin/dp/colaboradores-contratos',
    '/admin/dp/ponto': '/admin/dp/jornada-ponto',
    '/admin/dp/espelho-ponto': '/admin/dp/jornada-ponto',
    '/admin/dp/banco-horas': '/admin/dp/jornada-ponto',
    '/admin/dp/horas-extras': '/admin/dp/jornada-ponto',
    '/admin/dp/escalas': '/admin/dp/jornada-ponto',
    '/admin/dp/turnos': '/admin/dp/jornada-ponto',
    '/admin/dp/ocorrencias-ponto': '/admin/dp/jornada-ponto',
    '/admin/dp/folha': '/admin/dp/folha-beneficios',
    '/admin/dp/folha-pagamento': '/admin/dp/folha-beneficios',
    '/admin/dp/holerites': '/admin/dp/folha-beneficios',
    '/admin/dp/contracheques': '/admin/dp/folha-beneficios',
    '/admin/dp/adiantamento': '/admin/dp/folha-beneficios',
    '/admin/dp/decimo-terceiro': '/admin/dp/folha-beneficios',
    '/admin/dp/rescisao': '/admin/dp/folha-beneficios',
    '/admin/dp/reintegracao': '/admin/dp/folha-beneficios',
    '/admin/dp/beneficios': '/admin/dp/folha-beneficios',
    '/admin/dp/ferias': '/admin/dp/ferias-afastamentos',
    '/admin/dp/afastamentos': '/admin/dp/ferias-afastamentos',
    '/admin/dp/retorno-trabalho': '/admin/dp/ferias-afastamentos',
    '/admin/dp/esocial': '/admin/dp/obrigacoes-esocial',
    '/admin/dp/esocial-monitor': '/admin/dp/obrigacoes-esocial',
    '/admin/dp/fgts-digital': '/admin/dp/obrigacoes-esocial',
    '/admin/dp/dctfweb': '/admin/dp/obrigacoes-esocial',
    '/admin/dp/dirf': '/admin/dp/obrigacoes-esocial',
    '/admin/dp/impostos': '/admin/dp/obrigacoes-esocial',
    '/admin/dp/encargos': '/admin/dp/obrigacoes-esocial',
    '/admin/dp/cockpit': '/admin/dp',

    // RH legadas -> telas unificadas
    '/admin/rh/colaboradores': '/admin/rh/gestao-talentos',
    '/admin/rh/avaliacao-competencias': '/admin/rh/gestao-talentos',
    '/admin/rh/competencias': '/admin/rh/gestao-talentos',
    '/admin/rh/nine-box': '/admin/rh/gestao-talentos',
    '/admin/rh/talent-review': '/admin/rh/gestao-talentos',
    '/admin/rh/calibracao': '/admin/rh/gestao-talentos',
    '/admin/rh/feedback': '/admin/rh/clima-engajamento',
    '/admin/rh/cargos': '/admin/rh/estrutura-organizacional',
    '/admin/rh/departamentos': '/admin/rh/estrutura-organizacional',
    '/admin/rh/organograma': '/admin/rh/estrutura-organizacional',
    '/admin/rh/posicoes': '/admin/rh/estrutura-organizacional',
    '/admin/rh/carreira': '/admin/rh/carreira-desenvolvimento',
    '/admin/rh/treinamentos': '/admin/rh/carreira-desenvolvimento',
    '/admin/rh/pdi': '/admin/rh/carreira-desenvolvimento',
    '/admin/rh/sucessao': '/admin/rh/carreira-desenvolvimento',
    '/admin/rh/clima': '/admin/rh/clima-engajamento',
    '/admin/rh/engajamento': '/admin/rh/clima-engajamento',
    '/admin/rh/reconhecimento': '/admin/rh/clima-engajamento',
    '/admin/rh/onboarding': '/admin/rh/jornada-colaborador',
    '/admin/rh/offboarding': '/admin/rh/jornada-colaborador',
    '/admin/rh/documentos': '/admin/rh/jornada-colaborador',
    '/admin/rh/cockpit': '/admin/rh',
    '/admin/rh/ponto': '/admin/dp/jornada-ponto',
    '/admin/rh/ferias': '/admin/dp/ferias-afastamentos',
    '/admin/rh/folha': '/admin/dp/folha-beneficios',
    '/admin/rh/beneficios': '/admin/dp/folha-beneficios',
    '/admin/rh/relatorios': '/admin/rh',

    // SST legadas -> telas unificadas
    '/admin/sst/cockpit': '/admin/sst',
    '/admin/sst/riscos': '/admin/sst/gestao-riscos-pgr',
    '/admin/sst/pgr': '/admin/sst/gestao-riscos-pgr',
    '/admin/sst/gro': '/admin/sst/gestao-riscos-pgr',
    '/admin/sst/aso': '/admin/sst/saude-ocupacional',
    '/admin/sst/exames': '/admin/sst/saude-ocupacional',
    '/admin/sst/pcmso': '/admin/sst/saude-ocupacional',
    '/admin/sst/prontuario': '/admin/sst/saude-ocupacional',
    '/admin/sst/acidentes': '/admin/sst/seguranca-prevencao',
    '/admin/sst/cat': '/admin/sst/seguranca-prevencao',
    '/admin/sst/incidentes': '/admin/sst/seguranca-prevencao',
    '/admin/sst/cipa': '/admin/sst/seguranca-prevencao',
    '/admin/sst/inspecoes': '/admin/sst/seguranca-prevencao',
    '/admin/sst/epis': '/admin/sst/epis-treinamentos',
    '/admin/sst/treinamentos': '/admin/sst/epis-treinamentos',
    '/admin/sst/conformidade': '/admin/sst/central-conformidade',
    '/admin/sst/nrs': '/admin/sst/central-conformidade',
    '/admin/sst/nao-conformidades': '/admin/sst/central-conformidade',
    '/admin/sst/laudos': '/admin/sst/documentos-obrigacoes',
    '/admin/sst/ltcat': '/admin/sst/documentos-obrigacoes',
    '/admin/sst/ppp': '/admin/sst/documentos-obrigacoes',
    '/admin/sst/esocial': '/admin/sst/documentos-obrigacoes',
    '/admin/sst/esocial-sst': '/admin/sst/documentos-obrigacoes',
  }

  const mappedRoute = LEGACY_ROUTE_MAP[cleanRoute]
  if (mappedRoute && SCREEN_DOCS_REGISTRY[mappedRoute]) {
    return SCREEN_DOCS_REGISTRY[mappedRoute]
  }

  // 4. Fallback rigoroso sem invenções (respeita a regra do usuário)
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

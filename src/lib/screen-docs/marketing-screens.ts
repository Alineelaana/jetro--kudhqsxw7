import type { ScreenDocEntry } from './types'

export const MARKETING_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  '/admin/marketing': {
    route: '/admin/marketing',
    title: 'Central de Marketing e Verbas — Torre de Controle',
    moduleGroup: 'Marketing e Verbas',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como torre de controle executiva e operacional unificada do módulo Marketing e Verbas, consolidando indicadores em tempo real (jobs ativos, briefings pendentes, ações de trade marketing no PDV, acordos de verba de fornecedores, saldo global de verbas e cotações externas) com isolamento multitenancy por empresa e atalhos rápidos para navegação.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 KPIs clicáveis no topo: Jobs Ativos, Solicitações/Briefings, Ações no PDV, Acordos Vigentes de Verba, Saldo de Verbas Ledger e Cotações Abertas.\n- Abas de cockpit: Visão Consolidada (JetroTable com jobs recentes), Marketing Enterprise Cockpit (ROI, CAC, CPL, canais), Trade Marketing Dashboard (ações por status e top fornecedores) e Verbas Ledger Cockpit.\n- Rastreamento e apropriação oficial de Verbas de Fornecedor conectadas à formação do Custo Médio Ponderado em `product_cost_history` quando classificadas como ajuste de custo de aquisição.\n- Sincronização em tempo real via useRealtime em todas as coleções de marketing, trade e verbas com respeito ao seletor de empresa ativa (useBrand).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Isolamento estrito por empresa ativa selecionada no seletor multitenancy.\n- Indicadores clicáveis redirecionam o operador diretamente para as telas operacionais correspondentes do menu lateral.\n- Centralização de visões sem duplicação de dados.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor ou analista de marketing/trade acessa a Central de Marketing e Verbas.\n2. O painel consulta simultaneamente `mk_jobs`, `mk_requests`, `trade_marketing_actions`, `sa_agreements`, `sa_current_accounts` e `mk_external_quotations`.\n3. Cards de indicadores e abas executivas são renderizados e o usuário pode aprofundar a análise clicando no indicador ou navegando entre abas.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `mk_jobs`, `mk_requests`, `trade_marketing_actions`, `sa_agreements`, `sa_current_accounts`, `mk_external_quotations`, `mk_media_campaigns`, `mk_result_attributions`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Comercial e Precificação para alinhamento de campanhas.\n- Módulo Financeiro para liquidação de contas correntes de fornecedores.\n- Módulo de Estoque/WMS para positivação de produtos no PDV.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para perfis autorizados em `canViewTradeMarketing(role)` ou `canViewSA(role)` (SUP, MARKETING, COMERCIAL, FINANCEIRO, DIRETORIA).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenCentralMarketing`, `MarketingCockpit`, `TmDashboard`, `SaCockpit`, `JetroTable`, hooks `useBrand`, `useRealtime`, `pb`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento defensivo de conexão com fallbacks vazios e feedback visual nos cards de métricas em caso de indisponibilidade de rede.',
    },
  },

  '/admin/marketing/solicitacoes-jobs': {
    route: '/admin/marketing/solicitacoes-jobs',
    title: 'Solicitações e Jobs Criativos',
    moduleGroup: 'Marketing e Verbas',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Unificar o ciclo de vida completo de produção criativa do marketing: abertura e triagem de solicitações/briefings, gestão de jobs em formato Kanban e lista, esteira de aprovação de peças por alçadas, calendário editorial e gestão de campanhas de mídia paga.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Solicitações): Central de requisições de marketing abertas por setores internos com formulário de briefing, priorização e triagem.\n- Aba 2 (Jobs de Criação): Gestão de jobs criativos com responsável, prazos, entregáveis e histórico de revisões.\n- Aba 3 (Aprovação de Peças): Fluxo formal de aprovação de arte/texto por gestor de marketing e conformidade.\n- Aba 4 (Calendário Editorial): Planejamento de postagens, campanhas e pautas de redes sociais.\n- Aba 5 (Campanhas de Mídia): Controle de orçamento, canais de mídia (Google, Meta, mídia exterior), leads gerados e custo por aquisição.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Solicitações aprovadas convertem-se automaticamente em jobs de criação.\n- Peças publicitárias exigem aprovação formal antes da liberação para veiculação pública.\n- Prazos de jobs são monitorados na Central com alerta de atraso.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Um setor requisita criação de material pelo formulário de briefing na aba Solicitações.\n2. A equipe de marketing aceita a demanda, gerando um job na aba Jobs.\n3. O designer desenvolve a peça e submete à esteira na aba Aprovação de Peças.\n4. O gestor valida e a peça é liberada para o calendário editorial ou campanha de mídia.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `mk_requests`, `mk_jobs`, `mk_content_pieces`, `mk_content_versions`, `mk_social_posts`, `mk_media_campaigns`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Biblioteca de templates e acervo de marca para padronização de peças.\n- Auditoria de alterações em materiais promocionais.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização e abertura liberada para colaboradores autenticados; edição e aprovação restrita a marketing e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenSolicitacoesJobs`, `MarketingRequestCenter`, `MarketingJobs`, `MarketingPieceApproval`, `MarketingEditorialCalendar`, `MarketingMediaManager`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de campos obrigatórios no briefing e prevenção de upload de arquivos corrompidos.',
    },
  },

  '/admin/marketing/biblioteca-templates': {
    route: '/admin/marketing/biblioteca-templates',
    title: 'Biblioteca e Templates',
    moduleGroup: 'Marketing e Verbas',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar o acervo digital de ativos de marketing (fotos, vídeos, logotipos, apresentações), manuais de marca (Brand Guidelines) e modelos padronizados de briefing criativo para todas as filiais e unidades de negócio.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Biblioteca): Repositório categorizado de arquivos e materiais publicitários finais prontos para uso.\n- Aba 2 (Brand Assets): Gestão de paleta de cores, tipografia oficial, arquivos de logo em alta resolução e diretrizes de identidade visual.\n- Aba 3 (Templates): Cadastro e edição de modelos estruturados de briefing por tipo de demanda (campanha, evento, PDV, institucional).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Apenas arquivos homologados pelo departamento de marketing podem ser marcados como materiais oficiais na Biblioteca.\n- Alterações em Brand Assets geram registro de auditoria.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Colaborador ou agência busca ativos oficiais de marca na aba Brand Assets ou materiais aprovados na Biblioteca.\n2. Administradores criam novos templates de briefing para agilizar novas solicitações internas.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `mk_brand_assets`, `mk_briefing_templates`, `mk_content_pieces`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Integração direta com o formulário de solicitações e jobs de marketing.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Consulta liberada para usuários corporativos; manutenção restrita ao departamento de marketing e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenBibliotecaTemplates`, `MarketingLibrary`, `MarketingBrand`, `MarketingBriefingTemplates`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de formatos de arquivo e tamanhos permitidos no armazenamento do PocketBase.',
    },
  },

  '/admin/marketing/trade-marketing': {
    route: '/admin/marketing/trade-marketing',
    title: 'Trade Marketing — Ações e PDV',
    moduleGroup: 'Marketing e Verbas',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar integralmente a estratégia de Trade Marketing no ponto de venda: cronograma de ações promocionais, calendário operacional, catálogo e distribuição de materiais de merchandising, prestação de contas com dossiê fotográfico e planejamento anual.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Ações & Calendário): Calendário multi-visão (mês, semana, lista e kanban) com filtro por marca, fornecedor e status de execução.\n- Aba 2 (Materiais PDV): Catálogo de peças de ponto de venda (displays, pontas de gôndola, faixas de gôndola, stoppers, banners) com controle de fornecimento.\n- Aba 3 (Prestação de Contas): Registro de comprovação das ações executadas com upload de fotos, notas fiscais e relatórios de positivação.\n- Aba 4 (Planejamento Anual): Visão macro anual de campanhas sazonais e roadmaps de investimentos por canal.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Ações de trade marketing vinculadas a fornecedores devem consumir contratos cadastrados na gestão de verbas.\n- Toda prestação de contas requer evidências comprobatórias para liberação de liquidação no contas a pagar/receber.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O coordenador de trade cadastra a ação promocional vinculando fornecedor e orçamento previsto.\n2. No período agendado, a equipe de promotores recebe os materiais de PDV.\n3. Após execução, são inseridas as fotos de comprovação na aba Prestação de Contas para auditoria.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `trade_marketing_actions`, `trade_marketing_materials`, `trade_marketing_accountability`, `sa_agreements`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Verbas de Fornecedor para apropriação dos custos.\n- Módulo Comercial para acompanhamento da positivação das marcas.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controlada por `canViewTradeMarketing(role)` (SUP, COMERCIAL, MARKETING, FINANCEIRO).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenTradeMarketing`, `TmCalendar`, `TmMaterials`, `TmAccountability`, `TmNewActionDialog`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alertas de conflito de datas de ações no mesmo PDV e validação de orçamentos excedidos.',
    },
  },

  '/admin/marketing/verbas-fornecedor': {
    route: '/admin/marketing/verbas-fornecedor',
    title: 'Verbas de Fornecedor — Corporate Ledger Engine',
    moduleGroup: 'Marketing e Verbas',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Constituir a ORIGEM ÚNICA OFICIAL da governança de verbas comerciais da indústria fornecedora no ERP HURAM: contratos de verba, conta-corrente individualizada por fornecedor, aplicação em produtos para subsidiar preços e margens, apurações automáticas e liquidação/prestação de contas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Gestão de Acordos): Criação e monitoramento de contratos de verba cooperada (percentual sobre compras, valor fixo, bonificação de safra).\n- Aba 2 (Conta Corrente): Extrato financeiro oficial de débitos e créditos com saldo consolidado por fornecedor.\n- Aba 3 (Aplicação em Produtos): Vinculação de saldo de verba para custeio de descontos em itens reais do cadastro de produtos e integração com o motor de recálculo de custo em `product_cost_history`.\n- Aba 4 (Apurações): Motor de apuração automática cruzando notas fiscais de entrada de compras com as regras pactuadas nos acordos.\n- Aba 5 (Prestação / Liquidação): Fechamento de contas, encontro de contas com duplicatas a pagar ou emissão de nota de débito.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Esta tela é a ORIGEM ÚNICA de verbas do ERP; rotas legadas duplicadas redirecionam para ela.\n- Não é permitida a aplicação de verba superior ao saldo disponível na conta corrente do fornecedor.\n- Qualquer estorno ou reclassificação exige justificativa com trilha de auditoria formal.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O setor de compras/comercial pactua acordo de verba com o fornecedor na aba Acordos.\n2. Conforme notas fiscais de compras dão entrada no Fiscal, o motor de Apurações credita a conta corrente do fornecedor.\n3. O trade ou comercial aplica parte da verba em produtos na aba Aplicação.\n4. No fechamento, a aba Prestação/Liquidação compensa os valores gerando encontro de contas financeiro.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sa_agreements`, `sa_accounts`, `sa_appropriations`, `sa_accruals`, `sa_settlements`, `sa_current_accounts`, `partners`, `products`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Financeiro (Contas a Pagar/Receber) para liquidação financeira.\n- Módulo Fiscal (XMLs de NF-e) para apuração de volumes de compra.\n- Módulo de Precificação e Comercial para aplicação de subsídios.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controlada por `canViewSA(role)` (SUP, FINANCEIRO, COMERCIAL, CONTROLADORIA, DIRETORIA).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenVerbasFornecedor`, `SaAgreements`, `SaAccounts`, `SaAppropriations`, `SaAccruals`, `SaSettlements`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de liquidação de acordos expirados sem aditivo e validação de integridade referencial com o cadastro de parceiros.',
    },
  },

  '/admin/marketing/cotacoes-externas': {
    route: '/admin/marketing/cotacoes-externas',
    title: 'Cotações Externas de Marketing e Trade',
    moduleGroup: 'Marketing e Verbas',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como ORIGEM ÚNICA do fluxo de compras e contratação de serviços terceirizados de marketing e trade: solicitação de cotação externa, concorrência entre fornecedores gráficos e de mídia, mapa comparativo de preços e encaminhamento para contratação.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel com 7 KPIs de cotações (Total, Em Aberto, Aguardando Fornecedores, Aguardando Aprovação, Aprovadas, Vencidas e Economia Total Gerada).\n- Grade de cotações com pesquisa e filtro por status operacional.\n- Formulário de lançamento de cotação com múltiplos itens, fornecedores convidados e prazos de proposta.\n- Mapa comparativo de propostas para seleção da melhor oferta com cálculo automático de economia.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Origem única de cotações de marketing; rotas legadas em Trade e Verbas redirecionam para cá.\n- Cotações com valores acima da alçada do solicitante exigem aprovação formal de compras ou diretoria.\n- Exclusão permitida apenas para administradores SUP.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A equipe de marketing abre cotação definindo itens, especificações técnicas e fornecedores convidados.\n2. Propostas recebidas são inseridas no sistema.\n3. O mapa comparativo destaca a proposta mais vantajosa e encaminha para aprovação e contratação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `mk_external_quotations`, `mk_quotation_proposals`, `partners`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Compras e Financeiro para emissão de ordem de compra e pagamento.\n- Módulo de Verbas quando a contratação for custeada por verba de fornecedor.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controlada por `canViewExternalQuotations(role)` e `canCreateExternalQuotation(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenCotacoesExternas`, `MkExternalQuotationsPanel`, `MkEqForm`, `MkEqDetail`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Sinalização visual em caso de propostas vencidas e tratamento de concorrência com menos de dois fornecedores.',
    },
  },

  '/admin/marketing/relatorios-auditoria': {
    route: '/admin/marketing/relatorios-auditoria',
    title: 'Relatórios e Auditoria de Marketing e Verbas',
    moduleGroup: 'Marketing e Verbas',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Prover governança, auditoria corporativa e conformidade contábil-financeira para todo o módulo de Marketing e Verbas, reunindo o ledger analítico de verbas, histórico de movimentações, despesas de trade marketing, modelos de atribuição de receita e versionamento de relatórios emitidos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Auditoria de Verbas): Visão resumida e analítica completa do Corporate Ledger de Verbas com 8 KPIs consolidados e filtros multicritério.\n- Aba 2 (Movimentações): Extrato cronológico detalhado de débitos e créditos com tipo, direção, centro de custo e justificativa.\n- Aba 3 (Gastos de Trade): Consolidação de todas as despesas incorridas em ações promocionais no PDV.\n- Aba 4 (Atribuição de Receita): Relatórios analíticos de receita comercial atribuída a campanhas e ações de marketing.\n- Aba 5 (Documentos & Versões): Repositório de arquivos comprobatórios anexados e histórico de versões de relatórios emitidos para auditoria.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Acesso à Auditoria de Verbas restrito a SUP, Financeiro, Controladoria e Diretoria.\n- Registros contábeis do ledger são imutáveis; correções são efetuadas mediante novos lançamentos de estorno.\n- Versões de relatórios auditados são mantidas para fins de compliance fiscal e societário.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O auditor ou gestor financeiro acessa a tela e seleciona o período e fornecedor desejados.\n2. O sistema consolida as movimentações do ledger corporativo nas visões Resumida e Analítica.\n3. Os comprovantes e relatórios versionados são consultados para fechamento de balanço.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sa_movements`, `sa_trade_expenses`, `sa_documents`, `sa_report_versions`, `mk_result_attributions`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Controladoria e Contabilidade para fechamento gerencial.\n- Módulo de Auditoria Geral do ERP HURAM.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Restrita a perfis autorizados em `canViewSA(role)` e auditoria (SUP, FINANCEIRO, CONTROLADORIA, DIRETORIA).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `ScreenRelatoriosAuditoriaMarketing`, `SaCorporateAudit`, `SaMovements`, `SaTradeExpenses`, `SaDocuments`, `SaReportVersions`, `MarketingAttribution`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio automático de telas analíticas para usuários sem perfil de auditoria com alerta explicativo.',
    },
  },
}

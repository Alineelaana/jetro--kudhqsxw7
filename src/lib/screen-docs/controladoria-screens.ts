import type { ScreenDocEntry } from './types'

export const CONTROLADORIA_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // 1. DRE e Demonstrações (também doc raiz /admin/controladoria)
  '/admin/controladoria': {
    route: '/admin/controladoria',
    title: 'DRE e Demonstrações',
    moduleGroup: 'Controladoria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia ERP Huram',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Apresentar e consolidar os demonstrativos contábeis e gerenciais da organização: DRE Gerencial por competência, DRE Analítica com abertura detalhada por conta contábil, apuração do EBITDA e estrutura do Balanço Patrimonial.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Visualização da DRE Gerencial oficial e em revisão.\n- Visão da DRE Analítica com decomposição de receitas líquidas, CMV/CPV, despesas operacionais e margens.\n- Apuração de EBITDA/LAJIDA com reconciliação contábil.\n- Balanço Patrimonial estruturado por Ativo Circulante, Não Circulante, Passivo e Patrimônio Líquido.\n- Exportação de dados e atualização sob demanda.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Origem única de movimentações financeiras no módulo Financeiro; a Controladoria consome os saldos e lançamentos sem duplicar cadastros ou registros financeiros.\n- Os cálculos de margem bruta, margem operacional e margem líquida derivam da receita líquida apurada.\n- Períodos já homologados exibem snapshots contábeis protegidos.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Seleção do período contábil/competência e versão da DRE.\n2. Exame dos resultados consolidados e navegação pelas abas DRE Gerencial, DRE Analítica, EBITDA e Balanço Patrimonial.\n3. Cruzamento de indicadores com dados do Financeiro e exportação de relatórios executivos.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `controladoria_dre_records`, `controladoria_closing`, `financial_records`, `chart_of_accounts`.\n- Serviços: `computeDRE`, `getDRE` e `services/controladoria-analytics`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Módulo Financeiro (contas a pagar, receber, conciliações) e Módulo Contábil (plano de contas).',
    },
    permissions: {
      title: 'Permissões e Acesso',
      content:
        'Restrito a perfis com permissão `canViewControladoria(userRole)` (administrador, diretoria e equipe de controladoria).',
    },
    dependencies: {
      title: 'Dependências Técnicas',
      content:
        'Componentes `ControladoriaDRE`, `ControladoriaEbitda`, `ControladoriaBalanco` em `src/components/controladoria/`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        'Exibição de feedback com toast caso ocorra falha de carga analítica e estados vazios caso o período não possua lançamentos conciliados.',
    },
  },

  '/admin/controladoria/dre-demonstracoes': {
    route: '/admin/controladoria/dre-demonstracoes',
    title: 'DRE e Demonstrações',
    moduleGroup: 'Controladoria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia ERP Huram',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Apresentar e consolidar os demonstrativos contábeis e gerenciais da organização: DRE Gerencial por competência, DRE Analítica com abertura detalhada por conta contábil, apuração do EBITDA e estrutura do Balanço Patrimonial.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Visualização da DRE Gerencial oficial e em revisão.\n- Visão da DRE Analítica com decomposição de receitas líquidas, CMV/CPV, despesas operacionais e margens.\n- Apuração de EBITDA/LAJIDA com reconciliação contábil.\n- Balanço Patrimonial estruturado por Ativo Circulante, Não Circulante, Passivo e Patrimônio Líquido.\n- Exportação de dados e atualização sob demanda.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Origem única de movimentações financeiras no módulo Financeiro; a Controladoria consome os saldos e lançamentos sem duplicar cadastros ou registros financeiros.\n- Os cálculos de margem bruta, margem operacional e margem líquida derivam da receita líquida apurada.\n- Períodos já homologados exibem snapshots contábeis protegidos.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Seleção do período contábil/competência e versão da DRE.\n2. Exame dos resultados consolidados e navegação pelas abas DRE Gerencial, DRE Analítica, EBITDA e Balanço Patrimonial.\n3. Cruzamento de indicadores com dados do Financeiro e exportação de relatórios executivos.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `controladoria_dre_records`, `controladoria_closing`, `financial_records`, `chart_of_accounts`.\n- Serviços: `computeDRE`, `getDRE` e `services/controladoria-analytics`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Módulo Financeiro (contas a pagar, receber, conciliações) e Módulo Contábil (plano de contas).',
    },
    permissions: {
      title: 'Permissões e Acesso',
      content:
        'Restrito a perfis com permissão `canViewControladoria(userRole)` (administrador, diretoria e equipe de controladoria).',
    },
    dependencies: {
      title: 'Dependências Técnicas',
      content:
        'Componentes `ControladoriaDRE`, `ControladoriaEbitda`, `ControladoriaBalanco` em `src/components/controladoria/`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        'Exibição de feedback com toast caso ocorra falha de carga analítica e estados vazios caso o período não possua lançamentos conciliados.',
    },
  },

  // 2. Planejamento
  '/admin/controladoria/planejamento': {
    route: '/admin/controladoria/planejamento',
    title: 'Planejamento e Orçamento',
    moduleGroup: 'Controladoria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia ERP Huram',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Centralizar o planejamento econômico-financeiro da corporação através do controle de Orçado × Realizado (Budget), projeções contínuas (Forecast), parametrização de drivers de crescimento e distribuição de metas por Centros de Resultado.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Gestão orçamentária (Budget) com comparativo Orçado × Realizado e análise de desvios percentuais e nominais.\n- Projeções de Forecast contínuo com ajuste dinâmico por trimestre/ano.\n- Modelagem de Drivers empresariais (taxas de crescimento, inflação, indexadores de custos).\n- Mapeamento e gestão de Centros de Resultado operacionais e de apoio.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O valor realizado consome as despesas e receitas liquidadas no Financeiro.\n- Desvios superiores à margem de tolerância geram alertas visuais para a gestão.\n- Versões de budget aprovadas não sofrem sobreposição sem criação de nova revisão orçamentária.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Criação do orçamento anual/mensal por conta e centro de custo.\n2. Acompanhamento periódico dos desvios contra os lançamentos realizados no Financeiro.\n3. Ajuste de premissas na aba Drivers e revisão do Forecast para encerramento de ciclo.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `controladoria_budget`, `controladoria_forecast`, `controladoria_drivers`, `controladoria_configs`.\n- Serviços: `getBudget`, `getForecast`, `getDrivers`, `getControladoriaConfig`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Módulo Financeiro e Plano de Centros de Custo cadastrado em Cadastros.',
    },
    permissions: {
      title: 'Permissões e Acesso',
      content:
        'Permissão `canViewControladoria(userRole)` para consulta e `canManageClosing/canApproveClosing` para edições orçamentárias críticas.',
    },
    dependencies: {
      title: 'Dependências Técnicas',
      content:
        'Componentes `ControladoriaBudget`, `ControladoriaForecast`, `ControladoriaDrivers` e `ControladoriaGenericScreen`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        'Validação de tipos numéricos nos parâmetros orçados e prevenção de divisões por zero nos cálculos de variação percentual.',
    },
  },

  // 3. Fechamento e Consolidação
  '/admin/controladoria/fechamento-consolidacao': {
    route: '/admin/controladoria/fechamento-consolidacao',
    title: 'Fechamento e Consolidação',
    moduleGroup: 'Controladoria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia ERP Huram',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Gerenciar o rito de fechamento mensal da controladoria com geração de snapshots contábeis imutáveis, consolidação de empresas/filiais, reclassificações gerenciais de lançamentos e governança de materialidade de variações.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Abertura, revisão, aprovação e fechamento formal de competências mensais com checklist integrado.\n- Geração de Snapshot imutável da DRE e balanços quando o período é encerrado.\n- Consolidação de resultados multi-empresa e eliminação de intercompany.\n- Cadastro e controle de reclassificações gerenciais com rastreabilidade.\n- Matriz de materialidade para análise de desvios significativos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Período com status "closed" não permite novos lançamentos nem reclassificações sem reabertura formal devidamente justificada no log de auditoria.\n- Reabertura de competência restrita aos papéis de diretoria/supervisão homologados.\n- Snapshots são assinados e mantidos intactos para fins de governança.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Início de fechamento para a competência desejada.\n2. Conclusão dos itens do checklist de conferência contábil e conciliação.\n3. Aplicação de reclassificações gerenciais e análise de materialidade.\n4. Submissão para aprovação e bloqueio formal do período com snapshot gravado.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `controladoria_closing`, `controladoria_snapshots`, `controladoria_configs`, `controladoria_audit`.\n- Serviços: `getClosings`, `createSnapshot`, `logControladoriaAudit`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Auditoria corporativa, banco de dados oficial PocketBase e trilha de eventos do sistema.',
    },
    permissions: {
      title: 'Permissões e Acesso',
      content:
        'Avanço de status e reabertura controlados por `canManageClosing`, `canApproveClosing` e `canReopenPeriod`.',
    },
    dependencies: {
      title: 'Dependências Técnicas',
      content:
        'Componentes `ControladoriaClosing` e `ControladoriaGenericScreen` (consolidação, reclassificações, materialidade).',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        'Exigência de justificativa textual obrigatória em caso de reabertura de período encerrado e proteção contra fechamentos concorrentes.',
    },
  },

  // 4. Simulador de Cenários
  '/admin/controladoria/simulador': {
    route: '/admin/controladoria/simulador',
    title: 'Simulador de Cenários',
    moduleGroup: 'Controladoria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia ERP Huram',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Permitir a modelagem preditiva de hipóteses econômicas (aumento de preços, corte de custos, expansão de volume de vendas e redução de despesas operacionais) calculando projeções de faturamento e margem com base na receita realizada.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Execução de simulações com variação percentual por tipo de hipótese de negócio.\n- Projeção imediata de receita estimada, custo projetado, margem e variação nominal.\n- Histórico completo de cenários simulados com autor, data e parâmetros aplicados.\n- Sinalização permanente de dados simulados para isolamento estrito contra o realizado contábil.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Todas as simulações partem da base real de faturamento atual consumida do motor executivo de BI.\n- Nenhum resultado de simulação altera dados contábeis, financeiros ou de faturamento oficial.\n- Cada cenário gerado grava registro próprio identificado como `SIMULADO`.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Seleção do tipo de hipótese (ex.: aumento de preços ou redução de custos operacionais).\n2. Informação do percentual de ajuste desejado.\n3. Disparo da rotina "Simular" e conferência dos cards comparativos no painel.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleção: `controladoria_simulations`.\n- Base analítica: `getExecutiveAnalytics` (faturamento realizado consolidado).',
    },
    integrations: {
      title: 'Integrações',
      content: 'Motor de BI Executivo e repositório de simulações da Controladoria.',
    },
    permissions: {
      title: 'Permissões e Acesso',
      content:
        'Acesso restrito a usuários com permissão de Controladoria (`canViewControladoria`).',
    },
    dependencies: {
      title: 'Dependências Técnicas',
      content:
        'Componente `ControladoriaSimulator` em `src/components/controladoria/controladoria-simulator.tsx`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        'Tratamento preventivo de inputs vazios ou não numéricos, adotando parâmetros neutros e indicando estado de carregamento durante a execução.',
    },
  },

  // 5. Configurações e Visões
  '/admin/controladoria/configuracoes': {
    route: '/admin/controladoria/configuracoes',
    title: 'Configurações e Visões',
    moduleGroup: 'Controladoria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia ERP Huram',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Centralizar a parametrização de diretrizes da controladoria, gerenciar visões executivas personalizadas (filtros salvos de DRE e relatórios) e manter o repositório de comentários e pareceres da controladoria vinculados a contas contábeis.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Edição e manutenção de parâmetros gerais da controladoria (metas padrão, regras de tolerância).\n- Armazenamento e reuso de visões analíticas gerenciais customizadas.\n- Registro de comentários analíticos e notas de rodapé vinculadas a contas contábeis e competências.\n- Atualização e recarga de tabelas em tempo real.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Comentários registrados por analistas possuem autoria identificada e timestamp permanente.\n- Visões salvas podem ser compartilhadas ou restritas ao operador que as configurou.\n- Apenas perfis autorizados de controladoria podem alterar parâmetros estruturais.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Ajuste de parâmetros globais na aba Configurações.\n2. Criação ou recuperação de filtros salvos na aba Visões Gerenciais.\n3. Registro e consulta de pareceres técnicos na aba Comentários da Controladoria.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `controladoria_configs`, `controladoria_saved_views`, `controladoria_comments`.\n- Serviços: `getControladoriaConfig`, `getSavedViews`, `getComments`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Módulo de auditoria e vinculação com plano contábil para associação de comentários às contas.',
    },
    permissions: {
      title: 'Permissões e Acesso',
      content:
        'Permissão `canViewControladoria(userRole)` para consulta e perfil administrativo para parametrização geral.',
    },
    dependencies: {
      title: 'Dependências Técnicas',
      content:
        'Componentes `ControladoriaGenericScreen`, `ControladoriaSavedViews` e `ControladoriaComments`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        'Validação de payload JSON de configurações e feedback visual em operações de salvamento de visões e comentários.',
    },
  },
}

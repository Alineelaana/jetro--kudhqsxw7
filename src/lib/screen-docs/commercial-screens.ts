import type { ScreenDocEntry } from './types'

export const COMMERCIAL_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  '/admin/comercial': {
    route: '/admin/comercial',
    title: 'Central Comercial — Torre de Controle',
    moduleGroup: 'Comercial',
    docVersion: '1.1.0',
    lastUpdated: '2026-04-19',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as tabelas de preço por canal/região/empresa e as políticas de alçada de descontos comerciais autorizados, utilizando o Custo Médio Ponderado Real oficial para apuração de margens líquidas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Tabelas de Preço): Gestão de tabelas de preço com margens, vigências e reajustes em lote. Leitura estrita dos custos oficiais da coleção `products` (sem edição manual de custos).\n- Aba 2 (Políticas de Desconto): Parametrização de faixas de desconto permitidas por perfil de operador e alçadas de aprovação gerencial.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Pedidos de venda utilizam a tabela associada ao cliente ou canal, validando o período de vigência ativo.\n- Tabelas de preço respeitam a empresa ativa e data de vigência.\n- Integridade de Custos: custos médios e de reposição são somente leitura para os operadores comerciais, garantidos pelo backend via HTTP 403.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor ou operador comercial acessa a Central Comercial.\n2. O painel consulta as coleções `sales_orders`, `crm_opportunities`, `sales_contracts` e `commercial_commissions` com o filtro da empresa ativa.\n3. Cards de indicadores são renderizados e o usuário pode aprofundar a análise clicando no indicador.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `partners`, `crm_opportunities`, `sales_contracts`, `sales_returns`, `variable_remuneration_records`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Fiscal para faturamento/NF-e.\n- Módulo de Estoque/WMS para reserva de itens.\n- Financeiro para títulos de contas a receber.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para perfis autorizados em `canViewSales(role)` (SUP, COMERCIAL, VENDEDOR, SDR, DIRETORIA).',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componente `ScreenCentralComercial`, hooks `useBrand`, `useRealtime`, `pb`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento defensivo de conexão com feedback visual nos cards de métricas em caso de latência de rede.',
    },
  },

  '/admin/comercial/clientes': {
    route: '/admin/comercial/clientes',
    title: 'Cadastro Oficial de Clientes',
    moduleGroup: 'Comercial',
    docVersion: '2.0.0',
    lastUpdated: '2026-11-28',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar o ciclo completo do cliente no ERP HURAM: fila de solicitações de pré-cadastro (enviadas por representantes/vendedores), conclusão do Cadastro Oficial em formulário completo de 9 seções e carteira de Clientes Oficiais ativos, com geração automática do código oficial numérico do cliente.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Fila de Pré-Cadastros": listagem das solicitações (número da solicitação, data, cliente/fantasia, CPF/CNPJ, RCA, situação) com indicadores por status (aguardando validação, em análise, em correção, concluídos) e ações de atender/visualizar.\n- Aba "Clientes Oficiais": listagem dos parceiros com flag cliente ativa, exibindo código oficial numérico (ex.: 0001, 0002...), razão social, CNPJ, perfil comercial, situação de crédito e bloqueios, com ações de visualizar/gerenciar.\n- Formulário de Cadastro Oficial em 9 seções: 1. Identificação (tipo de pessoa, CPF/CNPJ com consulta automática, razão social, nome fantasia, IE, CNAE, situação cadastral), 2. Perfil Comercial, 3. Equipe de Vendas (RCA 1/2, gerente, televendas, B2B), 4. Endereço e Logística, 5. Condições Comerciais (tabela de preço, desconto máximo, pedido mínimo, limite pretendido), 6. Fiscais (regime tributário, ICMS, consumidor final), 7. Contatos, 8. Documentos & Anexos, 9. Observações & Histórico.\n- Conclusão da solicitação vinculada: ao efetivar o cadastro oficial, a solicitação de origem é marcada como concluída e o cliente entra na carteira oficial.\n- Análise de crédito: opção de encaminhar automaticamente ao Financeiro para análise, com situação de crédito e bloqueio de vendas a prazo controlados na carteira.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Código oficial do cliente é gerado automaticamente pelo backend (hook `client_workflow_hooks.js`) como número SOMENTE NUMÉRICO sequencial de 4 dígitos (ex.: 0001, 0002...), sem prefixo e sem ano, para todos os tipos de parceiro, via contador atômico na coleção `numerations`.\n- Códigos de clientes gravados em formato anterior continuam exibidos como estão; apenas novos cadastros recebem o formato numérico.\n- CPF/CNPJ é validado com dígito verificador e checado contra duplicidade cadastral antes da gravação.\n- Quando "Exige crédito financeiro" está marcado, o cliente é encaminhado ao Financeiro para análise; caso contrário, é liberado para transações sem análise prévia.\n- Clientes com bloqueio de vendas a prazo ou crédito pendente recebem destaque visual na carteira.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O representante/vendedor envia a solicitação de pré-cadastro, que entra na Fila da tela com número próprio.\n2. O comercial abre a solicitação, revisa os dados e inicia o Cadastro Oficial (formulário de 9 seções), com consulta automática de CNPJ preenchendo identificação e endereço.\n3. Ao salvar, o backend gera o código oficial numérico (ex.: 0001), conclui a solicitação vinculada e, se exigido, encaminha ao Financeiro para análise de crédito.\n4. O cliente passa a constar na aba "Clientes Oficiais", pronto para uso em pedidos, tabelas de preço e cobrança.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `partners` (clientes oficiais, flag cliente), `client_onboarding_solicitations` (fila de pré-cadastro), `numerations` (contador do código oficial), `logistics_routes`, `price_tables`.\n- Endpoint: `concluirCadastroOficial` via hook `client_workflow_hooks.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Consulta Pública de CNPJ (BrasilAPI/ReceitaWS) no preenchimento automático.\n- Módulo Financeiro para análise de crédito e bloqueio.\n- Pedido de Venda (wizard) consome o cliente e a tabela de preço vinculados.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Controlada por `canViewSales(role)` (SUP, COMERCIAL, Vendedor, DIRETORIA).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes `CadastroClientesOficialScreen`, `JetroTable`, `useBrand`, `pb`.\n- Hook backend `pocketbase/hooks/client_workflow_hooks.js` (geração do código oficial).',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de CNPJ/CPF com dígito verificador e aviso de divergência cadastral.\n- Falha ao efetivar cadastro (CNPJ/CPF duplicado ou erro de rede) exibe mensagem explicativa em toast e mantém o formulário preenchido.',
    },
  },

  '/admin/comercial/pedidos-faturamento': {
    route: '/admin/comercial/pedidos-faturamento',
    title: 'Pedidos e Faturamento',
    moduleGroup: 'Comercial',
    docVersion: '1.1.0',
    lastUpdated: '2026-11-05',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Painel comercial consolidado para orçamentos, campanhas promocionais e visão geral do pipeline de pedidos. O ciclo operacional direto é realizado nas telas dedicadas: Pedido de Venda (/admin/vendas/pedidos) e Central de Faturamento (/admin/vendas/faturamento).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Pedidos de Venda): Acompanhamento e atalhos para a esteira oficial de pedidos.\n- Aba 2 (Orçamentos): Criação de propostas comerciais e orçamentos com conversão direta em pedido.\n- Aba 3 (Faturamento): Visão e direcionamento para a Central de Faturamento oficial.\n- Aba 4 (Promoções): Configuração de campanhas comerciais, descontos por volume e brindes.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A esteira de ciclo de vida (Confirmar, Separar, Liberar Faturamento, Cancelar) é operada oficialmente pela tela /admin/vendas/pedidos e a emissão de NF-e pela Central /admin/vendas/faturamento.\n- A tela Consulta de Pedidos (/admin/vendas/consulta-pedidos) permanece independente conforme regra do projeto.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O orçamento é elaborado e enviado para aprovação do cliente.\n2. Ao ser aprovado, converte-se em pedido de venda.\n3. O pedido é encaminhado para a esteira em Pedidos de Venda e posteriormente faturado na Central de Faturamento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `sales_orders`, `sales_order_items`, `budget_requests`, `promotions`, `products`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Serviço `sales-invoicing-flow.ts`, módulo fiscal (NF-e Focus NFe), estoque e financeiro.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Perfil `canViewSales(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenPedidosFaturamento`, `JetroTable`, modais de pedido.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio preventivo de pedidos com limite de crédito estourado ou produtos inativos.',
    },
  },

  '/admin/comercial/contratos-devolucoes': {
    route: '/admin/comercial/contratos-devolucoes',
    title: 'Contratos e Devoluções',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar a administração de contratos de fornecimento contínuo, comodatos e o fluxo de devoluções e trocas de mercadorias com conferência fiscal e física.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Contratos de Venda): Gestão de contratos vigentes, termos de fornecimento, reajustes e vencimentos.\n- Aba 2 (Devoluções e Trocas): Abertura e acompanhamento de solicitações de devolução, motivo de retorno e autorização de entrada no estoque.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Toda devolução gera entrada no estoque após conferência física e cancelamento/estorno fiscal proporcional.\n- Contratos próximos do vencimento emitem alerta automático na Central Comercial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Operador registra o contrato ou registra a solicitação de devolução vinculada a uma NF-e de venda.\n2. O setor de qualidade e estoque autoriza a devolução gerando nota de entrada fiscal.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `sales_contracts`, `sales_returns`, `sales_orders`, `partners`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Estoque (entrada de mercadoria devolvida) e Fiscal (emissão de NF-e de devolução).',
    },
    permissions: {
      title: 'Permissões',
      content: '- Controlada por `canViewSales(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenContratosDevolucoes`, `JetroTable`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Impede devolução com quantidade superior ao item constante no pedido original faturado.',
    },
  },

  '/admin/comercial/crm': {
    route: '/admin/comercial/crm',
    title: 'CRM — Gestão de Relacionamento e Pipeline',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Consolidar a gestão de oportunidades, funil de vendas, cadastro de leads, agenda de atividades de prospecção e relatórios de conversão em uma tela estruturada em abas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Funil de Vendas): Visualização Kanban por etapas (Prospecção, Qualificação, Proposta, Negociação, Fechamento).\n- Aba 2 (Leads e Oportunidades): Tabela detalhada de leads com pontuação, origem e responsável.\n- Aba 3 (Agenda e Atividades): Cronograma de reuniões, ligações, visitas técnicas e follow-ups.\n- Aba 4 (Configurações): Parametrização de etapas do funil, motivos de perda e metas por vendedor.\n- Aba 5 (Relatórios CRM): Métricas de taxa de conversão, tempo médio de fechamento e perdas por motivo.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Ao marcar oportunidade como "Ganha", o sistema oferece geração imediata de orçamento ou pedido de venda.\n- Oportunidades perdidas exigem preenchimento do motivo de perda.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Lead captado é cadastrado na aba Leads.\n2. Vendedor move o card nas etapas do funil à medida que o contato evolui.\n3. Atividades de follow-up são agendadas e integradas ao calendário corporativo.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `crm_opportunities`, `crm_leads`, `crm_activities`, `crm_funnel_stages`, `crm_proposals`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Integração direta com Pedidos de Venda e Agenda Corporativa Jetro.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado por `canViewSales(role)` com visualização filtrada por vendedor quando aplicável.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenCRM`, `JetroTable`, modais de leads/oportunidades.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Validação de datas de fechamento e notificação de atividades em atraso.',
    },
  },

  '/admin/comercial/tabelas-preco-descontos': {
    route: '/admin/comercial/tabelas-preco-descontos',
    title: 'Tabelas de Preço e Políticas de Desconto',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as tabelas de preço por canal/região/empresa e as políticas de alçada de descontos comerciais autorizados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Tabelas de Preço): Gestão de tabelas de preço com margens, vigências e reajustes em lote.\n- Aba 2 (Políticas de Desconto): Parametrização de faixas de desconto permitidas por perfil de operador e alçadas de aprovação gerencial.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Pedidos de venda com desconto acima da alçada do vendedor são retidos para aprovação do supervisor.\n- Tabelas de preço respeitam a empresa ativa e data de vigência.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Gestor comercial cadastra ou clona tabela de preço para nova safra/período.\n2. Define alçadas de desconto por equipe ou cargo.\n3. O motor de cálculo de pedidos consome essas tabelas como fonte única de verdade.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `price_tables`, `price_table_items`, `discount_policies`, `products`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Alimentação direta do cálculo de itens em Pedidos de Venda e Cotações.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewSales(role)`; Manutenção restrita a gestores comerciais e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenTabelasPrecoDescontos`, `JetroTable`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Bloqueio de gravação com vigências sobrepostas para o mesmo cliente ou região.',
    },
  },

  '/admin/comercial/comissoes': {
    route: '/admin/comercial/comissoes',
    title: 'Comissões Comerciais — Regras, Premiações e Mix',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as regras de comissionamento de vendas, premiações especiais e bonificação por mix de produtos. NOTA: A tela Comissão Analítica permanece como tela própria analítica separada e intacta.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Regras de Comissão): Percentuais de comissão por produto, grupo de produto, representante e canal.\n- Aba 2 (Premiações e Campanhas): Campanhas de aceleração com bonificações temporárias e metas de premiação.\n- Aba 3 (Mix de Produtos): Bonificações vinculadas à amplitude de famílias de produtos comercializados.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- As regras cadastradas alimentam o cálculo automático das comissões no fechamento.\n- A tela Comissão Analítica (/admin/vendas/comissao-analitica) permanece independente, mantendo 100% de seu código e regras intactos.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Administrador parametriza as regras de comissão.\n2. O motor aplica as taxas sobre os pedidos faturados.\n3. O operador analisa os lançamentos na Comissão Analítica ou nesta tela.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `commission_rules`, `commission_campaigns`, `representantes`, `products`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Contas a Pagar (Financeiro) para liquidação das comissões apuradas.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Gestão restrita a gestores comerciais, financeiro e SUP via `canViewSales(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenComissoes`, `JetroTable`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento de regras conflitantes priorizando a regra mais específica (item > grupo > geral).',
    },
  },

  '/admin/comercial/remuneracao-variavel': {
    route: '/admin/comercial/remuneracao-variavel',
    title: 'Remuneração Variável — Apuração, Campanhas e Metas',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Unificar as ~14 telas pulverizadas de remuneração variável em 3 abas consolidadas: Apuração e Simulador, Regras e Campanhas, e Metas (absorvendo todas as metas comerciais do ERP).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Apuração e Simulador): Apuração mensal de RV, simulação de cenários de faturamento e extrato por colaborador/equipe.\n- Aba 2 (Regras e Campanhas): Cadastro de aceleradores, regras de gating (mínimo de atingimento) e campanhas sazonais.\n- Aba 3 (Metas): Gestão consolidada de metas comerciais (por vendedor, equipe, filial, linha de produto e período).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Apurações fechadas geram lote no contas a pagar mediante aprovação de diretoria.\n- Metas são comparadas em tempo real com pedidos faturados da empresa ativa.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Metas são estabelecidas no início do período na aba Metas.\n2. Vendas ocorrem e alimentam o progresso em tempo real.\n3. No fim do ciclo, a equipe executa a apuração na aba 1 e despacha para pagamento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `variable_remuneration_records`, `sales_goals`, `commercial_teams`, `users`, `sales_orders`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Módulo Financeiro e Folha/RH para pagamento de bônus e premiações.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Gestão comercial, RH e diretoria (`canViewSales(role)` / SUP).',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenRemuneracaoVariavel`, `JetroTable`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Bloqueio de duplicidade de metas para o mesmo vendedor no mesmo mês/ano.',
    },
  },

  '/admin/comercial/cotacoes-cotador': {
    route: '/admin/comercial/cotacoes-cotador',
    title: 'Cotações e Cotador Comercial',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Consolidar em origem única as ferramentas de cotações externas e simulador de preços (cotador), resolvendo a duplicidade histórica existente entre os menus Comercial e Trade.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Cotações Externas): Registro e monitoramento de cotações de concorrência e preços de mercado.\n- Aba 2 (Cotador Comercial): Simulador ágil de formação de preço de venda considerando custos, impostos, margem e comissão.\n- Aba 3 (Histórico e Tendências): Análise comparativa entre preço cotado x preço faturado.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Origem única dos dados de cotação: sem duplicação de lançamentos entre módulos.\n- Simulador utiliza as regras fiscais vigentes da empresa selecionada.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Pesquisas de mercado são registradas na aba Cotações Externas.\n2. Vendedor utiliza o Cotador para simular preço mínimo viável para negociações especiais.\n3. Dados consolidados alimentam a inteligência de precificação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `external_quotations`, `products`, `price_tables`, `product_company_fiscal`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Simulador Fiscal Huram para cálculo de impostos por UF de destino.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Controlada por `canViewSales(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenCotacoesCotador`, `JetroTable`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Rejeição de margens líquidas negativas sem liberação explícita de supervisor.',
    },
  },

  '/admin/comercial/relatorios': {
    route: '/admin/comercial/relatorios',
    title: 'Relatórios Comerciais Consolidados',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Apresentar relatórios gerenciais e analíticos consolidados de vendas, clientes, carteira e CRM com exportação em Excel e PDF.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Relatórios de Vendas): Faturamento por período, produto, vendedor, região e canal de venda.\n- Aba 2 (Relatórios de Clientes): Clientes inativos, curva ABC de compradores e concentração de faturamento.\n- Aba 3 (Relatórios de CRM): Funil acumulado, motivos de perda e tempo de ciclo de vendas.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Filtros de período e empresa ativa sincronizados com as coleções analíticas.\n- Suporte a exportação de dados com preservação de formatação numérica e monetária.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Usuário seleciona o tipo de relatório na aba correspondente.\n2. Aplica filtros de data, equipe ou produto.\n3. Visualiza os gráficos e tabela consolidada com opção de exportar XLSX/PDF.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções: `sales_orders`, `sales_order_items`, `partners`, `crm_opportunities`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Central de Agendamento de Relatórios e exportadores SheetJS / impressão Jetro.',
    },
    permissions: {
      title: 'Permissões',
      content: '- `canViewSales(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenRelatoriosComerciais`, `JetroTable`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Avisos de consulta ampla com limite seguro de linhas para prevenir sobrecarga de memória.',
    },
  },

  '/admin/tabelas-precos': {
    route: '/admin/tabelas-precos',
    title: 'Tabela de Preços',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-11-17',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Cadastrar e gerenciar as tabelas de preços do ERP HURAM com produtos/serviços, condições de pagamento atreladas à tabela e regras de aplicação, alimentando o Pedido de Venda e a Precificação.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem de tabelas com busca, filtros por tipo e status, e ações conforme permissão (visualizar, editar, duplicar, ativar/inativar, cancelar).\n- Formulário em diálogo com 3 abas: "Dados Gerais" (nome, código, tipo, empresa/filial, moeda, prioridade, vigências, prazo médio em dias e status), "Produtos e Serviços" (produtos e serviços reais do sistema em seções separadas, com preço novo, preço mínimo e visualização de custo conforme permissão; inclui "Selecionar todos" em cada seção, busca por nome/código e busca por fornecedor via main_supplier) e "Regras de Aplicação" (condições de pagamento atreladas à tabela, multi-seleção com busca, e seletores de regras para Empresas, Filiais, Clientes, Grupos de Clientes, Regiões, Cidades, Estados, Canais de Venda, Vendedores, Representantes, Contratos, Campanhas, Formas e Condições de Pagamento).\n- Duplicação de tabela com novo nome e vigências.\n- Atualização em tempo real da listagem via realtime.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Condições de pagamento atreladas à tabela: o operador escolhe as condições (catálogo de condições de pagamento cadastrado) que a tabela aceita.\n- Prazo médio: o prazo da tabela é informado explicitamente (campo de prazo médio em dias) ou deduzido do nome/observações (ex.: "Tabela 7 dias" → 7). O prazo médio das condições selecionadas é calculado pela média dos dias das parcelas de cada condição.\n- Validação de divergência de prazo: se o prazo médio das condições divergir do prazo da tabela em mais de ±2 dias, o salvamento é bloqueado, exibindo box âmbar com os valores comparados e o checkbox "Manter mesmo assim (o usuário decide)". O salvamento só prossegue com o checkbox marcado; o prazo persiste em rules.prazo_medio_dias.\n- Preço abaixo do mínimo em tabela "ativa" envia a tabela para "aguardando_aprovacao".\n- Regras de aplicação definem a quem a tabela se aplica (empresas, filiais, clientes, grupos, regiões, cidades, estados, canais, vendedores, representantes, contratos e campanhas), alimentadas por cadastros reais.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor comercial acessa /admin/tabelas-precos e clica em "Nova Tabela" (ou edita/duplica uma existente).\n2. Na aba Dados Gerais preenche identificação, vigências e status.\n3. Na aba Produtos e Serviços inclui itens com preços (com seleção em massa e busca por fornecedor).\n4. Na aba Regras de Aplicação escolhe as condições de pagamento e os seletores de escopo; o sistema compara o prazo médio das condições com o prazo da tabela (tolerância ±2 dias).\n5. Em caso de divergência, o box âmbar aparece e o salvamento só segue com o checkbox "Manter mesmo assim" marcado.\n6. Ao salvar, a tabela fica disponível para o Pedido de Venda, que consome suas condições de pagamento e preços.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `price_tables` (itens em `items` e regras em `rules`, JSON), cadastros de condição de pagamento, `products`, `services`, `suppliers`, além das coleções dos seletores (empresas, filiais, partners, representantes, vendedores etc.).\n- Serviços: `src/services/price-tables.ts` e `src/services/cadastros.ts`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Pedido de Venda (consumo de preços e condições dinâmicas).\n- Precificação (módulo de pricing) para simulações e versionamento.\n- Realtime PocketBase para atualização da listagem.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewSales(role)`; criação/edição/duplicação/ativação/cancelamento conforme `src/lib/price-table-permissions.ts`; custos visíveis apenas com `canViewPriceTableCosts`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `PricingTables`, `PriceTableFormDialog`, `PriceTableGeneralTab`, `PriceTableItemsTab`, `PriceTableRulesTab`, `JetroTable`.\n- Utilitários: `price-table-types`, `pricing/condicoes-prazo`, `pricing/rule-options`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Nome da tabela obrigatório para salvar.\n- Bloqueio de salvamento com box âmbar quando o prazo médio das condições diverge do prazo da tabela (tolerância ±2 dias), liberado apenas pelo checkbox "Manter mesmo assim".\n- Tabela com preço abaixo do mínimo muda de "ativa" para "aguardando_aprovacao" com toast explicativo.\n- Toasts de erro para falhas de criação/edição/duplicação com mensagens traduzidas do backend.',
    },
  },

  '/admin/comercial/saldo-flex': {
    route: '/admin/comercial/saldo-flex',
    title: 'Saldo FLEX',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-11-28',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Painel e extrato do saldo comercial FLEX do representante (RCA): crédito gerado em venda acima do preço-base autorizado, usado como desconto em item de outro pedido (inclusive de outro cliente elegível). O saldo oficial é centralizado no Huram e consultado pelo Avatar FV via /backend/v1/flex/*.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel com visão consolidada e visão por RCA, com 7 indicadores por conta: saldo inicial do período, FLEX gerado e liberado no período, FLEX gasto, reservas em pedidos não faturados, estornos/ajustes e saldo disponível na data de referência.\n- Agrupamento por gerente ou equipe, com abertura do extrato de cada representante.\n- Extrato de movimentos com filtros: período, empresa, filial, RCA, gerente, equipe, cliente (pesquisa onde o crédito foi gerado E onde o desconto foi usado), produto, nº do pedido, NF, tipo de movimento e status da integração.\n- Colunas do extrato: data/hora, tipo, empresa, filial, RCA, gerente, equipe, cliente, produto, quantidade, preço-base, preço negociado, valor FLEX, pedido FV, pedido Huram, NF, situação da integração, saldo antes/depois, motivo e vínculo crédito→uso.\n- Botão "Gerar relatório" (ao lado de "Filtros") considerando TODOS os registros dos filtros (inclusive outras páginas), com dois modelos: (a) resumo gerencial por RCA e (b) extrato detalhado; exportação em PDF (janela de impressão), Excel (xlsx) e CSV.\n- Ajuste manual de saldo, restrito a perfis autorizados (nunca RCA), com motivo obrigatório e registro de valor, responsável e saldo antes/depois.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- "Conta do representante": o saldo pertence ao RCA, não ao cliente — o mesmo saldo é usável em clientes diferentes elegíveis.\n- Indicadores separados para previsto (reserva) × reservado × efetivado (FLEX gasto): o mesmo desconto nunca é contado duas vezes — a reserva é convertida em débito apenas no faturamento.\n- Idempotência por external_id: reenvios do Avatar FV não duplicam créditos/débitos (índice único em flex_movements.external_id).\n- Atomicidade: reserva de saldo executa em transação — dois pedidos simultâneos não gastam o mesmo saldo.\n- Faturamento parcial: converte reserva → débito proporcional ao faturado e libera o restante da reserva.\n- Rejeição/cancelamento/devolução: estorno vinculado ao movimento original, com motivo, preservando os movimentos originais no extrato.\n- Pedido com liberação comercial pendente (tela Liberações comerciais, Rotinas): a reserva é recusada (409 pending_commercial_release) antes de autorizar.\n- Ajuste manual exige motivo e grava saldo antes/depois; RCA não ajusta conta.\n- Tela nasce vazia: sem dados de exemplo.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Venda acima do preço-base no Avatar FV gera crédito: FV chama /backend/v1/flex/credit (tipo "gerado").\n2. Quando a liberação comercial autoriza, chama-se o mesmo endpoint com tipo "liberado".\n3. No uso do FLEX como desconto em item de pedido, o FV chama /backend/v1/flex/reserve, que valida saldo disponível e cria a reserva.\n4. No faturamento, /backend/v1/flex/convert converte reserva em débito proporcional ao faturado e libera o restante.\n5. Em rejeição/cancelamento/devolução, /backend/v1/flex/release estorna vinculado ao movimento original.\n6. O painel e o extrato desta tela refletem os movimentos em tempo quase real; o saldo nunca é recalculado no front-end.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `flex_accounts` (saldo por empresa+filial+RCA) e `flex_movements` (ledger, migração 0370).\n- Cadastros reutilizados: empresas, filiais, RCA/gerente/equipe (representantes), clientes (partners), produtos, pedidos e NF.\n- Endpoints: /backend/v1/flex/balance, /reserve, /convert, /release, /credit, /adjust, /report-issue (pocketbase/hooks/flex_api.js).',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Avatar FV: consulta de saldo, reserva por item na confirmação do pedido, conversão no faturamento e estorno em rejeição/cancelamento/devolução. Se o Huram estiver indisponível, o FV salva o pedido como rascunho com FLEX pendente e reenvia depois (o external_id evita duplicação).\n- Tela Liberações comerciais (Rotinas): pendência de liberação bloqueia a reserva antes da autorização.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso pela permissão comercial (menu Comercial).\n- RCA consulta apenas a própria conta (endpoints recusam rca_id diferente do usuário autenticado).\n- Gerente/supervisor consulta as contas de sua equipe; gestão consulta e exporta dentro da empresa/filial sob responsabilidade.\n- Ajuste manual restrito a perfis autorizados — RCA nunca ajusta (403).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SaldoFlexScreen` (src/components/commercial/saldo-flex-screen.tsx).\n- Serviços: `src/services/flex.ts` e `src/services/flex-report.ts`.\n- Migração: `0370_flex_balance.js`; hooks: `pocketbase/hooks/flex_api.js`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Saldo insuficiente: recusa 409 com saldo disponível e valor solicitado.\n- Pendência de liberação comercial: 409 pending_commercial_release com o id da solicitação.\n- Falhas de integração marcadas no movimento (integration_status=falha) via /flex/report-issue, com reprocessamento/conciliação pelo extrato; só concluída com confirmação do outro sistema.',
    },
  },
}

import type { ScreenDocEntry } from './types'

export const COMMERCIAL_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  '/admin/comercial': {
    route: '/admin/comercial',
    title: 'Central Comercial — Torre de Controle',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como torre de controle executiva e operacional do módulo Comercial, consolidando indicadores em tempo real (pedidos abertos, faturamento do mês, pipeline CRM, contratos ativos, devoluções e comissões) com isolamento multitenancy por empresa e atalhos rápidos para navegação.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- KPIs executivos em tempo real: Pedidos Abertos, Faturamento Consolidado, Pipeline Ativo CRM, Contratos Vigentes, Devoluções/Trocas e Comissões a Apurar.\n- Tabela de últimos pedidos e movimentações comerciais com JetroTable.\n- Ações rápidas para emissão de orçamentos, abertura de oportunidades e consulta de clientes.\n- Sincronização em tempo real via PocketBase Realtime e filtro por empresa ativa (useBrand).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Isolamento estrito por empresa ativa selecionada no seletor multitenancy.\n- Indicadores clicáveis redirecionam o operador diretamente para as telas operacionais correspondentes.\n- Alertas automáticos para pedidos retidos por crédito ou sem estoque.',
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
    title: 'Clientes e Grupos Comerciais',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Unificar a gestão cadastral, segmentação em grupos comerciais e análise de perfil/comportamento de compra dos clientes do ERP HURAM.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Cadastro e Carteira): Listagem geral de clientes com filtros por status, limite de crédito e representante vinculado.\n- Aba 2 (Grupos e Canais): Segmentação por grupos de clientes, canais de venda e redes comerciais.\n- Aba 3 (Análise de Clientes): Indicadores de ticket médio, positivação, recência e curva ABC de clientes.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Clientes com pendência cadastral ou bloqueio financeiro recebem destaque visual.\n- A alteração de limite de crédito exige justificativa registrada em auditoria.\n- Representantes (RCA) visualizam somente os clientes de sua carteira atribuída.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador navega entre as abas para consultar ou atualizar dados cadastrais.\n2. É possível cadastrar novos grupos para aplicação de tabelas de preço diferenciadas.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `partners` (com filtro tipo cliente), `customer_cnae_groups`, `order_sales_channels`, `sales_orders`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Central de Cadastros e Consulta Pública de CNPJ (BrasilAPI/ReceitaWS).',
    },
    permissions: {
      title: 'Permissões',
      content: '- Controlada por `canViewSales(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes `ScreenClientes`, `JetroTable`, `useBrand`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Validação de CNPJ/CPF com dígito verificador e aviso de duplicidade cadastral.',
    },
  },

  '/admin/comercial/pedidos-faturamento': {
    route: '/admin/comercial/pedidos-faturamento',
    title: 'Pedidos e Faturamento',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o ciclo de vida comercial dos pedidos de venda, orçamentos, faturamento e campanhas promocionais integradas. NOTA: A Consulta de Pedidos permanece como tela própria analítica separada e intacta.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba 1 (Pedidos de Venda): Emissão, aprovação e acompanhamento de status de pedidos de venda.\n- Aba 2 (Orçamentos): Criação de propostas comerciais e orçamentos com conversão direta em pedido.\n- Aba 3 (Faturamento): Liberação para expedição e geração de documento fiscal com origem única.\n- Aba 4 (Promoções): Configuração de campanhas comerciais, descontos por volume e brindes.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Pedidos aprovados efetuam reserva no estoque da empresa correspondente.\n- Faturamento gera contas a receber e envia os dados ao módulo Fiscal para NF-e mod 55.\n- A tela Consulta de Pedidos (/admin/vendas/consulta-pedidos) permanece independente conforme regra do projeto.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O orçamento é elaborado e enviado para aprovação do cliente.\n2. Ao ser aprovado, converte-se em pedido de venda.\n3. O pedido passa por validação de crédito e estoque até a liberação de faturamento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `sales_orders`, `sales_order_items`, `budget_requests`, `promotions`, `products`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Fiscal (emissão de NF-e), Estoque (reserva/baixa de produtos), Financeiro (títulos a receber).',
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
}

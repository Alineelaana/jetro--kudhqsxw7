import type { JetroTour } from '@/services/jetro-online'

/**
 * Catálogo completo de Tours Guiados Interativos das Telas do Jetro ERP.
 * Abrange: Administração, Cadastros, Comercial, Financeiro, Fiscal, DP & RH, SST,
 * Inteligência, Marketing Enterprise, Operação (Estoque/Indústria/Logística/Transporte),
 * Planilhas Convertidas, Verbas e Atendimento.
 *
 * Utiliza identificadores estáveis:
 * - [data-tour-id="..."]
 * - IDs canônicos (#...)
 * - Seletores semânticos resilientes com validação automática de consistência
 */
export const JETRO_TOURS_CATALOG: JetroTour[] = [
  // ========================================================================
  // 1. COMERCIAL — CONSULTA DE PEDIDOS (EXEMPLO REAL E EXIGIDO PELO USUÁRIO)
  // ========================================================================
  {
    id: 'tour-comercial-consulta-pedidos',
    titulo: 'Consulta de Pedidos de Venda',
    descricao:
      'Aprenda a pesquisar, filtrar, ordenar colunas, reordenar e consultar os detalhes completos de pedidos.',
    rota: '/admin/vendas/consulta-pedidos',
    modulo: 'Comercial',
    ativo: true,
    ordem: 1,
    permissao_necessaria: 'canViewSales',
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Filtros da Consulta',
        texto:
          'Utilize estes campos para localizar pedidos por cliente, representante, período, status ou outras informações.',
        seletor: '[data-tour-id="pedidos-filtros-container"]',
        posicao: 'bottom',
        acaoEsperada: 'observe',
        dicaInterativa: 'Você pode expandir ou recolher os filtros clicando em "Exibir Filtro".',
      },
      {
        titulo: 'Consultar Resultados',
        texto:
          'Após selecionar os filtros desejados, clique em Consultar para visualizar os pedidos encontrados.',
        seletor: '[data-tour-id="pedidos-btn-consultar"]',
        posicao: 'bottom',
        acaoEsperada: 'click',
        dicaInterativa: 'O botão Consultar atualiza os resultados em tempo real do banco de dados.',
      },
      {
        titulo: 'Ordenar Colunas',
        texto:
          'Clique no cabeçalho de uma coluna para organizar os resultados em ordem crescente ou decrescente.',
        seletor: '[data-tour-id="pedidos-tabela-head"]',
        posicao: 'bottom',
        acaoEsperada: 'click',
        dicaInterativa: 'Um clique ordena ascendente, o segundo descendente e o terceiro restaura.',
      },
      {
        titulo: 'Personalizar Colunas',
        texto:
          'Arraste os cabeçalhos para reorganizar as colunas conforme sua preferência ou use o botão Personalizar Colunas.',
        seletor: '[data-tour-id="pedidos-btn-personalizar-colunas"]',
        posicao: 'left',
        acaoEsperada: 'click',
        dicaInterativa: 'Suas preferências de largura e visibilidade são salvas na sua conta.',
      },
      {
        titulo: 'Detalhes do Pedido',
        texto:
          'Selecione um pedido para consultar suas informações detalhadas, itens faturados, saldo e histórico.',
        seletor: '[data-tour-id="pedidos-btn-detalhes-primeiro"]',
        posicao: 'left',
        acaoEsperada: 'click',
        dicaInterativa: 'Clique no botão Detalhes em qualquer linha para abrir a visão completa.',
      },
    ],
  },

  // ========================================================================
  // 2. PRINCIPAL / INICIAL — HOME INTELIGENTE (/admin)
  // ========================================================================
  {
    id: 'tour-admin-home',
    titulo: 'Tela Inicial Inteligente e Cockpit',
    descricao:
      'Visão consolidada da operação corporativa, atalhos rápidos e acesso central aos módulos.',
    rota: '/admin',
    modulo: 'Principal',
    ativo: true,
    ordem: 2,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Visão Geral do ERP',
        texto:
          'Esta é sua área de trabalho inicial no Jetro. Aqui você visualiza o resumo das atividades corporativas dos módulos autorizados para o seu perfil.',
        seletor: '[data-tour-id="admin-home-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Menu de Navegação Lateral',
        texto:
          'Acesse todos os módulos do ERP pelo menu lateral esquerdo. Você pode recolhê-lo no modo ícones (rail) ou pesquisar qualquer tela no campo de busca.',
        seletor: '[data-tour-id="admin-sidebar-nav"]',
        posicao: 'right',
      },
      {
        titulo: 'Indicadores e Módulos Rápidos',
        texto:
          'Estes cartões trazem o status operacional de Vendas, Financeiro, Logística, Estoque e Atendimento em tempo real.',
        seletor: '[data-tour-id="admin-home-cards"]',
        posicao: 'top',
      },
      {
        titulo: 'Assistente Jetro On-line',
        texto:
          'Utilize o assistente no canto direito para tirar dúvidas sobre telas, pedir cálculos de giro, consultar pedidos ou acionar tours guiados.',
        seletor: '#floating-chat-trigger',
        posicao: 'left',
      },
    ],
  },

  // ========================================================================
  // 3. COMERCIAL — GESTÃO DE CLIENTES (/admin/cadastros/clientes)
  // ========================================================================
  {
    id: 'tour-cadastros-clientes',
    titulo: 'Cadastro e Gestão de Clientes',
    descricao:
      'Como consultar, filtrar a carteira, cadastrar novos clientes e gerenciar limites de crédito.',
    rota: '/admin/cadastros/clientes',
    modulo: 'Cadastros',
    ativo: true,
    ordem: 3,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Carteira de Parceiros e Clientes',
        texto:
          'Nesta tela você gerencia toda a base de clientes do ERP, incluindo pessoas físicas (PF) e jurídicas (PJ).',
        seletor: '[data-tour-id="cadastro-screen-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Pesquisa e Filtros de Clientes',
        texto:
          'Localize parceiros rapidamente por Razão Social, Nome Fantasia, CNPJ/CPF, cidade ou status ativo/bloqueado.',
        seletor: '[data-tour-id="cadastro-search-input"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Novo Cliente',
        texto:
          'Clique neste botão para abrir o formulário completo de cadastro com dados cadastrais, endereço, contatos e limites comerciais.',
        seletor: '[data-tour-id="cadastro-btn-novo"]',
        posicao: 'left',
      },
      {
        titulo: 'Tabela de Clientes',
        texto:
          'Acompanhe a lista de clientes com indicativo de restrições financeiras, rede de clientes e responsável comercial (RCA).',
        seletor: '[data-tour-id="cadastro-table-container"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 4. COMERCIAL — TABELAS DE PREÇOS (/admin/tabelas-precos)
  // ========================================================================
  {
    id: 'tour-comercial-tabelas-precos',
    titulo: 'Tabelas de Preços Comerciais',
    descricao:
      'Estruturação de tabelas de venda, canais de distribuição, margens e regras de aplicação.',
    rota: '/admin/tabelas-precos',
    modulo: 'Comercial',
    ativo: true,
    ordem: 4,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Central de Tabelas de Preço',
        texto:
          'Gerencie as tabelas de atacado, varejo, distribuição, promoções e condições especiais por cliente ou região.',
        seletor: '[data-tour-id="price-tables-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Filtros por Canal e Status',
        texto:
          'Filtre as tabelas ativas, em aprovação ou expiradas para planejar ações de preço assertivas.',
        seletor: '[data-tour-id="price-tables-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Cadastrar Nova Tabela',
        texto:
          'Crie uma nova tabela de preços vinculando produtos, percentuais de desconto e vigência de validade.',
        seletor: '[data-tour-id="price-tables-btn-nova"]',
        posicao: 'left',
      },
      {
        titulo: 'Grade de Tabelas Vigentes',
        texto: 'Consulte a prioridade de aplicação da tabela e o número de itens precificados.',
        seletor: '[data-tour-id="price-tables-grid"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 5. COMERCIAL — CRM & PIPELINE (/admin/crm)
  // ========================================================================
  {
    id: 'tour-crm-dashboard',
    titulo: 'CRM Comercial e Funil de Vendas',
    descricao:
      'Gestão do pipeline de leads, oportunidades abertas, agendamento de reuniões e propostas.',
    rota: '/admin/crm',
    modulo: 'Comercial',
    ativo: true,
    ordem: 5,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Painel do CRM',
        texto:
          'Visão unificada das oportunidades comerciais em andamento, taxas de conversão e metas dos vendedores.',
        seletor: '[data-tour-id="crm-dashboard-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Etapas do Funil de Vendas',
        texto:
          'Acompanhe o estágio de cada negociação: Prospecção, Qualificação, Proposta, Negociação e Fechamento.',
        seletor: '[data-tour-id="crm-funnel-view"]',
        posicao: 'top',
      },
      {
        titulo: 'Nova Oportunidade / Lead',
        texto:
          'Cadastre uma nova oportunidade informando o potencial cliente, valor estimado e data de fechamento prevista.',
        seletor: '[data-tour-id="crm-btn-novo-lead"]',
        posicao: 'left',
      },
    ],
  },

  // ========================================================================
  // 6. FINANCEIRO — CONTAS A PAGAR (/admin/financeiro/contas-pagar)
  // ========================================================================
  {
    id: 'tour-financeiro-contas-pagar',
    titulo: 'Contas a Pagar',
    descricao:
      'Controle de títulos a pagar, datas de vencimento, aprovações, baixas e emissão de comprovantes.',
    rota: '/admin/financeiro/contas-pagar',
    modulo: 'Financeiro',
    ativo: true,
    ordem: 6,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Gestão de Contas a Pagar',
        texto:
          'Acompanhe os compromissos financeiros da empresa, segregados por fornecedor, centro de custo e plano de contas.',
        seletor: '[data-tour-id="fin-payables-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Filtros de Vencimento e Status',
        texto:
          'Localize rapidamente títulos em aberto, vencidos no período ou baixados para conferência.',
        seletor: '[data-tour-id="fin-payables-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Inclusão de Título a Pagar',
        texto:
          'Lance um novo título com código de barras, chave PIX, data de competência e anexos comprobatórios.',
        seletor: '[data-tour-id="fin-payables-btn-novo"]',
        posicao: 'left',
      },
      {
        titulo: 'Operações de Baixa',
        texto:
          'Realize a liquidação individual ou em lote, aplicando juros, multas ou descontos concedidos.',
        seletor: '[data-tour-id="fin-payables-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 7. FINANCEIRO — CONTAS A RECEBER (/admin/financeiro/contas-receber)
  // ========================================================================
  {
    id: 'tour-financeiro-contas-receber',
    titulo: 'Contas a Receber e Cobrança',
    descricao:
      'Monitoramento de títulos gerados por faturamento, baixas de boletos/PIX e régua de cobrança.',
    rota: '/admin/financeiro/contas-receber',
    modulo: 'Financeiro',
    ativo: true,
    ordem: 7,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Contas a Receber da Empresa',
        texto:
          'Controle as entradas financeiras originadas de vendas, contratos e prestações de serviços.',
        seletor: '[data-tour-id="fin-receivables-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Pesquisa por Cliente e Documento',
        texto: 'Consulte títulos pelo número da NF-e, número do pedido ou razão social do cliente.',
        seletor: '[data-tour-id="fin-receivables-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Histórico de Recebimentos e Baixas',
        texto:
          'Visualize o saldo remanescente, títulos em atraso e acione o envio de lembretes ao cliente.',
        seletor: '[data-tour-id="fin-receivables-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 8. FINANCEIRO — FLUXO DE CAIXA (/admin/financeiro/fluxo-caixa)
  // ========================================================================
  {
    id: 'tour-financeiro-fluxo-caixa',
    titulo: 'Fluxo de Caixa Projetado e Realizado',
    descricao:
      'Análise de liquidez, saldo diário projetado, entradas e saídas previstas para tomada de decisão.',
    rota: '/admin/financeiro/fluxo-caixa',
    modulo: 'Financeiro',
    ativo: true,
    ordem: 8,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Painel de Fluxo de Caixa',
        texto:
          'Compare as receitas e despesas consolidadas para enxergar o saldo futuro das contas correntes.',
        seletor: '[data-tour-id="fin-cashflow-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Período de Projeção',
        texto:
          'Selecione a visualização diária, semanal ou mensal para antecipar necessidades de capital de giro.',
        seletor: '[data-tour-id="fin-cashflow-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Gráfico de Liquidez',
        texto:
          'Identifique rapidamente picos de liquidação e dias com previsão de déficit para remanejamento.',
        seletor: '[data-tour-id="fin-cashflow-chart"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 9. FISCAL — DOCUMENTOS FISCAIS E NF-E (/admin/fiscal/nfe)
  // ========================================================================
  {
    id: 'tour-fiscal-nfe',
    titulo: 'Gestão de NF-e e Documentos Eletrônicos',
    descricao:
      'Transmissão para a SEFAZ, consulta de status, cancelamentos, cartas de correção e impressão de DANFE.',
    rota: '/admin/fiscal/nfe',
    modulo: 'Fiscal',
    ativo: true,
    ordem: 9,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Central de Notas Fiscais Eletrônicas',
        texto:
          'Consulte todas as NF-e emitidas pelo faturamento do ERP, com protocolo de autorização da SEFAZ.',
        seletor: '[data-tour-id="fiscal-nfe-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Status de Transmissão SEFAZ',
        texto:
          'Filtre notas Autorizadas, Canceladas, Rejeitadas ou Em Processamento na SEFAZ estadual.',
        seletor: '[data-tour-id="fiscal-nfe-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Ações Fiscais Operacionais',
        texto:
          'Faça o download do XML homologado, gere a DANFE em PDF ou envie Carta de Correção Eletrônica (CC-e).',
        seletor: '[data-tour-id="fiscal-nfe-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 10. FISCAL — REFORMA TRIBUTÁRIA (/admin/fiscal/reforma-dashboard)
  // ========================================================================
  {
    id: 'tour-fiscal-reforma',
    titulo: 'Simulador da Reforma Tributária (IBS / CBS)',
    descricao:
      'Entenda o impacto da transição do PIS/COFINS/ICMS para a CBS e o IBS sobre os produtos e margens.',
    rota: '/admin/fiscal/reforma-dashboard',
    modulo: 'Fiscal',
    ativo: true,
    ordem: 10,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Dashboard da Reforma Tributária',
        texto:
          'Acompanhe o cronograma de transição constitucional da Reforma Tributária e seus efeitos nos tributos.',
        seletor: '[data-tour-id="reforma-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Simulações de Carga Tributária',
        texto:
          'Compare a alíquota atual cumulativa com as projeções de IVA Dual (CBS federal + IBS estadual/municipal).',
        seletor: '[data-tour-id="reforma-cards"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Classificação NCM e Alíquotas Diferenciadas',
        texto:
          'Verifique produtos com isenção, redução de base de cálculo ou incidência de Imposto Seletivo (IS).',
        seletor: '[data-tour-id="reforma-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 11. DP & RH — COLABORADORES E ADMISSÕES (/admin/dp/admissions)
  // ========================================================================
  {
    id: 'tour-dp-admissoes',
    titulo: 'Admissões e Departamento Pessoal',
    descricao:
      'Processamento admissional, cadastro de dados CLT, documentos obrigatórios e envio do evento S-2200 ao eSocial.',
    rota: '/admin/dp/admissions',
    modulo: 'DP & RH',
    ativo: true,
    ordem: 11,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Central de Admissões',
        texto:
          'Gerencie as contratações em andamento com validação de documentos, exames admissionais e contratos.',
        seletor: '[data-tour-id="dp-admissions-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Nova Admissão',
        texto:
          'Inicie o fluxo de admissão preenchendo cargo, departamento, salário acordado, jornada e dependentes.',
        seletor: '[data-tour-id="dp-admissions-btn-novo"]',
        posicao: 'left',
      },
      {
        titulo: 'Status eSocial',
        texto:
          'Acompanhe o protocolo de transmissão do evento admissional para o ambiente oficial do governo federal.',
        seletor: '[data-tour-id="dp-admissions-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 12. DP & RH — BANCO DE HORAS (/admin/dp/banco-horas)
  // ========================================================================
  {
    id: 'tour-dp-banco-horas',
    titulo: 'Banco de Horas e Apuração de Ponto',
    descricao:
      'Espelho de ponto, cálculo de créditos e débitos, compensações e extrato individual por colaborador.',
    rota: '/admin/dp/banco-horas',
    modulo: 'DP & RH',
    ativo: true,
    ordem: 12,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Controle de Banco de Horas',
        texto:
          'Apure o saldo acumulado de horas extras e faltas compensáveis em conformidade com o acordo coletivo.',
        seletor: '[data-tour-id="dp-banco-horas-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Filtro por Colaborador e Mês',
        texto:
          'Selecione a competência para conferir o extrato analítico antes do fechamento da folha de pagamento.',
        seletor: '[data-tour-id="dp-banco-horas-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Lançamentos e Ajustes',
        texto:
          'Consulte cada lançamento com justificativa anexada (atestados, compensações ou autorizações de hora extra).',
        seletor: '[data-tour-id="dp-banco-horas-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 13. INTELIGÊNCIA — BI & DASHBOARDS (/admin/bi)
  // ========================================================================
  {
    id: 'tour-inteligencia-bi',
    titulo: 'Business Intelligence Executivo (BI)',
    descricao:
      'Indicadores estratégicos de vendas, margens, ruptura de estoque e relatórios consolidados.',
    rota: '/admin/bi',
    modulo: 'Inteligência',
    ativo: true,
    ordem: 13,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Central de Indicadores BI',
        texto:
          'Cockpit executivo do Jetro ERP com KPIs atualizados automaticamente a partir das movimentações operacionais.',
        seletor: '[data-tour-id="bi-dashboard-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Filtros Globais de Análise',
        texto:
          'Defina o período, filial ou segmento para recalcular todos os gráficos de forma sincronizada.',
        seletor: '[data-tour-id="bi-dashboard-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Visões Especializadas',
        texto: 'Alterne entre os painéis Comercial, Financeiro, Industrial e Estoque no submenu.',
        seletor: '[data-tour-id="bi-nav-tabs"]',
        posicao: 'bottom',
      },
    ],
  },

  // ========================================================================
  // 14. INTELIGÊNCIA — CONTROLADORIA & DRE (/admin/controladoria)
  // ========================================================================
  {
    id: 'tour-controladoria-cockpit',
    titulo: 'Controladoria e Demonstração de Resultado (DRE)',
    descricao:
      'Acompanhamento do EBITDA, margem de contribuição, despesas fixas e confronto Orçado × Realizado.',
    rota: '/admin/controladoria',
    modulo: 'Inteligência',
    ativo: true,
    ordem: 14,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Cockpit da Controladoria',
        texto:
          'Visão contábil e gerencial integrada para diretores e controladores acompanharem o resultado econômico.',
        seletor: '[data-tour-id="controladoria-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'DRE Consolidada',
        texto:
          'Demonstração da receita bruta até o lucro líquido com abertura analítica por linha de custo e despesa.',
        seletor: '[data-tour-id="controladoria-dre-preview"]',
        posicao: 'top',
      },
      {
        titulo: 'Simulador Corporativo',
        texto:
          'Simule cenários de crescimento de vendas, reajustes de insumos ou variação cambial para prever o impacto.',
        seletor: '[data-tour-id="controladoria-simulator-link"]',
        posicao: 'left',
      },
    ],
  },

  // ========================================================================
  // 15. OPERAÇÃO — WMS & ESTOQUE (/admin/estoque)
  // ========================================================================
  {
    id: 'tour-operacao-estoque',
    titulo: 'Estoque e WMS (Armazenagem Inteligente)',
    descricao:
      'Controle de saldo físico, endereçamento de posições, ondas de separação, recebimento e inventário cego.',
    rota: '/admin/estoque',
    modulo: 'Operação',
    ativo: true,
    ordem: 15,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Painel do Armazém (WMS)',
        texto:
          'Monitore a ocupação das docas, níveis de estoque mínimo e movimentações de transferência internas.',
        seletor: '[data-tour-id="estoque-dashboard-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Alertas de Ruptura e Lotes',
        texto:
          'Acompanhe avisos de produtos abaixo do estoque mínimo e lotes com data de validade próxima ao vencimento.',
        seletor: '[data-tour-id="estoque-alerts-banner"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Separação e Expedição',
        texto:
          'Consulte as tarefas pendentes de separação com endereços de picking e etiquetas de conferência.',
        seletor: '[data-tour-id="estoque-picking-link"]',
        posicao: 'right',
      },
    ],
  },

  // ========================================================================
  // 16. OPERAÇÃO — TRANSPORTE & LOGÍSTICA (/admin/transporte)
  // ========================================================================
  {
    id: 'tour-operacao-transporte',
    titulo: 'Transporte e Formação de Cargas',
    descricao:
      'Roteirização de frotas, romaneios de entrega, emissão de CT-e/MDF-e e rastreamento com motoristas.',
    rota: '/admin/transporte',
    modulo: 'Operação',
    ativo: true,
    ordem: 16,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Gestão de Frotas e Entregas',
        texto:
          'Controle veículos próprios e transportadoras terceiras com capacidade de peso, volume e custos de frete.',
        seletor: '[data-tour-id="transporte-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Formação de Cargas e Romaneios',
        texto:
          'Agrupe pedidos de venda faturados na mesma rota para otimizar o tempo e a quilometragem percorrida.',
        seletor: '[data-tour-id="transporte-romaneios-link"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Comprovantes de Entrega',
        texto:
          'Consulte as fotos de canhoto assinadas digitalmente pelo aplicativo dos motoristas no momento da entrega.',
        seletor: '[data-tour-id="transporte-pod-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 17. OPERAÇÃO — INDÚSTRIA & PCD (/admin/industria)
  // ========================================================================
  {
    id: 'tour-operacao-industria',
    titulo: 'PCP e Chão de Fábrica Industrial',
    descricao:
      'Estruturas de produtos (BOM), roteiros produtivos, ordens de produção (OP) e apontamentos de qualidade.',
    rota: '/admin/industria',
    modulo: 'Operação',
    ativo: true,
    ordem: 17,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Cockpit da Produção Industrial',
        texto:
          'Acompanhe o status das linhas de montagem, capacidade instalada e cumprimento do Plano Mestre de Produção.',
        seletor: '[data-tour-id="industria-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Ordens de Produção (OP)',
        texto:
          'Abra novas ordens com requisição automática de matérias-primas e insumos cadastrados na ficha técnica (BOM).',
        seletor: '[data-tour-id="industria-btn-nova-op"]',
        posicao: 'left',
      },
      {
        titulo: 'Rastreabilidade e Lotes',
        texto:
          'Localize em segundos qual lote de matéria-prima foi consumido em cada produto acabado expedido.',
        seletor: '[data-tour-id="industria-traceability-link"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 18. PLANILHAS CONVERTIDAS (/admin/planilhas/convertidas/comparativo-margens-gr)
  // ========================================================================
  {
    id: 'tour-planilhas-margens-gr',
    titulo: 'Planilhas Convertidas: Margens GR',
    descricao:
      'Comparativo de margens reais versus projetadas, apuração de custos e tabela mãe Gran Romano.',
    rota: '/admin/planilhas/convertidas/comparativo-margens-gr',
    modulo: 'Planilhas Convertidas',
    ativo: true,
    ordem: 18,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Motor de Planilhas Convertidas',
        texto:
          'Módulo de inteligência que roda cálculos avançados sem risco de perda de fórmulas ou versões de arquivo.',
        seletor: '[data-tour-id="margens-gr-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Filtros de Período e Família',
        texto:
          'Selecione os grupos de itens e as filiais operacionais para calcular os spreads de margem bruta e líquida.',
        seletor: '[data-tour-id="margens-gr-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Tabela Comparativa e Exportação',
        texto:
          'Consulte os percentuais com código de cores e exporte a memória de cálculo completa para conferência.',
        seletor: '[data-tour-id="margens-gr-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 19. VERBAS DE FORNECEDORES (/admin/verbas)
  // ========================================================================
  {
    id: 'tour-verbas-fornecedores',
    titulo: 'Verbas de Fornecedores e Trade',
    descricao:
      'Gestão de acordos comerciais com indústrias, apuração de contratos, conta corrente e créditos.',
    rota: '/admin/verbas',
    modulo: 'Verbas',
    ativo: true,
    ordem: 19,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Acordos Comerciais e Verbas',
        texto:
          'Acompanhe as verbas contratadas junto às indústrias para investimento conjunto em ações e descontos.',
        seletor: '[data-tour-id="verbas-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Conta Corrente por Fornecedor',
        texto:
          'Consulte o saldo disponível de verba, valores já debitados em campanhas e comprovantes de prestação de contas.',
        seletor: '[data-tour-id="verbas-cards"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Apurações e Liquidações',
        texto:
          'Gere débitos em duplicatas ou recebimentos via depósito bancário vinculando aos relatórios auditados.',
        seletor: '[data-tour-id="verbas-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 20. MARKETING ENTERPRISE (/admin/marketing)
  // ========================================================================
  {
    id: 'tour-marketing-enterprise',
    titulo: 'Marketing Enterprise e Aprovação de Peças',
    descricao:
      'Solicitações de briefing, calendário editorial, aprovação de criativos e biblioteca de ativos da marca.',
    rota: '/admin/marketing',
    modulo: 'Marketing Enterprise',
    ativo: true,
    ordem: 20,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Cockpit de Marketing',
        texto:
          'Visão unificada das campanhas publicitárias em andamento, peças a aprovar e jobs em execução.',
        seletor: '[data-tour-id="marketing-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Nova Solicitação / Briefing',
        texto:
          'Solicite criativos para eventos, lançamentos de produtos ou redes sociais com anexos e prazos.',
        seletor: '[data-tour-id="marketing-btn-novo-job"]',
        posicao: 'left',
      },
      {
        titulo: 'Aprovação de Criativos',
        texto:
          'Revise as artes submetidas, aponte correções pontuais ou aprove para publicação imediata.',
        seletor: '[data-tour-id="marketing-approval-feed"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 21. ATENDIMENTO AO CLIENTE (/admin/atendimento)
  // ========================================================================
  {
    id: 'tour-atendimento-central',
    titulo: 'Central de Atendimento e Chamados',
    descricao:
      'Abertura de tickets, controle de SLA, classificação por motivo e histórico de relacionamento com clientes.',
    rota: '/admin/atendimento',
    modulo: 'Atendimento',
    ativo: true,
    ordem: 21,
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Fila de Atendimentos',
        texto:
          'Monitore chamados em aberto, atendentes designados e o tempo de resposta aos clientes.',
        seletor: '[data-tour-id="atendimento-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Registrar Novo Chamado',
        texto:
          'Abra um atendimento vinculando o cliente, setor responsável e nível de criticidade.',
        seletor: '[data-tour-id="atendimento-btn-novo"]',
        posicao: 'left',
      },
      {
        titulo: 'Controle de SLA e Prazos',
        texto:
          'Acompanhe o cronômetro de atendimento para garantir cumprimento das metas de satisfação.',
        seletor: '[data-tour-id="atendimento-sla-badge"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 22. ADMINISTRAÇÃO — AUDITORIA (/admin/auditoria)
  // ========================================================================
  {
    id: 'tour-admin-auditoria',
    titulo: 'Auditoria Corporativa e Trilha de Segurança',
    descricao:
      'Registro indelével de operações, logins, alterações de preços, sessões ativas e investigações.',
    rota: '/admin/auditoria',
    modulo: 'Administração',
    ativo: true,
    ordem: 22,
    permissao_necessaria: 'canViewAuditLogs',
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Trilha de Auditoria do ERP',
        texto:
          'Todos os acessos e modificações sensíveis no Jetro ficam registrados com usuário, IP, data e valor anterior/novo.',
        seletor: '[data-tour-id="auditoria-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Filtro por Usuário e Módulo',
        texto:
          'Investigue ações específicas filtrando por período, tipo de evento ou usuário responsável.',
        seletor: '[data-tour-id="auditoria-filters"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Tabela de Logs e Diferenças',
        texto:
          'Consulte o comparativo campo a campo (diff) entre os dados antigos e o novo registro salvo.',
        seletor: '[data-tour-id="auditoria-table"]',
        posicao: 'top',
      },
    ],
  },

  // ========================================================================
  // 23. ADMINISTRAÇÃO — TOURS GUIADOS (/admin/configuracoes/jetro-online/tours)
  // ========================================================================
  {
    id: 'tour-central-tours',
    titulo: 'Central de Gestão de Tours Guiados',
    descricao:
      'Gerencie os tutoriais interativos de cada tela, crie novas etapas, teste e audite inconsistências.',
    rota: '/admin/configuracoes/jetro-online/tours',
    modulo: 'Administração',
    ativo: true,
    ordem: 23,
    permissao_necessaria: 'canManageJetroOnline',
    status_revisao: 'ok',
    etapas: [
      {
        titulo: 'Gestão de Tours das Telas',
        texto:
          'Aqui os administradores configuram como o Jetro ensina o operador a trabalhar em cada módulo.',
        seletor: '[data-tour-id="central-tours-header"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Métricas de Utilização e Conclusão',
        texto:
          'Acompanhe quais telas têm mais procura de tours, percentuais de conclusão e taxa de abandono.',
        seletor: '[data-tour-id="central-tours-metrics"]',
        posicao: 'bottom',
      },
      {
        titulo: 'Cadastrar ou Editar Tour',
        texto:
          'Sem precisar programar: crie roteiros, altere a ordem das etapas ou corrija seletores quando as telas mudarem.',
        seletor: '[data-tour-id="central-tours-btn-novo"]',
        posicao: 'left',
      },
      {
        titulo: 'Validação e Teste em Tempo Real',
        texto:
          'Acione o botão Testar Tour para vivenciar a experiência do operador antes de publicar.',
        seletor: '[data-tour-id="central-tours-table"]',
        posicao: 'top',
      },
    ],
  },
]

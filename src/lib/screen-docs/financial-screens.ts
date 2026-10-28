import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 6 TELAS OFICIAIS DO MÓDULO FINANCEIRO
 * Lida diretamente do código real em src/components/financial/screens/:
 * 1. Central Financeira (screen-central-financeira.tsx)
 * 2. Contas a Receber e Cobrança (screen-contas-receber-cobranca.tsx)
 * 3. Contas a Pagar e Tesouraria (screen-contas-pagar-tesouraria.tsx)
 * 4. Bancos e Conciliação (screen-bancos-conciliacao.tsx)
 * 5. Planejamento e Gestão (screen-planejamento-gestao.tsx)
 * 6. Configurações Financeiras (screen-configuracoes-financeiras.tsx)
 */
export const FINANCIAL_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // 1. CENTRAL FINANCEIRA
  // -------------------------------------------------------------
  '/admin/financeiro': {
    route: '/admin/financeiro',
    title: 'Central Financeira',
    moduleGroup: 'Financeiro',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como o cockpit executivo e centro de comando consolidado do Financeiro, exibindo em tempo real saldos bancários, valores a receber e a pagar, inadimplência, alçadas pendentes, capital de giro líquido, alertas operacionais de pagamentos duplicados e atalhos diretos para as telas operacionais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cards de indicadores-chave clicáveis: Saldo Bancário Consolidado (com quantidade de contas ativas), Contas a Receber (com destaque de vencidos), Contas a Pagar (com badge de valores aguardando alçada) e Capital de Giro Líquido com Índice de Liquidez Corrente.\n- Banner de Alertas Operacionais: detecção em tempo real de pagamentos duplicados suspeitos via inteligência antiduplicidade e sinalização de lançamentos sem centro de custo/categoria.\n- Posição detalhada por conta bancária com agência, conta e saldo atual.\n- Previsão de Entradas × Saídas das próximas 4 semanas cruzando parcelas faturadas com contas a pagar e provisão de folha do RH/DP.\n- Grade de atalhos diretos para os 6 módulos estruturados do financeiro.\n- Botão de exportação de KPIs executivos em Excel/PDF via ExportActions e atualização em tempo real via botão Refresh e hook useRealtime.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Saldo bancário total é a soma dos saldos de todas as contas ativas cadastradas em contas_bancarias.\n- O cálculo do Capital de Giro Líquido considera: Saldo Bancário + Títulos a Receber em Aberto - Títulos a Pagar em Aberto; Liquidez Corrente = (Saldo Bancário + Receber Aberto) / Pagar Aberto.\n- Títulos vencidos são apurados dinamicamente comparando data_vencimento com a data corrente para títulos com status diferente de Pago/Recebido/Cancelado.\n- Detecção de pagamentos duplicados compara favorecido/fornecedor, valor_original e data de vencimento entre títulos a pagar em aberto.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor financeiro acessa a rota `/admin/financeiro`.\n2. O painel carrega em paralelo dados de `financial_receivables`, `financial_payables` e `contas_bancarias`.\n3. O sistema calcula os totais consolidados, liquidez corrente e varredura antiduplicidade.\n4. O usuário clica em qualquer card ou alerta para navegar diretamente até a tela operacional correspondente.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `financial_receivables`, `financial_payables`, `contas_bancarias`.\n- Hooks: `useRealtime` nas coleções `financial_receivables` e `financial_payables` para atualização instantânea.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Departamento Pessoal (DP) para provisão de folha na semana 3 da projeção.\n- Conexão com os módulos operacionais de Contas a Receber, Contas a Pagar, Bancos e Conciliação e Planejamento e Gestão.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: controlada por `canViewFinancial(role)` (perfis SUP, ADMIN, FINANCEIRO e DIRETORIA).\n- Atualização de dados sincronizada automaticamente ou sob demanda.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCentralFinanceira`, `Card`, `Badge`, `Button`, `ExportActions`.\n- Serviços: `getReceivables`, `getPayables`, `finGetList` de `@/services/financial` e `financial-advanced-service.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Falhas no carregamento de coleções são capturadas com fallback para listas vazias ou contas padrão simuladas sem travar a interface.\n- Notificação via toast sonner ao recarregar dados manualmente.',
    },
  },

  // -------------------------------------------------------------
  // 2. CONTAS A RECEBER E COBRANÇA
  // -------------------------------------------------------------
  '/admin/financeiro/contas-a-receber-cobranca': {
    route: '/admin/financeiro/contas-a-receber-cobranca',
    title: 'Contas a Receber e Cobrança',
    moduleGroup: 'Financeiro',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar integralmente o ciclo de contas a receber e cobrança da empresa, unificando a gestão de títulos, parcelas, régua automatizada de cobrança, acordos de renegociação com recálculo de juros/multa, emissão e liquidação por múltiplos meios (Boleto, PIX, Cartão, Cheque) e auditoria de cobrança.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 Abas Internas estruturadas:\n  1. "Títulos": grade analítica completa com busca, filtros por status/cliente, indicadores no topo (Total Aberto, Vencidos, Recebido Mês, Negociado), badges de status e formulário de novo título;\n  2. "Parcelas": controle de vencimentos por período (Hoje, 7 dias, 15 dias, 30 dias, Vencidas), cálculo automático de juros/multa por dias de atraso e ação de liquidação individual;\n  3. "Régua de Cobrança": automação parametrizada com disparos antes do vencimento (-3 dias), no dia (D-0), atraso moderado (+5 dias) e cobrança jurídica (+15 dias) via WhatsApp, E-mail e SMS;\n  4. "Renegociações": assistente de acordos de dívida com cálculo de desconto, entrada e parcelamento em até 12x com geração de novo título;\n  5. "Meios de Recebimento": gestão operacional de Boletos (emissão/remessa), PIX Dinâmico (QR Code e chave Copia e Cola), Cartões (taxa MDR e antecipação de recebíveis) e Cheques (custódia, compensação e devoluções);\n  6. "Histórico": log de auditoria de interações e ações de cobrança por cliente.\n- Exportação para Excel e PDF via `ExportActions` com filtros ativos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Juros e multa moratórios são calculados automaticamente sobre títulos vencidos segundo os parâmetros configurados (padrão 2% de multa + 1% de juros ao mês pro-rata die).\n- A liquidação total de uma parcela atualiza o saldo devedor e comuta o status para "Recebido", registrando a data e forma de pagamento.\n- Renegociações cancelam os títulos vencidos originais e geram uma nova série parcelada atrelada ao número do acordo.\n- Cheques devolvidos alteram automaticamente o status para "Devolvido" e reabrem a cobrança do cliente correspondente.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador financeiro acessa a tela e monitora os indicadores de títulos em aberto e inadimplentes.\n2. Na aba "Títulos", cadastra ou importa novos recebíveis provenientes de pedidos de venda.\n3. Na aba "Parcelas", executa a liquidação das baixas recebidas no dia.\n4. A régua de cobrança automática dispara lembretes preventivos e de cobrança.\n5. Clientes inadimplentes são conduzidos na aba "Renegociações" para celebração de termo de acordo.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `financial_receivables`, `financial_collection_agreements`, `financial_collection_logs`, `financial_payment_methods`, `partners`.\n- Hooks: `useRealtime` na coleção `financial_receivables`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Conexão com o módulo Comercial (Pedidos de Venda) para faturamento e geração de títulos.\n- Gateway de Boletos bancários (CNAB 240/400) e APIs de PIX Dinâmico com geração de QR Code.\n- Integração com Bancos e Conciliação para conciliação das liquidações de extrato.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Consulta e Baixa: operadores financeiros autorizados por `canViewFinancial(role)`.\n- Concessão de descontos e renegociações: restrito a coordenadores e gerentes financeiros.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenContasReceberCobranca`, `Tabs`, `Table`, `Dialog`, `ExportActions`.\n- Serviços: `@/services/financial` e `financial-advanced-service.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de valores zerados ou negativos no cadastro de títulos e parcelas.\n- Bloqueio de baixa sem seleção de forma de pagamento e conta de crédito.\n- Alertas sonner informando sucesso ou falha na emissão de boletos e QR Codes PIX.',
    },
  },

  // -------------------------------------------------------------
  // 3. CONTAS A PAGAR E TESOURARIA
  // -------------------------------------------------------------
  '/admin/financeiro/contas-a-pagar-tesouraria': {
    route: '/admin/financeiro/contas-a-pagar-tesouraria',
    title: 'Contas a Pagar e Tesouraria',
    moduleGroup: 'Financeiro',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar o controle de obrigações financeiras, títulos a pagar, programação de desembolsos, esteira de aprovação por alçadas de valor com justificativa crítica, tesouraria, fluxo de caixa diário, gestão de comprovantes e cadastro de fornecedores com histórico de pontualidade.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 Abas Internas estruturadas:\n  1. "Títulos": grade de contas a pagar com filtros por período e status, indicadores no topo (A Pagar Aberto, Vencidos, Pagos no Mês, Em Aprovação), alerta antiduplicidade e cadastro de novo título com rateio de centro de custo;\n  2. "Programação e Borderôs": agenda de pagamentos do dia/semana com geração de borderô de lote de pagamento e exportação bancária;\n  3. "Aprovações e Alçadas": esteira de deliberação com segregação de funções e diálogo de justificativa obrigatória (`CriticalJustificationDialog`) para pagamentos acima da alçada ou em duplicidade;\n  4. "Caixa e Tesouraria": controle de caixinha/fundo fixo (suprimento, sangria, saldo) e transferências entre contas bancárias internas;\n  5. "Comprovantes": repositório de comprovantes de pagamento e notas fiscais vinculadas ao título com visualização direta;\n  6. "Fornecedores": relação de parceiros de pagamento com volume transacionado, chave PIX e dados bancários.\n- Exportação para Excel e PDF via `ExportActions`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Títulos com valor superior ao teto operacional do operador entram obrigatoriamente no status "Aguardando Aprovação".\n- Pagamentos suspeitos de duplicidade disparam bloqueio cautelar exigindo justificativa formal do gestor para liberação.\n- A liquidação de título no contas a pagar debita automaticamente o saldo da conta bancária ou caixinha selecionado.\n- Transferências entre contas internas geram par de lançamentos compensatórios de débito e crédito na tesouraria.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O setor de compras ou financeiro cadastra títulos a pagar vinculando fornecedor, centro de custo e vencimento.\n2. Títulos acima do limite entram na aba "Aprovações e Alçadas", onde o gestor autoriza ou rejeita com parecer.\n3. Na aba "Programação", os pagamentos aprovados são agrupados em borderô do dia para quitação bancária.\n4. O operador confirma a liquidação, anexa os comprovantes e o sistema atualiza o saldo das contas bancárias.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `financial_payables`, `financial_approvals`, `contas_bancarias`, `caixas_tesouraria`, `partners`.\n- Hooks: `useRealtime` na coleção `financial_payables`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Conexão com Compras/Estoque para entrada automática de duplicatas de notas fiscais de entrada.\n- Integração com Departamento Pessoal para quitação das guias de FGTS, INSS e folha líquida.\n- Sincronização com Bancos e Conciliação para validação do débito em extrato.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Cadastro e Operação: operadores financeiros autorizados por `canViewFinancial(role)`.\n- Aprovação de Alçadas Críticas: restrito a Coordenadores, Gerentes e Diretores conforme matriz de alçadas.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenContasPagarTesouraria`, `CriticalJustificationDialog`, `Tabs`, `Table`, `ExportActions`.\n- Serviços: `@/services/financial` e `financial-advanced-service.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de liquidação caso o saldo do caixinha/conta selecionado seja insuficiente.\n- Alerta impeditivo de aprovação caso a justificativa do gestor contenha menos de 10 caracteres em casos críticos.',
    },
  },

  // -------------------------------------------------------------
  // 4. BANCOS E CONCILIAÇÃO
  // -------------------------------------------------------------
  '/admin/financeiro/bancos-conciliacao': {
    route: '/admin/financeiro/bancos-conciliacao',
    title: 'Bancos e Conciliação',
    moduleGroup: 'Financeiro',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as contas bancárias corporativas, extratos eletrônicos, importação de arquivos bancários OFX e CNAB com bloqueio nativo de duplicidade de transações, conciliação automática por inteligência de matching (data, valor e documento) e conciliação manual assistida.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 4 Abas Internas estruturadas:\n  1. "Contas Bancárias": catálogo das contas da empresa (Itaú, Bradesco, Banco do Brasil, Santander, Inter, etc.) com agência, conta corrente, saldo atual, limite de cheque especial e status de conciliação;\n  2. "Importação OFX/CNAB": área de upload de arquivos bancários (.ofx, .ret, .cnab) com detecção automática de banco, contagem de transações e prevenção de transações duplicadas via hash/fitid;\n  3. "Conciliação": tela dividida (Lado Esquerdo: Extrato Bancário; Lado Direito: Razão do ERP) com motor de correspondência automática de 1 clique, sugestão de matching por tolerância de dias/valor e botão de conciliação manual vinculada;\n  4. "Histórico": log completo de extratos importados, lotes conciliados e estornos de conciliação efetuados.\n- Indicadores de topo: Saldo Consolidado, Transações Pendentes de Conciliação, Conciliadas no Mês e Diferença Apurada.\n- Exportação de extratos e relatórios de conciliação via `ExportActions`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Transações importadas de OFX com o mesmo FITID (identificador único da transação bancária) ou mesma combinação de data, valor e documento já existente são descartadas como duplicadas.\n- O matching automático considera correspondência exata de valor (R$) e margem de até 2 dias de tolerância entre a data do extrato e a data de vencimento/pagamento do título no ERP.\n- Transações bancárias sem título prévio correspondente permitem a criação imediata de despesa/receita direta com centro de custo.\n- Títulos conciliados não podem ser alterados ou excluídos sem antes ser realizado o desfazimento formal da conciliação.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador acessa a aba "Importação OFX/CNAB" e carrega o arquivo de extrato fornecido pelo banco.\n2. O motor analisa o arquivo, bloqueia duplicidades e cadastra as linhas de extrato pendentes.\n3. Na aba "Conciliação", o operador clica em "Auto Conciliar (Inteligência Huram)", vinculando automaticamente as transações com 100% de confiança.\n4. Para itens divergentes, realiza o matching manual selecionando a transação de extrato e o título no ERP.\n5. O saldo da conta bancária no sistema passa a refletir exatamente o saldo real do extrato.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `contas_bancarias`, `extratos_bancarios`, `financial_receivables`, `financial_payables`, `conciliacoes_bancarias`.\n- Hooks: `useRealtime` nas coleções de contas e extratos bancários.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Padrões bancários FEBRABAN para arquivos CNAB 240/400 e padrão Open Financial Exchange (OFX).\n- Integração com Contas a Receber e Contas a Pagar para baixa automática dos títulos após conciliação.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização de Contas: operadores com permissão `canViewFinancial(role)`.\n- Importação de Arquivos e Efetivação de Conciliação: restrita a analistas financeiros seniores e tesouraria.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenBancosConciliacao`, `Tabs`, `Table`, `ExportActions`, `Badge`, `Button`.\n- Serviços: `@/services/financial` e motor de conciliação bancária.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Rejeição de arquivos com formato inválido ou corrompido com mensagem clara.\n- Destaque em vermelho para diferenças de centavos entre o valor de extrato e valor do título.',
    },
  },

  // -------------------------------------------------------------
  // 5. PLANEJAMENTO E GESTÃO
  // -------------------------------------------------------------
  '/admin/financeiro/planejamento-gestao': {
    route: '/admin/financeiro/planejamento-gestao',
    title: 'Planejamento e Gestão',
    moduleGroup: 'Financeiro',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover a governança e inteligência orçamentária do ERP, integrando Orçamento Empresarial (Previsto × Realizado), Fluxo de Caixa Projetado integrado à provisão de folha do RH/DP, DRE Gerencial analítica e sintética, análise de rentabilidade, simulação de cenários econômicos e fechamento mensal com trava de competência.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 7 Abas Internas estruturadas:\n  1. "Orçamento (Previsto × Realizado)": acompanhamento por centro de custo e conta contábil, desvios percentuais e semáforo de estouro orçamentário;\n  2. "Fluxo de Caixa Projetado": visão diária, semanal e mensal de saldo inicial, entradas previstas, saídas compromissadas e provisões do DP, projetando saldo final acumulado com identificação de déficits;\n  3. "DRE Gerencial": Demonstração do Resultado do Exercício com Receita Bruta, Deduções, Receita Líquida, Custos Variáveis (CPV), Margem de Contribuição, Despesas Fixas, EBITDA e Lucro Líquido;\n  4. "Rentabilidade": margem de lucro por linha de negócio, canal de venda e centro de resultado;\n  5. "Cenários e Simulações": modelagem de cenários Otimista, Base e Pessimista com aplicação de estresse em receitas (-10% a -30%) e custos;\n  6. "Fechamento Mensal": checklist auditável de encerramento contábil/financeiro com bloqueio de movimentações retroativas;\n  7. "Relatórios": central de relatórios executivos com exportação e agendamento.\n- Exportação para Excel e PDF via `ExportActions`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Centros de custo que atingem 100% do orçamento aprovado emitem alerta amarelo; desvios acima de 110% bloqueiam novas requisições de compra sem aprovação extraordinária da diretoria.\n- O cálculo da DRE adota o regime de competência para análise de resultado e regime de caixa para o Fluxo de Caixa Projetado.\n- O fechamento mensal trava a competência financeira impedindo inclusão, edição ou cancelamento de lançamentos na data encerrada.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A diretoria e controladoria acessam a tela para acompanhar a evolução do DRE e fluxo projetado.\n2. Na aba "Orçamento", analisam os desvios entre orçado e realizado de cada setor.\n3. Na aba "Cenários", simulam o impacto de variações cambiais ou quebras de safra/vendas no caixa futuro.\n4. Ao término do mês, executam o checklist na aba "Fechamento Mensal" e ativam a trava de segurança da competência.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `financial_budget`, `financial_receivables`, `financial_payables`, `contas_bancarias`, `financial_closings`, `centros_custos`.\n- Dados cruzados com folha de pagamento do Departamento Pessoal (`dp_payroll`).',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Departamento Pessoal (DP) para incorporação das provisões de salários, encargos, 13º e férias no fluxo projetado.\n- Conexão com o módulo de Controladoria e Contabilidade para apuração contábil oficial e conciliação do DRE.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Consulta de Orçamento: gestores de centro de custo para suas respectivas áreas.\n- Visualização de DRE, Fechamento de Mês e Cenários: restrito a Diretoria, Controladoria e Gerência Financeira (SUP, ADMIN, FINANCEIRO).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenPlanejamentoGestao`, `Tabs`, `Table`, `ExportActions`, `Card`.\n- Serviços: `@/services/financial` e `financial-advanced-service.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento de divisão por zero em margens de contribuição quando receita líquida é nula.\n- Notificação impeditiva ao tentar encerrar o mês com conciliações bancárias pendentes.',
    },
  },

  // -------------------------------------------------------------
  // 6. CONFIGURAÇÕES FINANCEIRAS
  // -------------------------------------------------------------
  '/admin/financeiro/configuracoes-financeiras': {
    route: '/admin/financeiro/configuracoes-financeiras',
    title: 'Configurações Financeiras',
    moduleGroup: 'Financeiro',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar em tela única a parametrização e manutenção dos 9 cadastros mestres e regras do módulo Financeiro: Contas Bancárias, Formas e Condições de Pagamento, Plano de Contas Gerencial, Centros de Custo, Regras de Juros e Multa, Parâmetros da Régua de Cobrança, Matriz de Alçadas de Pagamento, Integrações de Gateways e Alertas Críticos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 9 Abas Internas estruturadas:\n  1. "Contas Bancárias": CRUD das contas da empresa com agência, conta, convênio bancário e código do cedente;\n  2. "Formas e Condições": cadastro de formas (Boleto, PIX, Cartão, Transferência, Cheque) e condições de parcelamento (À Vista, 30DD, 30/60/90, etc.) com taxas de juros embutidas;\n  3. "Plano de Contas": árvore hierárquica das contas de receitas, custos, despesas operacionais e financeiras;\n  4. "Centros de Custo": estrutura de centros de custo e de resultado com código e responsável;\n  5. "Regras de Juros": parametrização percentual de multa por atraso, juros moratórios mensais e dias de carência tolerados;\n  6. "Parâmetros de Cobrança": modelos de mensagens (WhatsApp, E-mail, SMS) e prazos de acionamento da régua de cobrança;\n  7. "Alçadas de Pagamento": matriz de faixas de valor e níveis hierárquicos requeridos para autorização de desembolsos;\n  8. "Integrações": configuração de credenciais de bancos, chaves de API de PIX e adquirentes de cartão;\n  9. "Alertas": parametrização do limite de detecção antiduplicidade e notificações de saldo mínimo em conta.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Contas do Plano de Contas de nível sintético não recebem lançamentos diretos, apenas contas analíticas.\n- A exclusão de centro de custo ou conta contábil é bloqueada caso existam títulos vinculados com histórico ativo.\n- As faixas da matriz de alçadas não podem conter lacunas ou sobreposições de valores.\n- Credenciais de bancos e gateways são criptografadas e protegidas por segregação de acesso.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador financeiro acessa a tela para parametrizar ou ajustar cadastros básicos.\n2. Na aba desejada, cria ou edita os registros com validação em tempo real.\n3. Ao salvar, as novas regras passam a vigorar imediatamente para todos os novos títulos e rotinas operacionais.\n4. Altera modelos da régua de cobrança e alçadas sem necessidade de deploys de código.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `contas_bancarias`, `formas_pagamento`, `condicoes_pagamento`, `plano_contas`, `centros_custos`, `financial_settings`, `financial_tiers`.\n- Persistência direta via serviços `@/services/financial`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Fornece as tabelas de domínio mestres para todos os subsistemas financeiros (Receber, Pagar, Bancos, Orçamento) e Comercial (condições de faturamento de pedidos).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso e Edição: restrita a Administradores e Gerentes Financeiros com permissão `canViewConfiguracoes(role)` ou `canViewFinancial(role)` de nível executivo (SUP, ADMIN, GESTOR_FINANCEIRO).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenConfiguracoesFinanceiras`, `Tabs`, `Table`, `Dialog`, `Input`, `Switch`.\n- Serviços: `finGetList`, `finCreate`, `finUpdate`, `finDelete` de `@/services/financial`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de campos obrigatórios (código contábil, nome da conta, agência) com aviso visual.\n- Alerta impeditivo de integridade referencial ao tentar deletar entidades em uso.',
    },
  },

  // -------------------------------------------------------------
  // 7. CONFIGURAÇÃO CNAB
  // -------------------------------------------------------------
  '/admin/financeiro/cnab-configuracoes': {
    route: '/admin/financeiro/cnab-configuracoes',
    title: 'Configuração CNAB',
    moduleGroup: 'Financeiro',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Parametrizar e manter os convênios bancários multitenant FEBRABAN para geração de remessa e processamento de retornos nos padrões CNAB 240 e CNAB 400 por empresa e filial.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro completo de convênios por banco FEBRABAN (Banco do Brasil 001, Santander 033, Caixa 104, Bradesco 237, Itaú 341, Sicredi 748, Sicoob 756 e outros);\n- Definição do layout padrão (CNAB 240 como padrão recomendado e CNAB 400 para bancos legados);\n- Configuração de agência, conta, dígitos verificadores, carteira, variação de carteira, código do convênio e código do cedente/beneficiário;\n- Modalidade de cobrança: Boleto, PIX ou Híbrido com chave PIX do recebedor;\n- Ambiente operacional (Homologação ou Produção);\n- Parâmetros financeiros: percentual de multa por atraso, juros de mora diários, prazo de baixa/devolução e dias de protesto;\n- Instruções padrão impressas no boleto e controle automático do sequencial de remessa por convênio;\n- Listagem analítica via JetroTable com filtros, ordenação e exportação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A criação e alteração de convênios exige obrigatoriamente código do banco, agência, conta, carteira, convênio e código do cedente (validado no hook de backend);\n- Cada convênio controla seu próprio sequencial estrito de arquivo de remessa, incrementado automaticamente após cada geração bem-sucedida;\n- Respeita o isolamento multiempresa e permissões de acesso do ERP.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor financeiro acessa a tela e clica em "Novo Convênio".\n2. Preenche os dados fornecidos pelo banco (agência, conta, convênio, carteira, cedente e instruções).\n3. Define se a cobrança será CNAB 240 ou 400 e se terá suporte a PIX híbrido.\n4. Ao salvar, a configuração fica disponível para o módulo de Remessas CNAB.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleção PocketBase `cnab_configs` com controle de RLS multiempresa.\n- Banco de códigos FEBRABAN oficial.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com os módulos de Remessa CNAB (`cnab_remessas`) e Retorno CNAB (`cnab_retornos`).',
    },
    permissions: {
      title: 'Permissões',
      content: '- Visualização e edição: SUP, ADMIN e gestores do Financeiro.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCnabConfiguracoes`, `JetroTable`, `Dialog`, `Select`, `Input`, `Switch`.\n- Serviços: `CnabService` e `@/lib/cnab/types`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação visual de campos obrigatórios e bloqueio de exclusão em caso de falha de conexão.',
    },
  },

  // -------------------------------------------------------------
  // 8. REMESSA CNAB
  // -------------------------------------------------------------
  '/admin/financeiro/cnab-remessas': {
    route: '/admin/financeiro/cnab-remessas',
    title: 'Remessa CNAB',
    moduleGroup: 'Financeiro',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerar arquivos de remessa bancária no padrão FEBRABAN CNAB 240 e CNAB 400 para registro de cobrança junto aos bancos homologados, garantindo a unicidade e auditoria dos títulos enviados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Seleção de títulos em aberto de `financial_receivables` com filtros avançados por cliente, documento e período de vencimento;\n- Geração de arquivo CNAB 240: Header de Arquivo (0), Header de Lote (1), Segmento P (título), Segmento Q (sacado), Segmento R (multa/juros), Trailer de Lote (5) e Trailer de Arquivo (9) rigorosamente alinhados em 240 colunas;\n- Geração de arquivo CNAB 400: Registro 0 (Header), Registro 1 (Detalhe) e Registro 9 (Trailer) rigorosamente alinhados em 400 colunas;\n- Download automático imediato do arquivo .REM com nomenclatura sequencial padrão;\n- Histórico completo de lotes gerados na coleção `cnab_remessas` com checksum sha256 simples, quantidade e valor total dos títulos;\n- Cancelamento de lote de remessa com liberação automática dos títulos para novo envio;\n- Abas "Gerar Remessa" e "Histórico de Lotes" com JetroTable completa.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Unicidade estrita: títulos já remetidos em lote ativo (não cancelado) não podem ser reenviados;\n- Títulos liquidados (status "Recebido" ou "Pago") ou cancelados são bloqueados para envio (validado no hook de backend);\n- A geração incrementa automaticamente o sequencial do convênio bancário e gera registro na trilha imutável de auditoria (`audit_logs`);\n- O CNAB não altera o valor do título nem interfere no fluxo fiscal/faturamento.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador seleciona o convênio bancário desejado.\n2. Filtra os recebíveis por vencimento ou cliente e marca os títulos a serem remetidos.\n3. Clica em "Gerar Remessa (.REM)".\n4. O sistema valida as regras no backend, cria o registro do lote, incrementa o sequencial e inicia o download do arquivo .REM.\n5. O operador transmite o arquivo pelo internet banking da instituição financeira.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `financial_receivables`, `cnab_configs`, `cnab_remessas` e `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Conexão direta com o Contas a Receber (`financial_receivables`) e Trilha de Auditoria do Huram ERP.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Visualização e emissão: Administradores e Operadores Financeiros autorizados.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCnabRemessas`, `JetroTable`, `Tabs`, `Dialog`.\n- Geradores: `generateCnab240Remessa` e `generateCnab400Remessa`.\n- Serviço: `CnabService`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Rejeição de títulos em duplicidade com mensagem explicativa informando o lote ativo;\n- Bloqueio se o convênio bancário estiver com dados cadastrais incompletos.',
    },
  },

  // -------------------------------------------------------------
  // 9. RETORNO CNAB
  // -------------------------------------------------------------
  '/admin/financeiro/cnab-retornos': {
    route: '/admin/financeiro/cnab-retornos',
    title: 'Retorno CNAB',
    moduleGroup: 'Financeiro',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Processar arquivos de retorno bancário (.RET / .TXT), decodificar ocorrências de liquidação, baixa e rejeição, conferir valores e liquidar automaticamente recebíveis compatíveis através do fluxo oficial de baixa do ERP.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Upload de arquivos de retorno nos padrões CNAB 240 (segmentos T e U) e CNAB 400 (registro 1);\n- Parser automático com identificação do layout, banco e decodificação de ocorrências (Liquidação, Baixa Simples, Devolução, Rejeição com motivos decodificados, Liquidação em Cartório, Abatimentos e Descontos);\n- Conferência lado a lado entre o registro bancário e o título em aberto no sistema (por número do título ou nosso número);\n- Classificação automática de conferência: Compatível, Divergente, Já Liquidado ou Não Localizado;\n- Ação "Baixar compatíveis": aplica a baixa utilizando exatamente o fluxo oficial de recebimento de `financial_receivables` com data de pagamento, valor pago, juros e descontos;\n- Bloqueio preventivo: divergências de valor e títulos não localizados não sofrem baixa automática;\n- Histórico de arquivos processados com auditoria de baixas, pendências e checksum.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O retorno bancário não é fonte de verdade unilateral: títulos com divergência de valor permanecem abertos para conferência manual;\n- A liquidação reutiliza o mesmo caminho de baixa do Contas a Receber existente, preservando integrações contábeis e tesouraria;\n- Todo arquivo processado gera registro imutável em `cnab_retornos` e aciona trilha em `audit_logs`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador faz upload do arquivo .RET baixado do internet banking.\n2. O parser analisa os registros e apresenta a conferência de cada ocorrência.\n3. O operador analisa o painel de divergências e clica em "Baixar Compatíveis".\n4. Os títulos compatíveis são liquidados no sistema e o histórico de processamento é arquivado.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Arquivos de retorno bancário (.RET / .TXT).\n- Coleções PocketBase: `financial_receivables`, `cnab_retornos`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Fluxo nativo de baixa do Contas a Receber (`financial_receivables`), conciliação bancária e trilha de auditoria corporativa.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Consulta e Liquidação: restrito a usuários do grupo Financeiro e Administradores.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCnabRetornos`, `JetroTable`, `Tabs`, `Dialog`.\n- Parsers: `parseCnab240Retorno` e `parseCnab400Retorno`.\n- Serviço: `CnabService`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Detecção de arquivos corrompidos ou com layout inválido com notificação imediata;\n- Isolamento de erros na liquidação de títulos individuais sem interromper os demais.',
    },
  },
}

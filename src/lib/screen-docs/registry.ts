import type { ScreenDocEntry } from './types'
import { DP_SCREEN_DOCS } from './dp-screens'
import { RH_SCREEN_DOCS } from './rh-screens'
import { SST_SCREEN_DOCS } from './sst-screens'
import { CADASTROS_SCREEN_DOCS } from './cadastros-screens'
import { FINANCIAL_SCREEN_DOCS } from './financial-screens'
import { INDUSTRY_SCREEN_DOCS } from './industry-screens'
import { LOGISTICS_SCREEN_DOCS } from './logistics-screens'
import { STOCK_SCREEN_DOCS } from './stock-screens'
import { FISCAL_SCREEN_DOCS } from './fiscal-screens'
import { COMMERCIAL_SCREEN_DOCS } from './commercial-screens'
import { MARKETING_SCREEN_DOCS } from './marketing-screens'
import { INTELIGENCIA_SCREEN_DOCS } from './inteligencia-screens'
import { CONTROLADORIA_SCREEN_DOCS } from './controladoria-screens'
import { IA_SCREEN_DOCS } from './ia-screen-docs'

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
  // PEDIDO DE VENDA (FLUXO PADRONIZADO E PAINEL OFICIAL)
  // -------------------------------------------------------------
  '/admin/vendas/pedidos': {
    route: '/admin/vendas/pedidos',
    title: 'Pedido de Venda',
    moduleGroup: 'Comercial',
    docVersion: '2.0.0',
    lastUpdated: '2026-11-05',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Controlar o ciclo de vida completo dos pedidos de venda do ERP HURAM em arquitetura Master-Detalhe com esteira operacional oficial: rascunho → confirmação (provisão financeira e reserva de estoque) → separação → liberação de faturamento → faturamento definitivo ou cancelamento/estorno.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Arquitetura Master-Detalhe: Cabeçalho com métricas em tempo real (Total de Pedidos, Pendentes Faturamento, Pendentes Liberação, Faturados, Cancelados e Valor Total).\n- Filtros Rápidos por Status: Pendente Faturamento (confirmado/separado/liberado), Pendente Liberação (confirmado/separação), Faturado, Cancelado ou Todos.\n- Tabela Master JetroTable com seleção única ou múltipla por intervalo/checkbox, busca por cliente e número, e paginação completa.\n- Painel de Detalhes dos Itens: Ao clicar ou selecionar um pedido, visualização dos itens em tabela detalhada (código, produto, quantidade, unidade, preço unitário, desconto, subtotal e reserva de estoque).\n- Ações Operacionais Conectadas ao Serviço sales-invoicing-flow: Confirmar Pedido (com provisão financeira e reserva de estoque), Confirmar Separação (com validação de saldo físico/lote), Liberar Faturamento (encaminha para a Central de Faturamento) e Cancelar Pedido (com estorno integral de reservas e provisões).\n- Execução em Lote: Capacidade de aplicar ações a múltiplos pedidos selecionados com relatório de sucessos e falhas.\n- Edição e Novo Pedido: Abertura do editor padrão HURAM para cadastro de novos pedidos e alteração de rascunhos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Ciclo de Vida Oficial: Rascunho → Confirmado → Em Separação / Separado → Liberado para Faturamento → Faturado (ou Cancelado). Todas as transições são intermediadas pelo serviço centralizado `sales-invoicing-flow.ts` (sem lógica inline duplicada).\n- Confirmação do Pedido: Efetua a reserva no estoque físico da empresa faturadora e cria a provisão preventiva no módulo financeiro.\n- Confirmação de Separação: Valida a disponibilidade física dos lotes e produtos antes da expedição.\n- Liberação de Faturamento: Torna o pedido elegível na Central de Faturamento (/admin/vendas/faturamento).\n- Cancelamento: Realiza o estorno atômico de reservas de estoque e estorno de títulos provisionados no financeiro.\n- Pedidos já Faturados ou Cancelados possuem suas ações operacionais bloqueadas para evitar duplicidade ou inconsistência fiscal.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Operador visualiza a lista master de pedidos na rota `/admin/vendas/pedidos` com filtros por status.\n2. Clica em um pedido para inspecionar os itens no painel detalhe inferior.\n3. Aciona as ações da esteira: "Confirmar Pedido" → "Confirmar Separação" → "Liberar Faturamento".\n4. Com o pedido liberado, o processo segue para emissão da NF-e na Central de Faturamento `/admin/vendas/faturamento`.\n5. Em caso de desistência ou desacordo comercial, o operador aciona "Cancelar Pedido" que desfaz reservas e provisões.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `sales_order_items`, `partners` (clientes), `products`, `users`, `stock_reservations`, `financial_entries`.\n- Migração `0310_sales_invoicing_redesign.js` com colunas de esteira de faturamento e auditoria.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Serviço central: `src/services/sales-invoicing-flow.ts`.\n- Central de Faturamento `/admin/vendas/faturamento` para emissão fiscal.\n- Módulo de Estoque (reservas e baixas) e Módulo Financeiro (provisões e títulos).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso comercial controlado por `canViewSales(role)` (perfis SUP, COMERCIAL, Vendedor, DIRETORIA). Ações de cancelamento e liberação requerem perfil comercial autorizado.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SalesOrdersPage`, `JetroTable`, `SalesOrderStandardEditor`, `sales-page-wrapper`.\n- Serviços: `sales-invoicing-flow`, `sales`, `products`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Diálogos de confirmação com validação de status antes de disparar qualquer transição.\n- Notificações de toast para respostas de sucesso e mensagens claras em caso de saldo insuficiente de estoque ou cliente bloqueado.',
    },
  },

  // -------------------------------------------------------------
  // CENTRAL DE FATURAMENTO (EMISSÃO E GESTÃO DE NF-E)
  // -------------------------------------------------------------
  '/admin/vendas/faturamento': {
    route: '/admin/vendas/faturamento',
    title: 'Central de Faturamento',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-11-05',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar a fila de pedidos de venda liberados para faturamento, permitindo a geração oficial de notas fiscais eletrônicas (NF-e modelo 55), baixa definitiva de estoque, conversão de provisões financeiras em títulos reais a receber e emissão/download do DANFE via Focus NFe.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Fila de Pedidos Liberados: Tabela dedicada exibindo exclusivamente os pedidos com status "liberado_faturamento" e "faturado_parcial".\n- Painel Detalhe do Pedido Selecionado: Inspeção imediata dos itens, valores unitários, CFOPs associados, cliente e impostos previstos.\n- Ação "Faturar Pedido": Disparo seguro da operação `invoiceOrder` no serviço `sales-invoicing-flow`, gerando o registro oficial de NF-e vinculado ao pedido de origem, convertendo a provisão financeira em contas a receber real e efetuando a baixa de estoque.\n- Faturamento em Lote: Capacidade de faturar múltiplos pedidos selecionados sequencialmente.\n- Histórico de Notas Emitidas: Tabela com número da NF-e, série, chave de acesso, status da transmissão (homologação/produção/autorizada), valor total e pedido referenciado.\n- Ações sobre a Nota: Visualização completa do espelho da NF-e e botão de Impressão / Download de DANFE em PDF integrado ao Focus NFe e ao backend HURAM.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Apenas pedidos previamente liberados na esteira operacional podem ser faturados.\n- O faturamento cria obrigatoriamente a NF referenciando o pedido de origem (sales_order_id e order_number no registro fiscal).\n- Títulos a receber são criados automaticamente a partir das condições de pagamento do pedido e a provisão é liquidada.\n- O estoque é baixado em definitivo, consumindo a reserva efetuada na etapa de confirmação.\n- A transmissão de NF-e utiliza o provedor homologado Focus NFe conforme configurações por empresa (`fiscal_focus_nfe_config`).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O faturista acessa a Central de Faturamento na rota `/admin/vendas/faturamento`.\n2. Visualiza os pedidos liberados pelo setor de expedição/comercial.\n3. Seleciona o pedido desejado e confere os itens e totais na tabela de detalhes.\n4. Clica no botão "Faturar Pedido" e confirma a operação no diálogo informativo.\n5. O sistema gera a nota fiscal, atualiza o pedido para "faturado", grava as duplicatas e disponibiliza as ações de Visualizar Nota e Imprimir DANFE.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `sales_order_items`, `invoices`, `fiscal_focus_nfe_config`, `financial_receivables`.\n- Migração `0310_sales_invoicing_redesign.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Serviço central `sales-invoicing-flow.ts` para orquestração fiscal/estoque/financeiro.\n- Focus NFe API (pb_hooks) para autorização e DANFE em PDF.\n- Rota vinculada ao menu lateral Comercial em ordem alfabética.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Restrito a operadores autorizados do setor fiscal e comercial via política `canViewSales(role)` e `canEmitNfe`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `InvoicingPage`, `JetroTable`, `sales-page-wrapper`.\n- Serviços: `sales-invoicing-flow`, `nfe-transmission`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de inconsistências cadastrais ou tributárias antes da emissão.\n- Notificação de toast em caso de indisponibilidade de comunicação com o provedor Focus NFe.',
    },
  },

  // -------------------------------------------------------------
  // PEDIDO DE COMPRA (FLUXO PADRONIZADO E PAINEL OFICIAL)
  // -------------------------------------------------------------
  '/admin/compras/pedidos': {
    route: '/admin/compras/pedidos',
    title: 'Pedido de Compra',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar a gestão e emissão dos pedidos de compra a fornecedores do ERP HURAM através de painel com listagem, busca, importação de planilhas e editor padronizado com governança orçamentária e alçadas de aprovação.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel de Pedidos: Listagem de pedidos de compra com busca textual por número e fornecedor, filtro por status, importação via planilha Excel e novo pedido.\n- Cabeçalho Padronizado: Exibição estruturada com número automático sequencial, empresa compradora, operação, datas de emissão e previsão de recebimento, situação, comprador responsável, dados do fornecedor oficial (CNPJ/contato) e condição de pagamento.\n- 6 Abas Padronizadas: 1. Dados Gerais (seleção do fornecedor homologado, comprador, cotação vinculada opcional e empresa/filial); 2. Produtos e Valores (grid de insumos/itens a adquirir com código, quantidade, unidade, preço negociado, desconto, subtotal e quadro de saldo pendente); 3. Financeiro (condição de pagamento, forma, descontos globais, frete previsto, outras despesas e notas de governança orçamentária); 4. Fiscal (enquadramento fiscal previsto com CFOP de entrada 1102/2102 e regime tributário); 5. Logística e Entrega (previsão de recebimento, local de entrega/docas e quadro de saldos pendentes para conferência física/fiscal); 6. Anexos e Histórico (instruções de compra, justificativas de alçada e histórico auditado de eventos).\n- Resumo Financeiro Fixo: Totalizadores consolidados de produtos, descontos, frete, despesas e valor total estimado, com monitoramento de orçamento disponível.\n- Barra de Ações: Ações contextualizadas por status (Salvar Rascunho, Validar, Enviar para Aprovação, Confirmar/Aprovar, Imprimir/PDF, Cancelar e Fechar).\n- Impressão e Relatório: Geração de espelho para conferência e envio ao fornecedor via janela de impressão formatada.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Fluxo Oficial de Status: Rascunho → Validado → Aguardando Aprovação → Aprovado → Enviado ao Fornecedor → Recebimento Parcial / Recebimento Total → Concluído. Transições registradas com histórico e validadas conforme o motor de regras e migração 0299.\n- Regras do Motor order-purchase-rules: Validação de fornecedor homologado; alçada de aprovação gerencial conforme valor limite (`approvalThreshold`); conferência de orçamento disponível; e controle de tolerância percentual contra cotação vinculada.\n- Preço Negociado NÃO Altera Custo Oficial: O preço acordado no Pedido de Compra reflete apenas a negociação comercial. O custo médio ponderado oficial do estoque só é apurado estritamente na entrada fiscal (`purchase_invoices`) via XML.\n- Não Geração de Obrigação Financeira Duplicada: A confirmação/aprovação do pedido de compra reserva orçamento interno, mas NÃO gera duplicatas definitivas no Contas a Pagar (título oficial gerado pela entrada da NF-e).\n- Saldo Pendente por Item: Monitoramento automático de quantidade solicitada vs. quantidade recebida para suporte à conferência física e recebimento parcial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Comprador acessa `/admin/compras/pedidos` no menu Comercial.\n2. Cria novo pedido ou importa itens via planilha, associando o fornecedor homologado.\n3. Informa quantidades e preços negociados; o sistema calcula totais e monitora saldos pendentes.\n4. Ao acionar "Validar", o motor confere itens e alçadas; pedidos acima do teto de autoaprovação são encaminhados para "Aguardando Aprovação".\n5. Com status "Aprovado" / "Enviado ao Fornecedor", o pedido aguarda a chegada da mercadoria para conferência física e importação fiscal em Compras e Entradas.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `purchase_orders`, `suppliers`, `products`, `users`, `purchasing_parameters`.\n- Esquema aditivo de campos e saldos pendentes via migração `0299_standardized_orders_evolution.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Motor de regras de compra: `src/lib/order-purchase-rules.ts`.\n- Importador de planilhas: `src/components/purchasing/purchase-order-import-dialog.tsx`.\n- Módulo Fiscal (Compras e Entradas - `/admin/fiscal/compras-entradas`) para conferência e importação definitiva do XML da NF-e.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controlada pela política de compras e suprimentos `canViewPurchasing(role)` ou `canViewSales(role)` (perfis SUP, COMPRADOR, COMERCIAL, DIRETORIA). Aprovações de alçada restritas a gestores de compras.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `PurchaseOrdersPanel`, `PurchaseOrderStandardEditor`, `PurchaseOrderImportDialog`, `StandardOrderHeader`, `StandardOrderSummary`, `StandardOrderActions`.\n- Utilitários: `order-purchase-rules`, `purchasing-types`, `services/purchasing`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Mensagens impeditivas de erro quando fornecedor não for informado ou itens tiverem quantidades/preços inválidos.\n- Alertas informativos de estouro de alçada ou divergência de cotação.\n- Notificações de toast para sucesso ou falha em operações assíncronas.',
    },
  },

  // -------------------------------------------------------------
  // CENTRAL DE APROVAÇÕES DE PEDIDOS (NOVA TELA v0.0.651)
  // -------------------------------------------------------------
  '/admin/aprovacoes/pedidos': {
    route: '/admin/aprovacoes/pedidos',
    title: 'Central de Aprovações de Pedidos',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar a governança, análise de crédito, alçadas hierárquicas e fluxo de liberação ou rejeição de pedidos de Venda e Compra pendentes de aprovação no ERP HURAM.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Fila Unificada de Aprovações: Painel operacional com pedidos de Venda e Compra em estágio "Aguardando Aprovação", totalizadores de quantidade e valor em tempo real, e filtros por tipo (Venda/Compra), empresa e valor.\n- Cartão de Alçada Conectada: Exibição da faixa de alçada máxima do usuário logado (definida na matriz `order_approval_tiers` ou SUP irrestrito) e status de permissão para liberação de crédito.\n- Inspeção e Detalhes do Pedido: Modal com dados da contraparte (cliente/fornecedor), itens, valores, motivos de retenção (estouro de desconto, limite de crédito, margem de contribuição ou teto de compra) e histórico interno.\n- Ação de Aprovação: Liberação do pedido dentro do teto de alçada do perfil com registro de notas de governança, transição de status (Venda → "Confirmado", Compra → "Aprovado") e reserva de estoque.\n- Ação de Rejeição: Cancelamento do pedido com obrigatoriedade estrita de justificativa detalhada e transição para "Cancelado".\n- Trilha de Auditoria e Histórico: Exibição da linha do tempo das decisões em `order_approval_records` e registro sincronizado em `audit_logs`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Matriz de Alçadas Hierárquicas: A aprovação é estritamente condicionada ao teto de valor configurado na coleção `order_approval_tiers` para o perfil do usuário (ou teto padrão de sistema), salvo Superusuário (SUP) com alçada irrestrita.\n- Segregação de Funções: O usuário solicitante (vendedor ou comprador responsável) é estritamente impedido de aprovar seu próprio pedido, prevenindo conflito de interesses.\n- Isolamento Multiempresa: Pedidos pertencentes a outra empresa do grupo não podem ser aprovados por operadores de filial distinta, exceto perfil SUP.\n- Justificativa Obrigatória na Rejeição: Nenhuma rejeição é processada sem preenchimento de motivo formal, gravado de forma imutável no pedido e na trilha auditável.\n- Transição e Efeitos Automáticos: Pedidos de venda aprovados recebem marcação de reserva de estoque (`stock_reserved = true`) e transição para "Confirmado"; pedidos de compra avançam para "Aprovado".',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Pedidos com estouro de desconto, margem insuficiente, limite de crédito excedido ou valor acima do teto de autoaprovação entram na fila com status "Aguardando Aprovação".\n2. O gestor acessa `/admin/aprovacoes/pedidos` no menu Comercial e localiza os pedidos pendentes.\n3. Aciona "Inspecionar" para avaliar motivos de retenção, dados do parceiro e trilha prévia.\n4. Aciona "Aprovar" (com notas opcionais) ou "Rejeitar" (com motivo obrigatório).\n5. O backend valida alçada, segregação de funções e isolamento da empresa via hook `order_approval_process.js`, atualiza o pedido, registra em `order_approval_records` e `audit_logs`, e emite notificação ao solicitante.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `purchase_orders`, `order_approval_tiers`, `order_approval_records`, `audit_logs`, `notifications`, `users`.\n- Estrutura de alçadas e trilha criada pela migração `0304_order_approvals_engine.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Endpoint seguro de aprovação: `POST /backend/v1/orders/approval/action` via hook `order_approval_process.js`.\n- Serviço de frontend: `src/services/order-approvals.ts`.\n- Sistema de notificações do ERP HURAM para aviso em tempo real ao solicitante.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização da fila disponível para perfis com permissão comercial ou de compras (`canViewSales(role)` / `canViewPurchasing(role)`).\n- Ações de aprovação e rejeição exigem perfil SUP, DIRETORIA, FINANCEIRO, COMERCIAL ou gestão com alçada ativa em `order_approval_tiers`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `OrderApprovalsPage`, `OrderApprovalsHubScreen`, `SalesPageWrapper`.\n- Serviços e tipos: `src/services/order-approvals.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio com erro 403 caso o valor do pedido exceda a alçada do aprovador.\n- Bloqueio com erro 403 em tentativa de autoaprovação pelo solicitante.\n- Validação impeditiva de motivo vazio na rejeição no frontend e no backend.\n- Notificações de toast para respostas de gravação e tratamento resiliente de erros de rede.',
    },
  },

  // -------------------------------------------------------------
  // GESTÃO INTERNA PORTAL B2B - APROVAÇÃO DE ACESSOS (v0.0.658 / v0.0.659)
  // -------------------------------------------------------------
  '/admin/b2b/acessos': {
    route: '/admin/b2b/acessos',
    title: 'Portal B2B • Central de Aprovação de Acessos',
    moduleGroup: 'Portal B2B',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Analisar, aprovar ou rejeitar solicitações de acesso ao Portal B2B submetidas por novos clientes no auto-cadastro público, vinculando o cadastro a um parceiro existente ou criando novo parceiro no ERP.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Visualização de solicitações de acesso B2B pendentes, aprovadas e rejeitadas.\n- Comparador de dados da solicitação com parceiros existentes do HURAM por CNPJ/Razão Social.\n- Seletor inteligente de parceiro no modal de aprovação com opção de vincular a cliente existente ou cadastrar novo parceiro.\n- Configuração imediata da flag `exibir_limite_credito` no momento da aprovação.\n- Rejeição fundamentada com registro de justificativa comercial.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Decisão 1: Clientes cadastrados na página pública que não possuem aprovação prévia permanecem com status pendente e visualizam estritamente a tela "Cadastro em Análise" até que esta deliberação seja concluída.\n- Decisão 3: Por padrão a flag `exibir_limite_credito` nasce desmarcada, garantindo que o cliente não veja limite de crédito a menos que expressamente autorizado.\n- A aprovação ativa o registro de autenticação em `clients` e sincroniza o campo `b2b_status = "ativo"` em `partners`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Cliente envia auto-cadastro na página pública `/portal/cadastro`.\n2. A solicitação é gravada em `b2b_access_requests` e notifica os gestores.\n3. O operador do HURAM abre `/admin/b2b/acessos`, revisa a solicitação e clica em Aprovar.\n4. Seleciona o parceiro correspondente do ERP, define se exibirá limite de crédito e confirma.\n5. O status é alterado para "aprovado" e o cliente tem acesso imediato liberado.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `b2b_access_requests`, `partners`, `clients`, `audit_logs`, `notifications`.\n- Estrutura consolidada pela migração `0306_b2b_access_approval_engine.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Endpoints de aprovação: `POST /backend/v1/b2b/admin/approve-access` e `GET /backend/v1/b2b/admin/access-requests` via hook `b2b_portal_endpoints.js`.\n- Integração com o cadastro mestre de parceiros (`partners`).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso exclusivo a operadores internos do ERP com perfil SUP, COMERCIAL, FINANCEIRO ou gestão administrativa.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AdminB2BAccessRequestsScreen`, `Dialog`, `Select`, `Badge`, `Switch`, `Table`.\n- Serviço: `b2bService.adminApproveAccessRequest`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio impeditivo de aprovação sem parceiro selecionado ou rejeição sem motivo.\n- Notificações de erro via toast e tratamento resiliente de falhas de comunicação.',
    },
  },

  // -------------------------------------------------------------
  // GESTÃO INTERNA PORTAL B2B - CLIENTES (NOVA TELA v0.0.658)
  // -------------------------------------------------------------
  '/admin/b2b/clientes': {
    route: '/admin/b2b/clientes',
    title: 'Portal B2B • Gestão de Clientes e Governança de Crédito',
    moduleGroup: 'Portal B2B',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Controlar o acesso dos clientes corporativos ao Portal de Autosserviço B2B e gerenciar individualmente a flag de exibição de saldo e limite de crédito no portal.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem de parceiros comerciais cadastrados com filtro por Razão Social, CNPJ ou e-mail.\n- Alternador de status de acesso B2B (Ativar / Suspender acesso).\n- Controle de Governança de Crédito: interruptor individual para o campo `exibir_limite_credito` (por padrão desligado, atendendo à Decisão 3).\n- Exibição de limite cadastrado e limite disponível do ERP para conferência rápida pelo operador.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Decisão 3: Não exibir limite de crédito por padrão aos clientes no Portal B2B. Apenas quando a flag `exibir_limite_credito` for explicitamente ativada neste painel pelo usuário interno, o cliente passará a ver o saldo de crédito na área logada.\n- Bloqueio imediato do acesso B2B impede login e submissão de novos pedidos pelo cliente.\n- Toda alteração na flag de crédito ou no status de acesso gera log auditável em `audit_logs`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Operador comercial/financeiro acessa o menu lateral em Portal B2B → Clientes do Portal.\n2. Localiza o cliente pelo CNPJ ou Razão Social.\n3. Aciona a chave "Exibir Limite de Crédito" para liberar a visualização no portal após conferência cadastral.\n4. O backend atualiza o parceiro e emite auditoria imediata.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `partners`, `clients`, `audit_logs`.\n- Campos B2B e `exibir_limite_credito` definidos na migração `0305_portal_b2b_architecture.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Endpoints seguros: `POST /backend/v1/b2b/admin/toggle-credit-flag` e `POST /backend/v1/b2b/admin/toggle-client-status`.\n- Trilha de auditoria interna: `audit_logs`.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso restrito a usuários internos do ERP com permissão comercial ou administrativa (`canViewSales(role)` / `canManageConfiguracoes(role)` / SUP).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AdminB2BClientsScreen`, `Switch`, `Table`, `Badge`.\n- Serviços: `b2bService.adminToggleCreditFlag`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Notificações de toast para confirmação e reversão automática do switch em caso de falha de comunicação com o servidor.',
    },
  },

  // -------------------------------------------------------------
  // GESTÃO INTERNA PORTAL B2B - PEDIDOS (NOVA TELA v0.0.658)
  // -------------------------------------------------------------
  '/admin/b2b/pedidos': {
    route: '/admin/b2b/pedidos',
    title: 'Portal B2B • Pedidos Recebidos',
    moduleGroup: 'Portal B2B',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Monitorar todos os pedidos gerados pelos clientes corporativos no Portal de Autosserviço B2B e direcionar para o fluxo de deliberação na Central de Aprovações.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem em tempo real de pedidos de venda com canal "Portal B2B".\n- Exibição de número do pedido (formato B2B-AAAA-XXXX), cliente, CNPJ, data, valor total e status.\n- Atalho direto para deliberação na Central de Aprovações de Pedidos (/admin/aprovacoes/pedidos).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Decisão 2: O pedido montado pelo cliente entra diretamente no fluxo de aprovação existente do ERP, nascendo com status "Aguardando Aprovação".\n- Multitenancy preservado por empresa e filial da transação.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Cliente monta pedido no portal público B2B e finaliza a compra.\n2. O pedido é registrado no ERP com status "Aguardando Aprovação" e aparece nesta tela e na Central de Aprovações.\n3. O gestor visualiza os dados e aciona o fluxo de liberação ou cancelamento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `order_approval_records`, `partners`.\n- Criado na migração `0305_portal_b2b_architecture.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração nativa com a Central de Aprovações (`/admin/aprovacoes/pedidos`) e motor `order_approval_process.js`.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Usuários internos com acesso ao módulo comercial ou financeiro (`canViewSales(role)`).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AdminB2BOrdersScreen`, `Table`, `Badge`, `Button`.\n- Serviço: PocketBase `sales_orders`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento defensivo de conexão e indicação de lista vazia quando nenhum pedido foi emitido.',
    },
  },

  // -------------------------------------------------------------
  // PORTAL PÚBLICO B2B - AUTOSSERVIÇO DO CLIENTE (v0.0.658 / v0.0.659)
  // -------------------------------------------------------------
  '/portal/catalogo': {
    route: '/portal/catalogo',
    title: 'Portal B2B • Catálogo de Produtos e Preços',
    moduleGroup: 'Portal B2B (Cliente)',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Apresentar o catálogo comercial de produtos com preços de atacado B2B e permitir montagem de pedidos diretamente pelo cliente cadastrado e aprovado.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Busca e filtragem de produtos por categoria, código e nome.\n- Exibição de preços unitários B2B, lote mínimo e disponibilidade.\n- Adição e ajuste de quantidades no carrinho de compras corporativo.\n- Indicador de limite de crédito condicional (visível estritamente quando `exibir_limite_credito === true`).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Decisão 1: Clientes com cadastro pendente não têm acesso ao catálogo e são barrados no layout com aviso de "Cadastro em Análise".\n- Decisão 3: Nenhum limite de crédito é exibido a menos que a flag esteja marcada no parceiro.\n- Bloqueio de submissão para clientes inativos.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Cliente aprovado faz login em `/portal/login` e acessa o catálogo.\n2. Seleciona itens desejados e adiciona ao carrinho.\n3. Navega para `/portal/carrinho` para concluir a montagem do pedido de venda.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `products`, `clients`, `partners`.\n- Endpoint `GET /backend/v1/b2b/products`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- API B2B `/backend/v1/b2b/products` e contexto `useB2B()`.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Clientes B2B autenticados na coleção `clients` com status ativo.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `B2BCatalogScreen`, `B2BPortalLayout`, `Card`, `Badge`, `Button`.\n- Contexto: `B2BProvider`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Exibição de mensagem informativa caso o catálogo esteja vazio ou haja indisponibilidade de rede.',
    },
  },

  '/portal/carrinho': {
    route: '/portal/carrinho',
    title: 'Portal B2B • Carrinho e Fechamento de Pedido',
    moduleGroup: 'Portal B2B (Cliente)',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Permitir a conferência dos itens selecionados, inserção de dados de entrega e finalização do pedido de venda B2B integrado ao fluxo de aprovação do HURAM ERP.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem detalhada de itens com alteração de quantidade e remoção.\n- Cálculo automático de subtotal e valor bruto do pedido.\n- Preenchimento de endereço de entrega, forma de pagamento e observações.\n- Submissão direta para o motor de aprovação do ERP HURAM.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Decisão 2: O pedido é gravado em `sales_orders` com estágio "Aguardando Aprovação" e em `order_approval_records`, integrado à Central de Aprovações em `/admin/aprovacoes/pedidos` com notificação aos aprovadores internos.\n- O carrinho é esvaziado automaticamente após submissão bem-sucedida.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Cliente revisa itens no carrinho.\n2. Clica em "Finalizar Pedido B2B".\n3. O backend gera o número B2B-AAAA-XXXX, cria o registro em `sales_orders` e na fila de aprovações.\n4. O cliente é direcionado para a tela Meus Pedidos.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `order_approval_records`, `notifications`, `b2b_audit_trail`.\n- Endpoint `POST /backend/v1/b2b/orders/create`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor de aprovações do HURAM e Central de Aprovações de Pedidos.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Clientes B2B autenticados com status aprovado/ativo.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes: `B2BCartScreen`, `b2bService.createOrder`.\n- Contexto: `useB2B()`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação impeditiva de carrinho vazio e tratamento de respostas de falha com avisos claros ao cliente.',
    },
  },

  '/portal/pedidos': {
    route: '/portal/pedidos',
    title: 'Portal B2B • Meus Pedidos',
    moduleGroup: 'Portal B2B (Cliente)',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Permitir que o cliente corporativo acompanhe o status em tempo real de aprovação, faturamento e histórico de todos os pedidos realizados no Portal B2B.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem de pedidos de venda emitidos pelo cliente com paginação e ordenação decrescente por data.\n- Visualização de status de aprovação ("Aguardando Aprovação", "Aprovado", "Faturado", "Cancelado").\n- Detalhamento de itens, valores e histórico de deliberação do pedido.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Exibe apenas pedidos vinculados ao `client_id` ou `b2b_client_id` do usuário logado.\n- Status sincronizado diretamente com as deliberações ocorridas na Central de Aprovações do ERP.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Cliente acessa "Meus Pedidos" no menu superior do Portal B2B.\n2. Visualiza a lista de pedidos e clica em um registro para ver os detalhes da aprovação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase `sales_orders` via endpoint `GET /backend/v1/b2b/orders`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- API B2B `/backend/v1/b2b/orders` e sincronização com a Central de Aprovações.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Clientes B2B autenticados com status aprovado/ativo.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `B2BOrdersScreen`, `Table`, `Badge`, `Dialog`.\n- Serviço: `b2bService.listOrders`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento defensivo de conexão e exibição de mensagem acolhedora se ainda não houver pedidos emitidos.',
    },
  },
}

/**
 * Módulos agregados que compõem o catálogo completo do ERP Jetro / HURAM.
 */
const ALL_MODULE_DOCS: Record<string, ScreenDocEntry>[] = [
  SCREEN_DOCS_REGISTRY,
  DP_SCREEN_DOCS,
  RH_SCREEN_DOCS,
  SST_SCREEN_DOCS,
  CADASTROS_SCREEN_DOCS,
  FINANCIAL_SCREEN_DOCS,
  INDUSTRY_SCREEN_DOCS,
  LOGISTICS_SCREEN_DOCS,
  STOCK_SCREEN_DOCS,
  FISCAL_SCREEN_DOCS,
  COMMERCIAL_SCREEN_DOCS,
  MARKETING_SCREEN_DOCS,
  INTELIGENCIA_SCREEN_DOCS,
  CONTROLADORIA_SCREEN_DOCS,
  IA_SCREEN_DOCS,
]

/**
 * Mapa unificado de todas as telas registradas no ERP, indexadas por rota.
 */
const UNIFIED_DOCS_MAP: Record<string, ScreenDocEntry> = (() => {
  const map: Record<string, ScreenDocEntry> = {}
  for (const moduleDocs of ALL_MODULE_DOCS) {
    if (moduleDocs && typeof moduleDocs === 'object') {
      for (const [route, entry] of Object.entries(moduleDocs)) {
        map[route] = entry
      }
    }
  }
  return map
})()

/**
 * Cria uma entrada padrão para rotas cuja documentação técnica ainda está em levantamento.
 */
function createPendingDocEntry(route: string): ScreenDocEntry {
  const segments = route.split('/').filter(Boolean)
  const rawTitle = segments[segments.length - 1] || 'Visão Geral'
  const title = rawTitle
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const moduleName =
    segments.length > 1
      ? segments[1].charAt(0).toUpperCase() + segments[1].slice(1)
      : 'Administração'

  const pendingText = 'Pendente de validação técnica.'

  return {
    route,
    title,
    moduleGroup: moduleName,
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content: pendingText,
      pendingValidation: true,
    },
    features: {
      title: 'Funcionalidades',
      content: pendingText,
      pendingValidation: true,
    },
    businessRules: {
      title: 'Regras de Negócio',
      content: pendingText,
      pendingValidation: true,
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content: pendingText,
      pendingValidation: true,
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: pendingText,
      pendingValidation: true,
    },
    integrations: {
      title: 'Integrações',
      content: pendingText,
      pendingValidation: true,
    },
    permissions: {
      title: 'Permissões',
      content: pendingText,
      pendingValidation: true,
    },
    dependencies: {
      title: 'Dependências',
      content: pendingText,
      pendingValidation: true,
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: pendingText,
      pendingValidation: true,
    },
  }
}

/**
 * Retorna a especificação técnica de uma tela pela sua rota.
 * Se a rota não estiver mapeada, retorna um objeto estruturado marcado como "Pendente de validação técnica".
 */
export function getScreenDocByRoute(currentRoute: string): ScreenDocEntry {
  if (!currentRoute) {
    return createPendingDocEntry('/admin')
  }

  // Busca exata
  if (UNIFIED_DOCS_MAP[currentRoute]) {
    return UNIFIED_DOCS_MAP[currentRoute]
  }

  // Tenta remover barra final ou parâmetros de consulta
  const cleanRoute = currentRoute.split('?')[0].replace(/\/$/, '')
  if (UNIFIED_DOCS_MAP[cleanRoute]) {
    return UNIFIED_DOCS_MAP[cleanRoute]
  }

  // Fallback: busca por prefixo mais longo
  const matchingRoutes = Object.keys(UNIFIED_DOCS_MAP).filter((r) => cleanRoute.startsWith(r))
  if (matchingRoutes.length > 0) {
    matchingRoutes.sort((a, b) => b.length - a.length)
    return UNIFIED_DOCS_MAP[matchingRoutes[0]]
  }

  return createPendingDocEntry(cleanRoute || currentRoute)
}

/**
 * Retorna a lista completa de todas as especificações técnicas de telas registradas no ERP.
 */
export function getAllScreenDocs(): ScreenDocEntry[] {
  return Object.values(UNIFIED_DOCS_MAP)
}

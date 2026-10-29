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

    route: '/admin/vendas/pedidos',
    title: 'Pedido de Venda',
    moduleGroup: 'Comercial',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-20',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o ciclo de vida completo dos pedidos de venda do ERP HURAM através de editor padronizado e governança corporativa, garantindo validações de crédito, alçadas de desconto, controle de margem de contribuição e amarração fiscal por item.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cabeçalho Padronizado: Exibição estruturada com número automático sequencial, empresa faturadora, operação comercial, datas de emissão e entrega, situação cadastral, responsável/vendedor, dados completos do cliente (CNPJ/IE/contato), condição de pagamento e observações.\n- 6 Abas Padronizadas: 1. Dados Gerais (seleção do cliente oficial, vendedor, canal comercial, dados cadastrais e empresa/filial); 2. Produtos e Valores (grid de itens com produto, quantidade, unidade, estoque em tempo real, preço de tabela, preço unitário, desconto, acréscimo, custo médio somente leitura, margem % e subtotal); 3. Financeiro (condição de pagamento, forma de pagamento, tabela de preços, frete, seguro e outras despesas); 4. Fiscal (enquadramento CFOP predominante por item via motor fiscal ativo, destino estadual/interestadual e observações fiscais impressas na NF-e); 5. Logística e Entrega (previsão de entrega, modalidade de frete CIF/FOB, transportadora e endereço de entrega); 6. Anexos e Histórico (observações internas e trilha de auditoria completa com histórico de eventos e transições de status).\n- Resumo Financeiro Fixo: Totalizadores em tempo real de subtotal bruto, descontos, acréscimos, frete, seguro, despesas, valor total do pedido, margem estimada percentual e valor, e limite de crédito disponível do parceiro.\n- Barra de Ações: Botões de ação contextualizados por status (Salvar Rascunho, Validar, Enviar para Aprovação, Confirmar, Imprimir/PDF, Cancelar e Fechar).\n- Impressão e Relatório: Geração de documento de impressão formatado com cabeçalho HURAM, dados das partes, itens detalhados e totais financeiros.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Fluxo Oficial de Status: Rascunho → Validado → Aguardando Aprovação → Confirmado → Separação/Expedição → Faturado Parcialmente / Faturado Totalmente → Concluído. Transições registradas com histórico e validadas conforme o motor de regras e migração 0299.\n- Regras do Motor order-sales-rules: Verificação preventiva de limite de crédito, restrição financeira e bloqueio a prazo do cliente; validação de alçada de desconto máximo; verificação de margem mínima configurada; e alerta de estoque disponível insuficiente.\n- Custos Estritamente Somente Leitura: Os campos Custo Médio e Custo de Reposição são protegidos contra edição manual no pedido, refletindo os valores oficiais apurados pelo motor de estoque.\n- Resolução Fiscal Automática: CFOP determinado dinamicamente pelo motor fiscal (fiscalCfopService / determineCfop) com base na operação e UF de destino do cliente.\n- Rascunhos e Validações Inócuos: O pedido em estado Rascunho ou sob Validação não movimenta estoque nem fatura títulos financeiros.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Operador cria novo pedido de venda ou edita registro existente na rota `/admin/vendas/pedidos`.\n2. Seleciona o cliente oficial, cujos dados cadastrais, limite e condições são carregados automaticamente.\n3. Adiciona produtos com cálculo automático de preços de tabela, descontos, margens de contribuição e determinação de CFOP.\n4. Ao acionar "Validar", o motor avalia regras comerciais e de crédito; divergências de alçada encaminham o pedido para "Aguardando Aprovação".\n5. Com o pedido "Confirmado", a esteira libera o processo para separação, expedição e posterior faturamento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sales_orders`, `partners` (clientes), `products`, `users`, `price_tables`, `payment_conditions`, `payment_methods`, `carriers`.\n- Esquema aditivo de campos via migração `0299_standardized_orders_evolution.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Motor de regras de venda: `src/lib/order-sales-rules.ts`.\n- Motor fiscal de determinação de CFOP: `src/lib/fiscal-cfop-service.ts`.\n- Serviços de suporte: `src/services/sales.ts` e `src/services/products.ts`.\n- Módulo Financeiro e Fiscal para faturamento posterior.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controlada pela política comercial `canViewSales(role)` (perfis SUP, COMERCIAL, Vendedor, DIRETORIA). Ações de aprovação exigem alçada de gestão comercial.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SalesOrdersPage`, `SalesOrdersPanel`, `SalesOrderStandardEditor`, `StandardOrderHeader`, `StandardOrderSummary`, `StandardOrderActions`.\n- Utilitários: `order-sales-rules`, `fiscal-cfop-service`, `sales-types`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alertas visuais impeditivos em caixa destrutiva para erros de validação (itens sem produto, quantidade/preço zerados, cliente bloqueado).\n- Caixa de aviso informativa para alçadas de margem/desconto pendentes de aprovação gerencial.\n- Notificações de toast para respostas de gravação e tratamento resiliente de erros na API.',
    },
  },

  // -------------------------------------------------------------
  // PEDIDO DE COMPRA (FLUXO PADRONIZADO E PAINEL OFICIAL)
  // -------------------------------------------------------------

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

  // -------------------------------------------------------------
  // CENTRAL DE APROVAÇÕES DE PEDIDOS (NOVA TELA v0.0.651)
  // -------------------------------------------------------------



}



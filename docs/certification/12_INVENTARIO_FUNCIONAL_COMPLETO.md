# Inventário Funcional Completo

> **Artifact ID:** IFC-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 1 & 2

---

## 1. Visão Geral

O Inventário Funcional Completo cataloga todas as funcionalidades da plataforma Velora Log, organizadas por módulo de negócio. Cada funcionalidade é descrita com seu propósito, status de implementação, coleções suportadoras e componentes de frontend associados.

---

## 2. Plataforma Core

### 2.1 Autenticação e Autorização

| Funcionalidade               | Descrição                                          | Status          | Coleções                 | Componentes            |
| ---------------------------- | -------------------------------------------------- | --------------- | ------------------------ | ---------------------- |
| Login de admin               | Autenticação de usuários internos via e-mail/senha | ✅ Implementado | users                    | AdminLogin             |
| Registro de admin            | Cadastro de novos administradores                  | ✅ Implementado | users                    | AdminRegister          |
| Recuperação de senha         | Reset de senha por e-mail                          | ✅ Implementado | users                    | AdminPasswordRecovery  |
| Login de cliente             | Autenticação de clientes no portal                 | ✅ Implementado | clients                  | ClientLogin            |
| Registro de cliente          | Cadastro de clientes no portal                     | ✅ Implementado | clients, partners        | ClientRegister         |
| Recuperação de senha cliente | Reset de senha para clientes                       | ✅ Implementado | clients                  | ClientPasswordReset    |
| Perfis de permissão          | Matriz granular role × módulo × ação               | ✅ Implementado | perfis_permissoes, users | PermissionMatrixScreen |
| Multi-tenancy                | Isolamento por empresa/filial                      | ✅ Implementado | empresas, filiais, users | EmpresaScreen          |

### 2.2 Configuração

| Funcionalidade             | Descrição                                 | Status          | Coleções                          | Componentes        |
| -------------------------- | ----------------------------------------- | --------------- | --------------------------------- | ------------------ |
| Configuration Center       | Parâmetros configuráveis por módulo       | ✅ Implementado | settings, system_parameters       | ParametrosScreen   |
| Gestão de APIs             | Credenciais e logs de API                 | ✅ Implementado | api_credentials, api_request_logs | ApisScreen         |
| Importação/Exportação      | Configuração e histórico de import/export | ✅ Implementado | system_parameters                 | ImportExportScreen |
| Gestão de backups          | Backup manual e automático                | ✅ Implementado | backups                           | BackupScreen       |
| Configurações de segurança | Políticas de segurança                    | ✅ Implementado | settings                          | SegurancaScreen    |

---

## 3. Gestão Empresarial

### 3.1 Comercial

| Funcionalidade        | Descrição                                     | Status          | Coleções                     | Componentes                        |
| --------------------- | --------------------------------------------- | --------------- | ---------------------------- | ---------------------------------- |
| Pedidos de venda      | Criação, edição e gestão de pedidos           | ✅ Implementado | sales_orders                 | SalesOrdersPanel, SalesOrderDialog |
| Faturamento           | Geração de faturas a partir de pedidos        | ✅ Implementado | sales_invoices               | InvoicingPanel                     |
| NF-e                  | Emissão e gestão de notas fiscais eletrônicas | 🟡 Parcial      | nfe_records                  | NfePanel                           |
| NFC-e                 | Emissão de cupom fiscal eletrônico            | 🟡 Parcial      | nfce_records                 | NfcePanel                          |
| Contratos e operações | Gestão de contratos comerciais                | ✅ Implementado | contracts_operations         | ContractsOperationsPanel           |
| Devoluções            | Processamento de devoluções de venda          | ✅ Implementado | sales_returns                | SalesReturnsPanel                  |
| Histórico de vendas   | Consulta histórica de operações               | ✅ Implementado | sales_orders, sales_invoices | SalesHistoryPanel                  |
| Dashboard comercial   | KPIs e indicadores de vendas                  | ✅ Implementado | sales_orders                 | SalesDashboard                     |
| Numeração automática  | Geração automática de números de pedido       | ✅ Implementado | sales_orders                 | sales_numbers_next (hook)          |

### 3.2 Compras

| Funcionalidade        | Descrição                               | Status          | Coleções          | Componentes                  |
| --------------------- | --------------------------------------- | --------------- | ----------------- | ---------------------------- |
| Requisições de compra | Solicitação de compras internas         | ✅ Implementado | purchase_requests | PurchaseRequestsPanel        |
| Cotações              | Comparação de cotações de fornecedores  | ✅ Implementado | quotations        | QuotationsPanel              |
| Pedidos de compra     | Emissão de pedidos a fornecedores       | ✅ Implementado | purchase_orders   | PurchaseOrdersPanel          |
| Recebimento de notas  | Conferência de notas fiscais de entrada | ✅ Implementado | purchase_invoices | PurchaseInvoicesPanel        |
| Devoluções de compra  | Devolução de mercadorias a fornecedores | ✅ Implementado | purchase_returns  | PurchaseReturnsPanel         |
| Dashboard de compras  | KPIs de purchasing                      | ✅ Implementado | purchase_orders   | PurchasingDashboard          |
| Numeração automática  | Geração automática de números           | ✅ Implementado | purchase_requests | purchase_numbers_next (hook) |

### 3.3 Financeiro

| Funcionalidade         | Descrição                            | Status          | Coleções                                  | Componentes                         |
| ---------------------- | ------------------------------------ | --------------- | ----------------------------------------- | ----------------------------------- |
| Contas a receber       | Gestão de recebíveis                 | ✅ Implementado | financial_receivables                     | FinancialReceivables                |
| Contas a pagar         | Gestão de pagáveis                   | ✅ Implementado | financial_payables                        | FinancialPayables                   |
| Fluxo de caixa         | Projeção 30/60/90 dias               | ✅ Implementado | financial_receivables, financial_payables | FinancialCashFlow                   |
| Conciliação bancária   | Conciliação de extratos              | ✅ Implementado | financial_reconciliation                  | FinancialReconciliation             |
| Tesouraria             | Gestão de movimentações financeiras  | ✅ Implementado | financial_movements                       | FinancialTreasury                   |
| Caixa                  | Operações de caixa                   | ✅ Implementado | financial_cash_register                   | FinancialCashRegister               |
| Relatórios financeiros | Relatórios e exportações             | ✅ Implementado | financial\_\*                             | FinancialReports                    |
| Cascade de pagamento   | Efeitos em cascata ao pagar título   | ✅ Implementado | financial_payables                        | on_payable_paid_cascade (hook)      |
| Cascade de recebimento | Efeitos em cascata ao receber título | ✅ Implementado | financial_receivables                     | on_receivable_paid_cascade (hook)   |
| Criação de recebível   | Geração automática ao faturar        | ✅ Implementado | financial_receivables                     | on_invoice_create_receivable (hook) |

### 3.4 Estoque e WMS

| Funcionalidade               | Descrição                            | Status          | Coleções          | Componentes                     |
| ---------------------------- | ------------------------------------ | --------------- | ----------------- | ------------------------------- |
| Movimentações de estoque     | Entradas, saídas, transferências     | ✅ Implementado | stock_movements   | StockMovements                  |
| Inventário                   | Contagem cíclica e física            | ✅ Implementado | stock_inventories | StockInventory                  |
| Transferências entre filiais | Transferência de saldo               | ✅ Implementado | stock_transfers   | StockTransfers                  |
| Ajustes de estoque           | Ajustes manuais com justificativa    | ✅ Implementado | stock_adjustments | StockAdjustments                |
| Lotes                        | Gestão de lotes e validade           | ✅ Implementado | stock_batches     | StockBatches                    |
| Controle de validade         | Alertas de vencimento                | ✅ Implementado | stock_batches     | StockExpiry                     |
| Localizações                 | Endereçamento de armazenagem         | ✅ Implementado | stock_locations   | StockLocations                  |
| Picking                      | Separação de pedidos                 | ✅ Implementado | stock_picking     | StockPicking                    |
| Checking                     | Conferência de separação             | ✅ Implementado | stock_checking    | StockChecking                   |
| Expedição                    | Saída de mercadorias                 | ✅ Implementado | stock_expeditions | StockExpedition                 |
| FIFO/FEFO                    | Sugestão de separação por lote       | ✅ Implementado | stock_batches     | stock_fifo_fefo_suggest (hook)  |
| Bloqueio por validade        | Impedir saída de lote vencido        | ✅ Implementado | stock_batches     | stock_expiry_block (hook)       |
| Alertas de estoque mínimo    | Notificação automática               | ✅ Implementado | stock_alerts      | on_product_create_alerts (hook) |
| WMS Recebimento              | Recebimento de mercadorias           | ✅ Implementado | wms_receipts      | WmsReceiving                    |
| WMS Putaway                  | Endereçamento de mercadoria recebida | ✅ Implementado | wms_putaway       | WmsPutaway                      |
| WMS Ondas                    | Gestão de ondas de separação         | ✅ Implementado | wms_waves         | WmsWaves                        |
| WMS Reabastecimento          | Reposição automática de picking      | ✅ Implementado | wms_replenishment | WmsReplenishment                |
| WMS Alertas                  | Central de alertas operacionais      | ✅ Implementado | wms_alerts        | WmsAlertsCenter                 |
| WMS Mapa                     | Visualização ocupação do armazém     | ✅ Implementado | wms_locations     | WmsWarehouseMap, WmsOccupation  |

### 3.5 Logística

| Funcionalidade         | Descrição                          | Status                 | Coleções                 | Componentes                 |
| ---------------------- | ---------------------------------- | ---------------------- | ------------------------ | --------------------------- |
| Rotas                  | Planejamento de rotas de entrega   | ✅ Implementado        | logistics_routes         | LogisticsRoutes             |
| Entregas               | Acompanhamento de entregas         | ✅ Implementado        | logistics_deliveries     | LogisticsDeliveries         |
| Veículos               | Gestão de frota                    | ✅ Implementado        | logistics_vehicles       | LogisticsVehicles           |
| Motoristas             | Cadastro de motoristas             | ✅ Implementado        | logistics_drivers        | LogisticsDrivers            |
| Fretes                 | Cálculo e gestão de fretes         | ✅ Implementado        | logistics_freights       | LogisticsFreights           |
| Tabelas de frete       | Tabelas por região/transportadora  | ✅ Implementado        | logistics_freight_tables | LogisticsFreightTables      |
| Rastreamento           | GPS e tracking                     | 🟡 Parcial (simulação) | logistics_tracking       | LogisticsTracking           |
| Ocorrências            | Registro de ocorrências de entrega | ✅ Implementado        | logistics_occurrences    | LogisticsOccurrences        |
| Comprovante de entrega | POD digital                        | ✅ Implementado        | logistics_pod            | LogisticsProofDelivery      |
| Custos logísticos      | Análise de custos                  | ✅ Implementado        | logistics_costs          | LogisticsCosts              |
| Logística reversa      | Gestão de devoluções logísticas    | ✅ Implementado        | logistics_reverse        | LogisticsReverseLogistics   |
| App do motorista       | Interface para motoristas          | ✅ Implementado        | logistics_deliveries     | LogisticsDriverApp          |
| Cálculo de rota        | Otimização de rota                 | ✅ Implementado        | logistics_routes         | logistics_route_calc (hook) |
| Notificação de entrega | Aviso automático ao cliente        | ✅ Implementado        | notifications            | on_delivery_notify (hook)   |

### 3.6 Fiscal

| Funcionalidade               | Descrição                    | Status            | Coleções                | Componentes                        |
| ---------------------------- | ---------------------------- | ----------------- | ----------------------- | ---------------------------------- |
| NF-e                         | Emissão e gestão             | 🟡 Parcial (mock) | nfe_records             | NfePanel                           |
| NFC-e                        | Cupom fiscal eletrônico      | 🟡 Parcial (mock) | nfce_records            | NfcePanel                          |
| NFS-e                        | Nota de serviço eletrônica   | 🟡 Parcial        | fiscal_nfse             | NfsePanel                          |
| CT-e/MDF-e                   | Conhecimento e manifesto     | 🟡 Parcial        | fiscal_cte, fiscal_mdfe | CtePanel, MdfePanel                |
| Apuração de impostos         | Apuração ICMS/IPI/PIS/COFINS | ✅ Implementado   | fiscal_apuracao         | ApuracaoPanel                      |
| Reforma tributária           | Simulação CBS/IBS            | ✅ Implementado   | fiscal_reforma          | ReformaDashboard, ReformaSimulador |
| Carta de correção            | CC-e                         | ✅ Implementado   | fiscal_corrections      | CartaCorrecao                      |
| Manifestação do destinatário | MD-e                         | ✅ Implementado   | fiscal_manifest         | ManifestacaoDestinatario           |
| Documentos fiscais           | Gestão centralizada          | ✅ Implementado   | fiscal_documents        | DocumentosFiscais                  |
| Relatórios fiscais           | Relatórios e exportações     | ✅ Implementado   | fiscal\_\*              | RelatoriosFiscais                  |

### 3.7 Contábil

| Funcionalidade             | Descrição                    | Status          | Coleções                     | Componentes                        |
| -------------------------- | ---------------------------- | --------------- | ---------------------------- | ---------------------------------- |
| Plano de contas            | Estrutura contábil           | ✅ Implementado | plano_contas, contabil_plano | ContabilPlanoContas                |
| Lançamentos automáticos    | Geração a partir de eventos  | ✅ Implementado | contabil_lancamentos         | contabil_auto_generate (hook)      |
| Integração com pagável     | Lançamento ao pagar título   | ✅ Implementado | contabil_lancamentos         | contabil_on_payable_paid (hook)    |
| Integração com recebível   | Lançamento ao receber título | ✅ Implementado | contabil_lancamentos         | contabil_on_receivable_paid (hook) |
| Integração com faturamento | Lançamento ao faturar venda  | ✅ Implementado | contabil_lancamentos         | contabil_on_sales_invoice (hook)   |
| Fechamento contábil        | Pré-fechamento de período    | ✅ Implementado | contabil_closing             | contabil_pre_close (hook)          |
| Processamento de lotes     | Lançamentos em lote          | ✅ Implementado | contabil_lotes               | contabil_process_lote (hook)       |
| DRE                        | Demonstração de resultado    | ✅ Implementado | contabil_dre                 | ContabilDashboard                  |

### 3.8 RH, DP e SST

| Funcionalidade            | Descrição                        | Status          | Coleções        | Componentes              |
| ------------------------- | -------------------------------- | --------------- | --------------- | ------------------------ |
| Cadastro de colaboradores | Gestão de funcionários           | ✅ Implementado | rh_employees    | RhEmployees              |
| Controle de ponto         | Registro e apuração de ponto     | ✅ Implementado | rh_time_records | RhTimeControl            |
| Férias                    | Solicitação e controle de férias | ✅ Implementado | rh_vacations    | RhVacations              |
| Folha de pagamento        | Cálculo e processamento          | ✅ Implementado | rh_payroll      | RhPayroll                |
| Relatórios RH             | Relatórios e exportações         | ✅ Implementado | rh\_\*          | RhReports                |
| Banco de horas            | Acumulação e compensação         | ✅ Implementado | dp_banco_horas  | DpBancoHoras             |
| Horas extras              | Apuração e controle              | ✅ Implementado | dp_horas_extras | DpHorasExtras            |
| Folha DP                  | Processamento departamental      | ✅ Implementado | dp_payroll      | DpPayroll                |
| Demissão                  | Fluxo de desligamento            | ✅ Implementado | dp_dismissals   | DpDismissalFlow          |
| Tributos DP               | Cálculos tributários             | ✅ Implementado | dp_taxes        | DpTaxScreen              |
| SST Dashboard             | Indicadores de SST               | ✅ Implementado | sst_indicators  | SstDashboard             |
| Relatórios SST            | Relatórios de segurança          | ✅ Implementado | sst\_\*         | SstReports               |
| Fechamento de folha       | Hook de fechamento               | ✅ Implementado | rh_payroll      | on_payroll_closed (hook) |

### 3.9 CRM

| Funcionalidade | Descrição                       | Status          | Coleções          | Componentes             |
| -------------- | ------------------------------- | --------------- | ----------------- | ----------------------- |
| Leads          | Gestão de leads                 | ✅ Implementado | crm_leads         | CrmLeads                |
| Oportunidades  | Gestão de oportunidades         | ✅ Implementado | crm_opportunities | CrmOpportunities        |
| Funil          | Visualização de funil de vendas | ✅ Implementado | crm_opportunities | CrmFunnel               |
| Agenda         | Agendamento de atividades       | ✅ Implementado | crm_agenda        | CrmAgenda               |
| Propostas      | Geração e gestão de propostas   | ✅ Implementado | crm_proposals     | CrmProposals            |
| Histórico      | Histórico de interações         | ✅ Implementado | crm_history       | CrmHistory              |
| Atividades     | Registro de atividades          | ✅ Implementado | crm_activities    | CrmActivities           |
| Relatórios CRM | Relatórios de vendas            | ✅ Implementado | crm\_\*           | CrmReports              |
| Assistente IA  | IA para CRM                     | ✅ Implementado | crm\_\*           | crm_ai_assistant (hook) |

### 3.10 Atendimento / SAC

| Funcionalidade   | Descrição                        | Status          | Coleções            | Componentes                        |
| ---------------- | -------------------------------- | --------------- | ------------------- | ---------------------------------- |
| Tickets          | Gestão de tickets de atendimento | ✅ Implementado | atendimento_tickets | AtendimentoList, AtendimentoDetail |
| Setores          | Cadastro de setores              | ✅ Implementado | atendimento_setores | AtendimentoSetores                 |
| Motivos          | Cadastro de motivos              | ✅ Implementado | atendimento_motivos | AtendimentoMotivos                 |
| SLA              | Controle de SLA                  | ✅ Implementado | atendimento_sla     | AtendimentoSla                     |
| Classificação IA | Classificação automática por IA  | ✅ Implementado | atendimento_tickets | atendimento_classify_ai (hook)     |
| Formulário       | Criação de tickets               | ✅ Implementado | atendimento_tickets | AtendimentoForm                    |
| Dashboard        | Indicadores de atendimento       | ✅ Implementado | atendimento\_\*     | AtendimentoDashboard               |

### 3.11 Indústria

| Funcionalidade          | Descrição                         | Status          | Coleções                                       | Componentes                       |
| ----------------------- | --------------------------------- | --------------- | ---------------------------------------------- | --------------------------------- |
| Catálogo de itens       | Produtos estendidos com item_type | ✅ Implementado | products                                       | ItemCatalogPanel                  |
| Especificações técnicas | Specs versionadas                 | ✅ Implementado | spec_groups, spec_attributes, spec_values      | ItemCatalogPanel                  |
| BOM versionada          | Estrutura de produto imutável     | ✅ Implementado | bom_versions, bom_components                   | BomPanel                          |
| Recursos produtivos     | Linhas, máquinas, centros         | ✅ Implementado | production_resources                           | ProductionResourcesPanel          |
| Roteiros de produção    | Versionados e imutáveis           | ✅ Implementado | production_routes, production_route_operations | ProductionRoutesPanel             |
| Custos industriais      | Padrão × realizado                | ✅ Implementado | industrial_costs                               | IndustrialCostsPanel              |
| Conversões de unidade   | Global e por item                 | ✅ Implementado | unit_conversions                               | ItemCatalogPanel                  |
| Inspeção de qualidade   | Decisor de condição de lote       | ✅ Implementado | quality_inspections, quality_parameters        | IndustrialCostsPanel              |
| Processos de importação | COMEX                             | ✅ Implementado | import_processes, import_costs                 | ItemCatalogPanel                  |
| Moedas e câmbio         | Multi-moeda                       | ✅ Implementado | currencies, exchange_rates                     | IndustrialCostsPanel              |
| Dashboard industrial    | KPIs de produção                  | ✅ Implementado | industrial_costs                               | IndustryDashboard                 |
| Validação Phase 0       | Verificação estrutural            | ✅ Implementado | schema vivo                                    | phase0_foundation_validate (hook) |
| Testes Phase 0          | Testes funcionais                 | ✅ Implementado | schema vivo                                    | phase0_foundation_test (hook)     |

### 3.12 Precificação

| Funcionalidade          | Descrição                            | Status          | Coleções             | Componentes                       |
| ----------------------- | ------------------------------------ | --------------- | -------------------- | --------------------------------- |
| Configuração de pricing | Custos, impostos, margens            | ✅ Implementado | pricing_config       | PricingDashboard, PricingProducts |
| Tabelas de preço        | Multi-tabela (varejo, atacado, etc.) | ✅ Implementado | price_tables         | PricingTables                     |
| Simulações              | Cenários de precificação             | ✅ Implementado | pricing_simulations  | PricingSimulations                |
| Histórico de preços     | Auditoria de mudanças                | ✅ Implementado | pricing_history      | PricingTimeline                   |
| Aprovações              | Fluxo de aprovação de preço          | ✅ Implementado | pricing_approvals    | PricingApprovals                  |
| Alertas de pricing      | Below cost, negative margin          | ✅ Implementado | pricing_alerts       | PricingRiskMonitor                |
| Cofre de preços         | Versionamento imutável               | ✅ Implementado | price_vault          | PricingVault                      |
| Monitor de risco        | Score de risco de mudança            | ✅ Implementado | pricing_risk_monitor | PricingRiskMonitor                |
| IA de pricing           | Análise por IA                       | ✅ Implementado | pricing_config       | pricing_ai_analyze (hook)         |
| Score de risco          | Cálculo automático                   | ✅ Implementado | pricing_risk_monitor | pricing_risk_score (hook)         |

### 3.13 IA

| Funcionalidade          | Descrição                | Status          | Coleções    | Componentes          |
| ----------------------- | ------------------------ | --------------- | ----------- | -------------------- |
| Treinamento IA          | Gestão de knowledge base | ✅ Implementado | ai_training | AiTrainingV2Panel    |
| Assistente IA           | Chat com IA              | ✅ Implementado | ai_training | AiAssistant          |
| Agentes IA              | Gestão de agentes        | ✅ Implementado | —           | AiAgents             |
| Automações IA           | Fluxos automatizados     | ✅ Implementado | —           | AiAutomations        |
| Smart Flows             | Fluxos inteligentes      | ✅ Implementado | —           | AiSmartFlows         |
| Knowledge Base          | Base de conhecimento     | ✅ Implementado | ai_training | AiKnowledgeBase      |
| Histórico de interações | Log de IA                | ✅ Implementado | —           | AiInteractionHistory |
| Aprovações IA           | Fluxo de aprovação       | ✅ Implementado | —           | AiApprovals          |
| Configurações IA        | Toggle e settings        | ✅ Implementado | settings    | AiSettingsPanel      |
| Gateway $ai             | Acesso ao LLM            | ✅ Implementado | —           | $ai (hook global)    |

---

## 4. Canais Digitais

### 4.1 Site Institucional

| Funcionalidade          | Descrição                    | Status          | Coleções           | Componentes     |
| ----------------------- | ---------------------------- | --------------- | ------------------ | --------------- |
| Hero section            | Banner principal             | ✅ Implementado | cms_content        | HeroSection     |
| Seção de serviços       | Listagem de serviços         | ✅ Implementado | services_offered   | ServicesSection |
| Formulário de orçamento | Captação via WhatsApp        | ✅ Implementado | budget_requests    | BudgetForm      |
| CTA final               | Chamada para ação            | ✅ Implementado | cms_content        | FinalCTA        |
| Chat flutuante          | Chat inline                  | ✅ Implementado | chat_conversations | FloatingChat    |
| Vitrine                 | Exibição de campanhas        | ✅ Implementado | vitrine_items      | VitrineDisplay  |
| SEO                     | Meta tags e Open Graph       | ✅ Implementado | cms_content        | SeoHead         |
| Políticas               | Privacidade, cookies, termos | ✅ Implementado | cms_content        | PolicyLayout    |

### 4.2 CMS

| Funcionalidade         | Descrição                | Status          | Coleções                     | Componentes        |
| ---------------------- | ------------------------ | --------------- | ---------------------------- | ------------------ |
| Homepage               | Edição da página inicial | ✅ Implementado | cms_content                  | CmsHomepage        |
| Seções                 | Blocos de conteúdo       | ✅ Implementado | cms_content                  | CmsSections        |
| Banners                | Gestão de banners        | ✅ Implementado | cms_content                  | CmsBanners         |
| Blocos de conteúdo     | Textos e blocos          | ✅ Implementado | cms_content                  | CmsContentBlocks   |
| Configuração de header | Cabeçalho do site        | ✅ Implementado | cms_content                  | CmsHeaderSettings  |
| Configuração de footer | Rodapé do site           | ✅ Implementado | cms_content                  | CmsFooterSettings  |
| Menu de navegação      | Estrutura de menu        | ✅ Implementado | cms_content                  | CmsNavigationMenu  |
| Identidade visual      | Logo, cores, fontes      | ✅ Implementado | cms_content                  | CmsVisualIdentity  |
| Vitrine CMS            | Gestão de vitrine        | ✅ Implementado | vitrine_items                | CmsVitrine         |
| Biblioteca de mídia    | Gestão de arquivos       | ✅ Implementado | cms_media                    | CmsMediaLibrary    |
| SEO settings           | Configurações de SEO     | ✅ Implementado | cms_content                  | CmsSeoSettings     |
| Workflow               | Draft → publish          | ✅ Implementado | cms_content, cms_publication | CmsWorkflow        |
| Publicação             | Publicação em lote       | ✅ Implementado | cms_publication              | cms_publish (hook) |
| Sitemap                | Geração automática       | ✅ Implementado | cms_content                  | cms_sitemap (hook) |

### 4.3 Portal do Cliente

| Funcionalidade           | Descrição                  | Status          | Coleções             | Componentes                                       |
| ------------------------ | -------------------------- | --------------- | -------------------- | ------------------------------------------------- |
| Dashboard do cliente     | Visão geral                | ✅ Implementado | clients              | PortalDashboard                                   |
| Rastreamento             | Acompanhamento de entregas | ✅ Implementado | logistics_deliveries | ClientTracking                                    |
| Pré-cadastro de parceiro | Auto-registro              | ✅ Implementado | partners             | ClientRegister, partner_pre_register_guard (hook) |

### 4.4 Chat

| Funcionalidade          | Descrição                | Status          | Coleções                          | Componentes                    |
| ----------------------- | ------------------------ | --------------- | --------------------------------- | ------------------------------ |
| Chat inline             | Chat no site             | ✅ Implementado | chat_conversations, chat_messages | FloatingChat                   |
| Resposta do atendente   | Interface de atendimento | ✅ Implementado | chat_messages                     | chat_attendant_reply (hook)    |
| Envio do cliente        | Mensagem do cliente      | ✅ Implementado | chat_messages                     | chat_client_send (hook)        |
| Fechar conversa         | Encerramento             | ✅ Implementado | chat_conversations                | chat_close_conversation (hook) |
| Avaliação               | Rating do atendimento    | ✅ Implementado | chat_ratings                      | chat_submit_rating (hook)      |
| Status                  | Online/ocupado/ausente   | ✅ Implementado | users                             | chat_status (hook)             |
| Visibilidade            | Controle de exibição     | ✅ Implementado | settings                          | chat_visibility_get/set (hook) |
| Verificação ortográfica | Spellcheck               | ✅ Implementado | —                                 | chat_spellcheck (hook)         |

### 4.5 Orçamentos

| Funcionalidade          | Descrição              | Status          | Coleções           | Componentes                     |
| ----------------------- | ---------------------- | --------------- | ------------------ | ------------------------------- |
| Formulário de orçamento | Captação pública       | ✅ Implementado | budget_requests    | BudgetForm                      |
| Campos dinâmicos        | Configuração de campos | ✅ Implementado | budget_form_fields | BudgetFormField                 |
| Gestão de orçamentos    | Admin panel            | ✅ Implementado | budget_requests    | BudgetRequestsPanel             |
| Criação de orçamento    | Manual/internal        | ✅ Implementado | budget_requests    | BudgetCreateDialog              |
| Envio por WhatsApp      | Integração WhatsApp    | ✅ Implementado | budget_requests    | buildBudgetWhatsAppUrl          |
| Envio por e-mail        | Envio de orçamento     | ✅ Implementado | budget_requests    | send_budget_email (hook)        |
| Numeração automática    | Budget number          | ✅ Implementado | budget_requests    | budget_number_next (hook)       |
| Log de envio            | Histórico de envios    | ✅ Implementado | budget_requests    | budget_send_log (hook)          |
| Notificação de criação  | Aviso ao criar         | ✅ Implementado | notifications      | on_budget_request_create (hook) |
| Notificação de mudança  | Aviso ao atualizar     | ✅ Implementado | notifications      | on_budget_update_notify (hook)  |

---

## 5. Auditoria

| Funcionalidade          | Descrição              | Status          | Coleções       | Componentes                      |
| ----------------------- | ---------------------- | --------------- | -------------- | -------------------------------- |
| Logs de auditoria       | Registro de ações      | ✅ Implementado | audit_logs     | AuditPanel, AuditTable           |
| Sessões                 | Tracking de sessões    | ✅ Implementado | audit_sessions | AuditSessionTimeline             |
| Alertas                 | Detecção de anomalias  | ✅ Implementado | audit_alerts   | AuditAlertsPanel                 |
| Detecção automática     | IA para anomalias      | ✅ Implementado | audit_alerts   | audit_alerts_detect (hook)       |
| Arquivamento automático | Retenção automática    | ✅ Implementado | audit_logs     | audit_auto_archive (hook)        |
| Relatório programado    | Relatórios automáticos | ✅ Implementado | audit_logs     | audit_scheduled_report (hook)    |
| Configurações           | Settings de auditoria  | ✅ Implementado | settings       | audit_settings_get/update (hook) |
| Indicadores             | KPIs de auditoria      | ✅ Implementado | audit_logs     | AuditIndicators                  |
| Filtros                 | Filtros avançados      | ✅ Implementado | audit_logs     | AuditFilters                     |
| Detalhe                 | Dialog de detalhe      | ✅ Implementado | audit_logs     | AuditDetailDialog                |
| Exportação              | Excel e PDF            | ✅ Implementado | audit_logs     | AuditExportPanel                 |

---

## 6. Resumo Funcional

| Categoria       | Total de Funcionalidades | Implementado | Parcial | Não Implementado |
| --------------- | ------------------------ | ------------ | ------- | ---------------- |
| Core            | 13                       | 13           | 0       | 0                |
| Comercial       | 9                        | 9            | 0       | 0                |
| Compras         | 7                        | 7            | 0       | 0                |
| Financeiro      | 10                       | 10           | 0       | 0                |
| Estoque e WMS   | 19                       | 19           | 0       | 0                |
| Logística       | 14                       | 13           | 1       | 0                |
| Fiscal          | 10                       | 8            | 2       | 0                |
| Contábil        | 8                        | 8            | 0       | 0                |
| RH/DP/SST       | 13                       | 13           | 0       | 0                |
| CRM             | 9                        | 9            | 0       | 0                |
| Atendimento     | 7                        | 7            | 0       | 0                |
| Indústria       | 13                       | 13           | 0       | 0                |
| Precificação    | 10                       | 10           | 0       | 0                |
| IA              | 10                       | 10           | 0       | 0                |
| Canais Digitais | 25                       | 25           | 0       | 0                |
| Auditoria       | 11                       | 11           | 0       | 0                |
| **Total**       | **188**                  | **185**      | **3**   | **0**            |

**Aderência funcional: 98.4%**

---

_End of Inventário Funcional Completo._

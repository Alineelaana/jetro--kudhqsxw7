# Inventário das Telas

> **Artifact ID:** ITL-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5 (FE)

---

## 1. Telas por Módulo

### 1.1 Site Institucional

| Tela                    | Rota                  | Componente          | Descrição                              |
| ----------------------- | --------------------- | ------------------- | -------------------------------------- |
| Home                    | /                     | Index               | Página inicial com hero, serviços, CTA |
| Política de Privacidade | /politica-privacidade | PoliticaPrivacidade | Política LGPD                          |
| Política de Cookies     | /politica-cookies     | PoliticaCookies     | Política de cookies                    |
| Termos de Uso           | /termos-de-uso        | TermosDeUso         | Termos e condições                     |
| Política Comercial      | /politica-comercial   | PoliticaComercial   | Política comercial                     |

### 1.2 Área Admin

| Tela                 | Rota             | Componente            | Descrição                |
| -------------------- | ---------------- | --------------------- | ------------------------ |
| Login Admin          | /admin           | AdminLogin            | Login de administradores |
| Registro Admin       | /admin/register  | AdminRegister         | Cadastro de admin        |
| Recuperação de Senha | /admin/recovery  | AdminPasswordRecovery | Reset de senha           |
| Dashboard Admin      | /admin/dashboard | AdminDashboard        | Painel principal         |

### 1.3 Portal do Cliente

| Tela                 | Rota                 | Componente          | Descrição            |
| -------------------- | -------------------- | ------------------- | -------------------- |
| Login Cliente        | /portal              | ClientLogin         | Login de cliente     |
| Registro Cliente     | /portal/register     | ClientRegister      | Cadastro de cliente  |
| Recuperação de Senha | /portal/recovery     | ClientPasswordReset | Reset de senha       |
| Área do Cliente      | /portal/area         | ClientArea          | Dashboard do cliente |
| Rastreamento         | /portal/rastreamento | ClientTracking      | Acompanhar entregas  |

### 1.4 Financeiro

| Tela                 | Rota                      | Componente              | Descrição            |
| -------------------- | ------------------------- | ----------------------- | -------------------- |
| Dashboard Financeiro | /financial                | FinancialDashboard      | KPIs financeiros     |
| Contas a Receber     | /financial/receivables    | FinancialReceivables    | Gestão de recebíveis |
| Contas a Pagar       | /financial/payables       | FinancialPayables       | Gestão de pagáveis   |
| Fluxo de Caixa       | /financial/cash-flow      | FinancialCashFlow       | Projeção de caixa    |
| Conciliação          | /financial/reconciliation | FinancialReconciliation | Conciliação bancária |
| Tesouraria           | /financial/treasury       | FinancialTreasury       | Movimentações        |
| Caixa                | /financial/cash-register  | FinancialCashRegister   | Operações de caixa   |
| Relatórios           | /financial/reports        | FinancialReports        | Relatórios           |

### 1.5 Comercial

| Tela                | Rota             | Componente               | Descrição         |
| ------------------- | ---------------- | ------------------------ | ----------------- |
| Dashboard Comercial | /sales           | SalesDashboard           | KPIs de vendas    |
| Pedidos             | /sales/orders    | SalesOrdersPanel         | Gestão de pedidos |
| Faturamento         | /sales/invoicing | InvoicingPanel           | Faturamento       |
| NF-e                | /sales/nfe       | NfePanel                 | Notas fiscais     |
| NFC-e               | /sales/nfce      | NfcePanel                | Cupom fiscal      |
| Contratos           | /sales/contracts | ContractsOperationsPanel | Contratos         |
| Devoluções          | /sales/returns   | SalesReturnsPanel        | Devoluções        |
| Histórico           | /sales/history   | SalesHistoryPanel        | Histórico         |

### 1.6 Compras

| Tela              | Rota                   | Componente            | Descrição         |
| ----------------- | ---------------------- | --------------------- | ----------------- |
| Dashboard Compras | /purchasing            | PurchasingDashboard   | KPIs de compras   |
| Requisições       | /purchasing/requests   | PurchaseRequestsPanel | Requisições       |
| Cotações          | /purchasing/quotations | QuotationsPanel       | Cotações          |
| Pedidos           | /purchasing/orders     | PurchaseOrdersPanel   | Pedidos de compra |
| Notas Recebidas   | /purchasing/invoices   | PurchaseInvoicesPanel | Notas fiscais     |
| Devoluções        | /purchasing/returns    | PurchaseReturnsPanel  | Devoluções        |
| Relatórios        | /purchasing/reports    | PurchasingReports     | Relatórios        |

### 1.7 Estoque

| Tela              | Rota               | Componente       | Descrição            |
| ----------------- | ------------------ | ---------------- | -------------------- |
| Dashboard Estoque | /stock             | StockDashboard   | KPIs de estoque      |
| Movimentações     | /stock/movements   | StockMovements   | Movimentações        |
| Inventário        | /stock/inventory   | StockInventory   | Contagem             |
| Transferências    | /stock/transfers   | StockTransfers   | Transferências       |
| Ajustes           | /stock/adjustments | StockAdjustments | Ajustes              |
| Lotes             | /stock/batches     | StockBatches     | Gestão de lotes      |
| Validade          | /stock/expiry      | StockExpiry      | Controle de validade |
| Localizações      | /stock/locations   | StockLocations   | Endereçamento        |
| Picking           | /stock/picking     | StockPicking     | Separação            |
| Checking          | /stock/checking    | StockChecking    | Conferência          |
| Expedição         | /stock/expedition  | StockExpedition  | Saída                |

### 1.8 WMS

| Tela                | Rota               | Componente             | Descrição           |
| ------------------- | ------------------ | ---------------------- | ------------------- |
| WMS Dashboard       | /wms               | WmsDashboard           | Dashboard WMS       |
| Recebimento         | /wms/receiving     | WmsReceiving           | Recebimento         |
| Putaway             | /wms/putaway       | WmsPutaway             | Endereçamento       |
| Ondas               | /wms/waves         | WmsWaves               | Ondas de separação  |
| Reabastecimento     | /wms/replenishment | WmsReplenishment       | Reposição           |
| Alertas             | /wms/alerts        | WmsAlertsCenter        | Central de alertas  |
| Mapa                | /wms/map           | WmsWarehouseMap        | Mapa do armazém     |
| Ocupação            | /wms/occupation    | WmsOccupation          | Taxa de ocupação    |
| Separacao           | /wms/separation    | WmsSeparation          | Separação WMS       |
| Shipping            | /wms/shipping      | WmsShipping            | Expedição WMS       |
| Contagem Cega       | /wms/blind-count   | WmsBlindCount          | Contagem cega       |
| Inventário Rotativo | /wms/rotational    | WmsRotationalInventory | Inventário rotativo |
| Romaneios           | /wms/romaneios     | WmsRomaneios           | Romaneios           |

### 1.9 Logística

| Tela                | Rota                      | Componente                | Descrição           |
| ------------------- | ------------------------- | ------------------------- | ------------------- |
| Dashboard Logística | /logistics                | LogisticsDashboard        | KPIs logística      |
| Rotas               | /logistics/routes         | LogisticsRoutes           | Planejamento        |
| Entregas            | /logistics/deliveries     | LogisticsDeliveries       | Acompanhamento      |
| Veículos            | /logistics/vehicles       | LogisticsVehicles         | Frota               |
| Motoristas          | /logistics/drivers        | LogisticsDrivers          | Motoristas          |
| Fretes              | /logistics/freights       | LogisticsFreights         | Fretes              |
| Tabelas de Frete    | /logistics/freight-tables | LogisticsFreightTables    | Tabelas             |
| Rastreamento        | /logistics/tracking       | LogisticsTracking         | GPS                 |
| Ocorrências         | /logistics/occurrences    | LogisticsOccurrences      | Ocorrências         |
| Comprovante         | /logistics/pod            | LogisticsProofDelivery    | POD                 |
| Custos              | /logistics/costs          | LogisticsCosts            | Custos              |
| Relatórios          | /logistics/reports        | LogisticsReports          | Relatórios          |
| Reversa             | /logistics/reverse        | LogisticsReverseLogistics | Logística reversa   |
| App Motorista       | /logistics/driver-app     | LogisticsDriverApp        | Interface motorista |

### 1.10 Fiscal

| Tela               | Rota                 | Componente               | Descrição              |
| ------------------ | -------------------- | ------------------------ | ---------------------- |
| Dashboard Fiscal   | /fiscal              | FiscalDashboard          | KPIs fiscais           |
| NF-e               | /fiscal/nfe          | NfePanel                 | NF-e                   |
| NFC-e              | /fiscal/nfce         | NfcePanel                | NFC-e                  |
| NFS-e              | /fiscal/nfse         | NfsePanel                | NFS-e                  |
| CT-e/MDF-e         | /fiscal/cte-mdfe     | CtePanel, MdfePanel      | Conhecimento/manifesto |
| Apuração           | /fiscal/apuracao     | ApuracaoPanel            | Apuração               |
| Reforma Tributária | /fiscal/reforma      | ReformaDashboard         | CBS/IBS                |
| Carta de Correção  | /fiscal/correcao     | CartaCorrecao            | CC-e                   |
| Manifestação       | /fiscal/manifestacao | ManifestacaoDestinatario | MD-e                   |
| Documentos         | /fiscal/documentos   | DocumentosFiscais        | Documentos fiscais     |
| Relatórios         | /fiscal/relatorios   | RelatoriosFiscais        | Relatórios             |

### 1.11 RH/DP/SST

| Tela           | Rota             | Componente      | Descrição          |
| -------------- | ---------------- | --------------- | ------------------ |
| Dashboard RH   | /rh              | RhDashboard     | KPIs RH            |
| Colaboradores  | /rh/employees    | RhEmployees     | Funcionários       |
| Ponto          | /rh/time-control | RhTimeControl   | Controle de ponto  |
| Férias         | /rh/vacations    | RhVacations     | Férias             |
| Folha          | /rh/payroll      | RhPayroll       | Folha de pagamento |
| Relatórios RH  | /rh/reports      | RhReports       | Relatórios         |
| Dashboard DP   | /dp              | DpDashboard     | KPIs DP            |
| Banco de Horas | /dp/banco-horas  | DpBancoHoras    | Banco de horas     |
| Horas Extras   | /dp/horas-extras | DpHorasExtras   | Horas extras       |
| Folha DP       | /dp/payroll      | DpPayroll       | Folha DP           |
| Demissão       | /dp/dismissal    | DpDismissalFlow | Desligamento       |
| Tributos       | /dp/taxes        | DpTaxScreen     | Tributos           |
| Relatórios DP  | /dp/reports      | DpReports       | Relatórios DP      |
| Dashboard SST  | /sst             | SstDashboard    | KPIs SST           |
| Relatórios SST | /sst/reports     | SstReports      | Relatórios SST     |

### 1.12 CRM

| Tela          | Rota               | Componente       | Descrição       |
| ------------- | ------------------ | ---------------- | --------------- |
| Dashboard CRM | /crm               | CrmDashboard     | KPIs CRM        |
| Leads         | /crm/leads         | CrmLeads         | Gestão de leads |
| Oportunidades | /crm/opportunities | CrmOpportunities | Oportunidades   |
| Funil         | /crm/funnel        | CrmFunnel        | Funil de vendas |
| Agenda        | /crm/agenda        | CrmAgenda        | Agenda          |
| Propostas     | /crm/proposals     | CrmProposals     | Propostas       |
| Histórico     | /crm/history       | CrmHistory       | Histórico       |
| Atividades    | /crm/activities    | CrmActivities    | Atividades      |
| Relatórios    | /crm/reports       | CrmReports       | Relatórios      |

### 1.13 Atendimento

| Tela                  | Rota                 | Componente           | Descrição         |
| --------------------- | -------------------- | -------------------- | ----------------- |
| Dashboard Atendimento | /atendimento         | AtendimentoDashboard | KPIs              |
| Tickets               | /atendimento/tickets | AtendimentoList      | Lista de tickets  |
| Detalhe               | /atendimento/detail  | AtendimentoDetail    | Detalhe do ticket |
| Setores               | /atendimento/setores | AtendimentoSetores   | Setores           |
| Motivos               | /atendimento/motivos | AtendimentoMotivos   | Motivos           |
| SLA                   | /atendimento/sla     | AtendimentoSla       | SLA               |

### 1.14 IA

| Tela           | Rota            | Componente           | Descrição            |
| -------------- | --------------- | -------------------- | -------------------- |
| Dashboard IA   | /ai             | AiDashboard          | KPIs IA              |
| Assistente     | /ai/assistant   | AiAssistant          | Chat IA              |
| Agentes        | /ai/agents      | AiAgents             | Agentes              |
| Automações     | /ai/automations | AiAutomations        | Automações           |
| Smart Flows    | /ai/smart-flows | AiSmartFlows         | Fluxos inteligentes  |
| Knowledge Base | /ai/knowledge   | AiKnowledgeBase      | Base de conhecimento |
| Treinamento    | /ai/training    | AiTrainingV2Panel    | Treinamento IA       |
| Histórico      | /ai/history     | AiInteractionHistory | Interações           |
| Aprovações     | /ai/approvals   | AiApprovals          | Aprovações           |
| Configurações  | /ai/settings    | AiSettingsPanel      | Settings             |

### 1.15 Indústria

| Tela                | Rota                | Componente               | Descrição            |
| ------------------- | ------------------- | ------------------------ | -------------------- |
| Dashboard Indústria | /industry           | IndustryDashboard        | KPIs                 |
| Catálogo de Itens   | /industry/items     | ItemCatalogPanel         | Itens e specs        |
| BOM                 | /industry/bom       | BomPanel                 | Estrutura de produto |
| Recursos            | /industry/resources | ProductionResourcesPanel | Recursos produtivos  |
| Roteiros            | /industry/routes    | ProductionRoutesPanel    | Roteiros             |
| Custos              | /industry/costs     | IndustrialCostsPanel     | Custos industriais   |

### 1.16 Precificação

| Tela              | Rota                 | Componente         | Descrição          |
| ----------------- | -------------------- | ------------------ | ------------------ |
| Dashboard Pricing | /pricing             | PricingDashboard   | KPIs               |
| Produtos          | /pricing/products    | PricingProducts    | Config por produto |
| Simulações        | /pricing/simulations | PricingSimulations | Cenários           |
| Aprovações        | /pricing/approvals   | PricingApprovals   | Fluxo de aprovação |
| Cofre             | /pricing/vault       | PricingVault       | Versionamento      |
| Risco             | /pricing/risk        | PricingRiskMonitor | Monitor de risco   |
| Tabelas           | /price-tables        | PricingTables      | Tabelas de preço   |

### 1.17 Produtos

| Tela     | Rota      | Componente    | Descrição            |
| -------- | --------- | ------------- | -------------------- |
| Produtos | /products | ProductsPanel | Catálogo de produtos |

### 1.18 Cadastros

| Tela      | Rota       | Componente     | Descrição        |
| --------- | ---------- | -------------- | ---------------- |
| Cadastros | /cadastros | CadastrosPanel | Cadastros gerais |

### 1.19 CMS

| Tela      | Rota          | Componente      | Descrição           |
| --------- | ------------- | --------------- | ------------------- |
| CMS Panel | /cms          | CmsPanel        | Painel CMS          |
| Overview  | /cms/overview | CmsOverview     | Visão geral         |
| Homepage  | /cms/homepage | CmsHomepage     | Edição homepage     |
| Vitrine   | /cms/vitrine  | CmsVitrine      | Gestão de vitrine   |
| Mídia     | /cms/media    | CmsMediaLibrary | Biblioteca de mídia |
| SEO       | /cms/seo      | CmsSeoSettings  | Configurações SEO   |
| Workflow  | /cms/workflow | CmsWorkflow     | Draft/publish       |

### 1.20 Configurações

| Tela          | Rota                         | Componente             | Descrição                  |
| ------------- | ---------------------------- | ---------------------- | -------------------------- |
| Configurações | /configuracoes               | ConfiguracoesLayout    | Layout de config           |
| Empresa       | /configuracoes/empresa       | EmpresaScreen          | Dados da empresa           |
| Parâmetros    | /configuracoes/parametros    | ParametrosScreen       | Parâmetros do sistema      |
| Logs          | /configuracoes/logs          | LogsScreen             | Logs de auditoria          |
| APIs          | /configuracoes/apis          | ApisScreen             | Credenciais de API         |
| Import/Export | /configuracoes/import-export | ImportExportScreen     | Importação/exportação      |
| Permissões    | /configuracoes/permissoes    | PermissionMatrixScreen | Matriz de permissões       |
| Segurança     | /configuracoes/seguranca     | SegurancaScreen        | Configurações de segurança |
| Backup        | /configuracoes/backup        | BackupScreen           | Gestão de backups          |

### 1.21 Conformidade

| Tela         | Rota          | Componente        | Descrição              |
| ------------ | ------------- | ----------------- | ---------------------- |
| Conformidade | /conformidade | ConformidadePanel | Painel de conformidade |

### 1.22 Phase 0

| Tela               | Rota    | Componente       | Descrição            |
| ------------------ | ------- | ---------------- | -------------------- |
| Phase 0 Foundation | /phase0 | Phase0Foundation | Validação estrutural |

---

## 2. Resumo de Telas

| Módulo             | Quantidade |
| ------------------ | ---------- |
| Site Institucional | 5          |
| Admin              | 4          |
| Portal do Cliente  | 5          |
| Financeiro         | 8          |
| Comercial          | 8          |
| Compras            | 7          |
| Estoque            | 11         |
| WMS                | 13         |
| Logística          | 14         |
| Fiscal             | 11         |
| RH/DP/SST          | 15         |
| CRM                | 9          |
| Atendimento        | 6          |
| IA                 | 10         |
| Indústria          | 6          |
| Precificação       | 7          |
| Produtos           | 1          |
| Cadastros          | 1          |
| CMS                | 7          |
| Configurações      | 9          |
| Conformidade       | 1          |
| Phase 0            | 1          |
| **Total**          | **159**    |

---

_End of Inventário das Telas._

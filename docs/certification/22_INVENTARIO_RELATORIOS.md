# Inventário dos Relatórios

> **Artifact ID:** IREL-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5

---

## 1. Relatórios por Módulo

### 1.1 Financeiro

| Relatório            | Componente              | Formatos            | Descrição                 |
| -------------------- | ----------------------- | ------------------- | ------------------------- |
| Contas a Receber     | FinancialReceivables    | Tela, CSV, XLS, PDF | Listagem de recebíveis    |
| Contas a Pagar       | FinancialPayables       | Tela, CSV, XLS, PDF | Listagem de pagáveis      |
| Fluxo de Caixa       | FinancialCashFlow       | Tela, PDF           | Projeção 30/60/90         |
| Conciliação          | FinancialReconciliation | Tela, CSV           | Conciliação bancária      |
| DRE                  | ContabilDashboard       | Tela, PDF           | Demonstração de resultado |
| Relatório Financeiro | FinancialReports        | Tela, CSV, XLS, PDF | Relatório consolidado     |

### 1.2 Comercial

| Relatório           | Componente        | Formatos       | Descrição               |
| ------------------- | ----------------- | -------------- | ----------------------- |
| Pedidos de Venda    | SalesOrdersPanel  | Tela, CSV      | Listagem de pedidos     |
| Faturamento         | InvoicingPanel    | Tela, CSV, PDF | Faturamento por período |
| Histórico de Vendas | SalesHistoryPanel | Tela, CSV      | Histórico de operações  |
| Devoluções          | SalesReturnsPanel | Tela, CSV      | Devoluções              |

### 1.3 Compras

| Relatório            | Componente            | Formatos            | Descrição                |
| -------------------- | --------------------- | ------------------- | ------------------------ |
| Requisições          | PurchaseRequestsPanel | Tela, CSV           | Requisições de compra    |
| Cotações             | QuotationsPanel       | Tela, CSV           | Cotações                 |
| Pedidos de Compra    | PurchaseOrdersPanel   | Tela, CSV           | Pedidos                  |
| Notas Recebidas      | PurchaseInvoicesPanel | Tela, CSV           | Notas fiscais de entrada |
| Devoluções de Compra | PurchaseReturnsPanel  | Tela, CSV           | Devoluções               |
| Relatório de Compras | PurchasingReports     | Tela, CSV, XLS, PDF | Relatório consolidado    |
| Relatório de Estoque | StockReport           | Tela, CSV, XLS      | Posição de estoque       |

### 1.4 Estoque

| Relatório     | Componente      | Formatos  | Descrição                |
| ------------- | --------------- | --------- | ------------------------ |
| Movimentações | StockMovements  | Tela, CSV | Movimentações de estoque |
| Inventário    | StockInventory  | Tela, CSV | Contagem de inventário   |
| Lotes         | StockBatches    | Tela, CSV | Gestão de lotes          |
| Validade      | StockExpiry     | Tela, CSV | Controle de validade     |
| Expedição     | StockExpedition | Tela, CSV | Expedições               |

### 1.5 WMS

| Relatório     | Componente    | Formatos            | Descrição                 |
| ------------- | ------------- | ------------------- | ------------------------- |
| Relatório WMS | WmsReports    | Tela, CSV, XLS, PDF | Relatório consolidado WMS |
| Ocupação      | WmsOccupation | Tela                | Taxa de ocupação          |
| Romaneios     | WmsRomaneios  | Tela, CSV           | Romaneios de expedição    |

### 1.6 Logística

| Relatório           | Componente          | Formatos            | Descrição             |
| ------------------- | ------------------- | ------------------- | --------------------- |
| Rotas               | LogisticsRoutes     | Tela, CSV           | Rotas de entrega      |
| Entregas            | LogisticsDeliveries | Tela, CSV           | Entregas              |
| Fretes              | LogisticsFreights   | Tela, CSV           | Fretes                |
| Custos              | LogisticsCosts      | Tela, CSV, PDF      | Custos logísticos     |
| Relatório Logístico | LogisticsReports    | Tela, CSV, XLS, PDF | Relatório consolidado |
| Indicadores         | LogisticsIndicators | Tela                | KPIs logísticos       |

### 1.7 Fiscal

| Relatório          | Componente        | Formatos            | Descrição             |
| ------------------ | ----------------- | ------------------- | --------------------- |
| Apuração           | ApuracaoPanel     | Tela, PDF           | Apuração de impostos  |
| Documentos Fiscais | DocumentosFiscais | Tela, CSV           | Documentos fiscais    |
| Reforma Tributária | ReformaSimulador  | Tela, PDF           | Simulação CBS/IBS     |
| Relatórios Fiscais | RelatoriosFiscais | Tela, CSV, XLS, PDF | Relatório consolidado |

### 1.8 RH/DP/SST

| Relatório          | Componente    | Formatos            | Descrição                |
| ------------------ | ------------- | ------------------- | ------------------------ |
| Colaboradores      | RhEmployees   | Tela, CSV           | Lista de funcionários    |
| Folha de Pagamento | RhPayroll     | Tela, CSV, PDF      | Folha                    |
| Relatórios RH      | RhReports     | Tela, CSV, XLS, PDF | Relatório consolidado    |
| Banco de Horas     | DpBancoHoras  | Tela, CSV           | Banco de horas           |
| Horas Extras       | DpHorasExtras | Tela, CSV           | Horas extras             |
| Folha DP           | DpPayroll     | Tela, CSV, PDF      | Folha DP                 |
| Relatórios DP      | DpReports     | Tela, CSV, XLS, PDF | Relatório consolidado DP |
| Relatórios SST     | SstReports    | Tela, CSV, PDF      | Relatórios de segurança  |

### 1.9 CRM

| Relatório      | Componente       | Formatos            | Descrição             |
| -------------- | ---------------- | ------------------- | --------------------- |
| Leads          | CrmLeads         | Tela, CSV           | Lista de leads        |
| Oportunidades  | CrmOpportunities | Tela, CSV           | Oportunidades         |
| Propostas      | CrmProposals     | Tela, CSV           | Propostas             |
| Relatórios CRM | CrmReports       | Tela, CSV, XLS, PDF | Relatório consolidado |

### 1.10 Auditoria

| Relatório         | Componente           | Formatos   | Descrição         |
| ----------------- | -------------------- | ---------- | ----------------- |
| Logs de Auditoria | AuditTable           | Tela, CSV  | Logs              |
| Sessões           | AuditSessionTimeline | Tela       | Sessões           |
| Alertas           | AuditAlertsPanel     | Tela       | Alertas           |
| Indicadores       | AuditIndicators      | Tela       | KPIs de auditoria |
| Exportação        | AuditExportPanel     | Excel, PDF | Exportação        |

### 1.11 Pricing

| Relatório        | Componente         | Formatos  | Descrição           |
| ---------------- | ------------------ | --------- | ------------------- |
| Simulações       | PricingSimulations | Tela, CSV | Simulações de preço |
| Cofre de Preços  | PricingVault       | Tela      | Versionamento       |
| Monitor de Risco | PricingRiskMonitor | Tela      | Risco               |
| Timeline         | PricingTimeline    | Tela      | Histórico           |

### 1.12 Indústria

| Relatório          | Componente           | Formatos  | Descrição            |
| ------------------ | -------------------- | --------- | -------------------- |
| BOM                | BomPanel             | Tela, CSV | Estrutura de produto |
| Custos Industriais | IndustrialCostsPanel | Tela, CSV | Custos               |
| Validação Phase 0  | Phase0Foundation     | Tela      | Validação estrutural |

### 1.13 Dashboards

| Relatório                   | Componente                  | Formatos | Descrição         |
| --------------------------- | --------------------------- | -------- | ----------------- |
| Dashboard Financeiro        | FinancialDashboard          | Tela     | KPIs              |
| Dashboard Comercial         | SalesDashboard              | Tela     | KPIs              |
| Dashboard Estoque           | StockDashboard              | Tela     | KPIs              |
| Dashboard WMS               | WmsManagerialDashboard      | Tela     | KPIs              |
| Dashboard Logística         | LogisticsDashboard          | Tela     | KPIs              |
| Dashboard Fiscal            | FiscalDashboard             | Tela     | KPIs              |
| Dashboard RH                | RhDashboard                 | Tela     | KPIs              |
| Dashboard CRM               | CrmDashboard                | Tela     | KPIs              |
| Dashboard IA                | AiDashboard                 | Tela     | KPIs              |
| Dashboard Indústria         | IndustryDashboard           | Tela     | KPIs              |
| Dashboard Atendimento       | AtendimentoDashboard        | Tela     | KPIs              |
| Dashboard Pricing           | PricingDashboard            | Tela     | KPIs              |
| Produtividade de Orçamentos | BudgetProductivityDashboard | Tela     | KPIs              |
| Produtividade de Chat       | ChatProductivityDashboard   | Tela     | KPIs              |
| Status Geral                | StatusDashboard             | Tela     | Status do sistema |

### 1.14 Produtos e Serviços

| Relatório           | Componente           | Formatos  | Descrição            |
| ------------------- | -------------------- | --------- | -------------------- |
| Produtos            | ProductsPanel        | Tela, CSV | Catálogo             |
| Serviços Oferecidos | ServicesOfferedPanel | Tela, CSV | Serviços             |
| Valor de Serviços   | ServicesValueReport  | Tela, CSV | Relatório de valores |

---

## 2. Bibliotecas de Exportação

| Biblioteca          | Arquivo                       | Formatos      |
| ------------------- | ----------------------------- | ------------- |
| CSV Export          | csv-export.ts                 | CSV           |
| Chart Export        | chart-export.ts               | PNG, JPEG     |
| Report PDF          | report-pdf.ts                 | PDF           |
| Report XLS          | report-xls.ts                 | XLS           |
| PDF Generator       | pdf-generator.ts              | PDF           |
| Audit Export        | audit-export.ts               | Excel, PDF    |
| Product Export      | product-export.ts             | CSV, XLS      |
| Services Export     | services-export.ts            | CSV, XLS      |
| Purchasing Reports  | purchasing-reports-export.ts  | CSV, XLS, PDF |
| WMS Reports         | wms-reports-export.ts         | CSV, XLS, PDF |
| RH/DP PDF           | rh-dp-pdf-export.ts           | PDF           |
| Pricing Simulations | pricing-simulations-export.ts | CSV, XLS      |

---

## 3. Resumo de Relatórios

| Categoria                 | Quantidade |
| ------------------------- | ---------- |
| Relatórios por módulo     | 65         |
| Dashboards                | 15         |
| Bibliotecas de exportação | 12         |
| **Total**                 | **92**     |

---

## 4. Verificações

| Verificação               | Status |
| ------------------------- | ------ |
| Exportação multi-formato  | ✅     |
| Relatórios por domínio    | ✅     |
| Dashboards com KPIs       | ✅     |
| Bibliotecas reutilizáveis | ✅     |

---

\_End of Inventário dos Relatórios.\*

# Inventário dos Componentes

> **Artifact ID:** ICP-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5 (FE)

---

## 1. Componentes UI Base (shadcn/ui) — 45

accordion, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip

## 2. Componentes por Domínio

### 2.1 Site (8)

HeroSection, ServicesSection, BudgetForm, FinalCTA, SiteHeader, SiteFooter, FloatingChat, VitrineDisplay

### 2.2 Admin (15)

AdminLogin, AdminRegister, AdminDashboard, AdminSidebar, AdminChatPanel, AdminRequestDetails, AdminRequestRow, BudgetRequestsPanel, BudgetCreateDialog, BudgetFormField, BudgetFormExtras, BudgetServicePicker, BudgetRequestActions, InternalBudgetDialog, ManualBudgetDialog

### 2.3 Financial (17)

FinancialLayout, FinancialDashboard, FinancialReceivables, FinancialPayables, FinancialCashFlow, FinancialReconciliation, FinancialTreasury, FinancialCashRegister, FinancialReports, FinancialGenericScreen, FinancialShared, ReceivableActions, + 6 shared

### 2.4 Sales (15)

SalesPageWrapper, SalesDashboard, SalesOrdersPanel, SalesPanel, InvoicingPanel, NfePanel, NfcePanel, ContractsOperationsPanel, SalesReturnsPanel, SalesHistoryPanel, SalesOrderDialog, ContractFormDialog, + 3 shared

### 2.5 Stock (30+)

StockPageWrapper, StockDashboard, StockMovements, StockInventory, StockTransfers, StockAdjustments, StockBatches, StockExpiry, StockLocations, StockPicking, StockChecking, StockExpedition, StockBarcodeInput, StockFilterBar, + WMS components (15+)

### 2.6 WMS (20+)

WmsReceiving, WmsPutaway, WmsWaves, WmsReplenishment, WmsAlertsCenter, WmsReports, WmsPallets, WmsVolumes, WmsCollectors, WmsOperators, WmsManagerialDashboard, WmsRomaneios, WmsBlindCount, WmsExpeditionCheck, WmsOccupation, WmsReceivingCheck, WmsRotationalInventory, WmsSeparation, WmsShipping, WmsWarehouseMap, WmsDashboard

### 2.7 Logistics (18+)

LogisticsLayout, LogisticsDashboard, LogisticsRoutes, LogisticsDeliveries, LogisticsVehicles, LogisticsDrivers, LogisticsFreights, LogisticsFreightTables, LogisticsTracking, LogisticsOccurrences, LogisticsProofDelivery, LogisticsCosts, LogisticsReports, LogisticsRoutePlanning, LogisticsIndicators, LogisticsReverseLogistics, LogisticsDriverApp, LogisticsMap

### 2.8 Fiscal (12+)

FiscalLayout, FiscalDashboard, NfsePanel, CtePanel, MdfePanel, ApuracaoPanel, ReformaDashboard, ReformaSimulador, CartaCorrecao, ManifestacaoDestinatario, DocumentosFiscais, RelatoriosFiscais, FiscalGenericScreen

### 2.9 RH/DP/SST (20+)

RhLayout, RhDashboard, RhEmployees, RhTimeControl, RhVacations, RhPayroll, RhReports, RhGenericScreen, RhShared, RhPayrollSimulation, RhPositionsEnhanced, RhVacationsAlerts, DpDashboard, DpBancoHoras, DpHorasExtras, DpPayroll, DpDismissalFlow, DpTaxScreen, DpReports, DpShared, DpGenericScreen, SstDashboard, SstReports, SstShared

### 2.10 CRM (12+)

CrmLayout, CrmDashboard, CrmLeads, CrmOpportunities, CrmFunnel, CrmAgenda, CrmProposals, CrmHistory, CrmActivities, CrmGenericScreen, CrmReports, CrmLeadDialog, CrmOpportunityDialog, CrmProposalDialog, CrmActivityDialog

### 2.11 AI Module (11)

AiLayout, AiDashboard, AiAssistant, AiAgents, AiAutomations, AiSmartFlows, AiKnowledgeBase, AiTrainingV2Panel, AiInteractionHistory, AiApprovals, AiSettingsPanel

### 2.12 Industry (7)

IndustryDashboard, ItemCatalogPanel, BomPanel, ProductionResourcesPanel, ProductionRoutesPanel, IndustrialCostsPanel, IndustryLayout

### 2.13 CMS (20+)

CmsPanel, CmsOverview, CmsHomepage, CmsSections, CmsBanners, CmsContentBlocks, CmsContentTexts, CmsHeaderSettings, CmsFooterSettings, CmsNavigationMenu, CmsVisualIdentity, CmsVitrine, CmsVitrineForm, CmsVitrineList, CmsVitrinePreview, CmsMediaLibrary, CmsSeoSettings, CmsSeoPageEditor, CmsSeoScripts, CmsWorkflow, CmsButtonsLinks, CmsShared, MediaPicker

### 2.14 Configurações (10)

ConfiguracoesLayout, EmpresaScreen, ParametrosScreen, ConfigCrudScreen, LogsScreen, ApisScreen, ImportExportScreen, PermissionMatrixScreen, SegurancaScreen, BackupScreen

### 2.15 Atendimento (8)

AtendimentoDashboard, AtendimentoDetail, AtendimentoForm, AtendimentoLayout, AtendimentoList, AtendimentoMotivos, AtendimentoSetores, AtendimentoSla

### 2.16 Pricing (15+)

PricingDashboard, PricingProducts, PricingSimulations, PricingSimulator, PricingApprovals, PricingVault, PricingRiskMonitor, PricingPanel, PricingIntelligence, PricingCostComparator, PricingAiSuggestions, PricingTimeline, PricingVersions, PricingTables, PriceTableFormDialog, PriceTableGeneralTab, PriceTableItemsTab, PriceTableRulesTab, JustificationDialog

### 2.17 Purchasing (12+)

PurchasingPanel, PurchasingDashboard, PurchaseRequestsPanel, QuotationsPanel, PurchaseOrdersPanel, PurchaseInvoicesPanel, PurchaseReturnsPanel, PurchasingReports, StockReport, PurchaseApprovalPanel, PurchaseInvoiceDialog, PurchaseOrderImportDialog, PurchaseReturnDialog

### 2.18 Audit (10+)

AuditPanel, AuditTable, AuditFilters, AuditDetailDialog, AuditIndicators, AuditSessionTimeline, AuditSettingsPanel, AuditAlertsPanel, BackupPanel, BackupCreateDialog, BackupRestoreDialog, BackupCompareDialog, BackupCodeExportDialog, BackupSettingsSection

### 2.19 Products (10+)

ProductsPanel, ProductFormDialog, ProductHistoryDialog, ProductImportDialog, ProductLabelsDialog, ProductTabGeneral, ProductTabCommercial, ProductTabImages, ProductTabObservations, ProductTabPurchasing, ProductTabStock, ProductTabTax, ProductVariationsSection, ProductViewDialog

### 2.20 Cadastros (3+)

CadastrosPanel, CadastroFormDialog, CadastroStandardScreen

### 2.21 Partner (10+)

PartnerManagement, PartnerFormDialog, PartnerListTable, PartnerPfFields, PartnerPjFields, PartnerShared, PartnerAddressFields, PartnerDocumentSection, PartnerFinancialDialog, PartnerRestrictionControls, PartnerTypeManager

### 2.22 Shared/Utils (15+)

Layout, ErrorBoundary, SeoHead, ServiceCard, ServiceFormDialog, ServicePicker, ServicesOfferedPanel, ServicesValueReport, NotificationBell, PaginationControls, SendMessageDialog, EmojiPicker, StatusDashboard, StatusHistoryDialog, StatusUpdateDialog, ConsentCheckbox, ChartExportButton

### 2.23 Dashboards (5)

DashboardsPanel, StatCard, ChartCard, BudgetProductivityDashboard, ChatProductivityDashboard

---

## 3. Resumo de Componentes

| Categoria        | Quantidade |
| ---------------- | ---------- |
| UI Base (shadcn) | 45         |
| Site             | 8          |
| Admin            | 15         |
| Financial        | 17         |
| Sales            | 15         |
| Stock            | 15         |
| WMS              | 21         |
| Logistics        | 18         |
| Fiscal           | 13         |
| RH/DP/SST        | 24         |
| CRM              | 15         |
| AI Module        | 11         |
| Industry         | 7          |
| CMS              | 23         |
| Configurações    | 10         |
| Atendimento      | 8          |
| Pricing          | 19         |
| Purchasing       | 13         |
| Audit            | 14         |
| Products         | 14         |
| Cadastros        | 3          |
| Partner          | 11         |
| Shared/Utils     | 17         |
| Dashboards       | 5          |
| **Total**        | **348**    |

---

## 4. Verificações FCP FE

| Verificação                  | Status |
| ---------------------------- | ------ |
| FE-01: Imports com @/        | ✅     |
| FE-02: Named exports         | ✅     |
| FE-03: Hooks no topo         | ✅     |
| FE-04: Uso de cn()           | ✅     |
| FE-05: Responsividade        | ✅     |
| FE-06: Componentes shadcn/ui | ✅     |

---

_End of Inventário dos Componentes._

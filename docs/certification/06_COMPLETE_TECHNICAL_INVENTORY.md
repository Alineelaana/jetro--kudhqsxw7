# Complete Technical Inventory

> **Document ID:** CTI-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 1 & 2

---

## 1. Technology Stack

| Layer              | Technology              | Version |
| ------------------ | ----------------------- | ------- |
| Frontend Framework | React                   | 19.2.7  |
| Build Tool         | Vite                    | 8.0.16  |
| Language           | TypeScript              | 6.0.3   |
| CSS Framework      | TailwindCSS             | 3.4.19  |
| UI Components      | shadcn/ui (Radix UI)    | Latest  |
| Icons              | lucide-react            | 0.577.0 |
| Charts             | recharts                | 3.8.1   |
| Forms              | react-hook-form         | 7.80.0  |
| Validation         | zod                     | 4.4.3   |
| Router             | react-router-dom        | 7.18.0  |
| Backend            | PocketBase              | v0.36   |
| Backend Hosting    | Skip Cloud              | —       |
| Database           | SQLite (via PocketBase) | —       |
| Package Manager    | pnpm                    | —       |

## 2. Database Collections (120+)

### 2.1 Auth Collections (2)

- `users` — name, avatar, cpf, attendant_status, active, role, empresa_id, filial_id, cargo, departamento, perfil_acesso
- `clients` — partner_id, name

### 2.2 Core Collections (4)

- `settings`, `empresas`, `filiais`, `perfis_permissoes`

### 2.3 Business Collections (30+)

- `budget_form_fields`, `budget_requests`, `services_offered`, `service_areas`, `contracts_operations`
- `products`, `stock_alerts`, `stock_expeditions`
- `purchase_requests`, `quotations`, `purchase_orders`, `purchase_invoices`, `purchase_returns`
- `pricing_config`, `price_tables`, `pricing_simulations`, `pricing_history`, `pricing_approvals`, `pricing_alerts`, `price_vault`, `pricing_risk_monitor`
- `sales_orders`, `sales_invoices`, `nfe_records`, `nfce_records`, `sales_returns`

### 2.4 Communication Collections (5)

- `chat_conversations`, `chat_messages`, `chat_ratings`, `notifications`, `vitrine_items`

### 2.5 CMS Collections (5)

- `cms_content`, `cms_versions`, `cms_history`, `cms_media`, `cms_publication`

### 2.6 Audit Collections (5)

- `audit_logs`, `audit_sessions`, `audit_alerts`, `backups`, `system_parameters`

### 2.7 Partner Collections (2)

- `partner_types`, `partners`

### 2.8 Cadastros Collections (10+)

- `transportadoras`, `categorias`, `subcategorias`, `marcas`, `unidades_medida`
- `centros_custo`, `plano_contas`, `bancos`, `contas_bancarias`, `formas_pagamento`, `condicoes_pagamento`
- `vendedores`, `representantes`

### 2.9 AI Collections (1)

- `ai_training`

### 2.10 Integration Collections (4)

- `integrations`, `integration_logs`, `api_credentials`, `api_request_logs`

### 2.11 Industry Collections (10+)

- `spec_groups`, `spec_attributes`, `spec_values`, `unit_conversions`
- `bom_versions`, `bom_components`, `production_resources`
- `production_routes`, `production_route_operations`
- `quality_inspections`, `quality_parameters`, `industrial_costs`
- `currencies`, `exchange_rates`, `import_processes`, `import_costs`

### 2.12 Financial Collections (per migration 0055-0056)

- Receivables, payables, cash flow, reconciliation, treasury, cash register collections

### 2.13 RH/DP/SST Collections (per migrations 0058-0066)

- Employees, positions, time records, vacations, payroll, benefits, training, documents collections

### 2.14 Fiscal Collections (per migration 0067)

- Fiscal document, apuração, SPED, certificate collections

### 2.15 Contabil Collections (per migration 0068)

- Plano de contas, DRE, fechamento collections

### 2.16 Atendimento Collections (per migration 0070)

- Tickets, setores, motivos, SLA collections

### 2.17 CRM Collections (per migration 0073)

- Leads, opportunities, funnel, proposals, activities collections

## 3. Migrations (88 Applied)

| Range     | Count  | Purpose                                                                                     |
| --------- | ------ | ------------------------------------------------------------------------------------------- |
| 0001-0010 | 10     | Core collections, seeds, chat, AI training                                                  |
| 0011-0020 | 10     | Users, partners, CMS, vitrine, audit, backups, services                                     |
| 0021-0030 | 10     | Services, contracts, notifications, products, stock                                         |
| 0031-0040 | 10     | Purchasing, pricing, cadastros, sales, stock, pricing governance                            |
| 0041-0050 | 10     | Audit corporate, price tables, configs, WMS                                                 |
| 0051-0060 | 10     | Logistics, financial, RH, seeds, tax tables                                                 |
| 0061-0070 | 10     | RH/DP/SST, fiscal, contabil, AI module, atendimento                                         |
| 0071-0080 | 10     | Atendimento seeds, stability, CRM, industry specs/BOM/routes/quality                        |
| 0081-0088 | 8      | Industry stages (specs, BOM, routes, quality, costs, seeds Gran Romano, fundação, produção) |
| **Total** | **88** | (Note: 0037 absent from applied list)                                                       |

## 4. Backend Hooks (100+)

### 4.1 Domain Distribution

| Domain             | Hook Count | Examples                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audit              | 14         | audit_create, audit_update, audit_delete, audit_enrich, audit_auth, audit_alerts_detect, audit_cron, audit_auto_archive, audit_archive, audit_incident_notify, audit_scheduled_report, audit_settings_get/update                                                                                                                                                                                                                                                                                            |
| Backup             | 10         | backup_create, backup_list, backup_delete, backup_download, backup_restore, backup_compare, backup_auto_check, backup_settings_get/update                                                                                                                                                                                                                                                                                                                                                                   |
| Stock              | 10         | stock_audit, stock_fifo_fefo_suggest, stock_expiry_block, stock_inventory_approve, stock_on_purchase_invoice, stock_on_sales_update, stock_transfer_complete, stock_cost_update, stock_price_alert_rescan                                                                                                                                                                                                                                                                                                   |
| WMS                | 5          | wms_alerts_detect, wms_auto_receipt_from_invoice, wms_receipt_putaway, wms_replenishment_auto, wms_wave_release                                                                                                                                                                                                                                                                                                                                                                                             |
| Logistics          | 4          | logistics_gps_simulate, logistics_gps_update, logistics_map_validate, logistics_route_calc                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Chat               | 8          | chat_client_send, chat_attendant_reply, chat_close_conversation, chat_submit_rating, chat_status, chat_visibility_get/set, chat_spellcheck                                                                                                                                                                                                                                                                                                                                                                  |
| Budget             | 6          | on_budget_request_create, on_budget_create_notify, on_budget_update_notify, budget_number_next, budget_send_log, send_budget_email                                                                                                                                                                                                                                                                                                                                                                          |
| AI                 | 5          | ai_settings_get/toggle, ai_training_create/list/update/delete                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Atendimento        | 7          | atendimento_after_create, atendimento_classify_ai, atendimento_client_messages, atendimento_on_create/update, atendimento_sla_check, atendimento_stage_action                                                                                                                                                                                                                                                                                                                                               |
| Financial/Contabil | 6          | contabil_auto_generate, contabil_on_payable_paid, contabil_on_receivable_paid, contabil_on_sales_invoice, contabil_pre_close, contabil_process_lote                                                                                                                                                                                                                                                                                                                                                         |
| Pricing            | 4          | pricing_ai_analyze, pricing_risk_score, price_table_approval_scan, price_table_expiry_alert                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Other              | 20+        | on_delivery_notify, on_invoice_create_receivable, on_payable_paid_cascade, on_receivable_paid_cascade, on_payroll_closed, on_product_create/update_alerts, on_service_create/update, on_user_create, cnpj_lookup, cms_publish, cms_sitemap, vitrine_auto_status, vitrine_delete_guard, partner_pre_register_guard, services_offered_delete_guard, phase0_foundation_validate, phase0_foundation_test, product_code_next, purchase_numbers_next, sales_numbers_next, response_time_average, crm_ai_assistant |

## 5. Frontend Components (300+)

### 5.1 Page Distribution

| Domain      | Component Count | Key Components                                                           |
| ----------- | --------------- | ------------------------------------------------------------------------ |
| UI (shadcn) | 45              | Full shadcn/ui library                                                   |
| Stock/WMS   | 30+             | StockDashboard, StockMovements, WmsReceiving, WmsPutaway, WmsWaves, etc. |
| Financial   | 15+             | FinancialDashboard, FinancialReceivables, FinancialPayables, etc.        |
| Sales       | 15+             | SalesDashboard, SalesOrdersPanel, InvoicingPanel, NfePanel, etc.         |
| Logistics   | 18+             | LogisticsDashboard, LogisticsRoutes, LogisticsDeliveries, etc.           |
| CRM         | 12+             | CrmDashboard, CrmLeads, CrmOpportunities, etc.                           |
| RH/DP/SST   | 15+             | RhDashboard, RhEmployees, DpDashboard, SstDashboard, etc.                |
| CMS         | 20+             | CmsPanel, CmsOverview, CmsVitrine, CmsMediaLibrary, etc.                 |
| Industry    | 7+              | IndustryDashboard, ItemCatalogPanel, BomPanel, etc.                      |
| AI          | 11+             | AiDashboard, AiAssistant, AiAgents, AiAutomations, etc.                  |
| Audit       | 10+             | AuditPanel, AuditTable, AuditFilters, etc.                               |
| Config      | 10+             | ConfiguracoesLayout, EmpresaScreen, ParametrosScreen, etc.               |
| Pricing     | 15+             | PricingDashboard, PricingProducts, PricingSimulations, etc.              |
| Purchasing  | 12+             | PurchasingDashboard, PurchaseOrdersPanel, QuotationsPanel, etc.          |
| Fiscal      | 12+             | FiscalDashboard, NfsePanel, ApuracaoPanel, ReformaDashboard, etc.        |
| Atendimento | 8+              | AtendimentoDashboard, AtendimentoDetail, etc.                            |
| Site        | 8+              | HeroSection, ServicesSection, BudgetForm, SiteHeader, etc.               |

## 6. Services Layer (40+)

| Service            | Collection(s)                                  |
| ------------------ | ---------------------------------------------- |
| budget-requests.ts | budget_requests                                |
| chat.ts            | chat_conversations, chat_messages              |
| products.ts        | products                                       |
| stock.ts           | stock movements, batches, alerts               |
| sales.ts           | sales_orders, sales_invoices                   |
| purchasing.ts      | purchase_requests, quotations, purchase_orders |
| financial.ts       | receivables, payables, cash flow               |
| logistics.ts       | routes, deliveries, vehicles                   |
| industry.ts        | bom_versions, production_routes, etc.          |
| crm.ts             | leads, opportunities                           |
| rh.ts              | employees, payroll                             |
| fiscal.ts          | nfe, nfce, apuração                            |
| cms.ts             | cms_content, cms_media                         |
| audit-logs.ts      | audit_logs                                     |
| backups.ts         | backups                                        |
| ai-module.ts       | ai_training                                    |
| settings.ts        | settings                                       |
| users.ts           | users                                          |
| partners.ts        | partners                                       |
| vitrine.ts         | vitrine_items                                  |
| wms.ts             | wms operations                                 |
| pricing.ts         | pricing_config, price_tables                   |
| notifications.ts   | notifications                                  |

## 7. Documentation Inventory (13 Documents)

| Document                             | Status       | Last Updated |
| ------------------------------------ | ------------ | ------------ |
| PLATFORM_PRINCIPLES.md               | Official     | 2026-08-06   |
| ARCHITECTURE.md                      | Official     | 2026-08-06   |
| PRD.md                               | Official     | 2026-08-06   |
| ROADMAP.md                           | Official     | 2026-08-06   |
| BACKLOG.md                           | Official     | 2026-08-06   |
| PLATFORM_CANONICAL_MODEL.md          | Official     | 2026-08-06   |
| PLATFORM_DOMAIN_MAP.md               | Official     | 2026-08-06   |
| FCP_FRAMEWORK.md                     | Consolidated | 2026-08-07   |
| PRODUCT_VISION_2035.md               | Official     | 2026-08-06   |
| EXECUTIVE_SUMMARY.md                 | Created      | 2026-08-06   |
| CONSISTENCY_CHECK.md                 | Verified     | 2026-08-06   |
| CONSISTENCY_CHECK_FASE0.md           | Verified     | 2026-08-06   |
| CONFIRMATION_REPORT_CANAL_DIGITAL.md | Created      | 2026-08-06   |

## 8. ADRs (22 Total)

| ADR     | Title                               | Date       |
| ------- | ----------------------------------- | ---------- |
| ADR-001 | Multi-tenancy by Tenant ID          | 2026-08-01 |
| ADR-002 | API First with Versioning           | 2026-08-01 |
| ADR-003 | AI as Native Layer                  | 2026-08-01 |
| ADR-004 | Modular with Feature Flags          | 2026-08-01 |
| ADR-005 | Immutable Audit Logs                | 2026-08-01 |
| ADR-006 | White Label by Configuration        | 2026-08-01 |
| ADR-007 | Master Portal                       | 2026-08-01 |
| ADR-008 | Marketplace with Sandbox            | 2026-08-01 |
| ADR-009 | Observability                       | 2026-08-01 |
| ADR-010 | LGPD Compliance                     | 2026-08-01 |
| ADR-011 | Industry Structure Reclassification | 2026-08-06 |
| ADR-012 | Shared Platform Services            | 2026-08-06 |
| ADR-013 | Platform Tree                       | 2026-08-06 |
| ADR-014 | MRP as Hook                         | 2026-08-06 |
| ADR-015 | Traceability via Real Relations     | 2026-08-06 |
| ADR-016 | Structure Extension                 | 2026-08-06 |
| ADR-017 | BOM Versioned Immutable             | 2026-08-06 |
| ADR-018 | Quality Inspection as Decisor       | 2026-08-06 |
| ADR-019 | COMEX Future                        | 2026-08-06 |
| ADR-020 | Digital Channels Architecture       | 2026-08-06 |
| ADR-021 | Industry Phase 0                    | 2026-08-06 |
| ADR-022 | Evidence-Based Acceptance           | 2026-08-07 |

---

_End of Complete Technical Inventory._

# Inventário dos Serviços

> **Artifact ID:** ISV-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5

---

## 1. Serviços Frontend (src/services/)

| Serviço               | Arquivo                  | Coleções                                          | Funções                                          |
| --------------------- | ------------------------ | ------------------------------------------------- | ------------------------------------------------ |
| Budget Requests       | budget-requests.ts       | budget_requests                                   | getList, getOne, create, update, delete          |
| Budget Form Fields    | budget-form-fields.ts    | budget_form_fields                                | getList, create, update, delete                  |
| Chat                  | chat.ts                  | chat_conversations, chat_messages                 | getConversations, sendMessage, closeConversation |
| Chat Ratings          | chat-ratings.ts          | chat_ratings                                      | submitRating, getRatings                         |
| Chat Visibility       | chat-visibility.ts       | settings                                          | getVisibility, setVisibility                     |
| Products              | products.ts              | products                                          | CRUD completo, import, search                    |
| Stock                 | stock.ts                 | stock_movements, stock_batches, stock_alerts      | Movements, inventory, transfers, adjustments     |
| Sales                 | sales.ts                 | sales_orders, sales_invoices                      | Orders, invoicing, returns, history              |
| Purchasing            | purchasing.ts            | purchase_requests, quotations, purchase_orders    | Requests, quotes, orders, invoices, returns      |
| Financial             | financial.ts             | financial_receivables, financial_payables         | Receivables, payables, cash flow, reconciliation |
| Logistics             | logistics.ts             | logistics_routes, logistics_deliveries            | Routes, deliveries, vehicles, drivers, freights  |
| Logistics GPS         | logistics-gps.ts         | logistics_tracking                                | GPS update, simulate                             |
| Industry              | industry.ts              | bom_versions, production_routes, industrial_costs | BOM, routes, costs, specs, quality               |
| CRM                   | crm.ts                   | crm_leads, crm_opportunities                      | Leads, opportunities, proposals, activities      |
| RH                    | rh.ts                    | rh_employees, rh_payroll                          | Employees, payroll, time, vacations              |
| RH Payroll            | rh-payroll.ts            | rh_payroll                                        | Payroll processing, simulation                   |
| Fiscal                | fiscal.ts                | nfe*records, nfce_records, fiscal*\*              | NF-e, NFC-e, apuração, reforma                   |
| Contabil              | contabil.ts              | contabil_lancamentos, contabil_dre                | Lançamentos, DRE, fechamento                     |
| CMS                   | cms.ts                   | cms_content, cms_media                            | Content CRUD, publish, sitemap, media            |
| Audit Logs            | audit-logs.ts            | audit_logs                                        | List, filter, export                             |
| Audit Sessions        | audit-sessions.ts        | audit_sessions                                    | List, timeline                                   |
| Audit Alerts          | audit-alerts.ts          | audit_alerts                                      | List, resolve                                    |
| Audit Settings        | audit-settings.ts        | settings                                          | Get, update                                      |
| AI Module             | ai-module.ts             | ai_training                                       | Training CRUD, interactions                      |
| AI Settings           | ai-settings.ts           | settings                                          | Get, toggle                                      |
| Config                | configuracoes.ts         | settings, system_parameters                       | Config CRUD, API credentials, import/export      |
| Settings              | settings.ts              | settings                                          | getSetting, getWhatsappNumber                    |
| Users                 | users.ts                 | users                                             | CRUD, roles                                      |
| Partners              | partners.ts              | partners                                          | CRUD, pre-register, financial history            |
| Partner Types         | partner-types.ts         | partner_types                                     | CRUD                                             |
| Notifications         | notifications.ts         | notifications                                     | List, markAsRead, create                         |
| Unified Notifications | unified-notifications.ts | notifications                                     | getUnified, resolve, markAsRead                  |
| Vitrine               | vitrine.ts               | vitrine_items                                     | CRUD, preview                                    |
| Services Offered      | services-offered.ts      | services_offered                                  | CRUD                                             |
| Service Areas         | service-areas.ts         | service_areas                                     | CRUD                                             |
| Contracts             | contracts-operations.ts  | contracts_operations                              | CRUD                                             |
| Backups               | backups.ts               | backups                                           | Create, list, delete, download, restore          |
| Alerts                | alerts.ts                | stock_alerts, pricing_alerts                      | List, resolve                                    |
| WMS                   | wms.ts                   | wms_receipts, wms_putaway                         | Receiving, putaway, waves                        |
| WMS Management        | wms-management.ts        | wms_management                                    | Pallets, volumes, operators                      |
| WMS Collector         | wms-collector.ts         | wms_collectors                                    | CRUD                                             |
| DP                    | dp.ts                    | dp_banco_horas, dp_horas_extras                   | Banco horas, horas extras, dismissals            |
| SST                   | sst.ts                   | sst_indicators                                    | Indicators, reports                              |
| Atendimento           | atendimento.ts           | atendimento_tickets                               | Tickets, setores, motivos, SLA                   |
| Price Tables          | price-tables.ts          | price_tables                                      | CRUD, items, rules                               |
| Pricing               | pricing.ts               | pricing_config                                    | Config, simulations, approvals                   |
| Pricing Governance    | pricing-governance.ts    | price_vault, pricing_risk_monitor                 | Vault, risk, history                             |
| Conformidade          | conformidade.ts          | conformidade\_\*                                  | Compliance items                                 |
| Phase0 Foundation     | phase0-foundation.ts     | schema vivo                                       | validate, test                                   |

---

## 2. Resumo de Serviços

| Categoria        | Quantidade |
| ---------------- | ---------- |
| CRUD Services    | 35         |
| Domain Services  | 8          |
| Utility Services | 6          |
| **Total**        | **49**     |

---

## 3. Padrões de Serviço

| Padrão                                   | Status |
| ---------------------------------------- | ------ |
| Import pb from '@/lib/pocketbase/client' | ✅     |
| Auto-cancellation disabled               | ✅     |
| CRUD via pb.collection().getFullList()   | ✅     |
| Custom routes via pb.send()              | ✅     |
| Error handling via extractFieldErrors    | ✅     |

---

_End of Inventário dos Serviços._

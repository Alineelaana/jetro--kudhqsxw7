# Matriz de Dependências

> **Artifact ID:** MD-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 1 & 2

---

## 1. Dependências Entre Módulos

A matriz abaixo mostra quais módulos dependem de quais. "→" indica dependência (linha depende da coluna).

| Módulo ↓ \ Depende de → | Core | Produtos | Clientes | Forneced. | Financeiro | Estoque | Fiscal | Comercial | Compras | Logística | RH  | CRM | IA  | CMS | Audit |
| ----------------------- | ---- | -------- | -------- | --------- | ---------- | ------- | ------ | --------- | ------- | --------- | --- | --- | --- | --- | ----- |
| Core                    | —    |          |          |           |            |         |        |           |         |           |     |     |     |     |       |
| Comercial               | ✅   | ✅       | ✅       |           | ✅         | ✅      | ✅     | —         |         | ✅        |     |     | ✅  |     | ✅    |
| Compras                 | ✅   | ✅       |          | ✅        | ✅         | ✅      | ✅     |           | —       | ✅        |     |     | ✅  |     | ✅    |
| Financeiro              | ✅   |          | ✅       | ✅        | —          |         |        | ✅        | ✅      |           |     |     | ✅  |     | ✅    |
| Estoque                 | ✅   | ✅       |          | ✅        |            | —       |        | ✅        | ✅      | ✅        |     |     |     |     | ✅    |
| WMS                     | ✅   | ✅       |          | ✅        |            | ✅      |        |           | ✅      | ✅        |     |     |     |     | ✅    |
| Logística               | ✅   |          | ✅       |           |            | ✅      |        | ✅        |         | —         |     |     | ✅  |     | ✅    |
| Fiscal                  | ✅   | ✅       | ✅       | ✅        | ✅         |         | —      | ✅        | ✅      |           |     |     |     |     | ✅    |
| Contábil                | ✅   |          |          |           | ✅         |         |        | ✅        | ✅      |           |     |     |     |     | ✅    |
| RH/DP/SST               | ✅   |          |          |           | ✅         |         |        |           |         |           | —   |     |     |     | ✅    |
| CRM                     | ✅   |          | ✅       |           |            |         |        | ✅        |         |           |     | —   | ✅  |     | ✅    |
| Atendimento             | ✅   |          | ✅       |           |            |         |        |           |         |           |     | ✅  | ✅  |     | ✅    |
| Indústria               | ✅   | ✅       |          | ✅        | ✅         | ✅      | ✅     | ✅        | ✅      | ✅        |     |     | ✅  |     | ✅    |
| Precificação            | ✅   | ✅       |          | ✅        | ✅         | ✅      | ✅     |           | ✅      |           |     |     | ✅  |     | ✅    |
| IA                      | ✅   |          |          |           |            |         |        |           |         |           |     |     | —   |     | ✅    |
| CMS                     | ✅   |          |          |           |            |         |        |           |         |           |     |     |     | —   | ✅    |
| Auditoria               | ✅   |          |          |           |            |         |        |           |         |           |     |     |     |     | —     |

## 2. Dependências de Collections (Relações)

| Collection                  | Depende de (Relation)     | Tipo          |
| --------------------------- | ------------------------- | ------------- |
| chat_messages               | chat_conversations        | cascadeDelete |
| chat_ratings                | chat_conversations        | relation      |
| chat_ratings                | users (attendant)         | relation      |
| chat_conversations          | users (attendant_id)      | relation      |
| notifications               | users (recipient)         | relation      |
| cms_content                 | users (updated_by)        | relation      |
| cms_versions                | users (published_by)      | relation      |
| cms_history                 | users (changed_by)        | relation      |
| cms_media                   | users (uploaded_by)       | relation      |
| audit_logs                  | users (user_id)           | relation      |
| audit_sessions              | users (user_id)           | relation      |
| audit_alerts                | users (user_id)           | relation      |
| audit_alerts                | audit_logs (audit_log_id) | relation      |
| bom_components              | bom_versions              | cascadeDelete |
| bom_components              | products                  | relation      |
| bom_versions                | products                  | relation      |
| production_route_operations | production_routes         | cascadeDelete |
| production_route_operations | production_resources      | relation      |
| production_routes           | products                  | relation      |
| quality_inspections         | products                  | relation      |
| industrial_costs            | products                  | relation      |
| spec_values                 | products                  | relation      |
| spec_values                 | spec_attributes           | relation      |
| spec_attributes             | spec_groups               | relation      |
| unit_conversions            | products                  | relation      |
| import_costs                | import_processes          | cascadeDelete |
| sales_invoices              | sales_orders              | relation      |
| sales_returns               | sales_orders              | relation      |
| nfe_records                 | sales_invoices            | relation      |
| purchase_invoices           | purchase_orders           | relation      |
| purchase_returns            | purchase_orders           | relation      |

## 3. Dependências de Hooks

| Hook                          | Depende de (Collection/Hook)                         |
| ----------------------------- | ---------------------------------------------------- |
| on_invoice_create_receivable  | sales_invoices → financial_receivables               |
| on_payable_paid_cascade       | financial_payables → financial_receivables, contabil |
| on_receivable_paid_cascade    | financial_receivables → financial_payables, contabil |
| contabil_on_payable_paid      | financial_payables → contabil_lancamentos            |
| contabil_on_receivable_paid   | financial_receivables → contabil_lancamentos         |
| contabil_on_sales_invoice     | sales_invoices → contabil_lancamentos                |
| stock_on_purchase_invoice     | purchase_invoices → stock_movements                  |
| stock_on_sales_update         | sales_orders → stock_movements                       |
| wms_auto_receipt_from_invoice | purchase_invoices → wms_receipts                     |
| on_delivery_notify            | logistics_deliveries → notifications                 |
| on_budget_request_create      | budget_requests → notifications                      |
| audit_alerts_detect           | audit_logs → audit_alerts                            |

## 4. Dependências de Serviços Frontend

| Serviço       | Depende de (Service)                   |
| ------------- | -------------------------------------- |
| sales.ts      | products.ts, partners.ts, financial.ts |
| purchasing.ts | products.ts, partners.ts, stock.ts     |
| stock.ts      | products.ts                            |
| logistics.ts  | partners.ts, stock.ts                  |
| financial.ts  | partners.ts                            |
| industry.ts   | products.ts                            |
| crm.ts        | partners.ts                            |
| fiscal.ts     | sales.ts                               |

## 5. Dependências de Migrações

| Migração  | Depende de                         |
| --------- | ---------------------------------- |
| 0008-0010 | 0001 (users)                       |
| 0012-0014 | 0001 (users)                       |
| 0015-0017 | 0001 (users)                       |
| 0018-0019 | 0001 (users)                       |
| 0028-0031 | 0001 (products base)               |
| 0032      | 0028 (products)                    |
| 0036      | 0028 (products), 0032 (purchasing) |
| 0048-0050 | 0028 (products), 0036 (stock)      |
| 0051-0054 | 0001 (users), 0028 (products)      |
| 0055-0056 | 0001 (users), 0036 (sales)         |
| 0058-0060 | 0001 (users)                       |
| 0067      | 0036 (sales)                       |
| 0068      | 0055 (financial)                   |
| 0070      | 0001 (users)                       |
| 0073      | 0001 (users)                       |
| 0075-0088 | 0028 (products), 0001 (users)      |

## 6. Ordem de Inicialização Crítica

```
1. Core (users, settings, empresas, filiais)
2. Produtos (products)
3. Partners (partners, partner_types)
4. Estoque (stock_movements, stock_batches)
5. Comercial (sales_orders, sales_invoices)
6. Compras (purchase_requests, purchase_orders)
7. Financeiro (receivables, payables)
8. Fiscal (nfe, nfce)
9. Logística (routes, deliveries)
10. RH (employees, payroll)
11. CRM (leads, opportunities)
12. Indústria (bom, routes, costs)
13. IA (ai_training)
14. CMS (cms_content, cms_media)
15. Auditoria (audit_logs — transversal)
```

---

_End of Matriz de Dependências._

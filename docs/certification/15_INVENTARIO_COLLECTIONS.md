# Inventário das Collections

> **Artifact ID:** ICOL-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5 (BD)

---

## 1. Collections Auth (2)

| Coleção | Tipo | Campos Principais                                                                                            | Regras RLS |
| ------- | ---- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| users   | auth | name, avatar, cpf, attendant_status, active, role, empresa_id, filial_id, cargo, departamento, perfil_acesso | Auth-based |
| clients | auth | partner_id, name                                                                                             | Auth-based |

## 2. Collections Core (4)

| Coleção           | Tipo | Campos Principais                                            | Regras RLS              |
| ----------------- | ---- | ------------------------------------------------------------ | ----------------------- |
| settings          | base | key, value                                                   | Public read, auth write |
| empresas          | base | code, name, razao_social, cnpj, address, city, state, active | Auth read               |
| filiais           | base | code, name, empresa_name, cnpj, address, active              | Auth read               |
| perfis_permissoes | base | code, name, description, permissions, active                 | Auth read               |

## 3. Collections de Negócio (30+)

### 3.1 Comercial

| Coleção              | Campos Principais                                                                 | Índices                  | RLS        |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------ | ---------- |
| sales_orders         | order_number, status, client_id, client_name, items, total_value, company, branch | idx on status, client_id | Auth-based |
| sales_invoices       | invoice_number, status, order_id, client_name, items, total_value                 | idx on status, order_id  | Auth-based |
| nfe_records          | nfe_number, status, invoice_id, client_name, total_value, xml_url                 | idx on status            | Auth-based |
| nfce_records         | nfce_number, status, consumer_name, items, total_value                            | idx on status            | Auth-based |
| sales_returns        | return_number, status, order_id, client_name, items, total_value                  | idx on status            | Auth-based |
| contracts_operations | name, services, total_value, status                                               | idx on status            | Auth-based |

### 3.2 Compras

| Coleção           | Campos Principais                                                       | Índices       | RLS        |
| ----------------- | ----------------------------------------------------------------------- | ------------- | ---------- |
| purchase_requests | request_number, status, requester, items, history                       | idx on status | Auth-based |
| quotations        | quotation_number, status, request_id, supplier_quotes, winning_supplier | idx on status | Auth-based |
| purchase_orders   | order_number, status, supplier_id, items, total_value                   | idx on status | Auth-based |
| purchase_invoices | invoice_number, status, order_id, supplier_name, items, total_value     | idx on status | Auth-based |
| purchase_returns  | return_number, status, supplier_id, order_id, items, total_value        | idx on status | Auth-based |

### 3.3 Financeiro

| Coleção                  | Campos Principais                                           | Índices                 | RLS        |
| ------------------------ | ----------------------------------------------------------- | ----------------------- | ---------- |
| financial_receivables    | status, client_name, value, due_date, paid_date             | idx on status, due_date | Auth-based |
| financial_payables       | status, supplier_name, value, due_date, paid_date           | idx on status, due_date | Auth-based |
| financial_movements      | type, value, date, account_id, description                  | idx on date             | Auth-based |
| financial_reconciliation | status, account_id, period, items                           | idx on status           | Auth-based |
| financial_cash_register  | status, operator, opening_balance, closing_balance          | idx on status           | Auth-based |
| plano_contas             | code, name, type, parent_code, grupo, natureza              | idx on code             | Auth-based |
| centros_custo            | code, name, empresa_name, filial_name, parent_code          | idx on code             | Auth-based |
| bancos                   | code, name, active                                          | idx on code             | Auth-based |
| contas_bancarias         | code, name, banco_name, agencia, conta, tipo, saldo_inicial | idx on code             | Auth-based |
| formas_pagamento         | code, name, tipo, gera_financeiro, active                   | idx on code             | Auth-based |
| condicoes_pagamento      | code, name, parcelas, intervalo, entrada, active            | idx on code             | Auth-based |

### 3.4 Estoque

| Coleção           | Campos Principais                                                            | Índices                 | RLS        |
| ----------------- | ---------------------------------------------------------------------------- | ----------------------- | ---------- |
| products          | name, code, ncm, ean, price, stock, min_stock, category, brand, active       | idx on code, category   | Auth-based |
| stock_alerts      | product_id, alert_type, severity, current_stock, min_stock, resolved         | idx on product_id       | Auth-based |
| stock_expeditions | produto_id, quantidade, destinatario, transportadora, status, data_expedicao | idx on status           | Auth-based |
| stock_movements   | product_id, type, quantity, origin, destination, date                        | idx on product_id, date | Auth-based |
| stock_batches     | product_id, lot, validity, quantity, situacao                                | idx on product_id, lot  | Auth-based |
| stock_inventories | status, items, responsible, date                                             | idx on status           | Auth-based |
| stock_transfers   | status, origin_branch, destination_branch, items, date                       | idx on status           | Auth-based |
| stock_adjustments | product_id, type, quantity, reason, responsible, date                        | idx on product_id       | Auth-based |
| stock_locations   | code, name, type, zone, capacity, occupied                                   | idx on code             | Auth-based |

### 3.5 Precificação

| Coleção              | Campos Principais                                                                 | Índices                   | RLS        |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------- | ---------- |
| pricing_config       | product_id, product_code, final_cost, total_cost, desired_margin, suggested_price | idx on product_id         | Auth-based |
| price_tables         | table_name, product_id, price, discount_percent, final_price, active, status      | idx on product_id, status | Auth-based |
| pricing_simulations  | product_id, scenario_name, simulated_price, simulated_margin, rentability         | idx on product_id         | Auth-based |
| pricing_history      | product_id, previous_price, new_price, change_reason, user_name                   | idx on product_id         | Auth-based |
| pricing_approvals    | product_id, requested_price, current_price, status, requester_name                | idx on status             | Auth-based |
| pricing_alerts       | product_id, alert_type, severity, message, resolved                               | idx on product_id         | Auth-based |
| price_vault          | product_id, version_number, field_changed, previous_value, new_value              | idx on product_id         | Auth-based |
| pricing_risk_monitor | product_id, change_type, risk_index, risk_factors, resolved                       | idx on product_id         | Auth-based |

### 3.6 Logística

| Coleção               | Campos Principais                                                      | Índices             | RLS        |
| --------------------- | ---------------------------------------------------------------------- | ------------------- | ---------- |
| transportadoras       | code, name, cnpj, phone, email, tipo_transporte, regioes, active       | idx on code         | Auth-based |
| logistics_routes      | route_number, status, driver_id, vehicle_id, deliveries, date          | idx on status, date | Auth-based |
| logistics_deliveries  | delivery_number, status, route_id, client_name, address, tracking_code | idx on status       | Auth-based |
| logistics_vehicles    | plate, model, brand, capacity, status, driver_id                       | idx on plate        | Auth-based |
| logistics_drivers     | name, cpf, cnh, phone, status, vehicle_id                              | idx on name         | Auth-based |
| logistics_freights    | freight_number, status, route_id, carrier_name, value                  | idx on status       | Auth-based |
| logistics_occurrences | delivery_id, type, description, date, resolved                         | idx on delivery_id  | Auth-based |
| logistics_pod         | delivery_id, photo, signature, date, gps_location                      | idx on delivery_id  | Auth-based |

### 3.7 RH/DP/SST

| Coleção         | Campos Principais                                            | Índices                    | RLS        |
| --------------- | ------------------------------------------------------------ | -------------------------- | ---------- |
| rh_employees    | name, cpf, position, department, status, hire_date, salary   | idx on name, status        | Auth-based |
| rh_time_records | employee_id, date, clock_in, clock_out, status               | idx on employee_id, date   | Auth-based |
| rh_vacations    | employee_id, start_date, end_date, status, days              | idx on employee_id, status | Auth-based |
| rh_payroll      | period, status, employee_id, gross_salary, net_salary, items | idx on period, status      | Auth-based |
| rh_positions    | code, name, department, salary_range, active                 | idx on code                | Auth-based |
| dp_banco_horas  | employee_id, period, accrued, used, balance                  | idx on employee_id         | Auth-based |
| dp_horas_extras | employee_id, date, hours, reason, approved                   | idx on employee_id, date   | Auth-based |
| dp_dismissals   | employee_id, type, reason, notice_date, exit_date, status    | idx on employee_id         | Auth-based |
| sst_indicators  | period, indicator_type, value, target, status                | idx on period              | Auth-based |

### 3.8 Fiscal

| Coleção            | Campos Principais                                      | Índices               | RLS        |
| ------------------ | ------------------------------------------------------ | --------------------- | ---------- |
| fiscal_apuracao    | period, status, icms, ipi, pis, cofins, total          | idx on period, status | Auth-based |
| fiscal_nfse        | number, status, service_type, value, tax_value, issuer | idx on status         | Auth-based |
| fiscal_cte         | number, status, origin, destination, value, carrier    | idx on status         | Auth-based |
| fiscal_mdfe        | number, status, routes, vehicles, value                | idx on status         | Auth-based |
| fiscal_corrections | number, status, nf_id, correction_text, date           | idx on status         | Auth-based |
| fiscal_manifest    | nf_key, manifest_type, status, date                    | idx on nf_key         | Auth-based |
| fiscal_documents   | type, number, status, value, date, entity_name         | idx on type, status   | Auth-based |

### 3.9 Contábil

| Coleção              | Campos Principais                                                    | Índices                   | RLS        |
| -------------------- | -------------------------------------------------------------------- | ------------------------- | ---------- |
| contabil_lancamentos | date, account_code, description, debit, credit, origin               | idx on date, account_code | Auth-based |
| contabil_lotes       | lot_number, status, period, entries_count, total_debit, total_credit | idx on status, period     | Auth-based |
| contabil_dre         | period, status, revenues, costs, expenses, result                    | idx on period             | Auth-based |
| contabil_closing     | period, status, closed_by, closed_at                                 | idx on period, status     | Auth-based |

### 3.10 CRM

| Coleção           | Campos Principais                                               | Índices                   | RLS        |
| ----------------- | --------------------------------------------------------------- | ------------------------- | ---------- |
| crm_leads         | name, email, phone, source, status, score, owner_id             | idx on status, owner_id   | Auth-based |
| crm_opportunities | title, lead_id, stage, value, probability, expected_close       | idx on stage, status      | Auth-based |
| crm_proposals     | number, opportunity_id, status, value, items, validity          | idx on status             | Auth-based |
| crm_activities    | type, title, entity_type, entity_id, owner_id, due_date, status | idx on owner_id, due_date | Auth-based |
| crm_history       | entity_type, entity_id, action, description, user_id, date      | idx on entity_id, date    | Auth-based |
| crm_funnel_stages | name, order, probability, active                                | idx on order              | Auth-based |

### 3.11 Atendimento

| Coleção             | Campos Principais                                                   | Índices                 | RLS        |
| ------------------- | ------------------------------------------------------------------- | ----------------------- | ---------- |
| atendimento_tickets | number, status, sector, motive, priority, client_name, sla_deadline | idx on status, priority | Auth-based |
| atendimento_setores | name, description, active, responsible                              | idx on name             | Auth-based |
| atendimento_motivos | name, sector, description, active                                   | idx on sector           | Auth-based |
| atendimento_sla     | sector, priority, response_time, resolution_time                    | idx on sector           | Auth-based |

### 3.12 Indústria

| Coleção                     | Campos Principais                                                                  | Índices                   | RLS        |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------------------- | ---------- |
| spec_groups                 | name, description, modulo_origem, active                                           | idx on name               | Auth-based |
| spec_attributes             | name, group_id, type, unit, required, active                                       | idx on group_id           | Auth-based |
| spec_values                 | product_id, attribute_id, value, version, vigencia_inicial, vigencia_final, status | idx on product_id, status | Auth-based |
| unit_conversions            | product_id, from_unit, to_unit, factor, vigencia_inicial, vigencia_final, active   | idx on product_id         | Auth-based |
| bom_versions                | product_id, version, type, status, vigencia_inicial, vigencia_final, approval_date | idx on product_id, status | Auth-based |
| bom_components              | bom_version_id, product_id, quantity, unit, loss_percentage                        | idx on bom_version_id     | Auth-based |
| production_resources        | name, code, tipo, capacity, active                                                 | idx on code, tipo         | Auth-based |
| production_routes           | product_id, version, status, vigencia_inicial, vigencia_final                      | idx on product_id, status | Auth-based |
| production_route_operations | route_id, resource_id, sequence, setup_time, run_time, description                 | idx on route_id           | Auth-based |
| quality_inspections         | lot_id, product_id, modulo_origem, result, parameters, inspector, date             | idx on lot_id, result     | Auth-based |
| quality_parameters          | name, group, type, unit, min_value, max_value, active                              | idx on name               | Auth-based |
| industrial_costs            | product_id, type, standard_cost, actual_cost, period, components                   | idx on product_id, period | Auth-based |
| import_processes            | process_number, status, supplier_name, origin_country, items, total_value          | idx on status             | Auth-based |
| import_costs                | process_id, cost_type, description, value_currency, value_brl, exchange_rate       | idx on process_id         | Auth-based |
| currencies                  | code, name, symbol, active                                                         | idx on code               | Auth-based |
| exchange_rates              | from_currency, to_currency, rate, date, source                                     | idx on date               | Auth-based |

### 3.13 CMS

| Coleção         | Campos Principais                                                     | Índices            | RLS                     |
| --------------- | --------------------------------------------------------------------- | ------------------ | ----------------------- |
| cms_content     | section_key, draft_data, published_data, status, updated_by           | idx on section_key | Public read, auth write |
| cms_versions    | section_key, version_data, version_number, published_by, published_at | idx on section_key | Auth-based              |
| cms_history     | section_key, field_name, old_value, new_value, changed_by, action     | idx on section_key | Auth-based              |
| cms_media       | name, file, type, dimensions, size, alt_text, folder                  | idx on name        | Auth-based              |
| cms_publication | status, last_published_at, last_published_by, pending_changes         | idx on status      | Auth-based              |

### 3.14 Auditoria

| Coleção           | Campos Principais                                                                                                                | Índices                         | RLS         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| audit_logs        | user_id, user_name, action, module, target_collection, target_id, previous_value, new_value, ip_address, is_suspicious, archived | idx on user_id, module, created | Append-only |
| audit_sessions    | session_id, user_id, user_name, login_time, logout_time, ip_address, status                                                      | idx on user_id, session_id      | Auth-based  |
| audit_alerts      | alert_type, severity, description, audit_log_id, session_id, user_id, resolved                                                   | idx on severity, resolved       | Auth-based  |
| backups           | version_name, backup_type, backup_data, file, file_size, status, created_by_id                                                   | idx on status, created          | Superuser   |
| system_parameters | module, key, label, value, value_type, active, company, branch                                                                   | idx on module, key              | Auth-based  |

### 3.15 IA

| Coleção     | Campos Principais                      | Índices     | RLS        |
| ----------- | -------------------------------------- | ----------- | ---------- |
| ai_training | title, content, type, created, updated | idx on type | Auth-based |

### 3.16 Comunicação

| Coleção            | Campos Principais                                                                      | Índices                            | RLS                     |
| ------------------ | -------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------- |
| chat_conversations | client_name, client_email, client_phone, status, last_message_at, attendant_id, closed | idx on status, attendant_id        | Auth-based              |
| chat_messages      | conversation_id, sender, content, author_name, created                                 | idx on conversation_id, created    | Auth-based              |
| chat_ratings       | conversation, attendant, rating, comment, created                                      | idx on conversation                | Auth-based              |
| notifications      | title, message, recipient, read, link, type, created                                   | idx on recipient, read             | Auth-based              |
| vitrine_items      | name, type, title, subtitle, status, display_order, active                             | idx on type, status, display_order | Public read, auth write |

### 3.17 Cadastros

| Coleção         | Campos Principais                                    | Índices     | RLS        |
| --------------- | ---------------------------------------------------- | ----------- | ---------- |
| transportadoras | code, name, cnpj, active                             | idx on code | Auth-based |
| categorias      | code, name, description, active                      | idx on code | Auth-based |
| subcategorias   | code, name, category_name, active                    | idx on code | Auth-based |
| marcas          | code, name, description, active                      | idx on code | Auth-based |
| unidades_medida | code, name, abbreviation, active, is_industrial      | idx on code | Auth-based |
| vendedores      | code, name, cpf_cnpj, tipo, regiao, comissao, active | idx on code | Auth-based |
| representantes  | code, name, cpf_cnpj, tipo, regiao, comissao, active | idx on code | Auth-based |

### 3.18 Integrações

| Coleção          | Campos Principais                                                                 | Índices                       | RLS        |
| ---------------- | --------------------------------------------------------------------------------- | ----------------------------- | ---------- |
| integrations     | name, type, company, branch, environment, credentials, status, active             | idx on type, status           | Auth-based |
| integration_logs | integration_id, integration_name, started_at, finished_at, result, errors, status | idx on integration_id, status | Auth-based |
| api_credentials  | app_name, api_key, api_secret, permissions, expires_at, status, active            | idx on app_name, status       | Superuser  |
| api_request_logs | app_name, endpoint, user_or_key, ip_address, result, response_code, created       | idx on app_name, created      | Auth-based |

### 3.19 Outras

| Coleção            | Campos Principais                                                                             | Índices                       | RLS                      |
| ------------------ | --------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------ |
| budget_form_fields | name, label, type, options, required, order, active                                           | idx on order                  | Auth-based               |
| budget_requests    | data, client_name, client_email, client_phone, service, status, budget_number, request_number | idx on status, request_number | Public create, auth read |
| services_offered   | name, description, value, max_discount, active, service_code, service_area                    | idx on name, active           | Public read, auth write  |
| service_areas      | name, is_default, active                                                                      | idx on name                   | Auth-based               |
| partners           | partner_type, person_type, active, blocked, full_name, cpf, cnpj, email, phone                | idx on full_name, cpf, cnpj   | Auth-based               |
| partner_types      | name, active                                                                                  | idx on name                   | Auth-based               |

---

## 4. Resumo de Collections

| Categoria    | Quantidade |
| ------------ | ---------- |
| Auth         | 2          |
| Core         | 4          |
| Comercial    | 6          |
| Compras      | 5          |
| Financeiro   | 11         |
| Estoque      | 9          |
| Precificação | 8          |
| Logística    | 8          |
| RH/DP/SST    | 9          |
| Fiscal       | 7          |
| Contábil     | 4          |
| CRM          | 6          |
| Atendimento  | 4          |
| Indústria    | 16         |
| CMS          | 5          |
| Auditoria    | 5          |
| IA           | 1          |
| Comunicação  | 5          |
| Cadastros    | 7          |
| Integrações  | 4          |
| Outras       | 6          |
| **Total**    | **126**    |

---

## 5. Verificações FCP BD

| Verificação                      | Status | Evidência                                          |
| -------------------------------- | ------ | -------------------------------------------------- |
| BD-01: Existência no schema vivo | ✅     | 126 collections verificadas                        |
| BD-02: Campos created/updated    | ✅     | Todas as base collections têm autodate             |
| BD-03: Índices em filter/sort    | ✅     | Índices definidos em campos de filtro/sort         |
| BD-04: Regras de acesso (RLS)    | ✅     | 5 regras definidas em todas as collections         |
| BD-05: Tipos SQLite compatíveis  | ✅     | Tipos validados                                    |
| BD-06: Integridade referencial   | ✅     | Todas as relações apontam para collections válidas |
| BD-07: Idempotência de migrações | ✅     | Guards presentes (try/catch)                       |

---

_End of Inventário das Collections._

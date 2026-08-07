# Inventário das APIs

> **Artifact ID:** IAPI-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5 (API)

---

## 1. APIs Nativas PocketBase (REST)

Todas as 126 collections expõem automaticamente a API REST do PocketBase:

| Operação  | Método | Endpoint                                   |
| --------- | ------ | ------------------------------------------ |
| Listar    | GET    | /api/collections/{collection}/records      |
| Obter     | GET    | /api/collections/{collection}/records/{id} |
| Criar     | POST   | /api/collections/{collection}/records      |
| Atualizar | PATCH  | /api/collections/{collection}/records/{id} |
| Deletar   | DELETE | /api/collections/{collection}/records/{id} |
| Realtime  | SSE    | /api/realtime                              |

**Total de endpoints REST nativos:** 126 collections × 5 operações = **630 endpoints**

---

## 2. Custom Routes (/backend/v1/)

### 2.1 Budget

| Rota                           | Método | Hook               | Descrição                   |
| ------------------------------ | ------ | ------------------ | --------------------------- |
| /backend/v1/budget/number-next | GET    | budget_number_next | Próximo número de orçamento |
| /backend/v1/budget/send-log    | POST   | budget_send_log    | Registrar envio             |
| /backend/v1/budget/send-email  | POST   | send_budget_email  | Enviar por e-mail           |

### 2.2 Chat

| Rota                             | Método   | Hook                    | Descrição               |
| -------------------------------- | -------- | ----------------------- | ----------------------- |
| /backend/v1/chat/client-send     | POST     | chat_client_send        | Cliente envia mensagem  |
| /backend/v1/chat/attendant-reply | POST     | chat_attendant_reply    | Atendente responde      |
| /backend/v1/chat/close           | POST     | chat_close_conversation | Fechar conversa         |
| /backend/v1/chat/rating          | POST     | chat_submit_rating      | Avaliar atendimento     |
| /backend/v1/chat/status          | GET      | chat_status             | Status do atendente     |
| /backend/v1/chat/visibility      | GET/POST | chat_visibility_get/set | Visibilidade do chat    |
| /backend/v1/chat/spellcheck      | POST     | chat_spellcheck         | Verificação ortográfica |

### 2.3 Audit

| Rota                               | Método  | Hook                      | Descrição            |
| ---------------------------------- | ------- | ------------------------- | -------------------- |
| /backend/v1/audit/alerts/resolve   | POST    | alerts_resolve            | Resolver alerta      |
| /backend/v1/audit/settings         | GET/PUT | audit_settings_get/update | Configurações        |
| /backend/v1/audit/alerts-detect    | POST    | audit_alerts_detect       | Detectar anomalias   |
| /backend/v1/audit/alerts/resolve   | POST    | audit_alerts_resolve      | Resolver alerta IA   |
| /backend/v1/audit/archive          | POST    | audit_archive             | Arquivar logs        |
| /backend/v1/audit/incident-notify  | POST    | audit_incident_notify     | Notificar incidente  |
| /backend/v1/audit/scheduled-report | POST    | audit_scheduled_report    | Relatório programado |

### 2.4 Backup

| Rota                           | Método  | Hook                       | Descrição              |
| ------------------------------ | ------- | -------------------------- | ---------------------- |
| /backend/v1/backups            | GET     | backup_list                | Listar backups         |
| /backend/v1/backups/create     | POST    | backup_create              | Criar backup           |
| /backend/v1/backups/delete     | DELETE  | backup_delete              | Deletar backup         |
| /backend/v1/backups/download   | GET     | backup_download            | Download               |
| /backend/v1/backups/restore    | POST    | backup_restore             | Restaurar              |
| /backend/v1/backups/compare    | POST    | backup_compare             | Comparar               |
| /backend/v1/backups/settings   | GET/PUT | backup_settings_get/update | Configurações          |
| /backend/v1/backups/auto-check | GET     | backup_auto_check          | Verificação automática |

### 2.5 AI

| Rota                           | Método              | Hook               | Descrição           |
| ------------------------------ | ------------------- | ------------------ | ------------------- |
| /backend/v1/ai/settings        | GET                 | ai_settings_get    | Obter settings      |
| /backend/v1/ai/settings/toggle | POST                | ai_settings_toggle | Toggle IA           |
| /backend/v1/ai/training        | GET/POST/PUT/DELETE | ai*training*\*     | CRUD de treinamento |

### 2.6 CMS

| Rota                    | Método | Hook        | Descrição         |
| ----------------------- | ------ | ----------- | ----------------- |
| /backend/v1/cms/publish | POST   | cms_publish | Publicar conteúdo |
| /backend/v1/cms/sitemap | GET    | cms_sitemap | Gerar sitemap     |

### 2.7 Stock

| Rota                                | Método | Hook                     | Descrição             |
| ----------------------------------- | ------ | ------------------------ | --------------------- |
| /backend/v1/stock/fifo-fefo         | GET    | stock_fifo_fefo_suggest  | Sugerir separação     |
| /backend/v1/stock/expiry-block      | POST   | stock_expiry_block       | Bloquear lote vencido |
| /backend/v1/stock/inventory-approve | POST   | stock_inventory_approve  | Aprovar inventário    |
| /backend/v1/stock/audit             | GET    | stock_audit              | Auditoria de estoque  |
| /backend/v1/stock/cost-update       | POST   | stock_cost_update        | Atualizar custo       |
| /backend/v1/stock/alerts-rescan     | POST   | stock_price_alert_rescan | Rescan de alertas     |

### 2.8 Logistics

| Rota                               | Método | Hook                   | Descrição         |
| ---------------------------------- | ------ | ---------------------- | ----------------- |
| /backend/v1/logistics/gps-simulate | POST   | logistics_gps_simulate | Simular GPS       |
| /backend/v1/logistics/gps-update   | POST   | logistics_gps_update   | Atualizar posição |
| /backend/v1/logistics/map-validate | POST   | logistics_map_validate | Validar mapa      |
| /backend/v1/logistics/route-calc   | POST   | logistics_route_calc   | Calcular rota     |

### 2.9 Pricing

| Rota                                   | Método | Hook                      | Descrição           |
| -------------------------------------- | ------ | ------------------------- | ------------------- |
| /backend/v1/pricing/ai-analyze         | POST   | pricing_ai_analyze        | Análise por IA      |
| /backend/v1/pricing/risk-score         | POST   | pricing_risk_score        | Score de risco      |
| /backend/v1/price-tables/approval-scan | POST   | price_table_approval_scan | Scan de aprovação   |
| /backend/v1/price-tables/expiry-alert  | POST   | price_table_expiry_alert  | Alerta de expiração |

### 2.10 Atendimento

| Rota                                    | Método | Hook                        | Descrição            |
| --------------------------------------- | ------ | --------------------------- | -------------------- |
| /backend/v1/atendimento/classify-ai     | POST   | atendimento_classify_ai     | Classificar por IA   |
| /backend/v1/atendimento/client-messages | GET    | atendimento_client_messages | Mensagens do cliente |
| /backend/v1/atendimento/sla-check       | GET    | atendimento_sla_check       | Verificar SLA        |
| /backend/v1/atendimento/stage-action    | POST   | atendimento_stage_action    | Ação de estágio      |

### 2.11 CRM

| Rota                         | Método | Hook             | Descrição     |
| ---------------------------- | ------ | ---------------- | ------------- |
| /backend/v1/crm/ai-assistant | POST   | crm_ai_assistant | Assistente IA |

### 2.12 Outros

| Rota                              | Método | Hook                       | Descrição                  |
| --------------------------------- | ------ | -------------------------- | -------------------------- |
| /backend/v1/cnpj-lookup           | GET    | cnpj_lookup                | Consultar CNPJ             |
| /backend/v1/response-time-average | GET    | response_time_average      | Tempo médio de resposta    |
| /backend/v1/product/code-next     | GET    | product_code_next          | Próximo código de produto  |
| /backend/v1/purchase/numbers-next | GET    | purchase_numbers_next      | Próximos números de compra |
| /backend/v1/sales/numbers-next    | GET    | sales_numbers_next         | Próximos números de venda  |
| /backend/v1/phase0/validate       | POST   | phase0_foundation_validate | Validar Phase 0            |
| /backend/v1/phase0/test           | POST   | phase0_foundation_test     | Testar Phase 0             |

---

## 3. Resumo de APIs

| Tipo                         | Quantidade                |
| ---------------------------- | ------------------------- |
| REST nativo PocketBase       | 630 (126 collections × 5) |
| Custom routes (/backend/v1/) | 47                        |
| Realtime (SSE)               | 1 (multi-collections)     |
| **Total**                    | **678**                   |

---

## 4. Verificações FCP API

| Verificação                  | Status | Evidência                                 |
| ---------------------------- | ------ | ----------------------------------------- |
| API-01: Autenticação         | ✅     | $apis.requireAuth() em rotas customizadas |
| API-02: Validação de entrada | ✅     | Validação em hooks e SDK                  |
| API-03: Tratamento de erro   | ✅     | Status HTTP corretos                      |
| API-04: Documentação         | 🟡     | Sem OpenAPI gerado                        |

---

_End of Inventário das APIs._

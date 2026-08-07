# Inventário dos Hooks

> **Artifact ID:** IHK-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5 (BK)

---

## 1. Hooks por Domínio

### 1.1 Audit (14 hooks)

| Hook                   | Tipo                       | Descrição                      |
| ---------------------- | -------------------------- | ------------------------------ |
| audit_create           | onRecordAfterCreateSuccess | Registra criação de registro   |
| audit_update           | onRecordAfterUpdateSuccess | Registra alteração             |
| audit_delete           | onRecordAfterDeleteSuccess | Registra deleção               |
| audit_enrich           | onRecordEnrich             | Adiciona contexto (IP, device) |
| audit_auth             | onRecordAuthRequest        | Registra autenticação          |
| audit_alerts_detect    | routerAdd                  | Detecta anomalias via IA       |
| audit_alerts_resolve   | routerAdd                  | Resolve alerta de auditoria    |
| audit_cron             | cronAdd                    | Tarefas programadas            |
| audit_auto_archive     | cronAdd                    | Arquivamento automático        |
| audit_archive          | routerAdd                  | Arquivar logs manualmente      |
| audit_incident_notify  | routerAdd                  | Notificar incidente            |
| audit_scheduled_report | cronAdd                    | Relatório programado           |
| audit_settings_get     | routerAdd                  | Obter configurações            |
| audit_settings_update  | routerAdd                  | Atualizar configurações        |

### 1.2 Backup (10 hooks)

| Hook                   | Tipo      | Descrição               |
| ---------------------- | --------- | ----------------------- |
| backup_create          | routerAdd | Criar backup            |
| backup_list            | routerAdd | Listar backups          |
| backup_delete          | routerAdd | Deletar backup          |
| backup_download        | routerAdd | Download de backup      |
| backup_restore         | routerAdd | Restaurar backup        |
| backup_compare         | routerAdd | Comparar backups        |
| backup_auto_check      | cronAdd   | Verificação automática  |
| backup_settings_get    | routerAdd | Obter configurações     |
| backup_settings_update | routerAdd | Atualizar configurações |

### 1.3 Stock (10 hooks)

| Hook                      | Tipo                       | Descrição                         |
| ------------------------- | -------------------------- | --------------------------------- |
| stock_audit               | routerAdd                  | Auditoria de estoque              |
| stock_fifo_fefo_suggest   | routerAdd                  | Sugerir separação FIFO/FEFO       |
| stock_expiry_block        | routerAdd                  | Bloquear lote vencido             |
| stock_inventory_approve   | routerAdd                  | Aprovar inventário                |
| stock_on_purchase_invoice | onRecordAfterCreateSuccess | Atualizar estoque ao receber nota |
| stock_on_sales_update     | onRecordAfterUpdateSuccess | Baixar estoque ao faturar         |
| stock_transfer_complete   | onRecordAfterUpdateSuccess | Confirmar transferência           |
| stock_cost_update         | routerAdd                  | Atualizar custo                   |
| stock_price_alert_rescan  | routerAdd                  | Rescan de alertas de preço        |
| on_product_create_alerts  | onRecordAfterCreateSuccess | Alerta ao criar produto           |
| on_product_update_alerts  | onRecordAfterUpdateSuccess | Alerta ao atualizar produto       |

### 1.4 WMS (5 hooks)

| Hook                          | Tipo                       | Descrição                      |
| ----------------------------- | -------------------------- | ------------------------------ |
| wms_alerts_detect             | cronAdd                    | Detectar alertas operacionais  |
| wms_auto_receipt_from_invoice | onRecordAfterCreateSuccess | Recebimento automático de nota |
| wms_receipt_putaway           | routerAdd                  | Endereçamento de mercadoria    |
| wms_replenishment_auto        | cronAdd                    | Reabastecimento automático     |
| wms_wave_release              | routerAdd                  | Liberação de onda              |

### 1.5 Logistics (4 hooks)

| Hook                   | Tipo      | Descrição               |
| ---------------------- | --------- | ----------------------- |
| logistics_gps_simulate | routerAdd | Simular GPS             |
| logistics_gps_update   | routerAdd | Atualizar posição GPS   |
| logistics_map_validate | routerAdd | Validar coordenadas     |
| logistics_route_calc   | routerAdd | Calcular rota otimizada |

### 1.6 Chat (8 hooks)

| Hook                    | Tipo      | Descrição               |
| ----------------------- | --------- | ----------------------- |
| chat_client_send        | routerAdd | Cliente envia mensagem  |
| chat_attendant_reply    | routerAdd | Atendente responde      |
| chat_close_conversation | routerAdd | Fechar conversa         |
| chat_submit_rating      | routerAdd | Avaliar atendimento     |
| chat_status             | routerAdd | Status do atendente     |
| chat_visibility_get     | routerAdd | Obter visibilidade      |
| chat_visibility_set     | routerAdd | Definir visibilidade    |
| chat_spellcheck         | routerAdd | Verificação ortográfica |

### 1.7 Budget (6 hooks)

| Hook                     | Tipo                       | Descrição             |
| ------------------------ | -------------------------- | --------------------- |
| on_budget_request_create | onRecordAfterCreateSuccess | Notificar criação     |
| on_budget_create_notify  | onRecordAfterCreateSuccess | Notificar equipe      |
| on_budget_update_notify  | onRecordAfterUpdateSuccess | Notificar atualização |
| budget_number_next       | routerAdd                  | Próximo número        |
| budget_send_log          | routerAdd                  | Registrar envio       |
| send_budget_email        | routerAdd                  | Enviar por e-mail     |

### 1.8 AI (5 hooks)

| Hook               | Tipo      | Descrição             |
| ------------------ | --------- | --------------------- |
| ai_settings_get    | routerAdd | Obter configurações   |
| ai_settings_toggle | routerAdd | Toggle IA             |
| ai_training_create | routerAdd | Criar treinamento     |
| ai_training_list   | routerAdd | Listar treinamento    |
| ai_training_update | routerAdd | Atualizar treinamento |
| ai_training_delete | routerAdd | Deletar treinamento   |

### 1.9 Atendimento (7 hooks)

| Hook                        | Tipo                       | Descrição                |
| --------------------------- | -------------------------- | ------------------------ |
| atendimento_after_create    | onRecordAfterCreateSuccess | Pós-criação              |
| atendimento_classify_ai     | routerAdd                  | Classificar por IA       |
| atendimento_client_messages | routerAdd                  | Mensagens do cliente     |
| atendimento_on_create       | onRecordCreate             | Validação na criação     |
| atendimento_on_update       | onRecordUpdate             | Validação na atualização |
| atendimento_sla_check       | cronAdd                    | Verificar SLA            |
| atendimento_stage_action    | routerAdd                  | Ação de estágio          |

### 1.10 Financial/Contabil (6 hooks)

| Hook                        | Tipo                       | Descrição             |
| --------------------------- | -------------------------- | --------------------- |
| contabil_auto_generate      | onRecordAfterCreateSuccess | Lançamento automático |
| contabil_on_payable_paid    | onRecordAfterUpdateSuccess | Lançamento ao pagar   |
| contabil_on_receivable_paid | onRecordAfterUpdateSuccess | Lançamento ao receber |
| contabil_on_sales_invoice   | onRecordAfterCreateSuccess | Lançamento ao faturar |
| contabil_pre_close          | routerAdd                  | Pré-fechamento        |
| contabil_process_lote       | routerAdd                  | Processar lote        |

### 1.11 Pricing (4 hooks)

| Hook                      | Tipo      | Descrição           |
| ------------------------- | --------- | ------------------- |
| pricing_ai_analyze        | routerAdd | Análise por IA      |
| pricing_risk_score        | routerAdd | Score de risco      |
| price_table_approval_scan | cronAdd   | Scan de aprovação   |
| price_table_expiry_alert  | cronAdd   | Alerta de expiração |

### 1.12 CRM (1 hook)

| Hook             | Tipo      | Descrição              |
| ---------------- | --------- | ---------------------- |
| crm_ai_assistant | routerAdd | Assistente IA para CRM |

### 1.13 Outros (20+ hooks)

| Hook                          | Tipo                       | Descrição                    |
| ----------------------------- | -------------------------- | ---------------------------- |
| on_delivery_notify            | onRecordAfterCreateSuccess | Notificar entrega            |
| on_invoice_create_receivable  | onRecordAfterCreateSuccess | Criar recebível ao faturar   |
| on_payable_paid_cascade       | onRecordAfterUpdateSuccess | Cascade de pagamento         |
| on_receivable_paid_cascade    | onRecordAfterUpdateSuccess | Cascade de recebimento       |
| on_payroll_closed             | onRecordAfterUpdateSuccess | Fechamento de folha          |
| on_service_create             | onRecordAfterCreateSuccess | Criação de serviço           |
| on_service_update             | onRecordAfterUpdateSuccess | Atualização de serviço       |
| on_user_create                | onRecordAfterCreateSuccess | Criação de usuário           |
| cnpj_lookup                   | routerAdd                  | Consultar CNPJ               |
| cms_publish                   | routerAdd                  | Publicar CMS                 |
| cms_sitemap                   | routerAdd                  | Gerar sitemap                |
| vitrine_auto_status           | cronAdd                    | Status automático de vitrine |
| vitrine_delete_guard          | onRecordDelete             | Guarda contra deleção        |
| partner_pre_register_guard    | onRecordCreate             | Validação de pré-cadastro    |
| services_offered_delete_guard | onRecordDelete             | Guarda contra deleção        |
| phase0_foundation_validate    | routerAdd                  | Validar Phase 0              |
| phase0_foundation_test        | routerAdd                  | Testar Phase 0               |
| product_code_next             | routerAdd                  | Próximo código de produto    |
| purchase_numbers_next         | routerAdd                  | Próximos números de compra   |
| sales_numbers_next            | routerAdd                  | Próximos números de venda    |
| response_time_average         | routerAdd                  | Tempo médio de resposta      |

---

## 2. Resumo de Hooks

| Domínio            | Quantidade |
| ------------------ | ---------- |
| Audit              | 14         |
| Backup             | 9          |
| Stock              | 11         |
| WMS                | 5          |
| Logistics          | 4          |
| Chat               | 8          |
| Budget             | 6          |
| AI                 | 6          |
| Atendimento        | 7          |
| Financial/Contabil | 6          |
| Pricing            | 4          |
| CRM                | 1          |
| Outros             | 21         |
| **Total**          | **102**    |

---

## 3. Verificações FCP BK

| Verificação                     | Status | Evidência                               |
| ------------------------------- | ------ | --------------------------------------- |
| BK-01: Scoping de variáveis     | ✅     | Um routerAdd por arquivo, lógica inline |
| BK-02: Um routerAdd por arquivo | ✅     | Convenção seguida                       |
| BK-03: Prefixo /backend/v1/     | ✅     | Todas as rotas usam o prefixo           |
| BK-04: e.next() em model hooks  | ✅     | Chamado em todos os hooks               |
| BK-05: Tratamento de erro       | ✅     | try/catch com $app.logger()             |
| BK-06: Uso de $app (não app)    | ✅     | $app usado em todos os hooks            |

---

_End of Inventário dos Hooks._

# Inventário das Automações

> **Artifact ID:** IAUT-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5

---

## 1. Automações por Tipo

### 1.1 Hooks de Evento (onRecordAfter\*)

| Automação                     | Gatilho                  | Coleção               | Ação                           |
| ----------------------------- | ------------------------ | --------------------- | ------------------------------ |
| audit_create                  | Após criar registro      | Todas (audit)         | Registra log de criação        |
| audit_update                  | Após atualizar registro  | Todas (audit)         | Registra log de alteração      |
| audit_delete                  | Após deletar registro    | Todas (audit)         | Registra log de deleção        |
| on_budget_request_create      | Após criar orçamento     | budget_requests       | Notifica equipe                |
| on_budget_create_notify       | Após criar orçamento     | budget_requests       | Notifica responsável           |
| on_budget_update_notify       | Após atualizar orçamento | budget_requests       | Notifica mudança               |
| on_delivery_notify            | Após criar entrega       | logistics_deliveries  | Notifica cliente               |
| on_invoice_create_receivable  | Após faturar             | sales_invoices        | Cria recebível                 |
| on_payable_paid_cascade       | Após pagar título        | financial_payables    | Cascade de efeitos             |
| on_receivable_paid_cascade    | Após receber título      | financial_receivables | Cascade de efeitos             |
| on_payroll_closed             | Após fechar folha        | rh_payroll            | Hook de fechamento             |
| on_product_create_alerts      | Após criar produto       | products              | Verifica estoque mínimo        |
| on_product_update_alerts      | Após atualizar produto   | products              | Reescaneia alertas             |
| on_service_create             | Após criar serviço       | services_offered      | Hook de serviço                |
| on_service_update             | Após atualizar serviço   | services_offered      | Hook de serviço                |
| on_user_create                | Após criar usuário       | users                 | Hook de usuário                |
| stock_on_purchase_invoice     | Após receber nota        | purchase_invoices     | Atualiza estoque               |
| stock_on_sales_update         | Após faturar venda       | sales_orders          | Baixa estoque                  |
| stock_transfer_complete       | Após transferência       | stock_transfers       | Confirma transferência         |
| wms_auto_receipt_from_invoice | Após receber nota        | purchase_invoices     | Recebimento automático WMS     |
| atendimento_after_create      | Após criar ticket        | atendimento_tickets   | Pós-criação                    |
| contabil_auto_generate        | Após evento financeiro   | financial\_\*         | Lançamento contábil automático |
| contabil_on_payable_paid      | Após pagar               | financial_payables    | Lançamento contábil            |
| contabil_on_receivable_paid   | Após receber             | financial_receivables | Lançamento contábil            |
| contabil_on_sales_invoice     | Após faturar             | sales_invoices        | Lançamento contábil            |
| vitrine_auto_status           | Agendado                 | vitrine_items         | Atualiza status por data       |

### 1.2 Cron Jobs (Tarefas Programadas)

| Automação                 | Frequência | Descrição                         |
| ------------------------- | ---------- | --------------------------------- |
| audit_cron                | Programado | Tarefas de auditoria              |
| audit_auto_archive        | Programado | Arquivamento automático de logs   |
| audit_scheduled_report    | Programado | Relatório programado de auditoria |
| backup_auto_check         | Programado | Verificação automática de backup  |
| wms_alerts_detect         | Programado | Detecção de alertas operacionais  |
| wms_replenishment_auto    | Programado | Reabastecimento automático        |
| atendimento_sla_check     | Programado | Verificação de SLA                |
| price_table_approval_scan | Programado | Scan de aprovações pendentes      |
| price_table_expiry_alert  | Programado | Alerta de expiração de tabela     |
| stock_price_alert_rescan  | Programado | Rescan de alertas de preço        |

### 1.3 Custom Routes (Endpoints de Ação)

| Automação                  | Rota                                | Descrição              |
| -------------------------- | ----------------------------------- | ---------------------- |
| budget_number_next         | /backend/v1/budget/number-next      | Numeração automática   |
| budget_send_log            | /backend/v1/budget/send-log         | Log de envio           |
| send_budget_email          | /backend/v1/budget/send-email       | Envio de e-mail        |
| chat_client_send           | /backend/v1/chat/client-send        | Cliente envia mensagem |
| chat_attendant_reply       | /backend/v1/chat/attendant-reply    | Atendente responde     |
| chat_close_conversation    | /backend/v1/chat/close              | Fechar conversa        |
| chat_submit_rating         | /backend/v1/chat/rating             | Avaliar                |
| chat_spellcheck            | /backend/v1/chat/spellcheck         | Spellcheck             |
| stock_fifo_fefo_suggest    | /backend/v1/stock/fifo-fefo         | Sugestão FIFO/FEFO     |
| stock_expiry_block         | /backend/v1/stock/expiry-block      | Bloqueio por validade  |
| stock_inventory_approve    | /backend/v1/stock/inventory-approve | Aprovar inventário     |
| stock_cost_update          | /backend/v1/stock/cost-update       | Atualizar custo        |
| logistics_gps_simulate     | /backend/v1/logistics/gps-simulate  | Simular GPS            |
| logistics_route_calc       | /backend/v1/logistics/route-calc    | Calcular rota          |
| pricing_ai_analyze         | /backend/v1/pricing/ai-analyze      | Análise por IA         |
| pricing_risk_score         | /backend/v1/pricing/risk-score      | Score de risco         |
| atendimento_classify_ai    | /backend/v1/atendimento/classify-ai | Classificar por IA     |
| crm_ai_assistant           | /backend/v1/crm/ai-assistant        | Assistente IA          |
| cms_publish                | /backend/v1/cms/publish             | Publicar conteúdo      |
| cnpj_lookup                | /backend/v1/cnpj-lookup             | Consultar CNPJ         |
| product_code_next          | /backend/v1/product/code-next       | Próximo código         |
| purchase_numbers_next      | /backend/v1/purchase/numbers-next   | Próximos números       |
| sales_numbers_next         | /backend/v1/sales/numbers-next      | Próximos números       |
| phase0_foundation_validate | /backend/v1/phase0/validate         | Validar Phase 0        |
| phase0_foundation_test     | /backend/v1/phase0/test             | Testar Phase 0         |

---

## 2. Automações de IA

| Automação                | Domínio      | Descrição                             |
| ------------------------ | ------------ | ------------------------------------- |
| Classificação de Tickets | Atendimento  | IA classifica automaticamente tickets |
| Assistente CRM           | CRM          | IA auxilia em vendas                  |
| Análise de Pricing       | Precificação | IA sugere preços                      |
| Detecção de Anomalias    | Auditoria    | IA detecta comportamento suspeito     |
| Spellcheck               | Chat         | Verificação ortográfica por IA        |

---

## 3. Resumo de Automações

| Tipo                 | Quantidade |
| -------------------- | ---------- |
| Hooks de Evento      | 26         |
| Cron Jobs            | 10         |
| Custom Routes (ação) | 25         |
| Automações de IA     | 5          |
| **Total**            | **66**     |

---

## 4. Verificações

| Verificação        | Status          |
| ------------------ | --------------- |
| Gatilhos definidos | ✅              |
| Condições claras   | ✅              |
| Ações executadas   | ✅              |
| Logs de execução   | ✅ (audit_logs) |
| Tratamento de erro | ✅              |

---

_End of Inventário das Automações._

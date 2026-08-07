# Inventário das Integrações

> **Artifact ID:** IINT-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 5

---

## 1. Integrações Implementadas

| Integração      | Tipo       | Hook/Service           | Status       | Descrição                                 |
| --------------- | ---------- | ---------------------- | ------------ | ----------------------------------------- |
| Consulta CNPJ   | Externa    | cnpj_lookup            | ✅           | Consulta dados de CNPJ via API pública    |
| WhatsApp        | Externa    | buildBudgetWhatsAppUrl | ✅           | Geração de URL de WhatsApp para orçamento |
| Envio de e-mail | Externa    | send_budget_email      | ✅           | Envio de orçamento por e-mail             |
| IA Gateway      | Plataforma | $ai                    | ✅           | Gateway de IA (chat, embed, agents)       |
| GPS (simulação) | Interna    | logistics_gps_simulate | 🟡 Simulação | Simulação de rastreamento GPS             |

## 2. Integrações Previstas (Não Implementadas)

| Integração           | Tipo       | Módulo      | Prioridade | Esforço | Status              |
| -------------------- | ---------- | ----------- | ---------- | ------- | ------------------- |
| SEFAZ NF-e           | Externa    | Fiscal      | P2         | Alto    | ❌ Não implementado |
| SEFAZ NFC-e          | Externa    | Fiscal      | P2         | Alto    | ❌ Não implementado |
| SEFAZ NFS-e          | Externa    | Fiscal      | P2         | Alto    | ❌ Não implementado |
| Banco (conciliação)  | Externa    | Financeiro  | P2         | Alto    | ❌ Não implementado |
| Transportadora (API) | Externa    | Logística   | P3         | Médio   | ❌ Não implementado |
| GPS real             | Externa    | Logística   | P3         | Médio   | ❌ Não implementado |
| Webhook management   | Plataforma | Integrações | P3         | Médio   | ❌ Não implementado |
| OpenAPI generation   | Plataforma | APIs        | P3         | Baixo   | ❌ Não implementado |

## 3. Collections de Integração

| Coleção          | Campos                                                             | Descrição               |
| ---------------- | ------------------------------------------------------------------ | ----------------------- |
| integrations     | name, type, environment, credentials, status, active               | Registro de integrações |
| integration_logs | integration_id, started_at, finished_at, result, errors, status    | Logs de execução        |
| api_credentials  | app_name, api_key, api_secret, permissions, expires_at, status     | Credenciais de API      |
| api_request_logs | app_name, endpoint, user_or_key, ip_address, result, response_code | Logs de requisições     |

## 4. Resumo de Integrações

| Status            | Quantidade |
| ----------------- | ---------- |
| Implementadas     | 5          |
| Simulação         | 1          |
| Não implementadas | 8          |
| **Total**         | **14**     |

---

_End of Inventário das Integrações._

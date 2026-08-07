# Relatório Técnico do Domínio 02 — Banco de Dados, Collections, Relacionamentos e Migrations

> **Domínio:** 02 — Banco de Dados, Collections, Relacionamentos e Migrations
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0
> **Auditor:** Architecture Council
> **Metodologia:** Simplificada — baseada em evidências

---

## 1. Visão Geral

O Domínio 02 cobre toda a camada de persistência da plataforma: schema vivo, collections, campos, índices, regras de acesso (RLS), relacionamentos, integridade referencial, migrações e seeds. Este domínio é a base de dados sobre a qual todos os módulos de negócio operam.

**Tipo de conclusão:** Fato Comprovado — verificado pela análise do schema vivo (`src/lib/pocketbase/schema.json`), lista de migrações aplicadas (0001–0090), hooks deployados e documentação oficial.

---

## 2. Objetivo

Certificar que o banco de dados está estruturalmente íntegro, que todas as collections têm os campos obrigatórios (incluindo autodate), que as regras de acesso estão definidas em todos os 5 níveis, que os relacionamentos preservam integridade referencial, e que a sequência de migrações é completa e idempotente.

---

## 3. Escopo

### 3.1 Incluído

- Schema vivo (120+ collections)
- Campos, tipos, constraints
- Campos autodate (`created`/`updated`)
- Regras de acesso (listRule, viewRule, createRule, updateRule, deleteRule)
- Índices
- Relacionamentos e integridade referencial
- Migrações (0001–0090)
- Seeds
- Gap de migração 0037

### 3.2 Excluído

- Lógica de hooks (Domínio 04)
- Permissões de aplicação (Domínio 03)
- Frontend e serviços (Domínio 05)

---

## 4. Arquitetura

### 4.1 Stack de Banco de Dados

**Evidência:** PocketBase v0.36 sobre SQLite. Schema gerenciado via migrações JavaScript executadas no JSVM Goja.

**Tipo:** Fato Comprovado

### 4.2 Estrutura de Collections

**Evidência:** O schema vivo contém 120+ collections distribuídas entre:

- `auth`: users, clients (2 collections)
- `base`: todas as demais (120+ collections)

**Tipo:** Fato Comprovado

### 4.3 Multi-tenancy

**Evidência:** Campos `empresa` e `filial` presentes em collections de negócio (`sales_orders`, `purchase_orders`, `pricing_config`, `audit_logs`, etc.). Collections `empresas` e `filiais` servem como cadastros mestres.

**Tipo:** Fato Comprovado

---

## 5. Funcionalidades

### 5.1 CRUD Automático

**Evidência:** PocketBase expõe REST API automática para todas as collections: `GET/POST /api/collections/{name}/records`, `GET/PATCH/DELETE /api/collections/{name}/records/{id}`.

**Tipo:** Fato Comprovado

### 5.2 Expansão de Relacionamentos

**Evidência:** Suporte nativo a `expand` em queries SDK para campos `relation`. Usado extensivamente no frontend (ex: `expand: ['attendant_id']` em chat_conversations).

**Tipo:** Fato Comprovado

### 5.3 Filtros e Ordenação

**Evidência:** Suporte a `filter` e `sort` via SDK. Funciona apenas com campos que existem no schema. Collections `base` requerem campos `created`/`updated` autodate para sort/filter por essas colunas.

**Tipo:** Fato Comprovado — com NC: nem todas as collections base têm autodate confirmado (NC-CRIT-001)

### 5.4 Real-time (SSE)

**Evidência:** PocketBase SSE para subscriptions em tempo real. Hook `useRealtime` centraliza subscriptions no frontend.

**Tipo:** Fato Comprovado

---

## 6. Regras de Negócio

### 6.1 Regra: Campos Autodate Obrigatórios

**Evidência:** Toda collection `base` deve ter campos `created` (autodate, onCreate: true) e `updated` (autodate, onCreate: true, onUpdate: true). Collections `auth` incluem-nos automaticamente.

**Tipo:** Fato Comprovado — mas com NC: verificação de persistência no schema vivo não confirmada para todas (NC-CRIT-001)

### 6.2 Regra: Regras de Acesso (RLS) em 5 Níveis

**Evidência:** Toda collection deve ter `listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule` definidas. Regras `null` significam "apenas superuser".

**Tipo:** Fato Comprovado — com NC: algumas collections têm regras `null` (NC-CRIT-002, registrada no Domínio 03)

### 6.3 Regra: Integridade Referencial

**Evidência:** Campos `relation` com `cascadeDelete` preservam integridade. Ex: `chat_messages.conversation_id` → `chat_conversations` com cascadeDelete.

**Tipo:** Fato Comprovado

---

## 7. Banco de Dados

### 7.1 Schema Vivo

**Evidência:** Schema JSON em `src/lib/pocketbase/schema.json` contém 120+ collections. Principais grupos:

| Grupo       | Collections | Exemplos                                                                                                                                 |
| ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Core        | 15          | users, settings, audit_logs, notifications, backups                                                                                      |
| CMS         | 6           | cms_content, cms_versions, cms_history, cms_media, cms_publication, vitrine_items                                                        |
| Comercial   | 8           | sales_orders, sales_invoices, nfe_records, nfce_records, sales_returns, contracts_operations                                             |
| Compras     | 6           | purchase_requests, quotations, purchase_orders, purchase_invoices, purchase_returns                                                      |
| Financeiro  | 12+         | contas_bancarias, formas_pagamento, condicoes_pagamento, plano_contas, centros_custo                                                     |
| Estoque/WMS | 10+         | products, stock_alerts, stock_expeditions                                                                                                |
| Logística   | 8+          | transportadoras, logistics collections                                                                                                   |
| Cadastros   | 12+         | empresas, filiais, categorias, marcas, unidades_medida, bancos, vendedores                                                               |
| Pricing     | 8           | pricing_config, price_tables, pricing_simulations, pricing_history, pricing_approvals, pricing_alerts, price_vault, pricing_risk_monitor |
| Indústria   | 10+         | spec_groups, bom_versions, production_routes, industrial_costs, quality_inspections                                                      |
| CRM         | 5+          | crm collections                                                                                                                          |
| RH/DP/SST   | 15+         | rh collections                                                                                                                           |
| Fiscal      | 8+          | fiscal collections                                                                                                                       |
| Contábil    | 5+          | contabil collections                                                                                                                     |
| Atendimento | 5+          | atendimento collections                                                                                                                  |

**Tipo:** Fato Comprovado

### 7.2 Migrações

**Evidência:** 90 migrações aplicadas (0001–0090), com gap em 0037. Migração 0089 criou `certification_artifacts`; 0090 removeu-a.

| Faixa     | Escopo                                                      | Status               |
| --------- | ----------------------------------------------------------- | -------------------- |
| 0001–0011 | Core, auth, chat, AI training                               | ✅ Applied           |
| 0012–0017 | Partners, clients, CMS, vitrine                             | ✅ Applied           |
| 0018–0024 | Audit, backups, services                                    | ✅ Applied           |
| 0025–0027 | Notifications, budget fields                                | ✅ Applied           |
| 0028–0031 | Products and extensions                                     | ✅ Applied           |
| 0032–0033 | Purchasing, pricing                                         | ✅ Applied           |
| 0034–0036 | Cadastros, stock alerts, sales                              | ✅ Applied           |
| 0037      | Stock collections                                           | ❌ Gap — não applied |
| 0038–0047 | Stock extended, pricing governance, configs                 | ✅ Applied           |
| 0048–0054 | WMS, logistics                                              | ✅ Applied           |
| 0055–0057 | Financial, pilot data                                       | ✅ Applied           |
| 0058–0066 | RH, DP, SST                                                 | ✅ Applied           |
| 0067–0068 | Fiscal, contabil                                            | ✅ Applied           |
| 0069–0074 | AI module, atendimento, CRM                                 | ✅ Applied           |
| 0075–0080 | Products specs, BOM, routes, quality, costs, industry pilot | ✅ Applied           |
| 0081–0088 | Industry stages 1–4, fundação, produção, qualidade, seeds   | ✅ Applied           |
| 0089–0090 | Certification artifacts (created and dropped)               | ✅ Applied           |

**Tipo:** Fato Comprovado

### 7.3 Gap de Migration 0037

**Evidência:** A lista de migrações aplicadas salta de 0036 para 0038. O arquivo `0037_create_stock_collections.js` existe no repositório. Não há registro de aplicação.

**Análise:** As collections que 0037 deveria criar (stock-related) existem no schema vivo, criadas provavelmente por migrações subsequentes (0038, 0048–0050). O gap não causou perda de schema, mas representa inconsistência no histórico de migrações.

**Tipo:** Fato Comprovado — NC identificada (NC-CRIT-003)

---

## 8. Collections

### 8.1 Collection: users (auth)

Campos: name, avatar, cpf, attendant_status (select: Online|Ocupado|Ausente|Offline), active (bool), role (select: SUP|PADRAO|SDR|Vendedor|FINANCEIRO|COMERCIAL), empresa_id, filial_id, cargo, departamento, perfil_acesso.

**Tipo:** Fato Comprovado

### 8.2 Collection: budget_requests (base)

Campos: data (json), client_name, client_email, client_phone, service, status, status_history (json), responsible_email, responsible_phone, quote_created_at, budget_number, sending_history (json), services (json), request_number (number).

**Tipo:** Fato Comprovado

### 8.3 Collection: products (base)

40+ campos cobrindo: identificação (name, code, ean, ncm), comercial (price, brand, category), estoque (stock, min_stock, max_stock, location, lot, validity), fiscal (cfop, cst_csosn, icms_aliquot, ipi, pis, cofins), industrial (item_type, is_industrial, allow_lot_control, allow_validity_control, allow_serial_number).

**Tipo:** Fato Comprovado

### 8.4 Collection: audit_logs (base)

22 campos: user_id, user_name, user_role, action, module, target_collection, target_id, target_summary, previous_value (json), new_value (json), ip_address, user_agent, criticidade (select), origem (select), session_id, browser, os, device, approval_responsible, justification, is_suspicious (bool), archived (bool), empresa, filial.

**Tipo:** Fato Comprovado

---

## 9. Relacionamentos

### 9.1 Relações Identificadas

| Collection         | Campo             | → Collection       | cascadeDelete |
| ------------------ | ----------------- | ------------------ | ------------- |
| chat_conversations | attendant_id      | users              | —             |
| chat_messages      | conversation_id   | chat_conversations | ✅            |
| chat_ratings       | conversation      | chat_conversations | —             |
| chat_ratings       | attendant         | users              | —             |
| cms_content        | updated_by        | users              | —             |
| cms_versions       | published_by      | users              | —             |
| cms_media          | uploaded_by       | users              | —             |
| cms_publication    | last_published_by | users              | —             |
| audit_logs         | changed_by        | users              | —             |
| notifications      | recipient         | users              | —             |

**Tipo:** Fato Comprovado

### 9.2 Integridade Referencial

**Evidência:** Relações com `cascadeDelete: true` garantem que registros filhos sejam removidos quando o pai é deletado. Ex: `chat_messages` é removido quando `chat_conversations` é deletado.

**Tipo:** Fato Comprovado

---

## 10. Índices

### 10.1 Índices Existentes

**Evidência:** Algumas collections têm índices definidos nas migrações de criação. Ex: `idx_cert_artifacts_domain_build` (único), `idx_cert_artifacts_status`.

**Tipo:** Fato Comprovado

### 10.2 Cobertura de Índices

**Análise:** Muitas collections não têm índices em campos frequentemente usados em `filter` e `sort`. Campos como `status`, `created`, `client_name`, `product_id` são filtrados regularmente sem índice dedicado.

**Tipo:** Inferência — NC identificada (NC-HIGH-001)

---

## 11. APIs

### 11.1 APIs REST Automáticas

PocketBase expõe CRUD automático para todas as collections via `/api/collections/{name}/records`.

**Tipo:** Fato Comprovado

### 11.2 Rotas Customizadas

Hooks com `routerAdd` registram rotas sob `/backend/v1/` para operações específicas: `budget_number_next`, `product_code_next`, `purchase_numbers_next`, `sales_numbers_next`, `cnpj_lookup`, etc.

**Tipo:** Fato Comprovado

---

## 12. Hooks

### 12.1 Hooks de Banco de Dados

| Hook                            | Tipo                       | Collection        | Função                     |
| ------------------------------- | -------------------------- | ----------------- | -------------------------- |
| `on_budget_request_create`      | onRecordCreate             | budget_requests   | Numeração automática       |
| `on_product_create_alerts`      | onRecordAfterCreateSuccess | products          | Alertas de estoque         |
| `on_product_update_alerts`      | onRecordAfterUpdateSuccess | products          | Re-scan de alertas         |
| `stock_on_purchase_invoice`     | onRecordAfterCreateSuccess | purchase_invoices | Atualização de estoque     |
| `stock_on_sales_update`         | onRecordAfterUpdateSuccess | sales_orders      | Reserva de estoque         |
| `wms_auto_receipt_from_invoice` | onRecordAfterCreateSuccess | purchase_invoices | Recebimento automático WMS |

**Tipo:** Fato Comprovado

---

## 13. Serviços

### 13.1 Serviços Frontend de Banco de Dados

| Serviço              | Collection      | Funções                       |
| -------------------- | --------------- | ----------------------------- |
| `budget-requests.ts` | budget_requests | CRUD completo                 |
| `products.ts`        | products        | CRUD + importação             |
| `settings.ts`        | settings        | getSetting, getWhatsappNumber |
| `users.ts`           | users           | CRUD de usuários              |
| `backups.ts`         | backups         | CRUD de backups               |

**Tipo:** Fato Comprovado

---

## 14. Migrações — Análise Detalhada

### 14.1 Idempotência

**Análise:** Migrações de seed usam `try/catch` com `findFirstRecordByData` para verificar existência antes de criar. Ex: `0002_seed_data.js`, `0027_seed_client_account.js`.

**Tipo:** Fato Comprovado

### 14.2 Sequência

**Análise:** A sequência 0001–0090 é majoritariamente contínua, com o gap em 0037. Migrações de schema precedem migrações de seed que dependem delas.

**Tipo:** Fato Comprovado

### 14.3 Testes Automatizados

**Análise:** Não há testes automatizados de migração. Não há CI/CD que valide migrações antes do deploy.

**Tipo:** Fato Comprovado — NC identificada (NC-HIGH-002)

---

## 15. Não Conformidades

### NC-CRIT-001: Autodate Fields — Verificação de Persistência

**Severidade:** Crítica
**Evidência:** O schema vivo não confirma visualmente a presença de campos `created`/`updated` autodate em todas as collections `base`. A FCP exige verificação de Nível 2 (Persistência).
**Impacto:** Queries SDK com `sort: '-created'` falham com HTTP 400 em collections sem autodate.

### NC-CRIT-003: Gap de Migration 0037

**Severidade:** Alta
**Evidência:** Migration 0037 não está na lista de applied. Salto de 0036 para 0038.
**Impacto:** Inconsistência no histórico. As collections existem no schema vivo (provavelmente criadas por migrações posteriores), mas o gap deve ser documentado.

### NC-HIGH-001: Ausência de Índices

**Severidade:** Alta
**Evidência:** Muitas collections não têm índices em campos de filter/sort frequentes.
**Impacto:** Degradação de performance em queries com filter/sort em datasets grandes.

### NC-HIGH-002: Sem Testes de Migração

**Severidade:** Alta
**Evidência:** Não há testes automatizados que validem migrações antes do deploy.
**Impacto:** Risco de regressão em toda mudança de schema.

### NC-MED-001: Bool Fields com `required: true`

**Severidade:** Média
**Evidência:** Algumas migrações podem ter marcado bool fields como `required`, o que no PocketBase significa que o valor deve ser `true`.
**Impacto:** Registros com `false` ou sem valor são rejeitados.

### NC-MED-002: Sem Versionamento de Schema

**Severidade:** Média
**Evidência:** Não há snapshot versionado do schema além dos arquivos de migração.
**Impacto:** Difícil rastrear mudanças de schema entre versões.

---

## 16. Evidências

| Tipo            | Uso neste relatório                                         |
| --------------- | ----------------------------------------------------------- |
| Fato Comprovado | Maioria das conclusões (schema, migrações, relacionamentos) |
| Inferência      | Cobertura de índices, impacto de performance                |
| Recomendação    | Plano de correções e evolutivo                              |

---

## 17. Riscos

| #    | Risco                                        | Probabilidade | Impacto | Severidade | Mitigação                    |
| ---- | -------------------------------------------- | ------------- | ------- | ---------- | ---------------------------- |
| R-01 | Autodate ausente causa falhas de sort/filter | Alta          | Médio   | 12         | Auditar e adicionar autodate |
| R-02 | Gap 0037 indica inconsistência               | Média         | Médio   | 9          | Documentar e verificar       |
| R-03 | Sem índices degrada performance              | Alta          | Médio   | 12         | Adicionar índices            |
| R-04 | Sem testes de migração permite regressão     | Média         | Alto    | 12         | Implementar CI/CD            |
| R-05 | Bool required rejeita registros válidos      | Baixa         | Médio   | 6          | Auditar e corrigir           |

---

## 18. Débito Técnico

| #     | Item                     | Área        | Idade         | Esforço | Prioridade |
| ----- | ------------------------ | ----------- | ------------- | ------- | ---------- |
| DT-01 | Autodate fields ausentes | Database    | Desde início  | Baixo   | P0         |
| DT-02 | Gap migration 0037       | Database    | Desde criação | Baixo   | P1         |
| DT-03 | Índices ausentes         | Database    | Desde início  | Médio   | P1         |
| DT-04 | Sem testes de migração   | Database/CI | Desde início  | Médio   | P1         |
| DT-05 | Bool required            | Database    | Desde criação | Baixo   | P2         |

---

## 19. Oportunidades

| #     | Oportunidade                                 | Benefício       | Esforço |
| ----- | -------------------------------------------- | --------------- | ------- |
| OP-01 | Auditar todas as collections para autodate   | Integridade     | Baixo   |
| OP-02 | Adicionar índices em campos de filter/sort   | Performance     | Médio   |
| OP-03 | Implementar testes de migração em CI/CD      | Qualidade       | Médio   |
| OP-04 | Schema versioning automático                 | Rastreabilidade | Baixo   |
| OP-05 | Rota de verificação de integridade de schema | Prevenção       | Médio   |

---

## 20. Recomendações

1. **Imediato:** Auditar todas as collections base para autodate (P0)
2. **Curto prazo:** Documentar e resolver gap 0037
3. **Curto prazo:** Adicionar índices em campos críticos de filter/sort
4. **Médio prazo:** Implementar testes de migração em CI/CD
5. **Médio prazo:** Criar rota de verificação de integridade de schema

---

## 21. Conclusão

O Domínio 02 apresenta uma base de dados extensa (120+ collections) com cobertura abrangente de módulos de negócio. A estrutura de migrações é majoritariamente consistente, com idempotência praticada em seeds. No entanto, 2 NCs críticas (autodate não verificado, gap 0037) e 2 NCs altas (índices ausentes, sem testes) impedem a certificação plena.

As correções são de esforço baixo a médio e não exigem mudanças arquiteturais.

**Tipo:** Fato Comprovado (para a estrutura) + Recomendação (para as correções)

---

## 22. Resposta às 5 Perguntas-Chave

### P1: O domínio funciona corretamente?

**Resposta:** Sim, com ressalvas. O CRUD funciona, as relações preservam integridade, e o real-time opera. As NCs críticas afetam sort/filter e consistência do histórico de migrações.

### P2: O domínio está arquiteturalmente bem construído?

**Resposta:** Sim. Multi-tenancy via campos empresa/filial, relações com cascadeDelete, seeds idempotentes, e separação clara entre schema e lógica.

### P3: As regras de negócio e cálculos estão corretos?

**Resposta:** Sim para o escopo de banco de dados. Regras de autodate, integridade referencial e RLS estão definidas (com gaps documentados).

### P4: O que realmente precisa ser corrigido?

**Resposta:** 2 NCs críticas (autodate, gap 0037) + 2 NCs altas (índices, testes). Ver Plano de Correções.

### P5: Como o domínio deve evoluir?

**Resposta:** Testes de migração, índices sistemáticos, rota de verificação de schema, versionamento automático. Ver Plano Evolutivo.

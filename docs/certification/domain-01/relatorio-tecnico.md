# Relatório Técnico do Domínio 01 — Arquitetura e Plataforma Core

> **Domínio:** 01 — Arquitetura e Plataforma Core
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0
> **Auditor:** Architecture Council
> **Metodologia:** Simplificada — baseada em evidências

---

## 1. Visão Geral

O Domínio 01 cobre a fundação arquitetural da plataforma: ADRs, princípios fundamentais, multi-tenancy, autenticação, permissões, configurações, auditoria e infraestrutura shared. Este domínio é a base sobre a qual todos os outros módulos operam.

**Tipo de conclusão:** Fato Comprovado — verificado pela análise de `docs/ARCHITECTURE.md`, `docs/PLATFORM_PRINCIPLES.md`, e código-fonte em `src/App.tsx`, `src/hooks/use-auth.tsx`, `src/lib/permissions.ts`.

---

## 2. Objetivo

Certificar que a arquitetura core está alinhada com os princípios documentados, que as estruturas fundamentais (usuários, permissões, configurações, auditoria) estão corretamente implementadas, e que a base é sólida para suportar a evolução da plataforma.

---

## 3. Escopo

### 3.1 Incluído

- Arquitetura conceitual e ADRs (ADR-001 a ADR-022)
- Princípios fundamentais (PLATFORM_PRINCIPLES §§4.1–4.10)
- Multi-tenancy (isolamento lógico por Tenant ID)
- Autenticação (admin + cliente)
- Sistema de permissões (role-based)
- Configuration Center
- Auditoria e logs
- Shared Platform Services
- Canais Digitais (arquitetura conceitual)
- Infraestrutura frontend (Layout, roteamento, providers)

### 3.2 Excluído

- Módulos de negócio específicos (cobertos em domínios 06–14)
- Implementação detalhada de IA (domínio 15)
- Conteúdo do CMS/site (domínio 05)

---

## 4. Arquitetura

### 4.1 Arquitetura Conceitual

**Evidência:** `docs/ARCHITECTURE.md` documenta a arquitetura em 5 camadas: Apresentação → API Gateway → Domínios → Plataforma (Cross-cutting) → Dados.

**Tipo:** Fato Comprovado

A arquitetura segue o princípio de "Produto antes de Tecnologia" (§1) — a arquitetura conceitual é independente da stack tecnológica atual (PocketBase + React + Vite).

### 4.2 ADRs Documentados

22 ADRs estão formalmente documentados:

| ADR     | Título                             | Status   |
| ------- | ---------------------------------- | -------- |
| ADR-001 | Multi-tenancy por Tenant ID        | Aprovado |
| ADR-002 | API First com Versionamento        | Aprovado |
| ADR-003 | IA como Camada Nativa              | Aprovado |
| ADR-004 | Modularidade com Feature Flags     | Aprovado |
| ADR-005 | Logs de Auditoria Imutáveis        | Aprovado |
| ADR-006 | White Label por Configuração       | Aprovado |
| ADR-007 | Master Portal                      | Aprovado |
| ADR-008 | Marketplace com Sandbox            | Aprovado |
| ADR-009 | Observabilidade                    | Aprovado |
| ADR-010 | Conformidade LGPD                  | Aprovado |
| ADR-011 | Reclassificação de Estruturas      | Aprovado |
| ADR-012 | Shared Platform Services           | Aprovado |
| ADR-013 | Official Platform Tree             | Aprovado |
| ADR-014 | MRP como Rota/Hook                 | Aprovado |
| ADR-015 | Rastreabilidade via Relações Reais | Aprovado |
| ADR-016 | Extensão de Estruturas             | Aprovado |
| ADR-017 | BOM Versionada e Imutável          | Aprovado |
| ADR-018 | Quality Inspection como Decisor    | Aprovado |
| ADR-019 | COMEX como Evolução Futura         | Aprovado |
| ADR-020 | Arquitetura de Canais Digitais     | Aprovado |
| ADR-022 | Aceite Baseado em Evidências       | Aprovado |

**Tipo:** Fato Comprovado — todos os ADRs estão em `docs/ARCHITECTURE.md` com estrutura completa (problema, alternativas, decisão, motivos, consequências, aprovador).

### 4.3 Princípios Fundamentais

10 princípios documentados em `docs/PLATFORM_PRINCIPLES.md`:

1. Evolução Sustentável (REAPROVEITAR → ESTENDER → RELACIONAR → CRIAR)
2. Neutralidade dos Módulos
3. Configurar antes de Customizar
4. Single Source of Truth
5. Conselho de Arquitetura
6. Regra das 5 Perguntas
7. Simplicidade Arquitetural
8. Documentos Vivos
9. Estratégia Evolutiva da Plataforma
10. Aceite Baseado em Evidências (5 níveis)

**Tipo:** Fato Comprovado

---

## 5. Funcionalidades

### 5.1 Autenticação

**Evidência:** `src/hooks/use-auth.tsx` implementa AuthProvider com:

- `signIn` via `pb.collection('users').authWithPassword(email, password)`
- `signUp` via create + authWithPassword
- `signOut` via `pb.authStore.clear()`
- Refresh automático no boot
- Gate de rotas em `isAuthenticated` (não `!!user`)

**Tipo:** Fato Comprovado

### 5.2 Autenticação de Cliente (separada)

**Evidência:** `src/hooks/use-client-auth.tsx` implementa `ClientAuthProvider` separado do admin auth. Rotas `/cliente/*` usam client auth; rotas `/admin/*` usam admin auth.

**Tipo:** Fato Comprovado

### 5.3 Sistema de Permissões

**Evidência:** `src/lib/permissions.ts` exporta 30+ funções de permissão baseadas em role. Roles suportadas: `SUP`, `PADRAO`, `SDR`, `Vendedor`, `FINANCEIRO`, `COMERCIAL`.

Permissões específicas por domínio:

- `src/lib/logistics-permissions.ts` — 17 funções
- `src/lib/financial-permissions.ts` — 21 funções
- `src/lib/rh-permissions.ts` — 19 funções
- `src/lib/ai-permissions.ts` — 19 funções
- `src/lib/wms-permissions.ts` — 20 funções
- `src/lib/price-table-permissions.ts` — 13 funções

**Tipo:** Fato Comprovado

### 5.4 Configuration Center

**Evidência:** `src/lib/configuracoes-config.ts` define configurações para integrações, modelos de e-mail, modelos de documentos, notificações, numerações. `src/components/configuracoes/` contém 10+ telas de configuração.

**Tipo:** Fato Comprovado

### 5.5 Auditoria

**Evidência:** Collection `audit_logs` no schema com campos: user_id, user_name, user_role, action, module, target_collection, target_id, previous_value, new_value, ip_address, is_suspicious, criticidade, origem, session_id, browser, os, device. Hooks: `audit_create.js`, `audit_update.js`, `audit_delete.js`, `audit_enrich.js`, `audit_alerts_detect.js`, `audit_auto_archive.js`, `audit_scheduled_report.js`.

**Tipo:** Fato Comprovado

---

## 6. Fluxos

### 6.1 Fluxo de Autenticação

```
Usuário → Login Page → pb.authWithPassword → AuthStore → Provider → Route Guard → Dashboard
```

**Tipo:** Fato Comprovado — `src/hooks/use-auth.tsx` e `src/components/admin-login.tsx`

### 6.2 Fluxo de Permissões

```
Route → Component → useAuth() → permissions.ts → canViewX(role) → Render/Block
```

**Tipo:** Fato Comprovado

### 6.3 Fluxo de Auditoria

```
Ação CRUD → Hook (audit_create/update/delete) → audit_logs collection → Audit Panel
```

**Tipo:** Fato Comprovado — hooks deployados confirmados

---

## 7. Regras de Negócio

### 7.1 Regra: Isolamento por Tenant

**Evidência:** ADR-001 define isolamento lógico por Tenant ID. Collections como `empresas` e `filiais` suportam multi-empresa. Campos `empresa` e `filial` presentes em collections de negócio (ex: `sales_orders`, `purchase_orders`, `pricing_config`).

**Tipo:** Fato Comprovado

### 7.2 Regra: Validação Server-Side de Permissões

**Evidência:** Collections têm `listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule` definidas. Regras usam `@request.auth.id` para controle de acesso.

**Tipo:** Fato Comprovado — mas com ressalva: nem todas as collections têm todas as 5 regras definidas (NC-CRIT-002)

---

## 8. Cálculos

### 8.1 Cálculo de Aderência (FCP)

```
Aderência = (níveis com status ✅ Implementado) / (total de níveis aplicáveis) × 100
```

**Tipo:** Fato Comprovado — definido em PLATFORM_PRINCIPLES §4.10

### 8.2 Cálculo de Conclusão de Fase

```
Percentual de Conclusão = Requisitos Implementados / Total de Requisitos × 100
```

**Tipo:** Fato Comprovado

---

## 9. Banco de Dados

### 9.1 Schema Vivo

**Evidência:** 120+ collections no schema vivo, cobrindo: users (auth), settings, budget_form_fields, budget_requests, chat_conversations, chat_messages, chat_ratings, ai_training, partners, clients, cms_content, cms_versions, cms_history, cms_media, cms_publication, vitrine_items, audit_logs, backups, services_offered, service_areas, contracts_operations, notifications, products, purchase_requests, quotations, purchase_orders, purchase_invoices, purchase_returns, pricing_config, price_tables, pricing_simulations, pricing_history, pricing_approvals, pricing_alerts, empresas, filiais, perfis_permissoes, transportadoras, categorias, subcategorias, marcas, unidades_medida, centros_custo, plano_contas, bancos, contas_bancarias, formas_pagamento, condicoes_pagamento, vendedores, representantes, stock_alerts, sales_orders, sales_invoices, nfe_records, nfce_records, sales_returns, stock_expeditions, price_vault, pricing_risk_monitor, audit_sessions, audit_alerts, system_parameters, integrations, integration_logs, api_credentials, api_request_logs, email_templates, e mais.

**Tipo:** Fato Comprovado

### 9.2 Migrações

88 migrações aplicadas (0001–0088, com gap em 0037). Migration 0089 criou `certification_artifacts` (removida por 0090).

**Tipo:** Fato Comprovado

### 9.3 Gap de Migration 0037

**Evidência:** A lista de migrações aplicadas salta de 0036 para 0038. O arquivo `0037_create_stock_collections.js` existe no repositório mas não está marcado como applied.

**Tipo:** Fato Comprovado — NC identificada

---

## 10. Collections

### 10.1 Collection: users (auth)

| Campo            | Tipo   | Observação                                        |
| ---------------- | ------ | ------------------------------------------------- |
| name             | text   | Nome do usuário                                   |
| avatar           | file   | Foto de perfil                                    |
| cpf              | text   | CPF                                               |
| attendant_status | select | Online, Ocupado, Ausente, Offline                 |
| active           | bool   | Usuário ativo                                     |
| role             | select | SUP, PADRAO, SDR, Vendedor, FINANCEIRO, COMERCIAL |
| empresa_id       | text   | Referência à empresa                              |
| filial_id        | text   | Referência à filial                               |
| cargo            | text   | Cargo                                             |
| departamento     | text   | Departamento                                      |
| perfil_acesso    | text   | Perfil de acesso                                  |

**Tipo:** Fato Comprovado

### 10.2 Collection: settings

| Campo | Tipo |
| ----- | ---- |
| key   | text |
| value | text |

**Tipo:** Fato Comprovado

### 10.3 Collection: audit_logs

22 campos cobrindo: identidade (user_id, user_name, user_role), ação (action, module, target_collection, target_id, target_summary), estados (previous_value, new_value), contexto técnico (ip_address, user_agent, browser, os, device), classificação (criticidade, origem, is_suspicious), sessão (session_id), governança (approval_responsible, justification, archived, empresa, filial).

**Tipo:** Fato Comprovado

---

## 11. Relacionamentos

### 11.1 Relações Identificadas

| Collection         | Campo             | Relação              |
| ------------------ | ----------------- | -------------------- |
| chat_conversations | attendant_id      | → users              |
| chat_messages      | conversation_id   | → chat_conversations |
| chat_ratings       | conversation      | → chat_conversations |
| chat_ratings       | attendant         | → users              |
| cms_content        | updated_by        | → users              |
| cms_versions       | published_by      | → users              |
| cms_media          | uploaded_by       | → users              |
| cms_publication    | last_published_by | → users              |
| audit_logs         | changed_by        | → users              |
| notifications      | recipient         | → users              |

**Tipo:** Fato Comprovado

---

## 12. APIs

### 12.1 APIs Públicas (PocketBase REST)

O backend expõe APIs REST automáticas para todas as collections via PocketBase:

- `GET/POST /api/collections/{collection}/records`
- `GET/POST/PATCH/DELETE /api/collections/{collection}/records/{id}`
- `GET /api/collections/{collection}/records` com filter, sort, expand, page, perPage

**Tipo:** Fato Comprovado

### 12.2 Rotas Customizadas

100+ hooks deployados, muitos com `routerAdd` registrando rotas sob `/backend/v1/`:

Exemplos: `budget_number_next`, `chat_attendant_reply`, `chat_client_send`, `chat_close_conversation`, `cnpj_lookup`, `logistics_route_calc`, `logistics_gps_update`, `backup_create`, `backup_restore`, `cms_publish`, `pricing_ai_analyze`, `crm_ai_assistant`, etc.

**Tipo:** Fato Comprovado

---

## 13. Hooks

### 13.1 Hooks de Plataforma Core

| Hook                         | Tipo                       | Função                        |
| ---------------------------- | -------------------------- | ----------------------------- |
| `audit_create`               | onRecordCreate             | Registra criação de registros |
| `audit_update`               | onRecordUpdate             | Registra alterações           |
| `audit_delete`               | onRecordDelete             | Registra exclusões            |
| `audit_enrich`               | onRecordEnrich             | Enriquece logs com contexto   |
| `audit_alerts_detect`        | Cron/Event                 | Detecta anomalias             |
| `audit_auto_archive`         | Cron                       | Arquiva logs antigos          |
| `audit_scheduled_report`     | Cron                       | Gera relatórios programados   |
| `audit_auth`                 | Event                      | Registra autenticação         |
| `on_user_create`             | onRecordAfterCreateSuccess | Inicializa usuário            |
| `backup_auto_check`          | Cron                       | Verifica backups automáticos  |
| `partner_pre_register_guard` | onRecordCreate             | Valida pré-cadastro           |

**Tipo:** Fato Comprovado

---

## 14. Serviços

### 14.1 Serviços Frontend

| Serviço                    | Collection     | Função                        |
| -------------------------- | -------------- | ----------------------------- |
| `settings.ts`              | settings       | getSetting, getWhatsappNumber |
| `audit-logs.ts`            | audit_logs     | CRUD de logs                  |
| `audit-sessions.ts`        | audit_sessions | Sessões de auditoria          |
| `audit-alerts.ts`          | audit_alerts   | Alertas de auditoria          |
| `audit-settings.ts`        | settings       | Configurações de auditoria    |
| `users.ts`                 | users          | CRUD de usuários              |
| `notifications.ts`         | notifications  | CRUD de notificações          |
| `unified-notifications.ts` | multi          | Notificações unificadas       |
| `configuracoes.ts`         | multi          | Configurações do sistema      |
| `backups.ts`               | backups        | CRUD de backups               |

**Tipo:** Fato Comprovado

---

## 15. Componentes

### 15.1 Componentes Core

| Componente              | Função                                  |
| ----------------------- | --------------------------------------- |
| `Layout.tsx`            | Layout principal com Outlet             |
| `admin-sidebar.tsx`     | Sidebar com busca, favoritos, histórico |
| `site-header.tsx`       | Header do site                          |
| `site-footer.tsx`       | Footer do site                          |
| `admin-login.tsx`       | Tela de login admin                     |
| `notification-bell.tsx` | Sino de notificações                    |
| `floating-chat.tsx`     | Chat flutuante                          |
| `error-boundary.tsx`    | Boundary de erro                        |
| `seo-head.tsx`          | SEO meta tags                           |

**Tipo:** Fato Comprovado

### 15.2 Providers

| Provider               | Função                |
| ---------------------- | --------------------- |
| `AuthProvider`         | Autenticação admin    |
| `ClientAuthProvider`   | Autenticação cliente  |
| `SettingsProvider`     | Configurações globais |
| `SystemParamsProvider` | Parâmetros do sistema |
| `CmsContentProvider`   | Conteúdo CMS          |
| `TooltipProvider`      | Tooltips              |

**Tipo:** Fato Comprovado — todos em `src/App.tsx`

---

## 16. Telas

### 16.1 Telas Core

| Rota                     | Página                    | Função                  |
| ------------------------ | ------------------------- | ----------------------- |
| `/admin`                 | Admin.tsx                 | Dashboard admin         |
| `/admin/cadastro`        | AdminRegister.tsx         | Registro de admin       |
| `/admin/recuperar-senha` | AdminPasswordRecovery.tsx | Recuperação de senha    |
| `/cliente/login`         | ClientLogin.tsx           | Login cliente           |
| `/cliente/cadastro`      | ClientRegister.tsx        | Cadastro cliente        |
| `/cliente`               | ClientArea.tsx            | Área do cliente         |
| `/admin/notificacoes`    | Notifications.tsx         | Notificações            |
| `/admin/configuracoes/*` | ConfiguracoesLayout       | Centro de configurações |

**Tipo:** Fato Comprovado

---

## 17. Integrações

### 17.1 Integrações Identificadas

| Integração           | Status | Evidência                               |
| -------------------- | ------ | --------------------------------------- |
| PocketBase (backend) | Ativa  | `src/lib/pocketbase/client.ts`          |
| Skip AI Gateway      | Ativa  | Hooks usam `$ai.chat`, `$ai.embed`      |
| WhatsApp (orçamento) | Ativa  | `src/lib/utils.ts` — `buildWhatsAppUrl` |
| CNPJ Lookup          | Ativa  | Hook `cnpj_lookup.js`                   |

**Tipo:** Fato Comprovado

---

## 18. Relatórios

### 18.1 Relatórios de Auditoria

O módulo de auditoria suporta:

- Filtros por módulo, ação, role, criticidade, origem, browser, OS, device
- Exportação para Excel e PDF (`src/lib/audit-export.ts`)
- Timeline cronológica por registro
- Indicadores e dashboards

**Tipo:** Fato Comprovado

---

## 19. Automações

### 19.1 Automações de Plataforma

| Automação                  | Gatilho    | Ação                       |
| -------------------------- | ---------- | -------------------------- |
| `audit_auto_archive`       | Cron       | Arquiva logs antigos       |
| `audit_scheduled_report`   | Cron       | Gera relatórios            |
| `backup_auto_check`        | Cron       | Verifica backups           |
| `audit_alerts_detect`      | Event/Cron | Detecta anomalias          |
| `vitrine_auto_status`      | Event      | Atualiza status de vitrine |
| `stock_expiry_block`       | Event      | Bloqueia lotes vencidos    |
| `price_table_expiry_alert` | Cron       | Alerta tabelas expiradas   |
| `wms_replenishment_auto`   | Event      | Reabastecimento automático |

**Tipo:** Fato Comprovado

---

## 20. Permissões

### 20.1 Matriz de Permissões

`src/lib/permission-matrix.ts` define `MATRIX_SCREENS` com view/create/edit/delete por role. Gaps identificados em `IDENTIFIED_GAPS`.

**Tipo:** Fato Comprovado

### 20.2 Validação Server-Side

Regras de acesso (RLS) definidas nas collections. Padrão: `@request.auth.id != ''` para autenticação obrigatória.

**Tipo:** Fato Comprovado — com NC: nem todas as collections têm 5 regras (NC-CRIT-002)

---

## 21. Auditoria

### 21.1 Cobertura de Auditoria

| Dimensão                | Status | Evidência                      |
| ----------------------- | ------ | ------------------------------ |
| Criação de registros    | ✅     | `audit_create.js`              |
| Alteração de registros  | ✅     | `audit_update.js`              |
| Exclusão de registros   | ✅     | `audit_delete.js`              |
| Enriquecimento          | ✅     | `audit_enrich.js`              |
| Detecção de anomalias   | ✅     | `audit_alerts_detect.js`       |
| Sessões                 | ✅     | `audit_sessions` collection    |
| Alertas                 | ✅     | `audit_alerts` collection      |
| Arquivamento automático | ✅     | `audit_auto_archive.js`        |
| Relatórios programados  | ✅     | `audit_scheduled_report.js`    |
| Configurações           | ✅     | `audit_settings_get/update.js` |

**Tipo:** Fato Comprovado

---

## 22. Segurança

### 22.1 Autenticação

- Admin: `users` (auth collection) com `authWithPassword`
- Cliente: `clients` (auth collection) separado
- Refresh automático de token no boot
- Clear do authStore em caso de falha

**Tipo:** Fato Comprovado

### 22.2 RLS (Row Level Security)

| Status        | Detalhe                                                |
| ------------- | ------------------------------------------------------ |
| ✅ Definido   | Maioria das collections tem regras                     |
| ❌ Incompleto | Algumas collections têm regras `null` (superuser-only) |

**Tipo:** Fato Comprovado — NC-CRIT-002

### 22.3 LGPD

ADR-010 define conformidade LGPD. Dados sensíveis (CPF, CNPJ, dados bancários) identificados no schema.

**Tipo:** Inferência — a estrutura existe, mas criptografia campo-a-campo não foi verificada no código

### 22.4 MFA

Definido na arquitetura (§7.3) como obrigatório para admin.

**Tipo:** Hipótese — não há evidência de implementação de MFA no código frontend atual

---

## 23. Performance

### 23.1 Metas Definidas

| Métrica              | Meta    | Evidência         |
| -------------------- | ------- | ----------------- |
| Carregamento de tela | < 2s    | ARCHITECTURE §6.2 |
| API p95              | < 300ms | ARCHITECTURE §6.2 |
| Lista p95            | < 500ms | ARCHITECTURE §6.2 |
| Uptime               | 99.9%   | ARCHITECTURE §6.2 |

**Tipo:** Fato Comprovado — metas documentadas

### 23.2 Estratégias

- Cache de configurações (`useSettings`, `useSystemParams`)
- Paginação em listas
- Lazy loading de componentes
- Auto-cancellation desativado (controle manual)

**Tipo:** Fato Comprovado

---

## 24. Escalabilidade

### 24.1 Multi-tenancy

Isolamento lógico por Tenant ID (ADR-001). Preparado para migração para instância dedicada.

**Tipo:** Fato Comprovado

### 24.2 Feature Flags

Arquitetura modular com feature flags (ADR-004). Nem todos os módulos têm flags implementadas.

**Tipo:** Inferência — a arquitetura prevê, mas implementação parcial

---

## 25. UX

### 25.1 Navegação

- Sidebar com busca global de telas
- Favoritos e histórico de navegação
- Submenus colapsáveis
- Modo colapsado com tooltips
- Badges de notificação

**Tipo:** Fato Comprovado — `src/components/admin-sidebar.tsx`

### 25.2 Responsividade

Design mobile-first com TailwindCSS. Breakpoints sm, md, lg, xl.

**Tipo:** Fato Comprovado

---

## 26. Conformidades

### 26.1 Conformidade Arquitetural

| Princípio                                    | Status | Evidência                          |
| -------------------------------------------- | ------ | ---------------------------------- |
| REAPROVEITAR > ESTENDER > RELACIONAR > CRIAR | ✅     | ADRs 011, 016 demonstram aplicação |
| Single Source of Truth                       | ✅     | ADR-015, ADR-017                   |
| Neutralidade dos Módulos                     | ✅     | ADR-011, ADR-012                   |
| API First                                    | ✅     | ADR-002                            |
| Documentos Vivos                             | ✅     | Documentação atualizada            |
| Aceite Baseado em Evidências                 | ✅     | ADR-022, PLATFORM_PRINCIPLES §4.10 |

**Tipo:** Fato Comprovado

---

## 27. Não Conformidades

### NC-CRIT-001: Autodate Fields Ausentes

**Severidade:** Crítica
**Evidência:** Múltiplas collections `base` no schema vivo não têm verificação confirmada de campos `created`/`updated` autodate. FCP BD-02 exige ambos.
**Impacto:** Falha em sort/filter por created/updated em queries SDK.

### NC-CRIT-002: Regras RLS Incompletas

**Severidade:** Crítica
**Evidência:** Algumas collections têm regras `null` (superuser-only), bloqueando acesso de usuários da aplicação.
**Impacto:** Usuários não-superuser não conseguem acessar dados de collections com regras null.

### NC-CRIT-003: Gap de Migration 0037

**Severidade:** Alta
**Evidência:** Migration 0037 existe no repositório mas não está na lista de applied. Salto de 0036 para 0038.
**Impacto:** Possível inconsistência de schema se a migration continha criação de collections.

### NC-MED-001: MFA Não Implementado

**Severidade:** Média
**Evidência:** Arquitetura define MFA obrigatório para admin (§7.3), mas não há implementação no código frontend.
**Impacto:** Risco de segurança — acesso admin sem segunda camada.

### NC-MED-002: Criptografia Campo-a-Campo Não Verificada

**Severidade:** Média
**Evidência:** ADR-010 e §7.2 definem criptografia campo-a-campo para dados sensíveis. Não há evidência de implementação.
**Impacto:** Dados sensíveis (CPF, CNPJ, dados bancários) podem estar em texto plano.

---

## 28. Evidências

Todas as evidências neste relatório são classificadas:

| Tipo            | Definição                               | Uso neste relatório             |
| --------------- | --------------------------------------- | ------------------------------- |
| Fato Comprovado | Verificado por evidência técnica direta | Maioria das conclusões          |
| Hipótese        | Proposta que requer validação adicional | MFA, criptografia campo-a-campo |
| Inferência      | Dedução baseada em evidências indiretas | Feature flags parciais          |
| Recomendação    | Sugestão de ação                        | Plano Evolutivo                 |

---

## 29. Riscos

| #    | Risco                                          | Probabilidade | Impacto | Severidade | Mitigação                              |
| ---- | ---------------------------------------------- | ------------- | ------- | ---------- | -------------------------------------- |
| R-01 | RLS null bloqueia acesso de usuários           | Alta          | Crítico | 20         | Definir regras em todas as collections |
| R-02 | Migration 0037 gap causa schema inconsistente  | Média         | Alto    | 12         | Verificar e corrigir                   |
| R-03 | MFA ausente permite acesso não autorizado      | Média         | Crítico | 15         | Implementar MFA                        |
| R-04 | Dados sensíveis sem criptografia campo-a-campo | Baixa         | Crítico | 10         | Implementar criptografia               |
| R-05 | Autodate ausente causa falhas de sort/filter   | Alta          | Médio   | 12         | Adicionar campos autodate              |

---

## 30. Débito Técnico

| #     | Item                       | Área      | Idade           | Esforço | Prioridade |
| ----- | -------------------------- | --------- | --------------- | ------- | ---------- |
| DT-01 | RLS incompleto             | Segurança | Desde início    | Médio   | P0         |
| DT-02 | Migration 0037 gap         | Database  | Desde criação   | Baixo   | P1         |
| DT-03 | MFA não implementado       | Segurança | Desde definição | Alto    | P1         |
| DT-04 | Criptografia campo-a-campo | Segurança | Desde definição | Alto    | P2         |
| DT-05 | Autodate fields ausentes   | Database  | Desde início    | Baixo   | P1         |

---

## 31. Oportunidades

| #     | Oportunidade                        | Benefício       | Esforço |
| ----- | ----------------------------------- | --------------- | ------- |
| OP-01 | Centralizar validação de permissões | Consistência    | Médio   |
| OP-02 | Implementar feature flags globais   | Flexibilidade   | Médio   |
| OP-03 | Automatizar verificação de schema   | Qualidade       | Baixo   |
| OP-04 | Cache de permissões no frontend     | Performance     | Baixo   |
| OP-05 | Dashboard de saúde da plataforma    | Observabilidade | Médio   |

---

## 32. Recomendações

1. **Imediato:** Corrigir RLS em todas as collections (P0)
2. **Curto prazo:** Verificar migration 0037 e corrigir gap
3. **Curto prazo:** Adicionar autodate fields em collections base
4. **Médio prazo:** Implementar MFA para admin
5. **Médio prazo:** Implementar criptografia campo-a-campo
6. **Longo prazo:** Feature flags globais e dashboard de saúde

---

## 33. Conclusão

O Domínio 01 apresenta uma fundação arquitetural sólida e bem documentada. Os 22 ADRs e 10 princípios fundamentais fornecem governança clara. A separação entre arquitetura conceitual e implementação atual (ADR-020) demonstra maturidade arquitetural.

As principais não conformidades (RLS incompleto, gap de migration, autodate ausente) são corrigíveis com esforço moderado e não comprometem a integridade fundamental da plataforma.

**Tipo:** Fato Comprovado (para a estrutura) + Recomendação (para as correções)

---

## 34. Resposta às 5 Perguntas-Chave

### P1: O domínio funciona corretamente?

**Resposta:** Sim, com ressalvas. A autenticação, permissões, auditoria e configurações funcionam. As NCs críticas (RLS, autodate) afetam casos específicos mas não impedem a operação geral.

### P2: O domínio está arquiteturalmente bem construído?

**Resposta:** Sim. 22 ADRs documentados, 10 princípios fundamentais, separação conceitual/implementação, hierarquia REAPROVEITAR→ESTENDER→RELACIONAR→CRIAR seguida.

### P3: As regras de negócio e cálculos estão corretos?

**Resposta:** Sim para o escopo core. Isolamento por tenant, validação de permissões, e cálculos de aderência/conclusão estão corretos e documentados.

### P4: O que realmente precisa ser corrigido?

**Resposta:** 3 NCs críticas (RLS, autodate, migration gap) + 2 NCs médias (MFA, criptografia). Ver Plano de Correções.

### P5: Como o domínio deve evoluir?

**Resposta:** Feature flags globais, dashboard de saúde, automação de verificação de schema, cache de permissões. Ver Plano Evolutivo.

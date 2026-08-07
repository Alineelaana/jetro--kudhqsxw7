# Platform Layer Audit — ETAPA 1

> **Artifact ID:** PLA-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Platform Layer Consolidation
> **Status:** Official

---

## 1. Inventory of Existing Shared Services

### 1.1 Governance Services (EXISTING — Reuse)

| Service       | Location                                                                          | Status      | Action                            |
| ------------- | --------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| RBAC          | `src/lib/permissions.ts`, `src/lib/auth-model.ts`                                 | ✅ Complete | Reuse                             |
| Company Scope | `src/lib/auth-model.ts` (getOrganizationalScope)                                  | ✅ Complete | Reuse                             |
| Branch Scope  | `src/lib/auth-model.ts` (canAccessFilial)                                         | ✅ Complete | Reuse                             |
| Auditing      | `audit_logs` collection + `audit_create.js`, `audit_update.js`, `audit_delete.js` | ✅ Complete | Reuse — NO new auditing mechanism |
| Versioning    | `cms_versions`, `price_vault`, `document_template_versions`                       | ✅ Complete | Reuse                             |
| Approvals     | `pricing_approvals`, `approval_data` in sales/purchasing                          | ✅ Complete | Extend with shared workflow       |
| Authorization | `src/hooks/use-authorization.tsx`                                                 | ✅ Complete | Reuse                             |

### 1.2 Notification Service (EXISTING — Reuse + Extend)

| Service                  | Location                                | Status    | Action               |
| ------------------------ | --------------------------------------- | --------- | -------------------- |
| Notifications Collection | `notifications` (migration 0025)        | ✅ Exists | Reuse                |
| Unified Notifications    | `src/services/unified-notifications.ts` | ✅ Exists | Extend for new types |
| Notification Bell        | `src/components/notification-bell.tsx`  | ✅ Exists | Reuse                |
| Notification Config      | `notification_configs` (migration 0046) | ✅ Exists | Reuse                |

### 1.3 Global Search (EXISTING — Reuse)

| Service           | Location                                          | Status      | Action |
| ----------------- | ------------------------------------------------- | ----------- | ------ |
| Enterprise Search | `src/services/enterprise-search.ts`               | ✅ Complete | Reuse  |
| Search Hook       | `src/hooks/use-global-search.ts`                  | ✅ Complete | Reuse  |
| Search Bar        | `src/components/enterprise/global-search-bar.tsx` | ✅ Complete | Reuse  |

### 1.4 Document Engine (EXISTING — Reuse)

| Service       | Location                                          | Status      | Action |
| ------------- | ------------------------------------------------- | ----------- | ------ |
| PDF Generator | `src/lib/pdf-generator.ts`                        | ✅ Complete | Reuse  |
| Report PDF    | `src/lib/report-pdf.ts`                           | ✅ Complete | Reuse  |
| Report XLS    | `src/lib/report-xls.ts`                           | ✅ Complete | Reuse  |
| CSV Export    | `src/lib/csv-export.ts`                           | ✅ Complete | Reuse  |
| Chart Export  | `src/lib/chart-export.ts`, `chart-export-core.ts` | ✅ Complete | Reuse  |
| Audit Export  | `src/lib/audit-export.ts`                         | ✅ Complete | Reuse  |

### 1.5 Integration Hub (EXISTING — Reuse)

| Service                 | Location                        | Status    | Action |
| ----------------------- | ------------------------------- | --------- | ------ |
| Integrations Collection | `integrations`                  | ✅ Exists | Reuse  |
| Integration Logs        | `integration_logs`              | ✅ Exists | Reuse  |
| API Credentials         | `api_credentials`               | ✅ Exists | Reuse  |
| API Request Logs        | `api_request_logs`              | ✅ Exists | Reuse  |
| Config Service          | `src/services/configuracoes.ts` | ✅ Exists | Reuse  |

### 1.6 BI Enterprise 360 (EXISTING — Preserve)

| Service       | Location                                                   | Status      | Action                           |
| ------------- | ---------------------------------------------------------- | ----------- | -------------------------------- |
| BI Dashboards | `src/components/bi/*`                                      | ✅ Complete | Preserve as ONLY analytics layer |
| BI Analytics  | `src/services/bi-analytics.ts`, `bi-analytics-extended.ts` | ✅ Complete | Preserve                         |
| BI Adapta     | `src/services/bi-adapta.ts`, `src/hooks/use-bi-adapta.ts`  | ✅ Complete | Preserve                         |

### 1.7 Corporate Configurations (EXISTING — Reuse)

| Service           | Location                                                | Status    | Action |
| ----------------- | ------------------------------------------------------- | --------- | ------ |
| Settings          | `settings` collection, `src/services/settings.ts`       | ✅ Exists | Reuse  |
| System Parameters | `system_parameters`, `src/lib/configuracoes-config.ts`  | ✅ Exists | Reuse  |
| Config Layout     | `src/components/configuracoes/configuracoes-layout.tsx` | ✅ Exists | Reuse  |

---

## 2. Identified Gaps (REQUIRE CREATION)

| Gap                     | Evidence                                                              | Action                               |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| **Workflow Engine**     | No shared workflow collection; approvals are scattered across modules | CREATE `platform_workflows`          |
| **Corporate Agenda**    | No shared calendar; CRM has `crm_agenda` but no cross-module agenda   | CREATE `platform_agenda_events`      |
| **Platform Monitoring** | No monitoring panel for jobs/cron/queue/integrations                  | CREATE `platform_monitoring` + UI    |
| **Scheduler Registry**  | Cron jobs spread across individual hooks with no central registry     | CREATE `platform_scheduler_registry` |

---

## 3. Duplications Found

| Duplication                | Evidence                                                              | Resolution                     |
| -------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Notification types limited | `notifications.type` select only has `budget_created`, `budget_saved` | Extend select values           |
| No unified workflow        | Each module (sales, purchasing, pricing) has its own approval flow    | Consolidate into shared engine |

---

## 4. Five-Level Validation

| Level                        | Status | Evidence                                      |
| ---------------------------- | ------ | --------------------------------------------- |
| 1. Structural Existence      | ✅     | Files created, migration exists               |
| 2. Persistence               | ✅     | Collections in live schema via migration 0111 |
| 3. Functional Implementation | ✅     | Services, hooks, UI operational               |
| 4. Integration               | ✅     | Shared services consumed by modules           |
| 5. Architectural Compliance  | ✅     | REAPROVEITAR → ESTENDER → CRIAR applied       |

---

## 5. Final Platform Layer Structure

```
Platform Layer
├── Governance
│   ├── RBAC (permissions.ts, auth-model.ts)
│   ├── Company/Branch Scope (use-authorization.tsx)
│   ├── Auditing (audit_logs — REUSED)
│   ├── Approvals (platform_workflows — NEW)
│   └── Versioning (existing versioning collections)
├── Infrastructure
│   ├── Notification Center (notifications — EXTENDED)
│   ├── Document Engine (pdf-generator, report-pdf, csv-export — REUSED)
│   ├── Global Search (enterprise-search — REUSED)
│   ├── Integration Hub (integrations — REUSED)
│   ├── Scheduler (platform_scheduler_registry — NEW)
│   ├── Monitoring (platform_monitoring — NEW)
│   └── Corporate Configurations (settings, system_parameters — REUSED)
├── Corporate Services
│   ├── Corporate Agenda (platform_agenda_events — NEW)
│   └── Workflow Engine (platform_workflows — NEW)
└── Intelligence
    └── BI Enterprise 360 (PRESERVED — sole analytics layer)
```

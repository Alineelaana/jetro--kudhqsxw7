# General Correction Plan

> **Document ID:** GCP-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 8.2.3

---

## 1. Critical Corrections (P0 — Immediate)

| ID       | NC Reference | Module     | Correction Action                                                                                                                  | Responsible | Deadline | Status  |
| -------- | ------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- | ------- |
| CORR-001 | NC-CRIT-001  | Database   | Audit all `base` collections for `created`/`updated` autodate fields; add missing fields via migration 0089                        | Tech Lead   | 7 days   | Pending |
| CORR-002 | NC-CRIT-002  | Security   | Define all 5 RLS rules (list, view, create, update, delete) on every collection; replace `null` rules with appropriate expressions | Tech Lead   | 7 days   | Pending |
| CORR-003 | NC-CRIT-003  | Migrations | Investigate migration 0037 gap; either restore the file or document the removal with technical justification                       | Tech Lead   | 3 days   | Pending |

## 2. High Priority Corrections (P0/P1)

| ID       | NC Reference | Module       | Correction Action                                                            | Responsible | Deadline | Status  |
| -------- | ------------ | ------------ | ---------------------------------------------------------------------------- | ----------- | -------- | ------- |
| CORR-004 | NC-HIGH-001  | Database     | Create index audit; add indexes on all fields used in filter/sort operations | Tech Lead   | 14 days  | Pending |
| CORR-005 | NC-HIGH-002  | Migrations   | Implement automated migration testing in CI/CD                               | DevOps      | 30 days  | Pending |
| CORR-006 | NC-HIGH-003  | Security     | Implement MFA (TOTP) for admin users and financial operations                | Tech Lead   | 21 days  | Pending |
| CORR-007 | NC-HIGH-004  | Security     | Implement field-level encryption for CPF, CNPJ, banking data                 | Tech Lead   | 21 days  | Pending |
| CORR-008 | NC-HIGH-005  | Permissions  | Close all identified permission gaps from IDENTIFIED_GAPS                    | Tech Lead   | 14 days  | Pending |
| CORR-009 | NC-HIGH-006  | Fiscal       | Implement SEFAZ integration for NF-e authorization                           | Tech Lead   | 45 days  | Pending |
| CORR-010 | NC-HIGH-007  | Industry     | Create `production_orders` collection and production execution hooks         | Tech Lead   | 30 days  | Pending |
| CORR-011 | NC-HIGH-008  | BI           | Design and implement centralized analytics data model                        | Tech Lead   | 60 days  | Pending |
| CORR-012 | NC-HIGH-009  | BI           | Implement ETL pipeline for dashboard data aggregation                        | Tech Lead   | 60 days  | Pending |
| CORR-013 | NC-HIGH-010  | AI           | Define Skip Cloud Agent via `$ai.agents.define` in migration                 | Tech Lead   | 21 days  | Pending |
| CORR-014 | NC-HIGH-011  | Integrations | Implement SEFAZ fiscal document integration                                  | Tech Lead   | 45 days  | Pending |
| CORR-015 | NC-HIGH-012  | Integrations | Implement bank integration for conciliation                                  | Tech Lead   | 45 days  | Pending |
| CORR-016 | NC-HIGH-013  | Performance  | Integrate APM/observability tooling                                          | DevOps      | 30 days  | Pending |
| CORR-017 | NC-HIGH-014  | Scalability  | Implement rate limiting on API endpoints                                     | Tech Lead   | 21 days  | Pending |
| CORR-018 | NC-HIGH-015  | Scalability  | Implement caching layer for frequently accessed data                         | Tech Lead   | 30 days  | Pending |

## 3. Medium Priority Corrections (P1/P2)

| ID       | NC Reference | Module       | Correction Action                                                      | Responsible | Deadline | Status  |
| -------- | ------------ | ------------ | ---------------------------------------------------------------------- | ----------- | -------- | ------- |
| CORR-019 | NC-MED-001   | Database     | Normalize JSON fields that store structured data into proper relations | Tech Lead   | 60 days  | Pending |
| CORR-020 | NC-MED-002   | Collections  | Audit bool fields for `required` constraint violations                 | Tech Lead   | 14 days  | Pending |
| CORR-021 | NC-MED-004   | Backend      | Audit hooks for top-level variable scoping violations                  | Tech Lead   | 14 days  | Pending |
| CORR-022 | NC-MED-005   | Hooks        | Add `$app.logger()` error logging to all hooks                         | Dev Team    | 30 days  | Pending |
| CORR-023 | NC-MED-006   | Security     | Implement rate limiting on authentication endpoints                    | Tech Lead   | 14 days  | Pending |
| CORR-024 | NC-MED-007   | Security     | Configure session timeout policies                                     | Tech Lead   | 14 days  | Pending |
| CORR-025 | NC-MED-008   | Profiles     | Complete permission matrix for all module/action combinations          | Tech Lead   | 21 days  | Pending |
| CORR-026 | NC-MED-009   | Permissions  | Implement automated permission testing                                 | DevOps      | 30 days  | Pending |
| CORR-027 | NC-MED-010   | Frontend     | Implement frontend test suite (Vitest)                                 | Dev Team    | 45 days  | Pending |
| CORR-028 | NC-MED-012   | Financial    | Implement automated financial closing                                  | Tech Lead   | 45 days  | Pending |
| CORR-029 | NC-MED-013   | Fiscal       | Implement SPED generation                                              | Tech Lead   | 60 days  | Pending |
| CORR-030 | NC-MED-014   | Fiscal       | Implement digital certificate management                               | Tech Lead   | 30 days  | Pending |
| CORR-031 | NC-MED-015   | WMS          | Implement barcode/RFID integration                                     | Tech Lead   | 60 days  | Pending |
| CORR-032 | NC-MED-016   | Industry     | Implement production apontamento hooks                                 | Tech Lead   | 30 days  | Pending |
| CORR-033 | NC-MED-017   | Industry     | Implement MRP calculation hook                                         | Tech Lead   | 21 days  | Pending |
| CORR-034 | NC-MED-026   | AI           | Implement RAG/vector search with `$ai.embed` and `$vectors.search`     | Tech Lead   | 45 days  | Pending |
| CORR-035 | NC-MED-027   | AI           | Implement AI cost monitoring dashboard                                 | Tech Lead   | 30 days  | Pending |
| CORR-036 | NC-MED-028   | Automations  | Implement visual automation builder                                    | Tech Lead   | 90 days  | Pending |
| CORR-037 | NC-MED-029   | Integrations | Implement webhook management system                                    | Tech Lead   | 45 days  | Pending |

## 4. Low Priority Corrections (P3)

| ID       | NC Reference | Module        | Correction Action                                  | Responsible | Deadline | Status  |
| -------- | ------------ | ------------- | -------------------------------------------------- | ----------- | -------- | ------- |
| CORR-038 | NC-LOW-001   | Core          | Add versioning/audit to settings collection        | Dev Team    | 90 days  | Pending |
| CORR-039 | NC-LOW-006   | APIs          | Generate OpenAPI documentation                     | Dev Team    | 60 days  | Pending |
| CORR-040 | NC-LOW-007   | APIs          | Implement rate limiting on custom routes           | Dev Team    | 60 days  | Pending |
| CORR-041 | NC-LOW-009   | Audit         | Automate archive retention policy                  | Dev Team    | 90 days  | Pending |
| CORR-042 | NC-LOW-012   | Navigation    | Implement consistent breadcrumb component          | Dev Team    | 60 days  | Pending |
| CORR-043 | NC-LOW-016   | Stock         | Implement negative stock blocking enforcement hook | Dev Team    | 30 days  | Pending |
| CORR-044 | NC-LOW-030   | CMS           | Implement A/B testing for content                  | Dev Team    | 120 days | Pending |
| CORR-045 | NC-LOW-035   | Documentation | Generate OpenAPI specification                     | Dev Team    | 60 days  | Pending |

## 5. Correction Tracking

| Severity  | Total  | In Progress | Resolved | Pending |
| --------- | ------ | ----------- | -------- | ------- |
| Critical  | 3      | 0           | 0        | 3       |
| High      | 15     | 0           | 0        | 15      |
| Medium    | 19     | 0           | 0        | 19      |
| Low       | 8      | 0           | 0        | 8       |
| **Total** | **45** | **0**       | **0**    | **45**  |

---

_End of General Correction Plan._

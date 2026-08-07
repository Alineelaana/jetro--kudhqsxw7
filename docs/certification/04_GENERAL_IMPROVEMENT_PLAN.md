# General Improvement Plan

> **Document ID:** GIP-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 8.2.5

---

## 1. High-Priority Improvements (Score ≥ 60)

| ID      | Module       | Improvement                                                                       | Impact | Effort | Score | Priority |
| ------- | ------------ | --------------------------------------------------------------------------------- | ------ | ------ | ----- | -------- |
| IMP-001 | AI           | Define Skip Cloud Agent for customer support with RAG over FAQ and knowledge base | 5      | 3      | 78    | P1       |
| IMP-002 | BI           | Create centralized KPI computation service with standardized formulas             | 5      | 3      | 75    | P1       |
| IMP-003 | Security     | Implement field-level encryption for all LGPD-sensitive data (CPF, CNPJ, banking) | 5      | 3      | 72    | P1       |
| IMP-004 | Performance  | Integrate APM tool for real-time performance monitoring and alerting              | 4      | 2      | 70    | P1       |
| IMP-005 | Automations  | Build visual automation builder (trigger→condition→action) without code           | 5      | 4      | 68    | P1       |
| IMP-006 | Industry     | Implement production order collection with apontamento and lot genealogy          | 5      | 3      | 66    | P1       |
| IMP-007 | Scalability  | Implement Redis caching layer for hot data (catalogs, configs, dashboards)        | 4      | 3      | 65    | P1       |
| IMP-008 | Integrations | Implement SEFAZ NF-e authorization integration                                    | 5      | 4      | 63    | P1       |
| IMP-009 | Frontend     | Implement Vitest test suite for critical business logic components                | 4      | 3      | 62    | P1       |
| IMP-010 | AI           | Implement RAG with `$ai.embed` and `$vectors.search` for knowledge base           | 4      | 3      | 60    | P1       |

## 2. Medium-Priority Improvements (Score 40-59)

| ID      | Module        | Improvement                                                              | Impact | Effort | Score | Priority |
| ------- | ------------- | ------------------------------------------------------------------------ | ------ | ------ | ----- | -------- |
| IMP-011 | Fiscal        | Implement SPED and DCTF generation                                       | 4      | 4      | 55    | P2       |
| IMP-012 | Integrations  | Implement bank conciliation via OFX/CSV import                           | 4      | 3      | 55    | P2       |
| IMP-013 | Reports       | Create unified report framework with template customization              | 4      | 3      | 52    | P2       |
| IMP-014 | Dashboards    | Implement configurable dashboard layouts with drag-and-drop              | 3      | 3      | 50    | P2       |
| IMP-015 | WMS           | Implement barcode scanning integration for mobile devices                | 4      | 4      | 48    | P2       |
| IMP-016 | CRM           | Implement automated lead scoring with AI                                 | 3      | 3      | 48    | P2       |
| IMP-017 | Client Portal | Expand self-service: second copy documents, order history, communication | 4      | 3      | 47    | P2       |
| IMP-018 | Database      | Create comprehensive index optimization plan                             | 3      | 2      | 46    | P2       |
| IMP-019 | Hooks         | Standardize error logging with `$app.logger()` across all hooks          | 3      | 2      | 45    | P2       |
| IMP-020 | Campaigns     | Implement campaign ROI tracking and attribution                          | 3      | 3      | 45    | P2       |
| IMP-021 | Navigation    | Implement consistent breadcrumb system across all pages                  | 2      | 2      | 42    | P2       |
| IMP-022 | Stock         | Implement negative stock blocking enforcement                            | 3      | 2      | 42    | P2       |
| IMP-023 | IT            | Create system health monitoring dashboard                                | 3      | 2      | 42    | P2       |
| IMP-024 | Marketing     | Implement email marketing module with templates and tracking             | 3      | 4      | 40    | P2       |

## 3. Low-Priority Improvements (Score < 40)

| ID      | Module        | Improvement                                                    | Impact | Effort | Score | Priority |
| ------- | ------------- | -------------------------------------------------------------- | ------ | ------ | ----- | -------- |
| IMP-025 | APIs          | Generate OpenAPI specification from PocketBase schema          | 2      | 2      | 35    | P3       |
| IMP-026 | Core          | Add versioning and audit trail to settings changes             | 2      | 2      | 35    | P3       |
| IMP-027 | Audit         | Automate archive retention policy beyond cron                  | 2      | 2      | 35    | P3       |
| IMP-028 | CMS           | Implement A/B testing for content variants                     | 2      | 4      | 30    | P3       |
| IMP-029 | Logistics     | Integrate real GPS tracking (replace simulation)               | 3      | 5      | 30    | P3       |
| IMP-030 | Logistics     | Develop native mobile driver app                               | 3      | 5      | 28    | P3       |
| IMP-031 | Reports       | Implement scheduled report generation and distribution         | 2      | 3      | 28    | P3       |
| IMP-032 | Dashboards    | Add real-time dashboard updates via SSE                        | 2      | 3      | 28    | P3       |
| IMP-033 | Automations   | Add automation execution logging and monitoring                | 2      | 2      | 25    | P3       |
| IMP-034 | Integrations  | Create integration health dashboard                            | 2      | 2      | 25    | P3       |
| IMP-035 | Industry      | Implement MRP calculation hook with BOM × demand × stock × POs | 3      | 3      | 25    | P3       |
| IMP-036 | Financial     | Implement automated financial period closing                   | 2      | 3      | 25    | P3       |
| IMP-037 | Permissions   | Implement automated permission testing suite                   | 2      | 3      | 22    | P3       |
| IMP-038 | Scalability   | Implement database read replicas                               | 2      | 5      | 20    | P3       |
| IMP-039 | Performance   | Implement image optimization pipeline                          | 1      | 2      | 18    | P3       |
| IMP-040 | WMS           | Upgrade warehouse map to 3D visualization                      | 1      | 4      | 15    | P3       |
| IMP-041 | Marketing     | Integrate social media management                              | 1      | 4      | 15    | P3       |
| IMP-042 | Client Portal | Implement client notification system                           | 2      | 3      | 15    | P3       |
| IMP-043 | Frontend      | Standardize loading state patterns across components           | 1      | 2      | 12    | P3       |
| IMP-044 | Documentation | Generate API documentation from code                           | 1      | 2      | 12    | P3       |
| IMP-045 | Collections   | Standardize text vs json field usage for structured data       | 1      | 3      | 10    | P3       |
| IMP-046 | Relationships | Add cascadeDelete to relations with orphaning risk             | 1      | 2      | 10    | P3       |
| IMP-047 | Industry      | Implement parameterization for multiple industry types         | 1      | 5      | 8     | P3       |

## 4. Improvement Themes

### 4.1 AI Enhancement Theme

- Define Skip Cloud Agents (IMP-001, IMP-010, IMP-016)
- Implement RAG/vector search (IMP-010)
- AI cost monitoring
- Domain-specific AI agents

### 4.2 Data-Driven Decision Theme

- Centralized BI/analytics (IMP-002)
- Configurable dashboards (IMP-014)
- Real-time updates (IMP-032)
- Campaign ROI (IMP-020)

### 4.3 Enterprise Readiness Theme

- Security hardening (IMP-003)
- Performance monitoring (IMP-004)
- Scalability (IMP-007, IMP-038)
- Integration (IMP-008, IMP-012)

### 4.4 Operational Excellence Theme

- Test coverage (IMP-009, IMP-037)
- Automation builder (IMP-005)
- Standardized logging (IMP-019)
- Health monitoring (IMP-023)

---

_End of General Improvement Plan._

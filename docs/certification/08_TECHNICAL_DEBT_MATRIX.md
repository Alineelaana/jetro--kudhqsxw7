# Technical Debt Matrix

> **Document ID:** TDM-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 13.2.10

---

## 1. Debt Classification

| Type               | Description                                          |
| ------------------ | ---------------------------------------------------- |
| **Architecture**   | Deviation from documented architecture or principles |
| **Code**           | Code quality issues, duplication, missing tests      |
| **Data**           | Schema issues, missing indexes, data integrity       |
| **Security**       | Security gaps, missing controls                      |
| **Infrastructure** | Missing tooling, monitoring, automation              |
| **Documentation**  | Missing or outdated documentation                    |
| **Feature**        | Incomplete or mock implementations                   |

---

## 2. Technical Debt Items

| ID     | Type           | Module        | Description                                   | Severity | Age (est.)           | Effort | Impact                      | Status |
| ------ | -------------- | ------------- | --------------------------------------------- | -------- | -------------------- | ------ | --------------------------- | ------ |
| TD-001 | Security       | Security      | RLS rules null on multiple collections        | Critical | Since inception      | Low    | Data breach risk            | Open   |
| TD-002 | Security       | Security      | No MFA implementation                         | Critical | Since inception      | Medium | Unauthorized admin access   | Open   |
| TD-003 | Security       | Security      | No field-level encryption for sensitive data  | Critical | Since inception      | Medium | LGPD violation              | Open   |
| TD-004 | Data           | Database      | Missing indexes on filter/sort fields         | High     | Since inception      | Medium | Performance degradation     | Open   |
| TD-005 | Data           | Migrations    | Migration 0037 gap unresolved                 | High     | Since 0036/0038      | Low    | Schema integrity risk       | Open   |
| TD-006 | Feature        | Fiscal        | SEFAZ integration not implemented (mock)      | High     | Since inception      | High   | Fiscal non-compliance       | Open   |
| TD-007 | Feature        | Integrations  | Bank integration not implemented              | High     | Since inception      | High   | Manual conciliation         | Open   |
| TD-008 | Infrastructure | Performance   | No APM/observability tooling                  | High     | Since inception      | Medium | Undetected issues           | Open   |
| TD-009 | Infrastructure | Scalability   | No rate limiting                              | High     | Since inception      | Low    | API abuse risk              | Open   |
| TD-010 | Infrastructure | Scalability   | No caching layer                              | High     | Since inception      | Medium | Performance under load      | Open   |
| TD-011 | Code           | Frontend      | No automated test suite                       | High     | Since inception      | High   | Regression risk             | Open   |
| TD-012 | Feature        | Industry      | Production orders collection missing          | High     | Since Phase 0        | Medium | Industry incomplete         | Open   |
| TD-013 | Feature        | Industry      | MRP calculation hook not implemented          | Medium   | Since ADR-014        | Medium | Industry incomplete         | Open   |
| TD-014 | Feature        | BI            | No centralized analytics/ETL                  | High     | Since inception      | High   | Ad-hoc dashboards           | Open   |
| TD-015 | Feature        | AI            | No Skip Cloud Agent defined                   | Medium   | Since inception      | Low    | AI features limited         | Open   |
| TD-016 | Feature        | AI            | No RAG/vector search implementation           | Medium   | Since inception      | Medium | AI limited to chat          | Open   |
| TD-017 | Code           | Hooks         | Inconsistent error logging across hooks       | Medium   | Since inception      | Low    | Debugging difficulty        | Open   |
| TD-018 | Code           | Hooks         | Potential scoping violations in some hooks    | Medium   | Since inception      | Low    | Runtime ReferenceError risk | Open   |
| TD-019 | Architecture   | Permissions   | Identified permission gaps not closed         | Medium   | Since identification | Medium | Unauthorized access risk    | Open   |
| TD-020 | Feature        | Automations   | No visual automation builder                  | Medium   | Since inception      | High   | Code-required automations   | Open   |
| TD-021 | Feature        | Fiscal        | No SPED generation                            | Medium   | Since inception      | High   | Fiscal non-compliance       | Open   |
| TD-022 | Feature        | Fiscal        | No digital certificate management             | Medium   | Since inception      | Medium | NF-e issuance blocked       | Open   |
| TD-023 | Feature        | Integrations  | No webhook management                         | Medium   | Since inception      | Medium | Integration brittleness     | Open   |
| TD-024 | Feature        | Client Portal | Limited self-service features                 | Medium   | Since inception      | Medium | User dependency on support  | Open   |
| TD-025 | Infrastructure | Performance   | No CDN configuration                          | Medium   | Since inception      | Low    | Asset delivery slow         | Open   |
| TD-026 | Code           | Frontend      | Inconsistent loading state patterns           | Low      | Since inception      | Low    | UX inconsistency            | Open   |
| TD-027 | Code           | Navigation    | No consistent breadcrumb system               | Low      | Since inception      | Low    | Navigation confusion        | Open   |
| TD-028 | Data           | Collections   | Bool fields may be marked required            | Low      | Since inception      | Low    | Creation blocked            | Open   |
| TD-029 | Data           | Collections   | Inconsistent text vs json for structured data | Low      | Since inception      | Medium | Data integrity risk         | Open   |
| TD-030 | Code           | Relationships | Some relations lack cascadeDelete             | Low      | Since inception      | Low    | Orphaned records            | Open   |
| TD-031 | Feature        | Stock         | No negative stock blocking hook               | Low      | Since inception      | Low    | Inventory inconsistency     | Open   |
| TD-032 | Feature        | WMS           | No barcode/RFID integration                   | Medium   | Since inception      | High   | Manual scanning             | Open   |
| TD-033 | Feature        | Reports       | No scheduled report generation                | Low      | Since inception      | Medium | Manual reporting            | Open   |
| TD-034 | Documentation  | APIs          | No OpenAPI specification generated            | Low      | Since inception      | Low    | API discovery difficult     | Open   |

## 3. Debt Summary

| Type           | Critical | High   | Medium | Low   | Total  |
| -------------- | -------- | ------ | ------ | ----- | ------ |
| Security       | 3        | 0      | 0      | 0     | 3      |
| Data           | 0        | 2      | 0      | 2     | 4      |
| Feature        | 0        | 5      | 6      | 1     | 12     |
| Infrastructure | 0        | 3      | 1      | 0     | 4      |
| Code           | 0        | 1      | 2      | 3     | 6      |
| Architecture   | 0        | 0      | 1      | 0     | 1      |
| Documentation  | 0        | 0      | 0      | 1     | 1      |
| **Total**      | **3**    | **11** | **10** | **7** | **31** |

## 4. Debt Payment Strategy

### Phase 1: Critical (0-7 days)

- TD-001 (RLS), TD-002 (MFA), TD-003 (Encryption) — security first

### Phase 2: High (7-30 days)

- TD-004 (Indexes), TD-005 (Migration gap), TD-008 (APM), TD-009 (Rate limiting), TD-011 (Tests), TD-012 (Production orders)

### Phase 3: Medium (30-90 days)

- TD-006 (SEFAZ), TD-007 (Bank), TD-010 (Caching), TD-013 (MRP), TD-014 (BI), TD-015 (AI Agent), TD-016 (RAG)

### Phase 4: Low (90+ days)

- All low-severity items addressed opportunistically

---

_End of Technical Debt Matrix._

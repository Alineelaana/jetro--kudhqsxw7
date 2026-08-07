# Priority Matrix

> **Document ID:** PM-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 15.3

---

## 1. Prioritization Methodology

**Score = (impacto_usuario × 3 + impacto_negocio × 3 + (6 - esforço) × 2 + urgência × 2 + alinhamento × 2 + reducao_divida × 1)**

Maximum score: 90. Items with score ≥ 60 are prioritized for current quarter.

---

## 2. Priority Matrix

| ID      | Item                                  | Type        | Module        | Impact User | Impact Business | Effort (inv) | Urgency | Strategic | Debt Reduction | Score  | Priority | Quarter |
| ------- | ------------------------------------- | ----------- | ------------- | ----------- | --------------- | ------------ | ------- | --------- | -------------- | ------ | -------- | ------- |
| PRI-001 | Fix RLS null rules on all collections | Correction  | Security      | 5           | 5               | 1 (5)        | 5       | 5         | 5              | **82** | P0       | Q3 2026 |
| PRI-002 | Implement MFA for admin               | Correction  | Security      | 4           | 5               | 3 (3)        | 5       | 5         | 4              | **70** | P0       | Q3 2026 |
| PRI-003 | Field-level encryption (LGPD)         | Correction  | Security      | 3           | 5               | 3 (3)        | 5       | 5         | 4              | **68** | P0       | Q3 2026 |
| PRI-004 | Investigate migration 0037 gap        | Correction  | Migrations    | 2           | 5               | 1 (5)        | 5       | 4         | 4              | **64** | P0       | Q3 2026 |
| PRI-005 | Define Skip Cloud Agent               | Improvement | AI            | 4           | 4               | 3 (3)        | 4       | 5         | 3              | **63** | P1       | Q3 2026 |
| PRI-006 | Implement rate limiting               | Correction  | Scalability   | 3           | 4               | 2 (4)        | 4       | 4         | 4              | **61** | P1       | Q3 2026 |
| PRI-007 | Close permission gaps                 | Correction  | Permissions   | 3           | 4               | 3 (3)        | 4       | 4         | 4              | **58** | P1       | Q3 2026 |
| PRI-008 | Implement APM/observability           | Correction  | Performance   | 3           | 4               | 3 (3)        | 4       | 4         | 4              | **58** | P1       | Q3 2026 |
| PRI-009 | Create production_orders collection   | Correction  | Industry      | 3           | 4               | 3 (3)        | 4       | 4         | 4              | **58** | P1       | Q3 2026 |
| PRI-010 | Add database indexes                  | Correction  | Database      | 3           | 4               | 2 (4)        | 3       | 4         | 4              | **55** | P1       | Q4 2026 |
| PRI-011 | Implement MRP calculation hook        | Improvement | Industry      | 3           | 4               | 3 (3)        | 3       | 4         | 3              | **54** | P1       | Q4 2026 |
| PRI-012 | Implement caching layer               | Correction  | Scalability   | 3           | 4               | 3 (3)        | 3       | 4         | 4              | **54** | P1       | Q4 2026 |
| PRI-013 | Implement RAG/vector search           | Improvement | AI            | 3           | 4               | 3 (3)        | 3       | 4         | 3              | **54** | P1       | Q4 2026 |
| PRI-014 | Implement frontend test suite         | Improvement | Frontend      | 2           | 4               | 3 (3)        | 3       | 4         | 4              | **51** | P2       | Q4 2026 |
| PRI-015 | Implement SEFAZ integration           | Correction  | Fiscal        | 2           | 5               | 5 (1)        | 3       | 4         | 3              | **49** | P2       | Q4 2026 |
| PRI-016 | Implement bank integration            | Correction  | Financial     | 2           | 4               | 5 (1)        | 3       | 4         | 3              | **46** | P2       | Q4 2026 |
| PRI-017 | Audit hooks for scoping               | Correction  | Backend       | 2           | 3               | 2 (4)        | 3       | 3         | 4              | **45** | P2       | Q4 2026 |
| PRI-018 | Standardize hook error logging        | Improvement | Hooks         | 2           | 3               | 2 (4)        | 2       | 3         | 3              | **42** | P2       | Q4 2026 |
| PRI-019 | Implement visual automation builder   | Improvement | Automations   | 4           | 4               | 5 (1)        | 2       | 4         | 2              | **42** | P2       | Q1 2027 |
| PRI-020 | Centralized BI/analytics model        | Improvement | BI            | 3           | 4               | 5 (1)        | 2       | 4         | 3              | **42** | P2       | Q1 2027 |
| PRI-021 | Implement SPED generation             | Correction  | Fiscal        | 1           | 4               | 5 (1)        | 2       | 4         | 3              | **39** | P2       | Q1 2027 |
| PRI-022 | Implement negative stock blocking     | Correction  | Stock         | 2           | 3               | 2 (4)        | 2       | 3         | 3              | **39** | P2       | Q1 2027 |
| PRI-023 | Implement digital cert management     | Correction  | Fiscal        | 1           | 4               | 3 (3)        | 2       | 4         | 3              | **38** | P2       | Q1 2027 |
| PRI-024 | Generate OpenAPI documentation        | Improvement | APIs          | 2           | 3               | 2 (4)        | 2       | 3         | 2              | **35** | P3       | Q1 2027 |
| PRI-025 | Implement webhook management          | Correction  | Integrations  | 2           | 3               | 3 (3)        | 2       | 3         | 3              | **35** | P3       | Q1 2027 |
| PRI-026 | Client portal self-service expansion  | Improvement | Client Portal | 3           | 3               | 3 (3)        | 2       | 3         | 2              | **35** | P3       | Q1 2027 |
| PRI-027 | Implement campaign ROI tracking       | Improvement | Campaigns     | 2           | 3               | 3 (3)        | 2       | 3         | 2              | **35** | P3       | Q2 2027 |
| PRI-028 | Implement barcode/RFID for WMS        | Improvement | WMS           | 3           | 3               | 5 (1)        | 2       | 3         | 2              | **33** | P3       | Q2 2027 |
| PRI-029 | Implement automated lead scoring      | Improvement | CRM           | 2           | 3               | 3 (3)        | 2       | 3         | 2              | **32** | P3       | Q2 2027 |
| PRI-030 | Implement session timeout             | Correction  | Security      | 2           | 3               | 2 (4)        | 2       | 3         | 3              | **32** | P3       | Q2 2027 |

## 3. Quarterly Distribution

| Quarter   | P0 Items | P1 Items | P2 Items | P3 Items | Total  |
| --------- | -------- | -------- | -------- | -------- | ------ |
| Q3 2026   | 4        | 2        | 0        | 0        | 6      |
| Q4 2026   | 0        | 6        | 6        | 0        | 12     |
| Q1 2027   | 0        | 0        | 6        | 3        | 9      |
| Q2 2027   | 0        | 0        | 0        | 3        | 3      |
| **Total** | **4**    | **8**    | **12**   | **6**    | **30** |

## 4. Resource Allocation Recommendation

| Quarter | Estimated Effort (person-weeks) | Focus                                    |
| ------- | ------------------------------- | ---------------------------------------- |
| Q3 2026 | 12                              | Security hardening + migration integrity |
| Q4 2026 | 24                              | Industry completion + performance + AI   |
| Q1 2027 | 20                              | Fiscal compliance + automation + BI      |
| Q2 2027 | 12                              | UX improvements + integrations           |

---

_End of Priority Matrix._

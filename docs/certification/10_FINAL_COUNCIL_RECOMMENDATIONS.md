# Final Architecture Council Recommendations

> **Document ID:** FACR-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0

---

## 1. Strategic Recommendations

### REC-001: Security First — Immediate Action Required

**Recommendation:** Resolve all 3 critical security non-conformities (RLS, MFA, encryption) within 7 days before any new feature development.

**Justification:** The platform handles sensitive personal data (CPF, CNPJ, banking) subject to LGPD. Null RLS rules on collections represent an unacceptable data breach risk. MFA absence for admin accounts is a critical access control failure.

**Evidence:** NC-CRIT-002 (RLS null), NC-HIGH-003 (no MFA), NC-HIGH-004 (no encryption); PLATFORM_PRINCIPLES §7 (Security Directives); ADR-010 (LGPD Compliance).

### REC-002: Complete the Industry Module

**Recommendation:** Implement production_orders collection, MRP calculation hook, and production apontamento hooks within 30 days.

**Justification:** The industry module (BLK-MVP-018 through BLK-MVP-024) is architecturally designed (ADRs 014-018, migrations 0075-0088) but lacks execution-layer collections. The foundation (specs, BOM, routes, costs) is excellent; the execution gap must be closed.

**Evidence:** NC-HIGH-007 (no production_orders), NC-MED-016 (no apontamento hooks), NC-MED-017 (no MRP hook); ADR-014 (MRP as hook), ADR-017 (BOM versioned), BLK-MVP-022.

### REC-003: Establish Observability Foundation

**Recommendation:** Integrate APM tooling, implement query performance monitoring, and establish performance baselines within 30 days.

**Justification:** The platform cannot be certified for performance (FCP PERF-01 through PERF-05) without measurement infrastructure. Current performance is unknown and unmonitored.

**Evidence:** NC-HIGH-013 (no APM), NC-MED-031 (no query monitoring); ADR-009 (Observability); ARCHITECTURE.md §6.

### REC-004: Define AI Agent and Implement RAG

**Recommendation:** Define a Skip Cloud Agent for customer support via migration and implement RAG with `$ai.embed` and `$vectors.search` within 45 days.

**Justification:** The platform has `$ai` gateway available but no agents defined. The AI module components (AiAssistant, AiAgents, AiKnowledgeBase) exist but lack backend agent infrastructure. RAG is essential for knowledge-base-powered assistance.

**Evidence:** NC-HIGH-010 (no agent defined), NC-MED-026 (no RAG); ADR-003 (AI as native layer); PRD §4, §8.

### REC-005: Implement Test Infrastructure

**Recommendation:** Establish Vitest for frontend unit/integration tests and implement automated migration testing in CI/CD within 45 days.

**Justification:** No automated tests exist. Every code change carries regression risk. The FCP requires evidence-based acceptance, which cannot be achieved without repeatable automated tests.

**Evidence:** NC-MED-010 (no frontend tests), NC-HIGH-002 (no migration testing); FCP Phase 7; PLATFORM_PRINCIPLES §12.2.

## 2. Architectural Recommendations

### REC-006: Maintain Architecture-Implementation Separation

**Recommendation:** Continue the practice (ADR-020) of documenting conceptual architecture independently of current implementation constraints.

**Justification:** This practice has proven invaluable — the Digital Channels architecture was defined before infrastructure supported it, enabling future activation without redesign.

### REC-007: Extend Shared Platform Services

**Recommendation:** Create collections for conceptually-defined but unimplemented shared services (Comments, Tasks, Workflows, Approvals).

**Justification:** ADR-012 defines 27 shared services but several lack dedicated collections. These services are referenced in documentation but have no data model.

### REC-008: Standardize Data Export Framework

**Recommendation:** Unify the 12+ export libraries (csv-export, chart-export, report-pdf, report-xls, etc.) into a single configurable export framework.

**Justification:** Current per-domain export libraries duplicate logic and create maintenance burden. A unified framework would reduce code, ensure consistency, and enable future format additions.

## 3. Process Recommendations

### REC-009: Establish FCP as Continuous Process

**Recommendation:** Integrate FCP checklists into CI/CD pipeline, starting with automated checks (lint, types, unit tests) and progressively adding functional and integration tests.

**Justification:** FCP Phase 10 mandates continuous certification. Manual FCP execution is sustainable only for major releases; CI/CD integration enables per-PR validation.

### REC-010: Create Technical Debt Registry

**Recommendation:** Establish a centralized technical debt registry (collection or document) tracked per module with aging metrics.

**Justification:** Current debt tracking is fragmented (price_vault, pricing_risk_monitor, PHASE0_RECOVERY_PLAN). A centralized registry enables systematic debt management and visibility.

### REC-011: Regular Certification Renewal

**Recommendation:** Establish annual full re-certification and per-release targeted certification per FCP Phase 10.

**Justification:** The platform is evolving rapidly. Annual re-certification ensures the certification remains current and relevant.

## 4. Technology Recommendations

### REC-012: Adopt OpenAPI Generation

**Recommendation:** Generate OpenAPI specification from PocketBase schema and custom routes.

**Justification:** API First (ADR-002) requires documented APIs. OpenAPI enables SDK generation, client onboarding, and marketplace integration.

### REC-013: Plan for Caching Infrastructure

**Recommendation:** Introduce Redis (or equivalent) for caching hot data (catalogs, configs, dashboards, session data).

**Justification:** The platform has no caching layer. As user count grows, database load will increase proportionally. Caching is a prerequisite for scalability.

### REC-014: Evaluate Read Replicas

**Recommendation:** For V2/V3, evaluate database read replicas for reporting and dashboard queries.

**Justification:** Dashboard and report queries can be heavy. Read replicas would isolate analytical load from transactional operations.

## 5. Governance Recommendations

### REC-015: Designate FCP Auditor

**Recommendation:** Designate a dedicated FCP auditor responsible for certification execution, evidence verification, and framework evolution.

**Justification:** FCP Phase 2.3 defines the Auditor FCP role. Currently, this role is filled ad-hoc by the Architecture Council. A dedicated auditor ensures consistency and depth.

### REC-016: Establish Architecture Council Cadence

**Recommendation:** Formalize weekly Architecture Council sessions for ADR review and certification approvals.

**Justification:** FCP Phase 11.5 requires weekly council meetings. Formal cadence ensures timely decision-making.

---

## 6. Recommendation Summary

| ID      | Recommendation                            | Priority | Timeline  | Impact    |
| ------- | ----------------------------------------- | -------- | --------- | --------- |
| REC-001 | Security hardening (RLS, MFA, encryption) | P0       | 7 days    | Critical  |
| REC-002 | Complete industry module                  | P0       | 30 days   | High      |
| REC-003 | Observability foundation                  | P0       | 30 days   | High      |
| REC-004 | AI agent + RAG                            | P1       | 45 days   | High      |
| REC-005 | Test infrastructure                       | P1       | 45 days   | High      |
| REC-006 | Maintain arch-implementation separation   | P2       | Ongoing   | Strategic |
| REC-007 | Extend shared services collections        | P2       | 60 days   | Medium    |
| REC-008 | Unify export framework                    | P2       | 90 days   | Medium    |
| REC-009 | FCP in CI/CD                              | P1       | 60 days   | High      |
| REC-010 | Technical debt registry                   | P2       | 30 days   | Medium    |
| REC-011 | Certification renewal cadence             | P2       | Annual    | Strategic |
| REC-012 | OpenAPI generation                        | P3       | 60 days   | Low       |
| REC-013 | Caching infrastructure                    | P1       | 90 days   | High      |
| REC-014 | Read replicas evaluation                  | P3       | V2+       | Strategic |
| REC-015 | Designate FCP auditor                     | P2       | 30 days   | Medium    |
| REC-016 | Council cadence                           | P2       | Immediate | Medium    |

---

_End of Final Architecture Council Recommendations._

# General Evolution Plan

> **Document ID:** GEP-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 8.2.4
> **Horizon:** Short (6 months) / Medium (12 months) / Long (24+ months)

---

## 1. Short-Term Evolution (0-6 months)

| ID      | Evolution                                    | Module      | Justification                                                                            | Impact   | Effort | Horizon |
| ------- | -------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- | -------- | ------ | ------- |
| EVO-001 | Define Skip Cloud Agent for customer support | AI          | Platform has `$ai` gateway but no agents defined; immediate value from automated support | High     | Medium | Short   |
| EVO-002 | Implement production order execution         | Industry    | BLK-MVP-022 requires production_orders collection; industry module incomplete without it | High     | Medium | Short   |
| EVO-003 | Close security RLS gaps                      | Security    | NC-CRIT-002 blocks certification; fundamental security requirement                       | Critical | Low    | Short   |
| EVO-004 | Implement MRP calculation hook               | Industry    | ADR-014 defines MRP as hook; not yet implemented; blocks industry module completion      | High     | Medium | Short   |
| EVO-005 | Integrate APM/observability                  | Performance | Cannot certify performance without measurement; FCP PERF requirements unmet              | High     | Medium | Short   |
| EVO-006 | Implement rate limiting                      | Scalability | API protection against abuse; prerequisite for public API exposure                       | High     | Low    | Short   |
| EVO-007 | Generate OpenAPI documentation               | APIs        | API First principle (ADR-002) requires documented APIs; enables future SDK generation    | Medium   | Low    | Short   |

## 2. Medium-Term Evolution (6-12 months)

| ID      | Evolution                            | Module                 | Justification                                                                       | Impact   | Effort | Horizon |
| ------- | ------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------- | -------- | ------ | ------- |
| EVO-008 | Centralized BI/analytics data model  | BI                     | NC-HIGH-008/009; dashboards derive data ad-hoc; standardized KPI computation needed | High     | High   | Medium  |
| EVO-009 | SEFAZ NF-e integration               | Fiscal/Integrations    | NC-HIGH-006/011; fiscal module lacks real tax authority integration                 | Critical | High   | Medium  |
| EVO-010 | Bank integration for conciliation    | Financial/Integrations | NC-HIGH-012; conciliation is manual; bank API integration needed                    | High     | High   | Medium  |
| EVO-011 | Visual automation builder            | Automations            | NC-MED-028; "Configurar antes de Customizar" principle requires no-code automation  | High     | High   | Medium  |
| EVO-012 | RAG/vector search implementation     | AI                     | NC-MED-026; `$ai.embed` and `$vectors.search` available but unused                  | High     | Medium | Medium  |
| EVO-013 | Frontend test suite                  | Frontend               | NC-MED-010; no automated tests; regression risk                                     | Medium   | Medium | Medium  |
| EVO-014 | Caching layer (Redis)                | Scalability            | NC-HIGH-015; hot data not cached; performance impact                                | High     | Medium | Medium  |
| EVO-015 | Digital certificate management       | Fiscal                 | NC-MED-014; required for real NF-e issuance                                         | High     | Medium | Medium  |
| EVO-016 | Client portal self-service expansion | Client Portal          | NC-MED-030; PRD §10.6 requires document self-service                                | Medium   | Medium | Medium  |
| EVO-017 | Campaign ROI tracking                | Campaigns              | NC-MED-020; marketing effectiveness unmeasurable                                    | Medium   | Medium | Medium  |

## 3. Long-Term Evolution (12-24+ months)

| ID      | Evolution                         | Module       | Justification                                                                              | Impact | Effort | Horizon |
| ------- | --------------------------------- | ------------ | ------------------------------------------------------------------------------------------ | ------ | ------ | ------- |
| EVO-018 | Multi-channel physical separation | Architecture | ADR-020 envisions separate projects per Digital Channel; requires infrastructure evolution | High   | High   | Long    |
| EVO-019 | Dedicated instance for Enterprise | Scalability  | ADR-001 supports migration to dedicated instances; requires operational tooling            | High   | High   | Long    |
| EVO-020 | Marketplace and plugin SDK        | Ecosystem    | ROADMAP V2; requires sandbox architecture, review process, revenue share                   | High   | High   | Long    |
| EVO-021 | White label complete              | Platform     | ROADMAP V2; branding, domain, template customization per partner                           | Medium | High   | Long    |
| EVO-022 | Mobile native app                 | Frontend     | ROADMAP V2; native iOS/Android for management on-the-go                                    | Medium | High   | Long    |
| EVO-023 | AI agents collaboration           | AI           | PRODUCT_VISION_2035 §4.1; agents collaborating across domains                              | High   | High   | Long    |
| EVO-024 | Predictive analytics              | AI           | PRD §9.1; sales, stock, cash flow, demand predictions with confidence levels               | High   | High   | Long    |
| EVO-025 | Prescriptive analytics            | AI           | PRD §9.2; action recommendations with justification and confidence                         | High   | High   | Long    |

## 4. Evolution Principles

1. **Architecture-first:** Every evolution must reference an ADR or create one (PLATFORM_PRINCIPLES §4.5)
2. **Evidence-based:** Every evolution must produce evidence at all 5 levels (§4.10)
3. **Sustainable:** REAPROVEITAR → ESTENDER → RELACIONAR → CRIAR (§4.1)
4. **Neutral:** Shared structures must not be coupled to specific modules (§4.2)
5. **Configurable:** Evolution should increase configurability, not code (§4.3)
6. **Simple:** Simplest solution that solves the problem (§4.7)

## 5. Evolution Roadmap Alignment

| Evolution | ROADMAP Version | BACKLOG Item | PRD Reference |
| --------- | --------------- | ------------ | ------------- |
| EVO-001   | MVP             | BLK-MVP-011  | §4, §8        |
| EVO-002   | MVP             | BLK-MVP-022  | §3.11         |
| EVO-008   | V1              | BLK-V1-005   | §6.2          |
| EVO-009   | MVP             | BLK-MVP-013  | §3.1          |
| EVO-010   | MVP             | BLK-MVP-003  | §3.3          |
| EVO-011   | V1              | BLK-V1-002   | §3.9, §7      |
| EVO-012   | V1              | BLK-V1-004   | §3.9          |
| EVO-018   | V2              | ADR-020      | §4.9          |
| EVO-019   | V3              | BLK-V3-001   | §10.1         |
| EVO-020   | V2              | BLK-V2-002   | §10.4         |
| EVO-021   | V2              | BLK-V2-004   | §11           |
| EVO-022   | V2              | BLK-V2-003   | §3.8          |
| EVO-023   | V3              | BLK-V3-004   | §4            |
| EVO-024   | V1              | BLK-V1-006   | §9.1          |
| EVO-025   | V1              | BLK-V1-007   | §9.2          |

---

_End of General Evolution Plan._

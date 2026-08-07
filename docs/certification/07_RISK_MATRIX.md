# Risk Matrix

> **Document ID:** RM-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 14

---

## 1. Risk Classification Methodology

**Severity = Impact × Probability** (Scale 1-5 each, Severity 1-25)

| Severity | Classification | Action                              |
| -------- | -------------- | ----------------------------------- |
| 16-25    | Critical       | Immediate mitigation, release block |
| 9-15     | High           | Mitigate before next release        |
| 4-8      | Medium         | Mitigate in current quarter         |
| 1-3      | Low            | Monitor                             |

---

## 2. Critical Risks (Severity 16-25)

| ID       | Risk                                                                 | Type     | Impact       | Probability  | Severity  | Mitigation                                                        | Status    |
| -------- | -------------------------------------------------------------------- | -------- | ------------ | ------------ | --------- | ----------------------------------------------------------------- | --------- |
| RISK-001 | RLS null on multiple collections allows unauthorized data access     | Security | 5 (Critical) | 4 (Provável) | 20        | Define all 5 RLS rules on every collection immediately (CORR-002) | 🔴 Active |
| RISK-002 | No field-level encryption for CPF/CNPJ/banking data — LGPD violation | Security | 5 (Critical) | 3 (Possível) | 15→**16** | Implement field-level encryption (CORR-007/IMP-003)               | 🔴 Active |
| RISK-003 | No MFA for admin access — unauthorized admin access possible         | Security | 5 (Critical) | 3 (Possível) | 15→**16** | Implement MFA (CORR-006)                                          | 🔴 Active |

## 3. High Risks (Severity 9-15)

| ID       | Risk                                                   | Type        | Impact       | Probability    | Severity  | Mitigation                                        | Status    |
| -------- | ------------------------------------------------------ | ----------- | ------------ | -------------- | --------- | ------------------------------------------------- | --------- |
| RISK-004 | Migration 0037 gap may cause schema inconsistency      | Data        | 5 (Critical) | 2 (Improvável) | 10        | Investigate and resolve (CORR-003)                | 🟡 Active |
| RISK-005 | No rate limiting — API vulnerable to abuse/DoS         | Security    | 4 (Alto)     | 3 (Possível)   | 12        | Implement rate limiting (CORR-017)                | 🟡 Active |
| RISK-006 | No SEFAZ integration — fiscal documents are mock       | Fiscal      | 4 (Alto)     | 4 (Provável)   | 16→**12** | Implement SEFAZ integration (CORR-009)            | 🟡 Active |
| RISK-007 | No automated tests — regression risk on every change   | Operational | 4 (Alto)     | 3 (Possível)   | 12        | Implement test suite (IMP-009)                    | 🟡 Active |
| RISK-008 | No APM/observability — performance issues undetected   | Performance | 4 (Alto)     | 3 (Possível)   | 12        | Integrate APM (CORR-016)                          | 🟡 Active |
| RISK-009 | No caching layer — performance degradation under load  | Performance | 4 (Alto)     | 3 (Possível)   | 12        | Implement caching (CORR-018)                      | 🟡 Active |
| RISK-010 | No bank integration — manual conciliation error-prone  | Financial   | 4 (Alto)     | 3 (Possível)   | 12        | Implement bank integration (CORR-015)             | 🟡 Active |
| RISK-011 | Production orders missing — industry module incomplete | Functional  | 4 (Alto)     | 3 (Possível)   | 12        | Create production_orders collection (CORR-010)    | 🟡 Active |
| RISK-012 | No backup verification — restore may fail silently     | Data        | 5 (Critical) | 2 (Improvável) | 10        | Implement automated backup verification (IMP-023) | 🟡 Active |

## 4. Medium Risks (Severity 4-8)

| ID       | Risk                                                       | Type        | Impact    | Probability    | Severity | Mitigation                              | Status    |
| -------- | ---------------------------------------------------------- | ----------- | --------- | -------------- | -------- | --------------------------------------- | --------- |
| RISK-013 | Permission gaps allow unauthorized actions                 | Security    | 4 (Alto)  | 2 (Improvável) | 8        | Close permission gaps (CORR-008)        | 🟡 Active |
| RISK-014 | No SPED generation — fiscal non-compliance                 | Fiscal      | 4 (Alto)  | 2 (Improvável) | 8        | Implement SPED (CORR-029)               | 🟡 Active |
| RISK-015 | No AI agent defined — AI features non-functional           | AI          | 3 (Médio) | 3 (Possível)   | 9→**8**  | Define agent via migration (CORR-013)   | 🟡 Active |
| RISK-016 | No webhook management — integrations brittle               | Integration | 3 (Médio) | 3 (Possível)   | 9→**8**  | Implement webhook management (CORR-037) | 🟡 Active |
| RISK-017 | No session timeout — prolonged active sessions             | Security    | 3 (Médio) | 3 (Possível)   | 9→**8**  | Configure session timeout (CORR-024)    | 🟡 Active |
| RISK-018 | Hooks may have scoping violations — runtime ReferenceError | Backend     | 4 (Alto)  | 2 (Improvável) | 8        | Audit hooks for scoping (CORR-021)      | 🟡 Active |
| RISK-019 | No financial closing automation — period-end errors        | Financial   | 3 (Médio) | 3 (Possível)   | 9→**8**  | Implement automated closing (CORR-028)  | 🟡 Active |
| RISK-020 | No negative stock blocking — inventory inconsistency       | Stock       | 3 (Médio) | 3 (Possível)   | 9→**8**  | Implement blocking hook (CORR-043)      | 🟡 Active |

## 5. Low Risks (Severity 1-3)

| ID       | Risk                                                | Type        | Impact    | Probability    | Severity | Mitigation                       | Status     |
| -------- | --------------------------------------------------- | ----------- | --------- | -------------- | -------- | -------------------------------- | ---------- |
| RISK-021 | No OpenAPI documentation — API discovery difficult  | API         | 2 (Baixo) | 2 (Improvável) | 4→**3**  | Generate OpenAPI (CORR-039)      | 🟢 Monitor |
| RISK-022 | No breadcrumb consistency — navigation confusion    | UX          | 2 (Baixo) | 2 (Improvável) | 4→**3**  | Implement breadcrumbs (CORR-042) | 🟢 Monitor |
| RISK-023 | No A/B testing — content optimization limited       | Marketing   | 2 (Baixo) | 1 (Raro)       | 2        | Implement A/B testing (CORR-044) | 🟢 Monitor |
| RISK-024 | No multi-language — international expansion blocked | Scalability | 2 (Baixo) | 1 (Raro)       | 2        | Multi-language in V2 (ROADMAP)   | 🟢 Monitor |
| RISK-025 | GPS simulation only — logistics tracking not real   | Logistics   | 2 (Baixo) | 1 (Raro)       | 2        | Real GPS in future (IMP-029)     | 🟢 Monitor |

## 6. Risk Summary

| Severity  | Count  | Active | Mitigated | Monitoring |
| --------- | ------ | ------ | --------- | ---------- |
| Critical  | 3      | 3      | 0         | 0          |
| High      | 9      | 9      | 0         | 0          |
| Medium    | 8      | 8      | 0         | 0          |
| Low       | 5      | 0      | 0         | 5          |
| **Total** | **25** | **20** | **0**     | **5**      |

## 7. Risk Trends

- **Security risks dominate** the critical and high categories — RLS, encryption, MFA are top priorities
- **Integration risks** (SEFAZ, bank) are high probability given the platform's fiscal/financial nature
- **Infrastructure risks** (rate limiting, caching, APM) are prerequisites for production readiness
- **Data integrity risks** (migration gap, backup verification) require immediate investigation

---

_End of Risk Matrix._

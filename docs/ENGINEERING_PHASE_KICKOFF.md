# ENGINEERING_PHASE_KICKOFF.md — Engineering Phase Kickoff

> **Official Document — Engineering Phase Kickoff**
> Date: 2026-08-07
> Status: ACTIVE
> Responsible: Product Owner & Engineering Team
> Phase: Product Engineering & Commercial Evolution

---

## 1. Phase Objective

Build a **secure, scalable, commercially competitive, simple-to-operate, and simple-to-maintain** product on the foundation established during certification.

---

## 2. Engineering Principles

1. **Ship value, not features** — Every change must solve a real customer problem
2. **Security is not optional** — P0 security items block all feature work
3. **Simplicity wins** — If it's complex, it's probably wrong
4. **Evidence over claims** — "Done" means proven, not declared
5. **Backlog-driven** — No work without a corresponding Strategic Backlog item
6. **Customer-first** — Every decision starts with "what does the customer need?"

---

## 3. Lean Engineering Cycle

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   SELECT ──► ANALYZE IMPACT ──► IMPLEMENT ──► TEST      │
│      ▲                                           │      │
│      │                                           ▼      │
│   CONCLUDE ◄── VALIDATE ◄────────────────────────       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step Details

| Step           | Input             | Action                                                | Output                              | Exit Criteria                                       |
| -------------- | ----------------- | ----------------------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| SELECT         | Strategic Backlog | Pick highest-priority item with resolved dependencies | Selected item ID                    | Dependencies satisfied; priority confirmed          |
| ANALYZE IMPACT | Selected item     | Assess technical, business, and architectural impact  | Impact analysis (ADR if structural) | 5 questions answered; scope defined                 |
| IMPLEMENT      | Impact analysis   | Write code following platform standards               | Code changes                        | Follows DRY, SOLID, conventions; under 150 LOC/file |
| TEST           | Code changes      | Verify functionality                                  | Test results                        | Functional test passed; edge cases covered          |
| VALIDATE       | Test results      | Confirm against 5-level evidence framework            | Evidence package                    | All applicable levels proven; NA justified          |
| CONCLUDE       | Evidence package  | Update backlog status; document evidence              | Updated backlog                     | Status = Implementado; evidence archived            |

---

## 4. Sprint 1 — Security Debt Resolution (P0)

| Item    | NC          | Task                                                     | Est. Effort                   |
| ------- | ----------- | -------------------------------------------------------- | ----------------------------- |
| BEP-002 | NC-CRIT-001 | Add `created`/`updated` autodate to all base collections | Migration + verification      |
| BEP-001 | NC-CRIT-002 | Define 5 RLS rules on all collections                    | Migration + verification      |
| BEP-003 | NC-CRIT-003 | Investigate migration 0037 gap                           | Investigation + documentation |

**Goal:** Resolve all 3 critical NCs and produce evidence per ADR-022.

---

## 5. Sprint 2 — Security & Core (P0/P1)

| Item    | Task                                   | Priority |
| ------- | -------------------------------------- | -------- |
| BEP-005 | MFA for administrators (TOTP)          | P0       |
| BEP-025 | Create production_orders collection    | P0       |
| BEP-006 | Field-level encryption for LGPD data   | P1       |
| BEP-004 | Database indexes on filter/sort fields | P1       |
| BEP-010 | Schema validation hook                 | P1       |

---

## 6. Sprint 3+ — Feature Development (P1)

| Item    | Task                           | Priority |
| ------- | ------------------------------ | -------- |
| BEP-020 | Define Skip Cloud Agent        | P1       |
| BEP-021 | Rate limiting on custom routes | P1       |
| BEP-026 | Hook MRP calculation           | P1       |
| BEP-027 | Production apontamento         | P1       |
| BEP-028 | Centralized KPI service        | P1       |
| BEP-029 | Basic ETL                      | P1       |
| BEP-032 | Standardize logger in hooks    | P1       |

---

## 7. Definition of Done

An item is **DONE** when:

1. ✅ Code is written and follows platform standards
2. ✅ Functional test passed (manual or automated)
3. ✅ Edge cases are covered
4. ✅ No regressions introduced
5. ✅ Evidence produced for all applicable validation levels (ADR-022)
6. ✅ Backlog status updated to "Implementado"
7. ✅ Architecture Council notified (if structural change)

---

## 8. Communication Protocol

- **Daily:** Engineering team syncs on current item progress
- **Per item:** Engineering team presents evidence at CONCLUDE step
- **Weekly:** Product Owner reviews backlog status and priorities
- **Per ADR:** Architecture Council reviews structural decisions
- **Per sprint:** Retrospective on engineering cycle effectiveness

---

## 9. Backlog Reference

The Strategic Backlog is at: `docs/BACKLOG_ESTRATEGICO_PLATAFORMA.md`

**Rule:** If it's not in the backlog, it doesn't get built. If it needs building, add it to the backlog first (with Architecture Council approval).

---

_The engineering phase has begun. Build with purpose, ship with evidence._

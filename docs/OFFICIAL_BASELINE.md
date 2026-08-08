# OFFICIAL BASELINE — VeloraLog Platform

> **Status: FROZEN**
> Date: 2026-08-07
> Baseline ID: BL-001
> Source: Last historically proven stable deployment (post-migration 0111, pre-Verbas/Controladoria)

---

## 1. Historical Deployment/Revision Chosen

**Revision:** State of the application after migration `0111_platform_layer_consolidation.js` (applied) and BEFORE migrations `0112_create_supplier_allowance_collections.js` (Verbas) and `0115_create_controladoria_collections.js` (Controladoria).

**Date/Time:** 2026-08-07

**Rationale:** This is the last state where all original modules were intact and functional before the Supplier Allowances and Controladoria modules were added. All migrations 0001–0111 form the stable history.

---

## 2. Modules in the Official Baseline

| #   | Module                  | Route                      | Group         |
| --- | ----------------------- | -------------------------- | ------------- |
| 1   | Dashboard               | `/admin`                   | Principal     |
| 2   | Notificações            | `/admin/notificacoes`      | Principal     |
| 3   | Atendimento             | `/admin/atendimento`       | Principal     |
| 4   | Vendas                  | `/admin/vendas`            | Comercial     |
| 5   | Produtos                | `/admin/produtos`          | Comercial     |
| 6   | Cadastros               | `/admin/cadastros`         | Comercial     |
| 7   | Tabelas de Preços       | `/admin/tabelas-precos`    | Comercial     |
| 8   | CRM                     | `/admin/crm`               | Comercial     |
| 9   | Promoções               | `/admin/promocoes`         | Comercial     |
| 10  | Financeiro              | `/admin/financeiro`        | Financeiro    |
| 11  | Logística               | `/admin/logistica`         | Operação      |
| 12  | Estoque                 | `/admin/estoque`           | Operação      |
| 13  | Indústria               | `/admin/industria`         | Operação      |
| 14  | Fiscal                  | `/admin/fiscal`            | Fiscal & RH   |
| 15  | Conformidade            | `/admin/conformidade`      | Fiscal & RH   |
| 16  | Recursos Humanos        | `/admin/rh`                | Fiscal & RH   |
| 17  | Departamento Pessoal    | `/admin/dp`                | Fiscal & RH   |
| 18  | SST                     | `/admin/sst`               | Fiscal & RH   |
| 19  | BI                      | `/admin/bi`                | Inteligência  |
| 20  | Inteligência Artificial | `/admin/ia/dashboard`      | Inteligência  |
| 21  | Remuneração Variável    | `/admin/remuneracao`       | Inteligência  |
| 22  | Configurações           | `/admin/configuracoes`     | Administração |
| 23  | Phase0 Foundation       | `/admin/phase0-foundation` | Administração |
| 24  | Platform Layer          | `/admin/platform-layer`    | Administração |

**Total: 24 modules (all classification A — stable)**

---

## 2b. Recovered Modules (Post-Baseline Additions, Now Protected)

| #   | Module                 | Route                        | Group         | Classification |
| --- | ---------------------- | ---------------------------- | ------------- | -------------- |
| R1  | Precificação           | `/admin/precificacao`        | Comercial     | A (recovered)  |
| R2  | Auditoria              | `/admin/auditoria`           | Administração | A (recovered)  |
| R3  | Controladoria          | `/admin/controladoria`       | Inteligência  | A (recovered)  |
| R4  | Verbas de Fornecedores | `/admin/verbas-fornecedores` | Financeiro    | A (recovered)  |

**Total recovered: 4 modules (28 protected routes total)**

---

## 3. Removed Modules (Checkpointed, Not Active)

| Module                                       | Reason                                     | Checkpoint Location                                      |
| -------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| Verbas de Fornecedores (Supplier Allowances) | Did not exist in baseline (migration 0112) | Code preserved in repository, not imported by active app |
| Controladoria (Corporate Performance)        | Did not exist in baseline (migration 0115) | Code preserved in repository, not imported by active app |

---

## 4. Permission Matrix State

- **Total permission keys:** 80 (stable baseline only)
- **No additions allowed**
- **Prefixes allowed for additions:** none (`ALLOWED_ADDITION_PREFIXES = []`)

---

## 5. Database/Schema State

- All migrations 0001–0118 remain applied (no rollback)
- Supplier Allowances collections remain in database but unused
- Controladoria collections remain in database but unused
- No destructive schema changes performed
- All users, commercial, financial, and industrial records preserved

---

## 6. Navigation Contract

- Build-time validation: `scripts/validate-navigation.mjs`
- Runtime validation: `src/lib/navigation-contract.ts`
- Baseline definition: `src/lib/navigation-baseline.ts`
- Regression test: `src/lib/navigation-regression-test.ts`

Any official module disappearing without explicit work-order removal fails the build.

---

## 7. Build & Deploy

- **Build:** PASS (navigation contract validation passes with pure baseline)
- **Deploy target:** `https://logistica-premium-es-2cc14.goskip.app`

---

## 8. SUP Test

With SUP profile: Login → Área da Empresa → Menu Principal shows all 24 baseline modules with working breadcrumbs, favorites, and Global Search.

---

## 9. Final Status

**RECUPERADO (RECOVERED)**

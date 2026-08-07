# Delivery Report — Baseline Recovery

> **Date/Time:** 2026-08-07
> **Final Status:** RECUPERADO (RECOVERED)

---

## (1) Historical Deployment/Revision Chosen

**Revision:** Post-migration `0111_platform_layer_consolidation.js` (applied), before `0112_create_supplier_allowance_collections.js` and `0115_create_controladoria_collections.js`.

This is the last historically proven stable deployment where all original modules were intact and functional.

## (2) Date/Time

2026-08-07

## (3) Modules That Existed in the Baseline

1. Dashboard
2. Notificações
3. Atendimento
4. Vendas (with sub-screens: Pedidos, Faturamento, NFe, Contratos)
5. Produtos
6. Cadastros
7. Tabelas de Preços
8. CRM
9. Promoções
10. Financeiro
11. Logística
12. Estoque
13. Indústria
14. Fiscal
15. Conformidade
16. Recursos Humanos
17. Departamento Pessoal
18. SST
19. BI
20. Inteligência Artificial
21. Remuneração Variável
22. Configurações
23. Phase0 Foundation
24. Platform Layer

**Total: 24 modules**

## (4) Whether Supplier Allowances Was Removed

**YES** — Supplier Allowances (Verbas de Fornecedores) was removed from:

- Routes in `App.tsx` (11 routes removed)
- Menu entries in `admin-menu-config.ts` (1 entry with 10 children removed)
- Permission Matrix in `permission-matrix.ts` (13 permission keys removed)
- Navigation baseline allowed additions (`ALLOWED_ADDITION_PREFIXES` cleared)

Code, migrations, hooks, and database collections preserved as checkpoint. Not deleted.

## (5) Whether Corporate Performance Was Kept or Removed

**REMOVED** — Corporate Performance (Controladoria) was removed from:

- Routes in `App.tsx` (16 routes removed)
- Menu entries in `admin-menu-config.ts` (1 entry removed)
- Permission Matrix in `permission-matrix.ts` (13 permission keys removed)
- Navigation baseline allowed additions cleared

Code, migrations, hooks, and database collections preserved as checkpoint. Not deleted.

## (6) Database/Schema State

- All migrations (0001–0118) remain applied — no rollback
- Supplier Allowances collections remain in database, unused but intact
- Controladoria collections remain in database, unused but intact
- No destructive schema downgrade performed
- All users, commercial, financial, and industrial records preserved

## (7) Permission Matrix State

- **80 stable permission keys** (baseline only)
- **0 additions** — `ALLOWED_ADDITION_PREFIXES` is empty
- `isAllowedAddition()` always returns `false`
- All original module permissions intact

## (8) Build Result

**PASS** — Navigation contract validation (`scripts/validate-navigation.mjs`) passes with pure baseline. No unauthorized routes or permission keys detected.

## (9) Deploy Result

Target: `https://logistica-premium-es-2cc14.goskip.app`

The restored baseline is ready for deployment.

## (10) Real Menu List After Restoration

| Group         | Label                   | Route                      |
| ------------- | ----------------------- | -------------------------- |
| Principal     | Dashboard               | `/admin`                   |
| Principal     | Notificações            | `/admin/notificacoes`      |
| Principal     | Atendimento             | `/admin/atendimento`       |
| Comercial     | Vendas                  | `/admin/vendas`            |
| Comercial     | Produtos                | `/admin/produtos`          |
| Comercial     | Cadastros               | `/admin/cadastros`         |
| Comercial     | Tabelas de Preços       | `/admin/tabelas-precos`    |
| Comercial     | CRM                     | `/admin/crm`               |
| Comercial     | Promoções               | `/admin/promocoes`         |
| Financeiro    | Financeiro              | `/admin/financeiro`        |
| Operação      | Logística               | `/admin/logistica`         |
| Operação      | Estoque                 | `/admin/estoque`           |
| Operação      | Indústria               | `/admin/industria`         |
| Fiscal & RH   | Fiscal                  | `/admin/fiscal`            |
| Fiscal & RH   | Conformidade            | `/admin/conformidade`      |
| Fiscal & RH   | Recursos Humanos        | `/admin/rh`                |
| Fiscal & RH   | Departamento Pessoal    | `/admin/dp`                |
| Fiscal & RH   | SST                     | `/admin/sst`               |
| Inteligência  | BI                      | `/admin/bi`                |
| Inteligência  | Inteligência Artificial | `/admin/ia/dashboard`      |
| Inteligência  | Remuneração Variável    | `/admin/remuneracao`       |
| Administração | Configurações           | `/admin/configuracoes`     |
| Administração | Phase0 Foundation       | `/admin/phase0-foundation` |
| Administração | Platform Layer          | `/admin/platform-layer`    |

**Total: 24 menu entries** — matches pre-regression product exactly.

## (11) SUP Test Result

With SUP profile: Login → Área da Empresa → Menu Principal shows all 24 baseline modules. Breadcrumbs, favorites, and Global Search are functional. No missing modules, no invented screens.

## (12) Confirmation That Old Screens Returned

All 24 original modules are present in the menu, routes, and sidebar. No screens were invented or rebuilt by inference. Atendimento, DP, SST, and Promoções are confirmed as real modules backed by migrations (0070/0071, 0062–0066, 0110).

## (13) Final Status

**RECUPERADO (RECOVERED)**

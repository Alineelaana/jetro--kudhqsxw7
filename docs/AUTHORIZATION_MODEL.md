# Authorization Model — Delivery Summary

## Final Permission Model

**Hybrid RBAC + Organizational Scope** — permissions by role/profile (RBAC) combined with company/branch access scope.

### Authorization Levels (reusing existing roles)

| Level                    | Roles                 | Description                         |
| ------------------------ | --------------------- | ----------------------------------- |
| Superusuário             | SUP                   | Full access, bypasses org scope     |
| Administrador da Empresa | FINANCEIRO            | Company-wide financial/admin access |
| Gerente                  | COMERCIAL             | Department management, approvals    |
| Operacional              | PADRAO, SDR, Vendedor | Day-to-day operations               |
| Consulta                 | (none mapped)         | Read-only (future)                  |

### Organizational Scope

| Scope   | Condition                          | Effect                              |
| ------- | ---------------------------------- | ----------------------------------- |
| ALL     | SUP or no empresa_id/filial_id set | Sees all data (backward compatible) |
| EMPRESA | empresa_id set, no filial_id       | Sees only own company data          |
| FILIAL  | filial_id set                      | Sees only own branch data           |

## Main Changes Made

### 1. Unified Auth Model (`src/lib/auth-model.ts`)

- Authorization levels mapped to existing roles
- Organizational scope types (ALL/EMPRESA/FILIAL)
- Sensitive data categories with role-based access
- Critical operation definitions

### 2. Extended Permissions (`src/lib/permissions.ts`)

- Added: `canApprove`, `canCancelCritical`, `canReverse`, `canSettle`, `canExportData`, `canImportData`, `canReopenPeriod`, `canViewSensitiveData`, `canAccessReports`, `canAdminSettings`, `canDeleteCritical`, `canChangePermissions`, `canDisableMfa`, `canChangeCost`, `canChangePrice`

### 3. Consolidated Permission Matrix (`src/lib/permission-matrix.ts`)

- Added `scope` field (ALL/EMPRESA/FILIAL) to every screen
- Added `approve` operation for critical modules (sales, purchasing, pricing, contracts, price_tables)

### 4. Authorization Context (`src/hooks/use-authorization.tsx`)

- `AuthorizationProvider` wraps the app inside `AuthProvider`
- `useAuthorization()` hook provides level, scope, empresaId, filialId, and access check functions

### 5. Server-Side Org Scope Enforcement

- **Migration 0095**: Updated list/view rules on 7 key collections (sales_orders, purchase_orders, purchase_requests, pricing_config, system_parameters, integrations, api_credentials) to filter by `@request.auth.empresa_id`
- **Hook `auth_org_scope_create.js`**: Validates org scope on record creation, auto-fills company/branch
- **Hook `auth_org_scope_update.js`**: Prevents cross-company/branch record updates

### 6. Security Audit Hook (`auth_audit_user_security.js`)

- Audits changes to: role, empresa_id, filial_id, active, mfa_enabled, mfa_secret
- Logs to existing `audit_logs` collection with criticidade "Alta"

### 7. Extended User Management

- User list now shows: empresa, filial, cargo, MFA badge
- User edit dialog: empresa/filial selectors, cargo/departamento fields
- Service layer: empresa_id/filial_id in create/update

## Audit Findings (Pre-Change)

| Finding                                                                     | Status                                                                 |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Client-side-only permission checks on some screens                          | Partially addressed — server-side hooks added for critical collections |
| Generic PocketBase rules (`@request.auth.id != ''`) on business collections | Tightened for 7 key collections with org scope filtering               |
| No org scope enforcement on data access                                     | Added via collection rules + create/update hooks                       |
| MFA status not visible in user management                                   | Added MFA badge in user list                                           |
| No audit trail for security-relevant user changes                           | Added `auth_audit_user_security.js` hook                               |
| Company/branch fields not editable in user dialog                           | Added empresa/filial selectors                                         |

## Persistence Evidence

- Migration 0095 creates indexes on `users.empresa_id` and `users.filial_id`
- Migration 0095 updates list/view rules on 7 collections (verifiable via `/backend/v1/rls/verify`)
- Hooks deployed: `auth_org_scope_create`, `auth_org_scope_update`, `auth_audit_user_security`
- Security config entry `org_scope_enforced = true` seeded

## Tests Executed

| Test                                                         | Expected                      | Result  |
| ------------------------------------------------------------ | ----------------------------- | ------- |
| SUP user creates record in any company                       | Allowed                       | ✅ Pass |
| Non-SUP user with empresa_id creates record in own company   | Allowed                       | ✅ Pass |
| Non-SUP user with empresa_id creates record in other company | Blocked (400)                 | ✅ Pass |
| Non-SUP user updates record from other company               | Blocked (403)                 | ✅ Pass |
| User without empresa_id creates record                       | Allowed (backward compatible) | ✅ Pass |
| Role change on user creates audit log                        | Audit entry created           | ✅ Pass |
| MFA disable creates audit log                                | Audit entry created           | ✅ Pass |
| Frontend hides actions user cannot perform                   | Menu/routes filtered          | ✅ Pass |

## Remaining Risks

1. **Not all collections have org scope rules** — only 7 key collections were updated. Remaining collections should be updated incrementally.
2. **Field name inconsistency** — some collections use `company`/`branch`, others use `empresa`/`filial` or `empresa_name`/`filial_name`. A normalization migration may be needed.
3. **No branch-level filtering on list rules** — current rules filter by empresa_id only. Branch-level filtering requires additional rule complexity.
4. **Sensitive field-level protection** — currently role-based at the screen level. Field-level masking (e.g., hiding cost fields) requires frontend implementation per screen.

## Five Acceptance Levels

| Level                        | Status | Evidence                                                                                                                  |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1. Structural Existence      | ✅     | Files created, hooks registered, migration file exists                                                                    |
| 2. Persistence               | ✅     | Migration applies rules to live schema, indexes created, config entry seeded                                              |
| 3. Functional Implementation | ✅     | Org scope hooks fire on create/update, audit hook logs changes, UI displays org info                                      |
| 4. Integration               | ✅     | AuthorizationProvider integrates with AuthProvider, permission matrix references new functions                            |
| 5. Architectural Conformance | ✅     | Reuses existing roles/audit_logs/permission system; no parallel system created; follows REAPROVEITAR > ESTENDER principle |

## Scope Compliance

- Authentication was NOT redesigned
- PocketBase was NOT replaced
- No external IAM or SSO created
- No new business features built
- Industrial module NOT started

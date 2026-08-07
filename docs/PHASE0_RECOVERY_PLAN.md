# PHASE0_RECOVERY_PLAN.md — Plano de Recuperação da Fase 0 (BLK-MVP-025)

> **Documento de governança — Preparação (não execução)**
> Última atualização: 2026-08-07
> Status: Aguardando aprovação
> Responsável: Architecture Council

---

## 1. Executive Summary

Este documento apresenta o plano completo de recuperação da Fase 0 do Módulo Indústria (BLK-MVP-025). As migrações 0075–0084 são formalmente congeladas como histórico imutável. Quatro novas migrações corretivas (0085–0088) são propostas, utilizando instâncias de classes oficiais do PocketBase JSVM, com comportamento fail-fast e verificações pós-save. **Nenhuma migração é executada e nenhuma alteração de schema vivo é feita até aprovação explícita.**

---

## 2. Migration History Preservation (0075–0084 Frozen)

As migrações 0075–0084 são declaradas **histórico imutável**:

| Migração | Descrição                                                                                | Status    |
| -------- | ---------------------------------------------------------------------------------------- | --------- |
| 0075     | Extend products + create spec_groups, spec_attributes, spec_values, production_resources | 🔒 Frozen |
| 0076     | Extend unidades_medida + create unit_conversions                                         | 🔒 Frozen |
| 0077     | Create bom_versions, bom_components                                                      | 🔒 Frozen |
| 0078     | Create production_routes, production_route_operations                                    | 🔒 Frozen |
| 0079     | Create quality_parameters, quality_inspections, industrial_costs                         | 🔒 Frozen |
| 0080     | Seed Gran Romano pilot data                                                              | 🔒 Frozen |
| 0081     | Stage 1: Specs & Resources (idempotent re-creation)                                      | 🔒 Frozen |
| 0082     | Stage 2: BOM & Routes (idempotent re-creation)                                           | 🔒 Frozen |
| 0083     | Stage 3: Quality & Costs (idempotent re-creation)                                        | 🔒 Frozen |
| 0084     | Stage 4: Gran Romano seed (idempotent re-seed)                                           | 🔒 Frozen |

**Regras:**

- Nenhum arquivo de migração 0075–0084 deve ser editado.
- Nenhum número ordinal 0075–0084 deve ser reutilizado.
- A recuperação ocorre exclusivamente através de novas migrações a partir de 0085.

---

## 3. New Corrective Migration Plan (0085–0088)

| Migração | Título             | Coleções                                                                              | Dependências                                               |
| -------- | ------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 0085     | Fundação           | 5 (spec_groups, spec_attributes, spec_values, production_resources, unit_conversions) | products, unidades_medida                                  |
| 0086     | Produção           | 4 (bom_versions, bom_components, production_routes, production_route_operations)      | 0085 (production_resources)                                |
| 0087     | Qualidade e Custos | 3 (quality_parameters, quality_inspections, industrial_costs)                         | 0085 (spec_values), 0086 (bom_versions, production_routes) |
| 0088     | Seeds              | 0 (apenas dados)                                                                      | 0085, 0086, 0087                                           |

**Próximo número disponível confirmado:** 0085 (conforme histórico de migrações aplicadas).

---

## 4. Definitive Collection Inventory (12 Collections)

A discrepância anterior 10-vs-12 coleções é resolvida. A lista autoritativa contém exatamente **12 coleções**:

### 0085 — Fundação (5 coleções)

| #   | Coleção                | Campos                                                                                                                        | Índices                                                                                     |
| --- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | `spec_groups`          | name, item_category, description, active, responsible, created, updated                                                       | idx_spec_groups_name, idx_spec_groups_active                                                |
| 2   | `spec_attributes`      | group_id, name, label, type, unit, required, options, order, active, created, updated                                         | idx_spec_attrs_group, idx_spec_attrs_active                                                 |
| 3   | `spec_values`          | item_id, attribute_id, value, version, vigencia_inicial, vigencia_final, status, responsible, approval_date, created, updated | idx_spec_values_item, idx_spec_values_attr, idx_spec_values_status, idx_spec_values_version |
| 4   | `production_resources` | code, name, tipo, description, capacity_per_hour, active, responsible_user, modulo_origem, created, updated                   | idx_prod_res_tipo, idx_prod_res_active, idx_prod_res_code (UNIQUE)                          |
| 5   | `unit_conversions`     | from_unit, to_unit, factor, scope, item_id, version, vigencia_inicial, vigencia_final, active, responsible, created, updated  | idx_unit_conv_scope, idx_unit_conv_item, idx_unit_conv_active, idx_unit_conv_units          |

### 0086 — Produção (4 coleções)

| #   | Coleção                       | Campos                                                                                                                                                                                                            | Índices                                                                                            |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 6   | `bom_versions`                | product_id, version, type, status, vigencia_inicial, vigencia_final, rendimento, concentration, ph, density, temperature, mixing_sequence, tolerances, instructions, responsible, approval_date, created, updated | idx_bom_versions_product, idx_bom_versions_status, idx_bom_versions_type, idx_bom_versions_version |
| 7   | `bom_components`              | bom_version_id, item_id, quantidade, unidade, perda_prevista, substituto_permitido, substituto_item_id, ordem, observations, created, updated                                                                     | idx_bom_comp_version, idx_bom_comp_item                                                            |
| 8   | `production_routes`           | product_id, version, name, description, status, vigencia_inicial, vigencia_final, responsible, approval_date, created, updated                                                                                    | idx_prod_routes_product, idx_prod_routes_status, idx_prod_routes_version                           |
| 9   | `production_route_operations` | route_id, order, name, description, resource_id, materials_consumed, tempo_setup, tempo_operacao, perda_prevista, responsible, created, updated                                                                   | idx_route_ops_route, idx_route_ops_order                                                           |

### 0087 — Qualidade e Custos (3 coleções)

| #   | Coleção               | Campos                                                                                                                                                                                                                                                                                   | Índices                                                                                         |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 10  | `quality_parameters`  | name, description, modulo_origem, spec_value_id, min_value, max_value, target_value, unit, active, created, updated                                                                                                                                                                      | idx_quality_params_modulo, idx_quality_params_active                                            |
| 11  | `quality_inspections` | item_id, batch_id, parameter_id, spec_value_id, result_value, status, modulo_origem, responsible, observations, inspection_date, created, updated                                                                                                                                        | idx_quality_insp_item, idx_quality_insp_status, idx_quality_insp_modulo, idx_quality_insp_batch |
| 12  | `industrial_costs`    | item_id, bom_version_id, route_version_id, cost_type, version, cost_materia_prima, cost_embalagem, cost_mao_obra, cost_recurso, cost_energia, cost_perdas, cost_indiretos, cost_cambio, cost_landing, total_cost, unit_cost, deviations, responsible, calculation_date, created, updated | idx_ind_costs_item, idx_ind_costs_type, idx_ind_costs_version                                   |

---

## 5. Static Review

### 5.1 Migration 0085 — Fundação

**Classes PocketBase utilizadas:** `TextField`, `NumberField`, `BoolField`, `SelectField`, `RelationField`, `JSONField`, `AutodateField`

**Extensões de coleções existentes:**

- `products`: `item_type` (SelectField, 7 valores, maxSelect 1), `is_industrial` (BoolField) — ambas com guard `getByName`
- `unidades_medida`: `is_industrial` (BoolField) — com guard `getByName`

**Relações:**

- `spec_attributes.group_id` → `spec_groups` (maxSelect: 1)
- `spec_values.item_id` → `products` (maxSelect: 1, required)
- `spec_values.attribute_id` → `spec_attributes` (maxSelect: 1, required)
- `unit_conversions.item_id` → `products` (maxSelect: 1)

**Access Rules:** Todas as 5 coleções definem `listRule`, `viewRule`, `createRule` = `@request.auth.id != ''`; `updateRule` = `@request.auth.id != ''`; `deleteRule` = `@request.auth.role = 'SUP'`

**Idempotência:** `app.hasTable()` guard antes de cada criação; `getByName` guard para extensões de campos

**Post-save validation:** `app.hasTable()` check após cada `app.save()`; `throw` explícito se persistência falhar; re-fetch de `products` para verificar campos adicionados

**Error handling:** Nenhum `try/catch` envolvendo `app.save()`. Falhas propagam imediatamente.

**Rollback (down):** Deleta as 5 coleções criadas (com guard `hasTable`)

### 5.2 Migration 0086 — Produção

**Classes PocketBase utilizadas:** `TextField`, `NumberField`, `BoolField`, `SelectField`, `RelationField`, `JSONField`, `AutodateField`

**Dependências:** `products`, `production_resources` (de 0085)

**Relações:**

- `bom_versions.product_id` → `products` (maxSelect: 1, required)
- `bom_components.bom_version_id` → `bom_versions` (maxSelect: 1, required)
- `bom_components.item_id` → `products` (maxSelect: 1, required)
- `bom_components.substituto_item_id` → `products` (maxSelect: 1)
- `production_routes.product_id` → `products` (maxSelect: 1, required)
- `production_route_operations.route_id` → `production_routes` (maxSelect: 1, required)
- `production_route_operations.resource_id` → `production_resources` (maxSelect: 1)

**Idempotência:** `app.hasTable()` guard antes de cada criação

**Post-save validation:** `app.hasTable()` check após cada `app.save()`; `throw` explícito

**Error handling:** Nenhum `try/catch` envolvendo `app.save()`

**Rollback (down):** Deleta as 4 coleções em ordem reversa de dependência

### 5.3 Migration 0087 — Qualidade e Custos

**Classes PocketBase utilizadas:** `TextField`, `BoolField`, `SelectField`, `RelationField`, `JSONField`, `AutodateField`

**Dependências:** `products`, `spec_values` (de 0085), `bom_versions`, `production_routes` (de 0086)

**Relações:**

- `quality_parameters.spec_value_id` → `spec_values` (maxSelect: 1)
- `quality_inspections.item_id` → `products` (maxSelect: 1)
- `quality_inspections.parameter_id` → `quality_parameters` (maxSelect: 1)
- `quality_inspections.spec_value_id` → `spec_values` (maxSelect: 1)
- `industrial_costs.item_id` → `products` (maxSelect: 1, required)
- `industrial_costs.bom_version_id` → `bom_versions` (maxSelect: 1)
- `industrial_costs.route_version_id` → `production_routes` (maxSelect: 1)

**Idempotência:** `app.hasTable()` guard antes de cada criação

**Post-save validation:** `app.hasTable()` check após cada `app.save()`; `throw` explícito

**Error handling:** Nenhum `try/catch` envolvendo `app.save()`

**Rollback (down):** Deleta as 3 coleções em ordem reversa de dependência

### 5.4 Migration 0088 — Seeds (Gran Romano)

**Total de registros seed:** ~25 (8 products, 1 BOM version, 7 BOM components, 1 resource, 1 route, 7 route operations, 1 cost)

**Canonical keys para verificação de idempotência:**

| Entidade            | Canonical Key                | Método de Verificação                                                                     |
| ------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| Products            | `code` (ex: IND-MP-0001)     | `findFirstRecordByData('products', 'code', code)`                                         |
| BOM Version         | `product_id` + `version`     | `findFirstRecordByFilter('bom_versions', 'product_id = "..." && version = 1')`            |
| BOM Components      | `bom_version_id` + `item_id` | `findFirstRecordByFilter('bom_components', 'bom_version_id = "..." && item_id = "..."')`  |
| Production Resource | `code` (RES-0001)            | `findFirstRecordByData('production_resources', 'code', 'RES-0001')`                       |
| Production Route    | `product_id` + `name`        | `findFirstRecordByFilter('production_routes', 'product_id = "..." && name = "..."')`      |
| Route Operations    | `route_id` + `order`         | `findFirstRecordByFilter('production_route_operations', 'route_id = "..." && order = N')` |
| Industrial Cost     | `item_id` + `cost_type`      | `findFirstRecordByFilter('industrial_costs', 'item_id = "..." && cost_type = "padrao"')`  |

**Idempotência:** Cada registro seed verifica existência antes de criar. `try/catch` envolve apenas o check de existência (que lança quando não encontrado), NUNCA o `app.save()`.

**Post-save validation:** Products têm verificação pós-save explícita (`findProduct` após `app.save`)

**Error handling:** `app.save()` não envolvido em `try/catch`. Falhas propagam imediatamente.

**Rollback (down):** `findRecordsByFilter` + `app.delete()` para cada tipo de registro seed

---

## 6. Dependency Map

```
0085 (Fundação)
├── products (extended: item_type, is_industrial)
├── unidades_medida (extended: is_industrial)
├── spec_groups
├── spec_attributes ← spec_groups
├── spec_values ← products, spec_attributes
├── production_resources
└── unit_conversions ← products

0086 (Produção) — depends on 0085
├── bom_versions ← products
├── bom_components ← bom_versions, products
├── production_routes ← products
└── production_route_operations ← production_routes, production_resources

0087 (Qualidade e Custos) — depends on 0085, 0086
├── quality_parameters ← spec_values
├── quality_inspections ← products, quality_parameters, spec_values
└── industrial_costs ← products, bom_versions, production_routes

0088 (Seeds) — depends on 0085, 0086, 0087
└── ~25 records across 7 collections
```

**Execution order:** 0085 → 0086 → 0087 → 0088 (strictly sequential)

---

## 7. Security Findings

Os seguintes issues foram identificados nos endpoints temporários (`phase0_*`) e devem ser registrados para o futuro Global Platform Audit:

### Finding SF-001: Approval endpoint lacking role validation

- **Endpoint:** `POST /backend/v1/phase0/approve/{stage}`
- **Issue:** Usa `$apis.requireAuth()` mas não valida `role = 'SUP'`. Qualquer usuário autenticado pode aprovar estágios.
- **Severity:** Alta
- **Evidence:** O hook `phase0_approve.js` usa `$apis.requireAuth()` como middleware, sem checagem adicional de role.
- **Remediation:** Trocar para `$apis.requireSuperuserAuth()` ou adicionar validação explícita de role.

### Finding SF-002: Schema metadata exposure to authenticated users

- **Endpoint:** `GET /backend/v1/phase0/validate/{stage}`
- **Issue:** Expõe metadados completos de schema (nomes de campos, tipos, regras de acesso, índices) para qualquer usuário autenticado.
- **Severity:** Média
- **Evidence:** O hook `phase0_validate.js` retorna `fields`, `rules`, `indexes` de cada coleção sem filtragem por role.
- **Remediation:** Restringir a superusuários ou remover exposição de metadados estruturais.

### Finding SF-003: Absent audit_logs registration

- **Endpoints:** Todos os três endpoints `phase0_*`
- **Issue:** Nenhuma operação de validação, aprovação ou consulta de status registra entrada em `audit_logs`.
- **Severity:** Alta
- **Evidence:** Nenhum dos hooks chama o serviço de auditoria ou cria registros em `audit_logs`.
- **Remediation:** Toda ação de aprovação deve criar registro de auditoria com user_id, action, module, target, timestamp.

### Mandatory Negative Authorization Tests

Estes findings demonstram que **testes de autorização negativa são obrigatórios** para todos os endpoints da plataforma. Todo endpoint deve ter testes que verifiquem:

1. Usuário não autenticado recebe 401
2. Usuário autenticado sem role adequada recebe 403
3. Usuário com role adequada executa com sucesso
4. Tentativa de access cross-tenant é rejeitada

---

## 8. Artifact Removal Preparation

A lista exata de artefatos temporários a serem revertidos após aprovação:

### Hooks (PocketBase)

| Arquivo                               | Ação    |
| ------------------------------------- | ------- |
| `pocketbase/hooks/phase0_approve.js`  | DELETAR |
| `pocketbase/hooks/phase0_status.js`   | DELETAR |
| `pocketbase/hooks/phase0_validate.js` | DELETAR |

### Frontend — Componentes

| Arquivo                                               | Ação    |
| ----------------------------------------------------- | ------- |
| `src/components/phase0/phase0-recovery-dashboard.tsx` | DELETAR |

### Frontend — Páginas

| Arquivo                        | Ação    |
| ------------------------------ | ------- |
| `src/pages/Phase0Recovery.tsx` | DELETAR |

### Frontend — Types e Services

| Arquivo                   | Ação    |
| ------------------------- | ------- |
| `src/lib/phase0-types.ts` | DELETAR |
| `src/services/phase0.ts`  | DELETAR |

### Frontend — Rota

| Arquivo       | Modificação                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `src/App.tsx` | Remover import de `Phase0Recovery` e a rota `<Route path="/admin/phase0" element={<Phase0Recovery />} />` |

**Status:** Nenhuma remoção é executada até aprovação explícita. Esta lista é preparação apenas.

---

## 9. Governance Rule Formalization Analysis

### Análise: Onde formalizar a regra "uma migração aplicada é imutável"

**Contexto:** O achado crítico da Fase 0 demonstrou que migrações marcadas como "applied" tiveram coleções ausentes do schema vivo. Isto levou à criação de migrações corretivas temporárias (0081-0084) que duplicaram a intenção das migrações originais (0075-0079). A regra "uma migração aplicada é imutável" deve ser formalizada para prevenir repetição.

### Candidatos a localização formal

| Documento                | Seção                     | Adequação       | Justificativa                                                                                                                                        |
| ------------------------ | ------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PLATFORM_PRINCIPLES.md` | §4.1 Evolução Sustentável | ✅ Ideal        | A regra de imutabilidade de migrações é um princípio de evolução sustentável — previne acúmulo de dívida técnica através de re-execução de migrações |
| `PLATFORM_PRINCIPLES.md` | Nova §4.11                | ✅ Alternativa  | Uma seção dedicada daria visibilidade máxima, mas fragmentaria os princípios                                                                         |
| `ARCHITECTURE.md`        | §4 API First / Contratos  | ⚠️ Parcial      | Trata versionamento de API, não de migrações de schema                                                                                               |
| `docs/BACKLOG.md`        | §1 Convenções             | ✅ Complementar | Pode referenciar o princípio, mas não deve ser a localização primária                                                                                |

### Recomendação

**Localização primária:** `PLATFORM_PRINCIPLES.md` §4.1 (Evolução Sustentável) — adicionar sub-item:

> **4.1.1 Imutabilidade de Migrações Aplicadas**
>
> - Toda migração marcada como "applied" é histórico imutável e não deve ser editada ou re-executada.
> - Correções são feitas exclusivamente através de novas migrações com numeração sequencial.
> - Números ordinais de migrações aplicadas nunca são reutilizados.
> - A aplicação de uma migração NÃO é evidência de existência estrutural — apenas a verificação no schema vivo é (cross-ref §4.10, Nível 2).

**Localização complementar:** `docs/BACKLOG.md` §1 (Convenções) — referenciar o princípio.

**Status:** Nenhuma alteração documental é feita até aprovação explícita do Architecture Council.

---

## 10. Rollback Strategy

### Rollback por Migração

| Migração | Down-migration                                                                                        | Impacto                                              |
| -------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 0085     | Deleta 5 coleções (unit_conversions, spec_values, spec_attributes, spec_groups, production_resources) | Remove toda a estrutura de especificações e recursos |
| 0086     | Deleta 4 coleções (production_route_operations, production_routes, bom_components, bom_versions)      | Remove toda a estrutura de BOM e roteiros            |
| 0087     | Deleta 3 coleções (industrial_costs, quality_inspections, quality_parameters)                         | Remove qualidade e custos industriais                |
| 0088     | Deleta ~25 registros seed via findRecordsByFilter + delete                                            | Remove dados piloto Gran Romano                      |

### Ordem de Rollback

O rollback deve ser executado em ordem reversa: 0088 → 0087 → 0086 → 0085

### Rollback de Extensões (0085)

O down-migration de 0085 NÃO remove os campos `item_type` e `is_industrial` de `products`, nem `is_industrial` de `unidades_medida`, pois:

1. Estes campos podem ter sido adicionados por migrações anteriores (0075/0081)
2. A remoção de campos de coleções existentes é uma operação destrutiva que requer análise individual

---

## 11. Final Recommendation

### Recomendação: APROVAR execução stage-by-stage com checkpoints

**Justificativa:**

1. As 4 migrações corretivas (0085-0088) utilizam instâncias de classes oficiais do PocketBase JSVM
2. Comportamento fail-fast com post-save validation garante detecção imediata de falhas
3. Idempotência via `app.hasTable()` e `findFirstRecordByData/Filter` previne duplicação
4. A ordem de dependência está corretamente mapeada (0085 → 0086 → 0087 → 0088)
5. O inventory definitivo de 12 coleções resolve a discrepância anterior

### Condições de Execução

1. **Executar uma migração por vez** — após cada migração, apresentar evidência de persistência (Nível 2 do Princípio do Aceite Baseado em Evidências)
2. **Checkpoint validation** — após cada stage, executar validação de schema vivo
3. **Gate de aprovação** — o Architecture Council deve aprovar cada stage antes de prosseguir
4. **Remoção de artefatos temporários** — após confirmação de todas as 4 migrações, executar a remoção listada na Seção 8
5. **Registro de auditoria** — documentar cada stage executado com timestamp, responsável e evidências

### Package de Entrega

Este documento constitui o package completo de entrega pré-execução:

- ✅ Proposed changes diff (Seções 3-5: migrações 0085-0088)
- ✅ Static migration review (Seção 5)
- ✅ Definitive collection inventory (Seção 4)
- ✅ Dependency map (Seção 6)
- ✅ Security analysis (Seção 7)
- ✅ Rollback strategy (Seção 10)
- ✅ Final recommendation (Seção 11)

---

_Nenhuma migração é executada e nenhuma alteração de schema vivo é feita até aprovação explícita do Architecture Council._

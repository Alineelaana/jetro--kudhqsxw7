# Plano de Correções — Domínio 02

> **Domínio:** 02 — Banco de Dados, Collections, Relacionamentos e Migrations
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0

---

## Critério de Inclusão

Apenas não conformidades que genuinamente precisam de correção, baseadas em evidência técnica.

---

## Correções

### COR-01: Auditar e Adicionar Campos Autodate em Todas as Collections Base

| Atributo             | Valor                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **NC Referenciada**  | NC-CRIT-001                                                                                     |
| **Criticidade**      | Crítica                                                                                         |
| **Impacto**          | Queries SDK com `sort: '-created'` ou `filter` em created/updated falham com HTTP 400           |
| **Prioridade**       | P0                                                                                              |
| **Dependências**     | Nenhuma                                                                                         |
| **Esforço Estimado** | Baixo (1 dia)                                                                                   |
| **Evidência**        | FCP BD-02 exige campos autodate; schema vivo não confirma presença em todas as collections base |

**Ação:**

1. Criar migration 0091 que itera sobre todas as collections `base`
2. Para cada collection sem campo `created`: adicionar `{ name: 'created', type: 'autodate', onCreate: true, onUpdate: false }`
3. Para cada collection sem campo `updated`: adicionar `{ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }`
4. Usar `col.fields.getByName('created')` para verificar antes de adicionar

**Critério de Encerramento:** Todas as collections base têm `created` e `updated`. Teste: `sort: '-created'` funciona em todas.

---

### COR-02: Documentar e Resolver Gap de Migration 0037

| Atributo             | Valor                                                   |
| -------------------- | ------------------------------------------------------- |
| **NC Referenciada**  | NC-CRIT-003                                             |
| **Criticidade**      | Alta                                                    |
| **Impacto**          | Inconsistência no histórico de migrações                |
| **Prioridade**       | P1                                                      |
| **Dependências**     | Verificar se collections de 0037 existem no schema vivo |
| **Esforço Estimado** | Baixo (meio dia)                                        |
| **Evidência**        | Lista de applied migrations salta de 0036 para 0038     |

**Ação:**

1. Ler `0037_create_stock_collections.js` para identificar collections definidas
2. Verificar se cada collection existe no schema vivo
3. Se existem: documentar que foram criadas por migrações posteriores; marcar 0037 como "superseded"
4. Se não existem: criar nova migration (0092+) recriando as ausentes
5. Adicionar comentário documentacional no arquivo 0037

**Critério de Encerramento:** Gap documentado e resolvido. Todas as collections de 0037 existem no schema vivo.

---

### COR-03: Adicionar Índices em Campos de Filter/Sort

| Atributo             | Valor                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| **NC Referenciada**  | NC-HIGH-001                                                           |
| **Criticidade**      | Alta                                                                  |
| **Impacto**          | Degradação de performance em queries com filter/sort                  |
| **Prioridade**       | P1                                                                    |
| **Dependências**     | Nenhuma                                                               |
| **Esforço Estimado** | Médio (2-3 dias)                                                      |
| **Evidência**        | Muitas collections não têm índices em campos frequentemente filtrados |

**Ação:**

1. Identificar campos mais filtrados/sortados por análise de uso (status, created, client_name, product_id, request_number, etc.)
2. Criar migration 0093 com `col.addIndex()` para cada campo identificado
3. Priorizar collections com maior volume: products, sales_orders, purchase_orders, budget_requests, audit_logs

**Critério de Encerramento:** Índices criados em campos críticos. Teste: query com filter em status retorna em < 100ms.

---

### COR-04: Auditar e Corrigir Bool Fields com `required: true`

| Atributo             | Valor                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| **NC Referenciada**  | NC-MED-001                                                                |
| **Criticidade**      | Média                                                                     |
| **Impacto**          | Registros com `false` ou sem valor são rejeitados                         |
| **Prioridade**       | P2                                                                        |
| **Dependências**     | Nenhuma                                                                   |
| **Esforço Estimado** | Baixo (meio dia)                                                          |
| **Evidência**        | PocketBase trata `false` como empty value; `required: true` rejeita false |

**Ação:**

1. Auditar todas as migrações em busca de `required: true` em campos `bool`
2. Para cada ocorrência, criar migration que remove `required` do campo
3. Usar `col.fields.getByName('field_name')` e remover a constraint

**Critério de Encerramento:** Nenhum campo bool tem `required: true`. Teste: registro com bool=false é criado com sucesso.

---

## Resumo

| #      | Correção               | Prioridade | Esforço | Status   |
| ------ | ---------------------- | ---------- | ------- | -------- |
| COR-01 | Autodate fields        | P0         | Baixo   | Pendente |
| COR-02 | Migration 0037 gap     | P1         | Baixo   | Pendente |
| COR-03 | Índices de filter/sort | P1         | Médio   | Pendente |
| COR-04 | Bool required          | P2         | Baixo   | Pendente |

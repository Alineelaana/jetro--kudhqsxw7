# Plano de Correções — Domínio 01

> **Domínio:** 01 — Arquitetura e Plataforma Core
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0

---

## Critério de Inclusão

Apenas não conformidades que genuinamente precisam de correção, baseadas em evidência técnica. Nenhuma NC é registrada sem evidência.

---

## Correções

### COR-01: Completar Regras RLS em Todas as Collections

| Atributo             | Valor                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **NC Referenciada**  | NC-CRIT-002                                                                                     |
| **Criticidade**      | Crítica                                                                                         |
| **Impacto**          | Usuários não-superuser bloqueados de acessar dados em collections com regras `null`             |
| **Prioridade**       | P0                                                                                              |
| **Dependências**     | Nenhuma — pode ser executada independentemente                                                  |
| **Esforço Estimado** | Médio (2-3 dias)                                                                                |
| **Evidência**        | Schema vivo: collections com `listRule: null` impedem acesso via SDK para usuários autenticados |

**Ação:** Auditar todas as collections no schema vivo. Para cada collection com regras `null`, definir:

- `listRule`: `"@request.auth.id != ''"`
- `viewRule`: `"@request.auth.id != ''"`
- `createRule`: `"@request.auth.id != ''"`
- `updateRule`: `"@request.auth.id != ''"`
- `deleteRule`: `"@request.auth.id != ''"`

Collections públicas (CMS, vitrine) devem ter `listRule: ""` e `viewRule: ""`.

**Critério de Encerramento:** Todas as collections têm 5 regras definidas. Teste funcional: usuário PADRAO consegue listar registros.

---

### COR-02: Adicionar Campos Autodate em Collections Base

| Atributo             | Valor                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **NC Referenciada**  | NC-CRIT-001                                                                              |
| **Criticidade**      | Crítica                                                                                  |
| **Impacto**          | Queries SDK com `sort: '-created'` ou `filter` em created/updated falham com HTTP 400    |
| **Prioridade**       | P0                                                                                       |
| **Dependências**     | Nenhuma                                                                                  |
| **Esforço Estimado** | Baixo (1 dia)                                                                            |
| **Evidência**        | FCP BD-02 exige campos autodate; algumas collections base não têm verificação confirmada |

**Ação:** Para cada collection `base` sem campos `created`/`updated`:

1. Adicionar campo `created` (autodate, onCreate: true, onUpdate: false)
2. Adicionar campo `updated` (autodate, onCreate: true, onUpdate: true)
3. Criar migration para adicionar os campos

**Critério de Encerramento:** Todas as collections base têm `created` e `updated`. Teste: `sort: '-created'` funciona em todas.

---

### COR-03: Investigar e Corrigir Gap de Migration 0037

| Atributo             | Valor                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **NC Referenciada**  | NC-CRIT-003                                                                                        |
| **Criticidade**      | Alta                                                                                               |
| **Impacto**          | Possível inconsistência de schema — collections definidas em 0037 podem não existir no schema vivo |
| **Prioridade**       | P1                                                                                                 |
| **Dependências**     | Verificar se collections de 0037 existem no schema vivo                                            |
| **Esforço Estimado** | Baixo (meio dia)                                                                                   |
| **Evidência**        | Lista de applied migrations salta de 0036 para 0038; arquivo 0037 existe no repositório            |

**Ação:**

1. Ler `0037_create_stock_collections.js` para identificar o que deveria criar
2. Verificar se as collections existem no schema vivo
3. Se existem: migration aplicou parcialmente — documentar e prosseguir
4. Se não existem: criar nova migration (0091+) recriando as collections

**Critério de Encerramento:** Schema vivo contém todas as collections definidas em 0037, ou nova migration criou as ausentes.

---

### COR-04: Implementar MFA para Admin

| Atributo             | Valor                                                                               |
| -------------------- | ----------------------------------------------------------------------------------- |
| **NC Referenciada**  | NC-MED-001                                                                          |
| **Criticidade**      | Média                                                                               |
| **Impacto**          | Acesso admin sem segunda camada de verificação                                      |
| **Prioridade**       | P1                                                                                  |
| **Dependências**     | Nenhuma                                                                             |
| **Esforço Estimado** | Alto (5-7 dias)                                                                     |
| **Evidência**        | ARCHITECTURE §7.3 define MFA obrigatório para admin; não há implementação no código |

**Ação:**

1. Implementar TOTP (Google Authenticator) no backend
2. Adicionar tela de setup MFA no frontend
3. Adicionar verificação MFA no fluxo de login
4. Tornar obrigatório para role SUP

**Critério de Encerramento:** Usuário SUP deve completar MFA no login. Teste funcional: login sem MFA é bloqueado.

---

### COR-05: Verificar e Implementar Criptografia Campo-a-Campo

| Atributo             | Valor                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **NC Referenciada**  | NC-MED-002                                                                                        |
| **Criticidade**      | Média                                                                                             |
| **Impacto**          | Dados sensíveis (CPF, CNPJ, dados bancários) podem estar em texto plano                           |
| **Prioridade**       | P2                                                                                                |
| **Dependências**     | Nenhuma                                                                                           |
| **Esforço Estimado** | Alto (5-10 dias)                                                                                  |
| **Evidência**        | ADR-010 e ARCHITECTURE §7.2 definem criptografia campo-a-campo; não há evidência de implementação |

**Ação:**

1. Auditar campos sensíveis no schema (CPF, CNPJ, dados bancários, RG)
2. Implementar criptografia via hooks (onRecordCreate/onRecordUpdate encrypt, onRecordList decrypt)
3. Usar `$security.encrypt`/`$security.decrypt` do PocketBase

**Critério de Encerramento:** Campos sensíveis criptografados em repouso. Teste: query direta ao banco mostra dados cifrados.

---

## Resumo

| #      | Correção                   | Prioridade | Esforço | Status   |
| ------ | -------------------------- | ---------- | ------- | -------- |
| COR-01 | RLS completo               | P0         | Médio   | Pendente |
| COR-02 | Autodate fields            | P0         | Baixo   | Pendente |
| COR-03 | Migration 0037 gap         | P1         | Baixo   | Pendente |
| COR-04 | MFA admin                  | P1         | Alto    | Pendente |
| COR-05 | Criptografia campo-a-campo | P2         | Alto    | Pendente |

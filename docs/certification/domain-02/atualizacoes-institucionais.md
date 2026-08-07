# Atualizações Institucionais — Domínio 02

> **Domínio:** 02 — Banco de Dados, Collections, Relacionamentos e Migrations
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0

---

## Critério de Inclusão

Apenas conteúdo genuinamente novo e relevante é adicionado.

---

## RODA — Registro de Decisões Arquiteturais

### Novas Decisões Identificadas

**Nenhuma nova decisão arquitetural foi identificada durante esta certificação que justifique um novo ADR.**

As NCs identificadas (autodate, gap 0037, índices) são não conformidades de implementação, não decisões arquiteturais. Os ADRs existentes cobrem adequadamente o escopo:

| NC                          | ADR Correspondente                    | Status                   |
| --------------------------- | ------------------------------------- | ------------------------ |
| NC-CRIT-001 (Autodate)      | N/A — requisito técnico do PocketBase | Correção técnica         |
| NC-CRIT-003 (Migration gap) | N/A — erro operacional                | Correção técnica         |
| NC-HIGH-001 (Índices)       | ADR-009 (Observabilidade/Performance) | Implementação incompleta |

### Decisões Existentes Validadas

| ADR     | Validação | Observação                                                       |
| ------- | --------- | ---------------------------------------------------------------- |
| ADR-001 | ✅ Válido | Multi-tenancy por campos empresa/filial confirmado no schema     |
| ADR-002 | ✅ Válido | APIs REST expostas via PocketBase                                |
| ADR-005 | ✅ Válido | audit_logs collection confirma logs imutáveis                    |
| ADR-011 | ✅ Válido | Reclassificação de estruturas confirmada no schema vivo          |
| ADR-017 | ✅ Válido | BOM versionada (bom_versions, bom_components) presente no schema |

---

## COP — Catálogo de Oportunidades (Padrões)

### Padrões Identificados como Positivos

#### Padrão: Seeds Idempotentes

**Tipo:** Padrão positivo
**Evidência:** Migrações de seed usam `try/catch` com `findFirstRecordByData` para verificar existência antes de criar.
**Recomendação:** Manter. Previne duplicação em re-aplicação de migrações.

#### Padrão: Separação Schema/Seed

**Tipo:** Padrão positivo
**Evidência:** Migrações de criação de collections (ex: 0001, 0028) são separadas de migrações de seed (ex: 0002, 0005).
**Recomendação:** Manter. Facilita troubleshooting e re-aplicação seletiva.

#### Padrão: CascadeDelete em Relações Críticas

**Tipo:** Padrão positivo
**Evidência:** Relações como `chat_messages.conversation_id` → `chat_conversations` usam `cascadeDelete: true`.
**Recomendação:** Manter. Previne registros órfãos.

#### Padrão: Guard em Adição de Campos

**Tipo:** Padrão positivo
**Evidência:** Migrações que adicionam campos a collections existentes usam `if (!col.fields.getByName('field'))` antes de adicionar.
**Recomendação:** Manter. Torna migrações idempotentes.

---

## COA — Catálogo de Ocorrências de Arquitetura (Antipadrões)

### Antipadrões Identificados

#### Antipadrão: Gap de Migration Sem Detecção

**Tipo:** Antipadrão
**Evidência:** Migration 0037 não foi aplicada mas não houve detecção automática do gap.
**Impacto:** Schema pode estar inconsistente sem que a equipe saiba.
**Recomendação:** EV-04 — rota de verificação de integridade de schema.

#### Antipadrão: Ausência de Índices Sistemáticos

**Tipo:** Antipadrão
**Evidência:** Índices são adicionados ad-hoc em algumas collections mas não há processo sistemático.
**Impacto:** Performance degradada em collections sem índices.
**Recomendação:** COR-03 + EV-05 — adicionar índices e automatizar análise.

#### Antipadrão: Sem Verificação de Persistência

**Tipo:** Antipadrão (histórico)
**Evidência:** ADR-022 foi criado porque migrações "applied" não garantiam existência no schema vivo.
**Status:** Corrigido conceitualmente pelo ADR-022. Implementação da verificação automatizada pendente (EV-04).

---

## Resumo

| Categoria |       Novas Entradas        | Entradas Validadas |
| --------- | :-------------------------: | :----------------: |
| RODA      |              0              |  5 ADRs validados  |
| COP       |     4 padrões positivos     |         —          |
| COA       | 3 antipadrões identificados |         —          |

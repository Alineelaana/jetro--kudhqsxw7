# Atualizações Institucionais — Domínio 01

> **Domínio:** 01 — Arquitetura e Plataforma Core
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0

---

## Critério de Inclusão

Apenas conteúdo genuinamente novo e relevante é adicionado. Entradas artificiais não são criadas.

---

## RODA — Registro de Decisões Arquiteturais

### Novas Decisões Identificadas

**Nenhuma nova decisão arquitetural foi identificada durante esta certificação que justifique um novo ADR.**

As 22 ADRs existentes (ADR-001 a ADR-022) cobrem adequadamente o escopo do Domínio 01. Os achados da certificação (RLS incompleto, gap de migration, autodate ausente) são não conformidades de implementação, não decisões arquiteturais — eles já têm ADRs correspondentes que definem o comportamento esperado:

| NC                          | ADR Correspondente                                              | Status                               |
| --------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| NC-CRIT-002 (RLS)           | ADR-001 (Multi-tenancy), §7.5 (Permissões Granulares)           | ADR existe; implementação incompleta |
| NC-CRIT-001 (Autodate)      | N/A — requisito técnico do PocketBase, não decisão arquitetural | Correção técnica                     |
| NC-CRIT-003 (Migration gap) | N/A — erro operacional, não decisão arquitetural                | Correção técnica                     |

### Decisões Existente Validadas

| ADR     | Validação           | Observação                                                    |
| ------- | ------------------- | ------------------------------------------------------------- |
| ADR-001 | ✅ Válido           | Multi-tenancy por Tenant ID confirmado no schema              |
| ADR-002 | ✅ Válido           | APIs REST expostas via PocketBase + rotas customizadas        |
| ADR-004 | ✅ Válido           | Modularidade confirmada pela estrutura de componentes/páginas |
| ADR-005 | ✅ Válido           | Logs imutáveis confirmados (audit_logs collection + hooks)    |
| ADR-009 | ✅ Válido (parcial) | Observabilidade definida mas não totalmente implementada      |
| ADR-010 | ✅ Válido           | LGPD conformidade definida                                    |
| ADR-020 | ✅ Válido           | Arquitetura de canais digitais documentada                    |
| ADR-022 | ✅ Válido           | Aceite baseado em evidências aplicado nesta certificação      |

---

## COP — Catálogo de Oportunidades (Padrões)

### Padrões Identificados como Positivos

#### Padrão: Separação de Auth Admin/Cliente

**Tipo:** Padrão positivo
**Evidência:** `AuthProvider` (`src/hooks/use-auth.tsx`) e `ClientAuthProvider` (`src/hooks/use-client-auth.tsx`) são providers separados, com collections auth separadas (`users` e `clients`).
**Recomendação:** Manter este padrão. A separação previta vazamento de contexto entre admin e cliente.

#### Padrão: Permissões por Domínio

**Tipo:** Padrão positivo
**Evidência:** Cada domínio tem seu arquivo de permissões (`logistics-permissions.ts`, `financial-permissions.ts`, etc.) com funções tipadas.
**Recomendação:** Manter, mas considerar consolidação de interface (EV-06).

#### Padrão: Sidebar com Busca, Favoritos e Histórico

**Tipo:** Padrão positivo
**Evidência:** `src/components/admin-sidebar.tsx` implementa busca global, fixação de favoritos, histórico de visitas e badges de notificação.
**Recomendação:** Manter. Melhora significativamente a produtividade do usuário.

#### Padrão: Hooks com Lógica Inline

**Tipo:** Padrão positivo
**Evidência:** Hooks PocketBase seguem a regra de lógica inline dentro de callbacks, sem funções top-level.
**Recomendação:** Manter. Previne ReferenceError em runtime.

#### Padrão: Real-time via Hook Centralizado

**Tipo:** Padrão positivo
**Evidência:** `src/hooks/use-realtime.ts` centraliza subscriptions SSE com cleanup automático.
**Recomendação:** Manter. Previne memory leaks e conflitos de subscription.

---

## COA — Catálogo de Ocorrências de Arquitetura (Antipadrões)

### Antipadrões Identificados

#### Antipadrão: Regras RLS `null` (Superuser-only)

**Tipo:** Antipadrão
**Evidência:** Algumas collections têm `listRule: null`, `viewRule: null`, etc., que significa "apenas superuser pode acessar".
**Impacto:** Usuários autenticados da aplicação (PADRAO, Vendedor, etc.) não conseguem acessar dados dessas collections via SDK.
**Recomendação:** COR-01 — definir regras em todas as collections.

#### Antipadrão: Gap de Migration Sem Detecção

**Tipo:** Antipadrão
**Evidência:** Migration 0037 não foi aplicada mas não houve detecção automática do gap.
**Impacto:** Schema pode estar inconsistente sem que a equipe saiba.
**Recomendação:** EV-02 — validação automatizada de schema.

#### Antipadrão: Ausência de Verificação de Persistência

**Tipo:** Antipadrão (histórico)
**Evidência:** ADR-022 foi criado precisamente porque migrações "applied" não garantiam existência no schema vivo (BLK-MVP-025).
**Status:** Corrigido conceitualmente pela criação do ADR-022 e PLATFORM_PRINCIPLES §4.10. Implementação da verificação automatizada pendente (EV-02).

---

## Resumo

| Categoria |          Novas Entradas           | Entradas Validadas |
| --------- | :-------------------------------: | :----------------: |
| RODA      |                 0                 |  8 ADRs validados  |
| COP       | 5 padrões positivos identificados |         —          |
| COA       |    3 antipadrões identificados    |         —          |

Nenhuma entrada artificial foi criada. Todo o conteúdo é baseado em evidência técnica direta do código-fonte e schema vivo.

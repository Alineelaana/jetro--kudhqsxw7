# Relatório Técnico do Domínio 03 — Segurança, Autenticação, Permissões, Auditoria e LGPD

> **Domínio:** 03 — Segurança, Autenticação, Permissões, Auditoria e LGPD
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0
> **Auditor:** Architecture Council

---

## 1. Visão Geral

O Domínio 03 cobre autenticação, autorização (RLS), permissões de aplicação, auditoria, conformidade LGPD e segurança geral da plataforma.

**Tipo:** Fato Comprovado — verificado via `src/hooks/use-auth.tsx`, `src/hooks/use-client-auth.tsx`, `src/lib/permissions.ts`, schema vivo (collections com regras RLS), e hooks de auditoria deployados.

---

## 2. Funcionalidades

### 2.1 Autenticação Admin

- `AuthProvider` em `src/hooks/use-auth.tsx` com `authWithPassword`, refresh automático, gate em `isAuthenticated`.
- Collection `users` (auth) com roles: SUP, PADRAO, SDR, Vendedor, FINANCEIRO, COMERCIAL.
  **Tipo:** Fato Comprovado

### 2.2 Autenticação Cliente

- `ClientAuthProvider` separado, collection `clients` (auth) distinta de `users`.
  **Tipo:** Fato Comprovado

### 2.3 Permissões

- 6 arquivos de permissões por domínio (`permissions.ts`, `logistics-permissions.ts`, `financial-permissions.ts`, `rh-permissions.ts`, `ai-permissions.ts`, `wms-permissions.ts`).
- `permission-matrix.ts` com `MATRIX_SCREENS` e `IDENTIFIED_GAPS`.
  **Tipo:** Fato Comprovado

### 2.4 Auditoria

- Collections: `audit_logs` (30+ campos), `audit_sessions`, `audit_alerts`.
- 14 hooks: `audit_create`, `audit_update`, `audit_delete`, `audit_enrich`, `audit_alerts_detect`, `audit_auto_archive`, `audit_scheduled_report`, `audit_auth`, etc.
  **Tipo:** Fato Comprovado

### 2.5 LGPD

- ADR-010 define conformidade LGPD. Campos sensíveis (CPF, CNPJ, dados bancários) identificados no schema.
- Pages de política: `PoliticaPrivacidade`, `PoliticaComercial`, `TermosDeUso`, `PoliticaCookies`.
  **Tipo:** Inferência — estrutura existe, criptografia campo-a-campo não verificada

---

## 3. Não Conformidades

### NC-CRIT-002: Regras RLS Incompletas

**Severidade:** Crítica | **Evidência:** Collections com regras `null` (superuser-only) no schema vivo | **Impacto:** Usuários autenticados bloqueados de acessar dados

### NC-HIGH-003: Sem MFA para Administradores

**Severidade:** Alta | **Evidência:** ADR-010 §7.3 define MFA obrigatório; não há implementação no código | **Impacto:** Acesso admin sem segunda camada

### NC-HIGH-004: Sem Criptografia Campo-a-Campo

**Severidade:** Alta | **Evidência:** ADR-010 §7.2 define criptografia para dados LGPD; não há hooks de encrypt/decrypt | **Impacto:** Dados sensíveis em texto plano

### NC-HIGH-005: Gaps de Permissão Identificados

**Severidade:** Alta | **Evidência:** `IDENTIFIED_GAPS` em `permission-matrix.ts` com entradas não resolvidas | **Impacto:** Usuários podem acessar telas sem permissão adequada

### NC-MED-003: Sem Timeout de Sessão

**Severidade:** Média | **Evidência:** Não há configuração de expiração de sessão no frontend | **Impacto:** Sessões podem permanecer ativas indefinidamente

---

## 4. Riscos

| #    | Risco                                               | Severidade | Mitigação                              |
| ---- | --------------------------------------------------- | ---------- | -------------------------------------- |
| R-01 | RLS null permite acesso não autorizado              | 20         | Definir regras em todas as collections |
| R-02 | Sem MFA, credenciais comprometidas dão acesso total | 16         | Implementar TOTP                       |
| R-03 | Dados LGPD sem criptografia em repouso              | 16         | Implementar encrypt/decrypt via hooks  |
| R-04 | Gaps de permissão não resolvidos                    | 12         | Fechar gaps identificados              |

---

## 5. Conclusão

O Domínio 03 é a área mais crítica da plataforma. A infraestrutura de auditoria é madura (14 hooks, 30+ campos), mas a segurança de acesso (RLS, MFA, criptografia) está inadequada para produção. As NCs são corrigíveis sem mudanças arquiteturais.

**Tipo:** Fato Comprovado

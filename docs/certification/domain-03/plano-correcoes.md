# Plano de Correções — Domínio 03

> **Domínio:** 03 — Segurança, Autenticação, Permissões, Auditoria e LGPD
> **Framework:** FCP-MODULAR v1.0

---

## Correções

### COR-01: Completar Regras RLS em Todas as Collections

| Atributo         | Valor                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **NC**           | NC-CRIT-002                                                                                                             |
| **Prioridade**   | P0                                                                                                                      |
| **Esforço**      | Médio (2-3 dias)                                                                                                        |
| **Ação**         | Auditar todas as collections; definir 5 regras (list/view/create/update/delete). Collections públicas: list/view = `""` |
| **Encerramento** | Usuário PADRAO consegue listar registros via SDK                                                                        |

### COR-02: Implementar MFA (TOTP) para Role SUP

| Atributo         | Valor                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| **NC**           | NC-HIGH-003                                                                  |
| **Prioridade**   | P0                                                                           |
| **Esforço**      | Alto (5-7 dias)                                                              |
| **Ação**         | Implementar TOTP no backend, tela de setup no frontend, verificação no login |
| **Encerramento** | Login sem MFA bloqueado para role SUP                                        |

### COR-03: Implementar Criptografia Campo-a-Campo

| Atributo         | Valor                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| **NC**           | NC-HIGH-004                                                                                         |
| **Prioridade**   | P1                                                                                                  |
| **Esforço**      | Alto (5-10 dias)                                                                                    |
| **Ação**         | Hooks encrypt on create/update, decrypt on list/view usando `$security.encrypt`/`$security.decrypt` |
| **Encerramento** | Query direta ao banco mostra dados cifrados                                                         |

### COR-04: Fechar Gaps de Permissão

| Atributo         | Valor                                        |
| ---------------- | -------------------------------------------- |
| **NC**           | NC-HIGH-005                                  |
| **Prioridade**   | P1                                           |
| **Esforço**      | Médio (3-5 dias)                             |
| **Ação**         | Resolver todos os itens em `IDENTIFIED_GAPS` |
| **Encerramento** | Matriz de permissões sem gaps                |

### COR-05: Implementar Timeout de Sessão

| Atributo         | Valor                                               |
| ---------------- | --------------------------------------------------- |
| **NC**           | NC-MED-003                                          |
| **Prioridade**   | P2                                                  |
| **Esforço**      | Baixo (1-2 dias)                                    |
| **Ação**         | Configurar expiração de sessão (ex: 30 min inativo) |
| **Encerramento** | Sessão expira após inatividade                      |

## Resumo

| #      | Correção                   | Prioridade | Esforço | Status   |
| ------ | -------------------------- | ---------- | ------- | -------- |
| COR-01 | RLS completo               | P0         | Médio   | Pendente |
| COR-02 | MFA admin                  | P0         | Alto    | Pendente |
| COR-03 | Criptografia campo-a-campo | P1         | Alto    | Pendente |
| COR-04 | Fechar gaps de permissão   | P1         | Médio   | Pendente |
| COR-05 | Timeout de sessão          | P2         | Baixo   | Pendente |

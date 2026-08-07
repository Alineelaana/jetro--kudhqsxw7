# Plano de Correções — Domínio 04

> **Domínio:** 04 — Backend, APIs, Hooks, Serviços Compartilhados e Integrações
> **Framework:** FCP-MODULAR v1.0

---

## Correções

### COR-01: Padronizar Logger em Hooks

| NC | NC-MED-004 |
| Prioridade | P1 |
| Esforço | Baixo (2 dias) |
| Ação | Auditar hooks sem `$app.logger()` e adicionar logging estruturado |
| Encerramento | Todos os hooks usam `$app.logger()` para erros |

### COR-02: Implementar Rate Limiting

| NC | NC-MED-005 |
| Prioridade | P1 |
| Esforço | Médio (1 semana) |
| Ação | Adicionar middleware de rate limiting em rotas customizadas |
| Encerramento | Rotas com limite de requisições por IP/usuário |

### COR-03: Implementar Integração SEFAZ

| NC | NC-HIGH-006 |
| Prioridade | P2 |
| Esforço | Alto (3-4 semanas) |
| Ação | Criar hooks para comunicação com SEFAZ (NF-e, NFC-e, NFS-e) |
| Encerramento | NF-e autorizada na SEFAZ |

### COR-04: Implementar Integração Bancária

| NC | NC-HIGH-007 |
| Prioridade | P2 |
| Esforço | Alto (3-4 semanas) |
| Ação | Criar hooks para API bancária (boleto, PIX, conciliação) |
| Encerramento | Boleto gerado e conciliação automática |

### COR-05: Definir Skip Cloud Agent

| NC | NC-HIGH-010 |
| Prioridade | P1 |
| Esforço | Médio (1 semana) |
| Ação | Migration definindo agente de suporte com RAG |
| Encerramento | Agente definido e respondendo via hook |

## Resumo

| #      | Correção            | Prioridade | Esforço | Status   |
| ------ | ------------------- | ---------- | ------- | -------- |
| COR-01 | Logger padronizado  | P1         | Baixo   | Pendente |
| COR-02 | Rate limiting       | P1         | Médio   | Pendente |
| COR-03 | SEFAZ               | P2         | Alto    | Pendente |
| COR-04 | Integração bancária | P2         | Alto    | Pendente |
| COR-05 | Skip Cloud Agent    | P1         | Médio   | Pendente |

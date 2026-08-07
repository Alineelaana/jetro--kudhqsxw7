# Plano de Correções — Domínio 15

> **Framework:** FCP-MODULAR v1.0

---

## Correções

### COR-01: Definir Skip Cloud Agent

| NC | NC-HIGH-010 |
| Prioridade | P1 |
| Esforço | Médio (1 semana) |
| Ação | Migration definindo agente de suporte com RAG via `$ai.agents.define` |
| Encerramento | Agente respondendo via hook |

### COR-02: Integrar APM

| NC | NC-HIGH-013 |
| Prioridade | P1 |
| Esforço | Médio (2-3 semanas) |
| Ação | Integrar ferramenta de APM para monitorar latência, erros, throughput |
| Encerramento | Dashboard de performance operacional |

### COR-03: Implementar Rate Limiting

| NC | NC-HIGH-014 |
| Prioridade | P1 |
| Esforço | Médio (1-2 semanas) |
| Ação | Middleware de rate limiting em rotas customizadas |
| Encerramento | Limite de requisições por IP/usuário configurável |

### COR-04: Implementar Caching

| NC | NC-HIGH-015 |
| Prioridade | P1 |
| Esforço | Alto (3-4 semanas) |
| Ação | Introduzir Redis ou equivalente para caching de dados quentes |
| Encerramento | Catálogos e configs servidos via cache |

### COR-05: Implementar RAG

| NC | NC-MED-018 |
| Prioridade | P2 |
| Esforço | Médio (2-3 semanas) |
| Ação | Criar collection com campo `vector`, hooks `$ai.embed`, rota `$vectors.search` |
| Encerramento | Busca semântica funcional |

### COR-06: Monitorar Custo de IA

| NC | NC-MED-019 |
| Prioridade | P2 |
| Esforço | Baixo (1 semana) |
| Ação | Hook que rastreia consumo de `$ai.chat` e `$ai.embed` |
| Encerramento | Dashboard de custo de IA |

## Resumo

| #      | Correção         | Prioridade | Esforço | Status   |
| ------ | ---------------- | ---------- | ------- | -------- |
| COR-01 | Skip Cloud Agent | P1         | Médio   | Pendente |
| COR-02 | APM              | P1         | Médio   | Pendente |
| COR-03 | Rate limiting    | P1         | Médio   | Pendente |
| COR-04 | Caching          | P1         | Alto    | Pendente |
| COR-05 | RAG              | P2         | Médio   | Pendente |
| COR-06 | Custo de IA      | P2         | Baixo   | Pendente |

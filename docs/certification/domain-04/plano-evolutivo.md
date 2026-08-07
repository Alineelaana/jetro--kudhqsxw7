# Plano Evolutivo — Domínio 04

> **Domínio:** 04 — Backend, APIs, Hooks, Serviços Compartilhados e Integrações
> **Framework:** FCP-MODULAR v1.0

---

## Quick Wins

### EV-01: Documentação OpenAPI

| Benefício | Documentação automática de APIs |
| Esforço | Médio (1 semana) |
| Ação | Gerar spec OpenAPI a partir do schema PocketBase e rotas customizadas |

### EV-02: Hook de Health Check

| Benefício | Monitoramento de saúde do backend |
| Esforço | Baixo (1 dia) |
| Ação | Rota `/backend/v1/health` retornando status de collections e hooks |

## Curto Prazo

### EV-03: Webhook Management

| Benefício | Notificar sistemas externos de eventos |
| Esforço | Médio (2 semanas) |
| Ação | Collection `webhooks` + hook que dispara HTTP em eventos configurados |

### EV-04: Agentes IA por Domínio

| Benefício | Assistência especializada por área |
| Esforço | Alto (4-6 semanas) |
| Ação | Definir agentes para Vendas, Estoque, Financeiro, etc. |

## Médio Prazo

### EV-05: Fila de Processamento Assíncrono

| Benefício | Operações longas sem bloquear resposta |
| Esforço | Alto (3-4 semanas) |
| Ação | Collection `job_queue` + hook cron que processa jobs pendentes |

### EV-06: API Versioning Explicit

| Benefício | Evolução de API sem quebrar clientes |
| Esforço | Médio (2 semanas) |
| Ação | Versionar rotas `/backend/v2/` quando breaking changes necessárias |

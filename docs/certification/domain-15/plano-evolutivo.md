# Plano Evolutivo — Domínio 15

> **Framework:** FCP-MODULAR v1.0

---

## Quick Wins

### EV-01: Feature Flags Globais

| Benefício | Controle granular de funcionalidades |
| Esforço | Médio (1-2 semanas) |
| Ação | Collection `feature_flags` + hook frontend |

### EV-02: Health Check Endpoint

| Benefício | Monitoramento de saúde |
| Esforço | Baixo (1 dia) |
| Ação | Rota `/backend/v1/health` com status de collections e hooks |

## Curto Prazo

### EV-03: Dashboard de Saúde da Plataforma

| Benefício | Visibilidade proativa |
| Esforço | Médio (2 semanas) |
| Ação | Dashboard com uptime, latência, erros, collections sem RLS |

### EV-04: Agentes IA por Domínio

| Benefício | Assistência especializada |
| Esforço | Alto (4-6 semanas) |
| Ação | Definir agentes para Vendas, Estoque, Financeiro via migration |

## Médio Prazo

### EV-05: Caching com Invalidation

| Benefício | Performance e consistência |
| Esforço | Alto (3-4 semanas) |
| Ação | Cache com invalidação automática em mudanças de dados |

### EV-06: Builder Visual de Automação

| Benefício | Automação sem código |
| Esforço | Muito alto (2+ meses) |
| Ação | Interface visual para criar gatilho→condição→ação

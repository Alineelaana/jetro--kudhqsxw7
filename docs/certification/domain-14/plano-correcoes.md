# Plano de Correções — Domínio 14

> **Framework:** FCP-MODULAR v1.0

---

## Correções

### COR-01: Criar Serviço Centralizado de KPI

| NC | NC-HIGH-008 |
| Prioridade | P1 |
| Esforço | Médio (2-3 semanas) |
| Ação | Criar collection `kpi_snapshots` que persiste KPIs calculados periodicamente |
| Encerramento | KPIs reproduzíveis e versionados |

### COR-02: Implementar ETL Básico

| NC | NC-HIGH-009 |
| Prioridade | P1 |
| Esforço | Alto (3-4 semanas) |
| Ação | Hook cron que consolida dados de múltiplos domínios em collection analítica |
| Encerramento | Cross-domain analytics funcional |

### COR-03: Unificar Bibliotecas de Exportação

| NC | NC-MED-017 |
| Prioridade | P2 |
| Esforço | Médio (2 semanas) |
| Ação | Consolidar 12+ bibliotecas em framework único e configurável |
| Encerramento | Uma única biblioteca de exportação |

### COR-04: Atualização em Tempo Real nos Dashboards

| NC | NC-MED-016 |
| Prioridade | P2 |
| Esforço | Baixo (1 semana) |
| Ação | Integrar `useRealtime` nos dashboards principais |
| Encerramento | Dashboards atualizam automaticamente |

## Resumo

| #      | Correção            | Prioridade | Esforço | Status   |
| ------ | ------------------- | ---------- | ------- | -------- |
| COR-01 | KPI centralizado    | P1         | Médio   | Pendente |
| COR-02 | ETL básico          | P1         | Alto    | Pendente |
| COR-03 | Unificar exportação | P2         | Médio   | Pendente |
| COR-04 | Tempo real          | P2         | Baixo   | Pendente |

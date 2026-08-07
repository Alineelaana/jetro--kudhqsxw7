# Relatório Técnico do Domínio 14 — BI, Relatórios, Dashboards, Indicadores e Analytics

> **Domínio:** 14 — BI, Relatórios, Dashboards, Indicadores e Analytics
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra dashboards, KPIs, exportações, analytics e data warehouse.

**Tipo:** Fato Comprovado — verificado via `src/components/dashboards/`, `src/lib/chart-export*.ts`, `src/lib/csv-export.ts`, `src/lib/report-pdf.ts`, `src/lib/report-xls.ts`.

---

## 2. Funcionalidades

### 2.1 Dashboards por Módulo

Cada módulo tem dashboard próprio: `FinancialDashboard`, `SalesDashboard`, `StockDashboard`, `LogisticsDashboard`, `CrmDashboard`, `RhDashboard`, `WmsManagerialDashboard`, `BudgetProductivityDashboard`, `ChatProductivityDashboard`.
**Tipo:** Fato Comprovado

### 2.2 Componentes de Dashboard

`StatCard`, `ChartCard`, `DashboardsPanel` em `src/components/dashboards/`.
**Tipo:** Fato Comprovado

### 2.3 Exportação

12+ bibliotecas de exportação: `csv-export.ts`, `chart-export.ts`, `chart-export-core.ts`, `charts-export.ts`, `report-pdf.ts`, `report-xls.ts`, `audit-export.ts`, `product-export.ts`, `services-export.ts`, `pricing-simulations-export.ts`, `purchasing-reports-export.ts`, `rh-dp-pdf-export.ts`, `wms-reports-export.ts`.
**Tipo:** Fato Comprovado

### 2.4 Gráficos

Recharts integrado via `ChartContainer` do shadcn/ui.
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-HIGH-008: Sem Collections Dedicadas de BI

**Severidade:** Alta | **Evidência:** Não há collections de data warehouse ou KPI persistido | **Impacto:** KPIs calculados ad-hoc, não reproduzíveis

### NC-HIGH-009: Sem Pipeline ETL

**Severidade:** Alta | **Evidência:** Dashboards computam dados inline sem ETL | **Impacto:** Cross-domain analytics impossível

### NC-MED-016: Sem Atualização em Tempo Real

**Severidade:** Média | **Evidência:** Dashboards não usam `useRealtime` para atualização automática | **Impacto:** Dados desatualizados até refresh manual

### NC-MED-017: 12+ Bibliotecas de Exportação Duplicadas

**Severidade:** Média | **Evidência:** Lógica de exportação duplicada em 12+ arquivos | **Impacto:** Manutenção complexa, inconsistência

---

## 4. Conclusão

O domínio de BI é o mais imaturo da plataforma. Dashboards existem por módulo mas sem padronização, sem data warehouse, sem ETL e com exportação fragmentada.

**Tipo:** Fato Comprovado

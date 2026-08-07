# Relatório Técnico do Domínio 12 — Indústria, Produção, Custos, Engenharia de Produto e Verbas

> **Domínio:** 12 — Indústria, Produção, Custos, Engenharia de Produto e Verbas
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra catálogo de itens, especificações, BOM versionada, roteiros, recursos produtivos, custos industriais, qualidade, rastreabilidade.

**Tipo:** Fato Comprovado — verificado via migrações 0075-0088, schema (collections industriais), `src/components/industry/`, e `src/services/industry.ts`.

---

## 2. Funcionalidades

### 2.1 Fase 0 — Engenharia & Produtos

`products` estendido com `item_type`, `is_industrial`. Collections: `spec_groups`, `spec_attributes`, `spec_values`, `unit_conversions`, `bom_versions`, `bom_components`, `production_resources`, `production_routes`, `production_route_operations`, `industrial_costs`.
**Tipo:** Fato Comprovado

### 2.2 BOM Versionada e Imutável

`bom_versions` com status (rascunho/ativo/inativo), vigência. `bom_components` referencia items canônicos.
**Tipo:** Fato Comprovado

### 2.3 Roteiros Versionados

`production_routes` e `production_route_operations` versionados desde o MVP.
**Tipo:** Fato Comprovado

### 2.4 Qualidade

`quality_inspections`, `quality_parameters` como Shared Platform Services com `modulo_origem`.
**Tipo:** Fato Comprovado

### 2.5 Custos Industriais

`industrial_costs` diferenciando Custo Padrão (snapshot imutável) de Custo Realizado com análise de variâncias.
**Tipo:** Fato Comprovado

### 2.6 Seeds Piloto

Migrações 0080, 0084, 0088 criaram seeds para piloto Gran Romano (azeitona, salmoura, BOM completa, roteiro real).
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-HIGH-007: Collection production_orders Ausente

**Severidade:** Alta | **Evidência:** `production_orders` não está no schema vivo; BLK-MVP-022 define criação | **Impacto:** Execução de produção não implementada

### NC-MED-012: Sem Hook MRP

**Severidade:** Média | **Evidência:** ADR-014 define MRP como rota/hook; não há hook implementado | **Impacto:** Cálculo de necessidade de compra não automatizado

### NC-MED-013: Sem Apontamento de Produção

**Severidade:** Média | **Evidência:** Sem collection/hook para apontamento real de consumo de MP por lote | **Impacto:** Consumo real não rastreado

---

## 4. Conclusão

A Fase 0 (Engenharia & Produtos) é exemplar — BOM versionada, roteiros versionados, custos com variâncias, qualidade como decisor. O gap é a camada de execução (production_orders, MRP, apontamento).

**Tipo:** Fato Comprovado

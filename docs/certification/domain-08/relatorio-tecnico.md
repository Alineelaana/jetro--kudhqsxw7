# Relatório Técnico do Domínio 08 — Compras

> **Domínio:** 08 — Compras
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra requisições, cotações, pedidos de compra, recebimento, divergências, devoluções.

**Tipo:** Fato Comprovado — verificado via schema (`purchase_requests`, `quotations`, `purchase_orders`, `purchase_invoices`, `purchase_returns`) e componentes em `src/components/purchasing/`.

---

## 2. Funcionalidades

### 2.1 Fluxo de Compras

Requisição → Cotação → Pedido → Recebimento (NF) → Devolução. Cada etapa tem collection e componente dedicados.
**Tipo:** Fato Comprovado

### 2.2 Hooks

`purchase_numbers_next` (numeração automática), `stock_on_purchase_invoice` (atualiza estoque), `wms_auto_receipt_from_invoice` (recebimento WMS automático).
**Tipo:** Fato Comprovado

### 2.3 Components

`PurchasingPanel`, `PurchaseRequestsPanel`, `QuotationsPanel`, `PurchaseOrdersPanel`, `PurchaseInvoicesPanel`, `PurchaseReturnsPanel`, `PurchasingDashboard`, `PurchasingReports`.
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-MED-009: Sem Fluxo de Aprovação de Pedido de Compra

**Severidade:** Média | **Evidência:** `purchase_orders` tem campo `status` mas não há hook de aprovação hierárquica | **Impacto:** Pedidos sem controle de alçada

### NC-LOW-004: Sem Comparação Automática de Cotações

**Severidade:** Baixa | **Evidência:** `quotations` tem campo `supplier_quotes` (json) mas não há cálculo automático de melhor fornecedor | **Impacto:** Comparação manual

---

## 4. Conclusão

Módulo de compras completo com fluxo end-to-end e hooks de integração com estoque/WMS.

**Tipo:** Fato Comprovado

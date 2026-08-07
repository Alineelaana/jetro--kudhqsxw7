# Relatório Técnico do Domínio 07 — Comercial

> **Domínio:** 07 — Comercial
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra pedidos de venda, faturamento, NF-e/NFC-e, contratos, devoluções.

**Tipo:** Fato Comprovado — verificado via schema vivo (`sales_orders`, `sales_invoices`, `nfe_records`, `nfce_records`, `sales_returns`, `contracts_operations`) e componentes em `src/components/sales/`.

---

## 2. Funcionalidades

### 2.1 Pedidos de Venda

Collection `sales_orders` com 25+ campos. Componentes: `SalesOrdersPanel`, `SalesOrderDialog`.
**Tipo:** Fato Comprovado

### 2.2 Faturamento

Collections: `sales_invoices`, `nfe_records`, `nfce_records`. Hooks: `sales_numbers_next`, `on_invoice_create_receivable`.
**Tipo:** Fato Comprovado

### 2.3 Contratos

Collection `contracts_operations` com campos `services` (json), `total_value`, `status` (select: Rascunho|Ativo|Concluído|Cancelado).
**Tipo:** Fato Comprovado

### 2.4 Devoluções

Collection `sales_returns` com 15+ campos. Componente: `SalesReturnsPanel`.
**Tipo:** Fato Comprovado

### 2.5 Hooks de Integração

`on_invoice_create_receivable` gera contas a receber automaticamente. `on_receivable_paid_cascade` processa baixa.
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-HIGH-008: NF-e é Mock (Sem SEFAZ)

**Severidade:** Alta | **Evidência:** `nfe_records` tem campos `xml_url`, `danfe_url`, `authorization_protocol` mas nenhum hook comunica com SEFAZ | **Impacto:** Notas não autorizadas oficialmente

### NC-MED-008: Sem Geração Automática de DANFE

**Severidade:** Média | **Evidência:** Não há hook que gera DANFE PDF | **Impacto:** Documento fiscal sem representação impressa

---

## 4. Conclusão

Módulo comercial bem estruturado com hooks de integração financeira. Principal lacuna é integração SEFAZ.

**Tipo:** Fato Comprovado

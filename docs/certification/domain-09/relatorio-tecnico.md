# Relatório Técnico do Domínio 09 — Financeiro

> **Domínio:** 09 — Financeiro
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra recebíveis, pagáveis, fluxo de caixa, conciliação, tesouraria, caixa, boletos/PIX.

**Tipo:** Fato Comprovado — verificado via schema (collections financeiras), `src/components/financial/`, e hooks (`on_invoice_create_receivable`, `on_payable_paid_cascade`, `on_receivable_paid_cascade`, `contabil_auto_generate`).

---

## 2. Funcionalidades

### 2.1 Collections Financeiras

`contas_bancarias`, `formas_pagamento`, `condicoes_pagamento`, `plano_contas`, `centros_custo`, mais collections de recebíveis/pagáveis criadas nas migrações 0055-0056.
**Tipo:** Fato Comprovado

### 2.2 Hooks de Integração

- `on_invoice_create_receivable`: gera conta a receber ao faturar.
- `on_payable_paid_cascade`: processa baixa de pagável.
- `on_receivable_paid_cascade`: processa baixa de recebível.
- `contabil_auto_generate`: gera lançamentos contábeis.
  **Tipo:** Fato Comprovado

### 2.3 Componentes

`FinancialLayout`, `FinancialDashboard`, `FinancialReceivables`, `FinancialPayables`, `FinancialCashFlow`, `FinancialReconciliation`, `FinancialTreasury`, `FinancialCashRegister`, `FinancialReports`, mais telas para cheques, cartões, boletos, PIX, cobranças.
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-HIGH-009: Sem Integração Bancária

**Severidade:** Alta | **Evidência:** Sem hooks para API bancária (conciliação automática, geração de boleto, PIX) | **Impacto:** Conciliação e cobrança manuais

### NC-MED-010: Sem Fechamento Contábil Automatizado

**Severidade:** Média | **Evidência:** `contabil_pre_close` existe mas não há fechamento mensal automatizado | **Impacto:** Fechamento manual suscetível a erros

---

## 4. Conclusão

Módulo financeiro abrangente com hooks de integração contábil e comercial. Principal lacuna é integração bancária.

**Tipo:** Fato Comprovado

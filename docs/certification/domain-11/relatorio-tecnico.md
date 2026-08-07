# Relatório Técnico do Domínio 11 — Estoque, WMS e Logística

> **Domínio:** 11 — Estoque, WMS e Logística
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra movimentações de estoque, lotes/validade, WMS (recebimento, separação, expedição), rotas, entregas, rastreamento, frota, motoristas, romaneios, fretes.

**Tipo:** Fato Comprovado — verificado via schema (`products`, `stock_alerts`, `stock_expeditions`, collections WMS/logistics), componentes em `src/components/stock/` e `src/components/logistics/`, e hooks (`stock_on_purchase_invoice`, `stock_on_sales_update`, `stock_fifo_fefo_suggest`, `wms_receipt_putaway`, `wms_replenishment_auto`, `logistics_gps_update`).

---

## 2. Funcionalidades

### 2.1 Estoque

`products` com 40+ campos incluindo stock, min_stock, max_stock, lot, validity, location. Hooks: `stock_on_purchase_invoice`, `stock_on_sales_update`, `stock_audit`, `stock_expiry_block`, `stock_fifo_fefo_suggest`.
**Tipo:** Fato Comprovado

### 2.2 WMS

Collections WMS criadas nas migrações 0048-0050. Componentes: WmsReceiving, WmsPutaway, WmsWaves, WmsReplenishment, WmsAlertsCenter, WmsReports, WmsPallets, WmsVolumes, WmsCollectors, WmsOperators, WmsManagerialDashboard. Hooks: `wms_receipt_putaway`, `wms_replenishment_auto`, `wms_wave_release`, `wms_alerts_detect`.
**Tipo:** Fato Comprovado

### 2.3 Logística

Collections de logística criadas nas migrações 0051-0054. Componentes: LogisticsDashboard, LogisticsRoutes, LogisticsDeliveries, LogisticsVehicles, LogisticsDrivers, LogisticsFreights, LogisticsTracking, LogisticsProofDelivery, LogisticsCosts, LogisticsReports. Hooks: `logistics_route_calc`, `logistics_gps_update`, `logistics_gps_simulate`, `on_delivery_notify`.
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-LOW-005: Sem GPS Real

**Severidade:** Baixa | **Evidência:** Hook `logistics_gps_simulate` indica simulação, não rastreamento real | **Impacto:** Rastreamento não é em tempo real

### NC-LOW-006: Sem Barcode/RFID no WMS

**Severidade:** Baixa | **Evidência:** Componente `stock-barcode-input` existe mas sem integração com coletores físicos | **Impacto:** Operação WMS manual

---

## 4. Conclusão

Módulo de estoque, WMS e logística é um dos mais completos da plataforma. Hooks de automação (FIFO/FEFO, replenishment, wave release) demonstram maturidade operacional.

**Tipo:** Fato Comprovado

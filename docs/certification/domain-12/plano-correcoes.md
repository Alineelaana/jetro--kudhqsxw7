# Plano de Correções — Domínio 12

> **Framework:** FCP-MODULAR v1.0

---

## Correções

### COR-01: Criar Collection production_orders

| NC | NC-HIGH-007 |
| Prioridade | P0 |
| Esforço | Médio (1-2 semanas) |
| Ação | Criar collection com `bom_id`, `bom_version`, status, quantidade, recursos alocados |
| Encerramento | Ordem de produção criada com BOM versionada específica |

### COR-02: Implementar Hook MRP

| NC | NC-MED-012 |
| Prioridade | P1 |
| Esforço | Médio (2 semanas) |
| Ação | Hook/rota que calcula necessidade líquida cruzando BOM × demanda × estoque × POs × importações |
| Encerramento | MRP calcula necessidade de compra sem persistência |

### COR-03: Implementar Apontamento de Produção

| NC | NC-MED-013 |
| Prioridade | P1 |
| Esforço | Médio (2-3 semanas) |
| Ação | Collection/hook para registro de consumo real de MP por lote e geração de lote acabado |
| Encerramento | Consumo real registrado por lote com rastreabilidade |

## Resumo

| #      | Correção          | Prioridade | Esforço | Status   |
| ------ | ----------------- | ---------- | ------- | -------- |
| COR-01 | production_orders | P0         | Médio   | Pendente |
| COR-02 | Hook MRP          | P1         | Médio   | Pendente |
| COR-03 | Apontamento       | P1         | Médio   | Pendente |

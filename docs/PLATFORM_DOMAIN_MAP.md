# PLATFORM_DOMAIN_MAP.md — Mapa de Domínios da Plataforma

> **Documento vivo — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Oficial
> Responsável: Architecture Council

---

## 1. Estrutura de Domínios

### 1.1 Módulo Indústria — Subdomínios

O Módulo Indústria é organizado nos seguintes subdomínios, cada um com escopo e fronteiras claros:

| Subdomínio                        | Escopo                                                                                                                                                                                       | Coleções Principais                                                                                                                                                                                                           | Fase                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Engenharia & Produtos**         | Catálogo de Itens, Especificações Técnicas, Estruturas/BOM, Formulações, Processos Produtivos, Recursos Produtivos, Conversões de Unidade, Tempos Padrão, Perdas Padrão, Controle de Versões | `products` (estendido), `spec_groups`, `spec_attributes`, `spec_values`, `unit_conversions`, `bom_versions`, `bom_components`, `production_resources`, `production_routes`, `production_route_operations`, `industrial_costs` | Fase 0 (BLK-MVP-025)              |
| **Suprimentos**                   | Compras Internacionais, Importação, Landing Cost                                                                                                                                             | `purchase_orders` (estendido), `import_processes`, `import_costs`, `currencies`, `exchange_rates`                                                                                                                             | Fase A (BLK-MVP-018, BLK-MVP-019) |
| **Recebimento & Qualidade**       | Recebimento de Matéria-prima, Quarentena, Inspeção de Qualidade                                                                                                                              | `wms_receipts`/`stock_checkings` (estendidos), `quality_inspections`, `quality_parameters`, `stock_batches`                                                                                                                   | Fase B (BLK-MVP-020)              |
| **Planejamento & Controle (PCP)** | MRP Básico, Planejamento de Produção, Ordens de Produção                                                                                                                                     | `production_orders` (futuro), rota/hook calculado para MRP                                                                                                                                                                    | Fase C (BLK-MVP-021, BLK-MVP-022) |
| **Produção**                      | Apontamentos, Consumo Real, Geração de Lote Acabado                                                                                                                                          | `production_orders` (futuro), `stock_batches`                                                                                                                                                                                 | Fase C (BLK-MVP-022)              |
| **Custos Industriais**            | Custo Padrão × Realizado, Variâncias                                                                                                                                                         | `industrial_costs`                                                                                                                                                                                                            | Fase 0 + Fase D (BLK-MVP-024)     |
| **Rastreabilidade**               | Genealogia Completa, Rastreabilidade Histórica                                                                                                                                               | Relações operacionais reais (não tabela pré-computada)                                                                                                                                                                        | Fase D (BLK-MVP-023)              |
| **Indicadores**                   | OTIF Produção, Eficiência, Qualidade, Ciclo, Lead Time                                                                                                                                       | Dashboards baseados em consultas                                                                                                                                                                                              | Fase D (BLK-MVP-024)              |

### 1.2 Princípio: Sem Duplicação de Estruturas Centrais

Estruturas que já existem centralmente na Plataforma NÃO são duplicadas no Módulo Indústria:

- **Catálogo de Itens** → reutiliza `products` (estendido, não duplicado)
- **Unidades de Medida** → reutiliza `unidades_medida` (estendido, não duplicado)
- **Estoque/Lotes** → reutiliza `stock_batches` (não duplicado)
- **Recebimento** → reutiliza `wms_receipts`/`stock_checkings` (estendidos)
- **Qualidade** → `quality_inspections`/`quality_parameters` são Shared Platform Services (não pertencem apenas ao Indústria)

---

## 2. Fluxo Multi-Ciclo do Módulo Indústria

```
Engenharia & Produtos (Fase 0)
    ├── Catálogo de Itens (products estendido)
    ├── Especificações Técnicas versionadas
    ├── Conversões de Unidade
    ├── BOM / Estruturas / Formulações
    ├── Recursos Produtivos
    ├── Roteiros de Produção versionados
    └── Custos Industriais (padrão)
         │
         ▼
    MRP (rota/hook calculado)
         │
         ▼
    Ciclo de Suprimentos (Compras/Importação)
         │
         ▼
    Recebimento & Qualidade (Inspeção ↔ Especificação)
         │
         ▼
    Ciclo de Produção (OP ↔ BOM versionada ↔ Roteiro versionado)
         │
         ▼
    Expedição
         │
         ▼
    Cliente
```

---

## 3. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** A cada nova fase do Módulo Indústria
- **Responsável:** Architecture Council
- **Aprovação:** Product Owner

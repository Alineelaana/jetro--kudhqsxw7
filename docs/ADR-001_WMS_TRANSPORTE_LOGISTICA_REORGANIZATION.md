# ADR-001: Reorganização Arquitetural WMS / Transporte / Logística

## Status

Aceito — 2026-08-09

## Contexto

A plataforma possuía um módulo único "Logística" que acumulava responsabilidades de armazém (WMS), transporte e orquestração. Isso gerava ambiguidade de responsabilidade, duplicação conceitual e dificuldade de governança.

## Decisão

Reorganizar em três módulos com responsabilidades não-sobrepostas:

### WMS — "O que acontece dentro do armazém"

- Recebimento físico, conferência, quarentena, endereçamento, armazenagem
- Pallets, volumes, reabastecimento, ondas de separação, picking
- FIFO/FEFO, conferência de expedição, inventário, movimentações internas
- Mapa do armazém, ocupação, operadores, coletores
- Preparação física de expedição (responsabilidade termina no carregamento)
- **Collections preservadas**: wms_receipts, wms_putaway_tasks, wms_waves, wms_replenishments, wms_receipt_checks, wms_separations, wms_expedition_checks, wms_shippings, wms_romaneios, wms_blind_counts, wms_operational_alerts, wms_pallets, wms_volumes, wms_collectors, wms_operators

### Transporte — "O que acontece da origem ao destino"

- Planejamento de transporte, formação/consolidação de carga
- Rotas e roteirização (fixas e dinâmicas), sequência de entregas
- Veículos, motoristas, transportadoras, jornadas/viagens
- Fretes, tabelas de frete, cotação, contratação
- Rastreamento, entregas, comprovantes, ocorrências de transporte
- Custos de transporte, desempenho, frota própria e terceirizada
- Logística reversa relacionada ao deslocamento
- **Collections reorganizadas (não renomeadas)**: logistics_routes, logistics_deliveries, logistics_vehicles, logistics_drivers, logistics_freights, logistics_freight_tables, logistics_tracking, logistics_occurrences, logistics_proof_delivery, logistics_costs
- **Nova collection**: transport_journeys (Viagem — entidade central do Transporte)

### Logística — Torre de Orquestração End-to-End

- Responde: o que mover, de onde, para onde, quando, prioridade, prontidão
- Onde está travado, qual área é responsável, impacto de atraso
- Dashboard consolidado WMS + Transporte
- Planejamento logístico, transferências, coletas
- Devoluções/Reversa (orquestração — Transporte executa, WMS recebe)
- Central de Exceções Logísticas
- KPIs: lead time end-to-end, nível de serviço, custo total logístico, perfect order

## Fluxo Formal Entre Módulos

```
PEDIDO/NECESSIDADE
  → LOGÍSTICA (prioridade, necessidade de movimentação, prazo)
  → WMS (separa, inspeciona, prepara fisicamente)
  → TRANSPORTE (planeja carga, rota, veículo, motorista, viagem)
  → WMS (carregamento físico e confirmação de saída)
  → TRANSPORTE (viagem, rastreamento, entrega)
  → TRANSPORTE (registra comprovante/ocorrência)
  → LOGÍSTICA (acompanha resultado end-to-end)
```

## Regras de Não-Duplicação

- Romaneio (`wms_romaneios`): entidade única compartilhada com views específicas por módulo
- Transportadoras: cadastro central único, Transporte adiciona apenas info específica
- Contas a pagar: Financeiro permanece responsável; Transporte calcula/valida custo
- Ocorrências: cada uma tem origem (WMS/Transporte); Logística consolida sem criar terceiro registro
- Pedidos de venda: entregas referenciam o pedido existente

## Permissões

- WMS: ações específicas (Separar, Conferir, Expedir) — prefixo `wms_*`
- Transporte: `trans_*` (trans_plan_load, trans_create_route, trans_release_journey, etc.)
- Logística: `log_*` (log_plan_operation, log_prioritize, log_manage_exceptions, etc.)
- Estrutura `perfis_permissoes` e `system_parameters` reutilizadas

## Agents de IA

- **wms-agent**: especialista em operações de armazém
- **transporte-agent**: especialista em transporte
- **logistics-agent**: visão transversal, consulta WMS + Transporte

## Consequências

- Menu reorganizado: Transporte adicionado, Logística reorganizado para orquestração
- Nenhuma collection renomeada ou migrada — zero perda de dados
- Única nova collection: `transport_journeys`
- Rotas antigas preservadas para compatibilidade
- Auditoria central preservada em `audit_logs`

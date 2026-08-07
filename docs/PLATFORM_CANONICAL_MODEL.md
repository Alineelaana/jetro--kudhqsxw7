# PLATFORM_CANONICAL_MODEL.md — Modelo Canônico da Plataforma

> **Documento vivo — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Oficial
> Responsável: Architecture Council

---

## 1. Entidade Central Canônica: Item

O **Item** é a entidade canônica central da Plataforma. Todo produto, matéria-prima, embalagem, insumo, componente ou subproduto é um **Item** no catálogo central — representado pela coleção `products` (estendida, não duplicada).

### 1.1 Princípio: Item ≠ Recurso Produtivo

- **Item** (`products`): o que é produzido, consumido, comprado, estocado ou vendido.
- **Recurso Produtivo** (`production_resources`): o que executa a produção (linha, máquina, equipamento, célula, estação, centro produtivo).
- Estes são **entidades distintas** — um Item nunca é um Recurso Produtivo e vice-versa.

### 1.2 Classificação Neutra

A classificação de um Item (`item_type`) é uma **característica de negócio configurável**, não sua identidade técnica. Mudar a classificação nunca duplica nem altera a identidade técnica do registro. A classificação inicial é sempre `"Não Classificado"` — a reclassificação é um processo manual controlado.

### 1.3 Tipos de Item (Configuráveis)

| Tipo             | Descrição                                  | Exemplos                            |
| ---------------- | ------------------------------------------ | ----------------------------------- |
| Não Classificado | Estado inicial neutro                      | —                                   |
| Matéria-prima    | Insumo industrial transformado no processo | Azeitona, sal, açúcar               |
| Embalagem        | Material de acondicionamento               | Pote de vidro, tampa, rótulo, caixa |
| Produto Acabado  | Resultado final do processo produtivo      | Azeitona em salmoura 200ml          |
| Insumo           | Material auxiliar não transformado         | Conservantes, aditivos              |
| Componente       | Parte integrante de um produto             | —                                   |
| Subproduto       | Resultado secundário da produção           | —                                   |

**Exclusão:** Recurso/Ativo não é um tipo de Item — pertence a `production_resources`.

---

## 2. Relações Canônicas do Item

O Item mantém relações versionadas com todas as dimensões técnicas:

| Relação                          | Coleção                                               | Natureza                            |
| -------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| Item × Especificação Técnica     | `spec_values` (via `spec_attributes` → `spec_groups`) | Versionada, com vigência            |
| Item × BOM/Estrutura             | `bom_versions` → `bom_components`                     | Versionada, imutável quando ativada |
| Item × Formulação                | `bom_versions` (type = "formulacao")                  | Especialização controlada da BOM    |
| Item × Processo Produtivo        | `production_routes` → `production_route_operations`   | Versionada, imutável quando ativada |
| Item × Qualidade (Especificação) | `spec_values` → `quality_parameters`                  | Pertence à Engenharia/Item          |
| Item × Qualidade (Inspeção)      | `quality_inspections`                                 | Shared Platform Service             |
| Item × Estoque/Lote              | `stock_batches`                                       | Reutilizado, não duplicado          |
| Item × Custos Industriais        | `industrial_costs`                                    | Padrão (snapshot) × Realizado       |
| Item × Conversões de Unidade     | `unit_conversions`                                    | Global e por Item, com vigência     |

---

## 3. Princípio: Single Source of Truth

Cada dado técnico tem **uma única fonte autoritativa**:

- **O Item é** → definido em `products` (catálogo central)
- **O que o Item deve ser** → definido em `spec_values` (especificação versionada)
- **Como o Item é feito** → definido em `bom_versions` + `bom_components` (BOM versionada)
- **Como o Item é processado** → definido em `production_routes` + `production_route_operations` (roteiro versionado)
- **Quanto o Item custa** → definido em `industrial_costs` (custo industrial)
- **O que foi encontrado no lote** → definido em `quality_inspections` (inspeção)
- **Qual conversão de unidade aplicar** → definido em `unit_conversions` (com vigência)

Nenhuma estrutura pré-computada substitui estas fontes. Índices técnicos são regeneráveis.

---

## 4. Versionamento e Imutabilidade

### 4.1 Padrão de Versionamento

Toda especificação, BOM e roteiro segue o mesmo padrão:

1. **Criação:** nova versão com `status = "rascunho"`, `vigencia_inicial = null`
2. **Ativação:** `status = "ativo"`, `vigencia_inicial = data`, `approval_date = data`
3. **Substituição:** versão anterior recebe `vigencia_final = data`, `status = "inativo"`
4. **Imutabilidade:** versões ativadas são snapshots imutáveis — nunca alteradas

### 4.2 Rastreabilidade Histórica

Inspeções, Ordens de Produção e movimentações referenciam **a versão em vigor no momento do evento**. Mudanças futuras nunca alteram a interpretação histórica.

---

## 5. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** A cada mudança no modelo canônico
- **Responsável:** Architecture Council

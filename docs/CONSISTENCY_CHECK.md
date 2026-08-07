# CONSISTENCY_CHECK.md — Verificação de Consistência entre Documentos

> **Documento de verificação — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Verificado
> Responsável: Architecture Council

---

## 1. Escopo da Verificação

Verificação de consistência entre os seis documentos oficiais da plataforma:

1. PLATFORM_PRINCIPLES.md
2. ARCHITECTURE.md
3. PRD.md
4. ROADMAP.md
5. BACKLOG.md
6. PRODUCT_VISION_2035.md

---

## 2. Verificação de Estruturas e Nomenclaturas

### 2.1 Reclassificação de Estruturas (ADR-011)

| Estrutura              | PLATFORM_PRINCIPLES | ARCHITECTURE  | PRD              | ROADMAP    | BACKLOG                 | PRODUCT_VISION | Status         |
| ---------------------- | ------------------- | ------------- | ---------------- | ---------- | ----------------------- | -------------- | -------------- |
| `currencies`           | §4.2 (exemplo)      | §2.4 (tabela) | §3.11 (lista)    | —          | BLK-MVP-018             | §5.3.3         | ✅ Consistente |
| `exchange_rates`       | §4.2 (exemplo)      | §2.4 (tabela) | §3.11 (lista)    | —          | BLK-MVP-018             | §5.3.3         | ✅ Consistente |
| `import_processes`     | —                   | §2.3, §2.4    | §3.11 (lista)    | V2 (COMEX) | BLK-MVP-019, BLK-V2-010 | §5.3.2         | ✅ Consistente |
| `import_costs`         | —                   | §2.4 (tabela) | §3.11 (lista)    | —          | BLK-MVP-019             | —              | ✅ Consistente |
| `quality_inspections`  | §4.2 (exemplo)      | §2.3, §2.4    | §3.11 (descrito) | —          | BLK-MVP-020             | §5.3.3         | ✅ Consistente |
| `quality_parameters`   | §4.2 (exemplo)      | §2.3, §2.4    | §3.11 (descrito) | —          | BLK-MVP-020             | —              | ✅ Consistente |
| `production_resources` | —                   | §2.4 (tabela) | §3.11 (descrito) | —          | BLK-MVP-022             | —              | ✅ Consistente |

**Conclusão:** Todas as estruturas reclassificadas são referenciadas consistentemente com os mesmos nomes em todos os documentos. Nenhuma referência residual aos nomes antigos (`ind_*`) foi encontrada.

### 2.2 Estruturas Estendidas

| Estrutura                        | PLATFORM_PRINCIPLES | ARCHITECTURE | PRD                | BACKLOG     | Status         |
| -------------------------------- | ------------------- | ------------ | ------------------ | ----------- | -------------- |
| `purchase_orders` (multi-moeda)  | §4.1 (exemplo)      | ADR-016      | §3.11 (item 1)     | BLK-MVP-018 | ✅ Consistente |
| `wms_receipts`/`stock_checkings` | §4.1 (exemplo)      | ADR-016      | §3.11 (item 5)     | BLK-MVP-020 | ✅ Consistente |
| `stock_batches` (quarentena)     | §4.1 (exemplo)      | ADR-016      | §3.11 (itens 6, 7) | BLK-MVP-020 | ✅ Consistente |

### 2.3 Estruturas Específicas do Indústria

| Estrutura                                     | PRD             | BACKLOG                  | Status         |
| --------------------------------------------- | --------------- | ------------------------ | -------------- |
| BOM versionada (imutável)                     | §3.11 (item 9)  | BLK-MVP-021, BLK-MVP-022 | ✅ Consistente |
| Ordens de Produção (`bom_id` + `bom_version`) | §3.11 (item 12) | BLK-MVP-022              | ✅ Consistente |
| Apontamentos de produção                      | §3.11 (item 13) | BLK-MVP-022              | ✅ Consistente |

---

## 3. Verificação de Versões e Prioridades

### 3.1 MRP

| Documento            | O que diz                           | Versão | Status |
| -------------------- | ----------------------------------- | ------ | ------ |
| PRD §3.11            | MRP básico como rota/hook calculado | MVP    | ✅     |
| ROADMAP MVP          | MRP básico (rota/hook)              | MVP    | ✅     |
| ROADMAP V1           | MRP avançado com forecasting        | V1     | ✅     |
| BACKLOG BLK-MVP-021  | MRP básico como rota/hook           | MVP    | ✅     |
| BACKLOG BLK-V1-012   | MRP avançado com forecasting        | V1     | ✅     |
| ARCHITECTURE ADR-014 | Rota/hook, não coleção persistente  | —      | ✅     |

### 3.2 Recall

| Documento          | O que diz                                                       | Versão | Status |
| ------------------ | --------------------------------------------------------------- | ------ | ------ |
| PRD §3.11          | Rastreabilidade sem depender do Recall; Recall deferido para V1 | V1     | ✅     |
| ROADMAP V1         | Recall completo                                                 | V1     | ✅     |
| BACKLOG BLK-V1-011 | Recall completo                                                 | V1     | ✅     |

### 3.3 COMEX

| Documento             | O que diz                        | Versão | Status |
| --------------------- | -------------------------------- | ------ | ------ |
| ARCHITECTURE ADR-019  | COMEX como evolução futura (V2+) | V2+    | ✅     |
| ROADMAP V2            | COMEX — Comércio Exterior        | V2     | ✅     |
| BACKLOG BLK-V2-010    | COMEX corporativo                | V2     | ✅     |
| PRODUCT_VISION §5.3.2 | COMEX futuro                     | —      | ✅     |

### 3.4 Manutenção e OEE

| Documento          | O que diz        | Versão | Status |
| ------------------ | ---------------- | ------ | ------ |
| ROADMAP V2         | Manutenção e OEE | V2     | ✅     |
| BACKLOG BLK-V2-008 | Manutenção e OEE | V2     | ✅     |

### 3.5 IA Prescritiva para Indústria

| Documento             | O que diz                                       | Versão | Status |
| --------------------- | ----------------------------------------------- | ------ | ------ |
| ROADMAP V3            | IA prescritiva, parameterização multi-indústria | V3     | ✅     |
| BACKLOG BLK-V3-007    | IA prescritiva e otimização autônoma            | V3     | ✅     |
| PRODUCT_VISION §5.3.1 | IA prescritiva de produção                      | —      | ✅     |

---

## 4. Verificação de Princípios

| Princípio                                                     | PLATFORM_PRINCIPLES | ARCHITECTURE  | PRD                            | Status |
| ------------------------------------------------------------- | ------------------- | ------------- | ------------------------------ | ------ |
| Evolução Sustentável (REAPROVEITAR→ESTENDER→RELACIONAR→CRIAR) | §4.1                | ADR-016       | §3.11 (extensão de estruturas) | ✅     |
| Neutralidade dos Módulos                                      | §4.2                | ADR-011, §2.3 | §3.11 (Shared Services)        | ✅     |
| Single Source of Truth                                        | §4.4                | ADR-015       | §3.11 (rastreabilidade)        | ✅     |
| Simplicidade Arquitetural                                     | §4.7                | ADR-014       | §3.11 (MRP como rota)          | ✅     |

---

## 5. Verificação de ADRs

| ADR     | ARCHITECTURE | PLATFORM_PRINCIPLES (Resumo) | PRD             | Status |
| ------- | ------------ | ---------------------------- | --------------- | ------ |
| ADR-011 | ✅ Detalhado | ✅ Mapeado                   | ✅ Referenciado | ✅     |
| ADR-012 | ✅ Detalhado | ✅ Mapeado                   | —               | ✅     |
| ADR-013 | ✅ Detalhado | —                            | —               | ✅     |
| ADR-014 | ✅ Detalhado | ✅ Mapeado                   | ✅ Referenciado | ✅     |
| ADR-015 | ✅ Detalhado | ✅ Mapeado                   | ✅ Referenciado | ✅     |
| ADR-016 | ✅ Detalhado | ✅ Mapeado                   | ✅ Referenciado | ✅     |
| ADR-017 | ✅ Detalhado | ✅ Mapeado                   | ✅ Referenciado | ✅     |
| ADR-018 | ✅ Detalhado | ✅ Mapeado                   | ✅ Referenciado | ✅     |
| ADR-019 | ✅ Detalhado | ✅ Mapeado                   | ✅ Referenciado | ✅     |

---

## 6. Verificação de Shared Platform Services

A lista de 27 Shared Platform Services definida em ARCHITECTURE §2.3 foi verificada quanto a:

- ✅ Nenhum serviço é listado como pertencente a um módulo específico
- ✅ Os serviços reclassificados do Indústria (`currencies`, `exchange_rates`, `import_processes`, `import_costs`, `quality_inspections`, `quality_parameters`, `production_resources`) aparecem na lista
- ✅ O campo `modulo_origem` é mencionado para `quality_inspections` e `quality_parameters`
- ✅ O campo `tipo` é mencionado para `production_resources`

---

## 7. Discrepâncias Encontradas e Resolvidas

| #   | Discrepância                    | Resolução |
| --- | ------------------------------- | --------- |
| 1   | Nenhuma discrepância encontrada | —         |

**Conclusão:** Todos os seis documentos foram verificados e estão consistentes entre si. Não há conflitos de nomenclatura, duplicações de requisitos, ou desalinhamento de versões entre PRD, Architecture, Roadmap e Backlog.

---

## 8. Resultado Final

| Critério                                  | Status      |
| ----------------------------------------- | ----------- |
| Nomenclatura de estruturas consistente    | ✅ Aprovado |
| Versões e prioridades alinhadas           | ✅ Aprovado |
| Princípios aplicados consistentemente     | ✅ Aprovado |
| ADRs mapeados em todos os documentos      | ✅ Aprovado |
| Shared Platform Services coerente         | ✅ Aprovado |
| Sem requisitos conflitantes ou duplicados | ✅ Aprovado |

**Veredicto:** Documentação consistente e pronta para revisão do Product Owner.

---

## 9. Verificação de Consistência — Princípio do Aceite Baseado em Evidências (ADR-022)

> **Verificação pós-correção — 2026-08-07**
> Responsável: Architecture Council

### 9.1 Escopo

Verificação de consistência entre os três registros de governança do **Princípio do Aceite Baseado em Evidências — Validação em Cinco Níveis**:

1. `PLATFORM_PRINCIPLES.md` §4.10
2. `ARCHITECTURE.md` ADR-022
3. `BACKLOG.md` §1 (Convenções)

### 9.2 Correção 1 — Data do ADR-022

| Registro             | Antes                               | Depois                                         | Status       |
| -------------------- | ----------------------------------- | ---------------------------------------------- | ------------ |
| ARCHITECTURE ADR-022 | Data: 2026-08-07 (sem campo Status) | Data: 2026-08-07 + Status: Aceito — 2026-08-07 | ✅ Corrigido |

### 9.3 Correção 2 — Regra "Não Aplicável"

| Aspecto                                                           | PLATFORM_PRINCIPLES §4.10 | ARCHITECTURE ADR-022 | BACKLOG §1     | Status         |
| ----------------------------------------------------------------- | ------------------------- | -------------------- | -------------- | -------------- |
| "Não Aplicável" refere-se a nível, não ao requisito               | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| Nível "Não Aplicável" excluído do cálculo de aderência            | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| Nível "Não Aplicável" NÃO remove requisito do denominador da fase | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| Apenas requisito inteiro fora do escopo remove do denominador     | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |

### 9.4 Correção 3 — Regra de Status do Requisito

| Aspecto                                                    | PLATFORM_PRINCIPLES §4.10 | ARCHITECTURE ADR-022 | BACKLOG §1     | Status         |
| ---------------------------------------------------------- | ------------------------- | -------------------- | -------------- | -------------- |
| Status = Implementado requer níveis aplicáveis comprovados | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| Status = Implementado requer justificativa em níveis "N/A" | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| "Não Aplicável" não é quinto status do requisito           | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| Quatro status oficiais permanecem: ✅🟡❌⚪                | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |

### 9.5 Correção 4 — Fórmula de Conclusão da Fase

| Aspecto                                                   | PLATFORM_PRINCIPLES §4.10 | ARCHITECTURE ADR-022 | BACKLOG §1     | Status         |
| --------------------------------------------------------- | ------------------------- | -------------------- | -------------- | -------------- |
| Fórmula: Implementado ÷ Total de requisitos × 100         | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| Nível "Não Aplicável" não remove requisito do denominador | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |
| Remoção do denominador exige decisão documentada          | ✅ Explicitado            | ✅ Explicitado       | ✅ Explicitado | ✅ Consistente |

### 9.6 Resultado da Verificação

| Critério                                                          | Status      |
| ----------------------------------------------------------------- | ----------- |
| Data do ADR-022 corrigida para 2026                               | ✅ Aprovado |
| "Não Aplicável" = classificação de nível, não status de requisito | ✅ Aprovado |
| Regra de status do requisito consistente nos três registros       | ✅ Aprovado |
| Fórmula de conclusão da fase consistente nos três registros       | ✅ Aprovado |
| "Não Aplicável" não remove requisito do denominador da fase       | ✅ Aprovado |
| Quatro status oficiais preservados                                | ✅ Aprovado |
| Sem divergências entre os três registros                          | ✅ Aprovado |

**Veredicto:** Os três registros (PLATFORM_PRINCIPLES §4.10, ARCHITECTURE ADR-022, BACKLOG §1) estão consistentes entre si. As três correções foram aplicadas e verificadas. Não há divergências.

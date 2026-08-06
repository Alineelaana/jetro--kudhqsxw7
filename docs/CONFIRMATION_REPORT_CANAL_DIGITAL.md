# Relatório de Confirmação Pós-Atualização — Arquitetura de Canais Digitais

> **Documento de confirmação — Aguardando autorização explícita para iniciar desenvolvimento**
> Data: 2026-08-06
> Status: Aguardando autorização do Product Owner

---

## 1. Documentos Alterados

| #   | Documento                                   | Tipo de Alteração                                                                                                                                            |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `docs/PLATFORM_PRINCIPLES.md`               | Atualizado — Adicionado princípio §4.9 (Estratégia Evolutiva da Plataforma) e ADR-020 no resumo de decisões                                                  |
| 2   | `docs/ARCHITECTURE.md`                      | Atualizado — Adicionada seção §2.5 (Arquitetura de Canais Digitais), Canal Digital nos Shared Platform Services, ADR-020 e atualização do resumo de decisões |
| 3   | `docs/ROADMAP.md`                           | Atualizado — Adicionada seção §6 (Restrições Temporárias de Implementação) com limitações do Skip Cloud                                                      |
| 4   | `docs/PRODUCT_VISION_2035.md`               | Atualizado — Adicionada seção §5.2.1 (Plataforma como Núcleo Operacional — Visão Multi-Canais)                                                               |
| 5   | `docs/BACKLOG.md`                           | Atualizado — Adicionada seção §2.1 com registro completo dos 18 itens do MVP da Indústria                                                                    |
| 6   | `docs/CONFIRMATION_REPORT_CANAL_DIGITAL.md` | Criado — Este relatório                                                                                                                                      |

---

## 2. Novo ADR

| Campo         | Valor                                        |
| ------------- | -------------------------------------------- |
| **Número**    | ADR-020                                      |
| **Título**    | Arquitetura de Canais Digitais da Plataforma |
| **Documento** | `docs/ARCHITECTURE.md`                       |
| **Data**      | 2026-08-06                                   |
| **Aprovador** | Architecture Council                         |

### Pontos de Decisão Cobertos pelo ADR-020

1. ✅ Arquitetura conceitual multi-canais (visão oficial de longo prazo)
2. ✅ Implementação temporária em projeto único (estratégia de deploy atual)
3. ✅ Canal Digital incorporado aos Shared Platform Services
4. ✅ VeloraLog como primeiro Canal Digital
5. ✅ Limitações atuais do Skip Cloud tratadas como limitações temporárias de infraestrutura
6. ✅ Futura separação física sem redesenho da arquitetura

---

## 3. Lista Completa de Itens do MVP da Indústria (18 Itens)

> **Nenhum item previamente aprovado foi removido ou omitido.** BLK-MVP-018 a BLK-MVP-024 representam apenas a primeira fase de detalhamento.

| Ordem | #   | Item                               | Backlog ID  | PRD Ref         | ADR Ref          |
| ----- | --- | ---------------------------------- | ----------- | --------------- | ---------------- |
| 1     | 1   | Compras Internacionais             | BLK-MVP-018 | §3.11 (item 1)  | ADR-011, ADR-016 |
| 2     | 2   | Importação                         | BLK-MVP-019 | §3.11 (item 2)  | ADR-011          |
| 3     | 3   | Multi-moeda / Câmbio               | BLK-MVP-018 | §3.11 (item 3)  | ADR-011, ADR-016 |
| 4     | 4   | Landing Cost                       | BLK-MVP-019 | §3.11 (item 4)  | ADR-011          |
| 5     | 5   | Recebimento integrado ao WMS       | BLK-MVP-020 | §3.11 (item 5)  | ADR-016, ADR-018 |
| 6     | 6   | Estoque por lote e validade        | BLK-MVP-020 | §3.11 (item 6)  | ADR-016          |
| 7     | 7   | Quarentena                         | BLK-MVP-020 | §3.11 (item 7)  | ADR-016          |
| 8     | 8   | Qualidade                          | BLK-MVP-020 | §3.11 (item 8)  | ADR-018          |
| 9     | 9   | BOM versionada                     | BLK-MVP-021 | §3.11 (item 9)  | ADR-017          |
| 10    | 10  | MRP básico                         | BLK-MVP-021 | §3.11 (item 10) | ADR-014          |
| 11    | 11  | PCP                                | BLK-MVP-022 | §3.11 (item 11) | ADR-017          |
| 12    | 12  | Ordem de Produção                  | BLK-MVP-022 | §3.11 (item 12) | ADR-017          |
| 13    | 13  | Apontamento/consumo real           | BLK-MVP-022 | §3.11 (item 13) | ADR-017          |
| 14    | 14  | Geração do lote de produto acabado | BLK-MVP-022 | §3.11 (item 14) | ADR-017          |
| 15    | 15  | Custos previstos × realizados      | BLK-MVP-024 | §3.11 (item 15) | ADR-005          |
| 16    | 16  | Rastreabilidade/genealogia         | BLK-MVP-023 | §3.11 (item 16) | ADR-015          |
| 17    | 17  | Indicadores                        | BLK-MVP-024 | §3.11 (item 17) | ADR-005          |
| 18    | 18  | Auditoria                          | BLK-MVP-024 | §3.11 (item 18) | ADR-005          |

---

## 4. Dependências entre Itens do MVP

```
1. Compras Internacionais (BLK-MVP-018)
   └── 2. Importação (BLK-MVP-019)
   │    └── 4. Landing Cost (BLK-MVP-019)
   │    └── 5. Recebimento WMS (BLK-MVP-020)
   │         └── 6. Estoque por lote (BLK-MVP-020)
   │         │    └── 7. Quarentena (BLK-MVP-020)
   │         │    └── 8. Qualidade (BLK-MVP-020)
   │         │         └── 16. Rastreabilidade (BLK-MVP-023)
   │         └── 14. Lote produto acabado (BLK-MVP-022)
   └── 3. Multi-moeda / Câmbio (BLK-MVP-018)

9. BOM versionada (BLK-MVP-021)
   └── 10. MRP básico (BLK-MVP-021)
   └── 11. PCP (BLK-MVP-022)
   └── 12. Ordem de Produção (BLK-MVP-022)
        └── 13. Apontamento/consumo real (BLK-MVP-022)
        └── 14. Geração do lote de produto acabado (BLK-MVP-022)

15. Custos previstos × realizados (BLK-MVP-024) ← depende de 1, 9, 12
17. Indicadores (BLK-MVP-024) ← depende de 12, 6
18. Auditoria (BLK-MVP-024) ← depende de todos os itens acima
```

---

## 5. Ordem de Implementação Recomendada

A ordem recomendada segue a cadeia natural do fluxo industrial:

### Fase A — Cadeia de Suprimentos Industrial (Itens 1–8)

| Ordem | Item                         | Justificativa                                                     |
| ----- | ---------------------------- | ----------------------------------------------------------------- |
| 1     | Compras Internacionais       | Ponto de entrada — sem dependências                               |
| 2     | Importação                   | Depende de Compras Internacionais                                 |
| 3     | Multi-moeda / Câmbio         | Depende de Compras Internacionais; pode ser paralelo à Importação |
| 4     | Landing Cost                 | Depende de Importação                                             |
| 5     | Recebimento integrado ao WMS | Depende de Importação                                             |
| 6     | Estoque por lote e validade  | Depende de Recebimento                                            |
| 7     | Quarentena                   | Depende de Estoque por lote                                       |
| 8     | Qualidade                    | Depende de Estoque por lote / Quarentena                          |

### Fase B — Cadeia de Produção (Itens 9–14)

| Ordem | Item                               | Justificativa                                        |
| ----- | ---------------------------------- | ---------------------------------------------------- |
| 9     | BOM versionada                     | Sem dependências da Fase A; pode iniciar em paralelo |
| 10    | MRP básico                         | Depende de BOM                                       |
| 11    | PCP                                | Depende de BOM e recursos de produção                |
| 12    | Ordem de Produção                  | Depende de BOM e PCP                                 |
| 13    | Apontamento/consumo real           | Depende de Ordem de Produção                         |
| 14    | Geração do lote de produto acabado | Depende de Apontamento e Estoque por lote            |

### Fase C — Controle e Governança (Itens 15–18)

| Ordem | Item                          | Justificativa                                      |
| ----- | ----------------------------- | -------------------------------------------------- |
| 15    | Custos previstos × realizados | Depende de Compras, BOM e Ordem de Produção        |
| 16    | Rastreabilidade/genealogia    | Depende de Estoque por lote e Ordem de Produção    |
| 17    | Indicadores                   | Depende de Ordem de Produção e Estoque             |
| 18    | Auditoria                     | Depende de todos os itens; registra todas as ações |

---

## 6. Confirmação Final

| Critério                                                  | Status        |
| --------------------------------------------------------- | ------------- |
| Documentação-only (sem código/migrações)                  | ✅ Confirmado |
| Estratégia Evolutiva registrada em PLATFORM_PRINCIPLES    | ✅            |
| Arquitetura multi-canais em ARCHITECTURE                  | ✅            |
| VeloraLog como primeiro Canal Digital                     | ✅            |
| Canal Digital como Shared Platform Service                | ✅            |
| Limitações do Skip como restrições temporárias em ROADMAP | ✅            |
| Visão multi-canais em PRODUCT_VISION_2035                 | ✅            |
| ADR-020 criado com 6 pontos de decisão                    | ✅            |
| 18 itens do MVP registrados em BACKLOG                    | ✅            |
| Dependências mapeadas                                     | ✅            |
| Ordem de implementação definida                           | ✅            |
| Nenhum item removido ou omitido                           | ✅            |

---

> **Aguardando autorização explícita do Product Owner para iniciar o desenvolvimento do MVP da Indústria.**
>
> Nenhum desenvolvimento de código deve começar antes desta autorização.

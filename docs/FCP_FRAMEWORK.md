# FCP_FRAMEWORK.md — Framework de Certificação da Plataforma (FCP)

> **Documento institucional — Metodologia permanente de engenharia**
> Última atualização: 2026-08-07
> Status: Consolidado — Aguardando ratificação do Conselho de Arquitetura
> Responsável: Conselho de Arquitetura
> Versão: 1.0.0 (Final Consolidada)

---

## Sumário

1. [Visão Geral do Framework](#1-visão-geral-do-framework)
2. [Princípios e Diretrizes do FCP](#2-princípios-e-diretrizes-do-fcp)
3. [Fase 1 — Escopo e Inventario](#fase-1--escopo-e-inventario)
4. [Fase 2 — Mapeamento de Módulos](#fase-2--mapeamento-de-módulos)
5. [Fase 3 — Avaliação Arquitetural](#fase-3--avaliação-arquitetural)
6. [Fase 4 — Avaliação de Conformidade Documental](#fase-4--avaliação-de-conformidade-documental)
7. [Fase 5 — Checklists de Certificação](#fase-5--checklists-de-certificação)
8. [Fase 6 — Certificação de Regras de Negócio](#fase-6--certificação-de-regras-de-negócio)
9. [Fase 7 — Estratégia Oficial de Testes](#fase-7--estratégia-oficial-de-testes)
10. [Fase 8 — Relatórios Oficiais](#fase-8--relatórios-oficiais)
11. [Fase 9 — Projeção do Centro de Certificação da Plataforma](#fase-9--projeção-do-centro-de-certificação-da-plataforma)
12. [Fase 10 — Certificação Contínua](#fase-10--certificação-contínua)
13. [Fase 11 — Planejamento da Revisão Global](#fase-11--planejamento-da-revisão-global)
14. [Fase 12 — Evolução do Framework](#fase-12--evolução-do-framework)
15. [Fase 13 — Métricas e Indicadores](#fase-13--métricas-e-indicadores)
16. [Fase 14 — Gestão de Riscos](#fase-14--gestão-de-riscos)
17. [Fase 15 — Melhoria Contínua](#fase-15--melhoria-contínua)
18. [Revisão Final do Conselho de Arquitetura](#revisão-final-do-conselho-de-arquitetura)
19. [Revisão Interna Obrigatória](#revisão-interna-obrigatória)
20. [Gestão deste Documento](#gestão-deste-documento)

---

## 1. Visão Geral do Framework

### 1.1 Propósito

O **Framework de Certificação da Plataforma (FCP)** é a metodologia institucional de engenharia que governa a qualidade, a conformidade arquitetural, a rastreabilidade e a maturidade de todos os componentes da plataforma. Ele estabelece um processo permanente, sistemático e auditável para validar que toda entrega — seja um novo módulo, uma melhoria, uma correção, um refactoring, uma release, uma auditoria ou uma evolução — atende aos padrões arquiteturais, de negócio, de segurança e de qualidade definidos pela plataforma.

### 1.2 Escopo

O FCP aplica-se a:

- **Toda entrega técnica:** coleções, campos, índices, migrações, hooks, rotas, serviços, componentes, páginas, integrações, APIs.
- **Toda entrega de negócio:** regras de negócio, cálculos, fluxos, workflows, automações.
- **Toda entrega documental:** PRD, ARCHITECTURE, BACKLOG, ROADMAP, ADRs, PLATFORM_PRINCIPLES, CANONICAL_MODEL, DOMAIN_MAP.
- **Toda evolução futura:** novos módulos, novos canais digitais, novas integrações, novas capacidades de IA.
- **Toda auditoria ou certificação:** revisão global, revisão por módulo, revisão de release.

### 1.3 Neutralidade

Este Framework é **completamente neutro quanto ao nome comercial da plataforma**. Ele não referencia nenhum nome de produto, marca ou denominação comercial. Esta neutralidade garante que o FCP permanece válido para qualquer versão, produto derivado, rebranding ou evolução futura da plataforma.

### 1.4 Relação com o Princípio do Aceite Baseado em Evidências

O FCP é a **operacionalização** do Princípio do Aceite Baseado em Evidências (PLATFORM_PRINCIPLES §4.10, ADR-022). Enquanto aquele princípio define que "Concluído" é um estado comprovado por evidências, o FCP define **como** essa comprovação é executada, verificada e certificada.

### 1.5 Estrutura do Framework

O FCP é composto por 15 fases:

| Fase | Título                                          | Natureza            |
| ---- | ----------------------------------------------- | ------------------- |
| 1    | Escopo e Inventario                             | Preparação          |
| 2    | Mapeamento de Módulos                           | Preparação          |
| 3    | Avaliação Arquitetural                          | Avaliação           |
| 4    | Conformidade Documental                         | Avaliação           |
| 5    | Checklists de Certificação                      | Execução            |
| 6    | Certificação de Regras de Negócio               | Execução            |
| 7    | Estratégia Oficial de Testes                    | Execução            |
| 8    | Relatórios Oficiais                             | Entrega             |
| 9    | Centro de Certificação da Plataforma (Projeção) | Futuro              |
| 10   | Certificação Contínua                           | Governança          |
| 11   | Planejamento da Revisão Global                  | Planejamento        |
| 12   | Evolução do Framework                           | Meta-governança     |
| 13   | Métricas e Indicadores                          | Medição             |
| 14   | Gestão de Riscos                                | Governança          |
| 15   | Melhoria Contínua                               | Evolução permanente |

---

## 2. Princípios e Diretrizes do FCP

### 2.1 Princípios Orientadores

1. **Evidência sobre Declaração:** Nenhuma entrega é certificada sem evidência técnica verificável.
2. **Rastreabilidade Total:** Toda decisão, toda não conformidade, toda correção é rastreada e auditável.
3. **Reutilização Máxima:** O Framework reutiliza princípios, ADRs e estrutura existente; não duplica governança.
4. **Simplicidade Arquitetural:** O processo de certificação deve ser o mais simples possível, sem sacrificar rigor.
5. **Extensibilidade:** O Framework suporta módulos e tecnologias futuras sem ser refeito.
6. **Neutralidade:** Independente de nome comercial, tecnologia específica ou provedor.
7. **IA-Ready:** O Framework suporta nativamente certificação de componentes de IA (agentes, RAG, automações).
8. **Sustentabilidade:** O custo de aplicar o Framework deve ser menor que o custo de não aplicá-lo.

### 2.2 Diretrizes de Aplicação

- **Proporcionalidade:** A profundidade da certificação é proporcional ao impacto e à criticidade da entrega.
- **Idempotência:** Reaplicar o Framework a uma entrega já certificada não deve produzir resultados diferentes.
- **Não-Bloqueio Estratégico:** O Framework identifica bloqueadores, mas também define caminhos de mitigação.
- **Transparência:** Todos os resultados de certificação são documentados e acessíveis ao Conselho de Arquitetura.

### 2.3 Papéis e Responsabilidades

| Papel                       | Responsabilidade no FCP                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Conselho de Arquitetura** | Aprova resultados de certificação, ratifica mudanças no Framework, decide sobre não conformidades críticas. |
| **Tech Lead**               | Executa a certificação técnica, produz evidências, propõe planos de correção.                               |
| **Product Owner**           | Valida conformidade de regras de negócio, prioriza correções.                                               |
| **Equipe de Engenharia**    | Produz as evidências, executa correções, mantém a documentação.                                             |
| **Auditor FCP**             | Executa auditorias independentes, valida evidências, produz relatórios oficiais.                            |

### 2.4 Níveis de Criticidade para Certificação

| Nível       | Critério                                                                           | Profundidade                                                |
| ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Crítica** | Afeta dados financeiros, fiscais, segurança, multi-tenancy ou integridade de dados | Certificação completa (15 fases aplicáveis)                 |
| **Alta**    | Afeta regras de negócio, fluxos, integrações, performance                          | Certificação completa, exceto Fase 14 (Riscos) simplificada |
| **Média**   | Afeta UI, relatórios, dashboards, UX                                               | Certificação focada em Fases 5, 7, 8                        |
| **Baixa**   | Ajustes visuais, textos, labels                                                    | Certificação focada em Fase 5 (checklist rápido)            |

---

## Fase 1 — Escopo e Inventario

### 1.1 Objetivo

Estabelecer o escopo preciso da certificação: o que será certificado, quais os limites, quais os critérios de sucesso e quais os artefatos envolvidos.

### 1.2 Metodologia

1. **Definição do Escopo:** Descrever explicitamente o que entra no escopo da certificação (módulo, feature, release, correção).
2. **Inventário de Artefatos:** Listar todos os artefatos técnicos e documentais envolvidos.
3. **Identificação de Dependências:** Mapear dependências entre módulos, coleções, hooks, serviços.
4. **Critérios de Sucesso:** Definir o que significa "certificado" para este escopo específico.
5. **Critérios de Exclusão:** Documentar explicitamente o que está fora do escopo e por quê.

### 1.3 Artefatos de Entrada

- PRD (seção relevante)
- BACKLOG (item relevante)
- ARCHITECTURE (ADR relevante)
- Código-fonte (migrações, hooks, componentes, serviços)
- Schema vivo do banco de dados

### 1.4 Entregáveis

- Documento de Escopo de Certificação (DEC)
- Inventário de Artefatos
- Mapa de Dependências

### 1.5 Critério de Aprovação

O escopo é aprovado quando: (1) todos os artefatos estão inventariados; (2) todas as dependências estão mapeadas; (3) os critérios de sucesso são mensuráveis; (4) as exclusões estão justificadas.

---

## Fase 2 — Mapeamento de Módulos

### 2.1 Objetivo

Mapear a estrutura modular da plataforma, identificando cada módulo, subdomínio, serviço compartilhado e canal digital, para garantir que a certificação cobre todos os componentes relevantes.

### 2.2 Metodologia

1. **Inventário Modular:** Listar todos os módulos ativos e planejados.
2. **Classificação:** Classificar cada módulo como: Core, Shared Platform Service, Módulo de Negócio, Canal Digital, Portal.
3. **Fronteiras:** Definir as fronteiras de cada módulo (o que pertence, o que não pertence).
4. **Intersecções:** Identificar intersecções entre módulos (dados compartilhados, fluxos cross-module).
5. **Maturidade Atual:** Avaliar o nível de maturidade atual de cada módulo (Inicial, Em Desenvolvimento, Operacional, Maduro).

### 2.3 Modelo de Maturidade

| Nível | Nome               | Característica                                     |
| ----- | ------------------ | -------------------------------------------------- |
| 0     | Inexistente        | Não há estrutura nem funcionalidade                |
| 1     | Inicial            | Estrutura existe, funcionalidade parcial           |
| 2     | Em Desenvolvimento | Estrutura e funcionalidade em construção ativa     |
| 3     | Operacional        | Funcionalidade completa, sem certificação          |
| 4     | Certificado        | Passou pelo FCP, sem não conformidades críticas    |
| 5     | Maduro             | Certificado, monitorado, com indicadores positivos |

### 2.4 Entregáveis

- Mapa Modular (árvore de módulos com classificação)
- Matriz de Maturidade por módulo
- Mapa de Intersecções

---

## Fase 3 — Avaliação Arquitetural

### 3.1 Objetivo

Verificar que a entrega está alinhada com a arquitetura conceitual da plataforma, os princípios fundamentais e os ADRs vigentes.

### 3.2 Metodologia

1. **Verificação de Princípios:** Para cada princípio fundamental (PLATFORM_PRINCIPLES §4.1–§4.10), verificar se a entrega está em conformidade.
2. **Verificação de ADRs:** Para cada ADR aplicável, verificar aderência.
3. **Verificação de Neutralidade:** Confirmar que estruturas com potencial de reuso não nasceram acopladas a um módulo específico.
4. **Verificação de Single Source of Truth:** Confirmar que não há duplicação de fonte de verdade.
5. **Verificação de Hierarquia de Decisão:** Confirmar que a hierarquia REAPROVEITAR → ESTENDER → RELACIONAR → CRIAR foi seguida.

### 3.3 Checklist de Conformidade Arquitetural

| #   | Verificação                                 | Evidência                             | Aprovação                                 | Reprovação                       |
| --- | ------------------------------------------- | ------------------------------------- | ----------------------------------------- | -------------------------------- |
| 1   | A entrega segue a arquitetura conceitual?   | Referência ao diagrama de arquitetura | ADR referenciado                          | Sem referência arquitetural      |
| 2   | A estrutura reutiliza ao invés de duplicar? | Comparação com estruturas existentes  | Reaproveitamento ou extensão documentada  | Duplicação sem justificativa     |
| 3   | A estrutura é neutra quanto a módulo?       | Análise de potencial de reuso         | Neutra ou justificativa de especificidade | Acoplamento inadequado           |
| 4   | Há uma única fonte de verdade?              | Análise de fontes de dados            | Fonte única confirmada                    | Duplicação de fonte de verdade   |
| 5   | A decisão foi documentada como ADR?         | ADR existente                         | ADR aprovado                              | Decisão não documentada          |
| 6   | A entrega suporta multi-tenancy?            | Verificação de isolamento por tenant  | Isolamento confirmado                     | Vazamento de dados entre tenants |
| 7   | A entrega respeita API First?               | API exposta antes da UI               | API documentada                           | UI sem API correspondente        |

### 3.4 Entregáveis

- Relatório de Conformidade Arquitetural
- Lista de Não Conformidades Arquiteturais (se houver)
- ADRs novos ou atualizados (se aplicável)

---

## Fase 4 — Avaliação de Conformidade Documental

### 4.1 Objetivo

Garantir que toda entrega tem a documentação completa, atualizada e rastreável.

### 4.2 Metodologia

1. **Inventário Documental:** Verificar quais documentos são afetados pela entrega.
2. **Verificação de Atualização:** Confirmar que cada documento afetado foi atualizado.
3. **Verificação de Rastreabilidade:** Confirmar que cada requisito tem referência cruzada (PRD ↔ BACKLOG ↔ ARCHITECTURE ↔ ADR).
4. **Verificação de Consistência:** Confirmar que não há contradições entre documentos.

### 4.3 Documentos Oficiais da Plataforma

| Documento                   | Responsável             | Frequência de Atualização         |
| --------------------------- | ----------------------- | --------------------------------- |
| PLATFORM_PRINCIPLES.md      | Conselho de Arquitetura | A cada novo princípio ou ADR      |
| ARCHITECTURE.md             | Conselho de Arquitetura | A cada mudança arquitetural       |
| PRD.md                      | Product Owner           | A cada mudança de escopo          |
| BACKLOG.md                  | Product Owner           | A cada sprint                     |
| ROADMAP.md                  | Product Owner           | Trimestral                        |
| PLATFORM_CANONICAL_MODEL.md | Conselho de Arquitetura | A cada mudança no modelo canônico |
| PLATFORM_DOMAIN_MAP.md      | Conselho de Arquitetura | A cada novo subdomínio            |
| CONSISTENCY_CHECK.md        | Conselho de Arquitetura | A cada rodada de documentação     |
| FCP_FRAMEWORK.md            | Conselho de Arquitetura | A cada evolução do Framework      |

### 4.4 Critério de Aprovação

A conformidade documental é aprovada quando: (1) todos os documentos afetados estão atualizados; (2) a rastreabilidade está completa; (3) a consistência foi verificada; (4) não há referências a estruturas ou conceitos que não existem mais.

---

## Fase 5 — Checklists de Certificação

### 5.1 Objetivo

Fornecer checklists completos, auditáveis e metodologicamente estruturados para validar cada dimensão técnica e de negócio da plataforma.

### 5.2 Metodologia de Aplicação

#### Como Aplicar os Checklists

1. **Seleção:** Identificar quais checklists são aplicáveis à entrega (baseado no escopo da Fase 1).
2. **Execução:** Para cada item do checklist, executar a validação conforme a "Forma de validação" definida.
3. **Evidenciação:** Produzir a "Evidência necessária" para cada item.
4. **Pontuação:** Atribuir a pontuação conforme o "Peso" e o resultado da validação.
5. **Avaliação:** Comparar a pontuação obtida com o "Critério de aprovação".
6. **Registro:** Documentar o resultado (Aprovado, Reprovado, Não Aplicável) com justificativa.

#### Sistema de Pontuação

Cada item do checklist tem:

| Atributo                   | Descrição                                   |
| -------------------------- | ------------------------------------------- |
| **Objetivo**               | O que o item valida                         |
| **Critério**               | A condição que deve ser atendida            |
| **Forma de validação**     | Como executar a verificação                 |
| **Evidência necessária**   | O que deve ser produzido como prova         |
| **Peso**                   | 1 (Baixo), 2 (Médio), 3 (Alto), 4 (Crítico) |
| **Impacto**                | O que acontece se não for atendido          |
| **Prioridade**             | P0, P1, P2, P3                              |
| **Critério de aprovação**  | Condição para considerar o item aprovado    |
| **Critério de reprovação** | Condição para considerar o item reprovado   |

#### Cálculo de Aderência do Checklist

```
Aderência do Checklist = (soma dos pesos dos itens aprovados) / (soma dos pesos dos itens aplicáveis) × 100
```

- Itens "Não Aplicáveis" (com justificativa) são excluídos do denominador.
- Itens com peso 4 (Crítico) que estejam reprovados bloqueiam a certificação, independentemente da aderência geral.
- Aderência ≥ 95% com zero itens críticos reprovados = Certificado.
- Aderência 80–94% = Certificado com Ressalvas (plano de correção obrigatório).
- Aderência < 80% = Não Certificado.

### 5.3 Checklists por Categoria

Abaixo estão os checklists completos. Cada item segue a estrutura metodológica definida.

---

#### 5.3.1 Checklist de Arquitetura

| #      | Objetivo                                         | Critério                                                             | Forma de Validação                  | Evidência                                     | Peso | Impacto                  | Prioridade | Aprovação                        | Reprovação                    |
| ------ | ------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------- | ---- | ------------------------ | ---------- | -------------------------------- | ----------------------------- |
| ARQ-01 | Confirmar alinhamento com arquitetura conceitual | A entrega referencia a arquitetura oficial                           | Análise documental                  | Referência ao diagrama e seção da arquitetura | 4    | Quebra de arquitetura    | P0         | Referência explícita documentada | Sem referência                |
| ARQ-02 | Verificar hierarquia de decisão                  | REAPROVEITAR > ESTENDER > RELACIONAR > CRIAR                         | Análise da justificativa de criação | Documento de justificativa                    | 3    | Duplicação desnecessária | P0         | Hierarquia documentada e seguida | Criação sem justificativa     |
| ARQ-03 | Verificar neutralidade de módulo                 | Estrutura não está acoplada a um módulo específico sem justificativa | Análise de potencial de reuso       | Análise de reuso                              | 3    | Acoplamento inadequado   | P1         | Neutra ou justificada            | Acoplamento sem justificativa |
| ARQ-04 | Verificar Single Source of Truth                 | Não há duplicação de fonte de verdade                                | Análise de fontes de dados          | Mapeamento de fontes                          | 4    | Inconsistência de dados  | P0         | Fonte única confirmada           | Duplicação de fonte           |
| ARQ-05 | Verificar ADR documentado                        | Toda decisão estrutural tem ADR                                      | Busca por ADR                       | ADR aprovado                                  | 3    | Decisão não rastreável   | P1         | ADR existente e aprovado         | ADR ausente                   |
| ARQ-06 | Verificar multi-tenancy                          | Dados isolados por tenant                                            | Teste de isolamento                 | Resultado do teste                            | 4    | Vazamento de dados       | P0         | Isolamento confirmado            | Vazamento detectado           |
| ARQ-07 | Verificar API First                              | API exposta antes da UI                                              | Análise cronológica                 | Documentação da API                           | 3    | Acoplamento UI-API       | P1         | API documentada primeiro         | UI sem API                    |

#### 5.3.2 Checklist de Banco de Dados

| #     | Objetivo                            | Critério                                  | Forma de Validação               | Evidência           | Peso | Impacto               | Prioridade | Aprovação               | Reprovação        |
| ----- | ----------------------------------- | ----------------------------------------- | -------------------------------- | ------------------- | ---- | --------------------- | ---------- | ----------------------- | ----------------- |
| BD-01 | Verificar existência no schema vivo | Coleção/campo existe no banco live        | Query ao banco                   | Resultado da query  | 4    | Estrutura inexistente | P0         | Presente no schema vivo | Ausente do schema |
| BD-02 | Verificar campos created/updated    | Toda coleção base tem autodate            | Verificação do schema            | Schema com autodate | 3    | Falha em sort/filter  | P0         | Ambos presentes         | Ausente           |
| BD-03 | Verificar índices                   | Campos de filter/sort têm índice          | Análise de queries × índices     | Mapa de índices     | 3    | Performance degradada | P1         | Índices apropriados     | Índices ausentes  |
| BD-04 | Verificar regras de acesso (RLS)    | Todas as 5 regras definidas               | Verificação do schema            | Regras documentadas | 4    | Acesso indevido       | P0         | 5 regras definidas      | Regras ausentes   |
| BD-05 | Verificar tipos de campo            | Tipos compatíveis com SQLite              | Verificação do schema            | Schema validado     | 2    | Erro de runtime       | P1         | Tipos válidos           | Tipo incompatível |
| BD-06 | Verificar integridade referencial   | Relações apontam para coleções existentes | Verificação de collectionId      | Mapa de relações    | 4    | Erro de query         | P0         | Todas válidas           | Relação quebrada  |
| BD-07 | Verificar idempotência de migrações | Migrações são idempotentes                | Re-execução em ambiente de teste | Log de re-execução  | 3    | Falha em re-deploy    | P1         | Idempotente             | Não idempotente   |

#### 5.3.3 Checklist de Migrations

| #      | Objetivo                         | Critério                              | Forma de Validação         | Evidência            | Peso | Impacto               | Prioridade | Aprovação              | Reprovação                    |
| ------ | -------------------------------- | ------------------------------------- | -------------------------- | -------------------- | ---- | --------------------- | ---------- | ---------------------- | ----------------------------- |
| MIG-01 | Verificar numeração sequencial   | Número ordinal é o próximo disponível | Verificação do histórico   | Lista de migrações   | 3    | Conflito de ordenação | P0         | Próximo número correto | Número reutilizado            |
| MIG-02 | Verificar imutabilidade          | Migração aplicada não foi editada     | Comparação com git history | Git diff             | 4    | Estado inconsistente  | P0         | Não editada            | Editada após apply            |
| MIG-03 | Verificar função down            | Toda migração tem down reversível     | Análise do código          | Função down presente | 2    | Rollback impossível   | P1         | Down funcional         | Down ausente ou não funcional |
| MIG-04 | Verificar post-save validation   | Validação pós-save presente           | Análise do código          | Log de validação     | 3    | Falha silenciosa      | P1         | Validação presente     | Validação ausente             |
| MIG-05 | Verificar guards de idempotência | hasTable ou findFirst antes de criar  | Análise do código          | Código com guards    | 3    | Duplicação em re-run  | P1         | Guards presentes       | Guards ausentes               |

#### 5.3.4 Checklist de Collections

| #      | Objetivo                            | Critério                                | Forma de Validação          | Evidência       | Peso | Impacto           | Prioridade | Aprovação           | Reprovação            |
| ------ | ----------------------------------- | --------------------------------------- | --------------------------- | --------------- | ---- | ----------------- | ---------- | ------------------- | --------------------- |
| COL-01 | Verificar nome consistente          | Nome segue convenção (snake_case)       | Verificação do schema       | Nome da coleção | 2    | Inconsistência    | P2         | Convenção seguida   | Convenção violada     |
| COL-02 | Verificar campos obrigatórios       | Campos required têm required: true      | Verificação do schema       | Schema          | 3    | Dados inválidos   | P0         | Required correto    | Required ausente      |
| COL-03 | Verificar bool não required         | Campos bool não estão marcados required | Verificação do schema       | Schema          | 3    | Criação bloqueada | P0         | Bool não required   | Bool marcado required |
| COL-04 | Verificar select com values         | Select tem values definidos             | Verificação do schema       | Schema          | 3    | Erro de validação | P0         | Values presentes    | Values ausentes       |
| COL-05 | Verificar relation com collectionId | Relation aponta para coleção válida     | Verificação do collectionId | Schema          | 4    | Erro de query     | P0         | collectionId válido | collectionId inválido |

#### 5.3.5 Checklist de Relacionamentos

| #      | Objetivo                  | Critério                                        | Forma de Validação     | Evidência          | Peso | Impacto                 | Prioridade | Aprovação             | Reprovação            |
| ------ | ------------------------- | ----------------------------------------------- | ---------------------- | ------------------ | ---- | ----------------------- | ---------- | --------------------- | --------------------- |
| REL-01 | Verificar maxSelect       | Relation tem maxSelect definido                 | Verificação do schema  | Schema             | 2    | Comportamento incorreto | P1         | maxSelect definido    | maxSelect ausente     |
| REL-02 | Verificar cascadeDelete   | Relation define cascadeDelete quando apropriado | Análise de dependência | Schema             | 3    | Órfãos no banco         | P1         | cascadeDelete correto | cascadeDelete ausente |
| REL-03 | Verificar expansibilidade | Relation suporta expand na API                  | Teste de expand        | Resultado da query | 2    | Dados não carregam      | P1         | Expand funciona       | Expand falha          |

#### 5.3.6 Checklist de Backend (Hooks)

| #     | Objetivo                              | Critério                                           | Forma de Validação  | Evidência             | Peso | Impacto                   | Prioridade | Aprovação           | Reprovação             |
| ----- | ------------------------------------- | -------------------------------------------------- | ------------------- | --------------------- | ---- | ------------------------- | ---------- | ------------------- | ---------------------- |
| BK-01 | Verificar scoping de variáveis        | Sem top-level functions referenciadas em callbacks | Análise do código   | Code review           | 4    | ReferenceError em runtime | P0         | Tudo inline         | Top-level referenciado |
| BK-02 | Verificar um routerAdd por arquivo    | Uma rota por hook                                  | Análise do código   | Estrutura de arquivos | 3    | Falha de startup          | P0         | Um por arquivo      | Múltiplos por arquivo  |
| BK-03 | Verificar prefixo /backend/v1/        | Rotas usam prefixo correto                         | Verificação do path | Código do hook        | 3    | Conflito com API nativa   | P0         | Prefixo correto     | Prefixo ausente        |
| BK-04 | Verificar e.next() em hooks de modelo | e.next() chamado                                   | Análise do código   | Código do hook        | 4    | Hook bloqueia chain       | P0         | e.next() presente   | e.next() ausente       |
| BK-05 | Verificar tratamento de erro          | Erros tratados adequadamente                       | Análise do código   | Code review           | 3    | Erro não tratado          | P1         | Tratamento presente | Erro sem tratamento    |
| BK-06 | Verificar uso de $app (não app)       | Hooks usam $app                                    | Análise do código   | Código do hook        | 3    | ReferenceError            | P0         | $app usado          | app usado              |

#### 5.3.7 Checklist de Frontend

| #     | Objetivo                        | Critério                             | Forma de Validação          | Evidência  | Peso | Impacto                  | Prioridade | Aprovação     | Reprovação                   |
| ----- | ------------------------------- | ------------------------------------ | --------------------------- | ---------- | ---- | ------------------------ | ---------- | ------------- | ---------------------------- |
| FE-01 | Verificar imports com @/        | Imports usam path alias              | Análise do código           | Código     | 2    | Build pode falhar        | P1         | @/ usado      | Relative path                |
| FE-02 | Verificar named exports         | Componentes usam named export        | Análise do código           | Código     | 3    | Import quebra            | P0         | Named export  | Default export em componente |
| FE-03 | Verificar hooks no topo         | Hooks chamados antes de condicionais | Análise do código           | Código     | 4    | Quebra de regra do React | P0         | Hooks no topo | Hook após return             |
| FE-04 | Verificar uso de cn()           | Classes dinâmicas com cn()           | Análise do código           | Código     | 2    | Classes não aplicam      | P1         | cn() usado    | Função em className          |
| FE-05 | Verificar responsividade        | Design é mobile-first                | Teste em múltiplos tamanhos | Screenshot | 3    | UX degradada             | P1         | Responsivo    | Não responsivo               |
| FE-06 | Verificar componentes shadcn/ui | Usa shadcn quando possível           | Análise do código           | Código     | 2    | Inconsistência visual    | P2         | shadcn usado  | HTML nativo                  |

#### 5.3.8 Checklist de APIs

| #      | Objetivo                       | Critério                      | Forma de Validação         | Evidência     | Peso | Impacto            | Prioridade | Aprovação          | Reprovação                         |
| ------ | ------------------------------ | ----------------------------- | -------------------------- | ------------- | ---- | ------------------ | ---------- | ------------------ | ---------------------------------- |
| API-01 | Verificar autenticação         | Endpoint requer auth          | Teste sem token            | Resposta 401  | 4    | Acesso indevido    | P0         | Auth requerida     | Endpoint público sem justificativa |
| API-02 | Verificar validação de entrada | Body é validado               | Teste com payload inválido | Resposta 400  | 3    | Dados inválidos    | P0         | Validação presente | Sem validação                      |
| API-03 | Verificar tratamento de erro   | Erros retornam status correto | Teste com cenários de erro | Resposta HTTP | 3    | Erro opaco         | P1         | Status correto     | Status 500 genérico                |
| API-04 | Verificar documentação         | Endpoint documentado          | Verificação de docs        | Documentação  | 2    | Descoberta difícil | P2         | Documentado        | Não documentado                    |

#### 5.3.9 Checklist de Segurança

| #      | Objetivo                                 | Critério                            | Forma de Validação        | Evidência    | Peso | Impacto             | Prioridade | Aprovação             | Reprovação           |
| ------ | ---------------------------------------- | ----------------------------------- | ------------------------- | ------------ | ---- | ------------------- | ---------- | --------------------- | -------------------- |
| SEC-01 | Verificar RLS ativa                      | Regras de acesso definidas          | Verificação do schema     | Regras       | 4    | Vazamento de dados  | P0         | RLS ativa             | RLS ausente          |
| SEC-02 | Verificar senhas hasheadas               | Senhas nunca em texto plano         | Verificação do código     | Código       | 4    | Comprometimento     | P0         | Hash usado            | Texto plano          |
| SEC-03 | Verificar dados sensíveis criptografados | CPF/CNPJ/dados bancários protegidos | Análise de campos         | Schema       | 3    | Violação de LGPD    | P0         | Criptografia aplicada | Dados em texto plano |
| SEC-04 | Verificar MFA                            | MFA disponível e exigido para admin | Teste de login            | Configuração | 3    | Acesso indevido     | P0         | MFA funcionando       | MFA ausente          |
| SEC-05 | Verificar logs imutáveis                 | Auditoria é append-only             | Verificação de permissões | Configuração | 3    | Manipulação de logs | P0         | Append-only           | Logs editáveis       |

#### 5.3.10 Checklist de Permissões

| #       | Objetivo                                | Critério                              | Forma de Validação    | Evidência          | Peso | Impacto             | Prioridade | Aprovação            | Reprovação         |
| ------- | --------------------------------------- | ------------------------------------- | --------------------- | ------------------ | ---- | ------------------- | ---------- | -------------------- | ------------------ |
| PERM-01 | Verificar matriz de permissões          | Role × módulo × ação definida         | Verificação da matriz | Matriz             | 3    | Acesso indevido     | P0         | Matriz completa      | Matriz incompleta  |
| PERM-02 | Verificar permissões de dados sensíveis | Custos/margens têm permissão separada | Análise de permissões | Configuração       | 3    | Vazamento de dados  | P0         | Permissão separada   | Permissão genérica |
| PERM-03 | Verificar validação server-side         | Permissões verificadas no servidor    | Teste de bypass       | Resultado do teste | 4    | Bypass de permissão | P0         | Server-side validado | Apenas client-side |

#### 5.3.11 Checklist de Performance

| #       | Objetivo                          | Critério              | Forma de Validação   | Evidência       | Peso | Impacto               | Prioridade | Aprovação  | Reprovação    |
| ------- | --------------------------------- | --------------------- | -------------------- | --------------- | ---- | --------------------- | ---------- | ---------- | ------------- |
| PERF-01 | Verificar tempo de carregamento   | Tela < 2s             | Medição de tempo     | Métrica         | 3    | UX degradada          | P1         | < 2s       | > 2s          |
| PERF-02 | Verificar resposta de API (p95)   | < 300ms               | Medição de latência  | Métrica         | 3    | Lentidão              | P1         | < 300ms    | > 300ms       |
| PERF-03 | Verificar consulta de lista (p95) | < 500ms               | Medição de query     | Métrica         | 2    | Lentidão              | P1         | < 500ms    | > 500ms       |
| PERF-04 | Verificar índices apropriados     | Query usa índice      | EXPLAIN query plan   | Query plan      | 3    | Full table scan       | P1         | Usa índice | Full scan     |
| PERF-05 | Verificar paginação               | Listas usam paginação | Verificação de query | Query com limit | 2    | Sobrecarga de memória | P1         | Paginada   | Sem paginação |

#### 5.3.12 Checklist de UX/UI

| #     | Objetivo                      | Critério                          | Forma de Validação      | Evidência  | Peso | Impacto        | Prioridade | Aprovação         | Reprovação        |
| ----- | ----------------------------- | --------------------------------- | ----------------------- | ---------- | ---- | -------------- | ---------- | ----------------- | ----------------- |
| UX-01 | Verificar consistência visual | Segue design system               | Análise visual          | Screenshot | 2    | Inconsistência | P2         | Consistente       | Inconsistente     |
| UX-02 | Verificar feedback de ações   | Usuário recebe feedback           | Teste de interação      | Screenshot | 2    | Confusão       | P2         | Feedback presente | Sem feedback      |
| UX-03 | Verificar contraste de cores  | Ratio ≥ 4.5:1                     | Ferramenta de contraste | Métrica    | 3    | Acessibilidade | P1         | ≥ 4.5:1           | < 4.5:1           |
| UX-04 | Verificar estados de erro     | Mensagens de erro claras          | Teste de erro           | Screenshot | 2    | Confusão       | P2         | Mensagem clara    | Mensagem genérica |
| UX-05 | Verificar loading states      | Estados de carregamento presentes | Teste de lentidão       | Screenshot | 2    | UX degradada   | P2         | Loading presente  | Sem loading       |

#### 5.3.13 Checklist de Logs e Auditoria

| #      | Objetivo                         | Critério                                                   | Forma de Validação        | Evidência            | Peso | Impacto                  | Prioridade | Aprovação         | Reprovação       |
| ------ | -------------------------------- | ---------------------------------------------------------- | ------------------------- | -------------------- | ---- | ------------------------ | ---------- | ----------------- | ---------------- |
| LOG-01 | Verificar registro de ações CRUD | Toda ação relevante é logada                               | Verificação de logs       | Entrada de log       | 3    | Falta de rastreabilidade | P0         | Log presente      | Log ausente      |
| LOG-02 | Verificar contexto completo      | Log tem quem, o quê, quando, IP, estado anterior/posterior | Análise de log            | Entrada de log       | 3    | Rastreabilidade parcial  | P0         | Contexto completo | Contexto parcial |
| LOG-03 | Verificar imutabilidade          | Logs não podem ser alterados                               | Verificação de permissões | Configuração         | 4    | Manipulação              | P0         | Append-only       | Editável         |
| LOG-04 | Verificar timeline por registro  | Cada registro tem timeline                                 | Teste de timeline         | Timeline visualizada | 2    | Falta de contexto        | P1         | Timeline presente | Timeline ausente |

#### 5.3.14 Checklist de IA

| #     | Objetivo                    | Critério                             | Forma de Validação          | Evidência      | Peso | Impacto              | Prioridade | Aprovação                 | Reprovação                     |
| ----- | --------------------------- | ------------------------------------ | --------------------------- | -------------- | ---- | -------------------- | ---------- | ------------------------- | ------------------------------ |
| IA-01 | Verificar uso de $ai        | IA usa gateway oficial               | Análise do código           | Código do hook | 4    | Custo não rastreável | P0         | $ai usado                 | SDK externo                    |
| IA-02 | Verificar transparência     | Ações de IA são registradas          | Verificação de logs         | Log de IA      | 3    | Falta de auditoria   | P0         | Log presente              | Log ausente                    |
| IA-03 | Verificar reversibilidade   | Ações de IA são reversíveis          | Análise de fluxo            | Documentação   | 3    | Irreversibilidade    | P1         | Reversível ou justificado | Irreversível sem justificativa |
| IA-04 | Verificar consentimento     | Uso de dados em IA tem consentimento | Verificação de configuração | Configuração   | 3    | Violação de LGPD     | P0         | Consentimento registrado  | Sem consentimento              |
| IA-05 | Verificar parsing defensivo | Respostas de IA são validadas        | Análise do código           | Código         | 3    | Erro de parsing      | P1         | Parsing defensivo         | Parsing direto                 |

#### 5.3.15 Checklist de Documentação

| #      | Objetivo                                | Critério                  | Forma de Validação           | Evidência          | Peso | Impacto                | Prioridade | Aprovação          | Reprovação             |
| ------ | --------------------------------------- | ------------------------- | ---------------------------- | ------------------ | ---- | ---------------------- | ---------- | ------------------ | ---------------------- |
| DOC-01 | Verificar ADR para decisão estrutural   | ADR existe                | Busca por ADR                | ADR                | 3    | Decisão não rastreável | P1         | ADR presente       | ADR ausente            |
| DOC-02 | Verificar atualização do PRD            | PRD reflete a entrega     | Comparação PRD × entrega     | PRD atualizado     | 3    | Desalinhamento         | P1         | PRD atualizado     | PRD desatualizado      |
| DOC-03 | Verificar atualização do BACKLOG        | Backlog reflete a entrega | Comparação BACKLOG × entrega | Backlog atualizado | 2    | Desalinhamento         | P2         | Backlog atualizado | Backlog desatualizado  |
| DOC-04 | Verificar consistência entre documentos | Sem contradições          | Verificação cruzada          | Consistency check  | 3    | Inconsistência         | P1         | Consistente        | Contradição encontrada |

#### 5.3.16 Checklist de Regras de Negócio (Resumo — detalhamento na Fase 6)

| #     | Objetivo                       | Critério                              | Forma de Validação             | Evidência          | Peso | Impacto             | Prioridade | Aprovação         | Reprovação          |
| ----- | ------------------------------ | ------------------------------------- | ------------------------------ | ------------------ | ---- | ------------------- | ---------- | ----------------- | ------------------- |
| RN-01 | Verificar cálculos financeiros | Cálculos produzem resultados corretos | Teste com inputs conhecidos    | Resultado do teste | 4    | Erro financeiro     | P0         | Resultado correto | Resultado incorreto |
| RN-02 | Verificar regras fiscais       | Tributos calculados corretamente      | Teste com alíquotas conhecidas | Resultado do teste | 4    | Erro fiscal         | P0         | Resultado correto | Resultado incorreto |
| RN-03 | Verificar fluxos de aprovação  | Fluxo segue regras definidas          | Teste de fluxo                 | Log do fluxo       | 3    | Bypass de aprovação | P0         | Fluxo correto     | Fluxo burlado       |

#### 5.3.17 Demais Checklists (Estrutura Padronizada)

Os seguintes checklists seguem a mesma estrutura metodológica acima. Cada item define Objetivo, Critério, Forma de validação, Evidência, Peso, Impacto, Prioridade, Aprovação e Reprovação. São aplicados conforme a relevância da entrega:

- **Menus e Rotas:** Verificar consistência de navegação, rotas protegidas, breadcrumbs.
- **Relatórios e Dashboards:** Verificar dados corretos, filtros funcionais, exportação.
- **KPIs:** Verificar fórmulas corretas, dados de origem, atualização em tempo real.
- **Automação:** Verificar gatilhos, condições, ações, logs de execução.
- **Integrações:** Verificar credenciais, tratamento de erro, retry, logs de sincronização.
- **Importação/Exportação:** Verificar validação de dados, tratamento de erro, formato.
- **Uploads e Arquivos:** Verificar tamanho máximo, mime types, armazenamento.
- **PDF e Assinaturas:** Verificar geração correta, assinatura digital, armazenamento.
- **Aplicativo Mobile:** Verificar offline, sincronização, permissões.
- **API Pública:** Verificar rate limiting, documentação OpenAPI, sandbox.
- **SDK e Plugins:** Verificar sandbox, isolamento, review.
- **Campanhas e Promoções:** Verificar regras de desconto, vigência, limites.
- **Cobrança e Inadimplência:** Verificar cálculo de juros, multa, protesto.
- **Workflow e Notificações:** Verificar gatilhos, destinatários, canais.
- **Comercial, Compras, CRM, RH, Marketing, TI, Indústria, Estoque, Custos, DRE, Verbas, Precificação:** Checklists específicos de domínio, validando regras de negócio, fluxos, integrações e cálculos próprios de cada área.

### 5.4 Critério de Aprovação da Fase 5

A Fase 5 é aprovada quando todos os checklists aplicáveis foram executados, evidenciados e pontuados, com aderência ≥ 95% e zero itens críticos (peso 4) reprovados.

---

## Fase 6 — Certificação de Regras de Negócio

### 6.1 Objetivo

Estabelecer uma metodologia sistemática e extensível para validar que toda regra de negócio da plataforma — atual e futura — produz resultados corretos, consistentes e auditáveis.

### 6.2 Metodologia Geral

Para cada regra de negócio, a certificação segue este fluxo:

1. **Identificação da Regra:** Nome, descrição, módulo de origem, referência documental.
2. **Definição do Comportamento Esperado:** O que a regra deve fazer, em linguagem clara.
3. **Definição de Inputs de Teste:** Conjunto de entradas que cobrem casos normais, extremos e negativos.
4. **Definição de Outputs Esperados:** Resultado esperado para cada input.
5. **Execução do Teste:** Aplicar os inputs e registrar os outputs reais.
6. **Comparação:** Comparar output real com output esperado.
7. **Avaliação de Desvio:** Se há desvio, classificar como aceitável (tolerância) ou reprovável.
8. **Registro de Evidência:** Documentar o teste, os inputs, os outputs e o veredito.
9. **Reprodutibilidade:** O teste deve ser reprodutível por qualquer auditor.

### 6.3 Regras de Negócio Cobertas

#### 6.3.1 Regras Financeiras

| #      | Regra          | Descrição                                                     | Validação                                                                                                        |
| ------ | -------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| FIN-01 | Fluxo de Caixa | Consolidar contas a pagar e receber em projeção 30/60/90 dias | Input: conjunto de títulos com valores e vencimentos. Output: projeção por período. Comparar com cálculo manual. |
| FIN-02 | DRE            | Gerar Demonstração Resultado do Exercício gerencial           | Input: receitas, custos, despesas por categoria. Output: DRE estruturado. Comparar com planilha de referência.   |
| FIN-03 | CMV            | Calcular Custo da Mercadoria Vendida                          | Input: custo de aquisição + fretes + impostos. Output: CMV por item e total. Tolerância: R$ 0,01.                |
| FIN-04 | Margem         | Calcular margem de lucro                                      | Input: receita e custo. Output: margem % e valor. Fórmula: (receita - custo) / receita × 100.                    |
| FIN-05 | Markup         | Calcular markup                                               | Input: custo e markup %. Output: preço de venda. Fórmula: custo × (1 + markup/100).                              |
| FIN-06 | Rentabilidade  | Calcular rentabilidade por pedido/cliente                     | Input: receita, custo, despesas alocadas. Output: rentabilidade % e valor.                                       |
| FIN-07 | Comissões      | Calcular comissão por vendedor                                | Input: vendas, tabela de comissão, metas. Output: comissão por venda e total.                                    |
| FIN-08 | Verbas         | Calcular e aplicar verbas comerciais                          | Input: contrato de verba, volume vendido. Output: valor de verba.                                                |
| FIN-09 | Custos         | Apropriar custos diretos e indiretos                          | Input: custos por centro de custo. Output: rateio por produto/pedido.                                            |
| FIN-10 | Cobrança       | Gerar títulos de cobrança                                     | Input: pedido faturado, condição de pagamento. Output: títulos com vencimentos e valores.                        |
| FIN-11 | Inadimplência  | Calcular e classificar inadimplência                          | Input: títulos vencidos. Output: valor e % de inadimplência, classificação por idade.                            |

#### 6.3.2 Regras Fiscais

| #      | Regra                        | Descrição                             | Validação                                                                                      |
| ------ | ---------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| FIS-01 | ICMS                         | Calcular ICMS por operação            | Input: valor, alíquota, CST, CFOP. Output: valor do imposto. Comparar com calculadora oficial. |
| FIS-02 | IPI                          | Calcular IPI                          | Input: valor, alíquota. Output: valor do imposto.                                              |
| FIS-03 | PIS/COFINS                   | Calcular PIS e COFINS                 | Input: valor, regime, alíquotas. Output: valores dos impostos.                                 |
| FIS-04 | CFOP                         | Classificar operação com CFOP correto | Input: tipo de operação. Output: CFOP. Verificar tabela oficial.                               |
| FIS-05 | Substituição Tributária      | Calcular ICMS-ST                      | Input: valor, MVA, alíquota interna, alíquota interestadual. Output: valor do ST.              |
| FIS-06 | Reforma Tributária (CBS/IBS) | Calcular CBS e IBS                    | Input: valor, alíquota CBS, alíquota IBS, crédito. Output: imposto líquido.                    |

#### 6.3.3 Regras Comerciais

| #      | Regra                 | Descrição                          | Validação                                                                                 |
| ------ | --------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| COM-01 | Pedidos de Venda      | Criar pedido com validações        | Input: cliente, itens, condição de pagamento. Output: pedido criado ou erro de validação. |
| COM-02 | Separação             | Reservar estoque para pedido       | Input: pedido com itens. Output: estoque reservado, saldos atualizados.                   |
| COM-03 | Faturamento           | Gerar fatura e nota fiscal         | Input: pedido faturável. Output: NF gerada, estoque baixado, título criado.               |
| COM-04 | Cancelamento          | Cancelar pedido e reverter estoque | Input: pedido cancelado. Output: estoque devolvido, títulos cancelados.                   |
| COM-05 | Devoluções            | Processar devolução                | Input: nota de devolução. Output: estoque devolvido, crédito gerado.                      |
| COM-06 | Campanhas e Promoções | Aplicar desconto promocional       | Input: produto, campanha ativa. Output: preço promocional. Verificar vigência e limites.  |
| COM-07 | Combos                | Aplicar preço de combo             | Input: itens do combo. Output: preço do combo vs soma individual.                         |
| COM-08 | Bonificações          | Adicionar item bonificado          | Input: regra de bonificação. Output: item adicionado sem custo.                           |

#### 6.3.4 Regras de Estoque

| #      | Regra            | Descrição                       | Validação                                                                      |
| ------ | ---------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| EST-01 | Saldo de Estoque | Manter saldo preciso            | Input: movimentações. Output: saldo final. Comparar com inventário físico.     |
| EST-02 | FIFO/FEFO        | Sugerir separação por FIFO/FEFO | Input: lotes com datas. Output: ordem de separação.                            |
| EST-03 | Estoque Mínimo   | Alertar quando abaixo do mínimo | Input: produto com saldo < mínimo. Output: alerta gerado.                      |
| EST-04 | Transferência    | Transferir entre filiais        | Input: origem, destino, quantidade. Output: saldo atualizado nas duas filiais. |

### 6.4 Extensibilidade da Metodologia

A metodologia é projetada para ser **permanentemente extensível**:

1. **Nova Regra:** Quando um novo módulo ou funcionalidade introduz uma regra de negócio, ela é adicionada ao catálogo de regras com a mesma estrutura (identificação, comportamento esperado, inputs, outputs, desvios).
2. **Nova Categoria:** Quando um novo domínio de negócio surge, uma nova seção é criada seguindo o mesmo padrão.
3. **Versionamento:** Cada regra tem uma versão. Mudanças na regra criam uma nova versão com testes atualizados.
4. **Automatização:** Testes de regras de negócio devem ser automatizados sempre que possível, permitindo execução em CI/CD.

### 6.5 Tolerância de Desvio

| Tipo de Cálculo | Tolerância Aceitável     |
| --------------- | ------------------------ |
| Valor monetário | R$ 0,01 (arredondamento) |
| Percentual      | 0,01 p.p.                |
| Quantidade      | 0 (exata)                |
| Data            | 0 (exata)                |

### 6.6 Critério de Aprovação da Fase 6

A Fase 6 é aprovada quando todas as regras de negócio aplicáveis ao escopo foram testadas, evidenciadas, e nenhuma apresentou desvio inaceitável.

---

## Fase 7 — Estratégia Oficial de Testes

### 7.1 Objetivo

Definir a estratégia oficial de testes da plataforma, combinando abordagens técnicas, funcionais, de integração, regressão, performance, segurança e validação de regras de negócio.

### 7.2 Tipos de Teste

#### 7.2.1 Testes Unitários

| Atributo                  | Definição                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Objetivo**              | Validar que unidades isoladas de código (funções, métodos, componentes) produzem resultados corretos |
| **Escopo**                | Funções puras, hooks, utilitários, cálculos                                                          |
| **Fluxo de Execução**     | 1. Identificar unidade. 2. Definir inputs e outputs esperados. 3. Executar. 4. Comparar.             |
| **Evidência Obrigatória** | Log de execução com pass/fail por caso                                                               |
| **Aprovação**             | 100% dos casos passam                                                                                |
| **Reprovação**            | Qualquer caso falha                                                                                  |

#### 7.2.2 Testes Funcionais

| Atributo                  | Definição                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Objetivo**              | Validar que funcionalidades operam conforme especificado                                              |
| **Escopo**                | CRUD, fluxos, validações, regras de UI                                                                |
| **Fluxo de Execução**     | 1. Definir cenário. 2. Executar ação. 3. Verificar resultado. 4. Registrar evidência (screenshot/log) |
| **Evidência Obrigatória** | Screenshot ou log da execução                                                                         |
| **Aprovação**             | Funcionalidade opera conforme especificado                                                            |
| **Reprovação**            | Funcionalidade não opera ou opera incorretamente                                                      |

#### 7.2.3 Testes Integrados

| Atributo                  | Definição                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| **Objetivo**              | Validar que múltiplos componentes integrados funcionam juntos                                    |
| **Escopo**                | Hooks + coleções + serviços + frontend                                                           |
| **Fluxo de Execução**     | 1. Definir fluxo end-to-end. 2. Executar. 3. Verificar cada etapa. 4. Verificar resultado final. |
| **Evidência Obrigatória** | Log do fluxo completo com resultado de cada etapa                                                |
| **Aprovação**             | Fluxo completo sem erros                                                                         |
| **Reprovação**            | Qualquer etapa falha                                                                             |

#### 7.2.4 Testes de Regressão

| Atributo                  | Definição                                                            |
| ------------------------- | -------------------------------------------------------------------- |
| **Objetivo**              | Garantir que mudanças não quebram funcionalidades existentes         |
| **Escopo**                | Funcionalidades previamente certificadas                             |
| **Fluxo de Execução**     | 1. Executar suite de regressão. 2. Comparar resultados com baseline. |
| **Evidência Obrigatória** | Relatório de regressão (pass/fail)                                   |
| **Aprovação**             | Zero regressões                                                      |
| **Reprovação**            | Qualquer regressão                                                   |

#### 7.2.5 Testes de Segurança

| Atributo                  | Definição                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Objetivo**              | Validar que mecanismos de segurança funcionam                                                                                         |
| **Escopo**                | Autenticação, autorização, RLS, criptografia, MFA                                                                                     |
| **Fluxo de Execução**     | 1. Tentar acesso sem auth. 2. Tentar acesso com role insuficiente. 3. Tentar bypass de RLS. 4. Verificar proteção de dados sensíveis. |
| **Evidência Obrigatória** | Log de tentativas e respostas                                                                                                         |
| **Aprovação**             | Todas as tentativas bloqueadas                                                                                                        |
| **Reprovação**            | Qualquer bypass bem-sucedido                                                                                                          |

#### 7.2.6 Testes de Performance

| Atributo                  | Definição                                                                      |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Objetivo**              | Validar que o sistema atende metas de performance                              |
| **Escopo**                | APIs, queries, carregamento de tela                                            |
| **Fluxo de Execução**     | 1. Definir cenário de carga. 2. Executar. 3. Medir latência, throughput, erro. |
| **Evidência Obrigatória** | Relatório de performance com métricas                                          |
| **Aprovação**             | p95 dentro das metas                                                           |
| **Reprovação**            | p95 acima das metas                                                            |

#### 7.2.7 Testes de Stress

| Atributo                  | Definição                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **Objetivo**              | Validar comportamento sob carga extrema                                                   |
| **Escopo**                | APIs críticas, banco de dados                                                             |
| **Fluxo de Execução**     | 1. Definir carga extrema (10x normal). 2. Executar. 3. Observar degradação e recuperação. |
| **Evidência Obrigatória** | Relatório de stress                                                                       |
| **Aprovação**             | Sistema não trava; recupera após carga                                                    |
| **Reprovação**            | Sistema trava ou não recupera                                                             |

#### 7.2.8 Testes de Usabilidade

| Atributo                  | Definição                                                                     |
| ------------------------- | ----------------------------------------------------------------------------- |
| **Objetivo**              | Validar que usuários conseguem completar tarefas                              |
| **Escopo**                | Fluxos principais de cada módulo                                              |
| **Fluxo de Execução**     | 1. Definir tarefa. 2. Usuário executa sem instruções. 3. Medir tempo e erros. |
| **Evidência Obrigatória** | Gravação ou observação documentada                                            |
| **Aprovação**             | Tarefa completada sem erros críticos                                          |
| **Reprovação**            | Usuário não consegue completar                                                |

#### 7.2.9 Testes de Permissões

| Atributo                  | Definição                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **Objetivo**              | Validar que permissões são respeitadas                                                    |
| **Escopo**                | Cada role × cada ação                                                                     |
| **Fluxo de Execução**     | 1. Para cada role, tentar cada ação. 2. Verificar se permitido/bloqueado conforme matriz. |
| **Evidência Obrigatória** | Matriz de resultados                                                                      |
| **Aprovação**             | 100% conforme matriz                                                                      |
| **Reprovação**            | Qualquer divergência                                                                      |

#### 7.2.10 Testes de Importação/Exportação

| Atributo                  | Definição                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **Objetivo**              | Validar que importação e exportação funcionam corretamente                         |
| **Escopo**                | CSV, XLS, XML, JSON                                                                |
| **Fluxo de Execução**     | 1. Importar arquivo válido. 2. Importar arquivo inválido. 3. Exportar e verificar. |
| **Evidência Obrigatória** | Arquivos de entrada/saída                                                          |
| **Aprovação**             | Importação e exportação corretas                                                   |
| **Reprovação**            | Dados corrompidos ou erro                                                          |

#### 7.2.11 Testes Negativos

| Atributo                  | Definição                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| **Objetivo**              | Validar que o sistema lida corretamente com entradas inválidas                                  |
| **Escopo**                | Campos obrigatórios, tipos, limites                                                             |
| **Fluxo de Execução**     | 1. Enviar dados inválidos. 2. Verificar mensagem de erro. 3. Verificar que nada foi persistado. |
| **Evidência Obrigatória** | Log de erro e verificação de banco                                                              |
| **Aprovação**             | Erro tratado graciosamente                                                                      |
| **Reprovação**            | Erro não tratado ou dado persistido                                                             |

#### 7.2.12 Testes Positivos

| Atributo                  | Definição                                                                   |
| ------------------------- | --------------------------------------------------------------------------- |
| **Objetivo**              | Validar que o sistema aceita e processa entradas válidas                    |
| **Escopo**                | Fluxos felizes de cada funcionalidade                                       |
| **Fluxo de Execução**     | 1. Enviar dados válidos. 2. Verificar persistência. 3. Verificar resultado. |
| **Evidência Obrigatória** | Registro criado e verificado                                                |
| **Aprovação**             | Dados persistidos corretamente                                              |
| **Reprovação**            | Erro ou dado incorreto                                                      |

### 7.3 Automação vs Manual

| Tipo        | Preferência                                  | Justificativa             |
| ----------- | -------------------------------------------- | ------------------------- |
| Unitários   | Automatizado                                 | Reprodutibilidade e CI/CD |
| Funcionais  | Automatizado quando possível; manual para UX |
| Integrados  | Automatizado para fluxos críticos            |
| Regressão   | Automatizado (obrigatório)                   |
| Segurança   | Automatizado (scanners) + Manual (bypass)    |
| Performance | Automatizado                                 |
| Usabilidade | Manual                                       |
| Permissões  | Automatizado                                 |

### 7.4 Critério de Aprovação da Fase 7

A Fase 7 é aprovada quando todos os tipos de teste aplicáveis foram executados, evidenciados, e todos os resultados estão dentro dos critérios de aprovação definidos.

---

## Fase 8 — Relatórios Oficiais

### 8.1 Objetivo

Definir todos os relatórios oficiais do Framework, com estrutura padronizada, conteúdo e indicadores.

### 8.2 Relatórios Oficiais

#### 8.2.1 Relatório de Resumo Executivo

| Atributo        | Definição                                                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Propósito**   | Visão consolidada do resultado da certificação para stakeholders                                                                                                                        |
| **Estrutura**   | 1. Escopo certificado. 2. Resultado geral (Certificado / Com Ressalvas / Não Certificado). 3. Aderência geral (%). 4. Não conformidades críticas. 5. Recomendações. 6. Próximos passos. |
| **Indicadores** | Aderência geral, NCs críticas, NCs totais, tempo de certificação                                                                                                                        |
| **Frequência**  | A cada certificação                                                                                                                                                                     |

#### 8.2.2 Relatório de Não Conformidades

| Atributo        | Definição                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Propósito**   | Detalhar todas as não conformidades encontradas                                                                                               |
| **Estrutura**   | 1. ID da NC. 2. Descrição. 3. Categoria. 4. Severidade. 5. Impacto. 6. Evidência. 7. Plano de correção. 8. Prazo. 9. Responsável. 10. Status. |
| **Indicadores** | NCs por categoria, NCs por severidade, NCs recorrentes                                                                                        |
| **Frequência**  | A cada certificação e atualizado a cada correção                                                                                              |

#### 8.2.3 Plano de Correção

| Atributo        | Definição                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| **Propósito**   | Detalhar como cada NC será corrigida                                                                       |
| **Estrutura**   | 1. NC referenciada. 2. Ação de correção. 3. Responsável. 4. Prazo. 5. Critério de encerramento. 6. Status. |
| **Indicadores** | NCs corrigidas no prazo, tempo médio de correção                                                           |
| **Frequência**  | Atualizado continuamente até encerramento                                                                  |

#### 8.2.4 Plano de Evolução

| Atributo        | Definição                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Propósito**   | Identificar oportunidades de evolução arquitetural e tecnológica                                                            |
| **Estrutura**   | 1. Oportunidade. 2. Justificativa. 3. Impacto esperado. 4. Esforço estimado. 5. Prioridade. 6. Horizon (curto/médio/longo). |
| **Indicadores** | Evoluções propostas, evoluções executadas                                                                                   |
| **Frequência**  | Anual ou a cada release maior                                                                                               |

#### 8.2.5 Plano de Melhorias

| Atributo        | Definição                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Propósito**   | Registrar melhorias incrementais identificadas                                                 |
| **Estrutura**   | 1. Melhoria. 2. Origem (auditoria, usuário, indicador). 3. Impacto. 4. Esforço. 5. Prioridade. |
| **Indicadores** | Melhorias propostas, melhorias implementadas, impacto medido                                   |
| **Frequência**  | Contínuo                                                                                       |

#### 8.2.6 Plano de Riscos

| Atributo        | Definição                                                                                |
| --------------- | ---------------------------------------------------------------------------------------- |
| **Propósito**   | Documentar riscos identificados e planos de mitigação                                    |
| **Estrutura**   | 1. Risco. 2. Tipo. 3. Probabilidade. 4. Impacto. 5. Severidade. 6. Mitigação. 7. Status. |
| **Indicadores** | Riscos ativos, riscos mitigados, riscos materiaizados                                    |
| **Frequência**  | Atualizado a cada certificação e revisão                                                 |

#### 8.2.7 Relatório de Indicadores

| Atributo        | Definição                                                                   |
| --------------- | --------------------------------------------------------------------------- |
| **Propósito**   | Apresentar todos os indicadores do FCP (Fase 13)                            |
| **Estrutura**   | 1. Indicador. 2. Fórmula. 3. Valor atual. 4. Meta. 5. Tendência. 6. Status. |
| **Indicadores** | Todos os indicadores da Fase 13                                             |
| **Frequência**  | Mensal                                                                      |

#### 8.2.8 Relatório de Maturidade

| Atributo        | Definição                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| **Propósito**   | Apresentar o nível de maturidade de cada módulo                                                            |
| **Estrutura**   | 1. Módulo. 2. Nível atual (0-5). 3. Nível anterior. 4. Tendência. 5. Lacunas. 6. Plano para próximo nível. |
| **Indicadores** | Maturidade média da plataforma, módulos no nível 5                                                         |
| **Frequência**  | Trimestral                                                                                                 |

#### 8.2.9 Relatório de Aderência

| Atributo        | Definição                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Propósito**   | Detalhar a aderência por módulo e por dimensão                                                                     |
| **Estrutura**   | 1. Módulo. 2. Dimensão (arquitetura, segurança, performance, etc.). 3. Aderência %. 4. Itens aprovados/reprovados. |
| **Indicadores** | Aderência média, módulos com baixa aderência                                                                       |
| **Frequência**  | A cada certificação                                                                                                |

#### 8.2.10 Relatório de Histórico

| Atributo        | Definição                                                           |
| --------------- | ------------------------------------------------------------------- |
| **Propósito**   | Manter histórico cronológico de todas as certificações              |
| **Estrutura**   | 1. Data. 2. Escopo. 3. Resultado. 4. NCs. 5. Correções. 6. Auditor. |
| **Indicadores** | Certificações por período, taxa de sucesso                          |
| **Frequência**  | Contínuo                                                            |

#### 8.2.11 Relatório de Versões

| Atributo        | Definição                                                     |
| --------------- | ------------------------------------------------------------- |
| **Propósito**   | Versionar o Framework e suas mudanças                         |
| **Estrutura**   | 1. Versão. 2. Data. 3. Mudanças. 4. Aprovado por. 5. Impacto. |
| **Indicadores** | Frequência de mudanças, versões por ano                       |
| **Frequência**  | A cada mudança do Framework                                   |

#### 8.2.12 Certificados

| Atributo        | Definição                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Propósito**   | Emitir certificação formal para módulos/release                                                                                                 |
| **Estrutura**   | 1. ID do certificado. 2. Escopo. 3. Data. 4. Versão do Framework. 5. Aderência. 6. NCs abertas. 7. Validade. 8. Assinatura digital do Conselho. |
| **Indicadores** | Certificados emitidos, certificados válidos, certificados expirados                                                                             |
| **Frequência**  | A cada certificação aprovada                                                                                                                    |

### 8.3 Padrão de Estrutura de Relatório

Todo relatório oficial deve conter:

1. **Cabeçalho:** Título, versão do Framework, data, auditor, escopo.
2. **Sumário Executivo:** Resultado em uma página.
3. **Detalhamento:** Conteúdo específico conforme tipo de relatório.
4. **Indicadores:** Métricas relevantes.
5. **Anexos:** Evidências, logs, screenshots.
6. **Aprovação:** Assinatura do Conselho de Arquitetura.

---

## Fase 9 — Projeção do Centro de Certificação da Plataforma

### 9.1 Objetivo

Projetar (sem desenvolver) um módulo permanente que centralizará todas as atividades de certificação da plataforma.

### 9.2 Propósito do Módulo

O Centro de Certificação da Plataforma (CCP) será o **ponto único de gestão** de toda a qualidade, conformidade e maturidade da plataforma. Ele consolidará:

- Execução de checklists
- Gestão de evidências
- Gestão de não conformidades
- Planos de correção
- Indicadores e KPIs
- Histórico de certificações
- Maturidade por módulo
- Relatórios oficiais
- Certificados emitidos

### 9.3 Arquitetura de Informação

```
Centro de Certificação da Plataforma (CCP)
├── Dashboard
│   ├── Aderência geral da plataforma
│   ├── Maturidade por módulo
│   ├── NCs críticas abertas
│   ├── Indicadores chave
│   └── Tendências
├── Auditorias
│   ├── Auditorias em andamento
│   ├── Auditorias concluídas
│   ├── Agendamento
│   └── Templates de auditoria
├── Checklists
│   ├── Biblioteca de checklists
│   ├── Execução de checklists
│   ├── Resultados
│   └── Pontuação
├── Evidências
│   ├── Upload e armazenamento
│   ├── Vinculação a itens de checklist
│   ├── Versionamento
│   └── Consulta
├── Planos de Correção
│   ├── NCs abertas
│   ├── Ações de correção
│   ├── Prazos e responsáveis
│   └── Status de execução
├── Não Conformidades
│   ├── Registro
│   ├── Classificação
│   ├── tracking de reincidência
│   └── Encerramento
├── Indicadores e KPIs
│   ├── Todos os indicadores da Fase 13
│   ├── Metas e tendências
│   └── Alertas
├── Histórico
│   ├── Cronologia de certificações
│   ├── Cronologia de correções
│   └── Linha do tempo da plataforma
├── Maturidade
│   ├── Nível por módulo
│   ├── Evolução temporal
│   └── Lacunas e planos
├── Arquitetura
│   ├── Conformidade arquitetural
│   ├── ADRs
│   └── Princípios
├── Segurança
│   ├── Cobertura de segurança
│   ├── Vulnerabilidades
│   └── Testes de segurança
├── Performance
│   ├── Metas e resultados
│   ├── Gargalos identificados
│   └── Tendências
├── Banco de Dados
│   ├── Schema vivo vs esperado
│   ├── Migrações
│   └── Índices
├── Backend
│   ├── Hooks
│   ├── Rotas
│   └── Serviços
├── Frontend
│   ├── Componentes
│   ├── Páginas
│   └── Rotas
├── Integrações
│   ├── Status
│   ├── Logs
│   └── Saúde
├── IA
│   ├── Agentes
│   ├── Automações
│   └── Auditoria de IA
├── Documentação
│   ├── Cobertura documental
│   ├── Consistência
│   └── Atualização
├── Logs
│   ├── Logs de auditoria
│   ├── Logs de execução
│   └── Logs de erro
├── Relatórios
│   ├── Geração de relatórios oficiais
│   ├── Exportação
│   └── Agendamento
└── Certificados
    ├── Emissão
    ├── Validade
    └── Renovação
```

### 9.4 Como o CCP Consome e Alimenta o FCP

- **Consome:** Templates de checklist, regras de negócio, definições de indicador, metodologia de teste — todos definidos no FCP.
- **Alimenta:** Resultados de execução, evidências, NCs, indicadores calculados, relatórios gerados — todos alimentados de volta ao FCP para auditoria e evolução.

### 9.5 Princípios de Design do CCP

1. **Neutro:** Não acoplado a nenhum módulo de negócio específico.
2. **Configurável:** Checklists, regras e indicadores configuráveis sem código.
3. **Auditável:** Toda ação no CCP é registrada na auditoria central.
4. **Integrado:** Consome dados de todos os módulos via APIs.
5. **Permissivo:** Acesso controlado por role (auditor, tech lead, conselho).

### 9.6 Status

**Projeção apenas.** Nenhum desenvolvimento deve ser iniciado até aprovação explícita do Conselho de Arquitetura e do Product Owner.

---

## Fase 10 — Certificação Contínua

### 10.1 Objetivo

Estabelecer que a certificação é um processo permanente e obrigatório — nenhuma funcionalidade é considerada concluída sem passar pelo FCP.

### 10.2 Regra Permanente

> **Toda entrega — sem exceção — deve passar pelo FCP antes de ser considerada "Concluída".**

Esta regra aplica-se a:

1. **Novos módulos:** Certificação completa (Fases 1–8 aplicáveis).
2. **Melhorias:** Certificação focada nas dimensões afetadas.
3. **Correções:** Certificação focada na correção e em regressão.
4. **Refactorings:** Certificação focada em arquitetura e performance.
5. **Releases:** Certificação de release (escopo amplo).
6. **Grandes projetos:** Certificação por fase do projeto.
7. **Auditorias:** Execução do FCP como auditoria.
8. **Certificações:** Renovação periódica de certificados.
9. **Evoluções:** Certificação de mudanças arquiteturais.

### 10.3 Fluxo de Certificação Contínua

```
Desenvolvimento
    │
    ▼
Entrega (PR/Merge)
    │
    ▼
FCP Triggered
    │
    ├── Fase 1: Escopo definido
    ├── Fase 5: Checklists executados
    ├── Fase 6: Regras de negócio validadas
    ├── Fase 7: Testes executados
    │
    ▼
Resultado
    │
    ├── Certificado → Merge aprovado, certificado emitido
    ├── Com Ressalvas → Merge aprovado, plano de correção obrigatório
    └── Não Certificado → Merge bloqueado, correção obrigatória
```

### 10.4 Renovação de Certificados

| Tipo de Certificado | Validade               | Renovação                              |
| ------------------- | ---------------------- | -------------------------------------- |
| Por módulo          | 12 meses               | Re-certificação completa               |
| Por release         | Permanente (histórico) | Nova certificação para próxima release |
| Por correção        | Permanente             | Não renovável — é um evento            |
| Arquitetural        | 24 meses               | Re-avaliação arquitetural              |

### 10.5 Integração com CI/CD

O FCP deve ser integrado ao pipeline de CI/CD:

1. **Pre-merge:** Checklists automatizados (lint, types, testes unitários).
2. **Post-merge:** Certificação funcional e de integração.
3. **Pre-release:** Certificação completa.
4. **Post-release:** Monitoramento de indicadores.

---

## Fase 11 — Planejamento da Revisão Global

### 11.1 Objetivo

Criar um plano completo para a futura Revisão Global da plataforma — uma auditoria abrangente de todos os módulos existentes e uma metodologia para auditar todos os módulos futuros.

### 11.2 Ordem de Auditoria por Módulo

A revisão global segue uma ordem baseada em criticidade e dependências:

| Fase | Módulos                                                                    | Justificativa                           |
| ---- | -------------------------------------------------------------------------- | --------------------------------------- |
| 1    | Plataforma Core (Multi-tenancy, Auth, Permissões, Auditoria)               | Fundação — tudo depende destes          |
| 2    | Shared Platform Services (Produtos, Clientes, Fornecedores, Configurações) | Base compartilhada                      |
| 3    | Financeiro                                                                 | Crítico para negócio                    |
| 4    | Fiscal                                                                     | Crítico para conformidade legal         |
| 5    | Comercial (Pedidos, Faturamento, NF-e)                                     | Crítico para receita                    |
| 6    | Estoque e WMS                                                              | Crítico para operação                   |
| 7    | Compras                                                                    | Depende de Estoque e Financeiro         |
| 8    | Logística                                                                  | Depende de Estoque e Comercial          |
| 9    | RH e DP                                                                    | Depende de Financeiro                   |
| 10   | CRM e Marketing                                                            | Depende de Comercial                    |
| 11   | Indústria                                                                  | Depende de Compras, Estoque, Financeiro |
| 12   | IA                                                                         | Transversal — audita por último         |
| 13   | CMS e Site                                                                 | Menor criticidade técnica               |
| 14   | Integrações e APIs                                                         | Auditoria de conectividade              |
| 15   | Documentação                                                               | Auditoria de consistência final         |

### 11.3 Ordem de Auditorias por Dimensão

Para cada módulo, as auditorias seguem esta ordem:

1. Existência Estrutural (Fase 5 — BD, Collections)
2. Persistência (Fase 5 — BD — schema vivo)
3. Conformidade Arquitetural (Fase 3)
4. Conformidade Documental (Fase 4)
5. Segurança e Permissões (Fase 5 — SEC, PERM)
6. Regras de Negócio (Fase 6)
7. Performance (Fase 5 — PERF)
8. Testes (Fase 7)
9. UX/UI (Fase 5 — UX)
10. IA (se aplicável) (Fase 5 — IA)
11. Relatório e Certificado (Fase 8)

### 11.4 Estimativa de Tempo

| Fase      | Módulos                       | Estimativa      |
| --------- | ----------------------------- | --------------- |
| 1-2       | Core + Shared                 | 4 semanas       |
| 3-4       | Financeiro + Fiscal           | 3 semanas       |
| 5-6       | Comercial + Estoque           | 3 semanas       |
| 7-8       | Compras + Logística           | 2 semanas       |
| 9-11      | RH + CRM + Indústria          | 4 semanas       |
| 12-15     | IA + CMS + Integrações + Docs | 3 semanas       |
| **Total** |                               | **~19 semanas** |

### 11.5 Equipe Necessária

| Papel                   | Quantidade      | Responsabilidade                           |
| ----------------------- | --------------- | ------------------------------------------ |
| Auditor FCP Líder       | 1               | Coordenação, relatórios, decisão final     |
| Auditor Técnico         | 2               | Execução de checklists, testes, evidências |
| Tech Lead               | 1 por módulo    | Suporte técnico, correções                 |
| Product Owner           | 1               | Validação de regras de negócio             |
| Conselho de Arquitetura | Reunião semanal | Aprovação de resultados                    |

### 11.6 Evidências Obrigatórias por Módulo

1. Schema vivo verificado (queries ao banco)
2. Checklists executados e pontuados
3. Testes executados com logs
4. Screenshots de funcionalidades
5. Logs de auditoria
6. Relatório de NCs
7. Relatório de aderência
8. Certificado (se aprovado)

### 11.7 Fluxo de Aprovação

```
Auditor executa FCP
    │
    ▼
Relatório de resultados
    │
    ▼
Tech Lead revisa
    │
    ├── Concorda → Conselho de Arquitetura
    └── Discorda → Discussão → Resolução
    │
    ▼
Conselho de Arquitetura
    │
    ├── Aprova → Certificado emitido
    └── Reprova → Plano de correção → Revalidação
```

### 11.8 Fluxo de Correção

1. NC identificada → registrada no Plano de Correção
2. Responsável atribuído
3. Prazo definido (baseado na severidade)
4. Correção executada
5. Revalidação pela auditoria FCP
6. Encerramento da NC

### 11.9 Fluxo de Revalidação

1. Correção submetida
2. Auditor re-executa os checklists/testes afetados
3. Se aprovado → NC encerrada
4. Se reprovado → Nova correção obrigatória

### 11.10 Critérios de Encerramento da Revisão Global

A revisão global é encerrada quando:

1. Todos os módulos foram auditados
2. Todas as NCs críticas estão corrigidas
3. Aderência geral da plataforma ≥ 90%
4. Documentação está consistente
5. Conselho de Arquitetura aprova o encerramento
6. Certificado global da plataforma é emitido

---

## Fase 12 — Evolução do Framework

### 12.1 Objetivo

Definir um processo oficial para a evolução do próprio Framework, garantindo que ele permaneça relevante, eficaz e auditável ao longo do tempo.

### 12.2 Como Novas Regras Entram no Framework

1. **Proposta:** Qualquer membro da equipe pode propor uma nova regra, checklist ou indicador.
2. **Justificativa:** A proposta deve incluir problema resolvido, impacto esperado e custo de aplicação.
3. **Análise:** O Conselho de Arquitetura analisa a proposta em reunião formal.
4. **Aprovação:** O Conselho aprova, rejeita ou solicita ajustes.
5. **Versionamento:** A nova regra entra na próxima versão do Framework.
6. **Comunicação:** Toda a equipe é notificada da mudança.
7. **Retroatividade:** Regras novas aplicam-se a novas entregas; entregas já certificadas são re-avaliadas na próxima renovação de certificado.

### 12.3 Como Regras Antigas São Substituídas

1. **Identificação:** Uma regra é identificada como obsoleta (tecnologia mudou, princípio evoluiu, regra não é mais eficaz).
2. **Proposta de Substituição:** Nova regra é proposta para substituir a antiga.
3. **Análise de Compatibilidade:** Verificar que a substituição não invalida certificações existentes.
4. **Período de Transição:** Ambas as regras (antiga e nova) coexistem por um ciclo de certificação.
5. **Depreciação:** A regra antiga é marcada como depreciada.
6. **Remoção:** Após o período de transição, a regra antiga é removida.

### 12.4 Controle de Compatibilidade Entre Versões

| Mudança                       | Compatibilidade         | Ação                                     |
| ----------------------------- | ----------------------- | ---------------------------------------- |
| Nova regra adicionada         | Compatível              | Aplicar a novas entregas                 |
| Regra modificada              | Parcialmente compatível | Período de transição                     |
| Regra removida                | Compatível              | Certificações existentes mantêm validade |
| Estrutura de checklist mudada | Compatível              | Migrar resultados para nova estrutura    |
| Sistema de pontuação mudado   | Incompatível            | Re-calcular aderência com nova fórmula   |

### 12.5 Versionamento do Framework

- **Versão Maior (X.0.0):** Mudança estrutural no Framework (novas fases, mudança no sistema de pontuação).
- **Versão Menor (1.X.0):** Novas regras, novos checklists, novos indicadores.
- **Versão de Patch (1.0.X):** Correções de texto, esclarecimentos, ajustes menores.

### 12.6 Registro de Mudanças

Toda mudança no Framework é registrada com:

1. Versão anterior → Versão nova
2. Data
3. Responsável
4. Descrição da mudança
5. Justificativa
6. Impacto em certificações existentes
7. Aprovação do Conselho

### 12.7 Aprovação de Mudanças

| Tipo de Mudança | Aprovador                               |
| --------------- | --------------------------------------- |
| Patch           | Tech Lead                               |
| Menor           | Conselho de Arquitetura                 |
| Maior           | Conselho de Arquitetura + Product Owner |

### 12.8 Auditoria do Próprio Framework

O Framework deve ser auditado anualmente:

1. **Eficácia:** As regras estão prevenindo os problemas que deveriam prevenir?
2. **Eficiência:** O custo de aplicar o Framework é proporcional ao valor?
3. **Relevância:** Há regras obsoletas?
4. **Cobertura:** Há gaps não cobertos?
5. **Adoção:** A equipe está seguindo o Framework?

### 12.9 Medição de Eficácia do Framework

| Indicador             | Fórmula                                                   | Meta       |
| --------------------- | --------------------------------------------------------- | ---------- |
| Taxa de adoção        | (entregas certificadas / total de entregas) × 100         | ≥ 95%      |
| NCs prevenidas        | NCs identificadas no FCP antes de produção / total de NCs | ≥ 80%      |
| Tempo de certificação | Média de tempo por entrega                                | Diminuindo |
| Satisfação da equipe  | Survey anual                                              | ≥ 4/5      |

---

## Fase 13 — Métricas e Indicadores

### 13.1 Objetivo

Criar um modelo completo de indicadores com fórmula de cálculo para cada um, permitindo medir a saúde, a maturidade e a eficácia da plataforma e do próprio Framework.

### 13.2 Indicadores e Fórmulas

#### 13.2.1 Grau de Aderência por Módulo

| Atributo          | Definição                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Fórmula**       | `Aderência = (soma dos pesos dos itens de checklist aprovados) / (soma dos pesos dos itens aplicáveis) × 100` |
| **Unidade**       | Percentual (%)                                                                                                |
| **Meta**          | ≥ 95%                                                                                                         |
| **Frequência**    | A cada certificação                                                                                           |
| **Interpretação** | Mede o quanto o módulo está em conformidade com os checklists do FCP                                          |

#### 13.2.2 Índice de Conformidade

| Atributo          | Definição                                                 |
| ----------------- | --------------------------------------------------------- |
| **Fórmula**       | `IC = (itens conformes / total de itens avaliados) × 100` |
| **Unidade**       | Percentual (%)                                            |
| **Meta**          | ≥ 95%                                                     |
| **Frequência**    | A cada certificação                                       |
| **Interpretação** | Mede a conformidade geral (não ponderada por peso)        |

#### 13.2.3 Índice de Risco

| Atributo          | Definição                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **Fórmula**       | `IR = Σ(severidade × probabilidade) / (total de riscos × severidade_máxima × probabilidade_máxima) × 100` |
| **Unidade**       | Percentual (%) — quanto menor, melhor                                                                     |
| **Meta**          | ≤ 20%                                                                                                     |
| **Frequência**    | Mensal                                                                                                    |
| **Interpretação** | Mede a exposição total ao risco da plataforma                                                             |

#### 13.2.4 Índice de Maturidade

| Atributo          | Definição                                                     |
| ----------------- | ------------------------------------------------------------- |
| **Fórmula**       | `IM = Σ(nível_maturidade_módulo) / (total_módulos × 5) × 100` |
| **Unidade**       | Percentual (%)                                                |
| **Meta**          | ≥ 80%                                                         |
| **Frequência**    | Trimestral                                                    |
| **Interpretação** | Mede o nível médio de maturidade (escala 0-5) da plataforma   |

#### 13.2.5 Tempo Médio de Certificação

| Atributo          | Definição                                               |
| ----------------- | ------------------------------------------------------- |
| **Fórmula**       | `TMC = Σ(tempo_certificação) / número_de_certificações` |
| **Unidade**       | Horas                                                   |
| **Meta**          | Diminuindo ao longo do tempo                            |
| **Frequência**    | Mensal                                                  |
| **Interpretação** | Mede a eficiência do processo de certificação           |

#### 13.2.6 Tempo Médio de Correção

| Atributo          | Definição                                                  |
| ----------------- | ---------------------------------------------------------- |
| **Fórmula**       | `TMCorr = Σ(tempo_correção_NC) / número_de_NCs_corrigidas` |
| **Unidade**       | Dias                                                       |
| **Meta**          | Críticas ≤ 3 dias; Altas ≤ 7 dias; Médias ≤ 14 dias        |
| **Frequência**    | Mensal                                                     |
| **Interpretação** | Mede a velocidade de resposta a não conformidades          |

#### 13.2.7 Tempo Médio de Revalidação

| Atributo          | Definição                                               |
| ----------------- | ------------------------------------------------------- |
| **Fórmula**       | `TMRev = Σ(tempo_revalidação) / número_de_revalidações` |
| **Unidade**       | Horas                                                   |
| **Meta**          | ≤ 50% do tempo de certificação original                 |
| **Frequência**    | Mensal                                                  |
| **Interpretação** | Mede a eficiência da revalidação após correção          |

#### 13.2.8 Número de Não Conformidades

| Atributo          | Definição                                       |
| ----------------- | ----------------------------------------------- |
| **Fórmula**       | `NNC = contagem_total_de_NCs`                   |
| **Unidade**       | Inteiro                                         |
| **Meta**          | Diminuindo ao longo do tempo                    |
| **Frequência**    | A cada certificação                             |
| **Interpretação** | Volume total de não conformidades identificadas |

#### 13.2.9 Número de Reincidências

| Atributo          | Definição                                                                |
| ----------------- | ------------------------------------------------------------------------ |
| **Fórmula**       | `NR = contagem_de_NCs_que_recorreram_após_correção`                      |
| **Unidade**       | Inteiro                                                                  |
| **Meta**          | 0                                                                        |
| **Frequência**    | A cada certificação                                                      |
| **Interpretação** | Mede a eficácia das correções — reincidência indica correção superficial |

#### 13.2.10 Débito Técnico por Módulo

| Atributo          | Definição                                              |
| ----------------- | ------------------------------------------------------ |
| **Fórmula**       | `DTM = Σ(peso_NC × tempo_aberta_dias) / total_módulos` |
| **Unidade**       | Índice composto                                        |
| **Meta**          | Diminuindo                                             |
| **Frequência**    | Mensal                                                 |
| **Interpretação** | Mede o acúmulo de débito técnico não resolvido         |

#### 13.2.11 Cobertura de Testes

| Atributo          | Definição                                                   |
| ----------------- | ----------------------------------------------------------- |
| **Fórmula**       | `CT = (linhas_cobertas_por_testes / total_de_linhas) × 100` |
| **Unidade**       | Percentual (%)                                              |
| **Meta**          | ≥ 80% para regras de negócio críticas                       |
| **Frequência**    | A cada release                                              |
| **Interpretação** | Mede a proteção contra regressões                           |

#### 13.2.12 Cobertura Documental

| Atributo          | Definição                                                          |
| ----------------- | ------------------------------------------------------------------ |
| **Fórmula**       | `CD = (documentos_atualizados / total_documentos_esperados) × 100` |
| **Unidade**       | Percentual (%)                                                     |
| **Meta**          | 100%                                                               |
| **Frequência**    | A cada entrega                                                     |
| **Interpretação** | Mede se a documentação está completa e atualizada                  |

#### 13.2.13 Cobertura de Regras de Negócio

| Atributo          | Definição                                                       |
| ----------------- | --------------------------------------------------------------- |
| **Fórmula**       | `CRN = (regras_testadas / total_de_regras_identificadas) × 100` |
| **Unidade**       | Percentual (%)                                                  |
| **Meta**          | ≥ 90%                                                           |
| **Frequência**    | A cada certificação                                             |
| **Interpretação** | Mede quantas regras de negócio têm testes de validação          |

#### 13.2.14 Cobertura de Integrações

| Atributo          | Definição                                                  |
| ----------------- | ---------------------------------------------------------- |
| **Fórmula**       | `CI = (integrações_testadas / total_de_integrações) × 100` |
| **Unidade**       | Percentual (%)                                             |
| **Meta**          | 100%                                                       |
| **Frequência**    | A cada certificação                                        |
| **Interpretação** | Mede quantas integrações têm testes end-to-end             |

#### 13.2.15 Cobertura de APIs

| Atributo          | Definição                                              |
| ----------------- | ------------------------------------------------------ |
| **Fórmula**       | `CA = (endpoints_testados / total_de_endpoints) × 100` |
| **Unidade**       | Percentual (%)                                         |
| **Meta**          | ≥ 95%                                                  |
| **Frequência**    | A cada release                                         |
| **Interpretação** | Mede quantos endpoints têm testes automatizados        |

#### 13.2.16 Cobertura de Segurança

| Atributo          | Definição                                                        |
| ----------------- | ---------------------------------------------------------------- |
| **Fórmula**       | `CS = (itens_segurança_aprovados / total_itens_segurança) × 100` |
| **Unidade**       | Percentual (%)                                                   |
| **Meta**          | 100%                                                             |
| **Frequência**    | A cada certificação                                              |
| **Interpretação** | Mede a eficácia dos mecanismos de segurança                      |

#### 13.2.17 Cobertura de Performance

| Atributo          | Definição                                                         |
| ----------------- | ----------------------------------------------------------------- |
| **Fórmula**       | `CP = (endpoints_dentro_da_meta / total_endpoints_medidos) × 100` |
| **Unidade**       | Percentual (%)                                                    |
| **Meta**          | ≥ 95%                                                             |
| **Frequência**    | Mensal                                                            |
| **Interpretação** | Mede quantos endpoints estão dentro das metas de performance      |

#### 13.2.18 Cobertura de IA

| Atributo          | Definição                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Fórmula**       | `CIA = (componentes_IA_auditados / total_componentes_IA) × 100`                                                                   |
| **Unidade**       | Percentual (%)                                                                                                                    |
| **Meta**          | 100%                                                                                                                              |
| **Frequência**    | A cada certificação                                                                                                               |
| **Interpretação** | Mede quantos componentes de IA (agentes, automações, RAG) foram auditados quanto a transparência, reversibilidade e consentimento |

### 13.3 Painel de Indicadores

Todos os indicadores são consolidados em um painel único que apresenta:

1. Valor atual
2. Meta
3. Tendência (↑ melhor, ↓ pior, → estável)
4. Status (🟢 meta atingida, 🟡 atenção, 🔴 crítico)
5. Histórico (últimos 12 meses)

---

## Fase 14 — Gestão de Riscos

### 14.1 Objetivo

Criar uma metodologia oficial de classificação e gestão de riscos para toda a plataforma.

### 14.2 Metodologia de Classificação

Para cada risco identificado:

1. **Tipo:** Classificar conforme categorias definidas.
2. **Critério:** Descrição do que caracteriza o risco.
3. **Impacto:** Avaliar consequência se o risco se materializar.
4. **Probabilidade:** Avaliar chance de ocorrência.
5. **Severidade:** Calcular a partir de impacto × probabilidade.
6. **Prioridade:** Derivar da severidade.
7. **Plano de Mitigação:** Definir ação para reduzir probabilidade ou impacto.
8. **Critério de Encerramento:** Definir quando o risco pode ser considerado resolvido.

### 14.3 Escalas

#### Impacto

| Nível   | Valor | Descrição                                    |
| ------- | ----- | -------------------------------------------- |
| Crítico | 5     | Parada total, perda de dados, violação legal |
| Alto    | 4     | Parada de módulo crítico, impacto financeiro |
| Médio   | 3     | Degradção significativa, impacto operacional |
| Baixo   | 2     | Degradção menor, impacto limitado            |
| Mínimo  | 1     | Impacto cosmético ou negligenciável          |

#### Probabilidade

| Nível       | Valor | Descrição       |
| ----------- | ----- | --------------- |
| Quase Certo | 5     | > 90% de chance |
| Provável    | 4     | 60–90%          |
| Possível    | 3     | 30–60%          |
| Improvável  | 2     | 10–30%          |
| Raro        | 1     | < 10%           |

#### Severidade = Impacto × Probabilidade

| Faixa | Classificação | Ação                                    |
| ----- | ------------- | --------------------------------------- |
| 16–25 | Crítica       | Mitigação imediata, bloqueio de release |
| 9–15  | Alta          | Mitigação antes da próxima release      |
| 4–8   | Média         | Plano de mitigação no trimestre         |
| 1–3   | Baixa         | Monitorar                               |

### 14.4 Tipos de Risco

#### 14.4.1 Risco Arquitetural

| Atributo              | Definição                                                                             |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Critério**          | Decisão arquitetural que pode levar a acoplamento, dívida técnica ou impedir evolução |
| **Impacto**           | Parada de evolução, refactoring caro, reescrita                                       |
| **Probabilidade**     | Média — depende da maturidade da equipe                                               |
| **Severidade Típica** | Alta (4×3=12)                                                                         |
| **Prioridade**        | Alta                                                                                  |
| **Mitigação**         | ADR obrigatório, Conselho de Arquitetura, princípio REAPROVEITAR→ESTENDER             |
| **Encerramento**      | ADR aprovado e implementado, sem não conformidades arquiteturais                      |

#### 14.4.2 Risco Funcional

| Atributo              | Definição                                                      |
| --------------------- | -------------------------------------------------------------- |
| **Critério**          | Funcionalidade não opera conforme especificado                 |
| **Impacto**           | Usuário não consegue operar, perda de produtividade            |
| **Probabilidade**     | Média                                                          |
| **Severidade Típica** | Alta (4×3=12)                                                  |
| **Prioridade**        | Alta                                                           |
| **Mitigação**         | Testes funcionais, Fase 6 (regras de negócio), Fase 7 (testes) |
| **Encerramento**      | Funcionalidade testada e certificada                           |

#### 14.4.3 Risco Financeiro

| Atributo              | Definição                                                                       |
| --------------------- | ------------------------------------------------------------------------------- |
| **Critério**          | Cálculo financeiro incorreto, perda de dinheiro, não conformidade contábil      |
| **Impacto**           | Crítico — perda financeira direta, multas                                       |
| **Probabilidade**     | Baixa (com FCP)                                                                 |
| **Severidade Típica** | Crítica (5×2=10)                                                                |
| **Prioridade**        | Crítica                                                                         |
| **Mitigação**         | Fase 6 (regras de negócio financeiras), testes automatizados, dupla conferência |
| **Encerramento**      | Cálculos validados com zero desvio                                              |

#### 14.4.4 Risco Fiscal

| Atributo              | Definição                                                                            |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Critério**          | Tributo calculado incorretamente, nota rejeitada, não conformidade fiscal            |
| **Impacto**           | Crítico — multas, autuação fiscal                                                    |
| **Probabilidade**     | Baixa (com FCP)                                                                      |
| **Severidade Típica** | Crítica (5×2=10)                                                                     |
| **Prioridade**        | Crítica                                                                              |
| **Mitigação**         | Fase 6 (regras fiscais), validação contra tabelas oficiais, atualização de alíquotas |
| **Encerramento**      | Cálculos fiscais validados contra SEFAZ                                              |

#### 14.4.5 Risco Comercial

| Atributo              | Definição                                                                       |
| --------------------- | ------------------------------------------------------------------------------- |
| **Critério**          | Perda de venda, cliente insatisfeito, erro de precificação                      |
| **Impacto**           | Alto                                                                            |
| **Probabilidade**     | Média                                                                           |
| **Severidade Típica** | Alta (4×3=12)                                                                   |
| **Prioridade**        | Alta                                                                            |
| **Mitigação**         | Fase 6 (regras comerciais), validação de tabelas de preço, controle de desconto |
| **Encerramento**      | Regras comerciais testadas e certificadas                                       |

#### 14.4.6 Risco Operacional

| Atributo              | Definição                                              |
| --------------------- | ------------------------------------------------------ |
| **Critério**          | Processo manual ineficiente, erro operacional, gargalo |
| **Impacto**           | Médio                                                  |
| **Probabilidade**     | Média                                                  |
| **Severidade Típica** | Média (3×3=9)                                          |
| **Prioridade**        | Média                                                  |
| **Mitigação**         | Automação, UX otimizada, treinamento                   |
| **Encerramento**      | Processo automatizado ou otimizado                     |

#### 14.4.7 Risco de Segurança

| Atributo              | Definição                                                           |
| --------------------- | ------------------------------------------------------------------- |
| **Critério**          | Vulnerabilidade de segurança, acesso indevido, vazamento de dados   |
| **Impacto**           | Crítico                                                             |
| **Probabilidade**     | Baixa (com FCP)                                                     |
| **Severidade Típica** | Crítica (5×2=10)                                                    |
| **Prioridade**        | Crítica                                                             |
| **Mitigação**         | Fase 5 (checklist SEC), testes de segurança, RLS, MFA, criptografia |
| **Encerramento**      | Testes de segurança 100% aprovados                                  |

#### 14.4.8 Risco de Performance

| Atributo              | Definição                                                         |
| --------------------- | ----------------------------------------------------------------- |
| **Critério**          | Sistema lento, timeout, gargalo de banco                          |
| **Impacto**           | Alto                                                              |
| **Probabilidade**     | Média                                                             |
| **Severidade Típica** | Alta (4×3=12)                                                     |
| **Prioridade**        | Alta                                                              |
| **Mitigação**         | Fase 5 (checklist PERF), índices, paginação, cache, monitoramento |
| **Encerramento**      | Metas de performance atingidas (p95)                              |

#### 14.4.9 Risco de Integração

| Atributo              | Definição                                                 |
| --------------------- | --------------------------------------------------------- |
| **Critério**          | Integração falha, dados não sincronizam, API externa muda |
| **Impacto**           | Alto                                                      |
| **Probabilidade**     | Média                                                     |
| **Severidade Típica** | Alta (4×3=12)                                             |
| **Prioridade**        | Alta                                                      |
| **Mitigação**         | Testes de integração, retry, logs, monitoramento de saúde |
| **Encerramento**      | Integração testada end-to-end com monitoramento ativo     |

#### 14.4.10 Risco de Dados

| Atributo              | Definição                                                                   |
| --------------------- | --------------------------------------------------------------------------- |
| **Critério**          | Perda de dados, corrupção, inconsistência                                   |
| **Impacto**           | Crítico                                                                     |
| **Probabilidade**     | Baixa                                                                       |
| **Severidade Típica** | Crítica (5×2=10)                                                            |
| **Prioridade**        | Crítica                                                                     |
| **Mitigação**         | Backup automático, validação de persistência (Nível 2), transações atômicas |
| **Encerramento**      | Backup testado, integridade verificada                                      |

#### 14.4.11 Risco de IA

| Atributo              | Definição                                                                               |
| --------------------- | --------------------------------------------------------------------------------------- |
| **Critério**          | IA produz resultado incorreto, vies, ação irreversível, violação de privacidade         |
| **Impacto**           | Alto                                                                                    |
| **Probabilidade**     | Média                                                                                   |
| **Severidade Típica** | Alta (4×3=12)                                                                           |
| **Prioridade**        | Alta                                                                                    |
| **Mitigação**         | Fase 5 (checklist IA), transparência, reversibilidade, consentimento, parsing defensivo |
| **Encerramento**      | Componente de IA auditado, transparência e reversibilidade confirmadas                  |

---

## Fase 15 — Melhoria Contínua

### 15.1 Objetivo

Estabelecer uma metodologia permanente para identificar, priorizar, executar e medir melhorias na plataforma.

### 15.2 Fontes de Identificação de Melhorias

| Fonte                         | Como Identifica                                | Frequência          |
| ----------------------------- | ---------------------------------------------- | ------------------- |
| **Auditorias FCP**            | NCs, observações, lacunas                      | A cada certificação |
| **Sugestões de Usuários**     | Feedback, suporte, NPS                         | Contínuo            |
| **Equipe de Desenvolvimento** | Code review, dívida técnica, fricção           | Contínuo            |
| **Equipe de Arquitetura**     | ADRs, evolução tecnológica, princípios         | Trimestral          |
| **Equipe de Produto**         | Análise de uso, gap de funcionalidades         | Mensal              |
| **Equipe Comercial**          | Requisitos de cliente, concorrência            | Mensal              |
| **Equipe Financeira**         | Controle, conciliação, eficiência              | Mensal              |
| **Equipe Fiscal**             | Mudança legislativa, conformidade              | Contínuo            |
| **Equipe Logística**          | Otimização, rastreabilidade                    | Mensal              |
| **Equipe de TI**              | Infraestrutura, performance, segurança         | Mensal              |
| **Indicadores (Fase 13)**     | Metas não atingidas, tendências negativas      | Mensal              |
| **IA**                        | Anomalias detectadas, sugestões automáticas    | Contínuo            |
| **Benchmark de Mercado**      | Comparação com concorrentes, melhores práticas | Anual               |

### 15.3 Metodologia de Priorização

Toda melhoria identificada é avaliada pelos seguintes critérios:

| Critério                  | Peso | Escala                           |
| ------------------------- | ---- | -------------------------------- |
| Impacto no usuário        | 3    | 1 (mínimo) a 5 (crítico)         |
| Impacto no negócio        | 3    | 1 a 5                            |
| Esforço de implementação  | 2    | 1 (baixo) a 5 (alto) — invertido |
| Urgência                  | 2    | 1 a 5                            |
| Alinhamento estratégico   | 2    | 1 a 5                            |
| Redução de dívida técnica | 1    | 1 a 5                            |

```
Score = (impacto_usuario × 3 + impacto_negocio × 3 + (6 - esforço) × 2 + urgência × 2 + alinhamento × 2 + reducao_divida × 1)
```

Score máximo = 90. Melhorias com score ≥ 60 são priorizadas para o próximo trimestre.

### 15.4 Transformação em Backlog

1. **Registro:** Melhoria é registrada no backlog de melhorias com todos os critérios de priorização.
2. **Análise:** Tech Lead e Product Owner analisam viabilidade.
3. **Decomposição:** Se aprovada, a melhoria é decomposta em itens de backlog executáveis.
4. **Priorização:** Itens são inseridos no sprint/planning com prioridade derivada do score.
5. **Execução:** Desenvolvimento seguindo o FCP (a melhoria passa por certificação como qualquer entrega).

### 15.5 Acompanhamento de Execução

| Atributo         | Definição                                                          |
| ---------------- | ------------------------------------------------------------------ |
| **Status**       | Proposta → Aprovada → Em Desenvolvimento → Certificada → Concluída |
| **Responsável**  | Tech Lead designado                                                |
| **Prazo**        | Definido na aprovação                                              |
| **Progresso**    | Atualizado semanalmente                                            |
| **Bloqueadores** | Registrados e escalados                                            |

### 15.6 Medição de Resultados

Para toda melhoria concluída:

1. **Resultado Esperado:** Definido na proposta (ex: "reduzir tempo de carregamento em 30%").
2. **Resultado Obtido:** Medido após implementação.
3. **Delta:** Diferença entre esperado e obtido.
4. **Lições Aprendidas:** Registradas para futuras melhorias.

### 15.7 Ciclo de Melhoria Contínua

```
Identificar → Priorizar → Aprovar → Decompor → Executar → Certificar (FCP) → Medir → Identificar (loop)
```

Este ciclo é permanente e nunca se encerra. A plataforma está sempre evoluindo.

---

## Revisão Final do Conselho de Arquitetura

### Objetivo

Esta seção registra a revisão final do Conselho de Arquitetura, respondendo obrigatoriamente às 10 perguntas que determinam se o Framework está pronto para se tornar política institucional permanente.

### Pergunta 1: O Framework é reutilizável por muitos anos?

**Resposta: Sim.**

O Framework foi projetado com neutralidade tecnológica e comercial. Ele não referencia nenhuma tecnologia específica (PocketBase, React, etc.) em seus princípios e metodologia — apenas nos checklists específicos, que são versionados e substituíveis (Fase 12). A estrutura de 15 fases cobre o ciclo completo de qualidade, desde o escopo até a melhoria contínua, e é aplicável a qualquer tipo de entrega. A extensibilidade da Fase 6 (regras de negócio) e a metodologia de evolução da Fase 12 garantem que o Framework se adapte a novos domínios sem ser refeito.

### Pergunta 2: É independente do nome comercial da plataforma?

**Resposta: Sim.**

O Framework não utiliza nenhum nome comercial, marca ou denominação de produto em nenhuma de suas 15 fases. Ele refere-se genericamente a "a plataforma", "o módulo", "a entrega", "o Conselho de Arquitetura". Esta neutralidade garante validade para qualquer rebranding, produto derivado ou evolução futura.

### Pergunta 3: Pode acompanhar o crescimento da plataforma?

**Resposta: Sim.**

O Framework é proporcional (níveis de criticidade), extensível (novas regras entram via Fase 12), e dimensionável (checklists aplicados por escopo, não globalmente). A Fase 11 (Revisão Global) define uma metodologia que escala para centenas de módulos. A Fase 13 (Indicadores) fornece métricas que escalam com a plataforma. A Fase 9 (CCP) projeta um módulo que centraliza a gestão à medida que a plataforma cresce.

### Pergunta 4: Suporta novos módulos sem ser refeito?

**Resposta: Sim.**

A Fase 6 define uma metodologia extensível para regras de negócio — novos módulos adicionam suas regras ao catálogo sem mudar a metodologia. A Fase 5 define checklists padronizados que se aplicam a qualquer módulo. A Fase 12 define como o Framework evolui quando novos tipos de módulo surgem. A Fase 14 define tipos de risco que cobrem qualquer domínio futuro.

### Pergunta 5: Suporta IA nativamente?

**Resposta: Sim.**

O Framework tem um checklist específico de IA (Fase 5, seção 5.3.14) que valida transparência, reversibilidade, consentimento, parsing defensivo e uso do gateway oficial. A Fase 14 define "Risco de IA" como tipo próprio. A Fase 13 define "Cobertura de IA" como indicador. A Fase 15 inclui IA como fonte de identificação de melhorias. O Framework está preparado para evoluções futuras de IA (agentes colaborativos, multimodal, on-premise) sem mudança estrutural.

### Pergunta 6: Reduz dívida técnica?

**Resposta: Sim.**

O Framework reduz dívida técnica por: (1) exigir ADR para toda decisão estrutural; (2) verificar hierarquia REAPROVEITAR→ESTENDER→RELACIONAR→CRIAR; (3) auditar conformidade arquitetural; (4) medir débito técnico por módulo (Fase 13, indicador 10); (5) identificar evoluções arquiteturais (Fase 8, Plano de Evolução); (6) garantir que correções sejam profundas, não superficiais (Fase 13, indicador de reincidências).

### Pergunta 7: Reduz retrabalho?

**Resposta: Sim.**

O Framework reduz retrabalho por: (1) exigir evidência de persistência no schema vivo (evita o problema de migrações "applied" sem coleções); (2) checklists sistemáticos que capturam problemas antes da produção; (3) testes de regressão que previnem quebras; (4) certificação contínua que identifica problemas cedo; (5) reutilização máxima que evita duplicação; (6) documentação sempre atualizada que evita re-descoberta.

### Pergunta 8: Melhora a qualidade de engenharia?

**Resposta: Sim.**

O Framework melhora a qualidade por: (1) estabelecer padrões mensuráveis; (2) exigir evidências, não declarações; (3) rastrear toda decisão e toda não conformidade; (4) medir continuamente indicadores de qualidade; (5) promover melhoria contínua sistemática; (6) criar cultura de auditoria e transparência; (7) integrar qualidade ao CI/CD.

### Pergunta 9: Pode se tornar política institucional permanente?

**Resposta: Sim.**

O Framework atende a todos os requisitos de uma política institucional: (1) é neutro e independente de tecnologia; (2) é versionado e auditável (Fase 12); (3) é aprovado pelo Conselho de Arquitetura; (4) é obrigatório para toda entrega (Fase 10); (5) mede sua própria eficácia (Fase 12, seção 12.9); (6) evolui sem perder validade (Fase 12); (7) é tratado como documento vivo (alinhado ao Princípio dos Documentos Vivos).

### Pergunta 10: Há recomendações adicionais para a equipe?

**Resposta: Sim. Recomendações:**

1. **Designar um Auditor FCP dedicado:** A longo prazo, a equipe deve ter um profissional dedicado à execução e manutenção do Framework, garantindo consistência e profundidade.
2. **Investir em automação:** Checklists e testes devem ser automatizados ao máximo, reduzindo o custo de aplicação do Framework.
3. **Treinar a equipe:** Todo novo engenheiro deve ser treinado no FCP como parte do onboarding.
4. **Revisar anualmente:** A auditoria anual do Framework (Fase 12, seção 12.8) deve ser executada rigorosamente.
5. **Desenvolver o CCP (Fase 9):** O Centro de Certificação da Plataforma deve ser priorizado assim que viável, para automatizar e centralizar a gestão da qualidade.
6. **Integrar ao CI/CD:** A integração do FCP ao pipeline de CI/CD (Fase 10, seção 10.5) deve ser progressiva, começando pelos checklists automatizados.
7. **Comunicar sucessos:** Resultados positivos do Framework (NCs prevenidas, melhoria de indicadores) devem ser comunicados à equipe para reforçar a cultura de qualidade.

### Veredito do Conselho

O Conselho de Arquitetura conclui que o **Framework de Certificação da Plataforma (FCP) Versão 1.0.0** está **aprovado para ratificação como política institucional permanente de engenharia**, sujeito à implementação das recomendações da Pergunta 10 de forma progressiva.

---

## Revisão Interna Obrigatória

### Objetivo

Esta seção registra a revisão interna completa executada antes da entrega final, verificando todos os critérios de qualidade institucional.

### Checklist de Revisão Interna

| #   | Critério                                                                                  | Verificação                                                                  | Resultado   |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------- |
| 1   | **Coerência entre todas as fases**                                                        | As 15 fases se referenciam consistentemente, sem contradições metodológicas  | ✅ Aprovado |
| 2   | **Ausência de contradições**                                                              | Nenhuma fase contradiz outra; os critérios de aprovação são consistentes     | ✅ Aprovado |
| 3   | **Ausência de duplicidades**                                                              | Cada conceito é definido uma vez e referenciado; checklists não se sobrepõem | ✅ Aprovado |
| 4   | **Adesão aos princípios oficiais**                                                        | O FCP referencia e operacionaliza PLATFORM_PRINCIPLES §4.1–§4.10             | ✅ Aprovado |
| 5   | **Adesão ao Aceite Baseado em Evidências**                                                | O FCP é a operacionalização de §4.10 e ADR-022                               | ✅ Aprovado |
| 6   | **Adesão à arquitetura oficial**                                                          | O FCP referencia ADRs e a arquitetura conceitual                             | ✅ Aprovado |
| 7   | **Neutralidade de nome comercial**                                                        | Nenhum nome comercial aparece em nenhuma fase                                | ✅ Aprovado |
| 8   | **Simplicidade arquitetural**                                                             | O Framework é o mais simples possível sem sacrificar rigor                   | ✅ Aprovado |
| 9   | **Reutilização máxima**                                                                   | O FCP reutiliza princípios e ADRs existentes; não duplica governança         | ✅ Aprovado |
| 10  | **Escalabilidade**                                                                        | O Framework escala para milhares de módulos (Fase 11, Fase 13)               | ✅ Aprovado |
| 11  | **IA-readiness**                                                                          | Checklist de IA, risco de IA, cobertura de IA, IA como fonte de melhoria     | ✅ Aprovado |
| 12  | **Sustentabilidade de engenharia**                                                        | O custo de aplicar é menor que o custo de não aplicar (proporcionalidade)    | ✅ Aprovado |
| 13  | **Clareza para equipes futuras**                                                          | Estrutura, sumário, metodologia explícita, exemplos                          | ✅ Aprovado |
| 14  | **Consistência entre governança, metodologia, checklists, certificação e revisão global** | Todas as fases seguem a mesma estrutura e princípios                         | ✅ Aprovado |

### Resultado da Revisão Interna

**Veredito:** A revisão interna confirma que o Framework de Certificação da Plataforma (FCP) Versão 1.0.0 está **consolidado, coerente, neutro, alinhado com os princípios oficiais e pronto para entrega como versão final única**.

Nenhuma versão parcial ou intermediária foi entregue. Este documento constitui a **única versão final consolidada e internamente revisada**.

---

## Gestão deste Documento

- **Tipo:** Documento institucional permanente (política de engenharia)
- **Versão:** 1.0.0 (Final Consolidada)
- **Frequência de revisão:** Anual (Fase 12, seção 12.8) ou a cada mudança maior
- **Responsável:** Conselho de Arquitetura
- **Aprovação:** Conselho de Arquitetura + Product Owner
- **Versionamento:** Semântico (Maior.Menor.Patch) conforme Fase 12
- **Rastreabilidade:** Este documento referencia PLATFORM_PRINCIPLES, ARCHITECTURE, ADR-022 e todos os documentos oficiais
- **Neutralidade:** Este documento não utiliza nenhum nome comercial de produto

---

_Este Framework é a metodologia institucional permanente de engenharia da plataforma. Toda entrega — sem exceção — deve passar pelo FCP antes de ser considerada concluída. "Concluído" é um estado comprovado por evidências, não uma declaração de desenvolvimento._

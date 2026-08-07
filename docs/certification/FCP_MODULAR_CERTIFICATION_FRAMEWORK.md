# FCP — Framework de Certificação Modular da Plataforma (FCP-MODULAR v1.0)

> **Documento Oficial — Metodologia Permanente de Certificação**
> Status: **Oficial — Substitui todas as metodologias anteriores**
> Data de adoção: 2026-08-07
> Responsável: Architecture Council
> Classificação: **Permanente — Aplicável a todas as futuras auditorias, revisões globais, homologações, grandes implementações e certificações**

---

## 1. Substituição de Metodologias Anteriores

Esta metodologia **FCP Modular Certification (FCP-MODULAR)** substitui oficialmente e permanentemente:

- A certificação monolítica anterior (FCP v1.0.0 — execução contínua em um único fluxo)
- Qualquer versão preliminar de certificação por módulo
- Qualquer processo de auditoria que não siga a estrutura de 15 domínios independentes com 25 artefatos obrigatórios cada

A partir desta data, **toda auditoria, revisão global, homologação, grande implementação ou certificação** da plataforma Velora Log deve seguir obrigatoriamente o FCP-MODULAR.

---

## 2. Princípios da Certificação Modular

### 2.1 Um Domínio por Build

Cada domínio de negócio é certificado como uma **unidade independente**, executada integralmente em um único Build. A certificação de um domínio nunca é interrompida no meio — ou o domínio é completamente certificado (todos os 25 artefatos produzidos e revisados internamente), ou não é iniciado.

### 2.2 Execução Contínua e Ininterrupta

Durante a certificação:

- **Nenhuma** solicitação de autorização ao usuário
- **Nenhuma** pergunta sobre prioridades, ordem, sequência, agrupamentos, dependências, estratégia ou organização de Builds
- **Nenhum** pedido de confirmação ou validação intermediária
- **Nenhum** relatório parcial, capítulo isolado ou entrega fracionada
- **Nenhuma** interrupção da certificação
- O Architecture Council tem **autonomia técnica total** para decidir todas as questões operacionais

### 2.3 Sem Implementação Durante a Certificação

A certificação é exclusivamente um processo de auditoria. Durante o processo:

- **Nenhuma** alteração de código
- **Nenhuma** alteração de schema, migração, hook, API, componente, página, rota ou configuração
- O único entregável é a documentação oficial de auditoria e certificação

### 2.4 Padrão Baseado em Evidências

Toda conclusão deve declarar explicitamente:

| Campo                   | Descrição                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Evidência**           | O fato, dado ou observação que sustenta a conclusão                                           |
| **Origem da Evidência** | Onde a evidência foi obtida (schema vivo, código-fonte, hooks, documentação, teste funcional) |
| **Impacto**             | Qual o impacto da conclusão na plataforma                                                     |
| **Criticidade**         | Crítica, Alta, Média, Baixa                                                                   |
| **Risco**               | Nível de risco associado (1-25)                                                               |
| **Prioridade**          | P0, P1, P2, P3                                                                                |
| **Recomendação**        | Ação recomendada                                                                              |

Toda afirmação deve ser classificada como:

- **Prova Factual** — verificada e comprovada por evidência técnica direta
- **Hipótese** — proposta que requer validação adicional
- **Inferência** — dedução lógica baseada em evidências indiretas
- **Recomendação** — sugestão de ação baseada na análise

---

## 3. Os 15 Domínios Oficiais

| #   | Domínio                                                                                           | Escopo                                                                           |
| --- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 01  | Arquitetura e Plataforma Core                                                                     | ADRs, princípios, multi-tenancy, usuários, empresas, filiais, configurações      |
| 02  | Banco de Dados, Collections, Relacionamentos e Migrations                                         | Schema, collections, índices, RLS, migrações, integridade referencial            |
| 03  | Segurança, Autenticação, Permissões, Auditoria e LGPD                                             | Auth, RLS, MFA, criptografia, permissões, auditoria, LGPD                        |
| 04  | Backend, APIs, Hooks, Serviços Compartilhados e Integrações                                       | Hooks, rotas customizadas, serviços, integrações, automações                     |
| 05  | Frontend, Componentes Compartilhados, UX, Navegação e CMS                                         | Componentes, páginas, rotas, layout, CMS, UX, responsividade                     |
| 06  | Cadastros Mestres                                                                                 | Transportadoras, categorias, marcas, unidades, plano de contas, centros de custo |
| 07  | Comercial                                                                                         | Pedidos de venda, faturamento, NF-e/NFC-e, contratos, devoluções                 |
| 08  | Compras                                                                                           | Requisições, cotações, pedidos, recebimento, devoluções                          |
| 09  | Financeiro                                                                                        | Recebíveis, pagáveis, fluxo de caixa, conciliação, tesouraria, DRE               |
| 10  | Fiscal                                                                                            | NF-e, NFC-e, NFS-e, CT-e, MDF-e, apuração, reforma tributária, SPED              |
| 11  | Estoque, WMS e Logística                                                                          | Movimentações, lotes, WMS, rotas, entregas, fretes, rastreamento                 |
| 12  | Indústria, Produção, Custos, Engenharia de Produto e Verbas                                       | BOM, roteiros, specs, custos industriais, qualidade, MRP                         |
| 13  | CRM, Marketing, Trade Marketing e Relacionamento                                                  | Leads, oportunidades, funil, vitrine, campanhas, chat                            |
| 14  | BI, Relatórios, Dashboards, Indicadores e Analytics                                               | Dashboards, KPIs, exportações, analytics, data warehouse                         |
| 15  | TI, Administração, Configurações, Monitoramento, IA, Performance, Escalabilidade e Infraestrutura | Backups, APIs, parâmetros, observabilidade, IA, rate limiting, caching           |

O Architecture Council pode reorganizar a estrutura de domínios somente se identificar uma organização superior, com justificativa técnica documentada no relatório.

---

## 4. Os 25 Artefatos Obrigatórios por Domínio

Cada domínio deve produzir integralmente os seguintes 25 artefatos:

| #   | Artefato                         | Descrição                                                   |
| --- | -------------------------------- | ----------------------------------------------------------- |
| 1   | Inventário Funcional             | Lista de todas as funcionalidades do domínio com status     |
| 2   | Inventário Técnico               | Stack, versões, dependências, bibliotecas                   |
| 3   | Inventário Arquitetural          | Camadas, padrões, fluxos, dependências arquiteturais        |
| 4   | Inventário das Regras de Negócio | Regras, validações, cálculos, fórmulas                      |
| 5   | Inventário das Collections       | Collections, campos, índices, RLS, relacionamentos          |
| 6   | Inventário das APIs              | Endpoints REST, rotas customizadas, métodos                 |
| 7   | Inventário dos Hooks             | Hooks por tipo, gatilho, coleção, ação                      |
| 8   | Inventário dos Serviços          | Serviços frontend, funções, coleções acessadas              |
| 9   | Inventário das Telas             | Páginas, rotas, componentes principais                      |
| 10  | Inventário dos Componentes       | Componentes por categoria, funções                          |
| 11  | Inventário das Integrações       | Integrações implementadas e previstas                       |
| 12  | Inventário dos Relatórios        | Relatórios, formatos, bibliotecas de exportação             |
| 13  | Inventário das Automações        | Hooks de evento, cron jobs, rotas de ação, IA               |
| 14  | Matriz de Dependências           | Dependências entre módulos, collections, hooks, serviços    |
| 15  | Matriz de Riscos                 | Riscos classificados por severidade                         |
| 16  | Matriz de Débito Técnico         | Dívida técnica por tipo, severidade, idade                  |
| 17  | Matriz de Oportunidades          | Melhorias, evoluções, reuso, simplificações                 |
| 18  | Plano de Correções               | Ações corretivas com prazo e responsável                    |
| 19  | Plano de Melhorias               | Melhorias com prioridade e impacto                          |
| 20  | Roadmap Evolutivo                | Evoluções de curto, médio e longo prazo                     |
| 21  | Parecer Técnico                  | Análise técnica por dimensão (arquitetura, segurança, etc.) |
| 22  | Classificação                    | Grade (A, B, C) e nível de risco                            |
| 23  | Nota Técnica                     | Avaliação final com justificativa                           |
| 24  | Nível de Maturidade              | Escala 1-5 com justificativa                                |
| 25  | Certificação Oficial do Domínio  | Status: ✅ Certificado / 🟡 Reservas / ❌ Não Certificado   |

### Regra de Fechamento de Domínio

Um domínio só é considerado **fechado** quando:

1. Todos os 25 artefatos estão completos
2. A revisão interna foi executada cobrindo: coerência, consistência, duplicações, conflitos, aderência ao Modelo Canônico, Platform Principles, FCP, arquitetura, segurança, performance, escalabilidade, mantabilidade, documentação, UX e prontidão para IA
3. Todas as melhorias identificadas foram incorporadas automaticamente

---

## 5. Escopo Exaustivo de Auditoria por Domínio

Cada domínio deve cobrir obrigatoriamente:

1. **Arquitetura** — aderência a ADRs e princípios
2. **Regras de Negócio** — validações, cálculos, fórmulas
3. **Banco de Dados** — schema, índices, integridade
4. **Collections** — campos, tipos, constraints
5. **Relacionamentos** — relações, cascadeDelete, integridade referencial
6. **Migrations** — sequência, idempotência, gaps
7. **APIs** — endpoints, autenticação, validação, documentação
8. **Hooks** — scoping, tratamento de erro, e.next(), prefixo
9. **Serviços** — padrões, cobertura, consistência
10. **Componentes** — exports, imports, responsividade
11. **Telas** — rotas, navegação, UX
12. **Dashboards** — KPIs, visualizações, dados
13. **Relatórios** — formatos, bibliotecas, agendamento
14. **Integrações** — implementadas, previstas, saúde
15. **Automações** — hooks, cron, rotas, IA
16. **IA** — gateway, agentes, RAG, custo
17. **Segurança** — RLS, MFA, criptografia, LGPD
18. **Performance** — paginação, caching, otimização
19. **Escalabilidade** — rate limiting, réplicas, caching
20. **Documentação** — ADRs, PRD, consistência
21. **Cálculos** — fórmulas, validações matemáticas
22. **Validações** — entrada, negócio, sistema
23. **Permissões** — matriz, gaps, enforcement
24. **Auditoria** — logs, rastreabilidade, anomalias
25. **UX** — simplicidade, produtividade, responsividade
26. **LGPD** — dados sensíveis, consentimento, retenção
27. **Débito Técnico** — código, dados, arquitetura
28. **Riscos** — identificação, classificação, mitigação
29. **Oportunidades** — melhorias, reuso, simplificação
30. **Prontidão para Evolução** — arquitetura preparada para futuro

---

## 6. Melhorias Obrigatórias por Domínio

Como Enterprise Architecture Council, a auditoria deve identificar e recomendar:

- **Simplificações arquiteturais** — reduzir complexidade desnecessária
- **Padronizações** — uniformizar padrões, nomenclatura, estruturas
- **Melhorias arquiteturais** — evoluções estruturais
- **Oportunidades de automação** — processos manuais que podem ser automatizados
- **Oportunidades de IA** — onde IA pode agregar valor
- **Redução de código** — eliminar duplicação, consolidar
- **Reuso** — estruturas que podem ser compartilhadas
- **Ganhos de performance** — otimizações identificadas
- **Melhorias de UX** — simplificação de fluxos, consistência
- **Redução de débito técnico** — priorização de pagamento
- **Oportunidades de evolução futura** — preparação para V1, V2, V3

---

## 7. Controle de Status

| Status                       | Significado                                                           |
| ---------------------------- | --------------------------------------------------------------------- |
| **EM ELABORAÇÃO**            | Certificação em andamento — nem todos os domínios/artefatos completos |
| **CERTIFICADO**              | Todos os domínios certificados, todos os artefatos completos          |
| **CERTIFICADO COM RESERVAS** | Certificado com NCs críticas pendentes                                |
| **NÃO CERTIFICADO**          | NCs críticas não resolvidas                                           |

A certificação permanece **EM ELABORAÇÃO** até que:

1. Todos os 15 domínios estejam individualmente certificados
2. Todos os 25 artefatos de cada domínio estejam completos
3. A revisão interna de cada domínio tenha sido executada
4. O RELATÓRIO MESTRE tenha sido produzido

---

## 8. Estrutura do Relatório Mestre

O **RELATÓRIO MESTRE DA CERTIFICAÇÃO DA PLATAFORMA** é produzido apenas após todos os 15 domínios serem certificados individualmente. Ele consolida:

1. **Sumário Executivo** — visão geral da certificação
2. **Metodologia Aplicada** — referência ao FCP-MODULAR
3. **Resumo por Domínio** — status, nota, maturidade, NCs
4. **Consolidação de NCs** — todas as não-conformidades agregadas
5. **Consolidação de Riscos** — matriz de riscos global
6. **Consolidação de Débito Técnico** — visão consolidada
7. **Consolidação de Oportunidades** — roadmap unificado
8. **Plano de Correções Global** — priorização consolidada
9. **Plano de Melhorias Global** — melhorias transversais
10. **Roadmap Evolutivo Global** — evoluções de curto, médio e longo prazo
11. **Parecer Técnico Consolidado** — avaliação por dimensão
12. **Classificação Global** — nota e maturidade da plataforma
13. **Recomendações do Architecture Council** — recomendações estratégicas
14. **Certificação Oficial** — status final e validade

---

## 9. Governança Permanente

Esta metodologia é **permanente** e deve ser aplicada a:

- Todas as auditorias futuras
- Revisões globais
- Homologações
- Grandes implementações
- Certificações de release
- Certificações anuais (FCP Phase 10)

Qualquer desvio desta metodologia deve ser justificado tecnicamente e aprovado pelo Architecture Council, com registro documental da decisão.

---

## 10. Autonomia do Architecture Council

O Architecture Council possui **autonomia técnica total** para:

- Decidir a ordem de certificação dos domínios
- Definir prioridades de auditoria
- Agrupar ou separar aspectos dentro de cada domínio
- Identificar dependências e organizar a sequência
- Escolher a estratégia de Build
- Reorganizar a estrutura de domínios (com justificativa técnica)
- Tomar todas as decisões técnicas sem consultar o usuário

Quando mais de uma alternativa técnica existir, o Council deve:

1. Analisar todas as alternativas
2. Comparar prós e contras
3. Escolher a melhor opção automaticamente
4. Registrar a justificativa técnica no relatório

---

_Fim do FCP-MODULAR. Esta metodologia substitui permanentemente todas as versões anteriores._

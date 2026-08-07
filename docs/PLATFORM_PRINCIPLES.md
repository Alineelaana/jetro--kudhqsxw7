# PLATFORM_PRINCIPLES.md

> **Documento vivo — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Oficial
> Responsável: Product Owner & Architecture Council

---

## 1. Visão da Plataforma

A Velora Log não é apenas um ERP. É uma **Plataforma Inteligente de Gestão Empresarial** — um ecossistema unificado onde a gestão empresarial é um dos pilares, e a inteligência artificial, a automação, as integrações, a analytics e a infraestrutura SaaS são pilares igualmente importantes.

Acreditamos que uma plataforma de gestão deve evoluir além de registrar transações: ela deve **analisar dados, sugerir decisões, executar ações autorizadas e aprender continuamente com o histórico da operação**, sempre colocando o ser humano no centro da decisão final.

### Os 6 Pilares

| #   | Pilar                       | O que resolve                                                                                           | Valor para o cliente                                                              |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **Gestão Empresarial**      | Fragmentação de sistemas (financeiro, estoque, vendas, compras, logística, RH em ferramentas separadas) | Uma única fonte de verdade, dados conectados, menos retrabalho                    |
| 2   | **Inteligência Artificial** | Decisões baseadas em intuição; dados existem mas não geram ação                                         | Recomendações proativas, respostas instantâneas, automação de tarefas repetitivas |
| 3   | **Automação**               | Processos manuais que consomem tempo e geram erros                                                      | Fluxos automáticos que disparam ações sem intervenção humana                      |
| 4   | **Integrações**             | Ilhas de informação entre a empresa e seus parceiros (fornecedores, transportadoras, bancos, governo)   | Conectividade nativa com ecossistema empresarial, dados sempre sincronizados      |
| 5   | **Analytics**               | Relatórios estáticos que mostram o passado sem orientar o futuro                                        | Dashboards que respondem "o que está acontecendo, por quê, e o que fazer agora"   |
| 6   | **Plataforma SaaS**         | Custo de infraestrutura, manutenção e atualizações pesando sobre o cliente                              | Acesso imediato, atualizações contínuas, escalabilidade sem investimento em TI    |

---

## 2. Missão

> **Democratizar o acesso a uma plataforma de gestão inteligente que combina a profundidade de um ERP corporativo com a simplicidade de um SaaS moderno, permitindo que empresas de todos os portes operem com excelência, tomem decisões baseadas em dados e ganhem vantagem competitiva.**

---

## 3. Valores do Produto

1. **Produto antes da Tecnologia** — Toda decisão começa com "qual problema resolvemos?" e "qual valor entregamos?". A tecnologia é um meio, nunca o fim.
2. **Simplicidade que gera Produtividade** — Menos telas, menos passos, mais resultados. Se um usuário precisa de 7 cliques para fazer algo que poderia ser 2, falhamos.
3. **Decisão Orientada a Dados** — Cada módulo deve ajudar a responder: o que está acontecendo? Por quê? O que pode acontecer? O que devemos fazer agora?
4. **Inteligência Nativa** — IA não é um add-on; é uma camada que permeia todos os módulos, analisando dados e sugerindo ações continuamente.
5. **Evolução Contínua** — A plataforma nunca está pronta. Aprende com o uso, coleta feedback, e melhora de forma incremental e mensurável.
6. **Transparência Total** — Auditoria completa, logs imutáveis, rastreabilidade de cada ação. O cliente confia porque pode verificar.
7. **Segurança como Fundamento** — LGPD, criptografia, MFA, permissões granulares. A segurança não é negociável.
8. **Escalabilidade sem Limites** — Projetada para milhares de empresas simultâneas, com arquitetura que cresce com o cliente.

---

## 4. Princípios Fundamentais da Plataforma — A "Constituição"

> Esta seção centraliza todos os princípios permanentes da plataforma. Eles são a **Constituição** do projeto — toda decisão de produto, arquitetura e engenharia deve estar alinhada com estes princípios. Em caso de conflito entre um princípio fundamental e qualquer outra diretiva, o princípio fundamental prevalece.

### 4.1 Princípio da Evolução Sustentável

- **Objetivo:** Garantir que a plataforma evolua de forma incremental e sustentável, maximizando o reuso e minimizando a dívida técnica e a duplicação de código/dados.
- **Regra:** Antes de criar qualquer nova estrutura (coleção, tabela, serviço, componente), a equipe deve seguir a hierarquia de decisão obrigatória: **REAPROVEITAR → ESTENDER → RELACIONAR → CRIAR**.
  1. **REAPROVEITAR:** Verificar se já existe uma estrutura que atende à necessidade. Se existe, usar.
  2. **ESTENDER:** Se a estrutura existe mas não atende completamente, estendê-la (adicionar campos, comportamentos) sem quebrar contratos existentes.
  3. **RELACIONAR:** Se a estrutura não cobre o caso, verificar se é possível relacionar estruturas existentes (ex: criar uma relação entre `purchase_orders` e `import_processes` em vez de criar uma nova coleção de compras internacionais).
  4. **CRIAR:** Só criar uma nova estrutura quando as três opções anteriores foram avaliadas e documentadas como insuficientes.
- **Hierarquia de decisão:** REAPROVEITAR > ESTENDER > RELACIONAR > CRIAR. A criação de uma nova estrutura exige justificativa documentada e aprovação do Conselho de Arquitetura.
- **Exemplos:**
  - **Correto:** Estender `purchase_orders` com campos de moeda estrangeira para suportar compras internacionais, em vez de criar `ind_international_purchases`.
  - **Correto:** Reutilizar `stock_batches` para quarentena de matéria-prima (via campo `situacao`) em vez de criar `ind_quarantine_lots`.
  - **Incorreto:** Criar `ind_currencies` quando uma estrutura central `currencies` pode e deve ser compartilhada por todos os módulos.

### 4.2 Princípio da Neutralidade dos Módulos

- **Objetivo:** Garantir que estruturas com potencial de reuso não nasçam pertencentes a um módulo específico, evitando acoplamento e facilitando o aproveitamento transversal.
- **Regra:** Nenhum componente deve nascer pertencente a um módulo específico quando existe potencial razoável de reuso. Toda estrutura candidata a uso multi-domínio deve ser avaliada como candidata a **Shared Platform Service**. Estruturas que atendem a múltiplos domínios (ex: moedas, câmbio, qualidade, documentos, anexos) devem ser centralizadas e neutras, com um campo `modulo_origem` quando necessário para identificar o contexto de origem.
- **Hierarquia de decisão:** Serviço Compartilhado > Módulo-Específico. A criação de uma estrutura específica de módulo só é aceitável quando não há potencial razoável de reuso por outros módulos.
- **Exemplos:**
  - **Correto:** Reclassificar `ind_currencies` → `currencies` (serviço compartilhado), pois Comercial, Financeiro, Compras e Indústria podem precisar de multi-moeda.
  - **Correto:** Reclassificar `ind_quality_inspections` → `quality_inspections` com campo `modulo_origem`, pois qualidade pode aplicar-se a recebimento, produção, expedição, devolução, transporte, etc.
  - **Incorreto:** Criar `ind_documents` quando a plataforma já tem ou precisa de um serviço compartilhado de documentos.

### 4.3 Princípio: Configurar antes de Customizar

- **Objetivo:** Maximizar a flexibilidade da plataforma sem aumentar a dívida técnica de código.
- **Regra:** Toda regra de negócio, fluxo, parâmetro, numeração, template ou comportamento deve ser configurável via interface (Configuration Center) antes de exigir desenvolvimento de código. Se uma regra de negócio exige código, isso é uma falha de produto que deve ser corrigida.
- **Hierarquia de decisão:** Configuração > Customização de Código. Código só é aceitável quando a configuração é comprovadamente insuficiente e a necessidade é validada pelo Conselho de Arquitetura.
- **Exemplos:**
  - **Correto:** Permitir configurar alíquotas de impostos, limites de desconto e fluxos de aprovação via interface.
  - **Incorreto:** Exigir um novo deploy para alterar a alíquota de ICMS de um produto.

### 4.4 Princípio: Single Source of Truth (Fonte Única de Verdade)

- **Objetivo:** Garantir que cada dado da plataforma tenha uma única fonte autoritativa, eliminando inconsistências e conflitos.
- **Regra:** Nenhum dado deve ser duplicado como fonte de verdade. Estruturas pré-computadas ou indexadas (ex: índices de rastreabilidade) são permitidas apenas como otimização técnica de performance, nunca como segunda fonte de verdade. A verdade sempre reside nas relações operacionais reais.
- **Hierarquia de decisão:** Fonte Operacional Real > Estrutura Pré-computada. Qualquer estrutura pré-computada deve ser regenerável a partir das relações operacionais reais.
- **Exemplos:**
  - **Correto:** A rastreabilidade/genealogia de lotes é derivada das relações reais (Fornecedor → Importação → Recebimento → Lote de Matéria-Prima → Inspeção → Movimentação → Ordem de Produção → Consumo → Lote Acabado → Expedição → Cliente). Qualquer índice de rastreabilidade é puramente técnico para performance.
  - **Incorreto:** Manter uma tabela `product_genealogy` como fonte de verdade separada das relações operacionais.

### 4.5 Princípio: Conselho de Arquitetura

- **Objetivo:** Garantir que decisões estruturais com impacto de longo prazo sejam coletivas, documentadas e rastreáveis.
- **Regra:** Toda decisão estrutural que possa impactar o produto nos próximos 5 anos deve ser apresentada para aprovação do Conselho de Arquitetura antes da implementação, documentada como ADR (Architecture Decision Record).
- **Hierarquia de decisão:** Conselho > Indivíduo. Nenhuma decisão estrutural relevante pode ser tomada unilateralmente.
- **Exemplos:**
  - **Correto:** A reclassificação de estruturas do Indústria para Shared Platform Services foi documentada como ADR-011 e aprovada pelo Conselho.
  - **Incorreto:** Um desenvolvedor criar uma nova coleção sem documentar a decisão.

### 4.6 Princípio: Regra das 5 Perguntas

- **Objetivo:** Garantir que toda funcionalidade relevante seja validada antes da implementação.
- **Regra:** Antes de implementar qualquer funcionalidade relevante, responder: (1) Qual problema ela resolve? (2) Existe uma solução mais simples? (3) Escala? (4) Aumenta a dívida técnica? (5) Como será em 5 anos?
- **Hierarquia de decisão:** Validação > Implementação. Nenhuma funcionalidade relevante é implementada sem responder às 5 perguntas.
- **Exemplos:**
  - **Correto:** Antes de criar o MRP básico, a equipe validou que ele resolve a necessidade de cálculo de compra, que uma rota/hook é mais simples que uma coleção persistente, e que a previsão avançada pode ser adicionada em V1+.

### 4.7 Princípio: Simplicidade Arquitetural

- **Objetivo:** Manter a arquitetura o mais simples possível, evitando over-engineering e complexidade desnecessária.
- **Regra:** A solução mais simples que resolve o problema é a correta. Complexidade só é aceitável quando justificada por um requisito real e validada pelo Conselho de Arquitetura.
- **Hierarquia de decisão:** Simples > Complexo. A complexidade deve ser justificada, não assumida.
- **Exemplos:**
  - **Correto:** O MRP básico no MVP é uma rota/hook calculado, não uma coleção persistente com motor de planejamento completo. A complexidade de forecasting é deferida para V1+.
  - **Incorreto:** Construir um motor de MRP completo com previsão de demanda por IA no MVP quando um cálculo simples de necessidade líquida atende às dores atuais.

### 4.8 Princípio: Documentos Vivos

- **Objetivo:** Garantir que a documentação seja sempre precisa, atual e rastreável.
- **Regra:** Toda documentação é um documento vivo — versionada, revisada e atualizada a cada mudança significativa. A documentação é tratada como código: está versionada, passa por review e deve refletir o estado atual do produto. Qualquer desenvolvedor novo deve entender a plataforma lendo apenas a documentação.
- **Hierarquia de decisão:** Documentação Atualizada > Documentação Perfeita. É melhor ter documentação imperfeita mas atualizada do que documentação perfeita mas desatualizada.
- **Exemplos:**
  - **Correto:** Após a decisão de reclassificar estruturas do Indústria para Shared Platform Services, todos os seis documentos oficiais foram atualizados simultaneamente para refletir a mudança.
  - **Incorreto:** Uma decisão arquitetural é tomada mas a documentação não é atualizada, levando a inconsistências.

### 4.10 Princípio do Aceite Baseado em Evidências — Validação em Cinco Níveis

- **Objetivo:** Garantir que toda entrega da plataforma só seja considerada concluída quando comprovada por evidências técnicas em todos os níveis aplicáveis, eliminando a prática de declarar "concluído" sem verificação verificável.
- **Regra de Ouro:** **"Concluído" é um estado comprovado por evidências, e não uma declaração de desenvolvimento.**
- **Hierarquia de decisão:** Evidência > Declaração. Nenhuma entrega recebe o status **Implementado** sem a comprovação de todos os cinco níveis aplicáveis.

#### Cinco Níveis de Validação

Todo requisito, item de backlog, migração ou entrega funcional deve ser validado nos seguintes níveis, em ordem:

| Nível | Nome                          | O que verifica                                                                                                                           | Exemplo de evidência                                       |
| ----- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1     | **Existência Estrutural**     | A estrutura (coleção, campo, índice, arquivo, componente) existe fisicamente no ambiente                                                 | Schema do banco, tree do repositório, output de `describe` |
| 2     | **Persistência**              | A estrutura sobrevive a ciclos de criação/leitura/atualização/exclusão e está presente no schema vivo, não apenas no arquivo de migração | Query ao banco live, registro criado e listado com sucesso |
| 3     | **Implementação Funcional**   | A funcionalidade opera conforme especificado — cria, edita, lista, filtra, ordena, valida                                                | Teste funcional, fluxo end-to-end, screenshot              |
| 4     | **Integração**                | A funcionalidade integra-se corretamente com os demais módulos, hooks, serviços e regras de acesso                                       | Hook dispara, regra de acesso aplica, relação expande      |
| 5     | **Conformidade Arquitetural** | A entrega está alinhada com os princípios e ADRs da plataforma (Neutralidade, Single Source of Truth, Evolução Sustentável, etc.)        | ADR referenciado, princípio citado, sem duplicação         |

**Nível 2 (Persistência) como verificação independente do Nível 1 (Existência Estrutural):** A persistência é um nível independente e obrigatório porque verifica que a estrutura não apenas existe no arquivo de migração (Nível 1), mas está efetivamente presente e operacional no schema vivo do banco de dados. Este endereça diretamente o achado crítico da Fase 0 (BLK-MVP-025), onde migrações foram marcadas como "applied" mas as coleções estavam ausentes do schema live. A migração aplicada não é evidência de existência — apenas a presença no schema vivo é.

#### Quatro Status Oficiais

Todo nível de validação recebe exatamente um dos quatro status:

| Status                           | Significado                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ✅ **Implementado**              | O nível foi totalmente comprovado por evidência técnica verificável                                       |
| 🟡 **Parcialmente Implementado** | O nível possui evidência parcial — some aspectos estão comprovados, outros não                            |
| ❌ **Não Implementado**          | O nível não foi implementado ou a evidência demonstra que não funciona                                    |
| ⚪ **Não Evidenciado**           | Não há evidência técnica disponível para avaliar o nível — **não é um erro**, é a ausência de comprovação |

**Definição de "Não Evidenciado":** ⚪ Não Evidenciado significa que não há evidência técnica suficiente para determinar o status do nível. Não é uma falha em si, mas impede que o item receba **Implementado**. A ausência de evidência deve ser resolvida com a produção de evidência, não com a presunção de que funciona.

#### Regra de Aceite: Status "Implementado"

Um item só pode receber o status **✅ Implementado** quando **todos os cinco níveis aplicáveis** tiverem sido comprovados por evidência técnica. Não é suficiente que o código exista ou que o desenvolvedor declare conclusão — a evidência deve ser produzida e verificável.

#### Exceção: "Não Aplicável"

Se um nível não se aplica a um requisito específico (ex: um requisimento puramente documentacional pode não ter Nível 2 — Persistência), ele deve ser explicitamente marcado como **Não Aplicável**, com justificativa técnica documentada. Um nível marcado como **Não Aplicável** **não prejudica o cálculo de aderência** — ele é simplesmente excluído do denominador.

#### Regra de Cálculo de Aderência (Completion Percentage)

A porcentagem de aderência de um item é calculada como:

```
Aderência = (níveis com status ✅ Implementado) / (total de níveis aplicáveis) × 100
```

Onde:

- **Numerador:** contagem de níveis com status ✅ Implementado.
- **Denominador:** contagem de níveis aplicáveis (exclui níveis marcados como Não Aplicável).
- Níveis com status 🟡, ❌ ou ⚪ contam como zero no numerador.
- Um item com 100% de aderência (todos os níveis aplicáveis como ✅) recebe o status global **Implementado**.
- Aderência < 100% impede o status **Implementado** — o item recebe 🟡, ❌ ou ⚪ conforme o caso.

#### Exemplos

- **Correto:** Uma migração que cria uma coleção é marcada como ✅ Implementado somente após: (1) o arquivo de migração existir, (2) a coleção estar presente no schema vivo do banco, (3) um registro poder ser criado e listado, (4) as regras de acesso funcionarem, (5) a coleção não duplicar estrutura existente.
- **Incorreto:** Uma migração marcada como "applied" recebe ✅ Implementado sem verificar se a coleção existe no schema live (Nível 2 ausente).
- **Correto:** Um requisito documentacional marca o Nível 2 (Persistência) como **Não Aplicável** com justificativa "Requisito puramente documentacional, sem estrutura de dados", e o cálculo de aderência usa apenas os níveis 1, 3, 4 e 5 como denominador.

### 4.9 Princípio: Estratégia Evolutiva da Plataforma

- **Objetivo:** Garantir que decisões de arquitetura representem a visão de longo prazo do produto e não sejam restringidas pela infraestrutura atual, estabelecendo uma separação clara entre a Arquitetura Conceitual e a Implementação Atual.
- **Regra:** A arquitetura da plataforma deve refletir a visão de produto de longo prazo. Limitações da infraestrutura atual (provedor cloud, capacidade de deployment, restrições de domínio, etc.) são documentadas como **restrições temporárias de implementação**, nunca como limitações de arquitetura. A arquitetura conceitual permanece válida independentemente da infraestrutura em uso.
- **Hierarquia de decisão:** Arquitetura Conceitual (visão de longo prazo) > Implementação Atual (infraestrutura temporária). A Implementação Atual nunca restringe nem redefine a Arquitetura Conceitual.
- **Dois conceitos distintos:**
  1. **Arquitetura Conceitual:** A plataforma é desenhada para múltiplos Canais Digitais independentes que consomem Shared Platform Services. Esta é a visão oficial de longo prazo e não muda com a infraestrutura em uso.
  2. **Implementação Atual:** Deploy temporário em projeto único, compatível com os limites da infraestrutura atual (Skip Cloud). A implementação atual não altera a arquitetura — apenas a materializa parcialmente enquanto a infraestrutura evolui.
- **Exemplos:**
  - **Correto:** A arquitetura conceitual define múltiplos Canais Digitais; a implementação atual usa um único projeto Skip Cloud como restrição temporária. Quando a infraestrutura permitir, a separação física é ativada sem redesenho da arquitetura.
  - **Incorreto:** Limitar a arquitetura a um único canal porque o provedor cloud atual só suporta um projeto, tratando a limitação de infraestrutura como se fosse uma decisão de arquitetura permanente.
  - **Incorreto:** Redesenhar a arquitetura quando a infraestrutura mudar, em vez de simplesmente ativar a separação que já estava prevista na arquitetura conceitual.

---

## 5. Diretivas Arquiteturais

### 4.1 Multi-tenancy Preparado para Instâncias Dedicadas

**Problema:** Empresas diferentes têm necessidades diferentes. Algumas precisam de isolamento total (Enterprise), outras aceitam compartilhamento (SMB).

**Decisão:** Isolamento lógico por Tenant ID em todos os dados e operações. A arquitetura deve estar preparada para migrar clientes Enterprise para instâncias dedicadas sem refatoração, usando uma camada de abstração de dados que permite trocar de "banco compartilhado" para "banco dedicado" por configuração.

**Valor:** O cliente cresce sem precisar trocar de plataforma; a plataforma cresce sem reescrever o core.

### 4.2 Arquitetura Orientada a Domínio

**Problema:** Sistemas monolíticos misturam regras de negócio com detalhes técnicos, tornando evolução custosa.

**Decisão:** Organização por domínio de negócio (Comercial, Financeiro, Estoque, Logística, RH, etc.). Cada domínio é responsável por suas regras, seus dados e suas APIs. Domínios se comunicam via contratos (APIs e eventos), nunca via acesso direto ao banco.

**Valor:** Times podem evoluir domínios independentemente; mudanças em um domínio não quebram outro.

### 4.3 API First

**Problema:** Interfaces acopladas a uma única UI limitam a capacidade de criar integrações, apps móveis, marketplaces e automações externas.

**Decisão:** Toda funcionalidade é exposta via API versionada antes de qualquer UI. A UI consome as mesmas APIs disponíveis para parceiros e clientes.

**Valor:** O cliente pode integrar a plataforma com qualquer sistema; parceiros podem construir sobre a plataforma; a UI é apenas um dos clientes possíveis.

### 4.4 Feature Flags

**Problema:** Diferentes clientes precisam de diferentes conjuntos de funcionalidades; lançamentos graduais reduzem risco.

**Decisão:** Toda funcionalidade é controlada por feature flags, ativáveis por cliente, por plano ou globalmente. Permite lançamentos progressivos (canary, beta) e customização por tenant.

**Valor:** O cliente ativa apenas o que precisa; a plataforma lança com segurança; experimentação sem risco.

### 4.5 Observabilidade

**Problema:** Não saber o que acontece dentro da plataforma impede diagnóstico e melhoria contínua.

**Decisão:** Monitoramento contínuo de performance, uso, erros, latência e saúde de cada componente. Logs estruturados, métricas de negócio e alertas automáticos.

**Valor:** Problemas são detectados antes que o cliente perceba; decisões de produto baseadas em dados reais de uso.

### 4.6 Auditoria Inteligente

**Problema:** Logs tradicionais registram mas não ajudam a entender ou detectar anomalias.

**Decisão:** Cada ação relevante é registrada com contexto completo (quem, o quê, quando, de onde, com qual dispositivo, qual o estado anterior e posterior). A camada de IA analisa padrões de auditoria para detectar comportamentos suspeitos automaticamente.

**Valor:** Conformidade regulatória sem esforço manual; detecção proativa de fraudes e erros.

### 4.7 Timeline Cronológica por Registro

**Problema:** Entender o histórico de um registro (um pedido, um cliente, uma fatura) exige cruzar múltiplas telas e sistemas.

**Decisão:** Cada registro possui uma timeline cronológica unificada que mostra toda a sua jornada: criação, alterações, comunicações, documentos gerados, integrações executadas, decisões de IA, aprovações — tudo em uma visão única.

**Valor:** O usuário entende o contexto completo sem procurar; resolução de problemas é rápida; transparência total.

---

## 5. Diretivas de UX

### 5.1 Simplicidade e Produtividade

- **Poucas telas, poucos passos:** Cada interação deve ser o mais curta possível. Se uma tarefa comum exige mais de 3 cliques, deve ser redesenhada.
- **Atalhos e teclado:** Usuários avançados devem conseguir operar a plataforma inteira via teclado.
- **Busca global:** Encontrar qualquer registro, cliente, pedido ou documento a partir de uma única barra de busca.
- **Contexto sempre visível:** O usuário nunca deve se perguntar "onde estou?" ou "o que posso fazer aqui?".

### 5.2 Dashboards Inteligentes

- Cada módulo abre com um dashboard que responde às 4 perguntas: o que está acontecendo? Por quê? O que pode acontecer? O que fazer agora?
- KPIs são configuráveis por usuário e por função.
- Alertas e recomendações aparecem no contexto, não em telas separadas.

### 5.3 Padrões de Grandes Plataformas SaaS

Inspirados em Microsoft Dynamics, Salesforce, Atlassian, Monday.com e ServiceNow:

- **Onboarding guiado:** Novos usuários são guiados pela primeira configuração.
- **In-app help:** Ajuda contextual disponível em cada tela.
- **Notificações inteligentes:** O usuário é avisado do que importa, sem ruído.
- **Customização sem código:** O cliente pode personalizar campos, fluxos, regras e dashboards sem programar.
- **Mobile-first:** A experiência deve funcionar perfeitamente em qualquer dispositivo.

---

## 6. Diretivas de Inteligência Artificial

### 6.1 IA como Camada Nativa

A IA não é um módulo separado; é uma camada que permeia toda a plataforma:

- **Analisa dados** continuamente para identificar padrões, anomalias e oportunidades.
- **Executa ações autorizadas** dentro dos limites de autonomia definidos pelo cliente.
- **Colabora entre agentes** especializados (cada domínio pode ter seu próprio agente).
- **Sugere melhorias** com base no histórico de uso e nos resultados das ações.
- **Automatiza processos** que são repetitivos e padronizados.
- **Aprende com o histórico** quando autorizado pelo cliente, respeitando privacidade.

### 6.2 Arquitetura Reservando Espaço para IA Futura

A arquitetura deve estar preparada para:

- Novos modelos de IA (LLMs, modelos especializados por domínio).
- Diferentes provedores (intercambiabilidade sem refatoração).
- Agentes especializados (um agente por domínio de negócio).
- Modelos locais (para clientes Enterprise que exigem dados on-premise).
- IA multimodal (texto, imagem, voz, vídeo).
- RAG (Retrieval-Augmented Generation) sobre os dados do cliente.

### 6.3 Níveis de Autonomia

| Nível                      | Comportamento                                          | Exemplo                                            |
| -------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| Somente Consultar          | Responde perguntas, não executa                        | "Quais contas vencem hoje?"                        |
| Consultar e Sugerir        | Responde e sugere ações                                | "Sugiro pagar a conta X via PIX"                   |
| Preparar Ações             | Monta a ação para aprovação                            | "Preparei o pagamento de X, confirme?"             |
| Executar com Confirmação   | Executa após confirmação humana                        | "Pagamento executado após sua confirmação"         |
| Executar Ações Autorizadas | Executa automaticamente dentro de regras pré-aprovadas | "Reabastecimento automático de estoque低于 mínimo" |

---

## 7. Diretivas de Segurança

### 7.1 LGPD e Privacidade

- Conformidade total com a Lei Geral de Proteção de Dados.
- Dados pessoais são classificados e tratados conforme finalidade.
- Direito de acesso, retificação, eliminação e portabilidade garantidos.
- Consentimento explícito para uso de dados em IA.

### 7.2 Criptografia

- Dados sensíveis criptografados em repouso e em trânsito.
- Campos especialmente sensíveis (CPF, CNPJ, dados bancários) com criptografia adicional a nível de campo.

### 7.3 MFA (Multi-Factor Authentication)

- Disponível para todos os usuários.
- Obrigatório para administradores e para operações financeiras críticas.

### 7.4 Logs Imutáveis

- Logs de auditoria são append-only (somente acréscimo).
- Não podem ser alterados ou deletados, mesmo por superusuários.
- Retenção configurável por plano e por regulamentação.

### 7.5 Permissões Granulares

- Controle por função (role), por módulo, por ação (visualizar, criar, editar, deletar, aprovar).
- Matriz de permissões configurável sem código.
- Permissões específicas para dados sensíveis (custos, margens, dados pessoais).

### 7.6 Auditoria Completa

- Toda ação relevante é registrada com: quem, o quê, quando, de onde, dispositivo, estado anterior, estado posterior, justificativa.
- Detecção automática de comportamentos suspeitos via IA.
- Alertas configuráveis para ações críticas.

---

## 8. Diretivas de Escalabilidade

### 8.1 Meta: Milhares de Empresas Simultâneas

A plataforma deve suportar milhares de empresas operando simultaneamente, cada uma com seus usuários, dados e integrações, sem degradação de performance.

### 8.2 Alternativas de Escala (com Prós/Contras)

| Alternativa                                   | Prós                                                    | Contras                                           | Recomendação                 |
| --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------- | ---------------------------- |
| **Banco compartilhado com isolamento lógico** | Menor custo, simplicidade operacional, bom para SMB     | Risco de noisy neighbor, isolamento apenas lógico | **Curto prazo (MVP–V2)**     |
| **Schema por tenant**                         | Isolamento maior, backup/restore por cliente            | Maior complexidade de manutenção                  | **Médio prazo (V2–V3)**      |
| **Instância dedicada por cliente Enterprise** | Isolamento total, performance garantida, personalização | Maior custo, complexidade de gestão               | **Longo prazo (Enterprise)** |

**Recomendação de longo prazo:** Modelo híbrido — SMB em banco compartilhado, Enterprise em instância dedicada, com migração transparente quando o cliente cresce.

### 8.3 Inteligência de Produto Auto-Analítica

A plataforma deve monitorar o próprio uso e gerar insights:

- **Módulos não utilizados:** Alertar o cliente sobre funcionalidades que poderiam gerar valor.
- **Processos lentos:** Identificar gargalos e sugerir otimizações.
- **Oportunidades de automação:** Detectar tarefas repetitivas e sugerir automação.
- **Sugestões de melhoria:** Recomendar configurações, fluxos e práticas com base no uso de clientes similares.

---

## 9. Diretiva de Arquitetura Comercial

### 9.1 Arquitetura de Planos

| Plano            | Público            | Características                                                                       |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------- |
| **Trial**        | Empresas avaliando | 14 dias, módulos essenciais, dados de demonstração                                    |
| **Free**         | Microempresas      | Gestão básica, 1 usuário, limite de registros                                         |
| **Starter**      | Pequenas empresas  | Módulos essenciais, até 5 usuários, suporte por e-mail                                |
| **Professional** | Médias empresas    | Todos os módulos, até 25 usuários, IA básica, integrações                             |
| **Enterprise**   | Grandes empresas   | Multi-filial, usuários ilimitados, IA avançada, instância dedicada, SLA, API completa |

### 9.2 Ciclo de Vida do Cliente

- **Onboarding automático:** Configuração guiada, dados de exemplo, primeiros passos.
- **Ativação:** Cliente configura empresa, importa dados, convida usuários.
- **Upgrade/Downgrade:** Automático, sem downtime, prorrogação/crédito proporcional.
- **Cancelamento:** Retenção de dados por 90 dias, reativação sem perda.
- **Reativação:** Restauração completa dos dados e configurações.

### 9.3 Marketplace Futuro

- Plugins e extensões desenvolvidos por terceiros.
- Modelos de IA especializados por setor.
- Integrações com sistemas verticais.
- Templates de configuração por nicho.

### 9.4 APIs Públicas e Portal do Cliente

- APIs públicas documentadas (OpenAPI) para integração com sistemas externos.
- Portal do Cliente para autoatendimento (segunda via, rastreamento, solicitações).
- White Label readiness para parceiros revenderem sob sua marca.

### 9.5 Master Portal

Painel exclusivo da equipe da plataforma para administrar:

- Clientes e planos
- Consumo e custos
- Uso de IA (tokens, chamadas, custos)
- Saúde da plataforma
- Licenças e módulos
- Integrações
- Feature flags
- Marketplace

---

## 10. Regra do Architecture Council

> **Toda decisão estrutural que possa impactar o produto nos próximos 5 anos deve ser apresentada para aprovação do Architecture Council antes da implementação.**

### Composição do Council

- Product Owner (decisor final)
- Tech Lead (Skip)
- Arquiteto (Skip)
- Consultor (Skip)

### Processo

1. Proposta documentada como ADR (Architecture Decision Record).
2. Reunião do Council para análise.
3. Decisão registrada com justificativa, alternativas e consequências.
4. Implementação somente após aprovação.

### O que exige aprovação

- Mudança de stack tecnológica.
- Mudança de modelo de multi-tenancy.
- Nova camada de IA ou novo provedor.
- Mudança no modelo de dados que afeta múltiplos domínios.
- Novo pilar ou módulo estrutural.
- Mudança no modelo comercial (planos, billing).
- Decisões de segurança que afetam conformidade.

---

## 11. A Regra Permanente das 5 Perguntas

> **Antes de implementar qualquer funcionalidade relevante, responder:**

1. **Qual problema ela resolve?** — Se não há problema claro, não implementar.
2. **Existe uma solução mais simples?** — Sempre buscar a solução mais simples que resolve o problema.
3. **Escala?** — Funciona para 10 clientes? 1.000? 10.000?
4. **Aumenta a dívida técnica?** — Se sim, é justificada? Qual o plano de pagamento?
5. **Como será em 5 anos?** — Esta decisão ainda fará sentido no futuro? Se não, como facilitar a mudança?

---

## 12. Critérios de Qualidade

### 12.1 Qualidade de Produto

- Cada funcionalidade deve ter critérios de aceitação claros e mensuráveis.
- Cada módulo deve ter KPIs de sucesso definidos.
- Antes de lançar, responder: o valor prometido está sendo entregue?

### 12.2 Qualidade de Código

- Cobertura de testes automatizados em regras de negócio críticas.
- Code review obrigatório.
- Documentação de APIs sempre atualizada.
- Zero warnings de compilação/lint.

### 12.3 Qualidade de Documentação

- Documentação tratada como código: versionada, revisada, atualizada.
- Cada documento é um documento vivo.
- Qualquer desenvolvedor novo deve entender a plataforma lendo apenas a documentação.
- Rastreabilidade completa entre documentos.

### 12.4 Qualidade de UX

- Testes de usabilidade antes de cada lançamento maior.
- Feedback de usuários coletado e priorizado.
- Tempo para concluir tarefas críticas medido e otimizado.

---

## 13. Padrões de Mercado de Referência

A plataforma se inspira nas melhores práticas de empresas SaaS world-class:

| Empresa                      | Inspiração                                                                |
| ---------------------------- | ------------------------------------------------------------------------- |
| **Microsoft (Dynamics 365)** | Integração profunda entre módulos, IA embarcada (Copilot), ecossistema    |
| **Salesforce**               | Platform-as-a-Service, AppExchange (marketplace), customização sem código |
| **SAP**                      | Profundidade de processos empresariais, multi-filial, multi-moeda         |
| **Oracle**                   | Escala enterprise, segurança, performance                                 |
| **Atlassian**                | Simplicidade, colaboração, documentação viva                              |
| **Monday.com**               | UX excepcional, flexibilidade, visual clarity                             |
| **HubSpot**                  | Onboarding, growth-driven, customer success                               |
| **ServiceNow**               | Workflows, automação, ITSM como referência de processos                   |

> **Nota:** A inspiração é em padrões e práticas, não em cópia de funcionalidades. A plataforma tem sua própria identidade e proposta de valor.

---

## 14. Resumo das Decisões Arquiteturais

> Esta seção resume as principais decisões arquiteturais tomadas na rodada de atualização da documentação (2026-08-06), mapeando cada uma ao seu respectivo ADR quando aplicável.

| #   | Decisão                                                                        | Contexto                                                                                                                                                                                                                                                                                                                                                                                           | ADR     | Documentos Afetados                                    |
| --- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| 1   | Reclassificação de estruturas do Indústria para Shared Platform Services       | `ind_currencies`→`currencies`, `ind_exchange_rates`→`exchange_rates`, `ind_imports`→`import_processes`, `ind_import_costs`→`import_costs`, `ind_quality_inspections`→`quality_inspections`, `ind_quality_parameters`→`quality_parameters`, `ind_production_lines`→`production_resources`                                                                                                           | ADR-011 | PLATFORM_PRINCIPLES §4.2, ARCHITECTURE §2.4, PRD §3.11 |
| 2   | Shared Platform Services como camada formal                                    | Estruturas compartilhadas (Empresas, Filiais, Usuários, Permissões, Produtos, Clientes, Fornecedores, Auditoria, IA, Automações, Integrações, Documentos, Anexos, Comentários, Tarefas, Workflows, Aprovações, Notificações, Configurações, Templates, Moedas, Câmbio, Qualidade, Comércio Exterior, Dashboards, KPIs, Feature Flags) são serviços de plataforma, não pertencentes a nenhum módulo | ADR-012 | ARCHITECTURE §2.3, PLATFORM_PRINCIPLES §4.2            |
| 3   | Official Platform Tree sob perspectiva de produto                              | Organização em 5 áreas: Plataforma (Core), Gestão Empresarial, Portais, Ecossistema, Governança                                                                                                                                                                                                                                                                                                    | ADR-013 | ARCHITECTURE §2.2                                      |
| 4   | MRP básico como rota/hook calculado                                            | Não criar coleção persistente para MRP no MVP; cálculo cruza BOM × demanda × estoque × POs em aberto × importações em trânsito                                                                                                                                                                                                                                                                     | ADR-014 | PRD §3.11, ROADMAP MVP                                 |
| 5   | Rastreabilidade/Genealogia via relações operacionais reais                     | Fonte de verdade nas relações reais; índices pré-computados são apenas otimização técnica                                                                                                                                                                                                                                                                                                          | ADR-015 | PRD §3.11, PLATFORM_PRINCIPLES §4.4                    |
| 6   | Extensão de `purchase_orders` para compras internacionais                      | Não duplicar; estender com campos de multi-moeda (moeda original, valor em moeda estrangeira, câmbio, data/referência do câmbio, valor convertido em BRL, diferença cambial, composição de landing cost em moeda de origem e base)                                                                                                                                                                 | ADR-016 | PRD §3.11                                              |
| 7   | Extensão de `wms_receipts`/`stock_checkings` para recebimento de matéria-prima | Não criar recibos paralelos; estender estruturas existentes do WMS                                                                                                                                                                                                                                                                                                                                 | ADR-016 | PRD §3.11                                              |
| 8   | Quarentena via `stock_batches.situacao` + localizações tipo quarentena         | Não criar coleção de quarentena; reutilizar `stock_batches` com campo `situacao` e localizações classificadas como quarentena                                                                                                                                                                                                                                                                      | ADR-016 | PRD §3.11                                              |
| 9   | BOM versionada e imutável                                                      | Cada versão de BOM é imutável; cada Ordem de Produção registra `bom_id` + `bom_version` para reconstrução exata                                                                                                                                                                                                                                                                                    | ADR-017 | PRD §3.11                                              |
| 10  | Quality Inspection como processo decisor de condição de lote                   | `quality_inspections` decide condição (Aprovado, Reprovado, Aprovado com restrição, Necessita nova análise) e altera disponibilidade do lote via estruturas centrais de Stock/WMS                                                                                                                                                                                                                  | ADR-018 | PRD §3.11                                              |
| 11  | `quality_inspections`/`quality_parameters` com campo `modulo_origem`           | Preparado para uso multi-domínio (recebimento, produção, expedição, devolução, transporte, etc.)                                                                                                                                                                                                                                                                                                   | ADR-011 | PRD §3.11, ARCHITECTURE §2.4                           |
| 12  | Traceabilidade imediata sem depender do módulo Recall                          | A consulta de rastreabilidade deve identificar lote problemático → produtos acabados impactados → estoque existente → pedidos/NFs → clientes, sem aguardar o módulo Recall (deferido para V1)                                                                                                                                                                                                      | ADR-015 | PRD §3.11, ROADMAP V1                                  |
| 13  | `production_resources` com campo `tipo`                                        | Linhas de produção reclassificadas como recursos de produção com campo `tipo` (linha, máquina, centro de trabalho, etc.)                                                                                                                                                                                                                                                                           | ADR-011 | ARCHITECTURE §2.4, PRD §3.11                           |
| 14  | COMEX como evolução futura                                                     | Processos de importação utilizáveis por Indústrias, Distribuidores, Trading Companies, Centros de Distribuição e outros; módulo de Comércio Exterior corporativo no horizonte V2+                                                                                                                                                                                                                  | ADR-019 | PRODUCT_VISION_2035 §5.3, ROADMAP V2                   |
| 15  | Arquitetura de Canais Digitais da Plataforma                                   | Arquitetura conceitual multi-canais (CLIENTES → CANAIS DIGITAIS → Shared Platform Services → Plataforma). VeloraLog é o primeiro Canal Digital. Implementação atual em projeto único é restrição temporária de infraestrutura, não de arquitetura. Futura separação física sem redesenho.                                                                                                          | ADR-020 | PLATFORM_PRINCIPLES §4.9, ARCHITECTURE §2.5, ROADMAP   |

### Novos ADRs desta rodada

- **ADR-011:** Reclassificação de estruturas do Indústria para Shared Platform Services (Neutralidade de Módulos)
- **ADR-012:** Shared Platform Services como camada arquitetural formal
- **ADR-013:** Official Platform Tree sob perspectiva de produto
- **ADR-014:** MRP básico como rota/hook calculado (não coleção persistente)
- **ADR-015:** Rastreabilidade/Genealogia via relações operacionais reais (Single Source of Truth)
- **ADR-016:** Extensão de estruturas existentes para Indústria (Evolução Sustentável)
- **ADR-017:** BOM versionada e imutável
- **ADR-018:** Quality Inspection como processo decisor de condição de lote
- **ADR-019:** COMEX como evolução futura do módulo de importação
- **ADR-020:** Arquitetura de Canais Digitais da Plataforma (Estratégia Evolutiva)

---

## 15. Gestão deste Documento

- **Tipo:** Documento vivo (living document)
- **Frequência de revisão:** A cada release maior ou mudança estratégica
- **Responsável:** Product Owner
- **Aprovação:** Architecture Council
- **Rastreabilidade:** Cada diretiva pode gerar ADRs específicos
- **Versionamento:** Changes registradas com data, responsável e justificativa

---

_Este documento é a constituição do projeto. Toda decisão de produto e tecnologia deve estar alinhada com estes princípios. Em caso de conflito, este documento prevalece._

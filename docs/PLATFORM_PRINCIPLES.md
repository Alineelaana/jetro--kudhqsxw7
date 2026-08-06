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

## 4. Diretivas Arquiteturais

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

## 14. Gestão deste Documento

- **Tipo:** Documento vivo (living document)
- **Frequência de revisão:** A cada release maior ou mudança estratégica
- **Responsável:** Product Owner
- **Aprovação:** Architecture Council
- **Rastreabilidade:** Cada diretiva pode gerar ADRs específicos
- **Versionamento:** Changes registradas com data, responsável e justificativa

---

_Este documento é a constituição do projeto. Toda decisão de produto e tecnologia deve estar alinhada com estes princípios. Em caso de conflito, este documento prevalece._

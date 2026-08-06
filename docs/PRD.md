# PRD.md — Product Requirements Document

> **Documento vivo — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Oficial
> Responsável: Product Owner

---

## 1. Visão de Produto

A Velora Log é uma Plataforma Inteligente de Gestão Empresarial que une ERP, IA, automação, integrações, analytics e infraestrutura SaaS em um único ecossistema. Este PRD define os requisitos de produto — funcionalidades, regras de negócio, personas, KPIs — **independentemente da tecnologia atual**, representando a visão completa do produto.

---

## 2. Personas

### 2.1 Personas Principais

| Persona                      | Perfil                                  | Necessidades                                                      | Dores atuais                                                       |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Empresário / Diretor**     | Dono ou diretor de média/grande empresa | Visão consolidada, decisões rápidas, controle sem micromanagement | Dados espalhados, relatórios defasados, não confia nos números     |
| **Gestor Comercial**         | Líder de vendas                         | Pipeline visível, previsão de receita, metas e comissões          | CRM desconectado do financeiro, não sabe rentabilidade por cliente |
| **Gestor Financeiro**        | CFO / Controller                        | Fluxo de caixa, contas a pagar/receber, conciliação, fechamento   | Planilhas, reconciliação manual, dados desatualizados              |
| **Gestor de Estoque**        | Líder de operações                      | Saldo correto, lotes, validade, WMS, reposição                    | Inventário impreciso, perdas por validade, ruptura                 |
| **Gestor de Logística**      | Líder de transporte                     | Rotas, rastreamento, comprovantes, fretes                         | Roteirização manual, sem visibilidade de entrega                   |
| **Gestor de RH**             | Líder de pessoas                        | Folha, ponto, férias, benefícios, conformidade                    | Processos manuais, conformidade trabalhista, erros em folha        |
| **Analista de Compras**      | Líder de suprimentos                    | Cotações, pedidos, recebimento, divergências                      | Compras reativas, sem comparação de fornecedores                   |
| **Operador / Usuário Final** | Executa tarefas diárias                 | Sistema rápido, simples, com atalhos                              | Sistema lento, muitos cliques, dados não salvam                    |
| **Administrador do Sistema** | TI / Configurador                       | Permissões, integrações, parâmetros, backups                      | Configuração complexa, sem autonomia                               |

### 2.2 Personas da Plataforma (Equipe Velora Log)

| Persona                   | Perfil               | Necessidades                                                 |
| ------------------------- | -------------------- | ------------------------------------------------------------ |
| **Master Admin**          | Equipe da plataforma | Gerir clientes, planos, consumo, saúde da plataforma         |
| **Onboarding Specialist** | Sucesso do cliente   | Acompanhar ativação, identificar gargalos, sugerir melhorias |

---

## 3. Módulos por Domínio de Negócio

### 3.1 Domínio Comercial

**Objetivo:** Gerenciar todo o ciclo comercial — do lead ao pós-venda — com visão de rentabilidade e previsibilidade.

**Funcionalidades:**

- CRM completo (leads, oportunidades, funil, propostas)
- Pedidos de venda com configuração flexível
- Faturamento e emissão de documentos fiscais (NF-e, NFC-e, NFS-e)
- Contratos e recorrência
- Devoluções e trocas
- Comissões e metas
- Propostas comerciais e orçamentos
- Histórico completo por cliente (timeline)

**KPIs Comercial:**

- Receita por período, por cliente, por vendedor, por produto
- Taxa de conversão do funil
- Ticket médio
- Ciclo de venda médio
- Rentabilidade por cliente e por pedido
- Previsão de receita (forecast)

**Dependências:** Financeiro, Estoque, Fiscal
**Aceitação:** O gestor comercial consegue responder "qual será minha receita próximo mês?" com 90% de acerto.

### 3.2 Domínio de Compras

**Objetivo:** Garantir que a empresa tenha o que precisa, na hora certa, pelo melhor custo, com total rastreabilidade.

**Funcionalidades:**

- Requisições de compra com fluxo de aprovação
- Cotações com múltiplos fornecedores
- Pedidos de compra
- Recebimento de mercadorias (conferência e divergências)
- Notas fiscais de entrada
- Devoluções de compra
- Acompanhamento de prazos de entrega
- Avaliação de fornecedores

**KPIs Compras:**

- Lead time de compra
- Economia em cotações (melhor preço vs. preço anterior)
- % de compras no prazo
- Divergências em recebimento
- Custo de aquisição por produto

**Dependências:** Estoque, Financeiro, Fiscal
**Aceitação:** O analista de compras consegue responder "quando preciso recomprar e de quem?" automaticamente.

### 3.3 Domínio Financeiro

**Objetivo:** Dar controle total sobre o dinheiro da empresa — receber, pagar, conciliar, projetar e decidir.

**Funcionalidades:**

- Contas a receber e a pagar
- Fluxo de caixa (realizado e projetado)
- Conciliação bancária
- Tesouraria (múltiplas contas, transferências)
- Caixa (abertura, fechamento, movimentações)
- Boletos, PIX, cartões
- Cobranças e renegociação
- Aprovações de pagamento
- Fechamento contábil
- DRE gerencial
- Conciliação de recebimentos

**KPIs Financeiro:**

- Fluxo de caixa projetado (30/60/90 dias)
- Inadimplência (% e valor)
- Prazo médio de recebimento
- Prazo médio de pagamento
- Margem operacional
- Custo financeiro (%)
- Conciliação automática (%)

**Dependências:** Comercial, Compras, Bancos
**Aceitação:** O CFO consegue responder "teremos caixa para operar nos próximos 90 dias?" instantaneamente.

### 3.4 Domínio de Estoque

**Objetivo:** Garantir que o estoque seja preciso, ágil e otimizado — nem excesso, nem ruptura.

**Funcionalidades:**

- Gestão de produtos (cadastro, variações, códigos)
- WMS completo (recebimento, endereçamento, separação, conferência, expedição)
- Movimentações (entradas, saídas, transferências, ajustes)
- Inventário (cíclico, rotativo, cego)
- Lotes e validade (FIFO/FEFO)
- Alertas de estoque mínimo e máximo
- Reposição automática (com IA)
- Ondas de separação
- Mapa de ocupação do armazém
- Multi-armazém e multi-filial

**KPIs Estoque:**

- Acuracidade de inventário
- Giro de estoque
- Valor parado em estoque
- % de ruptura
- % de produtos vencendo (30/60/90 dias)
- Produtividade de separação
- Custo de armazenagem

**Dependências:** Compras, Comercial, Logística
**Aceitação:** O gestor de estoque consegue responder "quais produtos vão faltar e quando?" com antecedência.

### 3.5 Domínio de Logística

**Objetivo:** Entregar no prazo, com o menor custo, com visibilidade total e comprovante de entrega.

**Funcionalidades:**

- Planejamento de rotas (com IA)
- Gestão de entregas e rastreamento
- Gestão de frota e motoristas
- Romaneios
- Cálculo de fretes
- Tabelas de frete
- Ocorrências de entrega
- Comprovante de entrega (foto, assinatura, geolocalização)
- Logística reversa
- Indicadores de desempenho (OTIF)
- App do motorista
- Custos logísticos
- Simulação de GPS e rastreamento em tempo real

**KPIs Logística:**

- OTIF (On-Time In-Full)
- Custo de frete por entrega e por rota
- Taxa de ocorrências
- Tempo médio de entrega
- Utilização da frota
- Custo por km

**Dependências:** Estoque, Comercial, Financeiro
**Aceitação:** O gestor de logística consegue responder "qual rota mais eficiente para hoje?" automaticamente.

### 3.6 Domínio de Marketing

**Objetivo:** Atrair, engajar e converter clientes com campanhas mensuráveis e ROI claro.

**Funcionalidades:**

- Gestão de campanhas
- Vitrine e banners (CMS)
- Formulários de captura e orçamento
- Automação de marketing
- Segmentação de clientes
- Métricas de campanha
- Landing pages
- Integração com redes sociais

**KPIs Marketing:**

- CAC (Custo de Aquisição de Cliente)
- LTV (Lifetime Value)
- ROI por campanha
- Taxa de conversão de leads
- Taxa de abertura/clique

**Dependências:** Comercial, CRM
**Aceitação:** O gestor de marketing consegue responder "qual canal traz mais clientes rentáveis?"

### 3.7 Domínio de RH

**Objetivo:** Gerir pessoas com eficiência, conformidade e engajamento.

**Funcionalidades:**

- Cadastro de colaboradores
- Cargos, departamentos e estruturas organizacionais
- Controle de ponto
- Férias e afastamentos
- Folha de pagamento
- Benefícios
- Treinamentos
- Documentos trabalhistas
- Aprovações de RH
- Departamento Pessoal (DP)
- SST (Segurança e Saúde do Trabalho)
- Indicadores de RH

**KPIs RH:**

- Headcount
- Turnover
- Absenteísmo
- Custo de pessoal
- Horas extras
- Conformidade trabalhista

**Dependências:** Financeiro, Plataforma
**Aceitação:** O gestor de RH consegue responder "minha folha está correta e dentro do orçamento?"

### 3.8 Domínio Plataforma

**Objetivo:** Fornecer a infraestrutura de produto — configuração, integrações, segurança, auditoria — que sustenta todos os módulos.

**Funcionalidades:**

- Configuration Center (parâmetros, fluxos, regras, permissões, templates, automações, nomenclaturas)
- Gestão de usuários e permissões (matriz granular)
- Auditoria e logs
- Backups e restore
- Integrações (bancos, SEFAZ, transportadoras, APIs externas)
- APIs e credenciais
- Importação/Exportação
- CMS (gestão de conteúdo do site)
- Vitrine e banners
- Feature flags
- Multi-empresa e multi-filial
- Sistema de notificações

**KPIs Plataforma:**

- Uptime
- Tempo de resposta médio
- % de processos automatizados
- Cobertura de auditoria
- Tempo de restore de backup

**Dependências:** Todos os domínios
**Aceitação:** O administrador consegue configurar qualquer regra de negócio sem programar.

### 3.9 Domínio IA

**Objetivo:** Tornar a plataforma inteligente — analisando, sugerindo, automatizando e aprendendo.

**Funcionalidades:**

- Assistente de IA (chat com contexto de dados)
- Agentes especializados por domínio
- Automações inteligentes
- Fluxos inteligentes (Smart Flows)
- Base de conhecimento
- Treinamento da IA
- Histórico de interações
- Aprovações de ações de IA
- Monitor de erros de IA
- Configurações de autonomia
- Análise preditiva (previsões)
- Inteligência prescritiva (sugestões de ação)

**KPIs IA:**

- Interações por dia
- Taxa de resolução sem humano
- Tempo médio de resposta
- Ações aprovadas vs. reprovadas
- Economia de tempo (horas automatizadas)

**Dependências:** Todos os domínios (IA permeia a plataforma)
**Aceitação:** O usuário consegue perguntar "quais contas vencem hoje?" e receber a resposta instantaneamente, com opção de executar a ação.

### 3.10 Domínio Administração

**Objetivo:** Centralizar a governança e configuração do sistema.

**Funcionalidades:**

- Dados da empresa (multi-empresa, multi-filial)
- Parâmetros do sistema
- Matriz de permissões
- Logs e auditoria
- Integrações
- APIs
- Importação/Exportação
- Modelos de e-mail e documento
- Numerações
- Segurança
- Backups
- Conformidade (LGPD, trabalhista, fiscal)

**Dependências:** Plataforma
**Aceitação:** Toda configuração de sistema é feita em um único local, sem código.

---

### 3.11 Domínio Indústria

**Objetivo:** Gerenciar todo o ciclo industrial — desde a compra internacional de matéria-prima até a produção e rastreabilidade completa do produto acabado — com multi-moeda, landing cost, controle de qualidade e genealogia de lotes.

**Funcionalidades (Ordem de Prioridade Aprovada para MVP):**

1. **Compras Internacionais:** Extensão de `purchase_orders` (não duplicação) para suportar compras em moeda estrangeira com campos: moeda original, valor em moeda estrangeira, taxa de câmbio, data/referência do câmbio, valor convertido em BRL, diferença cambial quando aplicável, e composição de landing cost em moeda de origem e moeda base.
2. **Importação:** Gestão de processos de importação via estrutura central `import_processes` (Shared Platform Service), com tracking de status (em trânsito, desembaraçado, entregue) e vinculação ao pedido de compra internacional.
3. **Multi-moeda / Câmbio Básico:** Cadastro de moedas (`currencies`) e taxas de câmbio (`exchange_rates`) como Shared Platform Services, com conversão automática e registro de diferenças cambiais.
4. **Landing Cost:** Composição de custos de importação (`import_costs`) incluindo frete internacional, seguro, impostos de importação, despesas aduaneiras, armazenagem portual, e rateio por item/produto.
5. **Recebimento Integrado ao WMS:** Extensão de `wms_receipts`/`stock_checkings` (não criação de recibos paralelos) para recebimento de matéria-prima, com vinculação ao processo de importação e ao pedido de compra internacional.
6. **Estoque por Lote e Validade:** Reutilização de `stock_batches` para controle de lotes de matéria-prima e produto acabado, com controle FIFO/FEFO já existente na plataforma.
7. **Quarentena:** Reutilização de `stock_batches.situacao` + localizações tipo quarentena (não criação de coleção de quarentena). Lotes em quarentena têm disponibilidade bloqueada até decisão de qualidade.
8. **Controle de Qualidade:** Estruturas centrais `quality_inspections` e `quality_parameters` (Shared Platform Services) com campo `modulo_origem` preparado para multi-domínio (recebimento, produção, expedição, devolução, transporte, etc.). A Quality Inspection é o processo que decide a condição do lote (Aprovado, Reprovado, Aprovado com restrição, Necessita nova análise) e altera a disponibilidade do lote através das estruturas centrais de Stock/WMS.
9. **Ficha Técnica / BOM Versionada:** BOM (Bill of Materials) versionada e imutável. Cada versão de BOM é um snapshot imutável. Cada Ordem de Produção registra explicitamente `bom_id` + `bom_version`, permitindo a reconstrução exata de como um determinado lote foi produzido, mesmo quando a BOM é posteriormente alterada.
10. **MRP Básico (Rota/Hook Calculado):** O MRP básico é implementado como uma **rota/hook calculado**, não como uma coleção persistente. O cálculo cruza: BOM × demanda (pedidos de venda, previsões manuais) × estoque atual × pedidos de compra em aberto × importações em trânsito, para computar a necessidade líquida de compra. Forecasting avançado e IA preditiva são deferidos para versões posteriores (V1+).
11. **PCP (Planejamento e Controle de Produção):** Planejamento de produção baseado em demandas e capacidade de recursos (`production_resources` com campo `tipo` — linha, máquina, centro de trabalho).
12. **Ordem de Produção:** Criação de ordens de produção vinculadas a uma BOM versionada específica, com registro de `bom_id` + `bom_version`, recursos alocados, e período planejado.
13. **Consumo / Apontamento Real de Matéria-Prima:** Registro do consumo efetivo de matéria-prima por lote na ordem de produção, criando a relação real entre lote de matéria-prima consumido e lote de produto acabado produzido.
14. **Geração de Lote de Produto Acabado:** Criação do lote de produto acabado em `stock_batches`, com genealogia vinculada aos lotes de matéria-prima consumidos.
15. **Custos Previstos × Realizados:** Comparação entre o custo previsto (BOM + landing cost + custos de produção) e o custo realizado (consumo real + custos efetivos), com análise de variâncias.
16. **Rastreabilidade / Genealogia Completa:** A rastreabilidade é construída a partir de **relações operacionais reais**, não de uma tabela pré-computada. A cadeia completa é: Fornecedor → Importação → Recebimento → Lote de Matéria-Prima → Inspeção/Liberação → Movimentação de Estoque → Ordem de Produção → Consumo Efetivo de Lote → Produção → Lote de Produto Acabado → Expedição → Pedido/NF → Cliente. Qualquer estrutura pré-computada/indexada é puramente técnica para performance e nunca uma segunda fonte de verdade. A consulta de rastreabilidade deve suportar identificação imediata de: lote problemático → produtos acabados impactados → estoque existente → pedidos/NFs → clientes que o receberam, **sem depender do módulo Recall** (fluxo completo de Recall deferido para V1).
17. **Indicadores Essenciais:** OTIF de produção, eficiência de consumo (previsto × realizado), taxa de aprovação de qualidade, tempo de ciclo, lead time de importação, custo unitário por lote.
18. **Auditoria Completa:** Toda ação do módulo Indústria registrada na auditoria central da plataforma, com timeline cronológica por registro (pedido de compra internacional, processo de importação, recebimento, inspeção, ordem de produção, lote).

**Estruturas Compartilhadas (Shared Platform Services) utilizadas pelo Indústria:**

- `currencies` — cadastro de moedas (reclassificado de `ind_currencies`)
- `exchange_rates` — taxas de câmbio (reclassificado de `ind_exchange_rates`)
- `import_processes` — processos de importação (reclassificado de `ind_imports`)
- `import_costs` — custos de importação/landing cost (reclassificado de `ind_import_costs`)
- `quality_inspections` — inspeções de qualidade com campo `modulo_origem` (reclassificado de `ind_quality_inspections`)
- `quality_parameters` — parâmetros de qualidade com campo `modulo_origem` (reclassificado de `ind_quality_parameters`)
- `production_resources` — recursos de produção com campo `tipo` (reclassificado de `ind_production_lines`)

**Estruturas Estendidas (não duplicadas):**

- `purchase_orders` — estendido com campos de multi-moeda para compras internacionais
- `wms_receipts` / `stock_checkings` — estendidos para recebimento de matéria-prima
- `stock_batches` — reutilizado para quarentena (via campo `situacao`) e lotes de produto acabado
- Localizações do WMS — reutilizadas para localizações tipo quarentena

**Estruturas Específicas do Indústria (MVP):**

- BOM versionada (imutável por versão)
- Ordens de Produção (com `bom_id` + `bom_version`)
- Apontamentos de produção (consumo real de matéria-prima)

**KPIs Indústria:**

- OTIF de produção (On-Time In-Full)
- Eficiência de consumo (previsto × realizado)
- Taxa de aprovação de qualidade (%)
- Tempo de ciclo médio
- Lead time de importação (dias)
- Custo unitário por lote
- Variância de custo (previsto × realizado)

**Dependências:** Compras, Estoque/WMS, Financeiro, Fiscal, Logística
**Aceitação:** O gestor industrial consegue rastrear qualquer lote de produto acabado até a origem da matéria-prima, passando por importação, recebimento, inspeção, produção e expedição, com identificação imediata de clientes impactados em caso de problema.

---

## 4. Agentes de IA

### 4.1 Visão de Agentes

Cada domínio pode ter agentes especializados que conhecem as regras de negócio, os dados e os contextos daquele domínio. Os agentes colaboram entre si quando uma tarefa cruza domínios.

### 4.2 Agentes Planejados

| Agente      | Domínio    | Objetivo                                                              |
| ----------- | ---------- | --------------------------------------------------------------------- |
| Atendimento | SAC        | Responder clientes, classificar tickets, sugerir soluções             |
| Vendas      | Comercial  | Qualificar leads, sugerir próximos passos, prever fechamento          |
| Cobrança    | Financeiro | Identificar inadimplentes, sugerir renegociação, preparar comunicação |
| Compras     | Compras    | Sugerir reposição, comparar fornecedores, alertar prazos              |
| Estoque     | Estoque    | Prever ruptura, sugerir reposição, otimizar layout                    |
| Logística   | Logística  | Otimizar rotas, prever atrasos, sugerir realocação                    |
| Financeiro  | Financeiro | Projetar fluxo de caixa, sugerir investimentos, alertar riscos        |
| Fiscal      | Fiscal     | Validar documentos, alertar inconsistências, sugerir correções        |
| RH          | RH         | Alertar conformidade, sugerir treinamentos, monitorar ponto           |

### 4.3 Níveis de Autonomia

Configuráveis por agente e por cliente:

- Somente Consultar
- Consultar e Sugerir
- Preparar Ações
- Executar com Confirmação
- Executar Ações Autorizadas

---

## 5. Regras de Negócio

> Todas as regras abaixo são **independentes de tecnologia** e representam decisões de produto.

### 5.1 Regras Comerciais

- Todo pedido deve ter cliente, itens, condição de pagamento e tabela de preço.
- Descontos acima do máximo permitido exigem aprovação.
- Pedidos podem ser reservados em estoque antes do faturamento.
- Devoluções geram crédito ou estorno conforme configuração.

### 5.2 Regras Financeiras

- Toda movimentação financeira deve ter contrapartida (origem e destino).
- Pagamentos acima do limite exigem aprovação.
- Conciliação bancária deve identificar automaticamente correspondências.
- Fechamento contábil bloqueia alterações no período fechado.

### 5.3 Regras de Estoque

- Saldo negativo é bloqueado por padrão (configurável para liberação com aprovação).
- Produtos com lote exigem controle de validade (FIFO/FEFO).
- Inventário cíclico é sugerido automaticamente pela IA.
- Transferências entre filiais exigem aprovação conforme valor.

### 5.4 Regras de Logística

- Toda entrega deve ter comprovante (foto, assinatura ou geolocalização).
- Ocorrências de atraso geram notificação automática ao cliente.
- Rotas são otimizadas por IA considerando janelas de entrega e capacidade.
- Custos de frete são calculados automaticamente conforme tabela.

### 5.5 Regras de RH

- Folha de pagamento não pode ser fechada com pendências de ponto.
- Férias exigem aprovação do gestor.
- Documentos trabalhistas com validade próxima geram alerta.
- Conformidade SST é monitorada continuamente.

### 5.6 Regras Fiscais

- Toda operação fiscal deve ter CFOP, NCM e CST/CSOSN configurados.
- Notas rejeitadas são automaticamente corrigidas com sugestão da IA.
- Apuração de impostos é gerada automaticamente por período.
- Certificados digitais com validade próxima geram alerta.

### 5.7 Regras de Segurança

- Senhas nunca são armazenadas em texto plano.
- Dados pessoais sensíveis são criptografados a nível de campo.
- Ações críticas exigem MFA.
- Logs de auditoria são imutáveis.

### 5.8 Regras de Permissão

- Toda funcionalidade é protegida por permissão granular.
- Permissões são organizadas por função (role) e customizáveis.
- Dados sensíveis (custos, margens) têm permissão separada.
- Superusuário (SUP) tem acesso irrestrito.

---

## 6. KPIs por Área + Dashboards Executivos

### 6.1 KPIs por Área

| Área           | KPIs principais                                                                       |
| -------------- | ------------------------------------------------------------------------------------- |
| **Comercial**  | Receita, conversão, ticket médio, ciclo de venda, rentabilidade, forecast             |
| **Financeiro** | Fluxo de caixa, inadimplência, margem, prazo médio recebimento/pagamento, conciliação |
| **Compras**    | Lead time, economia em cotação, % no prazo, divergências, custo aquisição             |
| **Logística**  | OTIF, custo frete, ocorrências, tempo entrega, utilização frota                       |
| **Estoque**    | Acuracidade, giro, valor parado, ruptura, vencimentos, produtividade                  |
| **Marketing**  | CAC, LTV, ROI, conversão, engajamento                                                 |
| **RH**         | Headcount, turnover, absenteísmo, custo pessoal, conformidade                         |
| **SAC**        | Tempo resposta, resolução primeiro contato, satisfação (NPS), SLA                     |

### 6.2 Dashboards Executivos

**Dashboard da Diretoria:**

- Visão consolidada de receita, custo e margem
- Health score de cada área (verde/amarelo/vermelho)
- Alertas críticos do dia
- Previsões de IA (receita, caixa, ruptura)

**Dashboard da Presidência:**

- KPIs estratégicos (crescimento, rentabilidade, market share)
- Tendências e previsões
- Comparações com período anterior e metas
- Mapa de riscos e oportunidades

---

## 7. Configuration Center

> O Configuration Center é o coração da flexibilidade da plataforma — permite configurar o sistema sem código.

### 7.1 O que é Configurável

| Categoria         | Exemplos                                                                    |
| ----------------- | --------------------------------------------------------------------------- |
| **Fluxos**        | Aprovação de pagamento, aprovação de desconto, fluxo de compra, fluxo de RH |
| **Regras**        | Desconto máximo, limite de crédito, estoque mínimo, alertas                 |
| **Nomenclaturas** | Numeração de pedidos, notas, orçamentos, contratos                          |
| **Departamentos** | Estrutura organizacional, centros de custo                                  |
| **Permissões**    | Matriz de perfis, permissões por módulo/ação                                |
| **Dashboards**    | KPIs visíveis, layout, filtros padrão                                       |
| **Notificações**  | Eventos, destinatários, canais (e-mail, WhatsApp, push)                     |
| **Automações**    | Gatilhos, condições, ações                                                  |
| **Agentes**       | Autonomia, base de conhecimento, horários                                   |
| **Templates**     | E-mails, documentos, propostas                                              |
| **Impostos**      | Alíquotas, CFOP, NCM, CST                                                   |

### 7.2 Princípio: Sempre Sem Código Quando Possível

Toda configuração deve ser feita via interface. Se uma regra de negócio exige código, isso é uma falha de produto que deve ser corrigida.

---

## 8. Plataforma Orientada a Decisão

> Cada módulo deve ajudar o usuário a tomar melhores decisões.

### 8.1 As 4 Perguntas por Módulo

Cada módulo responde:

1. **O que está acontec?** — Dashboard com situação atual
2. **Por quê?** — Drill-down, análise de causa raiz
3. **O que pode acontecer?** — Previsões e cenários
4. **O que devemos fazer agora?** — Recomendações prescritivas

### 8.2 Exemplos

| Módulo     | O que está acontecendo?     | Por quê?                   | O que pode acontecer?         | O que fazer?                                                      |
| ---------- | --------------------------- | -------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| Financeiro | Inadimplência em 15%        | 3 clientes representam 80% | Pode chegar a 22% em 60 dias  | "Sugiro renegociar cliente X (75% de chance de recuperação)"      |
| Estoque    | 5 produtos abaixo do mínimo | Venda atípica de produto A | Ruptura em 7 dias             | "Sugiro comprar 200 unidades do fornecedor Y (entrega em 3 dias)" |
| Logística  | 3 entregas atrasadas        | Veículo quebrou na rota B  | Mais 5 entregas podem atrasar | "Sugiro realocar para veículo C (economia de 2h)"                 |

---

## 9. Inteligência Preditiva e Prescritiva

### 9.1 Visão Preditiva

| Previsão                       | Método                                            | Horizonte          |
| ------------------------------ | ------------------------------------------------- | ------------------ |
| Previsão de vendas             | Histórico + sazonalidade + tendências             | 30/60/90 dias      |
| Previsão de ruptura de estoque | Consumo médio + lead time + estoque atual         | Por produto        |
| Previsão de fluxo de caixa     | Contas a receber/pagar + histórico + sazonalidade | 30/60/90 dias      |
| Previsão de inadimplência      | Histórico de pagamento + perfil do cliente        | Por cliente        |
| Previsão de demanda            | Histórico + eventos + tendências de mercado       | Por produto/região |
| Previsão de compra             | Previsão de demanda + estoque + lead time         | Por produto        |

### 9.2 Visão Prescritiva

A IA não apenas prevê, mas **sugere a melhor ação** com nível de confiança:

- "Sugiro pagar a conta X amanhã via PIX (economia de R$ 500 em juros)"
- "Sugiro aprovar o desconto de 8% no pedido Y (cliente estratégico, margem ainda positiva)"
- "Sugiro recomprar produto Z do fornecedor W (melhor preço, entrega em 3 dias)"

Cada sugestão inclui: **ação recomendada, justificativa, nível de confiança, impacto esperado, e alternativa.**

---

## 10. Arquitetura Comercial

### 10.1 Planos

| Plano        | Preço\*                | Usuários  | Módulos        | IA       | Suporte        |
| ------------ | ---------------------- | --------- | -------------- | -------- | -------------- |
| Trial        | Grátis (14 dias)       | 3         | Essenciais     | Básica   | E-mail         |
| Free         | Grátis                 | 1         | Básicos        | Não      | Comunidade     |
| Starter      | A partir de R$ 149/mês | 5         | Essenciais     | Não      | E-mail         |
| Professional | A partir de R$ 449/mês | 25        | Todos          | Básica   | Chat + E-mail  |
| Enterprise   | Sob consulta           | Ilimitado | Todos + Custom | Avançada | SLA + Dedicado |

\*Preços ilustrativos — definidos pelo comercial.

### 10.2 Ciclo de Vida

- **Onboarding automático:** Trial ativa configuração guiada
- **Ativação:** Cliente configura empresa, importa dados, convida usuários
- **Upgrade:** Automático, features liberadas imediatamente
- **Downgrade:** No final do ciclo, features bloqueadas com período de graça
- **Cancelamento:** Dados retidos 90 dias, reativação sem perda
- **Reativação:** Restauração completa

### 10.3 Billing

- Cobrança recorrente (mensal/anual)
- Pagamento via cartão, PIX, boleto
- Prorrogação/crédito proporcional em upgrades/downgrades
- Fatura detalhada por usuário/módulo/consumo

### 10.4 Marketplace Futuro

- Plugins de terceiros
- Modelos de IA por setor
- Integrações verticais
- Templates de configuração
- Receita compartilhada (revenue share)

### 10.5 APIs Públicas

- Documentação OpenAPI
- Rate limiting por plano
- Webhooks para eventos
- SDKs (JavaScript, Python)
- Sandbox para desenvolvimento

### 10.6 Portal do Cliente

- Self-service: segunda via, rastreamento, solicitações
- Histórico de pedidos e entregas
- Comunicação com a empresa
- Documentos disponíveis para download

---

## 11. White Label Readiness

A plataforma deve estar pronta para White Label:

- Branding customizável (logo, cores, nome, domínio)
- Templates de e-mail e documentos com marca do parceiro
- Planos e preços customizados por parceiro
- Isolamento de dados do parceiro
- Dashboard do parceiro (seus clientes, consumo, receita)

**Status atual:** Preparado conceitualmente; implementação completa no V2.

---

## 12. Master Portal

Painel exclusivo da equipe Velora Log para administrar a plataforma:

### 12.1 Funcionalidades do Master Portal

| Seção             | Funcionalidades                                |
| ----------------- | ---------------------------------------------- |
| **Clientes**      | Lista, planos, status, consumo, saúde          |
| **Planos**        | Configuração, preços, features por plano       |
| **Consumo**       | Usuários, registros, armazenamento, banda      |
| **IA**            | Tokens consumidos, chamadas, custo por cliente |
| **Custos**        | Infraestrutura, IA, integrações por cliente    |
| **Saúde**         | Uptime, latência, erros, alertas               |
| **Licenças**      | Ativação, revogação, renovação                 |
| **Módulos**       | Ativação/desativação por cliente               |
| **Integrações**   | Status, logs, configuração                     |
| **Feature Flags** | Ativação por cliente, plano ou global          |
| **Marketplace**   | Gestão de plugins, aprovação, revenue share    |

---

## 13. Rastreabilidade

| Requisito PRD | Referência Arquitetural | ADR     |
| ------------- | ----------------------- | ------- |
| Multi-tenancy | ARCHITECTURE.md §3      | ADR-001 |
| API First     | ARCHITECTURE.md §4      | ADR-002 |
| IA Nativa     | ARCHITECTURE.md §8      | ADR-003 |
| Feature Flags | ARCHITECTURE.md §5      | ADR-004 |
| Auditoria     | ARCHITECTURE.md §7      | ADR-005 |
| White Label   | ARCHITECTURE.md §9      | ADR-006 |
| Master Portal | ARCHITECTURE.md §10     | ADR-007 |
| Marketplace   | ARCHITECTURE.md §11     | ADR-008 |

---

## 14. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** A cada release ou mudança de escopo
- **Responsável:** Product Owner
- **Aprovação:** Architecture Council
- **Rastreabilidade:** Cada requisito tem ID único e referência cruzada

---

_Este PRD representa a visão completa de produto. A tecnologia pode mudar; as regras de negócio e o valor entregue ao cliente permanecem._

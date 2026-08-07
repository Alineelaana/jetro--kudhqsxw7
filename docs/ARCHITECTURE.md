# ARCHITECTURE.md — Arquitetura Conceitual

> **Documento vivo — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Oficial
> Responsável: Architecture Council

---

## 1. Princípio: Produto antes de Tecnologia

Este documento descreve a **arquitetura conceitual** da plataforma — independente da ferramenta atual. O objetivo é que este documento permaneça válido mesmo se a plataforma migrar para outra stack tecnológica.

### Separação de Responsabilidades

| Camada                        | Responsabilidade                                                             | Muda com frequência?                   |
| ----------------------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| **Regras de Negócio**         | O que a plataforma faz (validações, fluxos, cálculos, decisões)              | Sim — evolui com o produto             |
| **Arquitetura da Plataforma** | Como a plataforma é estruturada (multi-tenancy, modularidade, APIs, eventos) | Raramente — mudanças exigem ADR        |
| **Tecnologia**                | Ferramentas usadas (linguagem, banco, framework, provedor cloud)             | Pode mudar sem afetar as camadas acima |

> **Regra de ouro:** Nenhuma regra de negócio pode depender da tecnologia atual. Se uma regra depende de "PocketBase faz X" ou "PostgreSQL suporta Y", ela está mal escrita.

---

## 2. Visão Arquitetural de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        Camada de Apresentação                    │
│   Web App  │  Mobile App  │  Portal do Cliente  │  Master Portal │
└──────────────────────┬──────────────────────────────────────────┘
                       │  APIs REST versionadas + Webhooks
┌──────────────────────┴──────────────────────────────────────────┐
│                        API Gateway                               │
│         Auth │ Rate Limit │ Versioning │ Feature Flags           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                    Camada de Domínios                             │
│  Comercial │ Compras │ Financeiro │ Estoque │ Logística │ RH    │
│  Fiscal │ Contábil │ Marketing │ CRM │ Atendimento │ IA         │
└──────────────────────┬──────────────────────────────────────────┘
                       │  Eventos + Serviços
┌──────────────────────┴──────────────────────────────────────────┐
│              Camada de Plataforma (Cross-cutting)                 │
│  Auditoria │ Permissões │ Notificações │ Config Center │ Backups │
│  Observabilidade │ Feature Flags │ Multi-tenancy │ White Label   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                    Camada de Dados                                │
│   Banco de Dados │ Cache │ File Storage │ Search Index │ Vectors  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2.2 Official Platform Tree (Perspectiva de Produto)

A plataforma é organizada sob uma perspectiva de produto em cinco áreas principais. Cada área agrupa componentes e módulos que compartilham propósito e contexto de negócio.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     VELORA LOG — PLATFORM TREE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. PLATAFORMA (Core)                                               │
│     ├── Shared Platform Services                                    │
│     │   ├── Empresas & Filiais                                      │
│     │   ├── Usuários & Permissões                                   │
│     │   ├── Produtos & Clientes & Fornecedores                      │
│     │   ├── Auditoria & Notificações                                │
│     │   ├── IA & Automações & Integrações                           │
│     │   ├── Documentos & Anexos & Comentários                       │
│     │   ├── Tarefas & Workflows & Aprovações                        │
│     │   ├── Configurações & Templates                               │
│     │   ├── Moedas & Câmbio                                         │
│     │   ├── Qualidade & Comércio Exterior                           │
│     │   ├── Dashboards & KPIs & Feature Flags                       │
│     │   └── Backups & Restore                                       │
│     ├── Configuration Center                                        │
│     ├── Multi-tenancy & Multi-empresa                               │
│     └── Segurança & LGPD                                            │
│                                                                      │
│  2. GESTÃO EMPRESARIAL                                              │
│     ├── Comercial (Pedidos, Faturamento, NF-e/NFC-e/NFS-e)         │
│     ├── Compras (Requisições, Cotações, Pedidos, Recebimento)      │
│     ├── Financeiro (Contas, Fluxo de Caixa, Conciliação)           │
│     ├── Estoque & WMS (Produtos, Lotes, Inventário, Expedição)     │
│     ├── Logística (Rotas, Entregas, Frota, Comprovantes)           │
│     ├── Indústria (Compras Internacionais, Importação, MRP, PCP,   │
│     │              Produção, Qualidade, Rastreabilidade)            │
│     ├── Fiscal (NF-e, NFC-e, NFS-e, Apuração, SPED, Reforma)       │
│     ├── Contábil (Plano de Contas, DRE, Fechamento)                │
│     ├── RH & DP & SST (Colaboradores, Folha, Ponto, Conformidade)  │
│     ├── CRM (Leads, Oportunidades, Funil, Propostas)               │
│     ├── Marketing (Campanhas, CMS, Vitrine, Formulários)           │
│     └── Atendimento / SAC (Tickets, SLA, Classificação IA)         │
│                                                                      │
│  3. PORTAIS                                                         │
│     ├── Portal do Cliente (Self-service, Pedidos, Rastreamento)     │
│     ├── Portal do Fornecedor (Cotações, Pedidos, Notas)             │
│     ├── App do Motorista (Entregas, Comprovantes, Offline)          │
│     └── Área da Empresa (Admin, Dashboard, Gestão)                  │
│                                                                      │
│  4. ECOSSISTEMA                                                     │
│     ├── APIs Públicas (OpenAPI, SDKs, Webhooks)                    │
│     ├── Marketplace (Plugins, Integrações, Modelos de IA)           │
│     ├── White Label (Branding, Domínio, Templates)                  │
│     └── Developer Platform (SDK, Docs, Comunidade)                  │
│                                                                      │
│  5. GOVERNANÇA                                                      │
│     ├── Master Portal (Gestão da Plataforma)                        │
│     ├── Conselho de Arquitetura (ADRs, Decisões)                    │
│     ├── Auditoria Inteligente (Logs, Detecção de Anomalias)        │
│     ├── Observabilidade (APM, Métricas, Health Checks)              │
│     └── Conformidade (LGPD, Trabalhista, Fiscal)                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Shared Platform Services

Os **Shared Platform Services** são serviços de plataforma que não pertencem a nenhum módulo específico. São estruturas centrais, neutras e compartilhadas, utilizadas por múltiplos domínios. Este princípio (Neutralidade dos Módulos) garante que estruturas com potencial de reuso não nasçam acopladas a um módulo.

| Serviço               | Descrição                                                                                                                           | Módulos que utilizam                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Empresas**          | Cadastro de empresas (multi-empresa)                                                                                                | Todos                                                |
| **Filiais**           | Cadastro de filiais (multi-filial)                                                                                                  | Todos                                                |
| **Usuários**          | Gestão de usuários e autenticação                                                                                                   | Todos                                                |
| **Permissões**        | Matriz granular de permissões (role × módulo × ação)                                                                                | Todos                                                |
| **Produtos**          | Catálogo de produtos, variações, códigos                                                                                            | Comercial, Compras, Estoque, Indústria, Fiscal       |
| **Clientes**          | Cadastro de clientes (PF/PJ)                                                                                                        | Comercial, CRM, Financeiro, Portal do Cliente        |
| **Fornecedores**      | Cadastro de fornecedores/parceiros                                                                                                  | Compras, Financeiro, Indústria                       |
| **Auditoria**         | Logs imutáveis, timeline por registro, detecção de anomalias                                                                        | Todos                                                |
| **IA**                | Camada de IA (agentes, RAG, automações, preditiva)                                                                                  | Todos                                                |
| **Automações**        | Gatilho → condição → ação                                                                                                           | Todos                                                |
| **Integrações**       | Conectores com sistemas externos (SEFAZ, bancos, transportadoras)                                                                   | Todos                                                |
| **Documentos**        | Geração e gestão de documentos (notas, contratos, propostas)                                                                        | Comercial, Fiscal, RH, Indústria                     |
| **Anexos**            | Gestão de arquivos anexos a qualquer registro                                                                                       | Todos                                                |
| **Comentários**       | Comentários em qualquer registro                                                                                                    | Todos                                                |
| **Tarefas**           | Tarefas vinculadas a registros e usuários                                                                                           | Todos                                                |
| **Workflows**         | Fluxos de trabalho visuais configuráveis                                                                                            | Todos                                                |
| **Aprovações**        | Fluxos de aprovação configuráveis                                                                                                   | Todos                                                |
| **Notificações**      | Notificações in-app, e-mail, push                                                                                                   | Todos                                                |
| **Configurações**     | Parâmetros do sistema (Configuration Center)                                                                                        | Todos                                                |
| **Templates**         | Templates de e-mail, documentos, propostas                                                                                          | Todos                                                |
| **Moedas**            | Cadastro de moedas (`currencies`) — reclassificado de `ind_currencies`                                                              | Financeiro, Compras, Indústria, Comercial            |
| **Câmbio**            | Taxas de câmbio (`exchange_rates`) — reclassificado de `ind_exchange_rates`                                                         | Financeiro, Compras, Indústria                       |
| **Qualidade**         | Inspeções (`quality_inspections`) e parâmetros (`quality_parameters`) com campo `modulo_origem` — reclassificado de `ind_*`         | Indústria, Compras, Logística, Estoque               |
| **Comércio Exterior** | Processos de importação (`import_processes`), custos de importação (`import_costs`) — reclassificado de `ind_*`                     | Indústria, Compras (futuro: Distribuidores, Trading) |
| **Dashboards**        | Dashboards configuráveis por usuário/função                                                                                         | Todos                                                |
| **KPIs**              | Indicadores configuráveis                                                                                                           | Todos                                                |
| **Feature Flags**     | Controle de funcionalidades por cliente/plano/global                                                                                | Todos                                                |
| **Canais Digitais**   | Registro, configuração e auditoria de canais digitais que consomem serviços da plataforma (VeloraLog, Portais, App, WhatsApp, etc.) | Marketing, Comercial, Atendimento, Plataforma        |

### 2.4 Reclassificação de Estruturas (ADR-011)

Como aplicação do Princípio da Neutralidade dos Módulos (PLATFORM_PRINCIPLES §4.2) e do Princípio da Evolução Sustentável (§4.1), as seguintes estruturas originalmente concebidas como específicas do módulo Indústria foram reclassificadas como **Shared Platform Services**:

| Estrutura Original (Indústria) | Nova Estrutura (Shared) | Motivo da Reclassificação                                                                                                |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ind_currencies`               | `currencies`            | Multi-moeda é necessidade transversal (Financeiro, Comercial, Compras, Indústria)                                        |
| `ind_exchange_rates`           | `exchange_rates`        | Câmbio é serviço compartilhado                                                                                           |
| `ind_imports`                  | `import_processes`      | Processos de importação utilizáveis por Indústria, Distribuidores, Trading Companies                                     |
| `ind_import_costs`             | `import_costs`          | Composição de custos de importação é serviço compartilhado                                                               |
| `ind_quality_inspections`      | `quality_inspections`   | Qualidade aplica-se a recebimento, produção, expedição, devolução, transporte; campo `modulo_origem` identifica contexto |
| `ind_quality_parameters`       | `quality_parameters`    | Parâmetros de qualidade multi-domínio; campo `modulo_origem`                                                             |
| `ind_production_lines`         | `production_resources`  | Recursos de produção com campo `tipo` (linha, máquina, centro de trabalho); reutilizável por manutenção, OEE             |

**Campo `modulo_origem`:** As estruturas `quality_inspections` e `quality_parameters` incluem um campo `modulo_origem` que identifica o contexto de origem (recebimento, produção, expedição, devolução, transporte, etc.), permitindo uso multi-domínio sem acoplamento.

**Campo `tipo`:** A estrutura `production_resources` inclui um campo `tipo` que classifica o recurso (linha de produção, máquina, centro de trabalho, etc.), permitindo reuso por módulos de manutenção, OEE e outros.

---

## 2.5 Arquitetura de Canais Digitais (ADR-020)

### 2.5.1 Visão Conceitual Multi-Canais

A plataforma é desenhada conceitualmente para suportar **múltiplos Canais Digitais independentes** que consomem Shared Platform Services. A arquitetura conceitual multi-canais é:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTES                                    │
│   (Pessoas e Empresas que interagem com a plataforma)                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────────┐
│                     CANAIS DIGITAIS                                  │
│   VeloraLog │ Sites Institucionais │ Landing Pages │ Portal do       │
│   Cliente │ Portal do Fornecedor │ App Mobile │ WhatsApp │          │
│   Instagram │ Facebook │ Chatbots │ Marketplace │ APIs Públicas │   │
│   Integrações Externas                                              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  APIs REST seguras + Webhooks
┌──────────────────────────┴──────────────────────────────────────────┐
│                SHARED PLATFORM SERVICES                              │
│   Empresas │ Filiais │ Usuários │ Permissões │ Produtos │ Clientes  │
│   Fornecedores │ Auditoria │ IA │ Automações │ Integrações │         │
│   Documentos │ Notificações │ Configurações │ Canais Digitais │      │
│   Moedas │ Câmbio │ Qualidade │ Dashboards │ Feature Flags           │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────────┐
│           PLATAFORMA INTELIGENTE DE GESTÃO EMPRESARIAL               │
│   Comercial │ Compras │ Financeiro │ Estoque │ Logística │ RH │      │
│   Fiscal │ Contábil │ CRM │ Atendimento │ Indústria                  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────────┐
│                    GESTÃO EMPRESARIAL                                │
│   Regras de negócio, fluxos, cálculos, decisões                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────────┐
│                         IA                                           │
│   Agentes │ RAG │ Automações │ Preditiva │ Prescritiva              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────────┐
│                      AUDITORIA                                       │
│   Logs imutáveis │ Timeline │ Detecção de anomalias                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.5.2 Princípio: A Plataforma Não Conhece Canais Específicos

A Plataforma **não conhece nenhum canal específico** — ela apenas conhece o conceito de **Canal Digital**. Todo canal que consome os serviços da plataforma é tratado de forma genérica e neutra, através de APIs seguras e Shared Platform Services. Isto significa:

- A Plataforma não possui lógica acoplada a "VeloraLog", "Portal do Cliente" ou "App Mobile".
- Qualquer canal pode ser adicionado, removido ou modificado sem alterar o core da Plataforma.
- A autenticação, autorização e auditoria são centralizadas na Plataforma, não no canal.

### 2.5.3 VeloraLog como Primeiro Canal Digital

**VeloraLog não é mais "o site do sistema".** VeloraLog passa a ser o **primeiro Canal Digital da Plataforma**, mantendo seu próprio domínio (logistica-premium-es), sem recursos administrativos. Como Canal Digital, VeloraLog:

- Consome os Shared Platform Services da Plataforma através de APIs seguras.
- Foca na experiência do cliente (orçamento via WhatsApp, conteúdo institucional, vitrine).
- Não contém lógica de gestão empresarial — apenas apresenta dados e captura interações.
- Pode ser substituído ou complementado por outros canais sem impacto na Plataforma.

### 2.5.4 Canal Digital como Shared Platform Service

O conceito de **Canal Digital** é incorporado à lista de Shared Platform Services (§2.3). O serviço de Canal Digital gerencia:

- Registro e configuração de canais ativos.
- Autenticação e autorização por canal.
- Roteamento de interações para os serviços apropriados.
- Auditoria de interações originadas em cada canal.

### 2.5.5 Future-Proofing: Novos Canais Sem Redesenho

A arquitetura deve garantir que os seguintes canais possam ser conectados no futuro usando o mesmo padrão arquitetural, **sem alterar a Plataforma**:

- Sites institucionais adicionais
- Landing pages de campanha
- Portal do Cliente (self-service)
- Portal do Fornecedor (cotações, pedidos, notas)
- Aplicativo mobile (gestão e cliente)
- WhatsApp Business
- Instagram / Facebook
- Chatbots
- Marketplace
- APIs públicas (para parceiros e integradores)
- Integrações externas (sistemas de terceiros)

### 2.5.6 Implementação Atual vs. Arquitetura Conceitual

| Aspecto              | Arquitetura Conceitual (Oficial)        | Implementação Atual (Temporária)       |
| -------------------- | --------------------------------------- | -------------------------------------- |
| **Canais**           | Múltiplos Canais Digitais independentes | VeloraLog como único canal ativo       |
| **Deploy**           | Projetos separados por canal            | Projeto único no Skip Cloud            |
| **Domínio**          | Domínio próprio por canal               | Domínio único compartilhado            |
| **Infraestrutura**   | Agnóstica                               | Skip Cloud (PocketBase)                |
| **Separação física** | Prevista na arquitetura                 | Restrição temporária de infraestrutura |

> **Regra de ouro:** A Implementação Atual nunca redefine a Arquitetura Conceitual. Limitações de infraestrutura são restrições temporárias documentadas, não decisões de arquitetura. (PLATFORM_PRINCIPLES §4.9)

---

## 3. Multi-tenancy

### 3.1 Problema

Diferentes clientes compartilham a mesma instância da plataforma, mas seus dados devem ser isolados. Clientes Enterprise podem futuramente exigir instâncias dedicadas.

### 3.2 Alternativas Analisadas

| Alternativa                           | Prós                                    | Contras                                  |
| ------------------------------------- | --------------------------------------- | ---------------------------------------- |
| Banco único, isolamento por Tenant ID | Simples, baixo custo, bom para SMB      | Noisy neighbor, isolamento apenas lógico |
| Schema por tenant                     | Melhor isolamento, backup por cliente   | Complexidade de manutenção               |
| Instância dedicada                    | Isolamento total, performance garantida | Custo alto, gestão complexa              |

### 3.3 Decisão (ADR-001)

Isolamento lógico por **Tenant ID** em todos os dados e operações. Toda query, toda regra, todo serviço filtra por Tenant ID. A camada de acesso a dados abstrai o local físico do banco, permitindo migrar um tenant para instância dedicada sem refatoração de código de negócio.

### 3.4 Migração para Instância Dedicada

Quando um cliente Enterprise exige instância dedicada:

1. Provisionar nova instância
2. Migrar dados do tenant (ferramenta de migração)
3. Atualizar roteamento no API Gateway
4. Código de negócio não muda — apenas a camada de dados

---

## 4. API First

### 4.1 Problema

Interfaces acopladas a uma única UI limitam integrações, mobile, marketplace e automações externas.

### 4.2 Decisão (ADR-002)

- Toda funcionalidade é exposta via API REST versionada antes da UI.
- A UI é apenas um cliente da API.
- APIs seguem especificação OpenAPI.
- Versionamento via URL (`/api/v1/`, `/api/v2/`) ou header.
- Webhooks para notificar sistemas externos de eventos.

### 4.3 Comunicação entre Domínios

- **Síncrona:** Chamadas de API entre domínios (quando a resposta é necessária imediatamente).
- **Assíncrona:** Eventos publicados em um event bus (quando a ação pode ser processada posteriormente).
- Domínios nunca acessam o banco de outro domínio diretamente.

### 4.4 Contratos

- Cada domínio publica seus contratos (schemas de request/response).
- Mudanças em contratos seguem versionamento semântico.
- Breaking changes exigem nova versão da API.

---

## 5. Modularidade, Feature Flags e Plugins

### 5.1 Modularidade (ADR-004)

- Cada domínio é um módulo independente com suas regras, dados e APIs.
- Módulos podem ser ativados/desativados por cliente (feature flags).
- Módulos se comunicam via contratos, nunca via acesso direto.

### 5.2 Feature Flags

- Toda funcionalidade é controlada por feature flags.
- Níveis: global, por plano, por cliente, por usuário.
- Permite lançamentos graduais (canary, beta).
- Configuração via Master Portal.

### 5.3 Preparação para Plugins/Marketplace (ADR-008)

- Arquitetura reserva pontos de extensão (hooks, webhooks, APIs públicas).
- Plugins podem: adicionar campos, criar fluxos, integrar sistemas, criar agentes de IA.
- Sandbox de plugins para segurança.
- Marketplace para distribuição (V2+).

---

## 6. Observabilidade e Performance

### 6.1 Observabilidade (ADR-009)

| Dimensão    | O que é monitorado                                      | Ferramenta conceitual |
| ----------- | ------------------------------------------------------- | --------------------- |
| Performance | Tempo de resposta por endpoint, por domínio             | APM                   |
| Uso         | Funcionalidades mais usadas, módulos ativos, frequência | Analytics             |
| Erros       | Taxa de erro, exceções, falhas de integração            | Error tracking        |
| Latência    | Tempo entre requisição e resposta, gargalos             | Tracing distribuído   |
| Saúde       | Uptime, uso de CPU/memória/disco, filas                 | Health checks         |

### 6.2 Metas de Performance

| Métrica                       | Meta                            |
| ----------------------------- | ------------------------------- |
| Tempo de carregamento de tela | < 2 segundos                    |
| Resposta de API (p95)         | < 300ms                         |
| Consulta de lista (p95)       | < 500ms                         |
| Processamento assíncrono      | < 30 segundos para 95% dos jobs |
| Disponibilidade (uptime)      | 99.9% (Enterprise: 99.99%)      |

### 6.3 Estratégias

- **Cache:** Dados de leitura frequente (parâmetros, configurações, catálogos).
- **Processamento assíncrono:** Operações pesadas (fechamento, relatórios, integrações).
- **Otimização de queries:** Índices apropriados, paginação, lazy loading.
- **CDN:** Assets estáticos e conteúdo do site.

---

## 7. Segurança

### 7.1 LGPD (ADR-010)

- Dados pessoais classificados por sensibilidade.
- Consentimento explícito registrado.
- Direitos do titular garantidos (acesso, retificação, eliminação, portabilidade).
- DPO designado.

### 7.2 Criptografia

- Em trânsito: TLS 1.3 obrigatório.
- Em repouso: criptografia de disco.
- Campo-a-campo: dados sensíveis (CPF, CNPJ, dados bancários) criptografados individualmente.

### 7.3 MFA

- TOTP (Google Authenticator, Authy).
- Obrigatório para: administradores, operações financeiras críticas, acesso ao Master Portal.
- Opcional (recomendado) para demais usuários.

### 7.4 Logs Imutáveis (ADR-005)

- Logs de auditoria são append-only.
- Armazenados em storage separado, sem permissão de alteração.
- Retenção mínima: 5 anos (configurável por regulamentação).

### 7.5 Permissões Granulares

- Matriz de permissões por função (role) × módulo × ação.
- Permissões customizáveis sem código.
- Permissões especiais para dados sensíveis.
- Validação no servidor (nunca confiar apenas no frontend).

### 7.6 Auditoria Completa

- Toda ação relevante registrada com contexto total.
- Detecção de anomalias via IA.
- Alertas configuráveis para ações críticas.
- Timeline cronológica por registro.

---

## 8. Inteligência Artificial

### 8.1 Arquitetura de IA (ADR-003)

```
┌───────────────────────────────────────────────┐
│              Camada de IA                       │
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Agente  │  │ Agente  │  │ Agente  │        │
│  │ Vendas  │  │ Estoque │  │ Financ. │  ...    │
│  └────┬────┘  └────┬────┘  └────┬────┘        │
│       └────────────┼────────────┘              │
│                    │                            │
│  ┌─────────────────┴──────────────────┐       │
│  │       Roteador de Agentes           │       │
│  │  (decide qual agente responde)      │       │
│  └─────────────────┬──────────────────┘       │
│                    │                            │
│  ┌─────────────────┴──────────────────┐       │
│  │    Camada de Modelos (intercambiável)│       │
│  │  LLM │ Embeddings │ Especializados  │       │
│  └─────────────────┬──────────────────┘       │
│                    │                            │
│  ┌─────────────────┴──────────────────┐       │
│  │  Base de Conhecimento (RAG)         │       │
│  │  + Vetores + Histórico + Regras     │       │
│  └──────────────────────────────────────┘       │
└───────────────────────────────────────────────┘
```

### 8.2 Princípios

- **Provedor intercambiável:** A camada de modelos é abstraída; trocar de provedor não afeta o código de negócio.
- **Agentes especializados:** Cada domínio pode ter seu próprio agente com personalidade, base de conhecimento e permissões.
- **RAG nativo:** A IA sempre tem acesso aos dados do cliente (com permissões) via retrieval.
- **Aprendizado controlado:** A IA aprende com o histórico apenas quando autorizado pelo cliente.
- **Transparência:** Toda ação de IA é registrada, auditável e reversível (quando aplicável).

### 8.3 Reserva para IA Futura

- Novos modelos (LLMs maiores, modelos especializados).
- Diferentes provedores.
- Modelos locais (on-premise para Enterprise).
- IA multimodal (texto, imagem, voz, vídeo).
- Agentes autônomos multi-turno.
- Aprendizado por reforço a partir de feedback.

### 8.4 Inteligência Preditiva

- Previsão de vendas, estoque, caixa, inadimplência, demanda.
- Modelos atualizados continuamente com novos dados.
- Nível de confiança em cada previsão.
- Feedback loop: resultados reais alimentam o modelo.

### 8.5 Inteligência Prescritiva

- Sugestões de ação com justificativa e nível de confiança.
- Impacto esperado e alternativa.
- Execução após aprovação humana (ou automática dentro de regras pré-aprovadas).

---

## 9. White Label (ADR-006)

### 9.1 Preparação

- Branding (logo, cores, nome, domínio) configurável por tenant ou parceiro.
- Templates de e-mail e documentos com marca personalizada.
- Planos e preços customizados por parceiro.
- Isolamento de dados do parceiro.
- Dashboard do parceiro.

### 9.2 Implementação

- Camada de apresentação lê branding do tenant/parceiro.
- Domínios customizados (CNAME ou subdomínio).
- Certificados SSL automáticos.
- Configuração via Master Portal.

---

## 10. Master Portal (ADR-007)

### 10.1 Visão

Painel exclusivo da equipe da plataforma, separado da aplicação do cliente, para administrar todos os aspectos da plataforma.

### 10.2 Arquitetura

- Aplicação separada (mesmo código-base, feature flag de Master).
- Acesso restrito (MFA obrigatório, IPs permitidos).
- Dados de todos os tenants (visão agregada).
- Não acessa dados de negócio do cliente — apenas metadados de gestão.

### 10.3 Funcionalidades

- Gestão de clientes, planos, consumo, custos
- Saúde da plataforma (uptime, latência, erros)
- Feature flags globais e por cliente
- Licenças e módulos
- Integrações e status
- Marketplace
- Uso de IA (tokens, custo)

---

## 11. Marketplace (ADR-008)

### 11.1 Visão

Ecossistema de plugins e extensões desenvolvidos por terceiros, distribuídos via marketplace.

### 11.2 Tipos de Extensão

- **Plugins de funcionalidade:** Campos extras, fluxos, relatórios
- **Integrações:** Conectores com sistemas verticais
- **Modelos de IA:** Agentes especializados por setor
- **Templates:** Configurações prontas por nicho

### 11.3 Arquitetura

- Plugins executam em sandbox isolado.
- APIs públicas para desenvolvimento.
- Review e aprovação antes da publicação.
- Revenue share configurável.

---

## 12. ADRs — Architecture Decision Records

### ADR-001: Multi-tenancy por Tenant ID

| Campo             | Valor                                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| **Data**          | 2026-08-01                                                                 |
| **Problema**      | Isolar dados de múltiplos clientes sem custo proibitivo                    |
| **Alternativas**  | Banco compartilhado (Tenant ID), Schema por tenant, Instância dedicada     |
| **Decisão**       | Banco compartilhado com isolamento lógico por Tenant ID                    |
| **Motivos**       | Menor custo, simplicidade operacional, adequado para SMB (foco atual)      |
| **Consequências** | Isolamento lógico apenas; risco de noisy neighbor; preparado para migração |
| **Aprovador**     | Architecture Council                                                       |

### ADR-002: API First com Versionamento

| Campo             | Valor                                                    |
| ----------------- | -------------------------------------------------------- |
| **Data**          | 2026-08-01                                               |
| **Problema**      | Desacoplar UI de regras de negócio; permitir integrações |
| **Alternativas**  | UI acoplada, API como afterthought, GraphQL              |
| **Decisão**       | API REST versionada (OpenAPI), UI como cliente           |
| **Motivos**       | Padrão de mercado, simplicidade, ampla adoção            |
| **Consequências** | Overhead de versionamento; flexibilidade total           |
| **Aprovador**     | Architecture Council                                     |

### ADR-003: IA como Camada Nativa com Provedor Intercambiável

| Campo             | Valor                                                             |
| ----------------- | ----------------------------------------------------------------- |
| **Data**          | 2026-08-01                                                        |
| **Problema**      | IA não pode ser acoplada a um único provedor; precisa evoluir     |
| **Alternativas**  | Provedor único, múltiplos provedores com abstração, IA on-premise |
| **Decisão**       | Camada de abstração com provedor intercambiável; RAG nativo       |
| **Motivos**       | Flexibilidade, preparação para futuro, negociação de custo        |
| **Consequências** | Complexidade de abstração; liberdade de evolução                  |
| **Aprovador**     | Architecture Council                                              |

### ADR-004: Modularidade com Feature Flags

| Campo             | Valor                                                           |
| ----------------- | --------------------------------------------------------------- |
| **Data**          | 2026-08-01                                                      |
| **Problema**      | Diferentes clientes precisam de diferentes funcionalidades      |
| **Alternativas**  | Monolito, microserviços desde o início, módulos com flags       |
| **Decisão**       | Arquitetura modular orientada a domínio com feature flags       |
| **Motivos**       | Simplicidade operacional, flexibilidade, evolução gradual       |
| **Consequências** | Monolito modular; pode evoluir para microserviços se necessário |
| **Aprovador**     | Architecture Council                                            |

### ADR-005: Logs de Auditoria Imutáveis

| Campo             | Valor                                                             |
| ----------------- | ----------------------------------------------------------------- |
| **Data**          | 2026-08-01                                                        |
| **Problema**      | Auditoria precisa ser confiável e inviolável                      |
| **Alternativas**  | Logs no banco, logs em arquivo, logs em storage append-only       |
| **Decisão**       | Logs em storage append-only, separado, sem permissão de alteração |
| **Motivos**       | Conformidade, segurança, confiança                                |
| **Consequências** | Maior custo de storage; garantia de integridade                   |
| **Aprovador**     | Architecture Council                                              |

### ADR-006: White Label por Configuração

| Campo             | Valor                                                         |
| ----------------- | ------------------------------------------------------------- |
| **Data**          | 2026-08-01                                                    |
| **Problema**      | Parceiros precisam revender a plataforma sob sua marca        |
| **Alternativas**  | Instância separada por parceiro, white label por configuração |
| **Decisão**       | White label por configuração (branding, domínio, templates)   |
| **Motivos**       | Menor custo, escalabilidade, simplicidade                     |
| **Consequências** | Compartilhamento de instância; isolamento por tenant          |
| **Aprovador**     | Architecture Council                                          |

### ADR-007: Master Portal como Aplicação Separada

| Campo             | Valor                                                             |
| ----------------- | ----------------------------------------------------------------- |
| **Data**          | 2026-08-01                                                        |
| **Problema**      | Gestão da plataforma precisa ser separada da aplicação do cliente |
| **Alternativas**  | Painel dentro da app, aplicação totalmente separada               |
| **Decisão**       | Mesmo código-base com feature flag de Master; acesso restrito     |
| **Motivos**       | Reuso de código, separação lógica de acesso                       |
| **Consequências** | Risco de acesso indevido mitigado por MFA + IP allowlist          |
| **Aprovador**     | Architecture Council                                              |

### ADR-008: Marketplace com Sandbox de Plugins

| Campo             | Valor                                                              |
| ----------------- | ------------------------------------------------------------------ |
| **Data**          | 2026-08-01                                                         |
| **Problema**      | Permitir extensões de terceiros sem comprometer segurança          |
| **Alternativas**  | Sem marketplace, marketplace sem sandbox, marketplace com sandbox  |
| **Decisão**       | Marketplace com sandbox isolado, APIs públicas, review obrigatório |
| **Motivos**       | Segurança, ecossistema, revenue share                              |
| **Consequências** | Complexidade de sandbox; latência de plugins                       |
| **Aprovador**     | Architecture Council                                               |

### ADR-009: Observabilidade em Todas as Camadas

| Campo             | Valor                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| **Data**          | 2026-08-01                                                                     |
| **Problema**      | Não saber o que acontece impede diagnóstico e melhoria                         |
| **Alternativas**  | Logs básicos, observabilidade completa, APM pago                               |
| **Decisão**       | Observabilidade em todas as camadas (performance, uso, erros, latência, saúde) |
| **Motivos**       | Diagnóstico proativo, decisões baseadas em dados                               |
| **Consequências** | Custo de infraestrutura de observabilidade; valor compensa                     |
| **Aprovador**     | Architecture Council                                                           |

### ADR-010: Conformidade LGPD como Padrão

| Campo             | Valor                                                         |
| ----------------- | ------------------------------------------------------------- |
| **Data**          | 2026-08-01                                                    |
| **Problema**      | Dados pessoais precisam de proteção legal                     |
| **Alternativas**  | Conformidade parcial, conformidade total desde o início       |
| **Decisão**       | Conformidade total LGPD desde o início                        |
| **Motivos**       | Obrigação legal, confiança do cliente, diferenciação          |
| **Consequências** | Overhead de classificação e proteção de dados; não negociável |
| **Aprovador**     | Architecture Council                                          |

---

### ADR-011: Reclassificação de Estruturas do Indústria para Shared Platform Services

| Campo             | Valor                                                                                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data**          | 2026-08-06                                                                                                                                                                                                                                                                                             |
| **Problema**      | Estruturas com potencial de reuso foram concebidas como específicas do módulo Indústria                                                                                                                                                                                                                |
| **Alternativas**  | Manter como específicas do Indústria; reclassificar como Shared Platform Services                                                                                                                                                                                                                      |
| **Decisão**       | Reclassificar `ind_currencies`→`currencies`, `ind_exchange_rates`→`exchange_rates`, `ind_imports`→`import_processes`, `ind_import_costs`→`import_costs`, `ind_quality_inspections`→`quality_inspections`, `ind_quality_parameters`→`quality_parameters`, `ind_production_lines`→`production_resources` |
| **Motivos**       | Princípio da Neutralidade dos Módulos; potencial de reuso por múltiplos domínios                                                                                                                                                                                                                       |
| **Consequências** | Estruturas centralizadas; campo `modulo_origem` para contexto; maior flexibilidade                                                                                                                                                                                                                     |
| **Aprovador**     | Architecture Council                                                                                                                                                                                                                                                                                   |

### ADR-012: Shared Platform Services como Camada Arquitetural Formal

| Campo             | Valor                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Data**          | 2026-08-06                                                                                       |
| **Problema**      | Estruturas compartilhadas não tinham definição formal de propriedade e governança                |
| **Alternativas**  | Estruturas sem dono; estruturas pertencentes a módulos; camada formal de serviços compartilhados |
| **Decisão**       | Criar camada formal de Shared Platform Services com 27 serviços identificados                    |
| **Motivos**       | Clareza de governança; evitar duplicação; facilitar reuso                                        |
| **Consequências** | Nenhum módulo é dono de estruturas compartilhadas; governança centralizada                       |
| **Aprovador**     | Architecture Council                                                                             |

### ADR-013: Official Platform Tree sob Perspectiva de Produto

| Campo             | Valor                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------- |
| **Data**          | 2026-08-06                                                                                    |
| **Problema**      | A organização da plataforma não refletia a perspectiva de produto                             |
| **Alternativas**  | Organização técnica; organização por perspectiva de produto                                   |
| **Decisão**       | Organizar em 5 áreas: Plataforma (Core), Gestão Empresarial, Portais, Ecossistema, Governança |
| **Motivos**       | Clareza para stakeholders; alinhamento produto-arquitetura                                    |
| **Consequências** | Documentação mais acessível; navegação mais intuitiva                                         |
| **Aprovador**     | Architecture Council                                                                          |

### ADR-014: MRP Básico como Rota/Hook Calculado

| Campo             | Valor                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Data**          | 2026-08-06                                                                                            |
| **Problema**      | Necessidade de cálculo de necessidade de compras sem over-engineering no MVP                          |
| **Alternativas**  | Coleção persistente com motor de MRP; rota/hook calculado; solução manual                             |
| **Decisão**       | MRP básico como rota/hook que cruza BOM × demanda × estoque × POs em aberto × importações em trânsito |
| **Motivos**       | Simplicidade arquitetural; Evolução Sustentável; deferir complexidade                                 |
| **Consequências** | Sem persistência desnecessária; cálculo sempre atual; forecasting deferido para V1+                   |
| **Aprovador**     | Architecture Council                                                                                  |

### ADR-015: Rastreabilidade via Relações Operacionais Reais

| Campo             | Valor                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Data**          | 2026-08-06                                                                                       |
| **Problema**      | Garantir que a rastreabilidade/genealogia seja fonte única de verdade                            |
| **Alternativas**  | Tabela pré-computada de genealogia; relações operacionais reais com índice técnico               |
| **Decisão**       | Fonte de verdade nas relações operacionais reais; índices pré-computados apenas para performance |
| **Motivos**       | Single Source of Truth; consistência; auditabilidade                                             |
| **Consequências** | Consulta mais complexa mas sempre consistente; índices regeneráveis                              |
| **Aprovador**     | Architecture Council                                                                             |

### ADR-016: Extensão de Estruturas Existentes para Indústria

| Campo             | Valor                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data**          | 2026-08-06                                                                                                                                                         |
| **Problema**      | Suportar compras internacionais, recebimento de matéria-prima e quarentena sem duplicar estruturas                                                                 |
| **Alternativas**  | Criar estruturas paralelas; estender estruturas existentes                                                                                                         |
| **Decisão**       | Estender `purchase_orders` (multi-moeda), `wms_receipts`/`stock_checkings` (recebimento matéria-prima), `stock_batches` (quarentena via `situacao` + localizações) |
| **Motivos**       | Evolução Sustentável (REAPROVEITAR → ESTENDER); evitar duplicação                                                                                                  |
| **Consequências** | Estruturas mais ricas; menor manutenção; maior consistência                                                                                                        |
| **Aprovador**     | Architecture Council                                                                                                                                               |

### ADR-017: BOM Versionada e Imutável

| Campo             | Valor                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Data**          | 2026-08-06                                                                                                       |
| **Problema**      | Garantir reconstrução exata de como um lote foi produzido                                                        |
| **Alternativas**  | BOM mutável; BOM versionada imutável                                                                             |
| **Decisão**       | BOM é imutável após criação; cada versão é um snapshot; cada Ordem de Produção registra `bom_id` + `bom_version` |
| **Motivos**       | Rastreabilidade; auditabilidade; conformidade                                                                    |
| **Consequências** | Maior armazenamento; garantia de reconstrução exata                                                              |
| **Aprovador**     | Architecture Council                                                                                             |

### ADR-018: Quality Inspection como Processo Decisor de Condição de Lote

| Campo             | Valor                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**          | 2026-08-06                                                                                                                                                                        |
| **Problema**      | Decidir condição de lote (aprovado, reprovado, etc.) e alterar disponibilidade                                                                                                    |
| **Alternativas**  | Quality Inspection como registro apenas; Quality Inspection como processo decisor                                                                                                 |
| **Decisão**       | `quality_inspections` decide condição (Aprovado, Reprovado, Aprovado com restrição, Necessita nova análise) e altera disponibilidade do lote via estruturas centrais de Stock/WMS |
| **Motivos**       | Integração real; Single Source of Truth; automação do fluxo                                                                                                                       |
| **Consequências** | Qualidade altera estado do estoque; fluxo integrado                                                                                                                               |
| **Aprovador**     | Architecture Council                                                                                                                                                              |

### ADR-019: COMEX como Evolução Futura

| Campo             | Valor                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data**          | 2026-08-06                                                                                                                                                                                             |
| **Problema**      | Processos de importação têm potencial de uso além da Indústria                                                                                                                                         |
| **Alternativas**  | Manter importação apenas no Indústria; reclassificar e evoluir para COMEX corporativo                                                                                                                  |
| **Decisão**       | Processos de importação (`import_processes`) são Shared Platform Services utilizáveis por Indústrias, Distribuidores, Trading Companies, CDs; módulo de Comércio Exterior corporativo no horizonte V2+ |
| **Motivos**       | Neutralidade de Módulos; potencial de mercado; escalabilidade                                                                                                                                          |
| **Consequências** | Estruturas centrais preparadas para multi-contexto; COMEX futuro                                                                                                                                       |
| **Aprovador**     | Architecture Council                                                                                                                                                                                   |

### ADR-021: Engenharia & Produtos — Fase 0 do Módulo Indústria

| Campo             | Valor                                                                                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**          | 2026-08-06                                                                                                                                                                                                                                            |
| **Problema**      | Estabelecer a fundação estrutural do Módulo Indústria com Single Source of Truth para definição técnica de itens antes de MRP, PCP, Compras, Produção e Rastreabilidade                                                                               |
| **Alternativas**  | (A) JSON ad-hoc em `products`; (B) Catálogo paralelo de itens industriais; (C) Extensão aditiva de `products` + estruturas versionadas dedicadas                                                                                                      |
| **Decisão**       | (C) Item como entidade canônica central via `products` estendido; especificações, BOM, roteiros, conversões e custos em coleções dedicadas versionadas                                                                                                |
| **Motivos**       | REAPROVEITAR (`products`), ESTENDER (adicionar `item_type`, `is_industrial`), Single Source of Truth, rastreabilidade histórica via versionamento imutável                                                                                            |
| **Consequências** | (1) `products` estendido aditivamente; (2) Specs/BOM/Roteiros são versionados e imutáveis quando ativados; (3) Item ≠ Recurso Produtivo; (4) Especificação ≠ Inspeção; (5) Custo industrial → pricing → preço; (6) Conversões de unidade com vigência |
| **Aprovador**     | Architecture Council                                                                                                                                                                                                                                  |

**Pontos validados:**

1. Engenharia & Produtos como subdomínio do Módulo Indústria
2. Catálogo de Itens via `products` (estendido, não duplicado)
3. Item como entidade canônica central
4. Especificações técnicas configuráveis, versionadas, auditáveis e pesquisáveis
5. Classificação neutra inicial ("Não Classificado")
6. Item separado de Recurso Produtivo (`production_resources`)
7. BOM → Versão → Componentes (imutável quando ativada)
8. Formulação como especialização controlada da BOM (`type = "estrutura" | "formulacao"`)
9. Roteiros de produção versionados desde o MVP
10. Conversões de unidade globais e por Item com vigência
11. Custos industriais: Custo Padrão (snapshot imutável) × Custo Realizado
12. Especificação (Engineering/Item) × Inspeção (Shared Quality Service) separados
13. Rastreabilidade histórica completa sem depender do estado atual dos registros

---

### ADR-020: Arquitetura de Canais Digitais da Plataforma

| Campo             | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**          | 2026-08-06                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Problema**      | A plataforma precisa suportar múltiplos canais digitais (sites, portais, app, WhatsApp, marketplace, APIs) sem acoplar a arquitetura a um canal específico, e a infraestrutura atual (Skip Cloud) impõe restrições temporárias que não devem limitar a arquitetura conceitual de longo prazo                                                                                                                                                                                                       |
| **Alternativas**  | (A) Arquitetura acoplada a VeloraLog como único canal permanente; (B) Arquitetura multi-canais conceitual com implementação temporária em projeto único; (C) Aguardar evolução da infraestrutura antes de definir a arquitetura                                                                                                                                                                                                                                                                    |
| **Decisão**       | (B) Arquitetura conceitual multi-canais (CLIENTES → CANAIS DIGITAIS → Shared Platform Services → Plataforma Inteligente de Gestão Empresarial → Gestão Empresarial → IA → Auditoria). A Plataforma apenas conhece o conceito de Canal Digital, não canais específicos. VeloraLog torna-se o primeiro Canal Digital. Canal Digital é incorporado aos Shared Platform Services. Implementação atual em projeto único no Skip Cloud é uma restrição temporária de infraestrutura, não de arquitetura. |
| **Motivos**       | Estratégia Evolutiva da Plataforma (§4.9): a arquitetura representa a visão de longo prazo e não é limitada pela infraestrutura atual; future-proofing para novos canais sem redesenho; neutralidade e desacoplamento                                                                                                                                                                                                                                                                              |
| **Consequências** | (1) VeloraLog perde features administrativas e torna-se Canal Digital puro; (2) Novos canais conectáveis sem alterar a Plataforma; (3) Limitações do Skip Cloud documentadas como restrições temporárias; (4) Futura separação física de projetos ativável sem redesenho de arquitetura; (5) Canal Digital adicionado aos Shared Platform Services                                                                                                                                                 |
| **Aprovador**     | Architecture Council                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

---

## 14. Resumo das Decisões Arquiteturais

> Resumo executivo das principais decisões arquiteturais tomadas na rodada de atualização de documentação (2026-08-06).

| Decisão                                          | ADR     | Princípio Aplicado                              |
| ------------------------------------------------ | ------- | ----------------------------------------------- |
| Reclassificação de estruturas Indústria → Shared | ADR-011 | Neutralidade dos Módulos                        |
| Shared Platform Services como camada formal      | ADR-012 | Neutralidade dos Módulos                        |
| Official Platform Tree (perspectiva de produto)  | ADR-013 | Simplicidade Arquitetural                       |
| MRP básico como rota/hook calculado              | ADR-014 | Simplicidade Arquitetural, Evolução Sustentável |
| Rastreabilidade via relações operacionais reais  | ADR-015 | Single Source of Truth                          |
| Extensão de estruturas existentes para Indústria | ADR-016 | Evolução Sustentável (ESTENDER)                 |
| BOM versionada e imutável                        | ADR-017 | Single Source of Truth                          |
| Quality Inspection como decisor de lote          | ADR-018 | Single Source of Truth                          |
| COMEX como evolução futura                       | ADR-019 | Neutralidade dos Módulos                        |
| Arquitetura de Canais Digitais da Plataforma     | ADR-020 | Estratégia Evolutiva da Plataforma              |

---

## 15. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** A cada mudança arquitetural ou nova ADR
- **Responsável:** Architecture Council
- **Rastreabilidade:** Cada decisão tem ADR; cada ADR é referenciada no PRD

---

_Esta arquitetura é conceitual e independente de tecnologia. A stack atual é uma implementação destes princípios; mudanças de stack não invalidam este documento._

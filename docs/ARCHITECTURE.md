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

## 13. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** A cada mudança arquitetural ou nova ADR
- **Responsável:** Architecture Council
- **Rastreabilidade:** Cada decisão tem ADR; cada ADR é referenciada no PRD

---

_Esta arquitetura é conceitual e independente de tecnologia. A stack atual é uma implementação destes princípios; mudanças de stack não invalidam este documento._
